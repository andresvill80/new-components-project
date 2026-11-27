/**
 * Shared base of {@link NC.skeleton.Skeleton} for both toolkits: the configs and the markup.
 * The toolkit classes only say which element is the root.
 *
 * Size it with the standard `width` and `height` configs of the component. Without them a
 * `text` skeleton is as wide as its container, a `circle` is 40px and a `rect` is 120px high.
 *
 * Toolkit classes must set `skeletonReady = true` once the component can take CSS classes
 * (`initComponent` in Classic, `initialize` in Modern) and `skeletonDomReady = true` once the
 * root element exists, calling {@link #refreshSkeleton} each time, and implement
 * {@link #getSkeletonRoot}.
 *
 * @abstract
 */
Ext.define('NC.skeleton.SkeletonBase', {
    extend: 'Ext.Component',

    requires: [
        'NC.skeleton.SkeletonTpl'
    ],

    baseCls: 'nc-skeleton',

    config: {
        /**
         * @cfg {String} shape
         * `'text'` (lines of text), `'circle'` or `'rect'`. Ignored when {@link #cfg-preset}
         * is set.
         */
        shape: 'text',

        /**
         * @cfg {Number} lines
         * Number of lines of a `text` shape. The last one is shorter.
         */
        lines: 3,

        /**
         * @cfg {String} preset
         * `null`, `'list'`, `'card'`, `'form'` or `'table'`: a ready-made layout of shapes.
         */
        preset: null,

        /**
         * @cfg {Number} rows
         * How many times a {@link #cfg-preset} repeats. Defaults to 5 for `list`, 1 for
         * `card`, 4 for `form` and 6 for `table`.
         */
        rows: null,

        /**
         * @cfg {Boolean} animated
         * `true` for the shimmer. The shimmer is also switched off for users who prefer reduced
         * motion.
         */
        animated: true
    },

    applyShape: function (shape) {
        return Ext.Array.contains(NC.skeleton.SkeletonTpl.shapes, shape) ? shape : 'text';
    },

    applyLines: function (lines) {
        return Ext.isNumeric(lines) && +lines > 0 ? Math.floor(+lines) : 3;
    },

    applyPreset: function (preset) {
        return Ext.Array.contains(NC.skeleton.SkeletonTpl.presets, preset) ? preset : null;
    },

    applyRows: function (rows) {
        return Ext.isNumeric(rows) && +rows > 0 ? Math.floor(+rows) : null;
    },

    updateShape: function () {
        this.refreshSkeleton();
    },

    updateLines: function () {
        this.refreshSkeleton();
    },

    updatePreset: function () {
        this.refreshSkeleton();
    },

    updateRows: function () {
        this.refreshSkeleton();
    },

    updateAnimated: function () {
        this.refreshSkeleton();
    },

    /**
     * Brings the CSS classes and, once it exists, the markup up to date with the configs.
     * @protected
     */
    refreshSkeleton: function () {
        var me = this,
            preset = me.getPreset(),
            shapeCls = 'nc-skeleton-shape-' + (preset ? 'preset' : me.getShape()),
            oldShapeCls = me.skeletonShapeCls;

        if (!me.skeletonReady || me.isDestroying || me.destroying || me.destroyed) {
            return;
        }

        if (oldShapeCls && oldShapeCls !== shapeCls) {
            me.removeCls(oldShapeCls);
        }
        me.addCls(shapeCls);
        me.skeletonShapeCls = shapeCls;

        me[me.getAnimated() ? 'addCls' : 'removeCls']('nc-skeleton-animated');

        if (me.skeletonDomReady) {
            me.getSkeletonRoot().setHtml(NC.skeleton.SkeletonTpl.build({
                preset: preset,
                rows: me.getRows(),
                shape: me.getShape(),
                lines: me.getLines()
            }));
        }
    },

    doDestroy: function () {
        var me = this;

        me.skeletonReady = me.skeletonDomReady = false;
        me.callParent();
    },

    /**
     * Gets the element that receives the markup: the component's own element.
     * @return {Ext.dom.Element}
     * @abstract
     * @protected
     */
    getSkeletonRoot: Ext.emptyFn
});
