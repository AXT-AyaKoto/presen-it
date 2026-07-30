# Presen'it!

Markdown から美しいプレゼンスライドを作るツール。

通常の Markdown 文書としても読める単一ファイルを、少ない宣言だけで読みやすいスライドと PDF に組版します。

パッケージ: [`@axt_ayakoto/presenit`](https://www.npmjs.com/package/@axt_ayakoto/presenit)（**v0.7.6** プレリリース）

[![npm](https://img.shields.io/npm/v/@axt_ayakoto/presenit)](https://www.npmjs.com/package/@axt_ayakoto/presenit)
[![CI](https://github.com/AXT-AyaKoto/presen-it/actions/workflows/ci.yml/badge.svg)](https://github.com/AXT-AyaKoto/presen-it/actions/workflows/ci.yml)

## Why

- Marp より組版を丁寧に
- Slidev / Quarto より「普通の Markdown」を優先
- 設定ファイルや JSX を増やさない

## Quick start

```bash
pnpm add -D @axt_ayakoto/presenit
pnpm exec presenit init my-talk   # → src/my-talk/slide.md（使い方入りスタート用デッキ）
pnpm exec presenit dev my-talk
pnpm exec presenit build my-talk   # → dist/my-talk/view.html
pnpm exec presenit export my-talk  # → dist/my-talk/resume.pdf
```

### 同梱デモを試す（このリポジトリ）

```bash
pnpm install
pnpm build
pnpm presenit dev demo
# Presenter: P またはツールバーで別タブに開く（?presenter でも直接起動可）
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

```yaml
---
theme: light # light | dark（既定: light）
hue: 210 # アクセント色相 0–359（既定: 210）
width: 1920 # px（既定: 1920）
height: 1080 # px（既定: 1080）
fontSize: 32 # 基準フォントサイズ px（既定: 32）
fontFamily:
    sans: '"M PLUS 1", system-ui, sans-serif' # CSS font-family（既定この値）
    mono: '"M PLUS 1 Code", ui-monospace, monospace'
pageTransition:
    type: fade # none | fade | scroll（既定: fade）
    duration: 0.2 # 秒（既定: 0.2）。PDF export では無視
rawHTML: false # true で生 HTML を描画（既定: false）
break: soft # soft | hard（既定: soft）。soft で段落内の単改行を <br> に
---
```

| Key                         | Default                                              | Notes                                        |
| --------------------------- | ---------------------------------------------------- | -------------------------------------------- |
| `theme`                     | `light`                                              | `light` \| `dark`                            |
| `hue`                       | `210`                                                | アクセント色相（mod 360）                    |
| `width` / `height`          | `1920` / `1080`                                      | スライドサイズ（px）                         |
| `fontSize`                  | `32`                                                 | 基準フォントサイズ                           |
| `fontFamily.sans` / `.mono` | M PLUS 1 / M PLUS 1 Code（上記 YAML の既定スタック） | CSS 文字列、またはフォント名の配列           |
| `pageTransition.type`       | `fade`                                               | `none` \| `fade` \| `scroll`（PDF では無視） |
| `pageTransition.duration`   | `0.2`                                                | 秒。`0` で実質オフ                           |
| `rawHTML`                   | `false`                                              | `true` のとき生 HTML を描画する              |
| `break`                     | `soft`                                               | `soft` \| `hard`（段落内の改行の扱い）       |

`fontFamily` は通常の CSS 文字列のほか、**配列**でも書けます（空白入りの名前に便利）。

```yaml
fontFamily:
    sans: Ubuntu, "M PLUS 1", system-ui, sans-serif
    mono: "JetBrains Mono", "M PLUS 1 Code", ui-monospace, monospace
```

```yaml
fontFamily:
    sans:
        - Edu VIC WA NT Hand
        - Zen Kurenaido
        - cursive
    mono: ["JetBrains Mono", ui-monospace, monospace]
```

配列は CSS の `font-family` リストに展開され、空白を含む名前は自動で引用符が付きます。

名前付きフォント（`serif` / `sans-serif` / `system-ui` などの総称ファミリ以外）は、**Google Fonts からの読み込みを試みます**（ローカルにあればそれが優先されます）。Google Fonts に無い名前は無視され、スタックの次の候補にフォールバックします。

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

- GFM タスクリスト（`- [ ]` / `- [x]`）→ 読み取り専用のチェックボックス
- フェンスコード → **Shiki**
- `$...$` / `$$...$$` → **KaTeX**
- ` ```mermaid ` → **beautiful-mermaid**
- GitHub alerts → スライド向けの `aside`（`NOTE` / `TIP` / `IMPORTANT` / `WARNING` / `CAUTION`）

```md
> [!NOTE]
> Useful context.

> [!WARNING]
> Confirm this before continuing.
```

## Viewer shortcuts

| Key                                  | Action                                            |
| ------------------------------------ | ------------------------------------------------- |
| `←` `→` / Space / Enter              | 前後のスライド                                    |
| `Home` / `End`                       | 最初 / 最後                                       |
| 左右スライド端（パディング幅）短押し | 前へ / 次へ（投影・選択は無視。ホバーで矢印表示） |

| `O` | オーバービュー（グリッド） |
| `F` | フルスクリーン |
| `P` | プレゼンターを別タブで開く（投影タブはそのまま） |
| `B` | ブラックアウト（投影を黒画面に。Presenter トグルでも可。`Esc` で解除） |
| `T` | タイマー一時停止／再開（プレゼンター） |
| `R` | タイマーリセット（プレゼンター） |

左下にマウスを置くと、前後移動・Overview・Presenter・Fullscreen のツールバーが出ます。Presenter は別タブで開き、投影タブとスライド位置は BroadcastChannel で同期します。

URL ハッシュは 1 始まり（`#3` = 3 枚目）。`?presenter` を付けて直接プレゼンターを開くこともできます。機能一覧サンプルは `pnpm presenit dev kitchen-sink`。

## Releasing

1. `package.json` と `src/pkg.ts` を同じ次バージョンに上げる
2. `CHANGELOG.md` を更新する
3. `main` にマージする
4. GitHub Release を作成し、タグを `vX.Y.Z` にする（`package.json` と一致必須）

Release 公開時、[`.github/workflows/release.yml`](./.github/workflows/release.yml) が npm Trusted Publishing（OIDC）で自動 publish する。詳細は [docs/publishing.md](./docs/publishing.md)。

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
