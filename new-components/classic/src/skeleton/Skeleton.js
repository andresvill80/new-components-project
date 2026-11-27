/**
 * Placeholder shapes shown while content loads, for the Classic toolkit.
 *
 *     Ext.create('NC.skeleton.Skeleton', {
 *         renderTo: Ext.getBody(),
 *         width: 300,
 *         lines: 4
 *     });
 *
 *     Ext.create('NC.skeleton.Skeleton', { renderTo: Ext.getBody(), preset: 'list', rows: 3 });
 *
 * All configs live in {@link NC.skeleton.SkeletonBase} and are the same in the Modern toolkit.
 * To cover a grid, list or form while its store loads, use {@link NC.skeleton.SkeletonPlugin}.
 */
Ext.define('NC.skeleton.Skeleton', {
    extend: 'NC.skeleton.SkeletonBase',
    xtype: 'nc-skeleton',

    initComponent: function () {
        var me = this;

        me.callParent();

        // From here on config changes can add CSS classes.
        me.skeletonReady = true;
        me.refreshSkeleton();
    },

    afterRender: function () {
        var me = this;

        me.callParent();

        me.skeletonDomReady = true;
        me.refreshSkeleton();
    },

    getSkeletonRoot: function () {
        return this.el;
    }
});
