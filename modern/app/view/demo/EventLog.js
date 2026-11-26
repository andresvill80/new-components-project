/**
 * Reusable event log panel for demos. Print an event with
 * `MyApp.view.demo.EventLog.log('select', [cmp, record])` or call `log()` on an instance.
 */
Ext.define('MyApp.view.demo.EventLog', {
    extend: 'Ext.Panel',
    xtype: 'eventlog',

    requires: [
        'Ext.grid.Grid',
        'Ext.Toolbar',
        'Ext.Button',
        'Ext.layout.Fit'
    ],

    statics: {
        /**
         * Logs to the first event log found on the page, if any.
         * @param {String} eventName
         * @param {Array} [args]
         */
        log: function (eventName, args) {
            var log = Ext.ComponentQuery.query('eventlog')[0];

            if (log) {
                log.log(eventName, args);
            }
        }
    },

    title: 'Event log',
    layout: 'fit',
    referenceHolder: true,
    defaultListenerScope: true,

    /**
     * @cfg {Number} maxEntries
     * Oldest entries are dropped beyond this number.
     */
    maxEntries: 200,

    items: [{
        xtype: 'toolbar',
        docked: 'bottom',
        items: [{
            xtype: 'button',
            text: 'Clear',
            iconCls: 'x-fa fa-trash',
            handler: 'onClear'
        }]
    }, {
        xtype: 'grid',
        reference: 'grid',
        store: {
            fields: ['time', 'event', 'args']
        },
        columns: [{
            text: 'Time',
            dataIndex: 'time',
            width: 120
        }, {
            text: 'Event',
            dataIndex: 'event',
            width: 160
        }, {
            text: 'Arguments',
            dataIndex: 'args',
            flex: 1
        }]
    }],

    /**
     * Adds an entry at the top of the log.
     * @param {String} eventName
     * @param {Array} [args]
     */
    log: function (eventName, args) {
        var me = this,
            store = me.lookup('grid').getStore(),
            count;

        store.insert(0, {
            // native: Ext JS has no factory for the current Date
            time: Ext.Date.format(new Date(), 'H:i:s.u'),
            event: eventName,
            args: Ext.Array.map(Ext.Array.from(args), me.formatArg).join(', ')
        });

        count = store.getCount();
        if (count > me.maxEntries) {
            store.removeAt(me.maxEntries, count - me.maxEntries);
        }
    },

    onClear: function () {
        this.lookup('grid').getStore().removeAll();
    },

    privates: {
        formatArg: function (arg) {
            if (Ext.isDate(arg)) {
                return Ext.Date.format(arg, 'c');
            }
            if (arg && arg.isComponent) {
                return Ext.String.format('<{0}>', arg.xtype);
            }
            if (arg && arg.isModel) {
                return Ext.String.format('record#{0}', arg.getId());
            }
            if (arg && Ext.getClass(arg)) {
                return Ext.getClassName(arg);
            }
            if (Ext.isObject(arg) || Ext.isArray(arg)) {
                return Ext.encode(arg);
            }
            return Ext.valueFrom(arg, '') + '';
        }
    }
});
