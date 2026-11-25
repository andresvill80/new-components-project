---
name: phase-04-otp-field
description: Phase 04 — build the OTP / PIN input field (nc-otpfield) for Classic and Modern forms.
disable-model-invocation: true
---

# Phase 04 — OTP / PIN Field

Load the `extjs` and `component-workflow` skills, then follow the workflow. This phase sets the pattern for all our custom form fields.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.otp.OtpUtil` (sanitize chars, distribute pasted text) | `src/` | — |
| `NC.otp.OtpField` | `classic/src/`, `modern/src/` | `nc-otpfield` |

## Proposed API
**Configs** (ours, identical in both toolkits): `length` (default 6), `charType` (`'numeric' | 'alphanumeric'`), `masked` (show dots), `autoFocus`, `separatorAfter` (e.g. 3 for "123-456" visual grouping, null for none).
**Inherited** field configs keep toolkit names: label (`fieldLabel` / `label`), required (`allowBlank: false` / `required: true`), `name`, `disabled`, `readOnly`.
**Value**: a string; `getValue()` returns only entered characters; `setValue('123456')` fills boxes.
**Methods**: `clear()`, `focusBox(index)`.
**Events**: `change` (standard), `complete(field, value)` when all boxes are filled.

## Behavior
- Typing a valid character fills the box and advances; invalid characters are ignored.
- Backspace on an empty box moves back and clears it; arrow keys move between boxes; Home/End jump.
- Paste anywhere distributes characters across boxes from that position (sanitized).
- `autocomplete="one-time-code"` on the first box, `inputmode="numeric"` when numeric.
- Each box has an accessible label ("Digit 1 of 6"); the group has the field label.
- Validation: required means all boxes filled; error shown the toolkit's normal way.
- Participates in forms: submit, `getValues()`, reset, dirty tracking, `bind`.

## Toolkit notes
- Classic: extend `Ext.form.field.Base` with a custom `fieldSubTpl` that renders N inputs; override value methods and `getErrors`. Study `Ext.form.field.Base` and an SDK field with custom markup first.
- Modern: extend `Ext.field.Field` with a custom body template rendering N inputs (verify the template mechanism in the SDK). Study `Ext.field.Text`.
- Key handling via Ext element listeners (`keydown`, `input`, `paste`); clipboard text from `e.browserEvent.clipboardData` (native: no Ext clipboard API).

## Demo
6-digit numeric, 4-digit masked PIN, 8-char alphanumeric with separator, inside a form with submit and reset, `complete` event logged, prefilled value, disabled and read-only states.

## Acceptance
- Paste "12 34-56" into a numeric field → "123456".
- Form `getValues()` returns the string under the field's `name` in both toolkits.
- Fully keyboard-operable; screen reader announces position.

Extra instructions from the user: $ARGUMENTS
