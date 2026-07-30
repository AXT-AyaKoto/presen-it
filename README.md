# Presen'it!

Turn readable Markdown into beautiful presentation slides and PDFs — with as few declarations as possible.

Package: [`@axt_ayakoto/presenit`](https://www.npmjs.com/package/@axt_ayakoto/presenit) (**v0.1.0** prerelease)

[![npm](https://img.shields.io/npm/v/@axt_ayakoto/presenit)](https://www.npmjs.com/package/@axt_ayakoto/presenit)
[![CI](https://github.com/AXT-AyaKoto/experiment-md-slide-vibed/actions/workflows/ci.yml/badge.svg)](https://github.com/AXT-AyaKoto/experiment-md-slide-vibed/actions/workflows/ci.yml)

## Why

- More careful typesetting than Marp defaults
- Prefer “normal Markdown” over Slidev / Quarto-style project complexity
- No extra config files or JSX required

## Quick start

```bash
pnpm add -D @axt_ayakoto/presenit
mkdir -p src/my-talk
# edit src/my-talk/slide.md
pnpm exec presenit dev my-talk
pnpm exec presenit build my-talk   # → dist/my-talk/view.html
pnpm exec presenit export my-talk  # → dist/my-talk/resume.pdf
```

### Try the bundled demo (this repo)

```bash
pnpm install
pnpm build
pnpm presenit dev demo
# Presenter: open with ?presenter
pnpm presenit build demo
pnpm presenit export demo
```

## Authoring

### Layout

```text
src/<slug>/slide.md
src/<slug>/assets/...
```

### Frontmatter

| Key                         | Default                  | Notes                       |
| --------------------------- | ------------------------ | --------------------------- |
| `theme`                     | `light`                  | `light` \| `dark`           |
| `hue`                       | `210`                    | accent hue, mod 360         |
| `width` / `height`          | `1920` / `1080`          | slide size in px            |
| `fontSize`                  | `32`                     | base font size              |
| `fontFamily.sans` / `.mono` | M PLUS 1 / M PLUS 1 Code | CSS `font-family`           |
| `rawHTML`                   | `false`                  | render raw HTML when `true` |

### Directives

```html
<!-- presen-it! slide-break -->
<!-- presen-it! column-break -->
<!-- presen-it! slide-break (center-x=true&center-y=false) -->
```

- Leading `h2` after a slide-break → page header
- A **leading** `slide-break` at the top of the file applies options to page 1 (no empty page)
- Trailing HTML comment (not a directive) → speaker notes
- Defaults: horizontal left, vertical center

### Extras

- **Shiki** for fenced code
- **KaTeX** for `$...$` / `$$...$$`
- **beautiful-mermaid** for ` ```mermaid `

## Viewer shortcuts

| Key                     | Action                  |
| ----------------------- | ----------------------- |
| `←` `→` / Space / Enter | Navigate                |
| `Home` / `End`          | First / last            |
| Click                   | Next (projection)       |
| `O`                     | Overview grid           |
| `F`                     | Fullscreen              |
| `P`                     | Presenter mode          |
| `T`                     | Timer pause (presenter) |

URL hash is 1-based (`#3` = slide 3). Presenter: append `?presenter`.

## Releasing

1. Bump `package.json` and `src/pkg.ts` to the next version (keep them in sync)
2. Update `CHANGELOG.md`
3. Merge to `main`
4. Create a GitHub Release tagged `vX.Y.Z` (must match `package.json`)

Publishing to npm runs automatically from [`.github/workflows/release.yml`](./.github/workflows/release.yml) when the Release is published. Requires the `NPM_TOKEN` repository secret — see [docs/publishing.md](./docs/publishing.md).

## Development (this repo)

```bash
pnpm install
pnpm check
pnpm build
```

Stack: TypeScript, Node.js ≥22, pnpm, Vite, Preact + Signals, Oxfmt, Oxlint, Puppeteer.

AI authoring guide: [llms.txt](./llms.txt)

## License

[MIT](./LICENSE)
