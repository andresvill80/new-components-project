/**
 * Avatar for the Modern toolkit: a picture of a person with a fallback to their initials, a
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
 * Classic toolkit. This class only provides the Modern markup and events.
 *
 * Tooltips use the shared tip, so the application must enable quick tips (the `quickTips`
 * config of `Ext.app.Application`).
 */
Ext.define('NC.avatar.Avatar', {
    extend: 'NC.avatar.AvatarBase',
    xtype: 'nc-avatar',

    // Children of the component's element; `reference` makes each one a property.
    template: [{
        cls: 'nc-avatar-inner',
        children: [{
            reference: 'initialsEl',
            tag: 'span',
            cls: 'nc-avatar-initials'
        }, {
            reference: 'imgEl',
            tag: 'img',
            cls: 'nc-avatar-img',
            alt: ''
        }]
    }, {
        tag: 'span',
        cls: 'nc-avatar-status',
        'aria-hidden': 'true'
    }],

    initialize: function () {
        var me = this;

        me.callParent();

        // The element and the references exist now.
        me.avatarReady = true;
        me.avatarDomReady = true;
        me.initAvatarEvents('tap');
        me.refreshAvatar();
    },

    getAvatarRoot: function () {
        return this.element;
    },

    syncAvatarTip: function (html) {
        var me = this;

        if (html !== me.avatarTipHtml) {
            me.avatarTipHtml = html;
            me.setTooltip(html || null);
        }
    }
});
