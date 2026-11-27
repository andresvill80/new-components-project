/**
 * Shows a skeleton over a Classic grid, data view or form while its store loads.
 *
 *     {
 *         xtype: 'grid',
 *         store: store,
 *         plugins: [{ ptype: 'nc-skeleton', minDisplayTime: 400 }],
 *         columns: [...]
 *     }
 *
 * All configs and methods live in {@link NC.skeleton.SkeletonPluginBase} and are the same in
 * the Modern toolkit, where the plugin is declared with Modern's own syntax
 * (`plugins: { 'nc-skeleton': {...} }`). This class only provides the Classic details.
 *
 * Forms have no store: give the plugin a `store` to follow, or call `show()` and `hide()`.
 */
Ext.define('NC.skeleton.SkeletonPlugin', {
    extend: 'NC.skeleton.SkeletonPluginBase',
    alias: 'plugin.nc-skeleton',

    /**
     * @property {Object} savedMask
     * What was changed on the host's view to switch its load mask off.
     * @private
     */

    getHostStore: function (host) {
        return host.getStore ? host.getStore() : null;
    },

    getDefaultPreset: function (host) {
        if (host.isXType('tablepanel')) {
            return 'table';
        }
        if (host.isDataView) {
            return 'list';
        }
        return host.isXType('form') ? 'form' : null;
    },

    // A panel's `body` holds only its content; the column headers of a grid are docked
    // outside of it, so they stay uncovered.
    getOverlayTarget: function (host) {
        return host.body || host.el;
    },

    // A data view is its own scrolling element: keep the overlay in view when scrolled.
    getOverlayTop: function (host, target) {
        return target === host.el ? target.getScroll().top : 0;
    },

    getHostEl: function (host) {
        return host.el;
    },

    // The view creates its mask when it renders, so switching `loadMask` off before that is
    // enough; if the mask exists already, it is unbound from the store.
    disableHostMask: function (host) {
        var view = host.isDataView ? host : (host.getView && host.getView()),
            mask;

        if (!view) {
            return;
        }

        mask = view.loadMask;
        this.savedMask = {
            view: view,
            mask: mask
        };

        if (mask && mask.isComponent) {
            mask.bindStore(null);
        }
        else {
            view.loadMask = false;
        }
    },

    restoreHostMask: function () {
        var saved = this.savedMask,
            view = saved && saved.view;

        this.savedMask = null;

        if (!view || view.destroyed || view.destroying) {
            return;
        }

        if (saved.mask && saved.mask.isComponent) {
            saved.mask.bindStore(view.getStore());
        }
        else {
            view.loadMask = saved.mask;
        }
    },

    bindHostStoreChange: function (host) {
        return host.on(host.isXType('tablepanel') ? 'reconfigure' : 'refresh', 'onHostStoreChange', this, {
            destroyable: true
        });
    },

    isHostReady: function (host) {
        return host.rendered;
    },

    getHostReadyEvent: function () {
        return 'afterrender';
    }
});
