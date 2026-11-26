/**
 * Main view of the demo shell (Classic): header, navigation list, card area for the demos
 * and the event log. It is specified in app.js as the "mainView".
 */
Ext.define('MyApp.view.main.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.grid.Panel',
        'Ext.layout.container.Border',
        'Ext.layout.container.Card',
        'Ext.plugin.Viewport',
        'Ext.toolbar.Toolbar',
        'Ext.toolbar.TextItem',

        'MyApp.view.demo.EventLog',
        'MyApp.view.demo.Home',
        'MyApp.view.main.MainController',
        'MyApp.view.main.MainModel'
    ],

    controller: 'main',
    viewModel: 'main',

    layout: 'border',

    items: [{
        region: 'north',
        xtype: 'toolbar',
        cls: 'app-header',
        items: [{
            xtype: 'tbtext',
            cls: 'app-header-title',
            bind: {
                text: '{name}'
            }
        }, '->', {
            xtype: 'tbtext',
            bind: {
                text: 'new-components v{version}'
            }
        }]
    }, {
        region: 'west',
        xtype: 'grid',
        reference: 'nav',
        title: 'Demos',
        width: 220,
        split: true,
        collapsible: true,
        hideHeaders: true,
        bind: {
            store: '{navDemos}',
            selection: '{current}'
        },
        columns: [{
            dataIndex: 'title',
            flex: 1
        }],
        listeners: {
            select: 'onNavSelect'
        }
    }, {
        region: 'center',
        xtype: 'container',
        reference: 'cards',
        layout: 'card'
    }, {
        region: 'south',
        xtype: 'eventlog',
        height: 220,
        split: true,
        collapsible: true
    }]
});
