---
name: phase-01-avatar
description: Phase 01 — build the Avatar and Avatar Group components (nc-avatar, nc-avatargroup) for Classic and Modern.
disable-model-invocation: true
---

# Phase 01 — Avatar / Avatar Group

Load the `extjs` and `component-workflow` skills, then follow the workflow. This is the first real component: it sets the patterns later phases copy, so keep it clean and well commented.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.avatar.AvatarUtil` (singleton) | `src/` | — |
| `NC.avatar.Avatar` | `classic/src/`, `modern/src/` | `nc-avatar` |
| `NC.avatar.AvatarGroup` | `classic/src/`, `modern/src/` | `nc-avatargroup` |

## Proposed API (confirm in the plan step)
**Avatar configs**: `name` (string; used for initials, color, tooltip, and alt text), `src` (image URL), `initials` (override), `size` (`'small' | 'medium' | 'large'` or a number in px; default `'medium'`), `shape` (`'circle' | 'rounded' | 'square'`), `status` (`null | 'online' | 'away' | 'busy' | 'offline'`), `colorIndex` (override automatic color), `showTooltip` (default true).
**Avatar events**: `select(avatar)` when activated by pointer or keyboard (only if `selectable: true`).
**AvatarGroup configs**: `data` (array of `{ name, src, status }`) or `store`, `max` (visible avatars before "+N", default 4), `size`, `shape`, `overlap` (boolean).
**AvatarGroup events**: `avatarselect(group, data)`, `overflowselect(group, hiddenItems)`.

## Shared logic (`NC.avatar.AvatarUtil`)
- `getInitials(name)`: first letter of the first and last word, uppercased; one word → one letter; empty → `''`. Uses `Ext.String.splitWords`, `Ext.String.trim`.
- `getColorIndex(name, paletteSize)`: deterministic hash of the name to `0..paletteSize-1`, so the same person always gets the same color.
- `paletteSize` constant that matches the SASS palette length.

## Behavior
- Image fails to load → fall back to initials (listen to the image element's `error` event via Ext element `on`).
- Color comes from a CSS class `nc-avatar-color-N`; the palette is defined in SASS (`$nc-avatar-palette`), not in JS.
- Status dot positioned bottom-right, with an accessible label (e.g. "Online").
- Names and initials always HTML-encoded.
- Group: renders up to `max` avatars plus a "+N" bubble; "+N" shows the hidden names in a tooltip and fires `overflowselect`.
- Tooltip: use each toolkit's own mechanism (verify in SDK: Classic `data-qtip` / `Ext.tip.ToolTip`, Modern `tooltip` config).

## Toolkit notes
- Classic: `Ext.Component` with `renderTpl` + `childEls`; DOM updates guarded by `rendered`. Group: `Ext.container.Container` with `hbox` holding `nc-avatar` items plus the overflow element.
- Modern: `Ext.Component` with `template` references; group: `Ext.Container` with `hbox`.
- Consider a `src/` mixin for the shared config handling if both Avatar classes end up duplicating logic.

## Demo
Sizes × shapes grid; with and without images; broken image URL; long and accented names ("María José López Hernández"); all statuses; groups with 2, 4, and 12 people; event log for `select` and `overflowselect`.

## Acceptance
- "Ana" → "A", "Juan Pérez" → "JP", "  " → empty with a neutral placeholder.
- Same name → same color in both toolkits.
- Broken image falls back to initials without console errors.

Extra instructions from the user: $ARGUMENTS
