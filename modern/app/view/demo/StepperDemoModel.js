/**
 * Data of the stepper demo: the values typed in the signup wizard, the step number that is
 * bound to the wizard, and the switch that blocks leaving the first step of one stepper.
 */
Ext.define('MyApp.view.demo.StepperDemoModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.stepperdemo',

    data: {
        activeStep: 0,
        username: '',
        email: '',
        password: '',
        fullName: '',
        city: '',
        news: false,
        blockLeaving: false
    }
});
