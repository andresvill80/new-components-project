/**
 * Handlers of the avatar demo: print events to the event log and change the demo data.
 */
Ext.define('MyApp.view.demo.AvatarDemoController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.avatardemo',

    requires: [
        'MyApp.view.demo.EventLog'
    ],

    // Pictures cycled by the "Change picture" button; the second one does not exist.
    sources: ['resources/avatars/user3.svg', 'resources/avatars/missing.png', null],

    sourceIndex: 0,

    addedCount: 0,

    onSelect: function (avatar) {
        MyApp.view.demo.EventLog.log('select', [avatar]);
    },

    onAvatarSelect: function (group, data) {
        MyApp.view.demo.EventLog.log('avatarselect', [group, data]);
    },

    onOverflowSelect: function (group, hiddenItems) {
        MyApp.view.demo.EventLog.log('overflowselect', [group, hiddenItems]);
    },

    onChangePicture: function () {
        var me = this;

        me.sourceIndex = (me.sourceIndex + 1) % me.sources.length;
        me.lookup('pictureAvatar').setSrc(me.sources[me.sourceIndex]);
    },

    onAddPerson: function () {
        var me = this;

        me.addedCount++;
        me.getViewModel().getStore('people').add({
            name: Ext.String.format('New Person {0}', me.addedCount)
        });
    },

    onRemovePerson: function () {
        var store = this.getViewModel().getStore('people');

        store.removeAt(store.getCount() - 1);
    }
});
