# State
_Last updated: 2026-05-13 1313_

## Current focus
Cabinet face-frame calculator math reliability.

## What's working
Panel width and height calculations subtract the included stile/rail member counts and divide the remaining opening space by columns/rows.
The calculator now reports stile/rail CL-CL only when at least two included members exist to measure between.
Node regression tests cover width/height reconstruction, end-stile/end-rail combinations, one-member CL-CL suppression, parsing, and fraction formatting.

## In progress
No active implementation work.

## Known issues
The AGENTS timestamp command `date '+%Y-%m-%d %H%M'` fails in this PowerShell environment because `date` resolves to `Get-Date`.

## Next actions
1. Optionally review the calculator in a browser with representative cabinet layouts.
2. Add a formal spec file if the calculator rules need to be documented beyond the current implementation.

## Active plan
None.

## How to verify
Run `node tests/calculations.test.js`.

## Recent logs
- docs/log/2026-05-13 1313 Math hard check.md — verified and tightened stile/rail CL-CL math.
