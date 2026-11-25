---
name: phase-03-stepper
description: Phase 03 — build the Stepper / Wizard container (nc-stepper) for Classic and Modern.
disable-model-invocation: true
---

# Phase 03 — Stepper / Wizard

Load the `extjs` and `component-workflow` skills, then follow the workflow.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.stepper.StepperMixin` (step state: active, completed, errors, navigation rules) | `src/` | — |
| `NC.stepper.Stepper` (container with card layout + indicator + nav toolbar) | `classic/src/`, `modern/src/` | `nc-stepper` |
| `NC.stepper.StepIndicator` (the step header) | `classic/src/`, `modern/src/` | `nc-stepindicator` |

## Proposed API
**Stepper configs**: `activeStep` (index; bindable, published), `indicatorPosition` (`'top' | 'left'`), `linear` (must complete steps in order; default true), `allowStepSelect` (click/tap a step to jump; respects `linear`), `showNavigation` (default true), `backText`, `nextText`, `finishText`, `validateOnNext` (default true).
**Per-step config** on each child item: `step: { title, description, optional, iconCls }`.
**Methods**: `next()`, `back()`, `goTo(index)`, `reset()`, `setStepComplete(index, complete)`, `setStepError(index, message)`, `getStepCount()`.
**Events**: `beforestepchange(stepper, newIndex, oldIndex)` (return false to cancel), `stepchange(stepper, newIndex, oldIndex)`, `finish(stepper)`.

## Behavior
- On Next with `validateOnNext`: if the active item is a form panel, validate it (Classic `getForm().isValid()`, Modern `validate()`); also validate any form panels nested inside it. Invalid → stay, mark step error.
- Indicator shows each step's state: upcoming, active, complete (check icon), error, optional label.
- Back is disabled on the first step; Next becomes Finish on the last.
- Keyboard: indicator steps are focusable buttons when `allowStepSelect`; arrow keys move focus.
- Narrow screens: indicator shows only numbers plus the active step's title (Modern `responsiveConfig`; Classic based on width).

## Toolkit notes
- Classic: `Ext.panel.Panel` with `layout: 'card'`, indicator in `dockedItems`, navigation in `bbar`.
- Modern: `Ext.Panel` with `layout: 'card'`, indicator and toolbar as `docked` items.
- All step-state logic lives in the mixin; toolkit classes only render and wire events.

## Demo
A 4-step signup wizard (account form, profile form, optional preferences, review), a non-linear variant with step jumping, a left-indicator variant, `beforestepchange` cancel example, `activeStep` bound to a ViewModel value displayed elsewhere.

## Acceptance
- Can't pass an invalid form step; errors visible on the indicator.
- `linear: true` blocks jumping ahead; jumping back always allowed.
- `activeStep` binding works both ways.

Extra instructions from the user: $ARGUMENTS
