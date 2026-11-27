/**
 * Demo page of NC.skeleton.Skeleton and NC.skeleton.SkeletonPlugin (Modern). The Classic app
 * has the same sections so both toolkits can be compared side by side.
 */
Ext.define('MyApp.view.demo.SkeletonDemo', {
    extend: 'Ext.Panel',
    xtype: 'demo-skeleton',

    requires: [
        'Ext.Button',
        'Ext.Toolbar',
        'Ext.dataview.List',
        'Ext.field.Checkbox',
        'Ext.field.Text',
        'Ext.form.Panel',
        'Ext.grid.Grid',
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

    initialize: function () {
        var me = this;

        me.callParent();

        me.add([
            me.section('Standalone shapes', me.shapes()),
            me.section('Standalone presets', me.presets()),
            me.section('Grid with the plugin (table preset)', me.gridHost()),
            me.section('List with the plugin (list preset)', me.listHost()),
            me.section('Form with the plugin (form preset, follows a store)', me.formHost()),
            me.section('Manual show() / hide() (card preset, minDisplayTime 600)', me.manualHost())
        ]);
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
            xtype: 'checkboxfield',
            boxLabel: 'Animated (the shimmer also stops by itself when the system asks for reduced motion)',
            bind: {
                checked: '{animated}'
            }
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
            plugins: {
                'nc-skeleton': true
            },
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
            xtype: 'list',
            reference: 'hostList',
            height: 200,
            store: {
                type: 'people',
                autoLoad: true,
                storeLabel: 'list'
            },
            plugins: {
                'nc-skeleton': true
            },
            itemTpl: '<b>{name:htmlEncode}</b> &middot; {email:htmlEncode}'
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
            xtype: 'formpanel',
            reference: 'profileForm',
            height: 230,
            bodyPadding: 12,
            plugins: {
                'nc-skeleton': true
            },
            items: [
                { xtype: 'textfield', label: 'Name', name: 'name' },
                { xtype: 'textfield', label: 'Email', name: 'email' },
                { xtype: 'textfield', label: 'City', name: 'city' }
            ],
            listeners: {
                painted: {
                    fn: 'onProfileFormReady',
                    single: true
                }
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
            plugins: {
                'nc-skeleton': {
                    preset: 'card',
                    minDisplayTime: 600
                }
            }
        }];
    }
});
