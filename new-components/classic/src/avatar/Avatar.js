/**
 * Avatar for the Classic toolkit: a picture of a person with a fallback to their initials, a
 * size, a shape, a color taken from their name and an optional status dot.
 *
 *     Ext.create('NC.avatar.Avatar', {
 *         renderTo: Ext.getBody(),
 *         name: 'Juan Pérez',
 *         src: 'juan.png',
 *         avatarSize: 'large',
 *         status: 'online'
 *     });
 *
 * All configs, methods and events live in {@link NC.avatar.AvatarBase} and are the same in the
 * Modern toolkit. This class only provides the Classic markup and events.
 *
 * Tooltips use `data-qtip`, so the application must enable quick tips (the `quickTips` config
 * of `Ext.app.Application`, or `Ext.tip.QuickTipManager.init()`).
 */
Ext.define('NC.avatar.Avatar', {
    extend: 'NC.avatar.AvatarBase',
    xtype: 'nc-avatar',

    childEls: [
        'initialsEl',
        'imgEl'
    ],

    renderTpl: [
        '<span class="nc-avatar-inner">',
            '<span id="{id}-initialsEl" data-ref="initialsEl" class="nc-avatar-initials"></span>',
            '<img id="{id}-imgEl" data-ref="imgEl" class="nc-avatar-img" alt="">',
        '</span>',
        '<span class="nc-avatar-status" aria-hidden="true"></span>'
    ],

    initComponent: function () {
        var me = this;

        me.callParent();

        // From here on config changes can add CSS classes.
        me.avatarReady = true;
        me.refreshAvatar();
    },

    afterRender: function () {
        var me = this;

        me.callParent();

        // The child elements exist now.
        me.avatarDomReady = true;
        me.initAvatarEvents('click');
        me.refreshAvatar();
    },

    getAvatarRoot: function () {
        return this.el;
    },

    syncAvatarTip: function (html) {
        // `undefined` removes the attribute.
        this.el.set({
            'data-qtip': html || undefined
        });
    }
});
