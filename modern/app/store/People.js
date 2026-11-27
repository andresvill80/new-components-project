/**
 * People loaded through the slow demo proxy. Logs its load events to the event log.
 */
Ext.define('MyApp.store.People', {
    extend: 'Ext.data.Store',
    alias: 'store.people',

    requires: [
        'MyApp.proxy.Slow',
        'MyApp.view.demo.EventLog'
    ],

    fields: ['name', 'email', 'city'],

    proxy: {
        type: 'slow',
        url: 'resources/data/people.json',
        reader: {
            type: 'json',
            rootProperty: 'people'
        }
    },

    /**
     * @cfg {String} storeLabel
     * Name shown in the event log.
     */
    storeLabel: 'people',

    // Class-level listeners, so the first load (autoLoad) is logged too. They are functions,
    // not method names: a store that lives in a view model resolves method names against the
    // view's controller instead of itself.
    listeners: {
        beforeload: function (store) {
            MyApp.view.demo.EventLog.log('beforeload', [store.storeLabel]);
        },

        load: function (store, records, successful) {
            MyApp.view.demo.EventLog.log('load', [store.storeLabel, successful, records ? records.length : 0]);
        }
    }
});
