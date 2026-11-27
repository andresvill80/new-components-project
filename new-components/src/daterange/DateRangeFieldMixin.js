/**
 * Shared behavior of {@link NC.daterange.DateRangeField} for both toolkits: the configs, the
 * conversion between the range and its text ("start – end"), the validation messages, the
 * values that are submitted, and the setup of the calendar in the picker. It is a mixin because
 * the field extends each toolkit's own picker field (`Ext.form.field.Picker` in Classic,
 * `Ext.field.Picker` in Modern).
 *
 * The value is a range, `{ start: Date, end: Date }`, or `null`. Both dates are at midnight.
 *
 * The toolkit class must:
 *
 * - make a picker that holds the calendar from {@link #getRangeCalendarConfig}, keep the
 *   calendar in `rangeCalendar` and call {@link #syncRangeCalendar} each time the picker is
 *   shown;
 * - implement {@link #applyPickedRange}, {@link #closeRangePicker} and
 *   {@link #refreshRangeText}.
 */
Ext.define('NC.daterange.DateRangeFieldMixin', {
    mixinId: 'daterangefield',

    requires: [
        'NC.daterange.DateRangeUtil',
        'Ext.Date',
        'Ext.String'
    ],

    /**
     * @event rangeselect
     * Fires when the user picks a range in the calendar (not when the value is set from code or
     * typed).
     * @param {NC.daterange.DateRangeField} field This field.
     * @param {Date} start First day of the range.
     * @param {Date} end Last day of the range.
     */

    /**
     * @property {String} invalidText
     * Error of text that is not a range: `{0}` is an example of what to type. Override for
     * other languages.
     */
    invalidText: 'Enter two dates like {0}',

    /**
     * @property {String} orderText
     * Error of a range that starts after it ends.
     */
    orderText: 'The start date must be on or before the end date',

    /**
     * @property {String} minText
     * Error of a range that starts before `minDate`: `{0}` is that date.
     */
    minText: 'The range cannot start before {0}',

    /**
     * @property {String} maxText
     * Error of a range that ends after `maxDate`: `{0}` is that date.
     */
    maxText: 'The range cannot end after {0}',

    /**
     * @property {String} spanText
     * Error of a range longer than `maxSpan`: `{0}` is the number of days.
     */
    spanText: 'The range cannot be longer than {0} days',

    /**
     * @property {String} sameDayText
     * Error of a one-day range when `allowSameDay` is `false`.
     */
    sameDayText: 'The range must have at least two days',

    config: {
        /**
         * @cfg {String} format
         * An `Ext.Date` format for each date of the text. Defaults to `Ext.Date.defaultFormat`.
         */
        format: null,

        /**
         * @cfg {String} separator
         * Text between the two dates.
         */
        separator: ' – ',

        /**
         * @cfg {Date} minDate
         * First day that can be picked or typed. A String must match `format`.
         */
        minDate: null,

        /**
         * @cfg {Date} maxDate
         * Last day that can be picked or typed. A String must match `format`.
         */
        maxDate: null,

        /**
         * @cfg {Number} maxSpan
         * Most days a range can have, both ends included; `null` for no limit.
         */
        maxSpan: null,

        /**
         * @cfg {Boolean} allowSameDay
         * `false` to require a range of at least two days.
         */
        allowSameDay: true,

        /**
         * @cfg {Number} monthsShown
         * Number of months side by side in the picker, 1 to 3. A narrow screen shows one.
         */
        monthsShown: 2,

        /**
         * @cfg {Number} startDay
         * First day of the week in the picker, from 0 (Sunday). Defaults to
         * `Ext.Date.firstDayOfWeek`.
         */
        startDay: null,

        /**
         * @cfg {Object[]} presets
         * Ranges the user can pick with one click: `{ text, getRange }`, where `getRange`
         * returns `{ start, end }`. Defaults to Today, Yesterday, Last 7 days, Last 30 days,
         * This month, Last month and This year.
         */
        presets: null,

        /**
         * @cfg {Boolean} showPresets
         * `true` to show the presets in the picker.
         */
        showPresets: true,

        /**
         * @cfg {String} startName
         * With `endName`, the names of the two submit parameters (see {@link #getSubmitData}).
         * Without them the range is submitted as one parameter, `name`, with
         * "start|end".
         */
        startName: null,

        /**
         * @cfg {String} endName
         * See `startName`.
         */
        endName: null,

        /**
         * @cfg {String} submitFormat
         * An `Ext.Date` format for the dates that are submitted.
         */
        submitFormat: 'Y-m-d'
    },

    applySeparator: function (separator) {
        return Ext.isString(separator) && separator ? separator : ' – ';
    },

    applyMinDate: function (date) {
        return this.toLimitDate(date);
    },

    applyMaxDate: function (date) {
        return this.toLimitDate(date);
    },

    applyMaxSpan: function (span) {
        return Ext.isNumeric(span) && +span > 0 ? Math.floor(+span) : null;
    },

    applyMonthsShown: function (count) {
        return Ext.isNumeric(count) ? Math.max(1, Math.min(3, Math.floor(+count))) : 2;
    },

    applyStartDay: function (day) {
        return Ext.isNumeric(day) ? Math.floor(+day) % 7 : null;
    },

    applyPresets: function (presets) {
        return presets ? Ext.Array.from(presets) : null;
    },

    applySubmitFormat: function (format) {
        return format || 'Y-m-d';
    },

    updateFormat: function () {
        this.refreshRangeText();
    },

    updateSeparator: function () {
        this.refreshRangeText();
    },

    /**
     * Gets the parameters that a form submit sends for the value of the field: with `startName`
     * and `endName` one parameter for each, otherwise `name` with "start|end", all
     * formatted with `submitFormat`. An empty field sends empty strings.
     *
     * In Classic a form sends these parameters (`form.getForm().getValues()`, `submit()`). In
     * Modern `form.getValues()` has only one entry per field, so it returns `name` with
     * "start|end" (from `serialize()`); call this method to get the two parameters.
     * @return {Object} `{ <startName>: '2026-01-01', <endName>: '2026-01-31' }` or
     * `{ <name>: '2026-01-01|2026-01-31' }`.
     */
    getRangeSubmitParams: function (range) {
        var me = this,
            util = NC.daterange.DateRangeUtil,
            format = me.getSubmitFormat(),
            startName = me.getStartName(),
            endName = me.getEndName(),
            params = {},
            value = util.toRange(range),
            start = value ? Ext.Date.format(value.start, format) : '',
            end = value ? Ext.Date.format(value.end, format) : '';

        if (startName && endName) {
            params[startName] = start;
            params[endName] = end;
        }
        else {
            params[me.getName()] = value ? start + '|' + end : '';
        }

        return params;
    },

    /**
     * Gets the text of a range in the `format` and with the `separator` of the field.
     * @param {Object} range
     * @return {String}
     * @protected
     */
    formatRangeText: function (range) {
        var me = this;

        return NC.daterange.DateRangeUtil.formatRange(range, me.getEffectiveFormat(),
            me.getSeparator());
    },

    /**
     * Reads a range from text.
     * @param {String} text
     * @return {Object} The range, or `null` when the text is not two dates in the format.
     * @protected
     */
    parseRangeText: function (text) {
        var me = this;

        return NC.daterange.DateRangeUtil.parseRange(text, me.getEffectiveFormat(),
            me.getSeparator()).range;
    },

    /**
     * Gets the messages of what is wrong with a range, according to `minDate`, `maxDate`,
     * `maxSpan` and `allowSameDay`.
     * @param {Object} range
     * @return {String[]} Empty when the range is valid.
     * @protected
     */
    getRangeErrors: function (range) {
        var me = this,
            rules = {
                minDate: me.getMinDate(),
                maxDate: me.getMaxDate(),
                maxSpan: me.getMaxSpan(),
                allowSameDay: me.getAllowSameDay()
            },
            format = me.getEffectiveFormat();

        return Ext.Array.map(NC.daterange.DateRangeUtil.getErrors(range, rules), function (code) {
            switch (code) {
                case 'min':
                    return Ext.String.format(me.minText, Ext.Date.format(rules.minDate, format));
                case 'max':
                    return Ext.String.format(me.maxText, Ext.Date.format(rules.maxDate, format));
                case 'span':
                    return Ext.String.format(me.spanText, rules.maxSpan);
                case 'sameDay':
                    return me.sameDayText;
                default:
                    return me.orderText;
            }
        });
    },

    /**
     * Gets the message of text that is not a range, with an example of what to type.
     * @return {String}
     * @protected
     */
    getInvalidMessage: function () {
        var me = this,
            util = NC.daterange.DateRangeUtil,
            today = util.today();

        return Ext.String.format(me.invalidText, me.formatRangeText({
            start: today,
            end: util.addDays(today, 6)
        }));
    },

    /**
     * Gets the configuration of the calendar that goes in the picker.
     * @return {Object}
     * @protected
     */
    getRangeCalendarConfig: function () {
        var me = this;

        return {
            xtype: 'nc-rangecalendar',
            listeners: {
                rangeselect: me.onRangeCalendarSelect,
                cancel: me.onRangeCalendarCancel,
                scope: me
            }
        };
    },

    /**
     * Gives the calendar of the picker the value and rules of the field. Call each time the
     * picker is shown.
     * @param {NC.daterange.RangeCalendar} calendar
     * @protected
     */
    syncRangeCalendar: function (calendar) {
        var me = this;

        if (!calendar) {
            return;
        }

        calendar.setConfig({
            value: me.getValue(),
            minDate: me.getMinDate(),
            maxDate: me.getMaxDate(),
            maxSpan: me.getMaxSpan(),
            allowSameDay: me.getAllowSameDay(),
            monthsShown: me.getMonthsShown(),
            startDay: me.getStartDay(),
            presets: me.getPresets(),
            showPresets: me.getShowPresets(),
            // The month of the range, or the current one.
            visibleMonth: null
        });
        calendar.cancelPicking();
    },

    onRangeCalendarSelect: function (calendar, start, end) {
        var me = this;

        me.applyPickedRange({ start: start, end: end });
        me.fireEvent('rangeselect', me, start, end);
        me.closeRangePicker();
    },

    onRangeCalendarCancel: function () {
        this.closeRangePicker();
    },

    privates: {
        getEffectiveFormat: function () {
            return this.getFormat() || Ext.Date.defaultFormat;
        },

        // A limit given as text is read with the format of the field.
        toLimitDate: function (date) {
            var util = NC.daterange.DateRangeUtil;

            return Ext.isString(date) ? util.parseDate(date, this.getEffectiveFormat()) : util.toDay(date);
        }
    },

    /**
     * Stores a range the user picked as the value of the field.
     * @param {Object} range
     * @abstract
     * @protected
     */
    applyPickedRange: Ext.emptyFn,

    /**
     * Closes the picker and gives the focus back to the field.
     * @abstract
     * @protected
     */
    closeRangePicker: Ext.emptyFn,

    /**
     * Shows the value again, after `format` or `separator` changed.
     * @abstract
     * @protected
     */
    refreshRangeText: Ext.emptyFn
});
