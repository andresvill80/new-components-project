/**
 * A field for a range of dates for the Classic toolkit. The user types "start – end" or picks
 * the range in a calendar with presets such as "Last 7 days".
 *
 *     Ext.create('NC.daterange.DateRangeField', {
 *         renderTo: Ext.getBody(),
 *         fieldLabel: 'Period',
 *         name: 'period',
 *         format: 'd/m/Y',
 *         maxSpan: 31,
 *         allowBlank: false,
 *         listeners: {
 *             rangeselect: function (field, start, end) { Ext.toast('Picked'); }
 *         }
 *     });
 *
 * The value is `{ start: Date, end: Date }` or `null` (`setValue` also takes `[start, end]` or
 * text). It takes part in forms like any other field. All our configs, methods and events live in
 * {@link NC.daterange.DateRangeFieldMixin} and are the same in the Modern toolkit; this class
 * only provides the Classic field plumbing and picker.
 */
Ext.define('NC.daterange.DateRangeField', {
    extend: 'Ext.form.field.Picker',
    xtype: 'nc-daterangefield',

    mixins: [
        'NC.daterange.DateRangeFieldMixin'
    ],

    requires: [
        'NC.daterange.DateRangeUtil',
        'NC.daterange.RangeCalendar',
        'Ext.panel.Panel'
    ],

    triggerCls: Ext.baseCSSPrefix + 'form-date-trigger',

    // The picker is as wide as its months, not as the field.
    matchFieldWidth: false,

    cls: 'nc-daterangefield',

    // What the text field reads and writes is text; the value is the range in it.
    rawToValue: function (rawValue) {
        return this.parseRangeText(rawValue);
    },

    valueToRaw: function (value) {
        var me = this,
            range;

        if (Ext.isString(value)) {
            // Text is shown in the format of the field when it can be read.
            range = me.parseRangeText(value);

            return range ? me.formatRangeText(range) : value;
        }

        return me.formatRangeText(value);
    },

    isEqual: function (value1, value2) {
        return NC.daterange.DateRangeUtil.isEqualRange(value1, value2);
    },

    /**
     * Gets what a form submit sends for this field, see
     * {@link NC.daterange.DateRangeFieldMixin#getRangeSubmitParams}.
     * @return {Object} The parameters, or `null` for a disabled field.
     */
    getSubmitData: function () {
        var me = this;

        return !me.disabled && me.submitValue ? me.getRangeSubmitParams(me.getValue()) : null;
    },

    getErrors: function (value) {
        var me = this,
            errors = me.callParent(arguments),
            range, text;

        value = arguments.length ? value : me.processRawValue(me.getRawValue());

        if (Ext.isObject(value) || Ext.isArray(value)) {
            range = NC.daterange.DateRangeUtil.toRange(value);
        }
        else {
            text = Ext.String.trim(Ext.valueFrom(value, ''));

            // An empty field is the business of allowBlank.
            if (!text) {
                return errors;
            }

            range = me.parseRangeText(text);
        }

        if (range) {
            Ext.Array.push(errors, me.getRangeErrors(range));
        }
        else {
            errors.push(me.getInvalidMessage());
        }

        return errors;
    },

    createPicker: function () {
        var me = this,
            picker;

        // Like the other pickers, it finds its floating parent through `pickerField`.
        picker = Ext.create('Ext.panel.Panel', {
            id: me.id + '-picker',
            pickerField: me,
            floating: true,
            shrinkWrap: 3,
            focusOnToFront: false,
            preventRefocus: true,
            hidden: true,
            cls: 'nc-rangepicker',
            items: [me.getRangeCalendarConfig()]
        });

        me.rangeCalendar = picker.down('nc-rangecalendar');

        return picker;
    },

    onExpand: function () {
        this.syncRangeCalendar(this.rangeCalendar);
    },

    // The Down arrow opens the picker and moves into the calendar.
    onDownArrow: function (e) {
        var me = this;

        me.callParent([e]);

        if (me.isExpanded) {
            me.rangeCalendar.focusDate();
        }
    },

    // Typed text is shown in the format of the field when the focus leaves.
    onBlur: function (e) {
        var me = this,
            range = me.parseRangeText(me.getRawValue());

        if (range) {
            me.setValue(range);
        }

        me.callParent([e]);
    },

    applyPickedRange: function (range) {
        this.setValue(range);
    },

    closeRangePicker: function () {
        var me = this;

        me.inputEl.focus();
        me.collapse();
    },

    refreshRangeText: function () {
        var me = this;

        // The text is written again in the new format and separator.
        if (me.rendered && me.currentRange !== undefined) {
            me.setRawValue(me.formatRangeText(me.currentRange));
        }
    },

    // `currentRange` is the range as an object: when the format changes the text cannot be read
    // with the new format any more, so the range is kept to write it again.
    initValue: function () {
        var me = this;

        me.callParent();
        me.currentRange = me.getValue();
    },

    onChange: function (newVal, oldVal) {
        var me = this;

        me.callParent([newVal, oldVal]);
        me.currentRange = newVal;
    }
});
