/**
 * Placeholder shapes shown while content loads, for the Modern toolkit.
 *
 *     Ext.create('NC.skeleton.Skeleton', {
 *         renderTo: Ext.getBody(),
 *         width: 300,
 *         lines: 4
 *     });
 *
 *     Ext.create('NC.skeleton.Skeleton', { renderTo: Ext.getBody(), preset: 'list', rows: 3 });
 *
 * All configs live in {@link NC.skeleton.SkeletonBase} and are the same in the Classic toolkit.
 * To cover a grid, list or form while its store loads, use {@link NC.skeleton.SkeletonPlugin}.
 */
Ext.define('NC.skeleton.Skeleton', {
    extend: 'NC.skeleton.SkeletonBase',
    xtype: 'nc-skeleton',

    initialize: function () {
        var me = this;

        me.callParent();

        // The element exists now.
        me.skeletonReady = true;
        me.skeletonDomReady = true;
        me.refreshSkeleton();
    },

    getSkeletonRoot: function () {
        return this.element;
    }
});
