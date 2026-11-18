---
name: construction-risk-outcomes
description: Calculate the risks and probable outcomes of GARON Construction's business plan — quantified risk register, then a 24-month financial model with scenarios and Monte Carlo simulation. Use when the user asks about risks, chances of success, profit, break-even, or wants to rerun the model with new numbers.
---

# Risk & outcomes pipeline

Prerequisite: `docs/business/strategy.md` exists (run `/construction-market-analysis` first if not).

1. Run `construction-risk-analyst` → `docs/business/risks.md` and `docs/business/model/risks.json`.
2. Run `business-outcome-modeler` → `docs/business/model/{assumptions.json,simulate.py,results.json}`
   and `docs/business/outcomes.md`. It must keep any assumption marked `"source": "user"`.
3. Update `docs/business/README.md`: add the files and a 5-line summary (chance of profit, chance of
   running out of cash, median profit, break-even month, top 3 risks).
4. Report to the user in Armenian, and list which assumptions are estimates they should replace.

If the user only changed numbers: skip step 1 and just rerun
`python3 docs/business/model/simulate.py` and refresh `outcomes.md`.
