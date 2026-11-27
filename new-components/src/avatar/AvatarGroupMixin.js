/**
 * Shared behavior of {@link NC.avatar.AvatarGroup} for both toolkits: the configs, the
 * `avatars` / `store` handling, the split between visible avatars and the "+N" bubble, and
 * the events. It is a mixin because the group extends each toolkit's own container class.
 *
 * The toolkit class must call {@link #initAvatarGroup} at the end of `initComponent` (Classic)
 * or `initialize` (Modern), and {@link #destroyAvatarGroup} from `doDestroy`.
 */
Ext.define('NC.avatar.AvatarGroupMixin', {
    mixinId: 'avatargroup',

    requires: [
        'NC.avatar.Avatar',
        'Ext.data.StoreManager'
    ],

    /**
     * @event avatarselect
     * Fires when one of the visible avatars is activated.
     * @param {NC.avatar.AvatarGroup} group This group.
     * @param {Object/Ext.data.Model} data The entry of the avatar: the object from
     * {@link #cfg-avatars}, or the record when the group uses a {@link #cfg-store}.
     */

    /**
     * @event overflowselect
     * Fires when the "+N" bubble is activated.
     * @param {NC.avatar.AvatarGroup} group This group.
     * @param {Array} hiddenItems The entries that are not visible (objects or records).
     */

    /**
     * @property {String} overflowLabel
     * Accessible label of the "+N" bubble; `{0}` is the number of hidden avatars. Override
     * for other languages.
     */
    overflowLabel: '{0} more',

    config: {
        /**
         * @cfg {Object[]} avatars
         * The people to show: objects with `name`, `src`, `status`, and optionally `initials`
         * and `colorIndex`. Ignored when a {@link #cfg-store} is set.
         * Named `avatars` because `data` is the template data config of `Ext.Component`.
         */
        avatars: null,

        /**
         * @cfg {String/Ext.data.Store} store
         * A store (or store id) whose records have the same fields as {@link #cfg-avatars}.
         */
        store: null,

        /**
         * @cfg {Number} max
         * How many avatars are shown before the rest collapse into a "+N" bubble.
         */
        max: 4,

        /**
         * @cfg {String/Number} avatarSize
         * Size of every avatar, see {@link NC.avatar.Avatar#cfg-avatarSize}.
         */
        avatarSize: 'medium',

        /**
         * @cfg {String} shape
         * Shape of every avatar, see {@link NC.avatar.Avatar#cfg-shape}.
         */
        shape: 'circle',

        /**
         * @cfg {Boolean} overlap
         * `true` to overlap the avatars.
         */
        overlap: true
    },

    applyStore: function (store) {
        return store ? Ext.data.StoreManager.lookup(store) : null;
    },

    applyMax: function (max) {
        return Ext.isNumeric(max) ? Math.max(1, Math.floor(+max)) : 4;
    },

    updateAvatars: function () {
        this.refreshAvatarGroup();
    },

    updateStore: function (store) {
        var me = this;

        Ext.destroy(me.avatarStoreListeners);
        me.avatarStoreListeners = null;

        if (store) {
            me.avatarStoreListeners = store.on({
                datachanged: 'refreshAvatarGroup',
                update: 'refreshAvatarGroup',
                scope: me,
                destroyable: true
            });
        }

        me.refreshAvatarGroup();
    },

    updateMax: function () {
        this.refreshAvatarGroup();
    },

    updateAvatarSize: function () {
        this.refreshAvatarGroup();
    },

    updateShape: function () {
        this.refreshAvatarGroup();
    },

    updateOverlap: function (overlap) {
        var me = this;

        if (me.avatarGroupReady) {
            me[overlap ? 'addCls' : 'removeCls']('nc-avatargroup-overlap');
        }
    },

    /**
     * Gets how many avatars are visible (without the "+N" bubble).
     * @return {Number}
     */
    getVisibleCount: function () {
        return Math.min(this.getAvatarEntries().length, this.getMax());
    },

    /**
     * Call at the end of `initComponent` / `initialize`.
     * @protected
     */
    initAvatarGroup: function () {
        var me = this;

        me.avatarGroupReady = true;
        me.updateOverlap(me.getOverlap());
        me.refreshAvatarGroup();
    },

    /**
     * Call from `doDestroy`, before the parent.
     * @protected
     */
    destroyAvatarGroup: function () {
        var me = this;

        me.avatarGroupReady = false;
        me.avatarStoreListeners = Ext.destroy(me.avatarStoreListeners);
    },

    /**
     * Normalizes the people of the group to plain entries, from the store when there is one.
     * `source` is the original object or record.
     * @return {Object[]}
     * @private
     */
    getAvatarEntries: function () {
        var store = this.getStore(),
            entries = [];

        if (store) {
            store.each(function (record) {
                entries.push({
                    name: record.get('name'),
                    src: record.get('src'),
                    status: record.get('status'),
                    initials: record.get('initials'),
                    colorIndex: record.get('colorIndex'),
                    source: record
                });
            });
        }
        else {
            Ext.Array.each(this.getAvatars(), function (item) {
                entries.push(Ext.apply({ source: item }, item));
            });
        }

        return entries;
    },

    /**
     * Rebuilds the avatars from the current configs.
     * @protected
     */
    refreshAvatarGroup: function () {
        var me = this,
            entries, max, items, hidden, hiddenNames;

        if (!me.avatarGroupReady || me.isDestroying || me.destroying || me.destroyed) {
            return;
        }

        entries = me.getAvatarEntries();
        max = me.getMax();
        items = [];
        hidden = Ext.Array.slice(entries, max);
        hiddenNames = '';

        Ext.Array.each(Ext.Array.slice(entries, 0, max), function (entry) {
            items.push(me.createAvatarConfig(entry));
        });

        if (hidden.length) {
            Ext.Array.each(hidden, function (entry) {
                if (entry.name) {
                    hiddenNames += (hiddenNames ? '\n' : '') + entry.name;
                }
            });
            items.push(me.createOverflowConfig(hidden, hiddenNames));
        }

        // The arguments mean "destroy the avatars" in both toolkits.
        me.removeAll(true, true);
        me.add(items);
    },

    createAvatarConfig: function (entry) {
        var me = this;

        return {
            xtype: 'nc-avatar',
            name: entry.name,
            src: entry.src,
            status: entry.status,
            initials: entry.initials,
            colorIndex: entry.colorIndex,
            avatarSize: me.getAvatarSize(),
            shape: me.getShape(),
            selectable: true,
            avatarEntry: entry,
            listeners: {
                select: 'onGroupAvatarSelect',
                scope: me
            }
        };
    },

    createOverflowConfig: function (hidden, hiddenNames) {
        var me = this;

        return {
            xtype: 'nc-avatar',
            cls: 'nc-avatar-overflow',
            initials: '+' + hidden.length,
            accessibleLabel: Ext.String.format(me.overflowLabel, hidden.length),
            tipText: hiddenNames,
            avatarSize: me.getAvatarSize(),
            shape: me.getShape(),
            selectable: true,
            overflowEntries: hidden,
            listeners: {
                select: 'onGroupOverflowSelect',
                scope: me
            }
        };
    },

    onGroupAvatarSelect: function (avatar) {
        this.fireEvent('avatarselect', this, avatar.avatarEntry.source);
    },

    onGroupOverflowSelect: function (avatar) {
        var hidden = [];

        Ext.Array.each(avatar.overflowEntries, function (entry) {
            hidden.push(entry.source);
        });

        this.fireEvent('overflowselect', this, hidden);
    }
});
