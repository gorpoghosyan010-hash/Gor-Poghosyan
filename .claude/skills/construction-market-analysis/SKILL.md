---
name: construction-market-analysis
description: Run the full competitor analysis pipeline for GARON Construction — research mid-size Armenian construction firms per segment (residential houses, renovation, public buildings), compare them, and build a differentiation/entry strategy. Use when the user asks to (re)run the market or competitor analysis.
---

# Construction market analysis pipeline

1. In parallel, start three `construction-market-researcher` agents, one per segment:
   `residential` (private houses), `renovation`, `public` (public buildings / state tenders).
   Ask each to save to `docs/business/research-<segment>.md`.
2. When all three finish, run `competitor-comparator` on those files → `docs/business/comparison.md`.
3. Then run `differentiation-strategist` → `docs/business/strategy.md`.
4. Update `docs/business/README.md` with a short Armenian summary (top 5 differentiators,
   recommended positioning, first 3 actions) and links to the files.
5. Report the summary to the user in Armenian.

Optional argument: a city/region or a single segment to limit the run.
