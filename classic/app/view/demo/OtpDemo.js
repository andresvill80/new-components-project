/**
 * Demo page of NC.otp.OtpField (Classic). The Modern app has the same sections so both
 * toolkits can be compared side by side.
 */
Ext.define('MyApp.view.demo.OtpDemo', {
    extend: 'Ext.panel.Panel',
    xtype: 'demo-otp',

    requires: [
        'Ext.button.Button',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.toolbar.Toolbar',
        'NC.otp.OtpField',

        'MyApp.view.demo.OtpDemoController',
        'MyApp.view.demo.OtpDemoModel'
    ],

    controller: 'otpdemo',
    viewModel: 'otpdemo',

    title: 'OTP / PIN Field',
    scrollable: true,
    bodyPadding: 16,

    initComponent: function () {
        var me = this;

        me.items = [
            me.section('Kinds of field (change and complete go to the event log)', me.kinds()),
            me.section('Inside a form: submit, reset, binding', me.formDemo()),
            me.section('Prefilled, disabled and read only', me.states()),
            me.section('Methods', me.methods())
        ];

        me.callParent();
    },

    section: function (title, items) {
        return {
            xtype: 'panel',
            title: title,
            userCls: 'otp-demo-section',
            bodyPadding: 12,
            items: items
        };
    },

    hint: function (text) {
        return {
            xtype: 'component',
            cls: 'otp-demo-hint',
            html: text
        };
    },

    /** An OTP field whose events go to the event log. */
    otp: function (config) {
        return Ext.apply({
            xtype: 'nc-otpfield',
            labelAlign: 'top',
            listeners: {
                change: 'onOtpChange',
                complete: 'onOtpComplete'
            }
        }, config);
    },

    kinds: function () {
        var me = this;

        return [
            me.hint('Type digits (they advance by themselves), use Backspace, the arrow keys, ' +
                'Home and End, or paste <code>12 34-56</code> into the first box.'),
            me.otp({
                fieldLabel: '6-digit numeric code',
                length: 6
            }),
            me.otp({
                fieldLabel: '4-digit masked PIN',
                length: 4,
                masked: true
            }),
            me.otp({
                fieldLabel: '8-character alphanumeric code, separator after 4',
                length: 8,
                charType: 'alphanumeric',
                separatorAfter: 4
            })
        ];
    },

    formDemo: function () {
        var me = this;

        return [
            me.hint('The code is required: every box must be filled. Press Submit with an ' +
                'incomplete code to see the error.'),
            {
                xtype: 'form',
                reference: 'form',
                items: [
                    {
                        xtype: 'textfield',
                        name: 'user',
                        fieldLabel: 'User',
                        allowBlank: false
                    },
                    me.otp({
                        name: 'code',
                        fieldLabel: 'Verification code',
                        allowBlank: false,
                        bind: '{code}'
                    })
                ],
                buttons: [
                    {
                        text: 'Reset',
                        handler: 'onReset'
                    },
                    {
                        text: 'Submit',
                        handler: 'onSubmit'
                    }
                ]
            },
            {
                xtype: 'component',
                bind: {
                    html: 'Bound value: <code>{code:htmlEncode}</code>'
                }
            }
        ];
    },

    states: function () {
        var me = this;

        return [
            me.otp({
                fieldLabel: 'Prefilled',
                value: '482915'
            }),
            me.otp({
                fieldLabel: 'Prefilled and masked',
                value: '2468',
                length: 4,
                masked: true
            }),
            me.otp({
                fieldLabel: 'Disabled',
                value: '123456',
                disabled: true
            }),
            me.otp({
                fieldLabel: 'Read only',
                value: '123456',
                readOnly: true
            })
        ];
    },

    methods: function () {
        var me = this;

        return [
            {
                xtype: 'toolbar',
                items: [
                    {
                        text: "setValue('123456')",
                        handler: 'onSetValue'
                    },
                    {
                        text: 'clear()',
                        handler: 'onClear'
                    },
                    {
                        text: 'focusBox(3)',
                        handler: 'onFocusBox'
                    }
                ]
            },
            me.otp({
                reference: 'methods',
                fieldLabel: 'Controlled from the buttons'
            })
        ];
    }
});
