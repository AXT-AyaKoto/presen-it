import path from "node:path";
import { access } from "node:fs/promises";
import { consola } from "consola";
import { createServer, build as viteBuild } from "vite";
import { createViteConfig } from "../vite/config";
import { loadDeck, resolveSlidePath } from "../project/load";
import { detectOverflow, logOverflowWarnings } from "../project/overflow";
import { launchPresenitBrowser } from "../project/chrome";

async function assertSlideExists(cwd: string, slug: string): Promise<void> {
    const { slidePath } = resolveSlidePath(cwd, slug);
    try {
        await access(slidePath);
    } catch {
        throw new Error(
            [
                `Slide not found: ${slidePath}`,
                `Expected: src/${slug}/slide.md`,
                `Create it, for example:`,
                ``,
                `  mkdir -p src/${slug}`,
                `  printf '%s\\n' '---' 'theme: dark' '---' '' '# Title' > src/${slug}/slide.md`,
            ].join("\n"),
        );
    }
}

async function warnOverflow(cwd: string, slug: string): Promise<void> {
    const loaded = await loadDeck(cwd, slug);
    const browser = await launchPresenitBrowser();
    try {
        const page = await browser.newPage();
        await page.setViewport({
            width: loaded.config.width,
            height: loaded.config.height,
            deviceScaleFactor: 1,
        });
        const hits = await detectOverflow(page, loaded);
        logOverflowWarnings(hits);
    } finally {
        await browser.close();
    }
}

export async function runDev(slug: string, cwd = process.cwd()): Promise<void> {
    await assertSlideExists(cwd, slug);
    const config = createViteConfig({ cwd, slug, command: "serve" });
    const server = await createServer(config);
    await server.listen();
    const urls = server.resolvedUrls;
    consola.success(`Presen'it! dev server ready for "${slug}"`);
    if (urls?.local[0]) {
        consola.info(urls.local[0]);
        consola.info(`Presenter: ${urls.local[0]}?presenter`);
        consola.info(
            "Keys: ← → · click L/R 20% · O overview · P presenter · F fullscreen · bottom-left toolbar",
        );
    }
    server.printUrls();
}

export async function runBuild(slug: string, cwd = process.cwd()): Promise<void> {
    await assertSlideExists(cwd, slug);
    const outDir = path.resolve(cwd, "dist", slug);
    const config = createViteConfig({ cwd, slug, outDir, command: "build" });
    await viteBuild(config);

    const fs = await import("node:fs/promises");
    const from = path.join(outDir, "index.html");
    const to = path.join(outDir, "view.html");
    await fs.rename(from, to);

    try {
        await warnOverflow(cwd, slug);
    } catch (error) {
        consola.warn("Overflow check skipped:", error);
    }

    consola.success(`Built ${path.relative(cwd, to)}`);
}
