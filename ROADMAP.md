# Roadmap

Each phase builds one component (or one foundation layer) in both toolkits. Start a phase in Claude Code with its skill, e.g. `/phase-01-avatar`.

Status values: `not started` · `in progress` · `done`

| Phase | Component | Skill | Branch | Status |
|---|---|---|---|---|
| 00 | Foundation: package, wiring, demo shells | `/phase-00-foundation` | `phase/00-foundation` | done |
| 01 | Avatar / Avatar Group | `/phase-01-avatar` | `phase/01-avatar` | done |
| 02 | Skeleton Loader | `/phase-02-skeleton` | `phase/02-skeleton` | not started |
| 03 | Stepper / Wizard | `/phase-03-stepper` | `phase/03-stepper` | not started |
| 04 | OTP / PIN Field | `/phase-04-otp-field` | `phase/04-otp-field` | not started |
| 05 | Date Range Field | `/phase-05-date-range-field` | `phase/05-date-range-field` | not started |
| 06 | Tree Picker Field | `/phase-06-tree-picker` | `phase/06-tree-picker` | not started |
| 07 | Timeline | `/phase-07-timeline` | `phase/07-timeline` | not started |
| 08 | Dual List Selector | `/phase-08-dual-list` | `phase/08-dual-list` | not started |
| 09 | File Drop Zone | `/phase-09-file-drop-zone` | `phase/09-file-drop-zone` | not started |
| 10 | Site Map Builder | `/phase-10-sitemap-builder` | `phase/10-sitemap-builder` | not started |
| 11 | Kanban Board | `/phase-11-kanban` | `phase/11-kanban` | not started |
| 12 | Scheduling core (tasks, dependencies, critical path) | `/phase-12-scheduling-core` | `phase/12-scheduling-core` | not started |
| 13 | PERT Chart | `/phase-13-pert-chart` | `phase/13-pert-chart` | not started |
| 14 | Gantt Chart (3 stages) | `/phase-14-gantt` | `phase/14-gantt` | not started |

## Notes
Record decisions that affect later phases here (naming changes, discovered SDK limitations, shared utilities added).

- **Phase 00, package resolution:** adding the repo root to `packages.dir` makes Cmd find the package, but `sencha app watch` only serves the app folder, so files under `../new-components` return 404 in the browser. Decision: each test app uses a Windows directory junction `<app>/packages/local/new-components` -> repo `new-components/` (`New-Item -ItemType Junction`). `packages.dir` stays at the Cmd default. The junction folders are git-ignored; every teammate creates them once (see `new-components/Readme.md`).
- **Phase 00, SDK version:** the test apps use Ext JS 8.1.0.13; `CLAUDE.md` now says so, and API checks are made against the app `ext/` copies.
- **Phase 00, demo shell:** both apps keep the name `MyApp`. A demo is added by writing its view class and setting its `viewXtype` in `app/store/Demos.js`. `MyApp.view.demo.EventLog.log(name, args)` prints to the event log.
- **Phase 01, config names that clash with `Ext.Component`:** a config named like an existing framework property replaces its getter/setter. `size` (Classic `getSize()` / `setSize()`) and `data` (template data in both toolkits) are taken, so the avatar uses `avatarSize` and the group uses `avatars`. Before naming a config on a component, grep both toolkits' `Component.js` and `Container.js` for `get<Name>` / `set<Name>` / `<name>:`.
- **Phase 01, pattern for shared component logic:** a `src/` `*Base` class extending `Ext.Component` (configs, validation, `getAvatarInfo()`, DOM sync) with the toolkit class supplying only markup, root element, pointer event and tooltip. For containers use a `src/` mixin instead, because the container class differs per toolkit (`Ext.container.Container` vs `Ext.Container`; extending `Ext.Container` in Classic is not reliable). The toolkit class sets a `*Ready` flag at `initComponent` / `initialize` so config updaters that run during construction do nothing.
- **Phase 01, DOM helpers that work in both toolkits:** `Ext.dom.Element` `set({attr: undefined})` removes an attribute, `setHtml`, `setStyle({...})`; `this.mon(el, {...})` for managed listeners; `Ext.util.Format.nl2br(Ext.String.htmlEncode(text))` for tooltip HTML. Classic tooltips use `data-qtip`, Modern the `tooltip` config; both need the app's `quickTips` on.
- **Phase 01, SASS (Fashion):** do not use `filter: brightness(...)` (read as a Sass color function and fails the build). `@for`, `map-get`, `nth`, `length`, `@mixin` and `@media (prefers-reduced-motion: ...)` compile. Shared `sass/src/<ns>/<Class>.scss` is picked up by both toolkits when both classes share markup. `$nc-avatar-palette` has 8 entries and must match `NC.avatar.AvatarUtil.paletteSize`.
- **Phase 01, group layout:** Classic group uses `auto` layout with inline avatars (so CSS can overlap them), Modern uses `hbox`; overlap is `margin-left` in `em` of the avatar's own font size so it works with any size.
- **Phase 01, demos:** sample pictures are in `<app>/resources/avatars/`; avatar demo CSS is in `app/view/demo/AvatarDemo.scss` (`.demo-section`, `.demo-item`), reusable by later demos.
