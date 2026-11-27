/**
 * Data of the date range demo: the range of the bound field and a formula that shows it as text.
 */
Ext.define('MyApp.view.demo.DateRangeDemoModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.daterangedemo',

    data: {
        range: null
    },

    formulas: {
        rangeText: function (get) {
            var range = get('range');

            return range
                ? Ext.Date.format(range.start, 'Y-m-d') + ' to ' + Ext.Date.format(range.end, 'Y-m-d')
                : '(no range)';
        }
    }
});
