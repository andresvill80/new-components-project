/**
 * Builds the markup of the skeleton shapes and presets. Both toolkits use it, so the
 * standalone {@link NC.skeleton.Skeleton} and the {@link NC.skeleton.SkeletonPlugin} overlay
 * render identical shapes. The markup has no user data, only numbers and fixed class names.
 *
 * Every grey block is an element with the classes `nc-skeleton-item` plus one of
 * `nc-skeleton-text`, `nc-skeleton-circle` or `nc-skeleton-rect`.
 */
Ext.define('NC.skeleton.SkeletonTpl', {
    singleton: true,

    requires: [
        'Ext.XTemplate'
    ],

    /**
     * @property {String[]} presets Valid preset names.
     */
    presets: ['list', 'card', 'form', 'table'],

    /**
     * @property {String[]} shapes Valid shape names.
     */
    shapes: ['text', 'circle', 'rect'],

    /**
     * @property {Object} defaultRows Rows used when a preset has no `rows` given.
     */
    defaultRows: {
        list: 5,
        card: 1,
        form: 4,
        table: 6
    },

    // Line widths (percent) that repeat from row to row, so rows do not look identical.
    listWidths: [[70, 45], [85, 55], [60, 40], [78, 50], [66, 35]],
    tableWidths: [[70, 45, 85, 55], [55, 75, 40, 80], [85, 50, 65, 45], [45, 80, 55, 70]],

    /**
     * Gets the number of rows to draw for a preset.
     * @param {String} preset
     * @param {Number} [rows] A requested number of rows.
     * @return {Number}
     */
    getRowCount: function (preset, rows) {
        return Ext.isNumeric(rows) && +rows > 0 ?
            Math.floor(+rows) : (this.defaultRows[preset] || 1);
    },

    /**
     * Builds the markup for a shape or a preset.
     * @param {Object} config
     * @param {String} [config.preset] `'list'`, `'card'`, `'form'` or `'table'`. Wins over `shape`.
     * @param {Number} [config.rows] Repeat count of the preset.
     * @param {String} [config.shape='text'] `'text'`, `'circle'` or `'rect'`.
     * @param {Number} [config.lines=3] Number of lines of a text shape.
     * @return {String} HTML.
     */
    build: function (config) {
        var me = this,
            preset = config.preset;

        if (Ext.Array.contains(me.presets, preset)) {
            return me.getTpl(preset).apply({
                rows: me.makeRows(preset, me.getRowCount(preset, config.rows))
            });
        }

        return me.getTpl(Ext.Array.contains(me.shapes, config.shape) ? config.shape : 'text')
            .apply({
                lines: me.makeLines(config.lines)
            });
    },

    privates: {
        // Compiled templates by name.
        tpls: null,

        getTpl: function (name) {
            var me = this,
                tpls = me.tpls || (me.tpls = {});

            return tpls[name] || (tpls[name] = new Ext.XTemplate(me.tplSources[name]));
        },

        /** Data of each line of a text shape: all full width, the last one shorter. */
        makeLines: function (lines) {
            var count = Ext.isNumeric(lines) && +lines > 0 ? Math.floor(+lines) : 3,
                result = [],
                i;

            for (i = 0; i < count; i++) {
                result.push({
                    w: i === count - 1 && count > 1 ? 60 : 100
                });
            }

            return result;
        },

        /** Data of each row of a preset. */
        makeRows: function (preset, count) {
            var me = this,
                rows = [],
                i, pattern;

            for (i = 0; i < count; i++) {
                if (preset === 'list') {
                    pattern = me.listWidths[i % me.listWidths.length];
                    rows.push({ a: pattern[0], b: pattern[1] });
                }
                else if (preset === 'table') {
                    pattern = me.tableWidths[i % me.tableWidths.length];
                    rows.push({ a: pattern[0], b: pattern[1], c: pattern[2], d: pattern[3] });
                }
                else if (preset === 'form') {
                    rows.push({ label: i % 2 ? 25 : 35 });
                }
                else {
                    rows.push({});
                }
            }

            return rows;
        },

        tplSources: {
            text: [
                '<tpl for="lines">',
                    '<div class="nc-skeleton-item nc-skeleton-text" style="width:{w}%"></div>',
                '</tpl>'
            ],

            circle: [
                '<div class="nc-skeleton-item nc-skeleton-circle"></div>'
            ],

            rect: [
                '<div class="nc-skeleton-item nc-skeleton-rect"></div>'
            ],

            // A picture and two lines per row.
            list: [
                '<tpl for="rows">',
                    '<div class="nc-skeleton-row nc-skeleton-list-row">',
                        '<div class="nc-skeleton-item nc-skeleton-circle"></div>',
                        '<div class="nc-skeleton-col">',
                            '<div class="nc-skeleton-item nc-skeleton-text" style="width:{a}%"></div>',
                            '<div class="nc-skeleton-item nc-skeleton-text" style="width:{b}%"></div>',
                        '</div>',
                    '</div>',
                '</tpl>'
            ],

            // A picture and three lines per card.
            card: [
                '<tpl for="rows">',
                    '<div class="nc-skeleton-card">',
                        '<div class="nc-skeleton-item nc-skeleton-rect nc-skeleton-card-image"></div>',
                        '<div class="nc-skeleton-item nc-skeleton-text" style="width:90%"></div>',
                        '<div class="nc-skeleton-item nc-skeleton-text" style="width:70%"></div>',
                        '<div class="nc-skeleton-item nc-skeleton-text" style="width:50%"></div>',
                    '</div>',
                '</tpl>'
            ],

            // A short label above a field per row.
            form: [
                '<tpl for="rows">',
                    '<div class="nc-skeleton-form-row">',
                        '<div class="nc-skeleton-item nc-skeleton-text" style="width:{label}%"></div>',
                        '<div class="nc-skeleton-item nc-skeleton-rect nc-skeleton-input"></div>',
                    '</div>',
                '</tpl>'
            ],

            // Four cells per row.
            table: [
                '<tpl for="rows">',
                    '<div class="nc-skeleton-row nc-skeleton-table-row">',
                        '<div class="nc-skeleton-cell"><div class="nc-skeleton-item nc-skeleton-text" style="width:{a}%"></div></div>',
                        '<div class="nc-skeleton-cell"><div class="nc-skeleton-item nc-skeleton-text" style="width:{b}%"></div></div>',
                        '<div class="nc-skeleton-cell"><div class="nc-skeleton-item nc-skeleton-text" style="width:{c}%"></div></div>',
                        '<div class="nc-skeleton-cell"><div class="nc-skeleton-item nc-skeleton-text" style="width:{d}%"></div></div>',
                    '</div>',
                '</tpl>'
            ]
        }
    }
});
