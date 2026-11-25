---
name: extjs
description: How to write Ext JS 8 code in this project for BOTH the Classic and Modern toolkits, always using Ext JS classes and methods (Ext.Array, Ext.Object, Ext.String, Ext.Date, Ext.util.Format, Ext.Ajax, Ext.defer, Ext.XTemplate, ComponentQuery, stores...) instead of native JavaScript or DOM equivalents. Use this skill before writing, editing, or reviewing ANY Ext JS code in new-components/, classic/ or modern/ — components, plugins, mixins, fields, stores, models, ViewControllers, ViewModels, SASS, demo pages — even for small edits.
---

# Ext JS 8 — Classic and Modern

Guiding rule: **if Ext JS provides a class or method for something, use it instead of the native JavaScript or DOM equivalent.** Framework methods are null-safe, cross-browser, scope-aware, and integrate with the component lifecycle, events, binding, and destruction.

## 1. Golden rules
1. **Ext JS method first.** Before writing a native call (`arr.map`, `setTimeout`, `fetch`, `JSON.parse`, `querySelector`, `alert`, `Object.assign`, template literals for markup), look it up in [references/ext-methods.md](references/ext-methods.md).
2. **Native only when Ext has nothing**, and mark it: `// native: Ext JS has no API for upload progress`. Examples that are legitimately native: `File`/`FileReader`/`DataTransfer`, `URL.createObjectURL`, `Blob` downloads, `String.prototype.normalize`.
3. **Know which toolkit you are in.** Code in `new-components/src/` runs in both toolkits; code in `classic/src/` or `modern/src/` runs in one. Never use toolkit-only classes in `src/`.
4. **Verify, don't guess.** If you are not certain a class, config, method, or event exists in Ext JS 8 for the toolkit at hand, grep the SDK (section 3) before using it.
5. **Every class uses `Ext.define`**, namespaced under `NC.` in the package, file path matching class name, `alias`/`xtype` prefixed `nc-`.
6. **No global ids, no `Ext.getCmp`.** Use `reference` + `lookup()`, `itemId`, `up()`/`down()`/`query()`.
7. **Always `callParent`** when overriding framework methods.
8. **Configs, not setters.** Expose settable state through `config: {}` and react in `applyX`/`updateX`. Never override generated setters.
9. **Encode user data** shown as HTML: `Ext.String.htmlEncode`, `:htmlEncode` in templates, `encodeHtml` on Modern cells.
10. **Clean up** everything you create: `Ext.destroy(a, b)`, `destroyable: true` listeners, `doDestroy()` with `callParent()`.
11. **Declarative over imperative.** Prefer configs, `bind`, `listeners`, `reference`, `xtype` objects, and named handlers over manual wiring.

## 2. Where code goes (package)
| Kind of code | Location | Example |
|---|---|---|
| Pure logic, no DOM or components | `src/` singleton or class | `NC.avatar.AvatarUtil` |
| Models, stores, proxies | `src/` | `NC.schedule.Task` |
| Behavior shared by both toolkit views | `src/` mixin using only APIs present in both toolkits | `NC.stepper.StepperMixin` |
| Shared base with toolkit hooks | `src/` `*Base` class + toolkit subclass of the real name | `NC.skeleton.SkeletonPluginBase` → `NC.skeleton.SkeletonPlugin` |
| Visual components | `classic/src/` and `modern/src/`, same class name and xtype | `NC.avatar.Avatar` |
| Global SASS variables and mixins | `sass/etc/all.scss` | `$nc-avatar-palette` |
| Per-class SASS | `<toolkit>/sass/var/<path>.scss` and `<toolkit>/sass/src/<path>.scss`, or the shared `sass/var`, `sass/src` | `modern/sass/src/avatar/Avatar.scss` |

Classes available in both toolkits (usable from `src/`) include core (`Ext.Base`, `Ext.util.*`, `Ext.data.*`, `Ext.app.ViewModel`, `Ext.app.ViewController`, `Ext.XTemplate`, `Ext.dom.Element`, `Ext.plugin.Abstract`, `Ext.drag.*`) and the charts package (`Ext.draw.*`). Confirm in the SDK's `packages/core/src` and `packages/charts/src` before relying on one.

