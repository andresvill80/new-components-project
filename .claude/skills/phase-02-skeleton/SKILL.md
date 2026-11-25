---
name: phase-02-skeleton
description: Phase 02 — build the Skeleton Loader component (nc-skeleton) and the skeleton loading plugin (plugin.nc-skeleton) for Classic and Modern.
disable-model-invocation: true
---

# Phase 02 — Skeleton Loader

Load the `extjs` and `component-workflow` skills, then follow the workflow.

## Classes
| Class | Where | alias |
|---|---|---|
| `NC.skeleton.SkeletonTpl` (singleton; builds markup for presets) | `src/` | — |
| `NC.skeleton.Skeleton` | `classic/src/`, `modern/src/` | `widget.nc-skeleton` |
| `NC.skeleton.SkeletonPluginBase` | `src/` (extends `Ext.plugin.Abstract`, verify it's in core) | — |
| `NC.skeleton.SkeletonPlugin` | `classic/src/`, `modern/src/` (extends the base) | `plugin.nc-skeleton` |

## Proposed API
**Skeleton configs**: `shape` (`'text' | 'circle' | 'rect'`), `lines` (for text, default 3), `width`, `height`, `preset` (`null | 'list' | 'card' | 'form' | 'table'`), `rows` (repeat count for presets), `animated` (default true).
**Plugin configs**: `preset` (default chosen from the host type: grid → `'table'`, dataview/list → `'list'`, form → `'form'`), `rows`, `store` (defaults to the host's store), `minDisplayTime` (ms, avoids flicker; default 300).
**Plugin methods**: `show()`, `hide()`.

## Behavior
- Shimmer animation in CSS only; disabled under `@media (prefers-reduced-motion: reduce)`.
- Plugin listens to the store's `beforeload` and `load` (and handles a store that's already loading at bind time, and store reconfiguration on the host).
- While visible, an overlay of skeleton markup covers the host's body area; the host's own load mask is disabled so they don't stack (verify the config name in each toolkit: Classic view `loadMask`, Modern dataview/list `loadingText`).
- `minDisplayTime` uses `Ext.defer`; timers cancelled on destroy.
- Overlay markup built with `Ext.XTemplate` from `SkeletonTpl` so both toolkits render identical shapes.
- `aria-busy="true"` on the host while loading.

## Toolkit notes
- The only toolkit-specific parts should be: which element to overlay (Classic `host.body` or view element; Modern `host.bodyElement`), how to find the host's store, and how to disable the host's own mask. Keep those as small overridable methods in the toolkit subclasses.

## Demo
Standalone skeletons for every shape and preset; a grid, a dataview/list, and a form each with the plugin and a store whose proxy is slowed down (e.g. a memory proxy plus `Ext.defer` before load, or a simulated delay), with a "Reload" button; a toggle for reduced motion explanation.

## Acceptance
- No flicker on fast loads (`minDisplayTime`).
- Overlay removed on load success and on load failure.
- No leftover timers or listeners after the host is destroyed.

Extra instructions from the user: $ARGUMENTS
