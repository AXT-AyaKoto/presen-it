# AyaExpTech Presen'it!

Markdown から美しいプレゼンスライドを作るツール。  
通常の Markdown 文書としても読める単一ファイルを、少ない宣言だけで読みやすいスライドと PDF に組版します。

パッケージ: [`@ayaexptech/presenit`](https://www.npmjs.com/package/@ayaexptech/presenit) · サイト: [axt-studio.github.io/presen-it](https://axt-studio.github.io/presen-it/)

[![npm](https://img.shields.io/npm/v/@ayaexptech/presenit)](https://www.npmjs.com/package/@ayaexptech/presenit)
[![CI](https://github.com/AXT-Studio/presen-it/actions/workflows/ci.yml/badge.svg)](https://github.com/AXT-Studio/presen-it/actions/workflows/ci.yml)

> [!NOTE]
> このツールは、そのほとんどがAIによって実装された、いわゆるVibe-Codingプロダクトです。  
> AIへの指示を行った私(綾坂こと)がDogfoodingを行っているためある程度品質については保証しますが、Vibe-Codingによるプロダクトであることには留意してください。  
> なお、使用したモデルはGrok 4.5 High・Composer 2.5で、いずれもCursorから使用しています。

## Why

- Marp より組版を丁寧に
- Slidev / Quarto より「普通の Markdown」を優先
- 設定ファイルや JSX を増やさない

## Quick start

```bash
pnpm add -D @ayaexptech/presenit
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
title: My Talk # viewer HTML <title> / og:title（未設定時は AyaExpTech Presen'it! — <slug>）
description: Short blurb # meta description / og:description（未設定時は省略）
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
animation:
    duration: 0.3 # 秒（既定: 0.3）。同一スライド内 reveal のフェード
rawHTML: false # true で生 HTML を描画（既定: false）
break: soft # soft | hard（既定: soft）。soft で段落内の単改行を <br> に
footer: "" # 全スライド左下に表示するテキスト（既定: 空 = 非表示）
---
```

| Key                         | Default                                              | Notes                                          |
| --------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| `title`                     | `""`                                                 | viewer HTML の `<title>` / `og:title`          |
| `description`               | `""`                                                 | 設定時のみ description / `og:description`      |
| `theme`                     | `light`                                              | `light` \| `dark`                              |
| `hue`                       | `210`                                                | アクセント色相（mod 360）                      |
| `width` / `height`          | `1920` / `1080`                                      | スライドサイズ（px）                           |
| `fontSize`                  | `32`                                                 | 基準フォントサイズ                             |
| `fontFamily.sans` / `.mono` | M PLUS 1 / M PLUS 1 Code（上記 YAML の既定スタック） | CSS 文字列、またはフォント名の配列             |
| `pageTransition.type`       | `fade`                                               | `none` \| `fade` \| `scroll`（PDF では無視）   |
| `pageTransition.duration`   | `0.2`                                                | 秒。`0` で実質オフ                             |
| `animation.duration`        | `0.3`                                                | 同一スライド内 reveal のフェード秒数           |
| `rawHTML`                   | `false`                                              | `true` のとき生 HTML を描画する                |
| `break`                     | `soft`                                               | `soft` \| `hard`（段落内の改行の扱い）         |
| `footer`                    | `""`                                                 | 全スライド左下に表示するテキスト（空で非表示） |

`fontFamily` は通常の CSS 文字列のほか、**配列**でも書けます（空白入りの名前に便利）。

```yaml
fontFamily:
    sans: Ubuntu, "M PLUS 1", system-ui, sans-serif
    mono: "JetBrains Mono", "M PLUS 1 Code", ui-monospace, monospace
```

```yaml
fontFamily:
    sans: [Edu VIC WA NT Hand, Zen Kurenaido, cursive]
```

名前付きファミリー（`serif` / `system-ui` などの総称以外）は Google Fonts から自動取得を試みます（端末に入っているフォントが優先）。

### Directives

`slide-break` / `column-break` はブロックのあいだに単独で置きます。`reveal` はインライン（リスト行末・段落途中・強調の内側など）にも置けます。

```html
<!-- presen-it! slide-break -->
<!-- presen-it! column-break -->
<!-- presen-it! slide-break (center-x=true) -->
<!-- presen-it! column-break (center-x=true&center-y=false) -->
<!-- presen-it! reveal -->
<!-- presen-it! reveal (at=2) -->
```

- コマンド: `slide-break`, `column-break`, `reveal`
- 整列オプション（break 系）: `center-x=true|false`, `center-y=true|false`（`=` / `&` の前後に空白なし）
- reveal: `at=N`（非負整数）。省略時は `at=0`
- 既定: `center-x=false`, `center-y=true`
- カラムの指定がスライド指定より優先
- frontmatter 直後の `slide-break` は 1 枚目のレイアウト指定に使えます（空ページは作りません）

#### Reveal詳細

同一スライド内でクリックのたびに順次(ステップ)表示することができます。

- (ほとんど)すべての要素は、同じページ内で直前に書かれた`reveal`宣言の`at`の回数クリックしたときに表示されます。
    - 飛び番号は空クリックとして処理されます。
    - 次のスライドから戻ってきた場合は最終ステップの状態に戻ります。
    - PDFやOverviewではステップ表示は無視されてすべて表示されます。
    - プレゼンタービューのNextは次ステップをプレビューします。
    - スライドのタイトルとなったh2は指定にかかわらず常に表示されます。
    - 行頭の`<!-- ... -->` の**同じ行に**本文を続けないでください。
        - Markdown が行全体を HTML ブロックとして扱ってしまうため。
        - ブロックの `reveal` は単独行にし、インラインは段落やリストの途中／末尾に置きます。

```md
<!-- presen-it! slide-break -->

この文章は最初から表示されている

<!-- presen-it! reveal (at=1) -->

この文章は一回クリックすると表示される

<!-- presen-it! column-break -->

この文章も一回クリック時点で表示される (reveal宣言はcolumnをまたぐ)

<!-- presen-it! reveal (at=2) -->

- 2回目のクリックで表示される<!-- presen-it! reveal (at=3) -->
- 3回目のクリックで表示される<!-- presen-it! reveal (at=4) -->
- 4回目のクリックで表示される<!-- presen-it! reveal (at=3) -->
- 3回目のクリックで表示される

<!-- presen-it! reveal -->

この文章は最初から表示されている (atの指定がない場合は0とみなす)

<!-- presen-it! reveal (at=5) -->

この部分は5回目のクリックで表示され、<!-- presen-it! reveal (at=6) --> この部分は6回目のクリックで表示される。

<!-- presen-it! reveal (at=7) -->

7<!-- presen-it! reveal (at=8) -->, 8<!-- presen-it! reveal (at=9) -->, 9<!-- presen-it! reveal (at=10) -->, 10!
```

スピーカーノートは HTML コメント（投影には出ず、Presenter に表示）。

### Rich content

- コードフェンス → **Shiki**
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

| Key                                  | Action                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `←` `→` / Space / Enter              | 前後（同一スライドの reveal ステップ → スライド）                      |
| `Home` / `End`                       | 最初 / 最後のスライド（ステップは入場状態）                            |
| 左右スライド端（パディング幅）短押し | 前へ / 次へ（投影・選択は無視。ホバーで矢印表示）                      |
| `O`                                  | オーバービュー（グリッド・フラグメント全表示）                         |
| `F`                                  | フルスクリーン                                                         |
| `P`                                  | プレゼンターを別タブで開く（投影タブはそのまま）                       |
| `B`                                  | ブラックアウト（投影を黒画面に。Presenter トグルでも可。`Esc` で解除） |
| `T`                                  | タイマー一時停止／再開（プレゼンター）                                 |
| `R`                                  | タイマーリセット（プレゼンター）                                       |
| `L`                                  | レーザーポインター（投影・プレゼンター。プレゼンターから投影へ同期）   |

左下にマウスを置くと、前後移動・Overview・Presenter・Fullscreen・Laser のツールバーが出ます。Presenter は別タブで開き、投影タブとスライド位置・reveal ステップ・レーザーは BroadcastChannel で同期します。

URL ハッシュは 1 始まり（`#3` = 3 枚目）。ステップはハッシュに含めません。`?presenter` を付けて直接プレゼンターを開くこともできます。機能一覧サンプルは `pnpm presenit dev kitchen-sink`。

## 1.0 compatibility

CLI・documented frontmatter・directives・Markdown 方言は SemVer で安定させます。詳細と「1.0 でやらないこと」は [docs/1.0-scope.md](./docs/1.0-scope.md)。

## Releasing

1. `package.json` と `src/pkg.ts` を同じ次バージョンに上げる
2. `CHANGELOG.md` を更新する
3. `main` にマージする
4. GitHub Release を作成し、タグを `vX.Y.Z` にする（`package.json` と一致必須）

Release 公開時、[`.github/workflows/release.yml`](./.github/workflows/release.yml) が npm Trusted Publishing（OIDC）で自動 publish する。詳細は [docs/publishing.md](./docs/publishing.md)。

公式サイト（GitHub Pages）は [`site/`](./site/) を [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) がデプロイする。

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
