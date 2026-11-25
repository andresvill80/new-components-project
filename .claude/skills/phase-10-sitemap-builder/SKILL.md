---
name: phase-10-sitemap-builder
description: Phase 10 — build the Site Map Builder (nc-sitemapbuilder), an editable tree for designing site maps with JSON and XML sitemap export, for Classic and Modern.
disable-model-invocation: true
---

# Phase 10 — Site Map Builder

Load the `extjs` and `component-workflow` skills, then follow the workflow. Tree drag-and-drop APIs differ most between toolkits here; research them first.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.sitemap.PageNode` (extends `Ext.data.TreeModel`) | `src/` | — |
| `NC.sitemap.SiteMapUtil` (slugify, URL building, validation, JSON/XML import-export) | `src/` | — |
| `NC.sitemap.SiteMapBuilder` (tree + properties panel + toolbar) | `classic/src/`, `modern/src/` | `nc-sitemapbuilder` |

## Proposed API
**PageNode fields**: `text` (page title), `slug`, `url` (calculated from ancestor slugs), `visible` (in sitemap), `priority` (0.0–1.0), `changefreq` (`always|hourly|daily|weekly|monthly|yearly|never`), `lastmod` (date), `notes`.
**Configs**: `baseUrl`, `store` (TreeStore of PageNode; created empty if not given), `readOnly`, `maxDepth`, `allowDragDrop` (true).
**Methods**: `loadSiteMap(json)`, `getSiteMap()` (nested JSON), `exportXml()` (string), `exportJson()` (string), `download(format)`, `validate()` (returns problems list).
**Events**: `change(builder)` after any structural or property edit (buffered), `pageselect(builder, node)`.

## Behavior
- Toolbar: add child, add sibling, rename (inline edit), delete (confirm with descendant count via `Ext.Msg.confirm`), move up/down, indent/outdent, expand/collapse all, import JSON, export JSON/XML.
- Every structural action is available without drag-and-drop (buttons + keyboard), so the component is fully usable where DnD is limited.
- Slugs auto-generated from titles (lowercase, accents removed — `String.prototype.normalize` is native, comment it — spaces to hyphens), editable, unique among siblings.
- URL recalculated for a node and its descendants when a slug or parent changes.
- XML export follows the sitemaps.org schema (`urlset` / `url` / `loc`, `lastmod`, `changefreq`, `priority`), only `visible` pages, text escaped with `Ext.String.htmlEncode`.
- `download(format)` builds a `Blob` and triggers a download (native, commented).
- Validation: duplicate sibling slugs, empty titles, depth over `maxDepth`, invalid priority.

## Toolkit notes
- Classic: `Ext.tree.Panel` with `treecolumn`, `cellediting`, `treeviewdragdrop` (on `viewConfig.plugins`); properties in a form panel beside it.
- Modern: `Ext.grid.Tree` with `treecolumn`, cell editing plugin, and the tree drag-and-drop plugin if Ext JS 8 provides one (verify name and behavior in the SDK; if not, buttons-only plus core `Ext.drag` as an optional enhancement).
- All tree math, URLs, validation, and export in `SiteMapUtil`.

## Demo
Prebuilt corporate site map (about 25 pages, 3 levels), empty builder, import/export round-trip (export JSON → clear → import → identical), XML preview panel, validation errors listed and clickable to select the node.

## Acceptance
- JSON round-trip is lossless; XML validates against the sitemap structure.
- Re-parenting updates descendant URLs in both toolkits.

Extra instructions from the user: $ARGUMENTS
