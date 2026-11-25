---
name: phase-00-foundation
description: Phase 00 — set up the new-components Sencha package, wire it into the classic and modern test apps, and build the demo shells. Run before any component phase.
disable-model-invocation: true
---

# Phase 00 — Foundation

Load the `extjs` and `component-workflow` skills first. Follow the workflow's Start, Plan, Verify, and Finish steps; there is no component, so skip the API part of the plan.

Goal: an empty but correctly wired package that both test apps load, a demo shell in each app, and conventions in place for every later phase.

## 1. Inspect (report before changing anything)
- Folder contents of `new-components/`, `classic/`, `modern/`.
- Each app's `app.json` (name, namespace, toolkit, theme, requires) and `workspace.json` (frameworks, packages dirs).
- The Ext JS version each app uses (look for the version in the app's `ext/` folder, e.g. `ext/package.json` or `ext/version.properties`).
- Sencha Cmd version and git state: send an action request for `sencha which` and `git status` (repo root) and ask for the output.
Summarize findings and the plan below, then wait for approval.

## 2. Create the package (the user runs the command)
If `new-components/package.json` doesn't exist, send an action request. Cmd generates packages inside a workspace's `packages/local/`, so ask the user to:
1. In `classic/`: run `sencha generate package new-components` (if the syntax is rejected, run `sencha help generate package` and paste the output).
2. Move the generated `classic/packages/local/new-components/` contents into the repo's `new-components/` folder.
Wait for the user to confirm, then read the generated files.

## 3. Configure `new-components/package.json`
Edit what Cmd generated rather than replacing it. Ensure:
- `name`: `new-components`; `namespace`: `NC`; `version`: `0.1.0`; `framework`: `ext`; no `toolkit` key (the package serves both).
- `classpath` includes `${package.dir}/src` and `${package.dir}/${toolkit.name}/src`; `overrides` likewise with `overrides`.
- `sass` uses namespace `NC` and includes shared and `${toolkit.name}` paths for `etc`, `var`, and `src`.
- `requires`: empty for now (Phase 13 adds `charts`).
Verify the generated keys and path variables against what Cmd produced; adjust only what's needed.

## 4. Package folders and base files
```
new-components/
├── src/                      (shared)
├── classic/src/  classic/sass/{var,src,etc}
├── modern/src/   modern/sass/{var,src,etc}
├── sass/{var,src,etc}        (sass/etc/all.scss holds $nc- globals)
├── resources/
├── docs/README.md            (index of component docs)
├── README.md                 (team setup instructions)
└── CHANGELOG.md
```
- `sass/etc/all.scss`: shared variables used by all components (spacing unit, radius, transition duration, a status color map) with `!default`.
- One tiny shared class to prove both toolkits load shared code: `NC.Version` (singleton with `version` string). Use it in the demo shell header.

## 5. Wire the package into both apps
- In each `workspace.json`, add the repo root to the package search path so Cmd finds `new-components` (e.g. append `${workspace.dir}/..` to `packages.dir`). The folder name must equal the package name.
- In each `app.json`, add `"new-components"` to `requires`.
- Send an action request for `sencha app refresh` in `classic/` and `modern/`, and confirm from the pasted output that the package resolves.
- If Cmd won't resolve it that way, propose a fallback to the user (for example a Windows directory junction from `<app>/packages/local/new-components` to the repo folder: `mklink /J`), and record the choice in `ROADMAP.md` Notes.

## 6. Demo shell in each app
Same structure in both apps, built with MVVM (view / ViewController / ViewModel):
- Header with the app title and `NC.Version.version`.
- Navigation list on the left (Classic: `treelist` or a grid in a panel; Modern: `list`, collapsing to a menu on phones), driven by a store of demo entries (`slug`, `title`, `phase`, `viewXtype`).
- Main area with `layout: 'card'` showing the selected demo.
- Routes: `#home` and `#<slug>` via the ViewController's `routes`; unknown slugs fall back to home.
- Home page: list of planned components and their status.
- A reusable **event log** panel (`<AppNS>.view.demo.EventLog`) that demos use to print fired events with arguments.
Adding a demo later must only require: a demo view class, an entry in the demo store, and nothing else.

## 7. Verify and finish
- Action request: `sencha app refresh` and `sencha app build development` in both apps; the pasted output shows no errors.
- Action request: `sencha app watch` in each app; the user confirms the shell loads and navigation/routing work.
- `new-components/README.md` explains for teammates: where to put the package, `workspace.json` path, `app.json` requires, supported toolkits and themes.
- Update `ROADMAP.md`, then send the final git action request with commit message `chore: package foundation and demo shells`.

Extra instructions from the user: $ARGUMENTS
