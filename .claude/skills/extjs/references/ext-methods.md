# Ext JS methods over native JavaScript

Use the right-hand column. Native methods are acceptable only when Ext JS has no equivalent, with a `// native: <reason>` comment. If you're unsure a method exists in Ext JS 8, grep `packages/core/src` in the SDK.

## Contents
1. Type checks and object helpers
2. Arrays
3. Objects
4. Strings
5. Numbers
6. Dates
7. Formatting
8. JSON, AJAX and async
9. DOM, components and browser APIs
10. Example

## 1. Type checks and object helpers
| Native / ad-hoc | Ext JS |
|---|---|
| `v === null \|\| v === undefined \|\| v === ''` | `Ext.isEmpty(v)` (`Ext.isEmpty(v, true)` allows `''`) |
| `Array.isArray(v)` | `Ext.isArray(v)` |
| `typeof v === 'string'` | `Ext.isString(v)` |
| `typeof v === 'number'` | `Ext.isNumber(v)`; numeric strings: `Ext.isNumeric(v)` |
| `typeof v === 'function'` | `Ext.isFunction(v)` |
| `typeof v === 'object'` | `Ext.isObject(v)` (plain objects only) |
| `v instanceof Date` | `Ext.isDate(v)` |
| `typeof v === 'boolean'` | `Ext.isBoolean(v)` |
| `v !== undefined` | `Ext.isDefined(v)` |
| `v ?? def` / `v \|\| def` | `Ext.valueFrom(v, def)` |
| `Object.assign(target, src)` | `Ext.apply(target, src)`; only missing keys: `Ext.applyIf(target, src)` |
| deep merge | `Ext.Object.merge(target, src)` |
| `structuredClone(obj)` / JSON round-trip | `Ext.clone(obj)` |
| unique id | `Ext.id(null, 'nc-')` |
| `() => {}` placeholder | `Ext.emptyFn` |
| converting to array | `Ext.Array.from(v)` |

## 2. Arrays (`Ext.Array`)
| Native | Ext JS |
|---|---|
| `for` / `arr.forEach` | `Ext.Array.each(arr, fn, scope)` (return `false` to break) or `Ext.Array.forEach` |
| `arr.map` | `Ext.Array.map(arr, fn, scope)` |
| `arr.filter` | `Ext.Array.filter(arr, fn, scope)` |
| `arr.some` / `arr.every` | `Ext.Array.some` / `Ext.Array.every` |
| `arr.reduce` | `Ext.Array.reduce(arr, fn, initial)` |
| `arr.find` | `Ext.Array.findBy(arr, fn, scope)` |
| `arr.includes(x)` | `Ext.Array.contains(arr, x)` |
| `arr.indexOf(x)` | `Ext.Array.indexOf(arr, x)` |
| push only if absent | `Ext.Array.include(arr, x)` |
| `[...new Set(arr)]` | `Ext.Array.unique(arr)` |
| remove item | `Ext.Array.remove(arr, x)`; by index: `Ext.Array.removeAt(arr, i)` |
| `arr.splice(i, 0, ...items)` | `Ext.Array.insert(arr, i, items)` |
| `arr.splice(i, n)` | `Ext.Array.erase(arr, i, n)` / `Ext.Array.replace(arr, i, n, items)` |
| `arr.map(o => o.prop)` | `Ext.Array.pluck(arr, 'prop')` |
| sum / avg / min / max | `Ext.Array.sum`, `Ext.Array.mean`, `Ext.Array.min`, `Ext.Array.max` |
| `arr.flat(Infinity)` | `Ext.Array.flatten(arr)` |
| remove empty values | `Ext.Array.clean(arr)` |
| set operations | `Ext.Array.difference`, `Ext.Array.intersect`, `Ext.Array.union` / `Ext.Array.merge` |
| array → lookup map | `Ext.Array.toMap(arr, 'key')`, `Ext.Array.toValueMap(arr, 'key')` |
| compare arrays | `Ext.Array.equals(a, b)` |
| `arr.slice()` | `Ext.Array.slice(arr, begin, end)` / `Ext.Array.clone(arr)` |

When data lives in a store, use store methods instead: `query`, `queryBy`, `findRecord`, `getById`, `each`, `collect`, `sum`, `average`, `min`, `max`, `count`, `filter`, `filterBy`, `sort`.

