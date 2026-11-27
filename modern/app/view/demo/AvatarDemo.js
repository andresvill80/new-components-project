/**
 * Demo page of NC.avatar.Avatar and NC.avatar.AvatarGroup (Modern). The Classic app has the
 * same sections so both toolkits can be compared side by side.
 */
Ext.define('MyApp.view.demo.AvatarDemo', {
    extend: 'Ext.Panel',
    xtype: 'demo-avatar',

    requires: [
        'Ext.Button',
        'Ext.field.Select',
        'Ext.field.Text',
        'NC.avatar.Avatar',
        'NC.avatar.AvatarGroup',

        'MyApp.view.demo.AvatarDemoController',
        'MyApp.view.demo.AvatarDemoModel'
    ],

    controller: 'avatardemo',
    viewModel: 'avatardemo',

    title: 'Avatar / Avatar Group',
    scrollable: true,
    bodyPadding: 16,

    initialize: function () {
        var me = this;

        me.callParent();

        me.add([
            me.playground(),
            me.section('Sizes and shapes (small 24, medium 40, large 64, custom 96)',
                me.sizeShapeAvatars()),
            me.section('Initials and colors (hover for the name tooltip)', me.nameAvatars()),
            me.section('Pictures: valid, broken URL, no picture', me.pictureAvatars()),
            me.section('Status', me.statusAvatars()),
            me.section('Selectable (tap, Enter or Space; Tab to focus)', me.selectableAvatars()),
            me.section('Groups', me.groups())
        ]);
    },

    section: function (title, items) {
        return {
            xtype: 'panel',
            title: title,
            userCls: 'demo-section',
            bodyPadding: 12,
            items: items
        };
    },

    /** An avatar with the demo spacing. */
    avatar: function (config) {
        return Ext.apply({
            xtype: 'nc-avatar',
            userCls: 'demo-item'
        }, config);
    },

    /** Avatar bound to form fields, to try every config. */
    playground: function () {
        return {
            xtype: 'panel',
            title: 'Playground',
            userCls: 'demo-section',
            bodyPadding: 12,
            layout: {
                type: 'hbox',
                align: 'center'
            },
            items: [{
                xtype: 'container',
                width: 320,
                items: [{
                    xtype: 'textfield',
                    label: 'Name',
                    bind: '{name}'
                }, {
                    xtype: 'selectfield',
                    label: 'Size',
                    options: ['small', 'medium', 'large', '96'],
                    bind: '{avatarSize}'
                }, {
                    xtype: 'selectfield',
                    label: 'Shape',
                    options: ['circle', 'rounded', 'square'],
                    bind: '{shape}'
                }, {
                    xtype: 'selectfield',
                    label: 'Status',
                    options: ['none', 'online', 'away', 'busy', 'offline'],
                    bind: '{status}'
                }]
            }, {
                xtype: 'nc-avatar',
                userCls: 'demo-item',
                bind: {
                    name: '{name}',
                    avatarSize: '{avatarSize}',
                    shape: '{shape}',
                    status: '{status}'
                }
            }]
        };
    },

    sizeShapeAvatars: function () {
        var me = this,
            items = [];

        Ext.Array.each(['circle', 'rounded', 'square'], function (shape) {
            Ext.Array.each(['small', 'medium', 'large', 96], function (size) {
                items.push(me.avatar({
                    name: 'Juan Pérez',
                    shape: shape,
                    avatarSize: size
                }));
            });
        });

        return items;
    },

    nameAvatars: function () {
        var me = this,
            items = [];

        // "  " and "" have no initials and show the neutral placeholder.
        Ext.Array.each(['Ana', 'Juan Pérez', 'María José López Hernández', 'ÁÉÍ Ñandú', 'Zoë', '  ', ''],
            function (name) {
                items.push(me.avatar({
                    name: name,
                    avatarSize: 'large'
                }));
            });

        // Same name, same color; a color index and initials can be forced.
        items.push(me.avatar({ name: 'Juan Pérez', avatarSize: 'large' }));
        items.push(me.avatar({ name: 'Juan Pérez', avatarSize: 'large', colorIndex: 3 }));
        items.push(me.avatar({ name: 'Juan Pérez', avatarSize: 'large', initials: 'X1' }));

        // Names are HTML-encoded everywhere.
        items.push(me.avatar({ name: '<b>Bold</b> & <i>Evil</i>', avatarSize: 'large' }));

        return items;
    },

    pictureAvatars: function () {
        var me = this;

        return [
            me.avatar({ name: 'Juan Pérez', src: 'resources/avatars/user1.svg', avatarSize: 'large' }),
            me.avatar({ name: 'Broken Image', src: 'resources/avatars/missing.png', avatarSize: 'large' }),
            me.avatar({ name: 'No Picture', avatarSize: 'large' }),
            me.avatar({
                reference: 'pictureAvatar',
                name: 'Changing Picture',
                src: 'resources/avatars/user3.svg',
                avatarSize: 'large',
                shape: 'rounded'
            }), {
                xtype: 'button',
                text: 'Change picture',
                handler: 'onChangePicture'
            }
        ];
    },

    statusAvatars: function () {
        var me = this,
            items = [];

        Ext.Array.each(['online', 'away', 'busy', 'offline'], function (status) {
            items.push(me.avatar({ name: 'Ana Ruiz', status: status, avatarSize: 'large' }));
            items.push(me.avatar({
                name: 'Ana Ruiz',
                status: status,
                src: 'resources/avatars/user2.svg',
                avatarSize: 'large'
            }));
        });

        // Status also scales with small and custom sizes.
        items.push(me.avatar({ name: 'Ana Ruiz', status: 'online', avatarSize: 'small' }));
        items.push(me.avatar({ name: 'Ana Ruiz', status: 'busy', avatarSize: 96 }));

        return items;
    },

    selectableAvatars: function () {
        var me = this;

        return [
            me.avatar({
                name: 'Select Me',
                avatarSize: 'large',
                selectable: true,
                listeners: { select: 'onSelect' }
            }),
            me.avatar({
                name: 'Not Selectable',
                avatarSize: 'large',
                listeners: { select: 'onSelect' }
            })
        ];
    },

    groups: function () {
        var twelve = [];

        Ext.Array.each(['Ana', 'Juan Pérez', 'Luis Gómez', 'Zoë Smith', 'Carlos Díaz', 'Marta Ruiz',
            'Pablo León', 'Inés Vega', 'Raúl Soto', 'Elena Cruz', 'Hugo Paz', 'Nora Gil'], function (name) {
            twelve.push({ name: name });
        });

        return [{
            xtype: 'nc-avatargroup',
            userCls: 'demo-item',
            avatars: [{ name: 'Ana', status: 'online' }, { name: 'Juan Pérez' }],
            listeners: { avatarselect: 'onAvatarSelect', overflowselect: 'onOverflowSelect' }
        }, {
            xtype: 'nc-avatargroup',
            userCls: 'demo-item',
            avatars: twelve.slice(0, 4),
            listeners: { avatarselect: 'onAvatarSelect', overflowselect: 'onOverflowSelect' }
        }, {
            xtype: 'nc-avatargroup',
            userCls: 'demo-item',
            avatars: twelve,
            listeners: { avatarselect: 'onAvatarSelect', overflowselect: 'onOverflowSelect' }
        }, {
            xtype: 'nc-avatargroup',
            userCls: 'demo-item',
            avatars: twelve,
            max: 6,
            avatarSize: 'large',
            shape: 'rounded',
            overlap: false,
            listeners: { avatarselect: 'onAvatarSelect', overflowselect: 'onOverflowSelect' }
        }, {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'center'
            },
            items: [{
                xtype: 'nc-avatargroup',
                userCls: 'demo-item',
                max: 5,
                bind: {
                    store: '{people}'
                },
                listeners: { avatarselect: 'onAvatarSelect', overflowselect: 'onOverflowSelect' }
            }, {
                xtype: 'button',
                text: 'Add person (store)',
                userCls: 'demo-item',
                handler: 'onAddPerson'
            }, {
                xtype: 'button',
                text: 'Remove last',
                handler: 'onRemovePerson'
            }]
        }];
    }
});
