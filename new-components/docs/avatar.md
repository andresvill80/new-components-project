# Avatar / Avatar Group

`nc-avatar` shows a person as a picture, with their initials as fallback, a size, a shape, a color taken from their name and an optional status dot. `nc-avatargroup` shows a row of avatars with a "+N" bubble for the rest. Both work in Classic and Modern with the same configs, methods and events.

Classes: `NC.avatar.Avatar`, `NC.avatar.AvatarGroup`, helper `NC.avatar.AvatarUtil`.

## Avatar configs

| Config | Type | Default | Description |
|---|---|---|---|
| `name` | String | `''` | Full name. Used for the initials, the color, the tooltip and the accessible label. |
| `src` | String | `null` | Image URL. Initials show until it loads and if it fails. |
| `initials` | String | `null` | Text shown instead of the initials taken from `name`. |
| `avatarSize` | String/Number | `'medium'` | `'small'` (24px), `'medium'` (40px), `'large'` (64px) or a number of pixels. |
| `shape` | String | `'circle'` | `'circle'`, `'rounded'` or `'square'`. |
| `status` | String | `null` | `'online'`, `'away'`, `'busy'` or `'offline'`. Anything else means no status. |
| `colorIndex` | Number | `null` | Palette index that replaces the color calculated from the name. |
| `showTooltip` | Boolean | `true` | Show the name (and status) as a tooltip. |
| `selectable` | Boolean | `false` | Makes the avatar focusable and fires `select`. |
| `statusLabels` | Object | English | Accessible text of each status, for other languages. |
| `accessibleLabel` | String | `null` | Replaces the accessible label (name plus status). |
| `tipText` | String | `null` | Plain text for the tooltip instead of the name. `\n` makes line breaks. |

Every config has the usual getter and setter (`setName`, `setStatus`, ...). `getInitialsText()` returns the text currently shown.

`avatarSize` is not called `size` because `size` would replace `getSize()` / `setSize()` of Classic's `Ext.Component`.

### Avatar events

| Event | Arguments | Description |
|---|---|---|
| `select` | `avatar` | The avatar was clicked / tapped, or Enter or Space was pressed on it. Only when `selectable` is `true`. |

## Avatar Group configs

| Config | Type | Default | Description |
|---|---|---|---|
| `avatars` | Object[] | `null` | People: `{ name, src, status }`, optionally `initials` and `colorIndex`. |
| `store` | Store/String | `null` | A store (or store id) with the same fields. Wins over `avatars`. |
| `max` | Number | `4` | Avatars shown before the "+N" bubble. |
| `avatarSize` | String/Number | `'medium'` | Size of every avatar. |
| `shape` | String | `'circle'` | Shape of every avatar. |
| `overlap` | Boolean | `true` | Overlap the avatars. |

`getVisibleCount()` returns how many avatars are visible (without the bubble). The group is called `avatars`, not `data`, because `data` is the template data config of `Ext.Component`.

### Avatar Group events

| Event | Arguments | Description |
|---|---|---|
| `avatarselect` | `group, data` | A visible avatar was activated. `data` is the object from `avatars`, or the record when using a `store`. |
| `overflowselect` | `group, hiddenItems` | The "+N" bubble was activated. `hiddenItems` are the objects or records that are not visible. Its tooltip lists their names. |

## Helper: `NC.avatar.AvatarUtil`

| Member | Description |
|---|---|
| `getInitials(name)` | First letter of the first and the last word, uppercased: `'Juan Pérez'` gives `'JP'`, `'Ana'` gives `'A'`, empty gives `''`. |
| `getColorIndex(name, paletteSize)` | Stable number from `0` to `paletteSize - 1` from the name, so a person always gets the same color. |
| `paletteSize` | Number of colors in the SASS palette (8). |

## Examples

Classic and Modern use the same configuration:

```javascript
Ext.create('NC.avatar.Avatar', {
    renderTo: Ext.getBody(),
    name: 'Juan Pérez',
    src: 'resources/avatars/user1.svg',
    avatarSize: 'large',
    status: 'online',
    selectable: true,
    listeners: {
        select: function (avatar) {
            Ext.toast('Selected ' + avatar.getName());   // Classic; use Ext.toast in Modern too
        }
    }
});
```

```javascript
Ext.create('NC.avatar.AvatarGroup', {
    renderTo: Ext.getBody(),
    max: 3,
    avatars: [
        { name: 'Ana', status: 'online' },
        { name: 'Juan Pérez' },
        { name: 'María José López Hernández' },
        { name: 'Luis Gómez' }
    ],
    listeners: {
        avatarselect: function (group, data) { /* data is the object above */ },
        overflowselect: function (group, hiddenItems) { /* [{ name: 'Luis Gómez' }] */ }
    }
});
```

In a view: `{ xtype: 'nc-avatar', bind: { name: '{user.name}', status: '{user.status}' } }`, or `{ xtype: 'nc-avatargroup', bind: { store: '{people}' } }`.

## Styling

- Colors: `$nc-avatar-palette` in `sass/etc/all.scss`. If you change the number of entries, change `NC.avatar.AvatarUtil.paletteSize` to match.
- Sizes: `$nc-avatar-size-small`, `-medium`, `-large`. Status colors come from `$nc-status-colors`.
- Classes: `.nc-avatar`, `.nc-avatar-<shape>`, `.nc-avatar-<size>`, `.nc-avatar-color-N`, `.nc-avatar-status-<status>`, `.nc-avatargroup`.

## Accessibility

- A display-only avatar has `role="img"` and an `aria-label` made of the name and the status (for example "Juan Pérez, Online").
- A `selectable` avatar has `role="button"` and `tabindex="0"`, shows a focus outline and reacts to Enter and Space.
- The status dot and the picture are decorative (`aria-hidden`, empty `alt`).
- Text colors on the palette meet a 4.5:1 contrast ratio. Hover animation is disabled for users who prefer reduced motion.

## Known limitations

- Tooltips need quick tips: set `quickTips: true` in your `Ext.app.Application` (the test apps do this on desktop). Without it the avatar still works, only without tooltips.
- A picture that fails to load is logged by the browser as a network error (a 404); the avatar itself shows the initials without any script error.
- The group rebuilds its avatars when `avatars`, `store` data or `max` change. Changing an array passed to `avatars` in place does nothing; call `setAvatars` with the new array.
- Initials use the first character of a word; names that start with an emoji or other multi-code-unit character may show half a character.
- Classic group avatars flow inline (`auto` layout) while Modern uses an `hbox` layout; they look the same.