## 3. Objects (`Ext.Object`)
| Native | Ext JS |
|---|---|
| `for...in` / `Object.entries(o).forEach` | `Ext.Object.each(o, function (key, value) {...}, scope)` |
| `Object.keys(o)` | `Ext.Object.getKeys(o)` |
| `Object.values(o)` | `Ext.Object.getValues(o)` |
| `Object.keys(o).length` | `Ext.Object.getSize(o)` |
| empty check | `Ext.Object.isEmpty(o)` |
| `URLSearchParams` (build / parse) | `Ext.Object.toQueryString(o)` / `Ext.Object.fromQueryString(str)` |
| find key by value | `Ext.Object.getKey(o, value)` |
| deep equality | `Ext.Object.equals(a, b)` |
| `Object.create(proto)` | `Ext.Object.chain(proto)` |

## 4. Strings (`Ext.String`)
| Native | Ext JS |
|---|---|
| template literal / concatenation | `Ext.String.format('{0} of {1}', a, b)` |
| `s.trim()` | `Ext.String.trim(s)` |
| `s.startsWith` / `s.endsWith` | `Ext.String.startsWith(s, x)` / `Ext.String.endsWith(s, x)` |
| `s.padStart(n, '0')` | `Ext.String.leftPad(s, n, '0')` |
| `s.repeat(n)` | `Ext.String.repeat(s, n, separator)` |
| capitalize | `Ext.String.capitalize(s)` / `Ext.String.uncapitalize(s)` |
| truncate with "..." | `Ext.String.ellipsis(s, length, wordBreak)` |
| escape HTML (also fine for XML text) | `Ext.String.htmlEncode(s)` / `Ext.String.htmlDecode(s)` |
| escape for RegExp | `Ext.String.escapeRegex(s)` |
| add query param to URL | `Ext.String.urlAppend(url, 'a=1')` |
| toggle between two values | `Ext.String.toggle(s, 'asc', 'desc')` |
| split words | `Ext.String.splitWords(s)` |

## 5. Numbers (`Ext.Number`)
| Native | Ext JS |
|---|---|
| `Math.min(Math.max(v, a), b)` | `Ext.Number.constrain(v, a, b)` |
| `isNaN(Number(v)) ? d : Number(v)` | `Ext.Number.from(v, d)` |
| `n.toFixed(2)` | `Ext.Number.toFixed(n, 2)` |
| random integer | `Ext.Number.randomInt(min, max)` |
| `parseInt` / `parseFloat` | `Ext.Number.parseInt(v)` / `Ext.Number.parseFloat(v)` |
| float comparison | `Ext.Number.isEqual(a, b, epsilon)` |
| snap to increment | `Ext.Number.snap(v, increment, min, max)` |

## 6. Dates (`Ext.Date`)
| Native | Ext JS |
|---|---|
| manual formatting / `toISOString()` | `Ext.Date.format(d, 'Y-m-d H:i')` |
| `new Date(str)` | `Ext.Date.parse(str, 'Y-m-d')` (strict, format-driven) |
| `d.setDate(d.getDate() + 5)` | `Ext.Date.add(d, Ext.Date.DAY, 5)` (also `MONTH`, `YEAR`, `HOUR`, `MINUTE`...) |
| difference | `Ext.Date.diff(a, b, Ext.Date.DAY)` |
| strip time | `Ext.Date.clearTime(d, true)` (`true` = return a clone) |
| range check | `Ext.Date.between(d, start, end)` |
| month helpers | `Ext.Date.getFirstDateOfMonth`, `getLastDateOfMonth`, `getDaysInMonth` |
| `Date.now()` | `Ext.Date.now()` |
| validity | `Ext.Date.isValid(y, m, d)` |
| copy | `Ext.Date.clone(d)` |
| day / month names | `Ext.Date.dayNames`, `Ext.Date.monthNames`, `Ext.Date.getShortDayName(i)`, `getShortMonthName(i)` |

## 7. Formatting (`Ext.util.Format`)
Use in renderers, templates, and code instead of `Intl`/`toLocaleString`:
`number(v, '0,000.00')`, `currency(v, '$', 2)`, `date(v, 'd/m/Y')`, `fileSize(bytes)`, `ellipsis(s, n)`, `htmlEncode(s)`, `nl2br(s)`, `capitalize(s)`, `uppercase(s)`, `lowercase(s)`, `percent(v)`, `undef(v)`, `defaultValue(v, def)`.
Locale-wide defaults: `Ext.util.Format.thousandSeparator`, `decimalSeparator`, `currencySign`, `Ext.Date.defaultFormat`.

