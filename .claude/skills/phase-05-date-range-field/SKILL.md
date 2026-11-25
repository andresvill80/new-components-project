---
name: phase-05-date-range-field
description: Phase 05 — build the Date Range picker field (nc-daterangefield) with dual calendars and presets for Classic and Modern.
disable-model-invocation: true
---

# Phase 05 — Date Range Field

Load the `extjs` and `component-workflow` skills, then follow the workflow. Reuse the field patterns from Phase 04.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.daterange.DateRangeUtil` (month matrix, range checks, presets) | `src/` | — |
| `NC.daterange.RangeCalendar` (month grid with range highlighting) | `classic/src/`, `modern/src/` | `nc-rangecalendar` |
| `NC.daterange.DateRangeField` | `classic/src/`, `modern/src/` | `nc-daterangefield` |

## Proposed API
**Configs**: `format` (default `Ext.Date.defaultFormat`), `separator` (`' – '`), `minDate`, `maxDate`, `maxSpan` (days, null = unlimited), `allowSameDay` (default true), `monthsShown` (2; 1 on narrow screens), `startDay` (first day of week; default from locale), `presets` (array of `{ text, getRange: function () { return { start, end }; } }`), `showPresets` (default true), `startName` / `endName` (submit as two params; when unset, submit `name` as `"start|end"` in `submitFormat`), `submitFormat` (`'Y-m-d'`).
**Value**: `{ start: Date, end: Date }` or null. `setValue` also accepts `[start, end]`.
**Events**: `change` (standard), `rangeselect(field, start, end)`.

## Behavior
- Typing in the input parses `"<start><separator><end>"` with `Ext.Date.parse` using `format`.
- Picker: two consecutive months side by side with prev/next navigation; first click sets start, second sets end (swap if earlier); hover previews the range.
- Default presets: Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, This year (all built with `Ext.Date`).
- Validation: start ≤ end, within min/max, span ≤ `maxSpan`; disabled days rendered as such.
- Localization via `Ext.Date.dayNames`/`monthNames` so locale overrides apply.
- Keyboard navigation in the calendar (arrows, PageUp/PageDown for months, Enter to select, Esc to close).

## Toolkit notes
- Classic: extend `Ext.form.field.Picker`; `createPicker()` returns a floating panel with two `nc-rangecalendar` and a presets list.
- Modern: extend `Ext.field.Picker`; floated picker on desktop, edge picker (one month) on phones; verify `createFloatedPicker` / `createEdgePicker` in the SDK.
- `RangeCalendar` renders from `DateRangeUtil.getMonthMatrix(year, month, startDay)` through an `Ext.XTemplate`, so both toolkits share the month logic.

## Demo
Basic field, with min/max and `maxSpan: 31`, custom presets, `startName`/`endName` form submit showing the submitted params, bound value displayed as text, a phone-width preview in Modern.

## Acceptance
- Month matrix correct across year boundaries and for any `startDay`.
- Invalid typed ranges flagged, not silently corrected.
- Form submit params identical in both toolkits.

Extra instructions from the user: $ARGUMENTS
