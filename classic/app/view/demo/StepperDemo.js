/**
 * Demo page of NC.stepper.Stepper (Classic). The Modern app has the same sections so both
 * toolkits can be compared side by side.
 */
Ext.define('MyApp.view.demo.StepperDemo', {
    extend: 'Ext.panel.Panel',
    xtype: 'demo-stepper',

    requires: [
        'Ext.button.Button',
        'Ext.form.Panel',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Number',
        'Ext.form.field.Text',
        'Ext.toolbar.Toolbar',
        'NC.stepper.Stepper',

        'MyApp.view.demo.StepperDemoController',
        'MyApp.view.demo.StepperDemoModel'
    ],

    controller: 'stepperdemo',
    viewModel: 'stepperdemo',

    title: 'Stepper / Wizard',
    scrollable: true,
    bodyPadding: 16,

    initComponent: function () {
        var me = this;

        me.items = [
            me.section('Signup wizard (linear, indicator on top, forms are validated on Next)',
                me.wizard()),
            me.section('Non-linear: any step can be picked', me.nonLinear()),
            me.section('Indicator on the left, with icons', me.leftIndicator()),
            me.section('beforestepchange can cancel a change', me.cancelDemo())
        ];

        me.callParent();
    },

    section: function (title, items) {
        return {
            xtype: 'panel',
            title: title,
            userCls: 'stepper-demo-section',
            bodyPadding: 12,
            items: items
        };
    },

    /** Common listeners: every stepper event goes to the event log. */
    logListeners: function () {
        return {
            beforestepchange: 'onBeforeStepChange',
            stepchange: 'onStepChange',
            finish: 'onFinish'
        };
    },

    /** A step with a title and some text. */
    textStep: function (title, description, extra) {
        return Ext.apply({
            xtype: 'panel',
            bodyPadding: 16,
            step: {
                title: title,
                description: description
            },
            html: '<p>Content of <b>' + Ext.String.htmlEncode(title) + '</b>.</p>'
        }, extra);
    },

    wizard: function () {
        return [{
            xtype: 'toolbar',
            items: [{
                text: 'Reset',
                handler: 'onReset'
            }, {
                text: 'Error on step 2',
                handler: 'onSetError'
            }, {
                text: 'Clear error',
                handler: 'onClearError'
            }, {
                text: 'Mark all complete',
                handler: 'onCompleteAll'
            }, '->', {
                xtype: 'numberfield',
                fieldLabel: 'activeStep (bound)',
                labelWidth: 120,
                width: 200,
                minValue: 0,
                maxValue: 3,
                bind: '{activeStep}'
            }]
        }, {
            xtype: 'nc-stepper',
            reference: 'wizard',
            height: 400,
            bind: {
                activeStep: '{activeStep}'
            },
            listeners: this.logListeners(),
            items: [{
                xtype: 'form',
                step: {
                    title: 'Account',
                    description: 'Your login'
                },
                bodyPadding: 16,
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    fieldLabel: 'Username',
                    allowBlank: false,
                    bind: '{username}'
                }, {
                    fieldLabel: 'Email',
                    vtype: 'email',
                    allowBlank: false,
                    bind: '{email}'
                }, {
                    fieldLabel: 'Password',
                    inputType: 'password',
                    minLength: 6,
                    allowBlank: false,
                    bind: '{password}'
                }]
            }, {
                xtype: 'form',
                step: {
                    title: 'Profile',
                    description: 'About you'
                },
                bodyPadding: 16,
                defaultType: 'textfield',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    fieldLabel: 'Full name',
                    allowBlank: false,
                    bind: '{fullName}'
                }, {
                    fieldLabel: 'City',
                    bind: '{city}'
                }]
            }, {
                xtype: 'panel',
                step: {
                    title: 'Preferences',
                    description: 'Skip it if you like',
                    optional: true
                },
                bodyPadding: 16,
                items: [{
                    xtype: 'checkbox',
                    boxLabel: 'Send me news',
                    bind: '{news}'
                }]
            }, {
                xtype: 'component',
                step: {
                    title: 'Review'
                },
                padding: 16,
                bind: {
                    html: '<p><b>Username:</b> {username:htmlEncode}</p>' +
                        '<p><b>Email:</b> {email:htmlEncode}</p>' +
                        '<p><b>Name:</b> {fullName:htmlEncode}</p>' +
                        '<p><b>City:</b> {city:htmlEncode}</p>' +
                        '<p><b>News:</b> {news}</p>'
                }
            }]
        }, {
            xtype: 'component',
            padding: '12 0 0 0',
            bind: {
                html: 'Bound value <code>activeStep</code> = <b>{activeStep}</b>. Type a number ' +
                    'above to go to a step: it is refused for a step you cannot reach yet, and ' +
                    'the field goes back to the real step.'
            }
        }];
    },

    nonLinear: function () {
        var me = this;

        return [{
            xtype: 'nc-stepper',
            height: 220,
            linear: false,
            listeners: me.logListeners(),
            items: [
                me.textStep('First', 'Anything goes'),
                me.textStep('Second', 'Jump here'),
                me.textStep('Third', 'Or here')
            ]
        }];
    },

    leftIndicator: function () {
        var me = this;

        return [{
            xtype: 'nc-stepper',
            height: 260,
            indicatorPosition: 'left',
            listeners: me.logListeners(),
            items: [
                me.textStep('Profile', 'Who you are', {
                    step: { title: 'Profile', description: 'Who you are', iconCls: 'x-fa fa-user' }
                }),
                me.textStep('Settings', 'How it works', {
                    step: { title: 'Settings', description: 'How it works', iconCls: 'x-fa fa-cog' }
                }),
                me.textStep('Done', 'All set', {
                    step: { title: 'Done', description: 'All set', iconCls: 'x-fa fa-flag' }
                })
            ]
        }];
    },

    cancelDemo: function () {
        var me = this;

        return [{
            xtype: 'checkbox',
            boxLabel: 'Block leaving the first step (the listener returns false)',
            bind: '{blockLeaving}'
        }, {
            xtype: 'nc-stepper',
            height: 220,
            linear: false,
            listeners: {
                beforestepchange: 'onCancelBeforeStepChange',
                stepchange: 'onStepChange',
                finish: 'onFinish'
            },
            items: [
                me.textStep('One', 'Try to leave'),
                me.textStep('Two', 'Reachable when allowed'),
                me.textStep('Three', 'The last one')
            ]
        }];
    }
});
