#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GARON Construction - 24-month financial model with Monte Carlo risk simulation.

Python 3 standard library only (no numpy). Inputs (same folder):
  assumptions.json  every input as {value, low, high, unit, source, note}
  risks.json        risk register produced by construction-risk-analyst

What one simulated month does (month 1 = December 2026):
  1. risk events are sampled from risks.json (annual -> monthly probability)
  2. leads -> contracts (Poisson); public tenders: bids -> wins
  3. queued contracts start if the segment is launched (licence!), the season
     allows it, a crew is free and (with --mitigated) cash rules allow it
  4. active contracts progress -> revenue recognised by stage; direct costs grow
     with inflation on fixed-price contracts; staged billing with prepayment,
     payment lag and retention; public contracts freeze a 10% guarantee
  5. lean team: crews are hired when work queues up and released when idle;
     office roles switch on when the load requires them
  6. taxes: turnover tax, switching to VAT + profit tax above the threshold
     (or VAT from month 1 with --tax vat); interest on negative cash
  7. cash balance, profit, break-even and "ran out of cash" are recorded

Usage (run from the repository root):
  python3 docs/business/model/simulate.py                  # full analysis -> results.json
  python3 docs/business/model/simulate.py --single --strategy B --capital 20M --mitigated
  python3 docs/business/model/simulate.py --scenario pessimistic
  python3 docs/business/model/simulate.py --single --no-risks --tax vat --trials 2000

