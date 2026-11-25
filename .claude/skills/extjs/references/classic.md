# Classic toolkit patterns (Ext JS 8)

Verify any class or config here against `classic/classic/src/` in the SDK before relying on it.

## Component skeleton
```javascript
Ext.define('NC.avatar.Avatar', {
    extend: 'Ext.Component',
    xtype: 'nc-avatar',

    requires: ['NC.avatar.AvatarUtil'],

    config: {
        name: null,
        src: null
    },

    baseCls: 'nc-avatar',

    renderTpl: [
        '<div id="{id}-innerEl" data-ref="innerEl" class="{baseCls}-inner"></div>'
    ],
    childEls: ['innerEl'],

    initComponent: function () {
        this.callParent();
        // setup that does not need the DOM
    },

    afterRender: function () {
        this.callParent(arguments);
        this.syncContent();          // DOM exists now
    },

    updateName: function () {
        if (this.rendered) {
            this.syncContent();
        }
    },

    privates: {
        syncContent: function () {
            this.innerEl.setHtml(Ext.String.htmlEncode(
                NC.avatar.AvatarUtil.getInitials(this.getName())));
        }
    },

    doDestroy: function () {
        // release resources
        this.callParent();
    }
});
```
- `updateX` can run before render: guard DOM work with `this.rendered`, or sync in `afterRender`.
- `childEls` + `data-ref` give `this.innerEl` as an `Ext.dom.Element`.
- For data-driven markup, `tpl` + `data` (`update(data)`) is often simpler than `renderTpl`.

## Containers and layouts
- `Ext.container.Container`, `Ext.panel.Panel` with `layout: 'hbox' | 'vbox' | 'card' | 'fit' | 'border' | 'anchor' | 'column'`.
- Toolbars: `tbar`, `bbar`, `dockedItems`.
- Card navigation: `getLayout().setActiveItem(i)`.

## Fields
- Base classes: `Ext.form.field.Base` (single input, `fieldSubTpl`), `Ext.form.field.Text`, `Ext.form.field.Picker` (implement `createPicker()`), `Ext.form.FieldContainer` with the `Ext.form.field.Field` mixin for composite fields.
- Labels: `fieldLabel`, `labelAlign`; required: `allowBlank: false`; errors via `getErrors(value)`.
- Form submit data: `getSubmitData()`, `getModelData()`; value: `getValue()` / `setValue()` / `getRawValue()`.
- Existing UX to compare with: `Ext.ux.TreePicker`, `Ext.ux.form.ItemSelector`, `Ext.ux.form.MultiSelect` (in `packages/ux`).

## Data views, grids, trees
- `Ext.view.View` (`dataview`): `tpl`, `itemSelector`, `store`; events `itemclick`, `selectionchange`.
- `Ext.grid.Panel` (`grid`), `Ext.tree.Panel` (`treepanel`) with `xtype: 'treecolumn'`.
- Plugins: `cellediting`, `rowediting`, `gridviewdragdrop` and `treeviewdragdrop` (configured on `viewConfig.plugins`).
- `loadMask` on views; `bufferedRenderer` for large grids.

## Floating and overlays
- `Ext.window.Window`, `Ext.menu.Menu`, `Ext.tip.ToolTip` (or `data-qtip` attributes with QuickTips).
- `setLoading('Loading...')` / `setLoading(false)`, or `el.mask()`.

## Drag and drop
- Core `Ext.drag.Source` / `Ext.drag.Target` (shared with Modern, preferred for new code).
- Legacy `Ext.dd.DragZone` / `Ext.dd.DropZone` (Classic only).

## Events
- Pointer: `click`, `dblclick`, `itemclick`, `itemdblclick`, `contextmenu`.
- Element listeners: `this.el.on('click', fn, this, { delegate: '.nc-x' })`.

## Theming
- Themes: `theme-triton` (default), `theme-neptune`, `theme-crisp`, `theme-classic`, `theme-gray`.
- Use `ui` configs and SASS variables; check `classic/theme-*/sass/var/` in the SDK for variable names.
