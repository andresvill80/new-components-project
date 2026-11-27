# Skeleton Loader

Grey placeholder shapes that show where content will appear while it loads. There are two parts, with the same configs and methods in Classic and Modern:

- `nc-skeleton` (`NC.skeleton.Skeleton`): a widget you place yourself.
- `nc-skeleton` plugin (`NC.skeleton.SkeletonPlugin`): covers a grid, list or form with a skeleton while its store loads.

## Skeleton widget configs

| Config | Type | Default | Description |
|---|---|---|---|
| `shape` | String | `'text'` | `'text'` (lines of text), `'circle'` or `'rect'`. Ignored when `preset` is set. |
| `lines` | Number | `3` | Lines of a `text` shape. The last one is shorter. |
| `preset` | String | `null` | `'list'`, `'card'`, `'form'` or `'table'`. |
| `rows` | Number | by preset | Repeat count of the preset: list 5, card 1, form 4, table 6. |
| `animated` | Boolean | `true` | Shimmer. It also stops by itself when the system asks for reduced motion. |
| `width`, `height` | Number | | The standard component configs. Without them a text skeleton is as wide as its container, a circle is 40px and a rect is 120px high. |

## Plugin configs

| Config | Type | Default | Description |
|---|---|---|---|
| `preset` | String | by host | `'table'` for a grid, `'list'` for a list or data view, `'form'` for a form. |
| `rows` | Number | by preset | Repeat count of the preset. |
| `store` | String/Store | host's store | The store to follow. Needed for a form, which has no store. |
| `minDisplayTime` | Number | `300` | Minimum milliseconds the skeleton stays once shown, so fast loads do not flicker. |

### Plugin methods

| Method | Description |
|---|---|
| `show()` | Shows the skeleton. It stays until `hide()` is called or, when it was shown by a load, until the load ends. |
| `hide(immediate)` | Hides it, after `minDisplayTime` has passed. `hide(true)` hides it now. |
| `isShowing()` | `true` while it is shown. |
| `setStore(store)` | Follows another store (also handled automatically when the host gets a new store). |

The plugin has no events: listen to the store's `beforeload` and `load`.

## How the plugin behaves

- Shows on the store's `beforeload`, hides on `load`, which also fires when the load fails.
- A store that is already loading when the plugin binds shows the skeleton at once.
- Switches off the host's own load mask while attached (Classic: the view's `loadMask`; Modern: `loadingText`) so two loading indicators do not stack.
- Sets `aria-busy="true"` on the host while shown.
- Grids keep their column headers visible: the skeleton covers only the rows area.
- Removes everything it made (listeners, timer, skeleton, ARIA attribute) and gives the host mask back when it is destroyed.

## Examples

Classic grid:

```javascript
{
    xtype: 'grid',
    store: store,
    plugins: [{ ptype: 'nc-skeleton', minDisplayTime: 400 }],
    columns: [ /* ... */ ]
}
```

Modern grid:

```javascript
{
    xtype: 'grid',
    store: store,
    plugins: {
        'nc-skeleton': { minDisplayTime: 400 }
    },
    columns: [ /* ... */ ]
}
```

A form (no store of its own): follow a store or drive it by hand.

```javascript
// Classic; in Modern use `form.findPlugin('nc-skeleton')` the same way.
var plugin = form.findPlugin('nc-skeleton');

plugin.setStore(profileStore);   // shows while profileStore loads
plugin.show();                   // or by hand
plugin.hide();
```

Standalone:

```javascript
{ xtype: 'nc-skeleton', width: 260, lines: 3 }
{ xtype: 'nc-skeleton', shape: 'circle', width: 64, height: 64 }
{ xtype: 'nc-skeleton', preset: 'list', rows: 3 }
```

## Styling

- Variables in `sass/etc/all.scss`: `$nc-skeleton-color`, `$nc-skeleton-highlight`, `$nc-skeleton-overlay-background` (set it to the background of your grids), sizes and `$nc-skeleton-shimmer-duration`.
- Classes: `.nc-skeleton`, `.nc-skeleton-item`, `.nc-skeleton-overlay`, `.nc-skeleton-animated`.
- The shimmer is CSS only and is disabled under `@media (prefers-reduced-motion: reduce)`.

## Known limitations

- A Classic plain data view (`Ext.view.View`) that gets its store later through `bind` is not detected, because the view only refreshes after it loads. Give the view its store directly, or call `plugin.setStore(store)`.
- The skeleton covers the host's body. A Classic data view that scrolls is its own scrolling element; the skeleton is kept in view when scrolled.
- Presets are fixed layouts. For a different layout, build one from several `nc-skeleton` widgets and show it with `show()` / `hide()` on your own container.
