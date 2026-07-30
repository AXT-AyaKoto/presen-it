# Presen'it!

Markdown から美しいプレゼンスライドを作るツール。

通常の Markdown 文書としても読める単一ファイルを、少ない宣言だけで読みやすいスライドと PDF に組版します。

パッケージ: [`@axt_ayakoto/presenit`](https://www.npmjs.com/package/@axt_ayakoto/presenit)（**v0.2.0** プレリリース）

[![npm](https://img.shields.io/npm/v/@axt_ayakoto/presenit)](https://www.npmjs.com/package/@axt_ayakoto/presenit)
[![CI](https://github.com/AXT-AyaKoto/experiment-md-slide-vibed/actions/workflows/ci.yml/badge.svg)](https://github.com/AXT-AyaKoto/experiment-md-slide-vibed/actions/workflows/ci.yml)

## Why

- Marp より組版を丁寧に
- Slidev / Quarto より「普通の Markdown」を優先
- 設定ファイルや JSX を増やさない

## Quick start

```bash
pnpm add -D @axt_ayakoto/presenit
mkdir -p src/my-talk
# edit src/my-talk/slide.md
pnpm exec presenit dev my-talk
pnpm exec presenit build my-talk   # → dist/my-talk/view.html
pnpm exec presenit export my-talk  # → dist/my-talk/resume.pdf
```

### 同梱デモを試す（このリポジトリ）

```bash
pnpm install
pnpm build
pnpm presenit dev demo
# Presenter: ?presenter を付けて開く
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

| Key                         | Default                  | Notes                           |
| --------------------------- | ------------------------ | ------------------------------- |
| `theme`                     | `light`                  | `light` \| `dark`               |
| `hue`                       | `210`                    | アクセント色相（mod 360）       |
| `width` / `height`          | `1920` / `1080`          | スライドサイズ（px）            |
| `fontSize`                  | `32`                     | 基準フォントサイズ              |
| `fontFamily.sans` / `.mono` | M PLUS 1 / M PLUS 1 Code | CSS `font-family`               |
| `rawHTML`                   | `false`                  | `true` のとき生 HTML を描画する |

### Directives

```html
<!-- presen-it! slide-break -->
<!-- presen-it! column-break -->
<!-- presen-it! slide-break (center-x=true&center-y=false) -->
```

- スライド区切り直後の先頭 `h2` → ページヘッダー
- ファイル先頭の **leading** `slide-break` は 1 ページ目にオプションを適用する（空ページは作らない）
- ディレクティブでない末尾の HTML コメント → スピーカーノート
- 既定の配置: 横は左寄せ、縦は中央

### Extras

- フェンスコード → **Shiki**
- `$...$` / `$$...$$` → **KaTeX**
- ` ```mermaid ` → **beautiful-mermaid**

## Viewer shortcuts

| Key                     | Action                           |
| ----------------------- | -------------------------------- |
| `←` `→` / Space / Enter | 前後のスライド                   |
| `Home` / `End`          | 最初 / 最後                      |
| Click                   | 次へ（投影モード）               |
| `O`                     | オーバービュー（グリッド）       |
| `F`                     | フルスクリーン                   |
| `P`                     | プレゼンターモード               |
| `T`                     | タイマー一時停止（プレゼンター） |

URL ハッシュは 1 始まり（`#3` = 3 枚目）。プレゼンターは `?presenter` を付ける。

## Releasing

1. `package.json` と `src/pkg.ts` を同じ次バージョンに上げる
2. `CHANGELOG.md` を更新する
3. `main` にマージする
4. GitHub Release を作成し、タグを `vX.Y.Z` にする（`package.json` と一致必須）

Release 公開時、[`.github/workflows/release.yml`](./.github/workflows/release.yml) が自動で npm publish する。リポジトリシークレット `NPM_TOKEN` が必要 — 詳細は [docs/publishing.md](./docs/publishing.md)。

## Development（このリポジトリ）

```bash
pnpm install
pnpm check
pnpm build
```

Stack: TypeScript, Node.js ≥22, pnpm, Vite, Preact + Signals, Oxfmt, Oxlint, Puppeteer.

AI 向け作者ガイド: [llms.txt](./llms.txt)

## License

[MIT](./LICENSE)
