# OTP / PIN Field

`nc-otpfield` is a form field with one box per character, for one-time codes and PINs. Typing advances to the next box, a paste is spread over the boxes, and `complete` fires when every box is filled. Classic and Modern have the same configs, methods and events.

Class: `NC.otp.OtpField` (`nc-otpfield`). Helper: `NC.otp.OtpUtil`.

## Configs

| Config | Type | Default | Description |
|---|---|---|---|
| `length` | Number | `6` | Number of boxes. |
| `charType` | String | `'numeric'` | `'numeric'` (0-9) or `'alphanumeric'` (0-9, a-z, A-Z). Other characters are ignored when typed and removed when pasted. |
| `masked` | Boolean | `false` | Show dots instead of the characters (a PIN). |
| `autoFocus` | Boolean | `false` | Focus the first box when the field is shown. |
| `separatorAfter` | Number | `null` | Show a visual separator after this many boxes (`3` makes "123 - 456"). It is not part of the value. |

Inherited field configs keep each toolkit's names:

| | Classic | Modern |
|---|---|---|
| Label | `fieldLabel` | `label` |
| Required (every box filled) | `allowBlank: false` | `required: true` |
| Read only | `readOnly` | `readOnly` |
| Others | `name`, `disabled`, `value`, `bind` | `name`, `disabled`, `value`, `bind` |

## Value

The value is a string with the entered characters. `getValue()` returns only what was entered, `setValue('123456')` fills the boxes (anything the `charType` does not accept is removed, extra characters are dropped), `setValue('')` clears them. A field is complete when every box has a character.

## Methods

| Method | Description |
|---|---|
| `clear()` | Empties every box. |
| `focusBox(index)` | Focuses a box (from 0). Out-of-range values are brought into range. |
| `isComplete()` | `true` when every box has a character. |

The usual field methods work too: `getValue()`, `setValue()`, `reset()`, `isDirty()`, `validate()`, `isValid()`, `focus()` (the first empty box).

## Events

| Event | Arguments | Description |
|---|---|---|
| `change` | `field, newValue, oldValue` | Standard field event, after the value changed. |
| `complete` | `field, value` | The value just became complete (every box filled), whether the user typed it or code set it. |

## Behavior

- Typing a valid character fills the box and moves to the next one; an invalid character is ignored. Typing in a filled box replaces its character.
- **Backspace** on a filled box clears it; on an empty box it clears the previous box and moves there. **Delete** clears the current box. The arrow keys move between boxes, Home and End go to the first and last.
- **Paste** (and an autofilled code) is sanitized and spread over the boxes from the box that received it: pasting `12 34-56` into the first box of a numeric field gives `123456`.
- **Validation:** a required field needs every box filled. A partly filled required field shows an "Enter all N characters" error (`incompleteMessage`).
- **Forms:** submit, `getValues()`, `reset()`, dirty tracking and `bind` work like any other field. In Classic a hidden input also holds the value for a standard submit.

## Examples

```javascript
// Classic
{
    xtype: 'nc-otpfield',
    name: 'code',
    fieldLabel: 'Verification code',
    allowBlank: false,
    length: 6,
    listeners: { complete: 'onCodeComplete' }
}

// Modern
{
    xtype: 'nc-otpfield',
    name: 'code',
    label: 'Verification code',
    required: true,
    length: 6,
    listeners: { complete: 'onCodeComplete' }
}
```

```javascript
// A masked PIN of four digits
{ xtype: 'nc-otpfield', length: 4, masked: true }

// An alphanumeric code with a separator: "AB12 - CD34"
{ xtype: 'nc-otpfield', length: 8, charType: 'alphanumeric', separatorAfter: 4 }
```

```javascript
onCodeComplete: function (field, value) {
    this.verify(value);
}
```

## Texts for other languages

Override these properties (on the class, or in a subclass):

| Property | Default |
|---|---|
| `digitLabel` | `'Digit {0} of {1}'` (accessible label of a box of a numeric field) |
| `charLabel` | `'Character {0} of {1}'` (alphanumeric field) |
| `incompleteMessage` | `'Enter all {0} characters'` |
| `blankText` (Classic) / `requiredMessage` (Modern) | The required message. |

## Styling

- Variables in `sass/etc/all.scss`: `$nc-otp-box-width`, `-box-height`, `-gap`, `-font-size`, `-border-color`, `-color`, `-background`, `-focus-color`, `-invalid-color`, `-locked-background`, `-separator-width`, `-separator-color`.
- Classes: `.nc-otp-boxes`, `.nc-otp-box`, `.nc-otp-sep`, `.nc-otp-locked`.

## Accessibility

- The boxes are native inputs inside a `role="group"` that is labelled by the field label. Each box has a label such as "Digit 1 of 6".
- The first box has `autocomplete="one-time-code"` so a phone or browser can suggest the code; `inputmode="numeric"` is set for numeric fields, which opens the numeric keypad on phones.
- Everything works from the keyboard (Tab, arrow keys, Home, End, Backspace). The focus ring has a visible 2px outline, and the invalid state changes the border color and shows the error message.

## Known limitations

- `charType` is limited to digits, or digits and ASCII letters; accented letters are not accepted.
- A paste is spread from the box that received it, not always from the first box.
- With `masked`, browsers may offer to save the value as a password; the boxes use `autocomplete="off"` except the first (`one-time-code`).
