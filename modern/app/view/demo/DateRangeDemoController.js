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

    // Modern's form.getSubmitValues() has one entry per field, so the field that is submitted
    // as two parameters adds them with getSubmitData() (Classic's form does it by itself).
    onSubmit: function () {
        var form = this.lookup('form'),
            values;

        if (form.validate()) {
            values = Ext.apply(form.getSubmitValues(), this.lookup('stay').getSubmitData());

            MyApp.view.demo.EventLog.log('submit', [values]);
            this.lookup('submitted').setHtml('Submitted: <code>' +
                Ext.String.htmlEncode(Ext.encode(values)) + '</code>');
        }
        else {
            MyApp.view.demo.EventLog.log('submit', ['invalid']);
            this.lookup('submitted').setHtml('The form is not valid.');
        }
    },

    onReset: function () {
        this.lookup('form').reset(true);
        this.lookup('submitted').setHtml('');
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
