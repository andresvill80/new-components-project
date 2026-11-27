# Stepper / Wizard

`nc-stepper` is a panel with a card layout whose child items are the steps. It has a header that shows the progress (`nc-stepindicator`) and a Back / Next navigation bar, validates forms when you press Next, and can require the steps to be done in order. Classic and Modern have the same configs, methods and events.

Classes: `NC.stepper.Stepper` (`nc-stepper`), `NC.stepper.StepIndicator` (`nc-stepindicator`).

## Describing the steps

The child items of the stepper are the steps. Give each one a `step` property:

| Property | Type | Description |
|---|---|---|
| `title` | String | Title in the indicator. Defaults to "Step N". |
| `description` | String | Smaller text under the title. |
| `optional` | Boolean | The step is marked "Optional", is not validated and does not block a linear stepper. |
| `iconCls` | String | CSS class of an icon shown in the marker instead of the number, for example `'x-fa fa-user'`. |

## Stepper configs

| Config | Type | Default | Description |
|---|---|---|---|
| `activeStep` | Number | `0` | Index of the current step. Bindable and two-way. |
| `indicatorPosition` | String | `'top'` | `'top'` (a row) or `'left'` (a column). Applied when the stepper is created. |
| `linear` | Boolean | `true` | Each step must be complete (or optional) before going past it. Going back is always allowed. |
| `allowStepSelect` | Boolean | `true` | Clicking or tapping a step in the indicator goes to it. The `linear` rule still applies. |
| `showNavigation` | Boolean | `true` | Show the Back and Next / Finish buttons. |
| `backText`, `nextText`, `finishText` | String | `'Back'`, `'Next'`, `'Finish'` | Button texts. |
| `validateOnNext` | Boolean | `true` | Validate the forms of the active step when Next is pressed. |

Give the stepper a `height` (or put it in a layout that sizes it): a card layout needs one.

## Methods

| Method | Description |
|---|---|
| `nextStep()` | Validates the active step, marks it complete and goes to the next one. On the last step it fires `finish`. Returns `true` if it moved on. |
| `previousStep()` | Goes back one step. |
| `goTo(index)` | Goes to a step if the rules and `beforestepchange` allow it. Returns `true` if that step is now active. |
| `reset()` | Clears the completion and errors of every step and returns to the first step. |
| `setStepComplete(index, complete)` | Marks a step complete or not. Completing a step clears its error. |
| `setStepError(index, message)` | Shows an error on a step (`null` clears it). A step with an error is not complete. |
| `getStepCount()` | Number of steps. |
| `isStepComplete(index)`, `getStepError(index)`, `getStepItem(index)` | Read a step's state or its item. |
| `canGoTo(index)` | Tells whether the rules allow going to that step now. |

The methods are called `nextStep()` and `previousStep()` (not `next()` and `back()`) because Classic's `Ext.Component` already has `next()` and `prev()`, aliases of `nextSibling()` and `previousSibling()`.

## Events

| Event | Arguments | Description |
|---|---|---|
| `beforestepchange` | `stepper, newIndex, oldIndex` | Before the active step changes, whatever the cause. Return `false` to cancel. |
| `stepchange` | `stepper, newIndex, oldIndex` | After the active step changed. |
| `finish` | `stepper` | Finish was pressed on the last step and the step is valid. |

## Behavior

- **Next** validates the active step: the item itself if it is a form panel, and any form panels nested in it (Classic `isValid()`, Modern `validate()`; every field shows its error). If it is invalid the step stays, gets an error in the indicator and Next does nothing. If it is valid the step is marked complete and the stepper moves on.
- **Optional steps** are not validated.
- **Linear:** a step can only be reached if all steps before it are complete or optional. This applies to the buttons, the indicator, `goTo()` and binding.
- **Binding:** a bound `activeStep` that is refused (by the linear rule or a `beforestepchange` listener) is not applied, and the view model gets the real step back.
- **Back** is disabled on the first step; Next becomes Finish on the last.

## Indicator

`NC.stepper.StepIndicator` shows each step as upcoming, active, complete (a check mark), error (a "!" and the error message) or optional. It can also be used alone.

| Config | Default | Description |
|---|---|---|
| `steps` | `null` | Array of `{ title, description, optional, iconCls, complete, error }`. |
| `activeStep` | `0` | Current step. |
| `selectable` | `true` | Let the user pick steps. |
| `orientation` | `'horizontal'` | `'horizontal'` or `'vertical'`. |
| `compactWidth` | `480` | Below this width (px) a horizontal indicator shows only the numbers and the active step's title. |
| `stateLabels` | English | Accessible texts, for other languages. |

Event `stepselect(indicator, index)`.

## Examples

```javascript
// Classic: use xtype 'form' for form steps and fieldLabel / allowBlank on fields.
// Modern: use xtype 'formpanel' and label / required.
{
    xtype: 'nc-stepper',
    height: 400,
    bind: { activeStep: '{step}' },
    listeners: {
        finish: 'onFinish',
        beforestepchange: 'onBeforeStepChange'
    },
    items: [{
        xtype: 'form',                       // 'formpanel' in Modern
        step: { title: 'Account', description: 'Your login' },
        items: [{ xtype: 'textfield', fieldLabel: 'Username', allowBlank: false }]
    }, {
        xtype: 'panel',
        step: { title: 'Preferences', optional: true },
        html: 'Optional settings'
    }, {
        xtype: 'panel',
        step: { title: 'Review' },
        html: 'Done?'
    }]
}
```

```javascript
// Cancel a change from a listener:
onBeforeStepChange: function (stepper, newIndex, oldIndex) {
    return !this.hasUnsavedChanges();        // false cancels
}
```

## Styling

- Variables in `sass/etc/all.scss`: `$nc-stepper-upcoming-color`, `-active-color`, `-complete-color`, `-error-color`, `-connector-color`, `-muted-color`, `-marker-size`, `-vertical-width`, `-focus-color`.
- Classes: `.nc-stepindicator`, `.nc-step`, `.nc-step-active`, `.nc-step-complete`, `.nc-step-error`, `.nc-step-optional`, `.nc-step-marker`, `.nc-stepindicator-vertical`, `.nc-stepindicator-compact`.

## Accessibility

- Every step is a native `<button>` with an `aria-label` such as "Step 2 of 4: Profile, current step" and `aria-current="step"` on the active one.
- When `allowStepSelect` is on, Tab goes to the active step, the arrow keys, Home and End move the focus between steps, and Enter or Space picks one. Otherwise the buttons are disabled.
- The marker and the connectors are decorative (`aria-hidden`). Colors meet a 4.5:1 contrast ratio. The color transition is disabled for users who prefer reduced motion.

## Known limitations

- `indicatorPosition` is applied when the stepper is created; to change it later, create the stepper again.
- The steps are the child items. When items are added or removed the step states are kept by position.
- A step's content is rendered up front (Classic card layout default), so all forms exist from the start.
- The compact mode uses the width of the indicator, not the viewport.
