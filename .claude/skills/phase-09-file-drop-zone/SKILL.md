---
name: phase-09-file-drop-zone
description: Phase 09 — build the File Drop Zone uploader (nc-filedropzone) with previews, validation, progress, and retry, for Classic and Modern.
disable-model-invocation: true
---

# Phase 09 — File Drop Zone

Load the `extjs` and `component-workflow` skills, then follow the workflow. This phase legitimately needs some native APIs (`File`, `DataTransfer`, `FormData`, `URL.createObjectURL`); each must carry a `// native:` comment.

## Classes
| Class | Where | xtype |
|---|---|---|
| `NC.filedrop.FileModel` (name, size, type, status, progress, error, response) | `src/` | — |
| `NC.filedrop.UploadQueue` (validation, concurrency, upload, retry, events) | `src/` | — |
| `NC.filedrop.FileDropZone` | `classic/src/`, `modern/src/` | `nc-filedropzone` |

## Proposed API
**Configs**: `url`, `fieldName` (`'file'`), `extraParams`, `headers`, `multiple` (true), `accept` (array like `['image/*', '.pdf']`), `maxFileSize` (bytes), `maxFiles`, `autoUpload` (true), `concurrency` (2), `showPreviews` (image thumbnails), `dropText`, `browseText`.
**Methods**: `upload()`, `clear()`, `removeFile(id)`, `retry(id)`, `getFiles()` (store records), `getStore()`.
**Events**: `fileadd(zone, record)`, `filereject(zone, file, reason)`, `uploadprogress(zone, record, percent)`, `uploadsuccess(zone, record, response)`, `uploadfailure(zone, record, response)`, `allcomplete(zone)`.

## Behavior
- Drop area highlights on drag-over (Ext element listeners for `dragenter`/`dragover`/`dragleave`/`drop`; read files from `e.browserEvent.dataTransfer`).
- Click or Enter/Space opens the file dialog via a hidden `input type=file` in the component's markup.
- Validation before queueing: type against `accept`, size (messages use `Ext.util.Format.fileSize`), count.
- Queue shown as a list bound to the internal store: name, size, progress bar, status, remove/retry buttons.
- Upload: first check the SDK for upload progress support in `Ext.data.Connection` / `Ext.data.request.Ajax`. If it exists, use `Ext.Ajax`; if not, use `XMLHttpRequest` only for the upload with `xhr.upload.onprogress`, commented as native, and keep everything else in Ext.
- Object URLs revoked when files are removed and on destroy.

## Toolkit notes
- The queue logic and model are shared; toolkit classes render the drop area and the file list (Classic `Ext.view.View`, Modern `dataview`).

## Demo
Images-only uploader with previews and 2 MB limit; multi-type document uploader; manual upload mode with an Upload button; failure simulation (a URL that errors) showing retry. Since the test apps have no backend, add a tiny mock: document how to point `url` at a local echo server, or simulate responses in the demo controller.

## Acceptance
- Rejected files explain why; accepted files show progress and final status.
- Retry works after a failure; no leaked object URLs or requests after destroy.

Extra instructions from the user: $ARGUMENTS
