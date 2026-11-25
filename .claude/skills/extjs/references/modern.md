# Modern toolkit patterns (Ext JS 8)

Verify any class or config here against `modern/modern/src/` in the SDK before relying on it.

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

    classCls: 'nc-avatar',

    template: [{
        reference: 'innerElement',
        cls: 'nc-avatar-inner'
    }],

    initialize: function () {
        this.callParent();
        // post-construction setup; template elements already exist
    },

    updateName: function (name) {
        this.innerElement.setHtml(Ext.String.htmlEncode(
            NC.avatar.AvatarUtil.getInitials(name)));
    },

    doDestroy: function () {
        this.callParent();
    }
});
```
- Template elements are created at construction, so `updateX` can usually touch them directly (unlike Classic).
- `classCls` styles the class and subclasses; `cls`/`userCls` for instances.
- `painted` fires when the component is actually visible and measured.

## Containers and layouts
- `Ext.Container`, `Ext.Panel` with `layout: 'hbox' | 'vbox' | 'card' | 'fit' | 'float' | 'center'`. No `border` layout: use hbox/vbox plus `docked` items.
- Toolbars: `tbar`, `bbar`, or items with `docked: 'top' | 'bottom' | 'left' | 'right'`.
- Card navigation: `setActiveItem(i)`.
- Responsive: `platformConfig`, `responsiveConfig` (with the `responsive` plugin).

## Fields
- Base classes: `Ext.field.Field`, `Ext.field.Text`, `Ext.field.Picker` (`picker: 'floated' | 'edge' | 'auto'`, implement `createFloatedPicker()` / `createEdgePicker()`), `Ext.field.Container` for composite fields.
- Labels: `label`, `labelAlign`; required: `required: true`; `validators`; `placeholder`.
- Validation: `validate()`, `isValid()`, `setError()`.

## Data views, grids, trees
- `Ext.dataview.DataView` (`dataview`) with `itemTpl`; `Ext.dataview.List` (`list`) supports `grouped` with a store grouper.
- `Ext.grid.Grid` (`grid`), `Ext.grid.Tree` (`tree`) with `xtype: 'treecolumn'`.
- Events: `childtap`, `select`, `deselect`, `selectionchange`; selection via `selectable`.
- Plugins (verify names in SDK): `gridcellediting`, `rowedit`, `grideditable`, `gridrowdragdrop`, tree drag-and-drop.
- Cell HTML: `cell: { encodeHtml: false }` only deliberately, with encoded data.

## Floating and overlays
- `Ext.Dialog` (`dialog`), `Ext.Sheet`, `Ext.menu.Menu`, `tooltip` config.
- `setMasked({ xtype: 'loadmask', message: '...' })` / `setMasked(false)`.

## Drag and drop
- Core `Ext.drag.Source` / `Ext.drag.Target` (shared with Classic).

## Events
- Pointer: `tap`, `doubletap`, `longpress`, `childtap`; gestures `drag`, `swipe`, `pinch` on elements.

## Theming
- Themes: `theme-material` (default), `theme-triton`, `theme-neptune`, `theme-ios`.
- Material exposes many colors as CSS variables; check `modern/theme-*/sass/var/` in the SDK for variable names.
