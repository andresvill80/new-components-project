---
name: component-workflow
description: The standard procedure and definition of done for building any component in the new-components package (Classic + Modern + shared code, SASS, demo pages in both test apps, docs, roadmap, commit). Use whenever starting, continuing, finishing, or reviewing a component or phase, or when the user asks what's left to do on a component.
---

# Component workflow

Every component follows these steps in order. Load the `extjs` skill first. Command rules (see `CLAUDE.md`, rule 5): run commands yourself without asking, including `git`; ask for confirmation only before `sencha` commands (naming the exact command) and, for git, once per batch of commands (list the batch and the commit message, then run it all after one yes). Read the output yourself. You never run `sencha app watch`: tell the user when to start or restart it. Use the 🖐 ACTION NEEDED block only for what the user must do themselves. Do not ask for confirmation of anything else; stop and wait only when you truly need the user.

## 1. Start
1. Read `ROADMAP.md`. Confirm earlier phases this one depends on are `done`; if not, tell the user and stop.
2. At the repo root run `git status` and read it; if the tree was dirty or you are not on an up-to-date `main`, ask how to proceed. Otherwise run `git switch -c phase/NN-slug` (or `git switch phase/NN-slug` if the branch exists) without asking.
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
2. Ask for confirmation to run `sencha app refresh` then `sencha app build development` in `classic/` and in `modern/`. After a yes, run them, read the full output, fix what you introduced and repeat (asking again for each new sencha run) until both builds are clean.
3. Tell the user to start (or restart) `sencha app watch` in each app, and give them a **numbered manual test checklist**: for each step, what to do and what should happen, in Classic and in Modern. Wait for their results and fix what they report.

## 7. Document
- `new-components/docs/<slug>.md`: what it does, API tables (configs, methods, events), a Classic example, a Modern example, known limitations.
- Add a line to `new-components/CHANGELOG.md` and bump the package `version` minor in `new-components/package.json`.

## 8. Finish
1. Mark the phase `done` in `ROADMAP.md` and record any decisions later phases need in its Notes section.
2. Summarize what was built, files touched, and anything deferred.
3. Ask once for confirmation of the git batch: `git status` (check nothing unexpected is listed), `git add .`, `git commit -m "feat(<slug>): ..."` and `git push -u origin phase/NN-slug`, showing the commit message. After a yes, run them all and read the output. Then suggest opening a pull request into `main`.

## Definition of done
- [ ] Works in both test apps with the same public API.
- [ ] Shared logic lives in `src/` and runs in both toolkits.
- [ ] Ext JS methods used throughout; native exceptions commented.
- [ ] User confirmed clean development builds of both apps.
- [ ] User confirmed the manual test checklist in both apps.
- [ ] Docs page, CHANGELOG, version bump, ROADMAP updated.
