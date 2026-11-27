/**
 * A row of {@link NC.avatar.Avatar avatars} for the Classic toolkit. Shows up to
 * {@link #cfg-max} avatars and a "+N" bubble for the rest.
 *
 *     Ext.create('NC.avatar.AvatarGroup', {
 *         renderTo: Ext.getBody(),
 *         max: 3,
 *         avatars: [
 *             { name: 'Ana', status: 'online' },
 *             { name: 'Juan Pérez' },
 *             { name: 'María José López Hernández' },
 *             { name: 'Luis Gómez' }
 *         ]
 *     });
 *
 * All configs, methods and events live in {@link NC.avatar.AvatarGroupMixin} and are the same
 * in the Modern toolkit. The avatars flow inline (`auto` layout) so CSS can overlap them.
 */
Ext.define('NC.avatar.AvatarGroup', {
    extend: 'Ext.container.Container',
    xtype: 'nc-avatargroup',

    mixins: [
        'NC.avatar.AvatarGroupMixin'
    ],

    requires: [
        'Ext.layout.container.Auto'
    ],

    cls: 'nc-avatargroup',

    layout: 'auto',

    initComponent: function () {
        var me = this;

        me.callParent();
        me.initAvatarGroup();
    },

    doDestroy: function () {
        this.destroyAvatarGroup();
        this.callParent();
    }
});
