# Changelog

## 0.2.0 — 2026-07-30

### Features

- Lazy Chrome install: download only when needed for `export` / overflow checks (no postinstall Chrome download)
- Sync slide position with the URL hash (`#N`, 1-based)
- Overview mode (`O`) — grid of all slides

### Notes

- Publishing to npm now runs from GitHub Actions when a GitHub Release is published

## 0.1.0 — 2026-07-30

First public prerelease of `@axt_ayakoto/presenit`.

### Features

- Markdown → slides with YAML frontmatter and HTML-comment directives
- Themes: `light` / `dark` + `hue`, default fonts M PLUS 1 / M PLUS 1 Code
- `presenit dev` / `build` / `export` (Vite + Preact viewer, Puppeteer PDF)
- Presenter mode (notes, next slide, timer, BroadcastChannel sync)
- Shiki, KaTeX (`$` / `$$`), beautiful-mermaid
- `llms.txt` for AI-assisted authoring

### Notes

- This is an early **0.1.0** release for dogfooding; APIs and UX may still change before 1.0.0.
