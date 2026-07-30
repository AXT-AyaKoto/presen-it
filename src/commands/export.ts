import path from "node:path";
import { pathToFileURL } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { consola } from "consola";
import puppeteer from "puppeteer";
import { loadDeck } from "../project/load";
import { detectOverflow, logOverflowWarnings } from "../project/overflow";

function absolutizeAssets(html: string, slideDir: string): string {
    return html.replace(
        /\/__presenit_assets__\/([^"']+)/g,
        (_match, rel: string) => pathToFileURL(path.resolve(slideDir, rel)).href,
    );
}

function buildPrintDocument(options: {
    css: string;
    slidesHtml: string[];
    width: number;
    height: number;
    theme: string;
}): string {
    const slides = options.slidesHtml
        .map((html) => `<div class="presenit-print-page">${html}</div>`)
        .join("\n");

    return `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<style>
@page {
  size: ${options.width}px ${options.height}px;
  margin: 0;
}
html, body {
  margin: 0;
  padding: 0;
  background: #000;
}
.presenit-print-page {
  width: ${options.width}px;
  height: ${options.height}px;
  page-break-after: always;
  break-after: page;
  overflow: hidden;
}
.presenit-print-page:last-child {
  page-break-after: auto;
  break-after: auto;
}
${options.css}
</style>
</head>
<body>
<div class="presenit-deck" data-theme="${options.theme}">
${slides}
</div>
</body>
</html>`;
}

export async function runExport(slug: string, cwd = process.cwd()): Promise<string> {
    const loaded = await loadDeck(cwd, slug);
    const { width, height, theme } = loaded.config;

    const slidesHtml = loaded.slides.map((slide) => absolutizeAssets(slide.html, loaded.slideDir));

    const documentHtml = buildPrintDocument({
        css: loaded.css,
        slidesHtml,
        width,
        height,
        theme,
    });

    const outDir = path.resolve(cwd, "dist", slug);
    await mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, "resume.pdf");

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: await puppeteer.executablePath(),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width, height, deviceScaleFactor: 1 });

        const overflows = await detectOverflow(page, loaded);
        logOverflowWarnings(overflows);

        await page.setContent(documentHtml, {
            waitUntil: "load",
        });
        await page.evaluate(() => document.fonts.ready);
        await new Promise((resolve) => setTimeout(resolve, 400));

        await page.pdf({
            path: outPath,
            width: `${width}px`,
            height: `${height}px`,
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });
    } finally {
        await browser.close();
    }

    await writeFile(path.join(outDir, "resume.print.html"), documentHtml, "utf8");
    consola.success(`Exported ${path.relative(cwd, outPath)}`);
    return outPath;
}
