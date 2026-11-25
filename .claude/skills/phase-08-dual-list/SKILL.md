---
name: phase-08-dual-list
description: Phase 08 — build the Dual List Selector / Transfer List field (nc-duallist) for Classic and Modern forms.
disable-model-invocation: true
---

# Phase 08 — Dual List Selector

Load the `extjs` and `component-workflow` skills, then follow the workflow. Compare with Classic's `Ext.ux.form.ItemSelector` during research.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.duallist.SelectionManager` (move, reorder, max checks, value ↔ records) | `src/` | — |
| `NC.duallist.DualList` | `classic/src/`, `modern/src/` | `nc-duallist` |

## Proposed API
**Configs**: `store` (all options), `displayField`, `valueField`, `availableTitle`, `selectedTitle`, `searchable` (filter box per list), `allowReorder` (top/up/down/bottom on the selected list), `allowDragDrop`, `maxSelections`, `buttons` (which move buttons to show).
**Inherited** field configs keep toolkit names (label, required, name).
**Value**: array of ids in the selected list's order.
**Events**: `change` (standard), `beforeselectionchange(field, toAdd, toRemove)` (cancelable).

## Behavior
- Left list = chained store of the source filtered to unselected records; right list = store in selection order.
- Move selected, move all, remove selected, remove all; double-click/double-tap moves an item.
- `maxSelections` blocks additions and shows why.
- Search filters each list independently (buffered).
- Drag and drop between lists and within the selected list when enabled (prefer core `Ext.drag.Source`/`Target`, which both toolkits share; verify).
- Full keyboard path: select with arrows/space, move with buttons or shortcuts, all buttons labeled.
- Form integration: submit, `getValues()`, reset, dirty, `bind`, required validation.

## Toolkit notes
- Classic: `Ext.form.FieldContainer` with the `Ext.form.field.Field` mixin, two `Ext.view.BoundList` or grids, buttons column between.
- Modern: verify the best base in the SDK (`Ext.field.Container` or `Ext.field.Field` with a custom body) so it participates in `formpanel` values and validation; two `list` components.
- All move/order/max logic in `SelectionManager`.

## Demo
Permissions assignment (with search, max 5), ordered column chooser (reorder enabled), drag and drop variant, form submit showing value order, preset value.

## Acceptance
- Value order matches the visible selected order in both toolkits.
- No duplicated records; source store untouched by moves.

Extra instructions from the user: $ARGUMENTS
