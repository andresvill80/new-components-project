# new-components

Custom Ext JS 8 components for the Classic and Modern toolkits, distributed as the Sencha Cmd package `new-components` (namespace `NC`, xtype prefix `nc-`).

## Repository
- `new-components/` — the package. Component docs live in `new-components/docs/`.
- `classic/`, `modern/` — test apps with a demo page per component.
- `ROADMAP.md` — what's built and what's next.

## Running the test apps
The Ext JS SDK is not committed. Each app expects its framework copy in its own `ext/` folder (or wherever its `workspace.json` points). Then, inside `classic/` or `modern/`:

```
sencha app refresh
sencha app watch
```

## Using the package in your own app
Setup instructions are in `new-components/README.md` (written in Phase 0).

## Working with Claude Code
Project instructions live in `CLAUDE.md` and `.claude/skills/`. Start a phase with its skill, for example `/phase-01-avatar`.
