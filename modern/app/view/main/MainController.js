/**
 * Controller of the demo shell. Routes `#<slug>` to the matching demo in the card area;
 * unknown slugs (and slugs without a demo yet) fall back to `#home`.
 *
 * On narrow screens the navigation list is hidden and opened with the menu button.
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
            this.showNav(false);
        }
    },

    onMenuTap: function () {
        this.showNav(this.lookup('nav').getHidden());
    },

    privates: {
        /**
         * Shows or hides the navigation list. The menu button is only visible on narrow
         * screens, where an open list takes the place of the content.
         */
        showNav: function (show) {
            var narrow = !this.lookup('menuButton').getHidden();

            if (narrow) {
                this.lookup('nav').setHidden(!show);
                this.lookup('content').setHidden(show);
            }
        }
    }
});