## 3. Checking the SDK
The SDK root is `D:\Aumenta\Sencha\ext\ext-8.0.0\` (or a test app's `ext/` folder). Useful folders:
- `classic/classic/src/` — Classic toolkit classes
- `modern/modern/src/` — Modern toolkit classes
- `packages/core/src/` — shared core (data, util, dom, app, drag, plugin)
- `packages/charts/src/` plus `packages/charts/classic/` and `packages/charts/modern/` — `Ext.draw`, charts
- `packages/ux/` — UX extensions (Classic has `Ext.ux.TreePicker`, `Ext.ux.form.ItemSelector`)

Typical checks:
```bash
grep -rn "alias: 'plugin.treedragdrop'" "<sdk>/modern/modern/src"
grep -rln "Ext.define('Ext.field.Picker'" "<sdk>/modern/modern/src"
```
When you need a pattern (templates, pickers, plugins), read a similar SDK class and follow its structure.

## 4. Class system essentials
```javascript
Ext.define('NC.avatar.AvatarUtil', {
    singleton: true,

    getInitials: function (name) {
        var words = Ext.String.splitWords(Ext.String.trim(name || ''));

        if (Ext.isEmpty(words)) {
            return '';
        }
        return Ext.String.format('{0}{1}',
            words[0].charAt(0),
            words.length > 1 ? words[words.length - 1].charAt(0) : ''
        ).toUpperCase();
    }
});
```
- `config: {}` for anything settable, bindable, or reactive; `applyX` transforms/validates, `updateX` reacts.
- `publishes` / `twoWayBindable` for values the ViewModel should receive.
- `mixins`, `privates`, `statics`, `inheritableStatics` where appropriate.
- `Ext.create('Class', cfg)` or `Ext.create({ xtype })`, never `new` for framework classes.
- `requires` every class you reference by name; `uses` for late references.

## 5. Component lifecycle by toolkit
| Concern | Classic | Modern |
|---|---|---|
| Post-construction setup | `initComponent()` (call parent) | `initialize()` (call parent) |
| Markup | `renderTpl` + `childEls`, or `tpl` + `data` | `template` / `element` config with `reference`s, or `tpl` + `data` |
| After DOM exists | `afterRender()` / `render` event | `painted` event or `initialize()` |
| Cleanup | `doDestroy()` (call parent) | `doDestroy()` (call parent) |
| Pointer event | `click` | `tap` |
| Loading overlay | `setLoading()` / `mask()` | `setMasked({ xtype: 'loadmask' })` |

Toolkit-specific patterns: [references/classic.md](references/classic.md) and [references/modern.md](references/modern.md). Read the one for the toolkit you are writing, both when writing shared code.

## 6. Events in this package
- Our own events are named by **intent**, not gesture, so one name works in both toolkits: `select`, `change`, `complete`, `stepchange`, `cardmove`, `overflowselect`. Never `click`/`tap` in our own event names.
- Fire with `me.fireEvent('name', me, ...)`; the component is always the first argument.
- Cancelable actions get a `before<name>` event; returning `false` cancels.

## 7. MVVM in the test apps
- View: layout, configs, bindings, handler names only.
- ViewController (`alias: 'controller.x'`): behavior, handlers referenced by string name.
- ViewModel (`alias: 'viewmodel.x'`): data, stores, formulas.
- Package components themselves are self-contained: they don't require an app ViewController, but they work inside one (named handlers, `bind`, `reference`).

## 8. Data
- Stores and models over arrays; `proxy` over manual `Ext.Ajax` + copying.
- Store methods over array helpers: `query`, `queryBy`, `findRecord`, `getById`, `each`, `collect`, `sum`, `filter`, `filterBy`, `sort`.
- Chained stores (`source`) for filtered views of the same data.
- Validators in models (`validators: { email: 'email' }`).

## 9. Anti-patterns
- Native helpers where Ext has one (see references/ext-methods.md).
- `Ext.getCmp`, hard-coded `id`s, globals.
- Classic classes in Modern code or vice versa; toolkit classes in `src/`.
- Overriding setters instead of `applyX`/`updateX`; forgetting `callParent`.
- Direct DOM manipulation instead of `addCls`, `setStyle`, `setHtml`, `tpl`.
- Unencoded user data in `html`, `tpl`, renderers, messages.
- Listeners, timers, or floating pickers left alive after destroy.

## 10. Checklist before finishing any code
- [ ] Every native call is either replaced by Ext JS or has a `// native:` comment.
- [ ] Shared code in `src/` uses only APIs that exist in both toolkits.
- [ ] Our configs, methods, and events are identical in both toolkit classes.
- [ ] `Ext.define`, correct namespace and path, `nc-` aliases, `requires` complete.
- [ ] `callParent` everywhere it's needed; `applyX`/`updateX` instead of setter overrides.
- [ ] User data HTML-encoded.
- [ ] Resources released in `doDestroy`; async callbacks check `me.destroyed`.
- [ ] Any API you weren't sure about was verified in the SDK.
