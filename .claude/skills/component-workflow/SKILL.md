---
name: component-workflow
description: The standard procedure and definition of done for building any component in the new-components package (Classic + Modern + shared code, SASS, demo pages in both test apps, docs, roadmap, commit). Use whenever starting, continuing, finishing, or reviewing a component or phase, or when the user asks what's left to do on a component.
---

# Component workflow

Every component follows these steps in order. Load the `extjs` skill first. You never run `git` or `sencha` yourself: every command goes to the user as an action request in the format defined in `CLAUDE.md`, and you wait for their reply.

## 1. Start
1. Read `ROADMAP.md`. Confirm earlier phases this one depends on are `done`; if not, tell the user and stop.
2. Send one action request asking the user to run, at the repo root, `git status` and `git switch -c phase/NN-slug` (or `git switch phase/NN-slug` if the branch exists), and to paste the output. If the tree was dirty, ask how they want to proceed before continuing.
3. Mark the phase `in progress` in `ROADMAP.md`.

## 2. Research (no code yet)
1. Grep the SDK to confirm Ext JS 8 doesn't already ship this component in either toolkit. Report anything close (including `packages/ux`).
2. Identify the base class for each toolkit and read it in the SDK.
3. Find one SDK class with a similar structure in each toolkit and note the pattern to follow.
4. List anything the phase skill marks "verify in SDK" and resolve it now.

## 3. Plan and wait for approval
Present to the user:
- **Public API**: configs (name, type, default), methods, events (with arguments). Identical in both toolkits.
- **Files**: every file to create, grouped into shared / classic / modern / sass / demo / docs.
- **Toolkit differences**: what's implemented differently and why.
- **Native exceptions**: any native API you expect to need and why Ext has no equivalent.
- **Open questions.**

Do not write code until the user approves or adjusts the plan.

## 4. Implement, in this order
1. **Shared layer** (`new-components/src/`): utilities, models, stores, mixins, `*Base` classes.
2. **Classic** (`new-components/classic/src/`).
3. **Modern** (`new-components/modern/src/`).
4. **SASS**: global variables in `sass/etc/all.scss` (prefix `$nc-`), per-class files under `sass/var`, `sass/src`, and the toolkit equivalents. Derive colors from theme variables where possible; respect `prefers-reduced-motion` for animations.
5. **Accessibility**: keyboard operation, focus styles, ARIA roles and labels, sufficient contrast.

Patterns:
- Same class name and xtype in `classic/src` and `modern/src`. File path mirrors class name (`NC.avatar.Avatar` → `avatar/Avatar.js`).
- When both toolkit classes need the same behavior, put it in a `src/` mixin (only APIs present in both toolkits) or a `src/` `*Base` class that the toolkit class extends.
- Our events are named by intent (`select`, `change`, `complete`), never `click`/`tap`.
- Inherited framework configs keep each toolkit's names (`fieldLabel` vs `label`); our new configs are identical in both.

## 5. Demo pages (both apps)
- Add a demo view per app under the app's namespace, e.g. `<AppNS>.view.demo.<Component>Demo`, with its own ViewController/ViewModel when it has behavior.
- Register it in the app's demo shell (navigation entry + route `#<slug>`, set up in Phase 0).
- Show: default usage, every major config, events logged to an on-screen event log panel, edge cases (empty data, long text, invalid input), and a dark/alternate theme check if the app supports it.
- Both apps demo the same scenarios so behavior can be compared side by side.

## 6. Verify
1. Re-read your code against the `extjs` skill checklist (section 10).
2. Send one action request for both apps: `sencha app refresh` then `sencha app build development` in `classic/` and in `modern/`, asking the user to paste the output (or at least every error and warning). Fix what you introduced and repeat until both builds are clean.
3. Give the user a short **manual test checklist** to follow with `sencha app watch` running in each app. Wait for their results and fix what they report.

## 7. Document
- `new-components/docs/<slug>.md`: what it does, API tables (configs, methods, events), a Classic example, a Modern example, known limitations.
- Add a line to `new-components/CHANGELOG.md` and bump the package `version` minor in `new-components/package.json`.

## 8. Finish
1. Mark the phase `done` in `ROADMAP.md` and record any decisions later phases need in its Notes section.
2. Summarize what was built, files touched, and anything deferred.
3. Send a final action request with the git commands for the user to run: `git add .`, `git commit -m "feat(<slug>): ..."`, `git push -u origin phase/NN-slug`, and a suggestion to open a pull request into `main`.

## Definition of done
- [ ] Works in both test apps with the same public API.
- [ ] Shared logic lives in `src/` and runs in both toolkits.
- [ ] Ext JS methods used throughout; native exceptions commented.
- [ ] User confirmed clean development builds of both apps.
- [ ] User confirmed the manual test checklist in both apps.
- [ ] Docs page, CHANGELOG, version bump, ROADMAP updated.
