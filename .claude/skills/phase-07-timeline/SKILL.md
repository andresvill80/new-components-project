---
name: phase-07-timeline
description: Phase 07 — build the Timeline component (nc-timeline), a styled, groupable list of dated events, for Classic and Modern.
disable-model-invocation: true
---

# Phase 07 — Timeline

Load the `extjs` and `component-workflow` skills, then follow the workflow. Reuses `NC.avatar.AvatarUtil` from Phase 01.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.timeline.TimelineUtil` (group labels, relative dates, item markup data) | `src/` | — |
| `NC.timeline.Timeline` | `classic/src/`, `modern/src/` | `nc-timeline` |

## Proposed API
**Configs**: `store`, field mappings `dateField` (`'date'`), `titleField`, `textField`, `iconField`, `statusField` (maps to color classes like `nc-timeline-status-success`), `personField` (renders an avatar via AvatarUtil); `dateFormat`, `relativeDates` (e.g. "3 hours ago"; default true for < 7 days), `groupBy` (`null | 'day' | 'month'`), `align` (`'left' | 'alternate'`; alternate falls back to left on narrow screens), `itemTpl` (override for the content block), `emptyText`.
**Events**: standard selection events of each toolkit's data view, plus `itemselect(timeline, record)` with a toolkit-neutral name.

## Behavior
- Vertical line with markers; marker shows icon or status color.
- Group headers ("Today", "Yesterday", "March 2026") computed with `Ext.Date` in `TimelineUtil`.
- All text from records HTML-encoded (`:htmlEncode` in templates).
- Relative dates refresh every minute while visible (`Ext.TaskManager` or `Ext.util.TaskRunner`, stopped on destroy).

## Toolkit notes
- Classic: `Ext.view.View` with an `Ext.XTemplate` that emits group headers by comparing with the previous record; `itemSelector` on item nodes only.
- Modern: `Ext.dataview.List` with `grouped: true` and a store grouper for headers (verify grouping API), `itemTpl` for items; alternate layout via `responsiveConfig`.

## Demo
Activity feed with avatars and statuses, grouped by day; project milestones with alternate layout; empty state; adding an item live to show refresh; long text wrapping.

## Acceptance
- Group headers and relative dates match in both toolkits for the same data.
- No unencoded user data; no leftover task runners after destroy.

Extra instructions from the user: $ARGUMENTS
