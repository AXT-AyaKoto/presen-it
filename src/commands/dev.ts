import path from "node:path";
import { access } from "node:fs/promises";
import { consola } from "consola";
import { createServer, build as viteBuild } from "vite";
import { createViteConfig } from "../vite/config";
import { resolveSlidePath } from "../project/load";

async function assertSlideExists(cwd: string, slug: string): Promise<void> {
    const { slidePath } = resolveSlidePath(cwd, slug);
    try {
        await access(slidePath);
    } catch {
        throw new Error(`Slide not found: ${slidePath}\nExpected src/${slug}/slide.md`);
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
    }
    server.printUrls();
}

export async function runBuild(slug: string, cwd = process.cwd()): Promise<void> {
    await assertSlideExists(cwd, slug);
    const outDir = path.resolve(cwd, "dist", slug);
    const config = createViteConfig({ cwd, slug, outDir, command: "build" });
    await viteBuild(config);

    // Rename index.html → view.html per concept doc.
    const fs = await import("node:fs/promises");
    const from = path.join(outDir, "index.html");
    const to = path.join(outDir, "view.html");
    await fs.rename(from, to);
    consola.success(`Built ${path.relative(cwd, to)}`);
}
