/**
 * Data of the OTP demo: the code of the form, bound to the field so the page can show it.
 */
Ext.define('MyApp.view.demo.OtpDemoModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.otpdemo',

    data: {
        code: ''
    }
});
