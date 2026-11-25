---
name: phase-11-kanban
description: Phase 11 — build the Kanban Board (nc-kanban) with draggable cards across status columns, WIP limits, and avatars, for Classic and Modern.
disable-model-invocation: true
---

# Phase 11 — Kanban Board

Load the `extjs` and `component-workflow` skills, then follow the workflow. Reuses Avatar (Phase 01) and Skeleton (Phase 02); builds on drag-and-drop lessons from Phase 10.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.kanban.BoardUtil` (ordering, move calculation, WIP checks) | `src/` | — |
| `NC.kanban.CardTpl` (card markup from record + field mapping) | `src/` | — |
| `NC.kanban.DragDropMixin` (core `Ext.drag.Source`/`Target` wiring, verify both toolkits) | `src/` | — |
| `NC.kanban.Column` | `classic/src/`, `modern/src/` | `nc-kanbancolumn` |
| `NC.kanban.Board` | `classic/src/`, `modern/src/` | `nc-kanban` |

## Proposed API
**Configs**: `store` (cards), `columns` (array of `{ value, title, wipLimit, cls, collapsed }`), `statusField` (`'status'`), `orderField` (`'order'`), field mappings `titleField`, `descriptionField`, `assigneeField` (name or array of names → avatars), `tagsField`, `dueDateField`, `priorityField`; `cardTpl` (override), `allowDrag` (true), `enforceWipLimit` (false), `collapsibleColumns` (true).
**Methods**: `moveCard(record, toStatus, index)`, `getColumn(value)`.
**Events**: `beforecardmove(board, record, fromStatus, toStatus, index)` (cancelable), `cardmove(board, record, fromStatus, toStatus, index)`, `cardselect(board, record)`.

## Behavior
- Each column shows a chained store of the main store filtered by status, sorted by `orderField`.
- Dropping a card updates `statusField` and renumbers `orderField` within affected columns via `BoardUtil`; the board never syncs the store itself (the app decides).
- Drop placeholder shows where the card will land; column highlights as a valid/invalid target.
- WIP limit: header shows `count / limit`, turns warning color when exceeded; `enforceWipLimit` blocks the drop.
- Keyboard and accessibility alternative to dragging: a card menu "Move to → column" and up/down within the column.
- Overdue due dates highlighted; all text HTML-encoded.
- Many cards: columns scroll independently; board scrolls horizontally with snap on phones (Modern).

## Toolkit notes
- Columns: Classic `Ext.view.View`; Modern `dataview`. Card markup identical via `CardTpl`.
- Prefer the shared core drag classes so DnD logic lives in `src/`; if a toolkit needs adaptation (element lookup, scrolling), override small hooks in the toolkit `Column`.

## Demo
Software team board (Backlog, To do, In progress (WIP 3), Review, Done) with 30 cards, assignee avatars, tags, due dates; `beforecardmove` rule example (can't move to Done without an assignee); event log; store changes table showing modified records.

## Acceptance
- Order and status persist correctly after many moves (store state matches the screen).
- Cancelled moves snap back with no store changes.

Extra instructions from the user: $ARGUMENTS
