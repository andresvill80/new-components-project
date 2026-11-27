/**
 * A field for a range of dates for the Modern toolkit. The user types "start – end" or picks
 * the range in a calendar with presets such as "Last 7 days".
 *
 *     Ext.create('NC.daterange.DateRangeField', {
 *         renderTo: Ext.getBody(),
 *         label: 'Period',
 *         name: 'period',
 *         format: 'd/m/Y',
 *         maxSpan: 31,
 *         required: true,
 *         listeners: {
 *             rangeselect: function (field, start, end) { Ext.toast('Picked'); }
 *         }
 *     });
 *
 * The value is `{ start: Date, end: Date }` or `null` (`setValue` also takes `[start, end]` or
 * text). It takes part in forms like any other field. All our configs, methods and events live in
 * {@link NC.daterange.DateRangeFieldMixin} and are the same in the Classic toolkit; this class
 * only provides the Modern field plumbing and picker.
 *
 * On a phone the picker is the same floated panel, with one month.
 */
Ext.define('NC.daterange.DateRangeField', {
    extend: 'Ext.field.Picker',
    xtype: 'nc-daterangefield',

    mixins: [
        'NC.daterange.DateRangeFieldMixin'
    ],

    requires: [
        'NC.daterange.DateRangeUtil',
        'NC.daterange.RangeCalendar',
        'Ext.Panel',
        'Ext.field.trigger.Date'
    ],

    config: {
        // The picker is as wide as its months, not as the field.
        matchFieldWidth: false,

        triggers: {
            expand: {
                type: 'date'
            }
        }
    },

    classCls: 'nc-daterangefield',

    // An edge picker is made of slots and cannot show a calendar, so phones get the floated
    // picker too (with one month).
    getAutoPickerType: function () {
        return 'floated';
    },

    // A value is a range. Text is read as a range, and a range that is the same as the current
    // one is not a change.
    applyValue: function (value, oldValue) {
        var me = this,
            util = NC.daterange.DateRangeUtil,
            range;

        if (Ext.isString(value)) {
            range = value ? me.parseValue(value) : null;

            // Text that is not a range is refused.
            if (value && !range) {
                return undefined;
            }
        }
        else {
            range = util.toRange(value);
        }

        if (util.isEqualRange(range, oldValue)) {
            return undefined;
        }

        return me.callParent([range, oldValue]);
    },

    updateValue: function (value, oldValue) {
        var me = this;

        // Not through the getter: it would create the picker.
        if (me.rangeCalendar && !me.rangeCalendar.destroyed) {
            me.rangeCalendar.setValue(value);
        }

        me.callParent([value, oldValue]);
    },

    // The text of the input as a range. The framework compares it with the value to see which
    // is newer, so it has to be a range too (not the text).
    rawToValue: function (rawValue) {
        return this.parseRangeText(rawValue);
    },

    applyInputValue: function (value, oldValue) {
        if (Ext.isObject(value)) {
            value = this.formatRangeText(value);
        }

        return this.callParent([value, oldValue]);
    },

    // The text typed is read as a range. Empty text is no range and no error here.
    parseValue: function (value, errors) {
        var me = this,
            range;

        if (!Ext.isString(value)) {
            return value;
        }

        if (!Ext.String.trim(value)) {
            return null;
        }

        range = me.parseRangeText(value);

        if (!range && errors) {
            errors.push(me.getInvalidMessage());
        }

        return range;
    },

    doValidate: function (value, errors, skipLazy) {
        var me = this;

        me.callParent([value, errors, skipLazy]);

        // `value` is the range read from the text.
        if (Ext.isObject(value)) {
            Ext.Array.push(errors, me.getRangeErrors(value));
        }
    },

    isEqual: function (value1, value2) {
        return NC.daterange.DateRangeUtil.isEqualRange(value1, value2);
    },

    // An empty field has no value (the default would turn it into an empty string).
    transformValue: function (value) {
        return value;
    },

    /**
     * Gets the text of the value as it is submitted: "start|end" in `submitFormat`. This is what
     * `form.getSubmitValues()` returns for the field; `getSubmitData` has the two parameters.
     * @return {String}
     */
    serialize: function () {
        var me = this,
            range = me.getValue();

        // With startName and endName the parameters are two; the string has both.
        return range ? Ext.Object.getValues(me.getRangeSubmitParams(range)).join('|') : '';
    },

    /**
     * Gets what a form submit sends for this field, see
     * {@link NC.daterange.DateRangeFieldMixin#getRangeSubmitParams}.
     * @return {Object} The parameters, or `null` for a disabled field.
     */
    getSubmitData: function () {
        var me = this;

        return me.getDisabled() ? null : me.getRangeSubmitParams(me.getValue());
    },

    applyPicker: function (picker, oldPicker) {
        picker = this.callParent([picker, oldPicker]);

        if (picker) {
            picker.ownerCmp = this;
        }

        return picker;
    },

    createFloatedPicker: function () {
        var me = this;

        return {
            xtype: 'panel',
            floated: true,
            cls: 'nc-rangepicker',
            items: [me.getRangeCalendarConfig()]
        };
    },

    onPickerShow: function () {
        var me = this;

        me.callParent();

        // The picker exists now. Remember its calendar, so `updateValue` can reach it without
        // creating the picker.
        me.rangeCalendar = me.getPicker().down('nc-rangecalendar');
        me.syncRangeCalendar(me.rangeCalendar);
    },

    // The Down arrow opens the picker and moves into the calendar. (The calendar gets the value
    // and rules when the picker is shown: this runs again whenever the picker is aligned, and
    // must not forget a range that is being picked.)
    setPickerLocation: function (fromKeyboard) {
        var me = this;

        if (fromKeyboard && me.rangeCalendar) {
            me.rangeCalendar.focusDate();
        }
    },

    applyPickedRange: function (range) {
        this.forceSetValue(range);
    },

    closeRangePicker: function () {
        var me = this;

        me.collapse();
        me.focus();
    },

    refreshRangeText: function () {
        var me = this;

        // The text is written again in the new format and separator.
        if (!me.isConfiguring && me.inputElement) {
            me.setInputValue(me.getValue());
        }
    },

    doDestroy: function () {
        this.rangeCalendar = null;
        this.callParent();
    }
});
