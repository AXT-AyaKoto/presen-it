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

## Commands (planned)

```bash
presenit dev <slug>      # interactive viewer
presenit build <slug>    # build HTML
presenit export <slug>   # export PDF
```

## License

[MIT](./LICENSE)
