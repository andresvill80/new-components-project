/**
 * Handlers of the date range demo: print the events to the event log, submit and reset the
 * form, and call the methods of the field from buttons.
 */
Ext.define('MyApp.view.demo.DateRangeDemoController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.daterangedemo',

    requires: [
        'MyApp.view.demo.EventLog',
        'NC.daterange.DateRangeUtil'
    ],

    onRangeChange: function (field, value, oldValue) {
        MyApp.view.demo.EventLog.log('change', [field, value, oldValue]);
    },

    onRangeSelect: function (field, start, end) {
        MyApp.view.demo.EventLog.log('rangeselect', [field, start, end]);
    },

    onSubmit: function () {
        var form = this.lookup('form').getForm(),
            values;

        if (form.isValid()) {
            values = form.getValues();

            MyApp.view.demo.EventLog.log('submit', [values]);
            this.lookup('submitted').update('Submitted: <code>' +
                Ext.String.htmlEncode(Ext.encode(values)) + '</code>');
        }
        else {
            MyApp.view.demo.EventLog.log('submit', ['invalid']);
            this.lookup('submitted').update('The form is not valid.');
        }
    },

    onReset: function () {
        this.lookup('form').getForm().reset();
        this.lookup('submitted').update('');
    },

    onSetNextWeek: function () {
        var util = NC.daterange.DateRangeUtil,
            today = util.today();

        this.lookup('methods').setValue([today, util.addDays(today, 6)]);
    },

    onSetText: function () {
        this.lookup('methods').setValue('01/03/2026 - 15/03/2026');
    },

    onClear: function () {
        this.lookup('methods').setValue(null);
    }
});
