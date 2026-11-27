/**
 * Handlers of the stepper demo: print the stepper events to the event log, cancel step changes
 * on request, and drive the signup wizard from buttons.
 */
Ext.define('MyApp.view.demo.StepperDemoController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.stepperdemo',

    requires: [
        'MyApp.view.demo.EventLog'
    ],

    onBeforeStepChange: function (stepper, newIndex, oldIndex) {
        MyApp.view.demo.EventLog.log('beforestepchange', [stepper, newIndex, oldIndex]);
    },

    // Cancels every change that leaves the first step while the switch is on.
    onCancelBeforeStepChange: function (stepper, newIndex, oldIndex) {
        var block = this.getViewModel().get('blockLeaving') && oldIndex === 0;

        MyApp.view.demo.EventLog.log('beforestepchange',
            [stepper, newIndex, oldIndex, block ? 'cancelled' : 'allowed']);

        return !block;
    },

    onStepChange: function (stepper, newIndex, oldIndex) {
        MyApp.view.demo.EventLog.log('stepchange', [stepper, newIndex, oldIndex]);
    },

    onFinish: function (stepper) {
        MyApp.view.demo.EventLog.log('finish', [stepper]);
    },

    onReset: function () {
        this.lookup('wizard').reset();
    },

    onSetError: function () {
        this.lookup('wizard').setStepError(1, 'Rejected by the server');
    },

    onClearError: function () {
        this.lookup('wizard').setStepError(1, null);
    },

    onCompleteAll: function () {
        var wizard = this.lookup('wizard'),
            i;

        for (i = 0; i < wizard.getStepCount(); i++) {
            wizard.setStepComplete(i, true);
        }
    }
});
