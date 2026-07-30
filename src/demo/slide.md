---
theme: dark
hue: 210
width: 1920
height: 1080
---

# Presen'it!

Markdown から、美しいスライドを。

2026-07-30 ― Ayasaka-Koto (@AXT_AyaKoto)

<!-- presen-it! slide-break -->

## なにができる？

- ほぼ普通の Markdown を書くだけ
- 少ないディレクティブでページとカラムを分割
- 投影ビュー + プレゼンターモード + PDF（予定）

<!-- this is a speaker note: keep it short and useful -->

<!-- presen-it! slide-break (center-x=true) -->

## シンプルさが売り

余計な JSX も、毎回書く CSS もいらない

<!-- presen-it! slide-break -->

## ディレクティブ

```md
<!-- presen-it! slide-break -->
<!-- presen-it! column-break -->
<!-- presen-it! slide-break (center-x=true) -->
```

<!-- presen-it! column-break -->

- `slide-break` でページ分割
- `column-break` でカラム分割
- `center-x` / `center-y` で揃え

<!-- press P for presenter mode -->

<!-- presen-it! slide-break (center-x=true) -->

## さあ、作ろう

`pnpm presenit dev demo`
