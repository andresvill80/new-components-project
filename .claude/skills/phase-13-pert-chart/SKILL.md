---
name: phase-13-pert-chart
description: Phase 13 — build the PERT Chart (nc-pertchart), a network diagram of tasks and dependencies with critical path highlighting, drawn with Ext.draw, for Classic and Modern.
disable-model-invocation: true
---

# Phase 13 — PERT Chart

Load the `extjs` and `component-workflow` skills, then follow the workflow. Requires Phase 12. Add `"charts"` to `requires` in `new-components/package.json` (then ask for confirmation to run `sencha app refresh` in both apps and check the output to confirm it resolves).

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.pert.Layout` (layering, ordering, coordinates, edge routes) | `src/` | — |
| `NC.pert.PertChart` | `src/` if `Ext.draw.Container` and the gestures used work identically in both toolkits (verify); otherwise a `src/` `PertChartBase` plus thin toolkit subclasses | `nc-pertchart` |

## Proposed API
**Configs**: `taskStore`, `dependencyStore`, `calendar`, `projectStart`, `nodeWidth`, `nodeHeight`, `layerGap`, `rowGap`, `showCriticalPath` (true), `showSlack` (true), `nodeFields` (which values appear in the node box), `autoSchedule` (re-run the scheduler on store changes; default true).
**Methods**: `fit()`, `zoomIn()`, `zoomOut()`, `setZoom(scale)`, `scrollToTask(id)`, `exportImage()` (verify what `Ext.draw.Container` offers for image export).
**Events**: `taskselect(chart, task)`, `layoutchange(chart)`.

## Behavior
- Classic PERT node box: ES | duration | EF on top, name in the middle, LS | slack | LF at the bottom; milestones as a distinct shape.
- Layout left to right: layer = longest path from start (topological); order within layers reduces edge crossings (barycenter heuristic, a few sweeps); summary tasks hidden (leaf tasks only).
- Edges with arrowheads, orthogonal routing; critical nodes and edges highlighted.
- Pan by dragging the background, zoom with wheel and buttons, `fit()` to view all.
- Hover a node → highlight its predecessors and successors; tap/click → `taskselect`.
- Store changes → buffered re-schedule and re-layout (`Ext.Function.createBuffered`).
- Scheduler errors (cycles) shown as a message overlay instead of a broken drawing.
- Large graphs: skip text sprites when zoomed far out.

## Demo
Textbook fixture from Phase 12; a 60-task project; editing a task's duration in a side grid updates the chart and critical path live; a cycle introduced on purpose shows the error overlay.

## Acceptance
- Node values match the Phase 12 scheduler output exactly.
- Same rendering and interactions in both toolkits.

Extra instructions from the user: $ARGUMENTS
