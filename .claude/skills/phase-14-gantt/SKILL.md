---
name: phase-14-gantt
description: Phase 14 — build the Gantt Chart (nc-gantt) in three stages (rendering, editing, dependencies) on top of the scheduling core, for Classic and Modern.
disable-model-invocation: true
argument-hint: "[stage 1|2|3]"
---

# Phase 14 — Gantt Chart

Load the `extjs` and `component-workflow` skills, then follow the workflow **once per stage**. Requires Phases 12 and 13 (reuse the `Ext.draw` lessons). Each stage ends with a working demo, user testing, and its own commit.

Stage requested: $ARGUMENTS (if empty, check `ROADMAP.md` Notes for the next stage, starting with stage 1).

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.gantt.TimeAxis` (zoom presets, date ↔ x conversion, tick generation) | `src/` | — |
| `NC.gantt.Timeline` (header + bars + links, drawn with `Ext.draw`) | `src/` if shared drawing works in both toolkits (verify), else Base + toolkit subclasses | `nc-gantttimeline` |
| `NC.gantt.Gantt` (task tree on the left, timeline on the right, splitter) | `classic/src/`, `modern/src/` | `nc-gantt` |

## Proposed API (all stages)
**Configs**: `taskStore`, `dependencyStore`, `calendar`, `rowHeight` (shared by tree rows and bars), `zoomLevel` (`'day' | 'week' | 'month' | 'quarter'`), `columns` (tree columns; default name, start, end, duration, % done), `showCriticalPath`, `showToday` (true), `showNonWorkingTime` (true), `readOnly`, `snapToDay` (true).
**Methods**: `zoomIn()`, `zoomOut()`, `setZoomLevel(level)`, `scrollToDate(date)`, `scrollToTask(id)`, `fitProject()`.
**Events**: `taskselect`, `beforetaskchange(gantt, task, changes)` (cancelable), `taskchange(gantt, task, changes)`, `beforedependencyadd` (cancelable), `dependencyadd`, `dependencyremove`.

## Stage 1 — Read-only rendering
- Task tree (Classic `Ext.tree.Panel`, Modern `Ext.grid.Tree`) with fixed `rowHeight` matching the timeline rows.
- Two-tier time header from `TimeAxis` per zoom level; weekend/holiday shading; today line.
- Bars: normal (with progress fill), summary (bracket style), milestone (diamond), critical path coloring.
- Dependency arrows (FS) routed around bars.
- Synchronized vertical scrolling and expand/collapse between tree and timeline; horizontal scroll in the timeline only.
- Draw only visible rows and the visible date range; redraw buffered on scroll.
- Zoom controls and `fitProject()`.

## Stage 2 — Editing
- Drag a bar to move it (snaps to working days via `Calendar`, sets `SNET` constraint), drag its end to change duration, drag the progress handle.
- Inline editing in tree columns (name, start, duration, % done).
- Every change goes through `beforetaskchange` → record update → buffered `NC.schedule.Scheduler` re-run → redraw.
- Tooltip while dragging showing new dates.
- `readOnly` disables all of it.

## Stage 3 — Dependencies
- Create a dependency by dragging from a bar's end handle to another bar; validate with `NC.schedule.Validator` (reject cycles with a message).
- Select and delete a dependency; edit lag via a small dialog.
- Keyboard alternative: a task's context menu "Add predecessor…".

## Out of scope (record in ROADMAP Notes if requested later)
Resources and assignments, baselines, undo/redo, printing/PDF export, SS/FF/SF dependency types.

## Demo
A 150-task project with 3 summary levels; zoom levels; critical path toggle; edit then compare with the PERT chart page using the same stores (shared ViewModel data) to show both views update.

## Acceptance (per stage)
- Tree rows and bars stay aligned while scrolling, expanding, and collapsing in both toolkits.
- Dates on bars match the scheduler's calculated fields.
- Smooth scrolling with 1,000 tasks on a typical desktop browser.
