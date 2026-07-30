---
theme: light
hue: 210
width: 1920
height: 1080
footer: "presen-it! kitchen sink"
---

<!-- presen-it! slide-break (center-x=true) -->

# Kitchen Sink

機能・レイアウト・デザインを一通り確認するサンプル

左下にマウスを置くとナビが出ます（Overview / Presenter / Fullscreen）

<!-- tip: also try ?presenter and the O / P keys -->

<!-- presen-it! slide-break (center-x=true&center-y=true) -->

## Section divider

大きな見出しだけの区切りページ

<!-- section break example -->

<!-- presen-it! slide-break -->

## Markdown basics

- 箇条書き
- **強調** と _斜体_ と `inline code`
- [リンク](https://example.com)

1. 順序付き
2. リストも OK

- [ ] 未着手のタスク
- [x] 完了したタスク（読み取り専用）

<!-- keep notes short -->

<!-- presen-it! slide-break -->

## Typography ladder

# Heading 1

## Heading 2

### Heading 3

本文は読みやすさ優先。長い一文でも行間を確保して、スライドとしての密度を保ちます。

<!-- presen-it! slide-break -->

## Code

```ts
export function greet(name: string): string {
    return `Hello, ${name}!`;
}
```

<!-- presen-it! column-break -->

```css
.hero {
    letter-spacing: 0.01em;
}
```

<!-- code + columns -->

<!-- presen-it! slide-break -->

## Math

インライン: $a^2 + b^2 = c^2$

$$
\sum_{n=1}^{N} n = \frac{N(N+1)}{2}
$$

<!-- katex -->

<!-- presen-it! slide-break (center-x=true) -->

## Mermaid

```mermaid
flowchart TD
    A[slide.md] --> B[parse]
    B --> C[render]
    C --> D[view.html]
    C --> E[resume.pdf]
```

<!-- diagram -->

<!-- presen-it! slide-break -->

## Two columns

左カラムは説明文。長めの段落でもカラム内で折り返します。

- ポイント A
- ポイント B

<!-- presen-it! column-break (center-x=true) -->

右カラムは中央揃え。

> Tip: `center-x` / `center-y` は column 側が優先されます

<!-- columns -->

<!-- presen-it! slide-break -->

## Quote & table

> スライドは「読む文書」から切り出す。宣言は最小限に。

| Feature  | Tool              |
| -------- | ----------------- |
| Code     | Shiki             |
| Math     | KaTeX             |
| Diagrams | beautiful-mermaid |

<!-- mixed blocks -->

<!-- presen-it! slide-break -->

## Alerts

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

<!-- github alerts -->

<!-- presen-it! slide-break (center-x=true&center-y=false) -->

## Top-centered title

`center-y=false` なので縦は上寄せ、横だけ中央

<!-- alignment -->

<!-- presen-it! slide-break (center-x=true) -->

## Done

```bash
pnpm presenit dev kitchen-sink
pnpm presenit export kitchen-sink
```

投影ビューは **左右スライド端（パディング幅）** の短押しで前後移動（ドラッグ選択はページ送りしない）
