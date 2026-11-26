/**
 * Controller of the demo shell. Routes `#<slug>` to the matching demo in the card area;
 * unknown slugs (and slugs without a demo yet) fall back to `#home`.
 */
Ext.define('MyApp.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    routes: {
        ':slug': 'onRoute'
    },

    onRoute: function (slug) {
        var me = this,
            vm = me.getViewModel(),
            cards = me.lookup('cards'),
            record = vm.getStore('demos').findRecord('slug', slug, 0, false, false, true),
            card;

        if (!record || Ext.isEmpty(record.get('viewXtype'))) {
            me.redirectTo('home', { replace: true });
            return;
        }

        // Demo views are created the first time they are shown.
        card = cards.getComponent(slug) || cards.add({
            xtype: record.get('viewXtype'),
            itemId: slug
        });

        cards.setActiveItem(card);
        vm.set('current', record);
    },

    onNavSelect: function (sender, selected) {
        var record = Ext.Array.from(selected)[0];

        if (record) {
            this.redirectTo(record.get('slug'));
        }
    }
});
