/**
 * A calendar for the Classic toolkit in which the user picks a range of days with two clicks.
 * {@link NC.daterange.DateRangeField} shows it in its picker, and it can also be used alone.
 *
 *     Ext.create('NC.daterange.RangeCalendar', {
 *         renderTo: Ext.getBody(),
 *         monthsShown: 2,
 *         minDate: new Date(),
 *         maxSpan: 14,
 *         listeners: {
 *             rangeselect: function (calendar, start, end) {
 *                 Ext.toast(Ext.Date.format(start, 'Y-m-d') + ' to ' + Ext.Date.format(end, 'Y-m-d'));
 *             }
 *         }
 *     });
 *
 * All configs and events live in {@link NC.daterange.RangeCalendarBase} and are the same in the
 * Modern toolkit.
 */
Ext.define('NC.daterange.RangeCalendar', {
    extend: 'NC.daterange.RangeCalendarBase',
    xtype: 'nc-rangecalendar',

    // The root can take the focus, so the focus can stay inside while the days are drawn again.
    focusable: true,
    tabIndex: -1,

    initComponent: function () {
        var me = this;

        me.callParent();

        // From here on config changes can add CSS classes.
        me.calendarReady = true;
        me.refreshCalendar();
    },

    afterRender: function () {
        var me = this;

        me.callParent();

        me.calendarDomReady = true;
        me.initCalendarEvents();
        me.refreshCalendar();
    },

    getCalendarRoot: function () {
        return this.el;
    }
});
