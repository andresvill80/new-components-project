/**
 * Shared base of {@link NC.avatar.Avatar} for both toolkits. It holds every config, the
 * validation, the computed view state ({@link #getAvatarInfo}) and the DOM updates. The
 * toolkit classes only provide the markup, the root element and the toolkit specific events.
 *
 * Expected markup (both toolkits build the same one, see the toolkit classes):
 *
 *     root (.nc-avatar)
 *       .nc-avatar-inner
 *         span.nc-avatar-initials   (property `initialsEl`)
 *         img.nc-avatar-img         (property `imgEl`)
 *       span.nc-avatar-status
 *
 * Toolkit classes must:
 *
 * - set `avatarReady = true` once the component can take CSS classes (`initComponent` in
 *   Classic, `initialize` in Modern) and then call {@link #refreshAvatar};
 * - set `avatarDomReady = true` once `initialsEl` and `imgEl` exist, call
 *   {@link #initAvatarEvents} and then {@link #refreshAvatar};
 * - implement {@link #getAvatarRoot} and {@link #syncAvatarTip}.
 *
 * @abstract
 */
Ext.define('NC.avatar.AvatarBase', {
    extend: 'Ext.Component',

    requires: [
        'NC.avatar.AvatarUtil',
        'Ext.String',
        'Ext.util.Format'
    ],

    baseCls: 'nc-avatar',

    /**
     * @event select
     * Fires when the avatar is activated by pointer or by the Enter / Space key. Only fires
     * when {@link #cfg-selectable} is `true`.
     * @param {NC.avatar.Avatar} avatar This avatar.
     */

    /**
     * @property {String} emptyLabel
     * Accessible label used when the avatar has no name and no
     * {@link #cfg-accessibleLabel}. Override for other languages.
     */
    emptyLabel: 'Avatar',

    config: {
        /**
         * @cfg {String} name
         * Full name. Used for the initials, the automatic color, the tooltip and the accessible
         * label.
         */
        name: '',

        /**
         * @cfg {String} src
         * Image URL. While it loads, or if it fails to load, the initials are shown.
         */
        src: null,

        /**
         * @cfg {String} initials
         * Text to show instead of the initials taken from {@link #cfg-name}.
         */
        initials: null,

        /**
         * @cfg {String/Number} avatarSize
         * `'small'` (24px), `'medium'` (40px) or `'large'` (64px), or a number of pixels.
         * Named `avatarSize` because `size` would replace `getSize()` / `setSize()` of
         * Classic's `Ext.Component`.
         */
        avatarSize: 'medium',

        /**
         * @cfg {String} shape
         * `'circle'`, `'rounded'` or `'square'`.
         */
        shape: 'circle',

        /**
         * @cfg {String} status
         * `null`, `'online'`, `'away'`, `'busy'` or `'offline'`.
         */
        status: null,

        /**
         * @cfg {Number} colorIndex
         * Palette index that replaces the color calculated from the name.
         */
        colorIndex: null,

        /**
         * @cfg {Boolean} showTooltip
         * `true` to show the name as a tooltip. Tooltips need the application's `quickTips`
         * config to be on.
         */
        showTooltip: true,

        /**
         * @cfg {Boolean} selectable
         * `true` to make the avatar focusable and to fire {@link #event-select}.
         */
        selectable: false,

        /**
         * @cfg {Object} statusLabels
         * Accessible text of each status. Override for other languages.
         */
        statusLabels: {
            online: 'Online',
            away: 'Away',
            busy: 'Busy',
            offline: 'Offline'
        },

        /**
         * @cfg {String} accessibleLabel
         * Replaces the accessible label, which is the name plus the status.
         */
        accessibleLabel: null,

        /**
         * @cfg {String} tipText
         * Plain text for the tooltip instead of the name and status. Line breaks (`\n`) are
         * kept. It is always HTML-encoded.
         */
        tipText: null
    },

    privates: {
        /** @property {String[]} sizes Valid named sizes. */
        sizes: ['small', 'medium', 'large'],

        /** @property {String[]} shapes Valid shapes. */
        shapes: ['circle', 'rounded', 'square'],

        /** @property {String[]} statuses Valid statuses. */
        statuses: ['online', 'away', 'busy', 'offline']
    },

    applyName: function (name) {
        return Ext.String.trim(Ext.valueFrom(name, '') + '');
    },

    applyInitials: function (initials) {
        initials = Ext.String.trim(Ext.valueFrom(initials, '') + '');

        return initials || null;
    },

    applyAvatarSize: function (size) {
        if (Ext.isNumeric(size) && +size > 0) {
            return +size;
        }

        return Ext.Array.contains(this.sizes, size) ? size : 'medium';
    },

    applyShape: function (shape) {
        return Ext.Array.contains(this.shapes, shape) ? shape : 'circle';
    },

    applyStatus: function (status) {
        return Ext.Array.contains(this.statuses, status) ? status : null;
    },

    applyColorIndex: function (index) {
        if (!Ext.isNumeric(index)) {
            return null;
        }

        return Math.abs(Math.floor(+index)) % NC.avatar.AvatarUtil.paletteSize;
    },

    applyStatusLabels: function (labels) {
        return Ext.apply({
            online: 'Online',
            away: 'Away',
            busy: 'Busy',
            offline: 'Offline'
        }, labels);
    },

    updateName: function () {
        this.refreshAvatar();
    },

    updateSrc: function () {
        this.refreshAvatar();
    },

    updateInitials: function () {
        this.refreshAvatar();
    },

    updateAvatarSize: function () {
        this.refreshAvatar();
    },

    updateShape: function () {
        this.refreshAvatar();
    },

    updateStatus: function () {
        this.refreshAvatar();
    },

    updateColorIndex: function () {
        this.refreshAvatar();
    },

    updateShowTooltip: function () {
        this.refreshAvatar();
    },

    updateSelectable: function () {
        this.refreshAvatar();
    },

    updateStatusLabels: function () {
        this.refreshAvatar();
    },

    updateAccessibleLabel: function () {
        this.refreshAvatar();
    },

    updateTipText: function () {
        this.refreshAvatar();
    },

    /**
     * Gets the text shown in the avatar: the {@link #cfg-initials} override, or the initials
     * calculated from the {@link #cfg-name}.
     * @return {String} `''` when there is nothing to show.
     */
    getInitialsText: function () {
        var override = this.getInitials();

        return Ext.isEmpty(override) ? NC.avatar.AvatarUtil.getInitials(this.getName()) : override;
    },

    /**
     * Calculates everything the view needs from the current configs.
     * @return {Object} `cls` (array of CSS classes), `initialsHtml`, `px` (custom size or
     * `null`), `label` (accessible label), `tipHtml` (or `null`) and `selectable`.
     * @protected
     */
    getAvatarInfo: function () {
        var me = this,
            name = me.getName(),
            size = me.getAvatarSize(),
            status = me.getStatus(),
            initials = me.getInitialsText(),
            override = me.getColorIndex(),
            colorKey = name || initials,
            label = me.getAccessibleLabel() || name,
            statusText = status ? me.getStatusLabels()[status] : '',
            tipText, cls, index;

        if (statusText) {
            label = label ? Ext.String.format('{0}, {1}', label, statusText) : statusText;
        }

        // Plain text in, encoded HTML out: names are user data.
        tipText = me.getTipText() || label;

        cls = ['nc-avatar-' + me.getShape()];
        cls.push(Ext.isNumber(size) ? 'nc-avatar-custom' : 'nc-avatar-' + size);

        if (Ext.isNumber(override)) {
            index = override;
        }
        else if (colorKey) {
            index = NC.avatar.AvatarUtil.getColorIndex(colorKey);
        }
        cls.push(Ext.isNumber(index) ? 'nc-avatar-color-' + index : 'nc-avatar-neutral');

        if (!initials) {
            cls.push('nc-avatar-empty');
        }
        if (status) {
            cls.push('nc-avatar-status-' + status);
        }
        if (me.getSelectable()) {
            cls.push('nc-avatar-selectable');
        }

        return {
            cls: cls,
            initialsHtml: Ext.String.htmlEncode(initials),
            px: Ext.isNumber(size) ? size : null,
            label: label || me.emptyLabel,
            tipHtml: me.getShowTooltip() && tipText ?
                Ext.util.Format.nl2br(Ext.String.htmlEncode(tipText)) : null,
            selectable: me.getSelectable()
        };
    },

    /**
     * Brings the CSS classes and, once it exists, the DOM up to date with the configs.
     * Called by every config change.
     * @protected
     */
    refreshAvatar: function () {
        var me = this,
            oldCls = me.avatarCls,
            info;

        if (!me.avatarReady || me.isDestroying || me.destroying || me.destroyed) {
            return;
        }

        info = me.getAvatarInfo();

        if (oldCls) {
            me.removeCls(oldCls);
        }
        me.addCls(info.cls);
        me.avatarCls = info.cls;

        if (me.avatarDomReady) {
            me.syncAvatarDom(info);
        }
    },

    /**
     * Writes the computed state to the DOM.
     * @param {Object} info The result of {@link #getAvatarInfo}.
     * @protected
     */
    syncAvatarDom: function (info) {
        var me = this,
            root = me.getAvatarRoot(),
            src = me.getSrc(),
            px = info.px;

        me.initialsEl.setHtml(info.initialsHtml);

        // `undefined` removes the attribute.
        root.set({
            role: info.selectable ? 'button' : 'img',
            'aria-label': info.label,
            tabindex: info.selectable ? 0 : undefined
        });

        root.setStyle({
            width: px ? px + 'px' : '',
            height: px ? px + 'px' : '',
            fontSize: px ? Math.round(px * 0.4) + 'px' : ''
        });

        // The image only shows once it has loaded, so a failed or slow image leaves the
        // initials visible.
        if (src !== me.shownSrc) {
            me.shownSrc = src;
            me.removeCls('nc-avatar-loaded');
            me.imgEl.set({
                src: src ? Ext.resolveResource(src) : undefined
            });
        }

        me.syncAvatarTip(info.tipHtml);
    },

    /**
     * Listens to the events of the avatar. Call once the DOM exists.
     * @param {String} pointerEvent The toolkit's pointer event: `'click'` or `'tap'`.
     * @protected
     */
    initAvatarEvents: function (pointerEvent) {
        var me = this,
            listeners = {
                keydown: 'onAvatarKeyDown',
                scope: me
            };

        listeners[pointerEvent] = 'onAvatarPointer';

        me.mon(me.getAvatarRoot(), listeners);
        me.mon(me.imgEl, {
            load: 'onAvatarImageLoad',
            scope: me
        });
    },

    onAvatarPointer: function () {
        this.fireAvatarSelect();
    },

    onAvatarKeyDown: function (e) {
        var key = e.getKey();

        if (this.getSelectable() && (key === e.ENTER || key === e.SPACE)) {
            // Space must not scroll the page.
            e.stopEvent();
            this.fireAvatarSelect();
        }
    },

    onAvatarImageLoad: function () {
        if (!this.destroyed) {
            this.addCls('nc-avatar-loaded');
        }
    },

    fireAvatarSelect: function () {
        var me = this;

        if (me.getSelectable()) {
            me.fireEvent('select', me);
        }
    },

    doDestroy: function () {
        var me = this;

        me.avatarReady = me.avatarDomReady = false;
        me.callParent();
    },

    /**
     * Gets the element that receives the CSS size, the ARIA attributes and the pointer and
     * keyboard events: the component's own element.
     * @return {Ext.dom.Element}
     * @abstract
     * @protected
     */
    getAvatarRoot: Ext.emptyFn,

    /**
     * Shows or removes the tooltip.
     * @param {String} html Encoded tooltip HTML, or `null` for no tooltip.
     * @abstract
     * @protected
     */
    syncAvatarTip: Ext.emptyFn
});
