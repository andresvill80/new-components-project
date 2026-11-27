/**
 * Handlers of the skeleton demo: reload the demo stores (also to fail) and drive the plugin.
 */
Ext.define('MyApp.view.demo.SkeletonDemoController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.skeletondemo',

    requires: [
        'MyApp.store.People'
    ],

    replacedCount: 0,

    onReloadGrid: function () {
        this.lookup('hostGrid').getStore().load();
    },

    onFailGrid: function () {
        var store = this.lookup('hostGrid').getStore();

        store.getProxy().setFailNext(true);
        store.load();
    },

    // Gives the grid another store that is already loading: the plugin must follow it.
    onReplaceGridStore: function () {
        var me = this;

        me.replacedCount++;
        me.lookup('hostGrid').setStore(Ext.create('MyApp.store.People', {
            autoLoad: true,
            storeLabel: Ext.String.format('grid (new store {0})', me.replacedCount)
        }));
    },

    onReloadList: function () {
        this.lookup('hostList').getStore().load();
    },

    // The form has no store, so the plugin follows the store of the view model.
    onProfileFormReady: function (form) {
        var store = this.getViewModel().getStore('profile');

        form.findPlugin('nc-skeleton').setStore(store);
        store.on('load', this.onProfileLoad, this);
        store.load();
    },

    onProfileLoad: function (store, records, successful) {
        if (successful && records.length) {
            this.lookup('profileForm').loadRecord(records[0]);
        }
    },

    onReloadProfile: function () {
        this.getViewModel().getStore('profile').load();
    },

    onShowManual: function () {
        this.lookup('manualPanel').findPlugin('nc-skeleton').show();
    },

    onHideManual: function () {
        this.lookup('manualPanel').findPlugin('nc-skeleton').hide();
    }
});
