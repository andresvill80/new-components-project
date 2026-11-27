/**
 * Data of the skeleton demo: the animation switch and the store that fills the form.
 */
Ext.define('MyApp.view.demo.SkeletonDemoModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.skeletondemo',

    requires: [
        'MyApp.store.People'
    ],

    data: {
        animated: true
    },

    stores: {
        // Followed by the skeleton plugin of the form, which has no store of its own.
        profile: {
            type: 'people',
            storeLabel: 'profile (form)'
        }
    }
});
