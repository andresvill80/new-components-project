/**
 * View model of the demo shell: title, the demo store, the chained stores used by the
 * navigation and the home page, and the currently shown demo.
 */
Ext.define('MyApp.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.main',

    requires: [
        'NC.Version',
        'MyApp.store.Demos'
    ],

    data: {
        name: 'new-components demo (Classic)',
        current: null
    },

    formulas: {
        version: function () {
            return NC.Version.version;
        }
    },

    stores: {
        demos: {
            type: 'demos'
        },

        // Entries that have a demo view (plus home): the navigation list.
        navDemos: {
            source: '{demos}',
            filters: [{
                filterFn: function (record) {
                    return !Ext.isEmpty(record.get('viewXtype'));
                }
            }]
        },

        // Everything except home: the planned components shown on the home page.
        plannedDemos: {
            source: '{demos}',
            filters: [{
                property: 'slug',
                operator: '!=',
                value: 'home'
            }]
        }
    }
});
