/**
 * A row of {@link NC.avatar.Avatar avatars} for the Modern toolkit. Shows up to
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
 * in the Classic toolkit.
 */
Ext.define('NC.avatar.AvatarGroup', {
    extend: 'Ext.Container',
    xtype: 'nc-avatargroup',

    mixins: [
        'NC.avatar.AvatarGroupMixin'
    ],

    requires: [
        'Ext.layout.HBox'
    ],

    cls: 'nc-avatargroup',

    layout: {
        type: 'hbox',
        align: 'center'
    },

    initialize: function () {
        var me = this;

        me.callParent();
        me.initAvatarGroup();
    },

    doDestroy: function () {
        this.destroyAvatarGroup();
        this.callParent();
    }
});
