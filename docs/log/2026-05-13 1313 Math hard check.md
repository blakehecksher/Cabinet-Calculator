# 2026-05-13 1313 Math hard check

## TL;DR
- What changed: Stile and rail CL-CL now return `N/A` when there is only one included member, because there is no centerline-to-centerline distance to report.
- Why: The old single-member branch reported an edge-to-center distance as CL-CL when end stiles/rails were unchecked, which could make the result misleading.
- What didn't work: The required `date '+%Y-%m-%d %H%M'` command fails under PowerShell because `date` is an alias for `Get-Date`; used `Get-Date -Format 'yyyy-MM-dd HHmm'` for the same required format.
- Next: Browser-check the static page with representative layouts if visual verification is needed.

---

## Full notes

Checked the existing calculation formulas in `script.js`.

Panel math is:
- stile count = interior stiles plus optional two end stiles
- rail count = interior rails plus optional two end rails
- panel width = `(cabinet width - stile count * stile width) / columns`
- panel height = `(cabinet height - rail count * rail width) / rows`

That reconstructs the full cabinet dimension for each tested end-member combination.

The incorrect part was the single-member CL-CL branch:
- with end stiles unchecked and two columns, there is one interior stile
- with end rails unchecked and two rows, there is one interior rail
- a single member has no CL-CL spacing, so the calculator should report `N/A`

Added `tests/calculations.test.js` to check reconstruction math, CL-CL behavior, dimension parsing, and fraction formatting. Verification command passed:

```bash
node tests/calculations.test.js
```