Random numbers come from separate streams per trial (parameters, demand,
contract attributes per segment, risk events). The same trial therefore sees
the same "luck" in every configuration, so comparisons between capital levels,
strategies and mitigations are not blurred by sampling noise.
"""

import argparse
import json
import math
import os
import random
import sys
import time
from concurrent.futures import ProcessPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
SEGS = ("renovation", "pools", "houses", "public")
PRIVATE = ("renovation", "pools", "houses")

# Parameters sampled once per contract (all others are sampled once per trial).
PER_CONTRACT = {"job_size_amd", "contract_size_amd", "duration_months",
                "delay_months", "delay_cost_pct", "payment_lag_months"}

# Direction of each input for the pessimistic / optimistic scenarios.
BETTER_LOW = {
    "ramp_months", "duration_months", "retention_pct", "payment_lag_months",
    "delay_probability_pct", "delay_months", "delay_cost_pct",
    "materials_inflation_pct_per_year", "labour_inflation_pct_per_year",
    "credit_line_rate_pct", "emergency_financing_rate_pct", "turnover_tax_rate_pct",
    "lead_time_months", "one_off_cost_amd", "crew_monthly_cost_amd",
    "idle_crew_cost_share_pct", "crew_hiring_lag_months", "warranty_reserve_pct",
    "guarantee_release_after_completion_months", "bid_cost_amd",
    "tools_equipment_amd", "setup_legal_content_amd",
}
# Not uncertainties but decisions/reporting only: never moved by scenarios or tornado.
NEUTRAL = {"starting_capital_amd", "amd_per_usd"}

DEFAULT_CAPITALS = [5e6, 10e6, 15e6, 20e6, 30e6, 40e6, 60e6, 80e6, 120e6]
NEVER = 99  # "break-even not reached within the horizon"


# ----------------------------------------------------------------------------
# Small numeric helpers
# ----------------------------------------------------------------------------

def tri_inv(u, a, c, b):
    """Inverse CDF of the triangular distribution (low a, mode c, high b)."""
    if b <= a:
        return a
    fc = (c - a) / (b - a)
    if u < fc:
        return a + math.sqrt(u * (b - a) * (c - a))
    return b - math.sqrt((1.0 - u) * (b - a) * (b - c))


def poisson_inv(u, lam):
    """Inverse CDF of the Poisson distribution (monotone in u -> good coupling)."""
    if lam <= 0:
        return 0
    k = 0
    p = math.exp(-lam)
    c = p
    while u > c and k < 500:
        k += 1
        p *= lam / k
        c += p
    return k


def percentile(sorted_vals, q):
    """Linear-interpolated percentile of an already sorted list (q in 0..100)."""
    if not sorted_vals:
        return None
    if len(sorted_vals) == 1:
        return sorted_vals[0]
    pos = (len(sorted_vals) - 1) * q / 100.0
    lo = int(math.floor(pos))
    hi = min(lo + 1, len(sorted_vals) - 1)
    frac = pos - lo
    return sorted_vals[lo] * (1 - frac) + sorted_vals[hi] * frac


def parse_amd(text):
    """'30M' -> 30_000_000; '1.5e7' -> 15_000_000; '20000000' -> 20_000_000."""
    t = str(text).strip().upper().replace("_", "").replace(",", "")
    mult = 1.0
    if t.endswith("M"):
        mult, t = 1e6, t[:-1]
    elif t.endswith("K"):
        mult, t = 1e3, t[:-1]
    return float(t) * mult


# ----------------------------------------------------------------------------
# Model inputs
# ----------------------------------------------------------------------------

class Risk:
    """One risk from risks.json, pre-processed for speed."""
    __slots__ = ("id", "segs", "p", "p_mit", "pa", "pa_mit", "lo", "hi", "type",
                 "factor", "cost", "dlo", "dhi")

    def __init__(self, d, delay_ranges):
        self.id = d["id"]
        self.segs = tuple(d["segments"])
        # annual -> monthly probability: p_m = 1 - (1 - p_a)^(1/12)
        self.p = 1.0 - (1.0 - d["annual_probability"]) ** (1.0 / 12.0)
        self.p_mit = 1.0 - (1.0 - d["mitigated_probability"]) ** (1.0 / 12.0)
        self.pa = float(d["annual_probability"])
        self.pa_mit = float(d["mitigated_probability"])
        self.lo = float(d["impact_amd_low"])
        self.hi = float(d["impact_amd_high"])
        self.type = d["impact_type"]
        self.factor = float(d["mitigated_impact_factor"])
        self.cost = float(d["mitigation_cost_amd"])  # annual
        rng = delay_ranges.get(self.id, [1, 3])
        self.dlo, self.dhi = float(rng[0]), float(rng[1])


class Model:
    """Holds assumptions + risks and knows how to draw parameter sets."""

    def __init__(self, assumptions_path, risks_path):
        with open(assumptions_path, encoding="utf-8") as f:
            self.A = json.load(f)
        if os.path.exists(risks_path):
            with open(risks_path, encoding="utf-8") as f:
                raw = json.load(f)
        else:
            raw = []
        rm = self.A["risk_model"]
        delay_ranges = rm["cash_delay_months"]["value"]
        self.risks = [Risk(r, delay_ranges) for r in raw]
        self.risk_by_id = {r.id: r for r in self.risks}
        self.not_sampled = set(rm["not_sampled"]["value"].keys())
        self.sampled = [r for r in self.risks if r.id not in self.not_sampled]
        self.plan6 = rm["plan_6m_revenue_amd"]["value"]
        self.window = int(rm["event_window_months"]["value"])
        self.cost_cap = float(rm["cost_scale_cap"]["value"])

        # Every numeric input with low/high becomes a parameter (fixed order -> CRN).
        self.params = []  # list of (key, low, value, high)
        self._collect(self.A, ())
        self.spec = {k: (lo, v, hi) for k, lo, v, hi in self.params}

    def _collect(self, node, path):
        if isinstance(node, dict):
            if "value" in node and "low" in node and "high" in node:
                v, lo, hi = node["value"], node["low"], node["high"]
                if all(isinstance(x, (int, float)) and not isinstance(x, bool)
                       for x in (v, lo, hi)):
                    self.params.append((".".join(path), float(lo), float(v), float(hi)))
                return
            for k, sub in node.items():
                if k.startswith("_"):
                    continue
                self._collect(sub, path + (k,))

    @staticmethod
    def leaf(key):
        return key.rsplit(".", 1)[-1]

    def better(self, key):
        """'high', 'low' or None (neutral) - which end of the range is favourable."""
        name = self.leaf(key)
        if name in NEUTRAL:
            return None
        if ".roles." in key or name in BETTER_LOW:
            return "low"
        return "high"

    def draw_params(self, rng):
        """One Monte Carlo parameter set. Per-contract inputs keep their triple."""
        P = {}
        for key, lo, v, hi in self.params:
            u = rng.random()  # always drawn, keeps streams aligned across configs
            if self.leaf(key) in PER_CONTRACT:
                P[key] = (lo, v, hi)
            else:
                P[key] = tri_inv(u, lo, v, hi)
        return P

    def point_params(self, scenario="base"):
        """Deterministic parameter set: base = value; pessimistic/optimistic = bounds."""
        P = {}
        for key, lo, v, hi in self.params:
            x = v
            b = self.better(key)
            if scenario in ("pessimistic", "optimistic") and b is not None:
                good = hi if b == "high" else lo
                bad = lo if b == "high" else hi
                x = good if scenario == "optimistic" else bad
            P[key] = (x, x, x) if self.leaf(key) in PER_CONTRACT else x
        return P


class Config:
    """One model configuration (what is being simulated)."""

    def __init__(self, strategy="C", capital=30e6, tax="turnover", mitig=(),
                 risks_on=True, det=False, scenario="base", overrides=None,
                 keep_paths=False, label="", shifts=None, scales=None):
        self.strategy = strategy
        self.capital = float(capital)
        self.tax = tax
        self.mitig = frozenset(mitig)
        self.risks_on = risks_on
        self.det = det
        self.scenario = scenario
        self.overrides = overrides or {}
        self.keep_paths = keep_paths
        self.label = label
        self.shifts = shifts or {}
        self.scales = scales or {}

    def to_dict(self):
        return dict(strategy=self.strategy, capital=self.capital, tax=self.tax,
                    mitig=sorted(self.mitig), risks_on=self.risks_on, det=self.det,
                    scenario=self.scenario, overrides=self.overrides,
                    keep_paths=self.keep_paths, label=self.label, shifts=self.shifts,
                    scales=self.scales)

    @staticmethod
    def from_dict(d):
        return Config(**d)


class Contract:
    __slots__ = ("seg", "value", "rate", "remaining", "cost_ratio", "pi_sign",
                 "sign", "lag", "delay_cost", "prepay", "ret", "collateral", "bucket",
                 "u_accept")


# Per-trial result fields (tuple order). Kept flat so results pickle cheaply.
FIELDS = (
    "cum12", "cum24", "be", "opbe", "op12", "min_cash", "ruin", "neg", "min_liq",
    "rev12", "rev24", "gp24", "fixed24", "crew_idle24", "mit24", "event24",
    "tax24", "interest24", "switch", "peak_crews", "lost", "signed",
    "rev_renovation", "rev_pools", "rev_houses", "rev_public",
    "gp_renovation", "gp_pools", "gp_houses", "gp_public",
    "n_renovation", "n_pools", "n_houses", "n_public",
    "ev_renovation", "ev_pools", "ev_houses", "ev_public",
    "bids", "licence_month", "cash24", "op24", "runrate24",
)
FI = {name: i for i, name in enumerate(FIELDS)}


# ----------------------------------------------------------------------------
# One simulated trial
# ----------------------------------------------------------------------------

def simulate_trial(model, cfg, trial=0, seed=2026, detail=False):
    """Simulate 24 months once. Returns a FIELDS tuple (and monthly detail if asked)."""
    A = model.A
    det = cfg.det
    M = cfg.mitig

    # --- random streams and parameters ---------------------------------------
    if det:
        P = model.point_params(cfg.scenario)
        r_con = None
    else:
        tag = "%d-%d-" % (seed, trial)
        P = model.draw_params(random.Random(tag + "par"))
        r_dem = random.Random(tag + "dem")
        r_risk = random.Random(tag + "risk")
        r_con = {s: random.Random(tag + "con-" + s) for s in SEGS}
    for k, v in cfg.overrides.items():
        if model.leaf(k) in PER_CONTRACT and not isinstance(v, (tuple, list)):
            v = (v, v, v)
        P[k] = v
    for k, d in cfg.shifts.items():          # additive shift, e.g. +4 margin points
        if isinstance(P[k], tuple):
            P[k] = tuple(x + d for x in P[k])
        else:
            P[k] = P[k] + d
    for k, f in cfg.scales.items():          # multiplicative, e.g. overhead x 0.8
        if isinstance(P[k], tuple):
            P[k] = tuple(x * f for x in P[k])
        else:
            P[k] = P[k] * f

    def g(key):
        return P[key]

    def sp(s, name):
        return P["segments.%s.%s" % (s, name)]

    def rf(rid):  # mitigated impact factor of a risk (1.0 if risk missing)
        r = model.risk_by_id.get(rid)
        return r.factor if r else 1.0

    H = int(g("general.horizon_months"))
    start_cal = int(g("general.start_calendar_month"))
    strat = A["strategies"][cfg.strategy]["value"]

    # --- licence and segment launch months -----------------------------------
    needs_lic = {s: bool(sp(s, "needs_licence")) for s in SEGS}
    needs_lic["pools"] = bool(g("licence.pools_require_licence"))
    lic_applied = any(needs_lic[s] for s in strat)
    app_m = int(g("licence.application_month"))
    lead = g("licence.lead_time_months")
    if "R18" in M:  # lawyer + engineer from week 1: excess over the minimum shrinks
        lo_l = model.spec["licence.lead_time_months"][0]
        lead = lo_l + (lead - lo_l) * rf("R18")
    lic_ready = app_m + int(math.ceil(lead - 1e-9)) if lic_applied else 10 ** 6
    eff = {}
    for s in SEGS:
        if s not in strat:
            eff[s] = 10 ** 6
        else:
            eff[s] = max(int(strat[s]), lic_ready) if needs_lic[s] else int(strat[s])

    # --- seasonality ------------------------------------------------------------
    lead_seas = {s: A["segments"][s]["lead_seasonality"]["value"] for s in SEGS}
    work_seas = {}
    for s in SEGS:
        w = list(A["segments"][s]["work_seasonality"]["value"])
        if "R30" in M:  # winter work planning / early booking halves the seasonal loss
            w = [x if x <= 0 or x >= 1 else 1 - (1 - x) * rf("R30") for x in w]
        work_seas[s] = w
    start_ok = {s: set(A["segments"][s]["start_allowed_months"]["value"]) for s in SEGS}

    # --- inflation: costs rise monthly, price list is re-indexed every review --
    mat_share = g("general.materials_share_of_direct_cost_pct") / 100.0
    infl = (mat_share * g("general.materials_inflation_pct_per_year")
            + (1 - mat_share) * g("general.labour_inflation_pct_per_year")) / 100.0
    lab = g("general.labour_inflation_pct_per_year") / 100.0
    review = max(1, int(g("general.price_review_interval_months")))
    cost_idx = [1.0] + [(1 + infl) ** ((t - 1) / 12.0) for t in range(1, H + 2)]
    price_idx = [1.0] + [cost_idx[1 + ((t - 1) // review) * review] for t in range(1, H + 2)]
    wage_idx = [1.0] + [(1 + lab) ** ((t - 1) / 12.0) for t in range(1, H + 2)]

    # --- demand -----------------------------------------------------------------
    leads, conv, ramp = {}, {}, {}
    for s in PRIVATE:
        L, C = sp(s, "leads_per_month"), sp(s, "conversion_pct") / 100.0
        if "R01" in M:  # marketing/referrals: the downside of the demand range shrinks
            Lv = model.spec["segments.%s.leads_per_month" % s][1]
            Cv = model.spec["segments.%s.conversion_pct" % s][1] / 100.0
            if L < Lv:
                L = Lv - (Lv - L) * rf("R01")
            if C < Cv:
                C = Cv - (Cv - C) * rf("R01")
        leads[s], conv[s] = L, C
    for s in SEGS:
        ramp[s] = max(1.0, sp(s, "ramp_months"))
    bids_rate = sp("public", "bids_per_month")
    win_rate = sp("public", "win_rate_pct") / 100.0
    ntr = sp("public", "no_track_record_factor_pct") / 100.0
    if "R21" in M:  # subcontractor track record + tender analysis
        ntr = 1 - (1 - ntr) * rf("R21")
    track_n = sp("public", "track_record_contracts")
    gpct = sp("public", "performance_guarantee_pct") / 100.0
    collat = sp("public", "guarantee_cash_collateral_pct") / 100.0
    if "R13" in M:  # guarantee line secured by property instead of cash
        collat *= rf("R13")
    grel = max(0, int(round(sp("public", "guarantee_release_after_completion_months"))))
    bid_cost = sp("public", "bid_cost_amd")
    cash_rule = sp("public", "cash_rule_pct_of_lot") / 100.0 if "R12" in M else None

    # --- per-contract distributions (triples) -----------------------------------
    size_tr = {s: sp(s, "job_size_amd") for s in PRIVATE}
    size_tr["public"] = sp("public", "contract_size_amd")
    dur_tr = {s: sp(s, "duration_months") for s in SEGS}
    dm_tr = {s: sp(s, "delay_months") for s in SEGS}
    dc_tr = {s: sp(s, "delay_cost_pct") for s in SEGS}
    lag_tr = {s: sp(s, "payment_lag_months") for s in SEGS}
    if "R12" in M:  # only lots <= 100M, 35% rule, early escalation: shorter excess lag
        lo_, md_, hi_ = lag_tr["public"]
        f = rf("R12")
        lag_tr["public"] = (lo_, lo_ + (md_ - lo_) * f, lo_ + (hi_ - lo_) * f)
    p_delay = {s: sp(s, "delay_probability_pct") / 100.0 for s in SEGS}
    if "R14" in M:  # schedule buffer, weekly re-planning, two suppliers per material
        p_delay = {s: v * rf("R14") for s, v in p_delay.items()}
    margin = {s: sp(s, "gross_margin_pct") / 100.0 for s in SEGS}
    prepay = {s: sp(s, "prepayment_pct") / 100.0 for s in SEGS}
    ret = {s: sp(s, "retention_pct") / 100.0 for s in SEGS}
    max_wait = {s: int(sp(s, "max_wait_months")) for s in SEGS}
    thr_mult = {s: sp(s, "throughput_multiplier") for s in SEGS}

    # --- team -------------------------------------------------------------------
    crew_cost = g("team.crew_monthly_cost_amd")
    thr = g("team.crew_throughput_amd_per_month")
    idle_share = g("team.idle_crew_cost_share_pct") / 100.0
    hire_lag = g("team.crew_hiring_lag_months")
    if "R16" in M:  # experienced foreman who brings a team, piece rate + bonus
        hire_lag = 1 + (hire_lag - 1) * rf("R16")
    hire_lag = max(1, int(round(hire_lag)))
    release_after = int(g("team.crew_release_after_idle_months"))
    max_crews = int(g("team.max_crews"))
    slack = g("team.capacity_slack_pct") / 100.0
    roles = A["team"]["roles"]
    role_keys = list(roles.keys())
    keep = int(g("team.role_keep_months"))
    role_hist = {k: [] for k in role_keys}

    # --- money rules --------------------------------------------------------------
    line = g("general.credit_line_amd") if "R09" in M else 0.0
    line_from = int(g("general.credit_line_from_month"))
    line_rate = g("general.credit_line_rate_pct") / 100.0
    emerg_rate = g("general.emergency_financing_rate_pct") / 100.0
    guard_on = "R09" in M
    floor_months = g("general.cash_floor_months_of_fixed_costs") if guard_on else 0.0
    par_cap = int(g("general.max_parallel_jobs_first_3_months")) if "R10" in M else 0
    warranty_pct = g("general.warranty_reserve_pct") / 100.0

    # --- taxes ----------------------------------------------------------------------
    regime = "vat" if cfg.tax == "vat" else "turnover"
    switch_month = 1 if regime == "vat" else 0
    to_rate = g("tax.turnover_tax_rate_pct") / 100.0
    threshold = g("tax.turnover_threshold_amd_per_year")
    vat = g("tax.vat_rate_pct") / 100.0
    vat_frac = vat / (1 + vat)
    vatable = g("tax.vatable_share_of_direct_cost_pct") / 100.0
    pass_priv = g("tax.vat_pass_through_private_pct") / 100.0
    pass_pub = g("tax.vat_pass_through_public_pct") / 100.0
    pt_rate = g("tax.profit_tax_rate_pct") / 100.0

    # --- mitigation costs (annual / 12, only while a relevant segment is live) ------
    mit_items = [(model.risk_by_id[r].segs, model.risk_by_id[r].cost / 12.0)
                 for r in sorted(M) if r in model.risk_by_id]

    # --- pre-drawn uniforms (fixed count -> identical luck across configs) ----------
    n_ext = H + 70
    if not det:
        U_dem = {s: [0.0] + [r_dem.random() for _ in range(H)] for s in SEGS}
        U_risk = [[(r_risk.random(), r_risk.random(), r_risk.random()) for _ in range(H + 1)]
                  for _ in model.sampled]

    # --- state ----------------------------------------------------------------------
    cash = cfg.capital
    crews = int(g("team.initial_crews"))
    pending = []          # arrival months of hired crews
    queue, active = [], []
    completed = 0
    # Scheduled receipts (base contract amounts, without any VAT surcharge), in buckets:
    #   0 = private contracts priced before becoming a VAT payer (no VAT added to price)
    #   1 = private contracts signed as VAT payer (VAT partly added: vat_pass_through_private)
    #   2 = public contracts (VAT added on top of the net lot: vat_pass_through_public)
    rec = [[0.0] * n_ext for _ in range(3)]
    pass_of = (0.0, pass_priv, pass_pub)
    acc_accept = 0.0
    cash_adj = [0.0] * n_ext   # guarantee releases
    margin_pp = {s: [0.0] * n_ext for s in SEGS}
    dmult = {s: [1.0] * n_ext for s in SEGS}
    rev_hist = {s: [0.0] * (H + 2) for s in SEGS}
    acc = {s: 0.0 for s in SEGS}
    last_trig = {}
    year_rec = 0.0
    cur_year = None
    switch_next = False
    vat_credit = 0.0
    pt_bucket, loss_cf = 0.0, 0.0
    idle_streak = 0
    prev_fixed = 0.0
    cum = 0.0
    profits = []
    cum_path, cash_path = [], []
    min_cash, min_liq = float("inf"), float("inf")
    ruin = neg = 0
    be = NEVER
    tot = dict(rev=0.0, gp=0.0, fixed=0.0, idle=0.0, mit=0.0, ev=0.0, tax=0.0, intr=0.0)
    rev12 = cum12 = 0.0
    seg_rev = {s: 0.0 for s in SEGS}
    seg_gp = {s: 0.0 for s in SEGS}
    seg_n = {s: 0 for s in SEGS}
    seg_ev = {s: 0.0 for s in SEGS}
    lost = 0
    peak_crews = crews
    bids_made = 0.0
    monthly = [] if detail else None

    def make_contract(s, t, value=None):
        """New signed contract with per-contract random attributes."""
        c = Contract()
        c.seg = s
        if det:
            lo, md, hi = size_tr[s]
            size = value if value is not None else md * price_idx[t]
            dur = max(1.0, dur_tr[s][1])
            extra = p_delay[s] * dm_tr[s][1]           # expected delay
            c.delay_cost = p_delay[s] * dc_tr[s][1] / 100.0
            lag = lag_tr[s][1]
            c.u_accept = 0.5
        else:
            rc = r_con[s]
            u = [rc.random() for _ in range(7)]
            c.u_accept = u[6]
            size = value if value is not None else tri_inv(u[0], *size_tr[s]) * price_idx[t]
            dur = max(1.0, tri_inv(u[1], *dur_tr[s]))
            delayed = u[2] < p_delay[s]
            extra = tri_inv(u[3], *dm_tr[s]) if delayed else 0.0
            c.delay_cost = tri_inv(u[4], *dc_tr[s]) / 100.0 if delayed else 0.0
            lag = tri_inv(u[5], *lag_tr[s])
        c.value = size
        c.rate = size / (dur + extra)          # planned work value per month
        c.remaining = size
        c.cost_ratio = 1.0 - margin[s]
        c.pi_sign = price_idx[t]
        c.sign = t
        c.lag = max(0, int(round(lag)))
        c.prepay = prepay[s]
        c.ret = ret[s]
        c.collateral = 0.0
        c.bucket = 2 if s == "public" else (1 if regime == "vat" else 0)
        return c

    def load_of(c, ci):
        return c.rate * work_seas[c.seg][ci] / (thr * thr_mult[c.seg])

    for t in range(1, H + 1):
        ci = (start_cal - 1 + t - 1) % 12          # calendar month index 0 = January
        cal = ci + 1
        year = (start_cal - 1 + t - 1) // 12
        if year != cur_year:
            cur_year, year_rec = year, 0.0
        launched = {s: t >= eff[s] for s in SEGS}

        # crews hired earlier arrive now
        arrivals = pending.count(t)
        if arrivals:
            crews += arrivals
            pending = [a for a in pending if a != t]
        line_avail = line if (line > 0 and t >= line_from) else 0.0
        liquidity = cash + line_avail
        floor = floor_months * prev_fixed

        # ---- 1. risk events ---------------------------------------------------------
        event_cost = 0.0
        if cfg.risks_on:
            for idx, r in enumerate(model.sampled):
                aff = [s for s in r.segs if launched[s]]
                if not aff:
                    continue
                mit = r.id in M
                pm = r.p_mit if mit else r.p
                if det:
                    # expected-value event: annual probability spread over 12 months
                    w = (r.pa_mit if mit else r.pa) / 12.0
                    u_imp = u_dur = 0.5
                else:
                    if last_trig.get(r.id, -999) > t - 12:
                        continue                # at most once per 12 months
                    u_occ, u_imp, u_dur = U_risk[idx][t]
                    if u_occ >= pm:
                        continue
                    w = 1.0
                    last_trig[r.id] = t
                mid = (r.lo + r.hi) / 2.0
                imp = mid if det else tri_inv(u_imp, r.lo, mid, r.hi)
                if mit:
                    imp *= r.factor
                # Impacts in risks.json are sized for the planned 6-month revenue of all the
                # risk's segments (risks.md section 0; public only when the strategy pursues
                # it). Scaling by actual activity keeps the hit proportional to the size of
                # the business, so a renovation-only firm is not hit like a three-segment one.
                plan = sum(model.plan6[s] for s in r.segs if s != "public" or "public" in strat)
                if r.type in ("cost", "cash_delay_months"):
                    trail = {s: sum(rev_hist[s][max(1, t - 6):t]) for s in aff}
                    tsum = sum(trail.values())
                    scale = min(model.cost_cap, tsum / plan) if plan > 0 else 0.0
                    amt = imp * scale * w
                    if amt <= 0:
                        continue
                    if r.type == "cost":
                        event_cost += amt
                        for s in aff:
                            seg_ev[s] += amt * (trail[s] / tsum if tsum > 0 else 1.0 / len(aff))
                    else:
                        # this month's receipts are paid D months later
                        D = max(1, int(round(tri_inv(u_dur, r.dlo, (r.dlo + r.dhi) / 2.0, r.dhi))))
                        avail = rec[0][t] + rec[1][t] + rec[2][t]
                        amt = min(amt, avail)
                        if amt > 0:
                            for b in range(3):
                                moved = amt * rec[b][t] / avail
                                rec[b][t] -= moved
                                rec[b][t + D] += moved
                elif r.type == "revenue":
                    f = min(1.0, imp / plan) * w if plan > 0 else 0.0
                    for tau in range(t, t + model.window):
                        for s in aff:
                            dmult[s][tau] *= (1.0 - f)
                elif r.type == "margin_pct":
                    for tau in range(t, t + model.window):
                        for s in aff:
                            margin_pp[s][tau] += imp * w

        # ---- 2. demand: leads -> contracts; tenders -> wins ----------------------
        bid_costs = 0.0
        for s in PRIVATE:
            if not launched[s]:
                continue
            rmp = min(1.0, (t - eff[s] + 1) / ramp[s])
            mean = leads[s] * rmp * lead_seas[s][ci] * dmult[s][t] * conv[s]
            if det:
                acc[s] += mean
                n = int(acc[s] + 1e-9)
                acc[s] -= n
            else:
                n = poisson_inv(U_dem[s][t], mean)
            for _ in range(n):
                queue.append(make_contract(s, t))
            seg_n[s] += n
        if launched["public"]:
            rmp = min(1.0, (t - eff["public"] + 1) / ramp["public"])
            nb_mean = bids_rate * rmp * lead_seas["public"][ci]
            w_eff = win_rate * (1.0 if completed >= track_n else ntr) * dmult["public"][t]
            if det:
                lot = size_tr["public"][1] * price_idx[t]
                if cash_rule is None or liquidity >= cash_rule * lot:
                    bid_costs += nb_mean * bid_cost
                    bids_made += nb_mean
                    acc["public"] += nb_mean * w_eff
                    n = int(acc["public"] + 1e-9)
                    acc["public"] -= n
                    for _ in range(n):
                        queue.append(make_contract("public", t, lot))
                    seg_n["public"] += n
            else:
                nb = poisson_inv(U_dem["public"][t], nb_mean)
                rc = r_con["public"]
                for _ in range(nb):
                    ul, uw = rc.random(), rc.random()
                    lot = tri_inv(ul, *size_tr["public"]) * price_idx[t]
                    if cash_rule is not None and liquidity < cash_rule * lot:
                        continue                # 35% rule: do not bid
                    bid_costs += bid_cost
                    bids_made += 1
                    if uw < w_eff:
                        queue.append(make_contract("public", t, lot))
                        seg_n["public"] += 1

        # ---- 3. start queued contracts --------------------------------------------
        load = sum(load_of(c, ci) for c in active)
        cap_limit = crews * (1 + slack)
        blocked_load = 0.0
        guarantee_out = 0.0
        still = []
        for c in queue:
            s = c.seg
            ok = launched[s] and cal in start_ok[s]
            L = load_of(c, ci)
            need = 0.0
            if ok and s != "public":
                if load > 0 and load + L > cap_limit:
                    ok = False
                    blocked_load += L
                if ok and par_cap and t <= 3 and len(active) >= par_cap:
                    ok = False
                if ok:
                    # working capital this job needs before its first stage payment arrives
                    need = max(0.0, c.rate * c.cost_ratio * max(1, c.lag) - c.prepay * c.value)
                    if guard_on and need > 0 and liquidity - need < floor:
                        # K1 rule: no pre-financed job below the cash floor. The client is
                        # offered a higher prepayment that covers the gap; about half accept.
                        if det:
                            acc_accept += 0.5
                            accept = acc_accept >= 1.0
                            if accept:
                                acc_accept -= 1.0
                        else:
                            accept = c.u_accept < 0.5
                        if accept:
                            c.prepay = min(0.6, c.prepay + need / c.value)
                            need = 0.0
                        else:
                            ok = False
            if ok:
                active.append(c)
                load += L
                liquidity -= need
                rec[c.bucket][t] += c.prepay * c.value
                if s == "public":
                    c.collateral = gpct * c.value * collat
                    guarantee_out += c.collateral
                    liquidity -= c.collateral
            elif t - c.sign >= max_wait[s]:
                lost += 1                       # client went elsewhere
            else:
                still.append(c)
        queue = still

        # hire if work is waiting or crews are overloaded (lean: only when needed)
        demand_load = load + blocked_load
        target = min(max_crews, int(math.ceil(demand_load / (1 + slack) - 1e-9)))
        n_hire = target - crews - len(pending)
        if n_hire > 0 and (not guard_on or liquidity >= floor or crews == 0):
            pending.extend([t + hire_lag] * n_hire)

        # ---- 4. progress, revenue by stage, direct costs, billing -------------------
        load_now = sum(load_of(c, ci) for c in active)
        if crews <= 0:
            cf = 0.0
        elif load_now <= crews * (1 + slack) or load_now == 0:
            cf = 1.0
        else:
            cf = crews * (1 + slack) / load_now   # overload: every job slows down
        rev = {s: 0.0 for s in SEGS}
        dcost = {s: 0.0 for s in SEGS}
        used_load = 0.0
        warranty = 0.0
        still = []
        for c in active:
            s = c.seg
            p = min(c.remaining, c.rate * work_seas[s][ci] * cf)
            if p > 0:
                c.remaining -= p
                rev[s] += p
                used_load += p / (thr * thr_mult[s])
                dcost[s] += p * (c.cost_ratio * cost_idx[t] / c.pi_sign
                                 + margin_pp[s][t] / 100.0 + c.delay_cost)
                # stage billed now, paid after the payment lag; prepayment is offset
                # pro rata and the retention is held until completion
                rec[c.bucket][t + c.lag] += p * (1.0 - c.prepay - c.ret)
            if c.remaining <= 1e-6 * c.value:
                completed += 1
                warranty += warranty_pct * c.value
                if s == "public":
                    rec[2][t + max(1, c.lag)] += c.ret * c.value
                    cash_adj[t + grel] += c.collateral
                else:
                    rec[c.bucket][t + 1] += c.ret * c.value
            else:
                still.append(c)
        active = still
        for s in SEGS:
            rev_hist[s][t] = rev[s]
        rev_t = sum(rev.values())
        dc_t = sum(dcost.values())

        # idle crews: wages of working crews are inside direct costs (margin)
        crew_cost_t = crew_cost * wage_idx[t]
        idle_cost = max(0.0, crews - used_load) * crew_cost_t * idle_share
        if crews > 1 and blocked_load == 0 and load_now <= crews - 1:
            idle_streak += 1
        else:
            idle_streak = 0
        if idle_streak >= release_after:
            crews -= 1
            idle_streak = 0
        peak_crews = max(peak_crews, crews)

        # ---- 5. fixed costs: roles switch on with load, stay `keep` months -------
        n_active = len(active)
        fixed = 0.0
        for k in role_keys:
            tr = roles[k]["trigger"]
            typ = tr["type"]
            if typ == "from_month":
                req = 1 if t >= tr["month"] else 0
            elif typ == "segments_launched":
                req = 1 if any(launched[s] for s in tr["segments"]) else 0
            elif typ == "active_contracts":
                req = sum(1 for th in tr["thresholds"] if n_active >= th)
            elif typ == "segments_or_active":
                req = 1 if (any(launched[s] for s in tr["segments"])
                            or n_active >= tr["active_contracts"]) else 0
            elif typ == "licence_applied":
                req = 1 if (lic_applied and t >= app_m) else 0
            elif typ == "crews_or_active":
                req = 1 if (crews >= tr["crews"] or n_active >= tr["active_contracts"]) else 0
            elif typ == "active_in_segments":
                req = 1 if any(c.seg in tr["segments"] for c in active) else 0
            else:
                req = 0
            h = role_hist[k]
            h.append(req)
            level = max(h[-(keep + 1):])
            fixed += level * P["team.roles.%s" % k] * wage_idx[t]
        one_off = 0.0
        if t == 1:
            one_off += g("one_off.tools_equipment_amd") + g("one_off.setup_legal_content_amd")
        if lic_applied and t == app_m:
            one_off += g("licence.one_off_cost_amd")
        mit_cost = sum(c12 for segs, c12 in mit_items if any(launched[s] for s in segs))

        # ---- 6. taxes ----------------------------------------------------------------
        receipts = rec[0][t] + rec[1][t] + rec[2][t]
        year_rec += receipts
        turnover_tax = vat_paid = profit_tax = 0.0
        if regime == "turnover":
            turnover_tax = to_rate * receipts
            if year_rec > threshold and not switch_next:
                switch_next = True               # VAT payer from next month
        else:
            # Client pays base * (1 + vat * pass); output VAT is vat/(1+vat) of that, so the
            # net VAT cost of a receipt is base * vat * (1 - pass) / (1 + vat).
            out_vat = vat_frac * sum((1 - pass_of[b]) * rec[b][t] for b in range(3))
            in_vat = vat_frac * vatable * dc_t
            net = out_vat - in_vat - vat_credit
            if net < 0:
                vat_credit, vat_paid = -net, 0.0
            else:
                vat_credit, vat_paid = 0.0, net

        # interest on negative cash (credit line first, then emergency money)
        interest = 0.0
        if cash < 0:
            owed = -cash
            on_line = min(owed, line_avail)
            interest = on_line * line_rate / 12.0 + (owed - on_line) * emerg_rate / 12.0

        pre_tax = (rev_t - dc_t - idle_cost - fixed - mit_cost - event_cost - bid_costs
                   - one_off - interest - warranty - turnover_tax - vat_paid)
        if regime == "vat":
            pt_bucket += pre_tax
        if t % 12 == 0 or t == H:                # annual profit tax (VAT regime months)
            taxable = pt_bucket - loss_cf
            if taxable > 0:
                profit_tax, loss_cf = pt_rate * taxable, 0.0
            else:
                loss_cf = -taxable
            pt_bucket = 0.0
        profit = pre_tax - profit_tax

        # ---- 7. cash ------------------------------------------------------------------
        cash += (receipts + cash_adj[t] - dc_t - idle_cost - fixed - mit_cost - event_cost
                 - bid_costs - one_off - turnover_tax - vat_paid - profit_tax - interest
                 - warranty - guarantee_out)
        liq_end = cash + line_avail
        if liq_end < 0 and not ruin:
            ruin = t
        if cash < 0 and not neg:
            neg = t
        min_cash = min(min_cash, cash)
        min_liq = min(min_liq, liq_end)
        if switch_next and regime == "turnover":
            regime, switch_month = "vat", t + 1

        cum += profit
        profits.append(profit)
        if be == NEVER and cum >= 0:
            be = t
        cum_path.append(cum)
        cash_path.append(cash)
        prev_fixed = fixed + idle_cost
        tot["rev"] += rev_t
        tot["gp"] += rev_t - dc_t
        tot["fixed"] += fixed
        tot["idle"] += idle_cost
        tot["mit"] += mit_cost
        tot["ev"] += event_cost
        tot["tax"] += turnover_tax + vat_paid + profit_tax
        tot["intr"] += interest
        for s in SEGS:
            seg_rev[s] += rev[s]
            seg_gp[s] += rev[s] - dcost[s]
        if t == 12:
            rev12, cum12 = tot["rev"], cum
        if detail:
            monthly.append(dict(
                month=t, calendar_month=cal, revenue=rev_t, gross_profit=rev_t - dc_t,
                fixed=fixed, idle_crews=idle_cost, mitigation=mit_cost, risk_costs=event_cost,
                taxes=turnover_tax + vat_paid + profit_tax, interest=interest, profit=profit,
                cum_profit=cum, cash=cash, receipts=receipts, crews=crews,
                active=n_active, queued=len(queue), regime=regime,
                signed={s: seg_n[s] for s in SEGS}))

    if H < 12:
        rev12, cum12 = tot["rev"], cum
    opbe = NEVER
    for i in range(2, len(profits)):
        if profits[i] + profits[i - 1] + profits[i - 2] > 0:
            opbe = i + 1
            break
    op12 = 1.0 if len(profits) >= 12 and sum(profits[9:12]) > 0 else 0.0
    runrate = sum(profits[-6:]) / min(6, len(profits))   # avg monthly profit, last 6 months
    op24 = 1.0 if runrate > 0 else 0.0
    row = (
        cum12, cum, be, opbe, op12, min_cash, ruin, neg, min_liq,
        rev12, tot["rev"], tot["gp"], tot["fixed"], tot["idle"], tot["mit"], tot["ev"],
        tot["tax"], tot["intr"], switch_month, peak_crews, lost, sum(seg_n.values()),
        seg_rev["renovation"], seg_rev["pools"], seg_rev["houses"], seg_rev["public"],
        seg_gp["renovation"], seg_gp["pools"], seg_gp["houses"], seg_gp["public"],
        seg_n["renovation"], seg_n["pools"], seg_n["houses"], seg_n["public"],
        seg_ev["renovation"], seg_ev["pools"], seg_ev["houses"], seg_ev["public"],
        bids_made, (lic_ready if lic_applied else 0), cash, op24, runrate,
    )
    if detail:
        return row, monthly
    if cfg.keep_paths:
        return row, (cum_path, cash_path)
    return row


# ----------------------------------------------------------------------------
# Parallel Monte Carlo
# ----------------------------------------------------------------------------

_WORKER_MODEL = None


def _init_worker(a_path, r_path):
    global _WORKER_MODEL
    _WORKER_MODEL = Model(a_path, r_path)


def _run_chunk(args):
    cfg_dict, start, end, seed = args
    cfg = Config.from_dict(cfg_dict)
    out = []
    for i in range(start, end):
        out.append(simulate_trial(_WORKER_MODEL, cfg, i, seed))
    return cfg_dict["label"], start, out


def run_many(model, a_path, r_path, configs, trials, seed, workers):
    """Run several MC configurations in parallel. Returns {label: [rows in trial order]}."""
    tasks = []
    for cfg, n in configs:
        n = n or trials
        chunk = max(250, n // (workers * 2) + 1)
        for s in range(0, n, chunk):
            tasks.append((cfg.to_dict(), s, min(n, s + chunk), seed))
    results = {cfg.label: [] for cfg, _ in configs}
    if workers <= 1:
        global _WORKER_MODEL
        _WORKER_MODEL = model
        parts = [_run_chunk(t) for t in tasks]
    else:
        with ProcessPoolExecutor(max_workers=workers, initializer=_init_worker,
                                 initargs=(a_path, r_path)) as ex:
            parts = list(ex.map(_run_chunk, tasks, chunksize=1))
    parts.sort(key=lambda x: (x[0], x[1]))
    for label, _, rows in parts:
        results[label].extend(rows)
    return results


# ----------------------------------------------------------------------------
# Summaries
# ----------------------------------------------------------------------------

def summarize(rows, capital, paths=None, hist_bins=20):
    """Turn per-trial rows into probabilities, percentiles and means."""
    if paths is not None:
        pass
    n = len(rows)
    col = lambda name: [r[FI[name]] for r in rows]
    cum24 = sorted(col("cum24"))
    cum12 = col("cum12")
    be = sorted(col("be"))
    opbe = sorted(col("opbe"))
    ruin = col("ruin")
    min_cash = sorted(col("min_cash"))
    need = sorted(max(0.0, capital - m) for m in col("min_cash"))
    mean = lambda xs: sum(xs) / len(xs) if xs else 0.0
    pct = (5, 10, 25, 50, 75, 90, 95)
    out = {
        "trials": n,
        "capital_amd": capital,
        "p_profit_cum_m12": mean([1.0 if x > 0 else 0.0 for x in cum12]),
        "p_profit_cum_m24": mean([1.0 if x > 0 else 0.0 for x in cum24]),
        "p_operating_profit_m12": mean(col("op12")),
        "p_operating_profit_end": mean(col("op24")),
        "monthly_profit_last6": {("P%d" % q): percentile(sorted(col("runrate24")), q)
                                 for q in (10, 50, 90)},
        "p_ruin_24m": mean([1.0 if x > 0 else 0.0 for x in ruin]),
        "p_ruin_12m": mean([1.0 if 0 < x <= 12 else 0.0 for x in ruin]),
        "p_own_cash_negative": mean([1.0 if x > 0 else 0.0 for x in col("neg")]),
        "cum_profit_24": {("P%d" % q): percentile(cum24, q) for q in pct},
        "cum_profit_24_mean": mean(cum24),
        "cum_profit_12": {("P%d" % q): percentile(sorted(cum12), q) for q in (10, 50, 90)},
        "breakeven_month_median": percentile(be, 50),
        "breakeven_month_P25": percentile(be, 25),
        "breakeven_month_P75": percentile(be, 75),
        "p_breakeven_24": mean([1.0 if x <= 24 else 0.0 for x in be]),
        "operating_breakeven_median": percentile(opbe, 50),
        "min_cash": {("P%d" % q): percentile(min_cash, q) for q in (5, 10, 50, 90)},
        "capital_need": {("P%d" % q): percentile(need, q) for q in (50, 75, 90, 95)},
        "revenue_12_mean": mean(col("rev12")),
        "revenue_24": {"mean": mean(col("rev24")), "P10": percentile(sorted(col("rev24")), 10),
                       "P50": percentile(sorted(col("rev24")), 50),
                       "P90": percentile(sorted(col("rev24")), 90)},
        "gross_profit_24_mean": mean(col("gp24")),
        "gross_margin_realised_pct": (100.0 * mean(col("gp24")) / mean(col("rev24"))
                                      if mean(col("rev24")) > 0 else None),
        "fixed_costs_24_mean": mean(col("fixed24")),
        "idle_crew_24_mean": mean(col("crew_idle24")),
        "mitigation_costs_24_mean": mean(col("mit24")),
        "risk_event_costs_24_mean": mean(col("event24")),
        "taxes_24_mean": mean(col("tax24")),
        "interest_24_mean": mean(col("interest24")),
        "p_vat_switch_24": mean([1.0 if 1 < x <= 24 else 0.0 for x in col("switch")]),
        "vat_switch_month_median": percentile(sorted(x for x in col("switch") if x > 1) or [None], 50)
        if any(x > 1 for x in col("switch")) else None,
        "peak_crews_mean": mean(col("peak_crews")),
        "lost_contracts_mean": mean(col("lost")),
        "contracts_signed_mean": mean(col("signed")),
        "bids_mean": mean(col("bids")),
        "cash_end_24": {("P%d" % q): percentile(sorted(col("cash24")), q) for q in (10, 50, 90)},
        "segments": {},
    }
    for s in SEGS:
        gp = sorted(col("gp_" + s))
        out["segments"][s] = {
            "revenue_mean": mean(col("rev_" + s)),
            "gross_profit_mean": mean(gp),
            "gross_profit_P10": percentile(gp, 10),
            "gross_profit_P90": percentile(gp, 90),
            "risk_event_costs_mean": mean(col("ev_" + s)),
            "contracts_mean": mean(col("n_" + s)),
            "p_no_contract": mean([1.0 if x == 0 else 0.0 for x in col("n_" + s)]),
        }
    # histogram of 24-month cumulative profit
    lo, hi = percentile(cum24, 1), percentile(cum24, 99)
    if hi > lo:
        width = (hi - lo) / hist_bins
        counts = [0] * hist_bins
        for x in cum24:
            k = int((x - lo) / width)
            counts[min(hist_bins - 1, max(0, k))] += 1
        out["histogram_cum24"] = {"edges": [lo + i * width for i in range(hist_bins + 1)],
                                  "counts": counts}
    return out


def summarize_paths(paths, H=24):
    """Monthly percentiles of cumulative profit and cash across trials."""
    res = {"month": list(range(1, H + 1)), "cum_profit_P10": [], "cum_profit_P50": [],
           "cum_profit_P90": [], "cash_P10": [], "cash_P50": [], "cash_P90": []}
    for m in range(H):
        cp = sorted(p[0][m] for p in paths)
        cs = sorted(p[1][m] for p in paths)
        for q in (10, 50, 90):
            res["cum_profit_P%d" % q].append(percentile(cp, q))
            res["cash_P%d" % q].append(percentile(cs, q))
    return res


def det_summary(model, cfg):
    """Deterministic run -> compact scenario row + monthly table."""
    row, monthly = simulate_trial(model, cfg, detail=True)
    min_cash = min(m["cash"] for m in monthly)
    out = {
        "revenue_24": row[FI["rev24"]],
        "revenue_12": row[FI["rev12"]],
        "gross_profit_24": row[FI["gp24"]],
        "net_profit_24": row[FI["cum24"]],
        "net_profit_12": row[FI["cum12"]],
        "min_cash": min_cash,
        "capital_need": max(0.0, cfg.capital - min_cash),
        "breakeven_month": row[FI["be"]],
        "operating_breakeven_month": row[FI["opbe"]],
        "ran_out_of_cash_month": row[FI["ruin"]],
        "contracts": {s: row[FI["n_" + s]] for s in SEGS},
        "fixed_costs_24": row[FI["fixed24"]],
        "taxes_24": row[FI["tax24"]],
        "vat_switch_month": row[FI["switch"]],
        "licence_month": row[FI["licence_month"]],
        "monthly": monthly,
    }
    return out


def fmt_m(x):
    return "n/a" if x is None else "%.1fM" % (x / 1e6)


def print_summary(title, s):
    print("\n== %s (%d trials, capital %s) ==" % (title, s["trials"], fmt_m(s["capital_amd"])))
    print("  P(cum profit > 0) m12 / m24: %.0f%% / %.0f%%   P(run out of cash): %.0f%%"
          % (100 * s["p_profit_cum_m12"], 100 * s["p_profit_cum_m24"], 100 * s["p_ruin_24m"]))
    c = s["cum_profit_24"]
    print("  24m cum profit P10 / P50 / P90: %s / %s / %s   break-even median: %s"
          % (fmt_m(c["P10"]), fmt_m(c["P50"]), fmt_m(c["P90"]),
             s["breakeven_month_median"] if s["breakeven_month_median"] != NEVER else ">24"))
    print("  revenue 24m mean %s, realised gross margin %.1f%%, capital need P50/P90 %s / %s"
          % (fmt_m(s["revenue_24"]["mean"]), s["gross_margin_realised_pct"] or 0,
             fmt_m(s["capital_need"]["P50"]), fmt_m(s["capital_need"]["P90"])))


# ----------------------------------------------------------------------------
# Full analysis
# ----------------------------------------------------------------------------

def tornado(model, base_cfg):
    """Deterministic one-at-a-time sensitivity on 24-month cumulative profit."""
    base = simulate_trial(model, base_cfg)[FI["cum24"]]
    rows = []
    for key, lo, v, hi in model.params:
        if lo == hi or model.better(key) is None:
            continue
        res = {}
        for side, x in (("low", lo), ("high", hi)):
            cfg = Config(**{**base_cfg.to_dict(), "overrides": {key: x}})
            r = simulate_trial(model, cfg)
            res[side] = r[FI["cum24"]]
            res[side + "_min_cash"] = r[FI["min_cash"]]
        rows.append({"param": key, "low": lo, "value": v, "high": hi,
                     "profit_at_low": res["low"], "profit_at_high": res["high"],
                     "min_cash_at_low": res["low_min_cash"],
                     "min_cash_at_high": res["high_min_cash"],
                     "swing": abs(res["high"] - res["low"])})
    rows.sort(key=lambda r: -r["swing"])
    return {"base_profit_24": base, "rows": rows}


def full_analysis(args, model, a_path, r_path):
    """Everything outcomes.md needs, in one results.json."""
    A = model.A
    t0 = time.time()
    seed, N, NS, NM = args.seed, args.trials, args.sweep_trials, args.mit_trials
    W = args.workers
    strategy = args.strategy or A["strategies"]["default"]["value"]
    capital = parse_amd(args.capital) if args.capital else A["general"]["starting_capital_amd"]["value"]
    tax = args.tax or A["tax"]["regime"]["value"]
    risks_on = not args.no_risks
    all_ids = [r.id for r in model.risks]
    NONE, ALL = frozenset(), frozenset(all_ids)

    def C(label, strat=strategy, cap=capital, tx=tax, mit=NONE, ron=risks_on, keep=False,
          shifts=None, scales=None):
        return Config(strategy=strat, capital=cap, tax=tx, mitig=mit, risks_on=ron,
                      keep_paths=keep, label=label, shifts=shifts, scales=scales)

    def lap(msg):
        print("  [%.0fs] %s" % (time.time() - t0, msg))

    # ---- 1. value of each mitigation -> recommended package ---------------------------
    mit_cfgs = [(C("mit_none"), NM), (C("mit_all", mit=ALL), NM)]
    for rid in all_ids:
        mit_cfgs.append((C("mit_only|" + rid, mit=frozenset([rid])), NM))
        mit_cfgs.append((C("mit_drop|" + rid, mit=ALL - {rid}), NM))
    print("1/5 mitigation value: %d configurations x %d trials" % (len(mit_cfgs), NM))
    res = run_many(model, a_path, r_path, mit_cfgs, NM, seed, W)
    sm = {cfg.label: summarize(res[cfg.label], cfg.capital) for cfg, _ in mit_cfgs}
    b0, b1 = sm["mit_none"], sm["mit_all"]
    mit_rows, recommended = [], []
    for rid in all_ids:
        r = model.risk_by_id[rid]
        a, d = sm["mit_only|" + rid], sm["mit_drop|" + rid]
        row = {
            "id": rid, "sampled_as_event": rid not in model.not_sampled,
            "annual_cost_amd": r.cost,
            "alone_delta_mean_profit_24": a["cum_profit_24_mean"] - b0["cum_profit_24_mean"],
            "alone_delta_P10_profit_24": a["cum_profit_24"]["P10"] - b0["cum_profit_24"]["P10"],
            "alone_delta_capital_need_P90": a["capital_need"]["P90"] - b0["capital_need"]["P90"],
            "alone_delta_p_ruin": a["p_ruin_24m"] - b0["p_ruin_24m"],
            "in_package_delta_mean_profit_24": b1["cum_profit_24_mean"] - d["cum_profit_24_mean"],
            "in_package_delta_p_ruin": b1["p_ruin_24m"] - d["p_ruin_24m"],
        }
        # Pays for itself = (a) raises expected 24-month profit after its own cost, or
        # (b) protects cash: cuts the bad-case (P90) capital need by more than its own
        # 24-month cost while not lowering expected profit by more than that cost.
        cost24 = 2.0 * r.cost
        row["pays_in_expectation"] = row["alone_delta_mean_profit_24"] > 0
        row["protects_cash"] = (row["alone_delta_capital_need_P90"] < -cost24
                                and row["alone_delta_mean_profit_24"] > -cost24)
        row["pays_for_itself"] = row["pays_in_expectation"] or row["protects_cash"]
        if row["pays_for_itself"]:
            recommended.append(rid)
        mit_rows.append(row)
    REC = frozenset(recommended)
    lap("recommended package: " + ",".join(recommended))
    head_mode = A["headline"]["mitigation"]["value"]
    HEAD = {"all": ALL, "none": NONE}.get(head_mode, REC)
    modes = (("none", NONE), ("recommended", REC), ("all", ALL))
    # Same package but WITHOUT R12 (its "35% liquidity rule" blocks public bids whenever
    # free cash is short) - shows the trade-off of actually bidding in C / D.
    REC_NO35 = REC - {"R12"}

    # ---- 2. main Monte Carlo runs ---------------------------------------------------------
    main_cfgs = [
        (C("headline", mit=HEAD, keep=True), N),
        (C("mitigation_none", keep=True), N),
        (C("mitigation_recommended", mit=REC), N),
        (C("mitigation_all", mit=ALL), N),
        (C("no_risks", ron=False), N),
        (C("tax_vat|none", tx="vat"), N),
        (C("tax_vat|recommended", tx="vat", mit=REC), N),
        (C("tax_turnover|none", tx="turnover"), N),
        (C("tax_turnover|recommended", tx="turnover", mit=REC), N),
    ]
    for st in ("A", "B", "C", "D"):
        for mname, mset in modes:
            main_cfgs.append((C("strategy|%s|%s" % (st, mname), strat=st, mit=mset), N))
    for st in ("C", "D"):
        main_cfgs.append((C("strategy|%s|recommended_no35rule" % st, strat=st, mit=REC_NO35), N))
    print("2/5 main Monte Carlo: %d configurations x %d trials" % (len(main_cfgs), N))
    res = run_many(model, a_path, r_path, main_cfgs, N, seed, W)
    mc = {}
    for cfg, _ in main_cfgs:
        rows = res[cfg.label]
        if cfg.keep_paths:
            paths = [r[1] for r in rows]
            rows = [r[0] for r in rows]
            mc[cfg.label] = summarize(rows, cfg.capital)
            mc[cfg.label]["monthly_paths"] = summarize_paths(paths)
        else:
            mc[cfg.label] = summarize(rows, cfg.capital)
        mc[cfg.label]["config"] = {"strategy": cfg.strategy, "capital": cfg.capital,
                                   "tax": cfg.tax, "risks_on": cfg.risks_on,
                                   "mitigation": sorted(cfg.mitig)}
    print_summary("headline (%s, %s mitigation)" % (strategy, head_mode), mc["headline"])
    print_summary("no mitigation", mc["mitigation_none"])
    lap("main runs done")

    # ---- 3. capital sweep ----------------------------------------------------------------
    caps = [parse_amd(x) for x in args.capitals.split(",")] if args.capitals else DEFAULT_CAPITALS
    sweep_cfgs = []
    sweep_modes = {st: list(modes[:2]) for st in ("A", "B", "C", "D")}
    for st in ("C", "D"):
        sweep_modes[st].append(("recommended_no35rule", REC_NO35))
    for st in ("A", "B", "C", "D"):
        for mname, mset in sweep_modes[st]:
            for cap in caps:
                sweep_cfgs.append((C("sweep|%s|%s|%d" % (st, mname, cap), strat=st, cap=cap,
                                     mit=mset), NS))
    print("3/5 capital sweep: %d configurations x %d trials" % (len(sweep_cfgs), NS))
    res = run_many(model, a_path, r_path, sweep_cfgs, NS, seed, W)
    sweep = []
    for cfg, _ in sweep_cfgs:
        s = summarize(res[cfg.label], cfg.capital)
        _, st, mname, _ = cfg.label.split("|")
        sweep.append({
            "strategy": st, "mitigation": mname, "capital_amd": cfg.capital,
            "p_ruin_24m": s["p_ruin_24m"], "p_ruin_12m": s["p_ruin_12m"],
            "p_own_cash_negative": s["p_own_cash_negative"],
            "p_profit_cum_m12": s["p_profit_cum_m12"], "p_profit_cum_m24": s["p_profit_cum_m24"],
            "p_operating_profit_end": s["p_operating_profit_end"],
            "breakeven_month_median": s["breakeven_month_median"],
            "p_breakeven_24": s["p_breakeven_24"],
            "cum_profit_24_P10": s["cum_profit_24"]["P10"],
            "cum_profit_24_P50": s["cum_profit_24"]["P50"],
            "cum_profit_24_P90": s["cum_profit_24"]["P90"],
            "cum_profit_24_mean": s["cum_profit_24_mean"],
            "revenue_24_mean": s["revenue_24"]["mean"],
            "min_cash_P10": s["min_cash"]["P10"],
            "capital_need_P50": s["capital_need"]["P50"],
            "capital_need_P90": s["capital_need"]["P90"],
            "lost_contracts_mean": s["lost_contracts_mean"],
            "monthly_profit_last6_P50": s["monthly_profit_last6"]["P50"],
        })
    req = {}
    for st in ("A", "B", "C", "D"):
        for mname, _ in sweep_modes[st]:
            rows = sorted((r for r in sweep if r["strategy"] == st and r["mitigation"] == mname),
                          key=lambda r: r["capital_amd"])
            entry = {}
            for thr in (0.10, 0.20, 0.50):
                ok = [r["capital_amd"] for r in rows if r["p_ruin_24m"] <= thr]
                entry["p_ruin_le_%d" % int(thr * 100)] = ok[0] if ok else None
            req["%s|%s" % (st, mname)] = entry
    lap("sweep done")

    # ---- 4. what must be true (margin, overhead, crew model, VAT pricing) -------------------
    margin_keys = ["segments.%s.gross_margin_pct" % sg for sg in SEGS]
    role_keys = ["team.roles.%s" % k for k in A["team"]["roles"]]
    viable = dict(shifts={k: 8 for k in margin_keys},
                  scales={k: 0.8 for k in role_keys})
    wmbt_cfgs = []
    for st in ("B", "C"):
        for up in (4, 8):
            for cap in caps:
                wmbt_cfgs.append((C("wmbt|margin|%s|%d|%d" % (st, up, cap), strat=st, cap=cap,
                                    mit=REC, shifts={k: up for k in margin_keys}), NS))
    for st in ("A", "B", "C"):
        for cap in caps:
            cfg = C("wmbt|viable|%s|8|%d" % (st, cap), strat=st, cap=cap, mit=REC, **viable)
            cfg.overrides = {"team.idle_crew_cost_share_pct": model.spec["team.idle_crew_cost_share_pct"][0]}
            wmbt_cfgs.append((cfg, NS))
    for pp in (0, 100):
        wmbt_cfgs.append((C("wmbt|vatpass|C|%d|%d" % (pp, capital), mit=REC,
                            shifts={"tax.vat_pass_through_private_pct":
                                    pp - model.spec["tax.vat_pass_through_private_pct"][1]}), NS))
    print("4/5 what-must-be-true: %d configurations x %d trials" % (len(wmbt_cfgs), NS))
    res = run_many(model, a_path, r_path, wmbt_cfgs, NS, seed, W)
    wmbt = []
    for cfg, _ in wmbt_cfgs:
        s = summarize(res[cfg.label], cfg.capital)
        _, lever, st, val, _ = cfg.label.split("|")
        wmbt.append({
            "lever": lever, "strategy": st, "capital_amd": cfg.capital,
            "margin_uplift_pp": int(val) if lever in ("margin", "viable") else 0,
            "vat_pass_through_private_pct": int(val) if lever == "vatpass" else None,
            "p_ruin_24m": s["p_ruin_24m"], "p_ruin_12m": s["p_ruin_12m"],
            "p_profit_cum_m12": s["p_profit_cum_m12"], "p_profit_cum_m24": s["p_profit_cum_m24"],
            "p_operating_profit_end": s["p_operating_profit_end"],
            "cum_profit_24_P50": s["cum_profit_24"]["P50"],
            "cum_profit_24_P10": s["cum_profit_24"]["P10"],
            "cum_profit_24_P90": s["cum_profit_24"]["P90"],
            "breakeven_month_median": s["breakeven_month_median"],
            "p_breakeven_24": s["p_breakeven_24"],
            "capital_need_P50": s["capital_need"]["P50"],
            "capital_need_P90": s["capital_need"]["P90"],
            "monthly_profit_last6_P50": s["monthly_profit_last6"]["P50"],
        })
    lap("what-must-be-true done")

    # ---- 5. deterministic scenarios and tornado -------------------------------------------
    print("5/5 scenarios and sensitivity")
    scen = {}
    for mname, mset in modes:
        for sc in ("pessimistic", "base", "optimistic"):
            cfg = Config(strategy=strategy, capital=capital, tax=tax, mitig=mset,
                         risks_on=risks_on, det=True, scenario=sc)
            scen["%s|%s" % (mname, sc)] = det_summary(model, cfg)
    det_strat = {}
    for st in ("A", "B", "C", "D"):
        cfg = Config(strategy=st, capital=capital, tax=tax, mitig=HEAD, risks_on=risks_on, det=True)
        d = det_summary(model, cfg)
        d.pop("monthly")
        det_strat[st] = d
    tcfg = Config(strategy=strategy, capital=capital, tax=tax, mitig=HEAD, risks_on=risks_on,
                  det=True)
    sens = tornado(model, tcfg)
    lap("done")

    return {
        "meta": {
            "generated": time.strftime("%Y-%m-%d %H:%M"), "seed": seed, "trials": N,
            "sweep_trials": NS, "mitigation_trials": NM, "strategy": strategy,
            "capital_amd": capital, "tax_regime": tax, "risks_on": risks_on,
            "headline_mitigation": head_mode, "recommended_mitigations": recommended,
            "risks_sampled": [r.id for r in model.sampled],
            "risks_not_sampled": sorted(model.not_sampled),
            "amd_per_usd": A["general"]["amd_per_usd"]["value"],
            "runtime_seconds": round(time.time() - t0, 1),
            "definitions": {
                "profit": "accrual: revenue recognised by stage minus all costs incl. owner draw, "
                          "taxes, interest, risk events and mitigation costs; cumulative from month 1",
                "ran_out_of_cash": "cash + approved credit line < 0 in any month (the line exists "
                                   "only with mitigation R09); trials continue on emergency money "
                                   "at emergency_financing_rate so the size of the hole is visible",
                "capital_need": "starting capital minus the lowest cash balance = own money that "
                                "would have kept cash >= 0 in that trial",
                "breakeven_month": "first month in which cumulative profit >= 0 (99 = not within 24)",
            },
        },
        "mitigation_value": {"trials": NM, "strategy": strategy, "capital_amd": capital,
                             "none": {"mean_profit_24": b0["cum_profit_24_mean"],
                                      "capital_need_P90": b0["capital_need"]["P90"]},
                             "all": {"mean_profit_24": b1["cum_profit_24_mean"],
                                     "capital_need_P90": b1["capital_need"]["P90"]},
                             "rows": mit_rows},
        "monte_carlo": mc,
        "capital_sweep": sweep,
        "capital_required": req,
        "what_must_be_true": wmbt,
        "what_must_be_true_definition": {
            "margin": "gross margin of every segment + N percentage points (pricing / cost base)",
            "viable": "margin +8 pp AND all office roles x 0.8 AND idle crews paid at the low end "
                      "(piece-rate crews) - with the recommended mitigations",
            "vatpass": "share of VAT added to new private prices after becoming a VAT payer"},
        "scenarios": scen,
        "scenarios_by_strategy_base": det_strat,
        "sensitivity": sens,
    }


# ----------------------------------------------------------------------------
# CLI
# ----------------------------------------------------------------------------

def main(argv=None):
    ap = argparse.ArgumentParser(description="GARON 24-month Monte Carlo model")
    ap.add_argument("--trials", type=int, default=10000, help="Monte Carlo trials (default 10000)")
    ap.add_argument("--seed", type=int, default=2026, help="random seed (default 2026)")
    ap.add_argument("--scenario", choices=("pessimistic", "base", "optimistic"),
                    help="run one deterministic scenario instead of Monte Carlo")
    ap.add_argument("--no-risks", action="store_true", help="switch off risk events")
    ap.add_argument("--mitigated", action="store_true", help="apply all mitigations from risks.json")
    ap.add_argument("--mitigate", default="", help="apply only these mitigations, e.g. R03,R07")
    ap.add_argument("--strategy", choices=("A", "B", "C", "D"),
                    help="A renovation only; B + houses/pools m4; C + public m13; D all from m1")
    ap.add_argument("--capital", help="starting capital, e.g. 30M or 30000000")
    ap.add_argument("--tax", choices=("turnover", "vat"), help="tax regime (confirm with accountant)")
    ap.add_argument("--single", action="store_true", help="one Monte Carlo configuration only")
    ap.add_argument("--out", help="output JSON (full analysis default: model/results.json)")
    ap.add_argument("--sweep-trials", type=int, default=4000, help="trials per capital-sweep point")
    ap.add_argument("--mit-trials", type=int, default=2000, help="trials per mitigation test")
    ap.add_argument("--capitals", help="capital sweep levels, e.g. 5M,10M,20M")
    ap.add_argument("--workers", type=int, default=max(1, min(8, os.cpu_count() or 1)))
    ap.add_argument("--assumptions", default=os.path.join(HERE, "assumptions.json"))
    ap.add_argument("--risks", default=os.path.join(HERE, "risks.json"))
    args = ap.parse_args(argv)

    model = Model(args.assumptions, args.risks)
    A = model.A
    strategy = args.strategy or A["strategies"]["default"]["value"]
    capital = parse_amd(args.capital) if args.capital else A["general"]["starting_capital_amd"]["value"]
    tax = args.tax or A["tax"]["regime"]["value"]
    if args.mitigated:
        mit = frozenset(r.id for r in model.risks)
    elif args.mitigate:
        mit = frozenset(x.strip().upper() for x in args.mitigate.split(",") if x.strip())
    else:
        mit = frozenset()

    if args.scenario:
        cfg = Config(strategy=strategy, capital=capital, tax=tax, mitig=mit,
                     risks_on=not args.no_risks, det=True, scenario=args.scenario)
        d = det_summary(model, cfg)
        print("Scenario %s | strategy %s | capital %s | tax %s | mitigation %s"
              % (args.scenario, strategy, fmt_m(capital), tax, ",".join(sorted(mit)) or "none"))
        print("%3s %10s %10s %10s %10s %10s %6s %4s" % ("m", "revenue", "gross", "profit",
                                                        "cum", "cash", "crews", "act"))
        for m in d["monthly"]:
            print("%3d %10s %10s %10s %10s %10s %6d %4d" % (
                m["month"], fmt_m(m["revenue"]), fmt_m(m["gross_profit"]), fmt_m(m["profit"]),
                fmt_m(m["cum_profit"]), fmt_m(m["cash"]), m["crews"], m["active"]))
        print("24m: revenue %s, gross profit %s, net %s, min cash %s, break-even month %s"
              % (fmt_m(d["revenue_24"]), fmt_m(d["gross_profit_24"]), fmt_m(d["net_profit_24"]),
                 fmt_m(d["min_cash"]), d["breakeven_month"] if d["breakeven_month"] != NEVER else ">24"))
        if args.out:
            with open(args.out, "w", encoding="utf-8") as f:
                json.dump(d, f, ensure_ascii=False, indent=1)
        return 0

    if args.single or args.no_risks or args.mitigated or args.mitigate:
        cfg = Config(strategy=strategy, capital=capital, tax=tax, mitig=mit,
                     risks_on=not args.no_risks, label="single", keep_paths=True)
        t0 = time.time()
        res = run_many(model, args.assumptions, args.risks, [(cfg, args.trials)],
                       args.trials, args.seed, args.workers)["single"]
        rows = [r[0] for r in res]
        s = summarize(rows, capital)
        s["monthly_paths"] = summarize_paths([r[1] for r in res])
        s["config"] = cfg.to_dict()
        print_summary("strategy %s, tax %s, mitigation %s, risks %s"
                      % (strategy, tax, ",".join(sorted(mit)) or "none",
                         "off" if args.no_risks else "on"), s)
        print("  [%.1fs]" % (time.time() - t0))
        if args.out:
            with open(args.out, "w", encoding="utf-8") as f:
                json.dump(s, f, ensure_ascii=False, indent=1)
        return 0

    out = full_analysis(args, model, args.assumptions, args.risks)
    path = args.out or os.path.join(HERE, "results.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print("Saved %s" % path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
