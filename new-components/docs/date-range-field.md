# Date Range Field

`nc-daterangefield` is a field for a range of dates. The user types `start – end` or picks the range in a calendar that has quick presets such as "Last 7 days". `nc-rangecalendar` is the calendar, which can also be used alone. Classic and Modern have the same configs, methods and events.

Classes: `NC.daterange.DateRangeField` (`nc-daterangefield`), `NC.daterange.RangeCalendar` (`nc-rangecalendar`). Helper: `NC.daterange.DateRangeUtil`.

## Value

The value is `{ start: Date, end: Date }` (both at midnight) or `null`. `setValue` also accepts `[start, end]` and text in the format of the field (`'01/03/2026 – 15/03/2026'`). Text that is not a range is refused by `setValue`.

## Field configs

| Config | Type | Default | Description |
|---|---|---|---|
| `format` | String | `Ext.Date.defaultFormat` | `Ext.Date` format of each date in the text. |
| `separator` | String | `' – '` | Text between the two dates. A range typed without the spaces around the separator is understood too. |
| `minDate`, `maxDate` | Date/String | `null` | First and last day that can be picked or typed. A String must match `format`. |
| `maxSpan` | Number | `null` | Most days a range can have, both ends included. |
| `allowSameDay` | Boolean | `true` | `false` requires a range of at least two days. |
| `monthsShown` | Number | `2` | Months side by side in the picker, 1 to 3. A screen narrower than 600px shows one. |
| `startDay` | Number | `Ext.Date.firstDayOfWeek` | First day of the week in the picker, from 0 (Sunday). |
| `presets` | Object[] | the defaults below | `{ text, getRange: function () { return { start, end }; } }`. |
| `showPresets` | Boolean | `true` | Show the presets in the picker. |
| `startName`, `endName` | String | `null` | Names of two submit parameters (see "Submit"). |
| `submitFormat` | String | `'Y-m-d'` | `Ext.Date` format of the submitted dates. |

Inherited field configs keep each toolkit's names:

| | Classic | Modern |
|---|---|---|
| Label | `fieldLabel` | `label` |
| Required | `allowBlank: false` | `required: true` |
| Placeholder | `emptyText` | `placeholder` |
| Others | `name`, `disabled`, `readOnly`, `value`, `bind` | `name`, `disabled`, `readOnly`, `value`, `bind` |

Default presets: Today, Yesterday, Last 7 days, Last 30 days, This month, Last month and This year. They are built with `Ext.Date` and evaluated when picked, so "Today" is always today. A preset that would break `minDate`, `maxDate`, `maxSpan` or `allowSameDay` is disabled.

## Methods

| Method | Description |
|---|---|
| `getValue()` / `setValue(value)` | The range (see "Value"). |
| `reset()`, `isDirty()`, `validate()`, `isValid()` | The usual field methods. |
| `getSubmitData()` | The parameters of a form submit (see "Submit"). |

## Events

| Event | Arguments | Description |
|---|---|---|
| `change` | `field, newValue, oldValue` | Standard field event. Also fires while the user types a range that can be read. |
| `rangeselect` | `field, start, end` | The user picked a range in the calendar (or a preset). Not fired for typing or `setValue`. |

## Behavior

- **Typing:** the text is read as `start<separator>end` with `Ext.Date.parse` (strict, so `31/02/2026` is not a date) and the `format` of the field. Text that cannot be read, or a start after the end, is flagged with an error, never silently corrected. When the focus leaves, a range that was understood is shown again in the exact format.
- **Picker:** the first click on a day starts the range, the second ends it (the two are swapped if the second is earlier). While the end is being picked, the days that would make an invalid range are disabled and the range under the pointer is previewed.
- **Validation:** start not after end, within `minDate` / `maxDate`, at most `maxSpan` days, and not a single day when `allowSameDay` is `false`. A required field must have a range.
- **Locale:** weekday and month names come from `Ext.Date.dayNames` and `Ext.Date.monthNames`, so a locale override applies. The week starts on `Ext.Date.firstDayOfWeek` unless `startDay` is set.
- **Keyboard:** Down opens the picker and moves into the calendar. In the calendar the arrow keys move by day and week, PageUp / PageDown by month (with Shift by year), Home / End to the start and end of the week, Enter or Space picks a day, and Esc stops a range being picked (a second Esc closes the picker).

