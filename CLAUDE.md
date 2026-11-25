# new-components

A Sencha Cmd package of custom Ext JS 8 components that work in both the **Classic** and **Modern** toolkits, plus two test apps used to build and demo them. The package is shared with the team; the test apps are for development only.

## Repository layout
- `new-components/` — the Sencha package (the deliverable).
  - `src/` — toolkit-agnostic code: utilities, models, stores, mixins, `*Base` classes.
  - `classic/src/`, `modern/src/` — toolkit views. Same class name in both folders.
  - `sass/`, `classic/sass/`, `modern/sass/` — shared and toolkit styles.
  - `docs/` — one page per component. `CHANGELOG.md` at package root.
- `classic/` — Classic toolkit test app. Requires the package; one demo page per component.
- `modern/` — Modern toolkit test app. Same structure.
- `ROADMAP.md` — phases and their status. Keep it current.
- `.claude/skills/` — project skills (listed below).

## Project constants
| Item | Value |
|---|---|
| Package name | `new-components` |
| JS namespace | `NC` (classes like `NC.avatar.Avatar`) |
| xtype / alias prefix | `nc-` (`xtype: 'nc-avatar'`, `alias: 'plugin.nc-skeleton'`) |
| CSS class prefix | `nc-` |
| SASS variable prefix | `$nc-` |
| Ext JS version | 8.0.0 |
| SDK location | `D:\Aumenta\Sencha\ext\ext-8.0.0\` (each test app may also hold a copy in its `ext/` folder) |

## Rules that always apply
1. **Ext JS first.** Use Ext JS classes and methods whenever they exist. Native JavaScript or DOM APIs only when Ext JS has no equivalent, and then with a `// native: <reason>` comment. The `extjs` skill has the details.
2. **One public API, two toolkits.** Our own configs, methods, and events are identical in Classic and Modern. Inherited framework configs follow each toolkit's conventions (`fieldLabel` in Classic, `label` in Modern).
3. **Shared code stays shared.** Anything in `new-components/src/` must run in both toolkits. Never reference toolkit-only classes there.
4. **Never guess an API.** Before using a class, config, method, or event you are not certain exists in Ext JS 8, check the SDK source (grep the SDK folders listed in the `extjs` skill). If it doesn't exist, say so and pick an alternative.
5. **Sencha Cmd boundaries.** Never run `sencha generate ...` (the user does that). Never run `sencha app watch` (it blocks). You may run `sencha app refresh` and `sencha app build development` inside `classic/` or `modern/` to check for errors.
6. **Git.** Work on the phase branch. Don't commit or push unless the user asks; propose a commit message instead.
7. **Plan before code.** At the start of every component, present the public API and file list and wait for the user's approval.

## Skills
- `extjs` — how to write Ext JS code in this project, for both toolkits. Load it before writing or reviewing any Ext JS code.
- `component-workflow` — standard steps and definition of done for every component.
- `phase-00-foundation` … `phase-14-gantt` — one per phase, started by the user with `/phase-NN-name`.

If a skill named `extjs-modern` is also available (synced from claude.ai), the project `extjs` skill takes precedence in this repo; its Modern-only rules do not apply to Classic code.

## Commands (run inside `classic/` or `modern/`)
- After adding, renaming, or deleting class files, or changing `requires` / `app.json` / `package.json`: `sencha app refresh`
- After SASS or theme changes: `sencha app build development`
- The user tests with `sencha app watch` in each app.
