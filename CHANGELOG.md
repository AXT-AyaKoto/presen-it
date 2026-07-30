# Changelog

## Unreleased

### Features

- Frontmatter `footer` string (default `""`) renders escaped text at the bottom-left of every slide
- Presenter timer: Pause/Resume and Reset buttons (`T` / `R` shortcuts)

## 0.8.0 — 2026-07-31

### Features

- Presenter opens in a separate tab/window (`P` or toolbar from projection); projection stays in the original tab
- Slide index syncs across projection and presenter tabs via `BroadcastChannel` (hash + broadcast on open)

## 0.7.7 — 2026-07-31

### Fixes

- PDF export: hide KaTeX MathML layer so inline and display math render once (Puppeteer ignores upstream clip-path hide rules)
- PDF export: inline KaTeX CSS from the installed package with CDN font URLs instead of relying on `@import` in print HTML

## 0.7.6 — 2026-07-31

### Fixes

- Publish `src/shared/` so the Vite viewer can resolve `slide-padding` (fixes `presenit dev` import error on npm installs)

## 0.7.5 — 2026-07-31

### Improvements

- Projection click zones match slide horizontal padding (slightly narrower); chevron affordance on hover unchanged
- Remove `w-resize` / `e-resize` cursors from projection edge zones

## 0.7.4 — 2026-07-31

### Fixes

- Soft breaks no longer leave a blank line between GitHub alert labels and body text

## 0.7.3 — 2026-07-31

### Features

- Frontmatter `break: soft | hard` (default `soft`): `soft` turns single newlines inside paragraphs into `<br>` (GFM-style); `hard` keeps CommonMark line breaks

### Fixes

- Task-list checkbox mark: nudge `::before` to `top: 0.5em` for better vertical alignment
- KaTeX display math: fix stray vertical scrollbar — `overflow-x: auto` with `overflow-y: visible` computed as `auto` on both axes; set `overflow-y: hidden` and hide horizontal scrollbar chrome

## 0.7.2 — 2026-07-31

### Fixes

- Task-list checkboxes: hide the UA widget and draw marks with `li::before` (input `em` sizing was wrong because checkbox font-size did not inherit)

## 0.7.1 — 2026-07-31

### Improvements

- Custom read-only task-list checkboxes (no browser-default control), text aligned with other lists
- Icons on GitHub alert labels (NOTE / TIP / IMPORTANT / WARNING / CAUTION)
- kitchen-sink: alert examples slide

## 0.7.0 — 2026-07-30

### Features

- Render GitHub alert blockquotes (`NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`) as labelled, slide-friendly alerts
- Style GFM task lists as read-only checkboxes with completed items subtly muted

## 0.6.0 — 2026-07-30

### Features

- `pageTransition.type` (`none` \| `fade` \| `scroll`, default `fade`) and `pageTransition.duration` (seconds, default `0.2`) in frontmatter; PDF export ignores transitions

### Fixes

- Soften click-zone chevron shadow (lighter, wider)
- Zone `w-resize` / `e-resize` cursors via hit-target overlays above slide content

## 0.5.0 — 2026-07-30

### Features

- `fontFamily.sans` / `.mono` accept YAML string arrays (auto-quote spaced names into CSS)
- Projection zone affordance uses chevron arrows (white + dark shadow) readable on light and dark

### Fixes

- Zone `w-resize` / `e-resize` cursors now apply over slide content (not only the projection root)

## 0.4.0 — 2026-07-30

### Features

- Projection click zones: hover shows a translucent edge affordance with `w-resize` / `e-resize` cursors
- Load named `fontFamily` stacks from Google Fonts (generics skipped; local fonts still preferred by the browser)

### Changes

- h1 `letter-spacing` 0.03em → 0.01em
- README / llms.txt: clearer frontmatter defaults and `fontFamily` examples

## 0.3.2 — 2026-07-30

### Fixes

- KaTeX script sizing for npm consumers: render with our direct `katex@0.18.1` dependency so HTML emits `katex-sizing` matching the CSS (workspace overrides never applied to downstream installs)
- Soften `katex-display` overflow so limits are less likely to clip

## 0.3.1 — 2026-07-30

### Fixes

- Italic text keeps the normal text color (no muted gray)
- KaTeX script/limit sizing: align renderer + CSS on KaTeX 0.18 (`katex-sizing`)
- Scale Mermaid diagrams up to 2/3 of slide height (was intrinsic SVG size, not the image cap)
- Centered columns: code blocks stay centered, lines are left-aligned
- Projection zones: 10% edges, short-press only so text selection/copy works
- Slightly stronger slide background gradient; image max-height relaxed to 75%

## 0.3.0 — 2026-07-30

### Features

- Keep the current slide across Vite full-reload when editing Markdown (`#N` hash)
- Projection click zones: left 20% previous, right 20% next (center does nothing)
- Bottom-left hover toolbar for Overview / Presenter / Fullscreen
- Subtle lightness gradient + corner wash on slide backgrounds
- Expanded `kitchen-sink` gallery for layouts and features

### Changes

- Removed the projection hover page-number HUD (slide chrome already shows it)

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