## Submit

- **One name:** the field is submitted as `name` with `start|end`, both in `submitFormat`.
- **Two names:** with `startName` and `endName` the field is submitted as two parameters.
- **Classic:** a form sends them by itself (`form.getForm().getValues()`, `submit()`).
- **Modern:** `form.getValues()` has one entry per field, so it returns the value (`getSubmitValues()` returns `start|end` for the field `name`). Use `field.getSubmitData()` to get the two parameters:

```javascript
// Modern: the field has no `name`, so the form skips it and its parameters are added by hand
var values = Ext.apply(form.getSubmitValues(), stayField.getSubmitData());
// { from: '2026-03-01', to: '2026-03-15', guest: '...' }
```

## Examples

```javascript
// Classic
{
    xtype: 'nc-daterangefield',
    fieldLabel: 'Period',
    name: 'period',
    format: 'd/m/Y',
    maxSpan: 31,
    allowBlank: false,
    bind: '{range}',
    listeners: { rangeselect: 'onRangeSelect' }
}

// Modern
{
    xtype: 'nc-daterangefield',
    label: 'Period',
    name: 'period',
    format: 'd/m/Y',
    maxSpan: 31,
    required: true,
    bind: '{range}',
    listeners: { rangeselect: 'onRangeSelect' }
}
```

```javascript
// Custom presets
presets: [{
    text: 'Next 7 days',
    getRange: function () {
        var util = NC.daterange.DateRangeUtil,
            today = util.today();

        return { start: today, end: util.addDays(today, 6) };
    }
}]
```

```javascript
// Two submit parameters
{ xtype: 'nc-daterangefield', startName: 'from', endName: 'to', submitFormat: 'Y-m-d' }
```

## Range calendar

`nc-rangecalendar` is the calendar of the picker. It has `value`, `minDate`, `maxDate`, `maxSpan`, `allowSameDay`, `monthsShown`, `startDay`, `visibleMonth` (any day of the first month shown), `presets` and `showPresets`, the same as the field, and the events `rangeselect(calendar, start, end)` and `cancel(calendar)` (Esc with nothing being picked).

## Texts for other languages

Override these properties on the class or in a subclass:

| Class | Properties |
|---|---|
| `DateRangeField` | `invalidText` (`{0}` is an example range), `orderText`, `minText`, `maxText`, `spanText`, `sameDayText` |
| `RangeCalendar` | `prevMonthText`, `nextMonthText`, `presetsText`, `dayLabelFormat`, `stateTexts`, `narrowWidth` |
| `DateRangeUtil` | `presetTexts` |

## Styling

- Variables in `sass/etc/all.scss`: `$nc-daterange-day-size`, `-presets-width`, `-gap`, `-background`, `-color`, `-muted-color`, `-disabled-color`, `-accent-color`, `-range-background`, `-hover-background`, `-border-color`, `-focus-color`.
- Classes: `.nc-rangecalendar`, `.nc-rangepicker`, `.nc-rc-month`, `.nc-rc-day`, `.nc-rc-today`, `.nc-rc-start`, `.nc-rc-end`, `.nc-rc-inrange`, `.nc-rc-preview`, `.nc-rc-disabled`, `.nc-rc-preset`.

## Accessibility

- Every month is a `role="grid"` with the month as its label, and every day is a native button with a label such as "Monday, March 2, 2026, range start" (also "in range" and "not available"). Days that cannot be picked have `aria-disabled` but can still be reached with the keyboard.
- The active day is the only one in the Tab order; the other days are reached with the arrow keys. All focus rings are visible.
- The header buttons are labelled "Previous month" and "Next month", and the month title is a polite live region.
- Colors meet a 4.5:1 contrast ratio (grey disabled days are exempt). Color transitions are disabled for users who prefer reduced motion.

## Known limitations

- Modern phones get the same floated picker with one month, not an edge picker (an edge picker is made of slots and cannot show a calendar).
- In Modern, `form.getValues()` returns one entry per field, so two submit parameters need `getSubmitData()`.
- The number of months follows the width of the viewport, not of the field, and is decided when the picker is shown.
- Only one range can be picked at a time; the dates have no time of day.
