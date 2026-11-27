/**
 * A one-time code / PIN field for the Classic toolkit: one box per character, with automatic
 * advance, paste distribution and a `complete` event.
 *
 *     Ext.create('NC.otp.OtpField', {
 *         renderTo: Ext.getBody(),
 *         fieldLabel: 'Verification code',
 *         name: 'code',
 *         length: 6,
 *         allowBlank: false,
 *         listeners: {
 *             complete: function (field, value) { Ext.toast('Code ' + value); }
 *         }
 *     });
 *
 * The value is the string of entered characters. It takes part in forms like any other field
 * (`getValues()`, `reset()`, dirty tracking, `bind`). All our configs, methods and events live in
 * {@link NC.otp.OtpFieldMixin} and are the same in the Modern toolkit; this class only provides
 * the Classic field plumbing.
 *
 * `inputEl` is a hidden input that holds the value (so it also posts with a standard form
 * submit); the boxes are separate inputs.
 */
Ext.define('NC.otp.OtpField', {
    extend: 'Ext.form.field.Base',
    xtype: 'nc-otpfield',

    mixins: [
        'NC.otp.OtpFieldMixin'
    ],

    requires: [
        'NC.otp.OtpUtil'
    ],

    /**
     * @cfg {Boolean} allowBlank
     * `false` to require every box to be filled.
     */
    allowBlank: true,

    /**
     * @cfg {String} blankText
     * Error shown when a required field is empty.
     */
    blankText: 'This field is required',

    requiredCls: Ext.baseCSSPrefix + 'form-required-field',

    cls: 'nc-otpfield',

    fieldSubTpl: [
        '<input id="{id}" data-ref="inputEl" type="hidden" name="{name}" value="{valueEnc}">',
        '<div class="nc-otp-boxes" role="group" aria-labelledby="{cmpId}-labelEl">{boxes}</div>',
        {
            compiled: true
        }
    ],

    initComponent: function () {
        var me = this;

        me.callParent();

        if (!me.allowBlank) {
            me.addCls(me.requiredCls);
        }
    },

    getSubTplData: function (fieldData) {
        var me = this,
            data = me.callParent([fieldData]);

        data.valueEnc = Ext.String.htmlEncode(data.value);
        data.boxes = me.getOtpMarkup();

        return data;
    },

    afterRender: function () {
        var me = this;

        me.callParent();

        me.boxesEl = me.el.down('.nc-otp-boxes');
        me.initOtp();
    },

    getOtpRoot: function () {
        return this.boxesEl;
    },

    isOtpDisabled: function () {
        return !!this.disabled;
    },

    isOtpReadOnly: function () {
        return !!this.readOnly;
    },

    // The user changed a box: store the characters in the hidden input and check for a change.
    commitOtp: function () {
        var me = this;

        // native: Ext JS has no setter for the value of an input element (Base does the same)
        me.inputEl.dom.value = me.getOtpString();
        me.checkChange();
    },

    valueToRaw: function (value) {
        return NC.otp.OtpUtil.sanitize(value, this.getCharType());
    },

    setRawValue: function (value) {
        var me = this,
            chars = NC.otp.OtpUtil.toChars(value, me.getLength(), me.getCharType());

        value = me.callParent([chars.join('')]);

        me.otpChars = chars;
        me.syncBoxes();

        return value;
    },

    onChange: function (newVal, oldVal) {
        var me = this;

        me.callParent([newVal, oldVal]);
        me.otpValueChanged(newVal);
    },

    getErrors: function (value) {
        var me = this,
            errors = me.callParent(arguments),
            length = me.getLength();

        value = Ext.valueFrom(arguments.length ? value : me.getValue(), '');

        if (!me.allowBlank) {
            if (!value.length) {
                errors.push(me.blankText);
            }
            else if (value.length < length) {
                errors.push(Ext.String.format(me.incompleteMessage, length));
            }
        }

        return errors;
    },

    onDisable: function () {
        this.callParent();
        this.syncBoxes();
    },

    onEnable: function () {
        this.callParent();
        this.syncBoxes();
    },

    setReadOnly: function (readOnly) {
        this.callParent([readOnly]);
        this.syncBoxes();
    },

    privates: {
        // Private in Ext.form.field.Base, so it has to be overridden as private too.
        getFocusEl: function () {
            var me = this,
                box = me.otpReady && me.getBoxDom(me.getOtpFocusIndex());

            // A flyweight is enough: the caller focuses it right away.
            return box ? Ext.fly(box) : me.callParent();
        }
    },

    doDestroy: function () {
        this.destroyOtp();
        this.callParent();
    }
});
