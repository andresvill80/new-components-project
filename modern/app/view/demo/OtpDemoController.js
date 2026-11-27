/**
 * Handlers of the OTP demo: print the field events to the event log, submit and reset the form,
 * and call the methods of the field from buttons.
 */
Ext.define('MyApp.view.demo.OtpDemoController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.otpdemo',

    requires: [
        'MyApp.view.demo.EventLog'
    ],

    onOtpChange: function (field, value, oldValue) {
        MyApp.view.demo.EventLog.log('change', [field, value, oldValue]);
    },

    onOtpComplete: function (field, value) {
        MyApp.view.demo.EventLog.log('complete', [field, value]);
    },

    onSubmit: function () {
        var form = this.lookup('form');

        if (form.validate()) {
            MyApp.view.demo.EventLog.log('submit', [form.getValues()]);
        }
        else {
            MyApp.view.demo.EventLog.log('submit', ['invalid']);
        }
    },

    onReset: function () {
        this.lookup('form').reset();
    },

    onSetValue: function () {
        this.lookup('methods').setValue('123456');
    },

    onClear: function () {
        this.lookup('methods').clear();
    },

    onFocusBox: function () {
        this.lookup('methods').focusBox(3);
    }
});
