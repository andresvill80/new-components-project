/**
 * Shared logic of {@link NC.skeleton.SkeletonPlugin} for both toolkits: shows a skeleton over
 * its host while a store loads and removes it when the load ends, successfully or not.
 *
 * - The store is the plugin's own `store` config or, by default, the host's store. A store
 *   that is already loading when the plugin binds is handled, and so is a host that gets
 *   another store later.
 * - The overlay stays at least {@link #cfg-minDisplayTime} ms, so fast loads do not flicker.
 * - The host's own load mask is switched off while the plugin is attached.
 * - Everything the plugin created (listeners, timer, overlay, ARIA attribute) is removed by
 *   {@link #destroy}.
 *
 * The toolkit class implements the small `get...` / `...HostMask` hooks at the end.
 *
 * @abstract
 */
Ext.define('NC.skeleton.SkeletonPluginBase', {
    extend: 'Ext.plugin.Abstract',

    requires: [
        'NC.skeleton.SkeletonTpl',
        'Ext.data.StoreManager'
    ],

    config: {
        /**
         * @cfg {String} preset
         * `'list'`, `'card'`, `'form'` or `'table'`. Defaults to `'table'` for a grid, `'list'`
         * for a list or data view and `'form'` for a form.
         */
        preset: null,

        /**
         * @cfg {Number} rows
         * How many times the preset repeats. See {@link NC.skeleton.SkeletonBase#cfg-rows}.
         */
        rows: null,

        /**
         * @cfg {String/Ext.data.Store} store
         * The store to follow. Defaults to the store of the host.
         */
        store: null,

        /**
         * @cfg {Number} minDisplayTime
         * Minimum time in milliseconds the skeleton stays visible once shown.
         */
        minDisplayTime: 300
    },

    applyStore: function (store) {
        return store ? Ext.data.StoreManager.lookup(store) : null;
    },

    updateStore: function () {
        // Only once the plugin is attached to its host.
        if (this.attached) {
            this.attachStore();
        }
    },

    init: function (host) {
        var me = this;

        me.attached = true;
        me.disableHostMask(host);
        me.hostListeners = me.bindHostStoreChange(host);
        me.attachStore();
    },

    /**
     * Shows the skeleton over the host. It stays until {@link #hide} is called or, when it
     * was shown by a store load, until the load ends.
     */
    show: function () {
        var me = this;

        me.cancelHideTimer();

        if (me.showing || !me.attached) {
            return;
        }

        me.showing = true;
        me.shownAt = Ext.Date.now();
        me.whenHostReady(me.createOverlay);
    },

    /**
     * Hides the skeleton. If it has been visible for less than {@link #cfg-minDisplayTime}, it
     * stays for the rest of that time.
     * @param {Boolean} [immediate=false] `true` to hide it now.
     */
    hide: function (immediate) {
        var me = this,
            wait;

        if (!me.showing) {
            return;
        }

        me.cancelHideTimer();
        wait = immediate ? 0 : me.getMinDisplayTime() - (Ext.Date.now() - me.shownAt);

        if (wait > 0) {
            me.hideTimer = Ext.defer(me.removeOverlay, wait, me);
        }
        else {
            me.removeOverlay();
        }
    },

    /**
     * Tells whether the skeleton is shown.
     * @return {Boolean}
     */
    isShowing: function () {
        return !!this.showing;
    },

    destroy: function () {
        var me = this,
            host = me.cmp;

        me.attached = false;
        me.removeOverlay();
        me.detachStore();
        Ext.destroy(me.hostListeners, me.readyListener);
        me.hostListeners = me.readyListener = null;

        if (host) {
            me.restoreHostMask(host);
        }

        me.callParent();
    },

    privates: {
        /** Follows the store of the plugin or of the host; called again if either changes. */
        attachStore: function () {
            var me = this,
                store = me.getStore() || me.getHostStore(me.cmp);

            if (store === me.boundStore) {
                return;
            }

            me.detachStore();

            if (store) {
                me.boundStore = store;
                me.storeListeners = store.on({
                    beforeload: 'onStoreBeforeLoad',
                    load: 'onStoreLoad',
                    scope: me,
                    destroyable: true
                });
            }

            // A store that is loading right now has no beforeload to wait for.
            if (store && store.isLoading && store.isLoading()) {
                me.show();
            }
            else {
                me.hide();
            }
        },

        detachStore: function () {
            var me = this;

            me.storeListeners = Ext.destroy(me.storeListeners);
            me.boundStore = null;
        },

        onHostStoreChange: function () {
            if (this.attached) {
                this.attachStore();
            }
        },

        onStoreBeforeLoad: function () {
            this.show();
        },

        // Fires for failed loads too (with `successful` false).
        onStoreLoad: function () {
            this.hide();
        },

        /** Runs `fn` now if the host is rendered, otherwise when it is. */
        whenHostReady: function (fn) {
            var me = this,
                host = me.cmp;

            Ext.destroy(me.readyListener);
            me.readyListener = null;

            if (!host) {
                return;
            }

            if (me.isHostReady(host)) {
                fn.call(me);
            }
            else {
                me.readyListener = host.on(me.getHostReadyEvent(), fn, me, {
                    single: true,
                    destroyable: true
                });
            }
        },

        createOverlay: function () {
            var me = this,
                host = me.cmp,
                target;

            if (!me.showing || me.overlay || !host || me.destroyed) {
                return;
            }

            target = me.getOverlayTarget(host);

            if (!target) {
                return;
            }

            // The overlay is positioned against its target; leave targets that are already
            // positioned alone.
            if (target.getStyle('position') === 'static') {
                target.addCls('nc-skeleton-host');
                me.hostCls = target;
            }

            me.overlay = target.createChild({
                cls: 'nc-skeleton-overlay nc-skeleton-animated',
                html: NC.skeleton.SkeletonTpl.build({
                    preset: me.getPreset() || me.getDefaultPreset(host) || 'list',
                    rows: me.getRows()
                })
            });
            me.overlay.setStyle('top', me.getOverlayTop(host, target) + 'px');

            me.getHostEl(host).set({
                'aria-busy': 'true'
            });
        },

        removeOverlay: function () {
            var me = this,
                host = me.cmp;

            me.cancelHideTimer();
            me.showing = false;

            me.overlay = Ext.destroy(me.overlay);

            if (me.hostCls) {
                me.hostCls.removeCls('nc-skeleton-host');
                me.hostCls = null;
            }

            if (host && !host.destroyed && !host.destroying) {
                // `undefined` removes the attribute.
                me.getHostEl(host).set({
                    'aria-busy': undefined
                });
            }
        },

        cancelHideTimer: function () {
            var me = this;

            if (me.hideTimer) {
                Ext.undefer(me.hideTimer);
                me.hideTimer = null;
            }
        }
    },

    /**
     * Gets the store of the host.
     * @param {Ext.Component} host
     * @return {Ext.data.Store} `null` when the host has none (a form).
     * @abstract
     * @protected
     */
    getHostStore: Ext.emptyFn,

    /**
     * Gets the preset that suits the host.
     * @param {Ext.Component} host
     * @return {String} `'table'`, `'list'`, `'form'` or `null`.
     * @abstract
     * @protected
     */
    getDefaultPreset: Ext.emptyFn,

    /**
     * Gets the element the overlay is added to; it covers the body area of the host.
     * @param {Ext.Component} host
     * @return {Ext.dom.Element}
     * @abstract
     * @protected
     */
    getOverlayTarget: Ext.emptyFn,

    /**
     * Gets how far from the top of the target the overlay starts, in pixels (for example to
     * leave the column headers of a grid uncovered).
     * @param {Ext.Component} host
     * @param {Ext.dom.Element} target
     * @return {Number}
     * @abstract
     * @protected
     */
    getOverlayTop: Ext.emptyFn,

    /**
     * Gets the element that gets `aria-busy` while the skeleton shows.
     * @param {Ext.Component} host
     * @return {Ext.dom.Element}
     * @abstract
     * @protected
     */
    getHostEl: Ext.emptyFn,

    /**
     * Switches off the host's own load mask, so the two do not stack.
     * @param {Ext.Component} host
     * @abstract
     * @protected
     */
    disableHostMask: Ext.emptyFn,

    /**
     * Gives the host's own load mask back.
     * @param {Ext.Component} host
     * @abstract
     * @protected
     */
    restoreHostMask: Ext.emptyFn,

    /**
     * Listens for the host getting another store, calling `onHostStoreChange`.
     * @param {Ext.Component} host
     * @return {Object} Destroyable listeners.
     * @abstract
     * @protected
     */
    bindHostStoreChange: Ext.emptyFn,

    /**
     * Tells whether the host's element is ready to receive the overlay.
     * @param {Ext.Component} host
     * @return {Boolean}
     * @abstract
     * @protected
     */
    isHostReady: Ext.emptyFn,

    /**
     * Gets the host event that fires once its element is ready.
     * @return {String}
     * @abstract
     * @protected
     */
    getHostReadyEvent: Ext.emptyFn
});
