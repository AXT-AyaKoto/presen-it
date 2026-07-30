/**
 * Generate light/dark comparison PNGs for human design review.
 * Usage: pnpm exec tsx scripts/capture-theme-previews.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
import { parseSlideMarkdown } from "../src/parse/index";
import { renderDeckAsync } from "../src/render/index";

const SAMPLE = `<!-- presen-it! slide-break (center-x=true) -->

# AyaExpTech Presen'it!

美しいスライドを、普通の Markdown から。

<!-- presen-it! slide-break -->

## できること

- 投影ビュー / プレゼンター
- PDF 出力
- Shiki / KaTeX / Mermaid

<!-- note -->

<!-- presen-it! slide-break (center-x=true) -->

## シンプルさが売り

\`const tip = "JSX いらず";\`
`;

async function renderTheme(theme: "light" | "dark"): Promise<string> {
    const deck = parseSlideMarkdown(`---\ntheme: ${theme}\nhue: 210\n---\n\n${SAMPLE}`);
    const result = await renderDeckAsync(deck);
    const slide = result.slides[0]!.html;
    return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#111}
${result.css}
</style></head><body>${slide}</body></html>`;
}

async function main(): Promise<void> {
    const outDir = path.resolve("tmp/design-previews");
    await mkdir(outDir, { recursive: true });
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: await puppeteer.executablePath(),
    });
    try {
        for (const theme of ["light", "dark"] as const) {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
            await page.setContent(await renderTheme(theme), { waitUntil: "load" });
            await page.evaluate(() => document.fonts.ready);
            await new Promise((r) => setTimeout(r, 600));
            const file = path.join(outDir, `title-${theme}.png`);
            await page.screenshot({ path: file, type: "png" });
            await page.close();
            await writeFile(path.join(outDir, `title-${theme}.html`), await renderTheme(theme));
            console.log("wrote", file);
        }
    } finally {
        await browser.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
