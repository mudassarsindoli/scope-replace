<p align="center">
  <img src="icon.png" width="96" height="96" alt="ScopeReplace icon" />
</p>

<h1 align="center">ScopeReplace</h1>

<p align="center">
  Global find-and-replace across manually selected files in VS&nbsp;Code.<br/>
  Lightweight. Keyboard-first. No webview.
</p>

---

## Features

- Search and replace text in any combination of workspace files — **only the files you explicitly select** are modified.
- A focused, four-step wizard accessed with a single keyboard shortcut.
- Live "N selected" counter in the file picker.
- Safe for open/unsaved documents — changes respect the VS Code document model.
- Clear confirmation: total replacements, files updated, and failures (if any).
- Zero dependencies. Pure VS Code API.

## Requirements

- VS Code **1.85** or later.

## Usage

### Quick start

Press `Ctrl+Alt+F` (Linux/Windows) or `Cmd+Alt+F` (Mac) and follow the wizard:

| Step | What you see | Keyboard |
|------|-------------|----------|
| 1 | Search input — type the text to find | `Enter` to continue, `Esc` to cancel |
| 2 | Replace input — type the replacement (leave empty to delete) | `Enter` to continue, `Esc` to cancel |
| 3 | File picker — type to filter, `Space` to toggle, `Enter` to confirm | `Tab`/`Shift+Tab` not needed — use type filter + arrows |
| 4 | Runs replacements and shows a summary notification | — |

### Example

```
Ctrl+Alt+F
  →  Search:    oldFunction
  →  Replace:   newFunction
  →  Files:     utils.js, helpers.js, index.js
  →  "45 replacements across 3 files."
```

## Keyboard reference

| Key | Action |
|-----|--------|
| `Ctrl+Alt+F` / `Cmd+Alt+F` | Open ScopeReplace wizard |
| `Enter` | Accept current step and move to next |
| `Esc` | Cancel the wizard at any step |
| `Space` | Toggle file selection (file picker only) |
| Arrow keys | Navigate file list (file picker only) |
| Type (anywhere) | Filter file list in real time |

## Try it out (development)

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Open in VS Code and press F5
```

A new Extension Development Host window will open. Open any folder, press `Ctrl+Alt+F`, and test the extension.

## Build a VSIX package

```bash
npm run compile
npx @vscode/vsce package
```

This produces a `ScopeReplace-0.0.1.vsix` file you can install via
**Extensions > Install from VSIX...** or from the command line:

```bash
code --install-extension ScopeReplace-0.0.1.vsix
```

## Known limitations

- **No regular expressions** — plain text search only (v1 scope).
- **No preview/diff view** — replacements are applied directly.
- **No undo management** — use `Ctrl+Z` per file if needed.
- **No folder-based filtering** — all workspace files are listed.

## License

MIT License — see the bundled `LICENSE` file in this package for full text.
