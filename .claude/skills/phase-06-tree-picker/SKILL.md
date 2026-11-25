---
name: phase-06-tree-picker
description: Phase 06 — build the Tree Picker field (nc-treepicker), a combo-like field with a searchable tree dropdown and optional multi-select, for Classic and Modern.
disable-model-invocation: true
---

# Phase 06 — Tree Picker Field

Load the `extjs` and `component-workflow` skills, then follow the workflow. Reuse the picker patterns from Phase 05.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.treepicker.TreePickerUtil` (path text, value resolution, selectable checks) | `src/` | — |
| `NC.treepicker.TreePicker` | `classic/src/`, `modern/src/` | `nc-treepicker` |

Compare with Classic's `Ext.ux.TreePicker` (packages/ux) during research; ours must add multi-select and search and behave the same in Modern.

## Proposed API
**Configs**: `store` (TreeStore), `displayField` (`'text'`), `valueField` (`'id'`), `multiSelect` (checkbox selection), `selectable` (`'leaf' | 'all'` or a function(node) → boolean), `searchable` (filter box in the dropdown), `showPath` (display "Europe / Spain / Madrid"), `pathSeparator` (`' / '`), `expandOnOpen` (`'selected' | 'all' | 'none'`), `pickerHeight`, `maxTagsShown` (multi: show "+N more").
**Value**: single → id; multi → array of ids.
**Events**: `change` (standard), `select(field, nodeOrNodes)`.

## Behavior
- Opening the picker expands to and highlights the current selection.
- Search filters the tree keeping ancestors of matches visible (TreeStore `filterer: 'bottomup'`, verify), highlights the match, debounced with `buffer`.
- `setValue` before nodes are loaded: keep the raw value, resolve the display text once the node is available (store load / node expand).
- Multi-select: checking a parent doesn't auto-check children unless `cascadeCheck: true` (optional config, confirm in plan).
- Keyboard: arrows navigate the tree, Enter selects, Esc closes, typing goes to the search box.

## Toolkit notes
- Classic: `Ext.form.field.Picker`, `createPicker()` returns a floating `Ext.tree.Panel` (with a search field in `tbar`).
- Modern: `Ext.field.Picker` with a floated (desktop) or edge (phone) picker containing `Ext.grid.Tree` plus a search field.
- Value/path logic only in `TreePickerUtil`.

## Demo
Single-select categories (leaf only), multi-select org units with search, remote-style lazy tree (memory proxy simulating node loading), preset value before load, form submit.

## Acceptance
- Display text correct for values set before and after load.
- Search keeps ancestors and clears cleanly.
- Same value shape in both toolkits.

Extra instructions from the user: $ARGUMENTS
