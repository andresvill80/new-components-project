/**
 * One entry of the demo shell: a component (or the home page) with the xtype of its demo view.
 * An entry without `viewXtype` is planned but has no demo yet.
 */
Ext.define('MyApp.model.Demo', {
    extend: 'MyApp.model.Base',

    idProperty: 'slug',

    fields: [
        { name: 'slug', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'phase', type: 'string' },
        { name: 'viewXtype', type: 'string' },
        {
            name: 'status',
            type: 'string',
            calculate: function (data) {
                return data.viewXtype ? 'Ready' : 'Planned';
            }
        }
    ]
});
