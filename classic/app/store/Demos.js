/**
 * The list of demos. To add a demo: write its view class and set its `viewXtype` here.
 */
Ext.define('MyApp.store.Demos', {
    extend: 'Ext.data.Store',
    alias: 'store.demos',

    requires: [
        'MyApp.model.Demo'
    ],

    model: 'MyApp.model.Demo',

    data: [
        { slug: 'home', title: 'Home', phase: '00', viewXtype: 'app-home' },
        { slug: 'avatar', title: 'Avatar / Avatar Group', phase: '01', viewXtype: '' },
        { slug: 'skeleton', title: 'Skeleton Loader', phase: '02', viewXtype: '' },
        { slug: 'stepper', title: 'Stepper / Wizard', phase: '03', viewXtype: '' },
        { slug: 'otp-field', title: 'OTP / PIN Field', phase: '04', viewXtype: '' },
        { slug: 'date-range-field', title: 'Date Range Field', phase: '05', viewXtype: '' },
        { slug: 'tree-picker', title: 'Tree Picker Field', phase: '06', viewXtype: '' },
        { slug: 'timeline', title: 'Timeline', phase: '07', viewXtype: '' },
        { slug: 'dual-list', title: 'Dual List Selector', phase: '08', viewXtype: '' },
        { slug: 'file-drop-zone', title: 'File Drop Zone', phase: '09', viewXtype: '' },
        { slug: 'sitemap-builder', title: 'Site Map Builder', phase: '10', viewXtype: '' },
        { slug: 'kanban', title: 'Kanban Board', phase: '11', viewXtype: '' },
        { slug: 'scheduling-core', title: 'Scheduling core', phase: '12', viewXtype: '' },
        { slug: 'pert-chart', title: 'PERT Chart', phase: '13', viewXtype: '' },
        { slug: 'gantt', title: 'Gantt Chart', phase: '14', viewXtype: '' }
    ]
});
