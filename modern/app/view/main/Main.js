/**
 * Main view of the demo shell (Modern): header, navigation list, card area for the demos
 * and the event log. Below 700px the navigation collapses behind a menu button.
 * It is specified in app.js as the "mainView".
 */
Ext.define('MyApp.view.main.Main', {
    extend: 'Ext.Container',
    xtype: 'app-main',

    requires: [
        'Ext.Responsive',
        'Ext.TitleBar',
        'Ext.Button',
        'Ext.dataview.List',
        'Ext.layout.Card',
        'Ext.layout.HBox',
        'Ext.layout.VBox',

        'MyApp.view.demo.EventLog',
        'MyApp.view.demo.Home',
        'MyApp.view.main.MainController',
        'MyApp.view.main.MainModel'
    ],

    controller: 'main',
    viewModel: 'main',

    layout: 'vbox',

    items: [{
        xtype: 'titlebar',
        docked: 'top',
        bind: {
            title: '{name}'
        },
        items: [{
            xtype: 'button',
            align: 'left',
            reference: 'menuButton',
            iconCls: 'x-fa fa-bars',
            handler: 'onMenuTap',
            hidden: true,
            responsiveConfig: {
                'width < 700': { hidden: false },
                'width >= 700': { hidden: true }
            }
        }, {
            xtype: 'component',
            align: 'right',
            padding: '0 16',
            bind: {
                html: 'new-components v{version}'
            }
        }]
    }, {
        xtype: 'container',
        flex: 1,
        layout: 'hbox',
        items: [{
            xtype: 'list',
            reference: 'nav',
            itemTpl: '{title:htmlEncode}',
            bind: {
                store: '{navDemos}',
                selection: '{current}'
            },
            listeners: {
                select: 'onNavSelect'
            },
            responsiveConfig: {
                'width >= 700': { hidden: false, flex: null, width: 220 },
                'width < 700': { hidden: true, flex: 1, width: null }
            }
        }, {
            xtype: 'container',
            reference: 'content',
            flex: 1,
            layout: 'vbox',
            responsiveConfig: {
                'width >= 700': { hidden: false }
            },
            items: [{
                xtype: 'container',
                reference: 'cards',
                flex: 1,
                layout: 'card'
            }, {
                xtype: 'eventlog',
                height: 220
            }]
        }]
    }]
});