## 8. JSON, AJAX and async
| Native | Ext JS |
|---|---|
| `JSON.parse(s)` | `Ext.decode(s)` / `Ext.JSON.decode(s, true)` (`true` = null instead of throwing) |
| `JSON.stringify(o)` | `Ext.encode(o)` / `Ext.JSON.encode(o)` |
| `fetch` / `XMLHttpRequest` | `Ext.Ajax.request({...})` (returns a thenable) |
| `new Promise` | `new Ext.Deferred()` + `deferred.promise`, or `new Ext.Promise(fn)` |
| `Promise.all` | `Ext.Deferred.all([...])` / `Ext.Promise.all([...])` |
| `setTimeout` | `Ext.defer(fn, ms, scope, args)`; cancel with `Ext.undefer(id)` |
| `setInterval` | `Ext.TaskManager.start({ run, interval, scope })` / `Ext.util.TaskRunner` |
| debounce | `Ext.Function.createBuffered(fn, ms, scope)` or listener option `buffer: ms` |
| throttle | `Ext.Function.createThrottled(fn, ms, scope)` |
| reschedulable timer | `new Ext.util.DelayedTask(fn, scope).delay(ms)` |
| `fn.bind(scope)` | `Ext.Function.bind(fn, scope, args)` / `Ext.bind(...)` |
| call if function | `Ext.callback(fn, scope, args)` (also resolves string handler names) |
| microtask | `Ext.asap(fn, scope)` |

## 9. DOM, components and browser APIs
| Native | Ext JS |
|---|---|
| `getElementById` / `querySelector` | `Ext.get(id)`, `Ext.fly(el)` (temporary, never keep it), `el.down(selector)` |
| `classList.add/remove/toggle` | `addCls` / `removeCls` / `toggleCls` (component or `Ext.dom.Element`) |
| `el.style.x = ...` | `setStyle({...})` |
| `el.innerHTML = ...` | `setHtml(...)` / `update(...)` or `tpl` + `setData` |
| `addEventListener` | `listeners` config, `cmp.on(...)`, `element.on(...)` (native DOM events like `drop` work on Ext elements; read `e.browserEvent`) |
| `document.body` | `Ext.getBody()` |
| create markup | `Ext.XTemplate`, `Ext.dom.Helper` / `el.createChild({...})` |
| find component | `Ext.ComponentQuery.query(sel)`, `up`, `down`, `query`, `lookup(ref)` |
| `alert` / `confirm` / `prompt` | `Ext.Msg.alert` / `Ext.Msg.confirm` / `Ext.Msg.prompt` |
| toast | `Ext.toast('Saved', 2000)` |
| `localStorage` | `Ext.util.LocalStorage.get('nc')` → `setItem`/`getItem`/`removeItem`, then `release()` |
| `document.cookie` | `Ext.util.Cookies.set` / `get` / `clear` |
| `window.addEventListener('resize')` | `Ext.on('resize', fn, scope)` |
| UA sniffing | `Ext.os`, `Ext.browser`, `Ext.platformTags`, `Ext.feature` |
| `DOMContentLoaded` | `Ext.onReady(fn)` |
| `Map` / custom collections | `Ext.util.Collection`, `Ext.util.HashMap` |
| `console.log` (debug) | `Ext.log({ level: 'warn', msg: '...' })` |
| pub-sub | `Ext.GlobalEvents.fireEvent('name', ...)` + `listen: { global: {...} }` |

## 10. Example
```javascript
// ❌ Plain JavaScript
const active = users.filter(u => u.active).map(u => u.name.trim());
const label = `${active.length} active: ${active.join(', ')}`;
setTimeout(() => alert(label), 500);

// ✅ Ext JS
var active = Ext.Array.map(
        Ext.Array.filter(users, function (u) { return u.active; }),
        function (u) { return Ext.String.trim(u.name); }),
    label = Ext.String.format('{0} active: {1}', active.length, active.join(', '));

Ext.defer(function () {
    Ext.Msg.alert('Users', Ext.String.htmlEncode(label));
}, 500);
```
