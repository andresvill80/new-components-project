/**
 * Demo page of NC.skeleton.Skeleton and NC.skeleton.SkeletonPlugin (Classic). The Modern app
 * has the same sections so both toolkits can be compared side by side.
 */
Ext.define('MyApp.view.demo.SkeletonDemo', {
    extend: 'Ext.panel.Panel',
    xtype: 'demo-skeleton',

    requires: [
        'Ext.button.Button',
        'Ext.form.Panel',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Text',
        'Ext.grid.Panel',
        'Ext.toolbar.Toolbar',
        'Ext.view.View',
        'NC.skeleton.Skeleton',
        'NC.skeleton.SkeletonPlugin',

        'MyApp.store.People',
        'MyApp.view.demo.SkeletonDemoController',
        'MyApp.view.demo.SkeletonDemoModel'
    ],

    controller: 'skeletondemo',
    viewModel: 'skeletondemo',

    title: 'Skeleton Loader',
    scrollable: true,
    bodyPadding: 16,

    initComponent: function () {
        var me = this;

        me.items = [
            me.section('Standalone shapes', me.shapes()),
            me.section('Standalone presets', me.presets()),
            me.section('Grid with the plugin (table preset)', me.gridHost()),
            me.section('Data view with the plugin (list preset)', me.listHost()),
            me.section('Form with the plugin (form preset, follows a store)', me.formHost()),
            me.section('Manual show() / hide() (card preset, minDisplayTime 600)', me.manualHost())
        ];

        me.callParent();
    },

    section: function (title, items) {
        return {
            xtype: 'panel',
            title: title,
            userCls: 'skeleton-demo-section',
            bodyPadding: 12,
            items: items
        };
    },

    /** Standalone skeleton that follows the animation switch. */
    skeleton: function (config) {
        return Ext.apply({
            xtype: 'nc-skeleton',
            userCls: 'skeleton-demo-item',
            bind: {
                animated: '{animated}'
            }
        }, config);
    },

    shapes: function () {
        var me = this;

        return [{
            xtype: 'checkbox',
            boxLabel: 'Animated (the shimmer also stops by itself when the system asks for reduced motion)',
            bind: '{animated}'
        },
            me.skeleton({ width: 260, lines: 3 }),
            me.skeleton({ width: 160, lines: 1 }),
            me.skeleton({ shape: 'circle' }),
            me.skeleton({ shape: 'circle', width: 64, height: 64 }),
            me.skeleton({ shape: 'rect', width: 200, height: 80 })
        ];
    },

    presets: function () {
        var items = [];

        Ext.Array.each([['list', 3], ['card', 1], ['form', 3], ['table', 4]], function (entry) {
            items.push({
                xtype: 'container',
                userCls: 'skeleton-demo-preset',
                items: [{
                    xtype: 'nc-skeleton',
                    preset: entry[0],
                    rows: entry[1],
                    bind: {
                        animated: '{animated}'
                    }
                }]
            });
        });

        return items;
    },

    gridHost: function () {
        return [{
            xtype: 'toolbar',
            items: [{
                text: 'Reload',
                handler: 'onReloadGrid'
            }, {
                text: 'Reload (fails)',
                handler: 'onFailGrid'
            }, {
                text: 'Replace store',
                handler: 'onReplaceGridStore'
            }]
        }, {
            xtype: 'grid',
            reference: 'hostGrid',
            height: 260,
            store: {
                type: 'people',
                autoLoad: true,
                storeLabel: 'grid'
            },
            plugins: [{
                ptype: 'nc-skeleton'
            }],
            columns: [
                { text: 'Name', dataIndex: 'name', flex: 1 },
                { text: 'Email', dataIndex: 'email', flex: 1.5 },
                { text: 'City', dataIndex: 'city', flex: 1 }
            ]
        }];
    },

    listHost: function () {
        return [{
            xtype: 'toolbar',
            items: [{
                text: 'Reload',
                handler: 'onReloadList'
            }]
        }, {
            xtype: 'dataview',
            reference: 'hostList',
            height: 200,
            scrollable: true,
            store: {
                type: 'people',
                autoLoad: true,
                storeLabel: 'list'
            },
            plugins: [{
                ptype: 'nc-skeleton'
            }],
            tpl: '<tpl for="."><div class="skeleton-demo-person" style="padding:8px 12px">' +
                '<b>{name:htmlEncode}</b> &middot; {email:htmlEncode}</div></tpl>',
            itemSelector: 'div.skeleton-demo-person'
        }];
    },

    formHost: function () {
        return [{
            xtype: 'toolbar',
            items: [{
                text: 'Reload',
                handler: 'onReloadProfile'
            }]
        }, {
            xtype: 'form',
            reference: 'profileForm',
            height: 190,
            bodyPadding: 12,
            defaultType: 'textfield',
            defaults: {
                anchor: '100%'
            },
            plugins: [{
                ptype: 'nc-skeleton'
            }],
            items: [
                { fieldLabel: 'Name', name: 'name' },
                { fieldLabel: 'Email', name: 'email' },
                { fieldLabel: 'City', name: 'city' }
            ],
            listeners: {
                afterrender: 'onProfileFormReady'
            }
        }];
    },

    manualHost: function () {
        return [{
            xtype: 'toolbar',
            items: [{
                text: 'Show',
                handler: 'onShowManual'
            }, {
                text: 'Hide (waits for minDisplayTime)',
                handler: 'onHideManual'
            }]
        }, {
            xtype: 'panel',
            reference: 'manualPanel',
            height: 200,
            bodyPadding: 12,
            html: 'Real content. Press Show to cover it with a skeleton, then press Hide ' +
                'right away: the skeleton stays until it has been visible for 600 ms.',
            plugins: [{
                ptype: 'nc-skeleton',
                preset: 'card',
                minDisplayTime: 600
            }]
        }];
    }
});
