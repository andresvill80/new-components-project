/**
 * Shows a skeleton over a Modern grid, list or form while its store loads.
 *
 *     {
 *         xtype: 'grid',
 *         store: store,
 *         plugins: {
 *             'nc-skeleton': { minDisplayTime: 400 }
 *         },
 *         columns: [...]
 *     }
 *
 * All configs and methods live in {@link NC.skeleton.SkeletonPluginBase} and are the same in
 * the Classic toolkit, where the plugin is declared with Classic's own syntax
 * (`plugins: [{ ptype: 'nc-skeleton' }]`). This class only provides the Modern details.
 *
 * Forms have no store: give the plugin a `store` to follow, or call `show()` and `hide()`.
 */
Ext.define('NC.skeleton.SkeletonPlugin', {
    extend: 'NC.skeleton.SkeletonPluginBase',
    alias: 'plugin.nc-skeleton',

    getHostStore: function (host) {
        return host.isDataView ? host.getStore() : null;
    },

    getDefaultPreset: function (host) {
        if (host.isGrid) {
            return 'table';
        }
        if (host.isDataView) {
            return 'list';
        }
        return host.isFormPanel ? 'form' : null;
    },

    getOverlayTarget: function (host) {
        return host.bodyElement || host.element;
    },

    // Leave the column headers of a grid uncovered, wherever they sit inside the body.
    getOverlayTop: function (host, target) {
        var headerEl;

        if (!host.isGrid) {
            return 0;
        }

        headerEl = host.getHeaderContainer().element;

        return Math.max(0, headerEl.getY() + headerEl.getHeight() - target.getY());
    },

    getHostEl: function (host) {
        return host.element;
    },

    // A data view masks itself while it loads only when it has a loading text.
    disableHostMask: function (host) {
        if (host.isDataView) {
            this.savedLoadingText = host.getLoadingText();
            host.setLoadingText(null);
        }
    },

    restoreHostMask: function (host) {
        if (host.isDataView && !host.destroyed && !host.destroying) {
            host.setLoadingText(this.savedLoadingText);
        }
    },

    // A data view refreshes whenever it is given another store.
    bindHostStoreChange: function (host) {
        return host.isDataView ? host.on('refresh', 'onHostStoreChange', this, {
            destroyable: true
        }) : null;
    },

    isHostReady: function (host) {
        return host.isPainted();
    },

    getHostReadyEvent: function () {
        return 'painted';
    }
});
