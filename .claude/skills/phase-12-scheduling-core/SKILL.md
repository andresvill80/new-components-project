---
name: phase-12-scheduling-core
description: Phase 12 — build the shared scheduling data layer (task and dependency models, stores, working calendar, critical path scheduler) used by the PERT and Gantt charts. No UI components.
disable-model-invocation: true
---

# Phase 12 — Scheduling Core

Load the `extjs` and `component-workflow` skills, then follow the workflow. Everything in this phase lives in `new-components/src/` and must run in both toolkits. There is no visual component; the demo is a verification page.

## Classes (all in `src/schedule/`)
| Class | Purpose |
|---|---|
| `NC.schedule.Task` (extends `Ext.data.TreeModel`) | `name`, `duration` (working days), `start`, `end`, `percentDone`, `constraintType` (`null | 'SNET'`), `constraintDate`, `milestone` (duration 0); calculated `earlyStart`, `earlyFinish`, `lateStart`, `lateFinish`, `totalSlack`, `critical` |
| `NC.schedule.Dependency` | `from`, `to` (task ids), `type` (`'FS'` supported now; field allows `SS`, `FF`, `SF` for later), `lag` (working days, may be negative) |
| `NC.schedule.TaskStore` (TreeStore) / `NC.schedule.DependencyStore` | stores with those models |
| `NC.schedule.Calendar` | working weekdays (default Mon–Fri), holidays; `isWorkingDay`, `addWorkingDays(date, n)`, `workingDaysBetween(a, b)`, `nextWorkingDay` |
| `NC.schedule.Validator` | self-links, unknown ids, duplicate links, cycles (returns the cycle path) |
| `NC.schedule.Scheduler` | `schedule(taskStore, dependencyStore, options)`: topological sort, forward pass, backward pass, slack, critical flags, summary roll-up |
| `NC.schedule.Fixtures` | sample projects with known correct answers |
| `NC.schedule.SelfTest` | runs fixtures through the scheduler and returns pass/fail per assertion |

## Rules
- Dates are day-precision (`Ext.Date.clearTime`); all arithmetic through `Calendar` and `Ext.Date`.
- Summary (parent) tasks: start = min child start, end = max child end, not scheduled directly.
- Forward pass respects `SNET` constraints and project start; backward pass from project finish.
- `critical` = total slack ≤ 0.
- Scheduler is pure: it writes calculated fields to records in one batch (`beginEdit`/`endEdit` or `store.beginUpdate`/`endUpdate`) and returns a result object (`projectStart`, `projectFinish`, `criticalPath` ids, `errors`).
- Cycle → no dates written, error returned with the cycle path.
- Performance target: 2,000 tasks / 3,000 links scheduled in well under a second in a desktop browser; avoid per-record events during calculation.

## Verification page (both apps)
A "Scheduling core" demo page that runs `NC.schedule.SelfTest` and shows a pass/fail table, plus a grid of a fixture project's calculated fields. Fixtures must include: a textbook critical-path example with known answers, parallel paths with equal length, lags (positive and negative), an `SNET` constraint, weekends and a holiday, milestones, a summary task, and a cycle.

## Acceptance
- All self-test assertions pass in both apps with identical results.
- Algorithm and field meanings documented in `docs/scheduling-core.md` for the PERT and Gantt phases.

Extra instructions from the user: $ARGUMENTS
