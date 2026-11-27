/**
 * A one-time code / PIN field for the Modern toolkit: one box per character, with automatic
 * advance, paste distribution and a `complete` event.
 *
 *     Ext.create('NC.otp.OtpField', {
 *         renderTo: Ext.getBody(),
 *         label: 'Verification code',
 *         name: 'code',
 *         length: 6,
 *         required: true,
 *         listeners: {
 *             complete: function (field, value) { Ext.toast('Code ' + value); }
 *         }
 *     });
 *
 * The value is the string of entered characters. It takes part in forms like any other field
 * (`getValues()`, `reset()`, dirty tracking, `bind`). All our configs, methods and events live in
 * {@link NC.otp.OtpFieldMixin} and are the same in the Classic toolkit; this class only provides
 * the Modern field plumbing.
 */
Ext.define('NC.otp.OtpField', {
    extend: 'Ext.field.Field',
    xtype: 'nc-otpfield',

    mixins: [
        'NC.otp.OtpFieldMixin'
    ],

    requires: [
        'NC.otp.OtpUtil'
    ],

    cls: 'nc-otpfield',

    ariaRole: 'group',
    ariaEl: 'boxesElement',
    focusEl: 'boxesElement',

    config: {
        /**
         * @cfg {Boolean} readOnly
         * `true` to show the code but not let the user change it.
         */
        readOnly: false
    },

    getBodyTemplate: function () {
        return [{
            reference: 'boxesElement',
            cls: 'nc-otp-boxes'
        }];
    },

    initialize: function () {
        var me = this,
            labelId = me.getId() + '-labelEl';

        me.callParent();

        // The label names the group of boxes.
        me.labelElement.set({ id: labelId });
        me.boxesElement.set({ 'aria-labelledby': labelId });
        me.boxesElement.setHtml(me.getOtpMarkup());

        me.initOtp();
    },

    getOtpRoot: function () {
        return this.boxesElement;
    },

    isOtpDisabled: function () {
        return !!this.getDisabled();
    },

    isOtpReadOnly: function () {
        return !!this.getReadOnly();
    },

    // The user changed a box.
    commitOtp: function () {
        this.setValue(this.getOtpString());
    },

    applyValue: function (value) {
        var me = this;

        // Only the characters that fit, so a value can never hold more than the boxes.
        value = NC.otp.OtpUtil.toChars(value, me.getLength(), me.getCharType()).join('');

        return me.callParent([value]);
    },

    updateValue: function (value, oldValue) {
        var me = this;

        // A box the user emptied keeps its place: only a value from code is spread again.
        if (value !== me.getOtpString()) {
            me.setOtpChars(value);
        }

        me.callParent([value, oldValue]);

        if (!me.isConfiguring) {
            me.otpValueChanged(value);
        }
    },

    updateReadOnly: function () {
        this.syncBoxes();
    },

    updateDisabled: function (disabled, oldDisabled) {
        this.callParent([disabled, oldDisabled]);
        this.syncBoxes();
    },

    // A required field needs every box.
    doValidate: function (value, errors, skipLazy) {
        var me = this,
            length = me.getLength();

        me.callParent([value, errors, skipLazy]);

        if (me.getRequired() && value.length < length) {
            errors.push(Ext.String.format(me.incompleteMessage, length));
        }
    },

    focus: function () {
        this.focusBox(this.getOtpFocusIndex());

        return this;
    },

    doDestroy: function () {
        this.destroyOtp();
        this.callParent();
    }
});
