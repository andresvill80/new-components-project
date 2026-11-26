/**
 * Home page: the planned components and whether their demo is ready.
 */
Ext.define('MyApp.view.demo.Home', {
    extend: 'Ext.grid.Panel',
    xtype: 'app-home',

    title: 'Planned components',

    bind: {
        store: '{plannedDemos}'
    },

    columns: [{
        text: 'Phase',
        dataIndex: 'phase',
        width: 90
    }, {
        text: 'Component',
        dataIndex: 'title',
        flex: 1
    }, {
        text: 'Status',
        dataIndex: 'status',
        width: 120
    }]
});
