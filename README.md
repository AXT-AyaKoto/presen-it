# Presen'it!

Markdown から美しいプレゼンスライドを作るツール。

通常の Markdown 文書としても読める単一ファイルを、少ない宣言だけで読みやすいスライドと PDF に組版します。

> 🚧 開発中 — `@axt_ayakoto/presenit`

## Requirements

- Node.js >= 22
- pnpm

## Development

```bash
pnpm install
pnpm build
pnpm check
pnpm presenit --help
```

### Try the demo

```bash
pnpm build
pnpm presenit dev demo
# Presenter mode: open the URL with ?presenter
# Keys: ← → navigate · P presenter · F fullscreen · T timer

pnpm presenit build demo
# → dist/demo/view.html
```

## Commands

```bash
presenit dev <slug>      # interactive viewer
presenit build <slug>    # build HTML → dist/<slug>/view.html
presenit export <slug>   # export PDF (coming soon)
```

Expect `src/<slug>/slide.md` in the project.

## License

[MIT](./LICENSE)
