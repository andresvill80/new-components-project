# new-components

Custom Ext JS components for the **Classic** and **Modern** toolkits, with one public API for both.

- Package name: `new-components`
- JS namespace: `NC` (for example `NC.avatar.Avatar`)
- xtype / alias prefix: `nc-`
- Ext JS: 8.x, toolkits `classic` and `modern`
- Themes: any Ext JS theme for the toolkit in use (tested with `theme-triton` on Classic and `theme-material` on Modern)

## Using the package in your app

1. **Put the package inside your workspace's packages folder.** Clone this repository, then make the package appear at `<your-app>/packages/local/new-components` (the folder name must stay `new-components`). Copying works; for development a directory junction keeps it linked to the repo (no admin rights needed):

   ```powershell
   New-Item -ItemType Directory -Force <app>\packages\local
   New-Item -ItemType Junction -Path <app>\packages\local\new-components -Target <repo>\new-components
   ```

   Do this once in `classic/` and once in `modern/` of this repository. The default `packages.dir` in `workspace.json` (`${workspace.dir}/packages/local`) already covers it.

   Why not just add the repo path to `packages.dir`? Cmd would find the package, but `sencha app watch` only serves the app folder, so the browser gets 404 for files outside it.
2. **Require it in `app.json`:**

   ```json
   "requires": ["new-components"]
   ```

3. Run `sencha app refresh`, then `sencha app watch`.

## Layout

| Folder | Contents |
|---|---|
| `src/` | Toolkit-agnostic code (utilities, models, stores, mixins, base classes) |
| `classic/src/`, `modern/src/` | Toolkit views, same class names |
| `sass/`, `classic/sass/`, `modern/sass/` | Shared and toolkit styles (variables prefixed `$nc-`) |
| `docs/` | One page per component |

## Version

See `CHANGELOG.md`. The current version is also available at runtime as `NC.Version.version`.
