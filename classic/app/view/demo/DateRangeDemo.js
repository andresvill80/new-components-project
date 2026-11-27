/**
 * Demo page of NC.daterange.DateRangeField and NC.daterange.RangeCalendar (Classic). The Modern
 * app has the same sections so both toolkits can be compared side by side.
 */
Ext.define('MyApp.view.demo.DateRangeDemo', {
    extend: 'Ext.panel.Panel',
    xtype: 'demo-daterange',

    requires: [
        'Ext.button.Button',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.toolbar.Toolbar',
        'NC.daterange.DateRangeField',
        'NC.daterange.DateRangeUtil',
        'NC.daterange.RangeCalendar',

        'MyApp.view.demo.DateRangeDemoController',
        'MyApp.view.demo.DateRangeDemoModel'
    ],

    controller: 'daterangedemo',
    viewModel: 'daterangedemo',

    title: 'Date Range Field',
    scrollable: true,
    bodyPadding: 16,

    initComponent: function () {
        var me = this;

        me.items = [
            me.section('Basic field, bound value', me.basic()),
            me.section('Limits: min / max, at most 14 days, at least two days', me.limits()),
            me.section('Format, separator and custom presets', me.custom()),
            me.section('Inside a form: startName / endName and a single name', me.formDemo()),
            me.section('Methods', me.methods()),
            me.section('The calendar alone (3 months, week starts on Monday)', me.calendar())
        ];

        me.callParent();
    },

    section: function (title, items) {
        return {
            xtype: 'panel',
            title: title,
            userCls: 'daterange-demo-section',
            bodyPadding: 12,
            items: items
        };
    },

    hint: function (text) {
        return {
            xtype: 'component',
            cls: 'daterange-demo-hint',
            html: text
        };
    },

    /** A date range field whose events go to the event log. */
    range: function (config) {
        return Ext.apply({
            xtype: 'nc-daterangefield',
            labelWidth: 140,
            width: 520,
            listeners: {
                change: 'onRangeChange',
                rangeselect: 'onRangeSelect'
            }
        }, config);
    },

    basic: function () {
        var me = this;

        return [
            me.hint('Pick two days in the calendar, or type <code>start – end</code>. ' +
                'The presets on the left fill the range with one click.'),
            me.range({
                fieldLabel: 'Period',
                emptyText: 'Select a period',
                bind: '{range}'
            }),
            {
                xtype: 'component',
                padding: '8 0 0 0',
                bind: {
                    html: 'Bound value: <code>{rangeText}</code>'
                }
            }
        ];
    },

    limits: function () {
        var util = NC.daterange.DateRangeUtil,
            today = util.today(),
            me = this;

        return [
            me.hint('Only the next 60 days can be picked (earlier days are disabled), and the ' +
                'range can have at most 14 days: after the first click the days that would make ' +
                'it longer are disabled. Typed ranges that break a rule show an error.'),
            me.range({
                fieldLabel: 'Next 60 days, max 14',
                minDate: today,
                maxDate: util.addDays(today, 60),
                maxSpan: 14
            }),
            me.range({
                fieldLabel: 'At least two days',
                allowSameDay: false,
                monthsShown: 1
            })
        ];
    },

    custom: function () {
        var util = NC.daterange.DateRangeUtil,
            me = this;

        return [
            me.range({
                fieldLabel: 'd/m/Y, " to "',
                format: 'd/m/Y',
                separator: ' to ',
                startDay: 1,
                presets: [{
                    text: 'Next 7 days',
                    getRange: function () {
                        var today = util.today();

                        return { start: today, end: util.addDays(today, 6) };
                    }
                }, {
                    text: 'Next 30 days',
                    getRange: function () {
                        var today = util.today();

                        return { start: today, end: util.addDays(today, 29) };
                    }
                }, {
                    text: 'Last 90 days',
                    getRange: function () {
                        var today = util.today();

                        return { start: util.addDays(today, -89), end: today };
                    }
                }]
            }),
            me.range({
                fieldLabel: 'No presets',
                showPresets: false
            }),
            me.range({
                fieldLabel: 'Prefilled',
                value: {
                    start: util.addDays(util.today(), -3),
                    end: util.addDays(util.today(), 3)
                }
            }),
            me.range({
                fieldLabel: 'Disabled',
                disabled: true,
                value: [util.addDays(util.today(), -1), util.today()]
            })
        ];
    },

    formDemo: function () {
        var me = this;

        return [
            me.hint('The first field is submitted as two parameters, <code>from</code> and ' +
                '<code>to</code>; the second as one, <code>period</code>, with ' +
                '<code>start|end</code>. Dates use <code>submitFormat</code> (Y-m-d).'),
            {
                xtype: 'form',
                reference: 'form',
                items: [
                    me.range({
                        fieldLabel: 'Stay (from / to)',
                        startName: 'from',
                        endName: 'to',
                        allowBlank: false
                    }),
                    me.range({
                        name: 'period',
                        fieldLabel: 'Period (one name)',
                        submitFormat: 'd/m/Y',
                        allowBlank: false
                    }),
                    {
                        xtype: 'textfield',
                        name: 'guest',
                        fieldLabel: 'Guest',
                        labelWidth: 140,
                        width: 520,
                        allowBlank: false
                    }
                ],
                buttons: [{
                    text: 'Reset',
                    handler: 'onReset'
                }, {
                    text: 'Submit',
                    handler: 'onSubmit'
                }]
            },
            {
                xtype: 'component',
                reference: 'submitted',
                padding: '8 0 0 0'
            }
        ];
    },

    methods: function () {
        var me = this;

        return [
            {
                xtype: 'toolbar',
                items: [{
                    text: 'setValue([today, +6 days])',
                    handler: 'onSetNextWeek'
                }, {
                    text: "setValue('01/03/2026 - 15/03/2026')",
                    handler: 'onSetText'
                }, {
                    text: 'setValue(null)',
                    handler: 'onClear'
                }]
            },
            me.range({
                reference: 'methods',
                fieldLabel: 'Controlled',
                format: 'd/m/Y',
                separator: ' - '
            })
        ];
    },

    calendar: function () {
        return [{
            xtype: 'nc-rangecalendar',
            monthsShown: 3,
            startDay: 1,
            listeners: {
                rangeselect: 'onRangeSelect'
            }
        }];
    }
});
