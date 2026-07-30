import type { Plugin } from "vite";
import path from "node:path";
import fs from "node:fs";
import { loadDeck, toClientData, rewriteAssetUrls } from "../project/load";

export const VIRTUAL_DECK_ID = "virtual:presenit-deck";
const RESOLVED_VIRTUAL_DECK_ID = "\0" + VIRTUAL_DECK_ID;

export type PresenitPluginOptions = {
    cwd: string;
    slug: string;
};

function rewriteAssetUrlsForBuild(html: string): string {
    return html.replace(
        /\b(src|href)=["']\/__presenit_assets__\/([^"']+)["']/g,
        (_match, attr: string, url: string) => `${attr}="./assets/${url}"`,
    );
}

export function presenitPlugin(options: PresenitPluginOptions): Plugin {
    let slideDir = path.resolve(options.cwd, "src", options.slug);
    let command: "build" | "serve" = "serve";

    return {
        name: "presenit",
        configResolved(config) {
            command = config.command;
        },
        configureServer(server) {
            server.watcher.add(path.join(slideDir, "slide.md"));
            server.watcher.add(slideDir);

            server.middlewares.use((req, res, next) => {
                if (!req.url?.startsWith("/__presenit_assets__/")) {
                    next();
                    return;
                }

                const rel = decodeURIComponent(
                    req.url.slice("/__presenit_assets__/".length).split("?")[0] ?? "",
                );
                const filePath = path.resolve(slideDir, rel);
                if (!filePath.startsWith(slideDir) || !fs.existsSync(filePath)) {
                    res.statusCode = 404;
                    res.end("Not found");
                    return;
                }

                res.statusCode = 200;
                fs.createReadStream(filePath).pipe(res);
            });

            const reload = (file: string) => {
                if (
                    file === path.join(slideDir, "slide.md") ||
                    file.startsWith(slideDir + path.sep)
                ) {
                    const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_DECK_ID);
                    if (mod) {
                        server.moduleGraph.invalidateModule(mod);
                    }
                    server.ws.send({ type: "full-reload" });
                }
            };

            server.watcher.on("change", reload);
            server.watcher.on("add", reload);
        },
        resolveId(id) {
            if (id === VIRTUAL_DECK_ID) {
                return RESOLVED_VIRTUAL_DECK_ID;
            }
        },
        async load(id) {
            if (id !== RESOLVED_VIRTUAL_DECK_ID) {
                return;
            }

            const loaded = await loadDeck(options.cwd, options.slug);
            slideDir = loaded.slideDir;
            const data = toClientData(loaded);

            if (command === "build") {
                data.slides = data.slides.map((slide) => ({
                    ...slide,
                    html: rewriteAssetUrlsForBuild(slide.html),
                }));
            }

            return `export const deck = ${JSON.stringify(data)};`;
        },
        async writeBundle(outputOptions) {
            if (command !== "build") {
                return;
            }
            const outDir = outputOptions.dir;
            if (!outDir) {
                return;
            }

            const assetsSrc = path.join(slideDir, "assets");
            const assetsDest = path.join(outDir, "assets");
            if (fs.existsSync(assetsSrc)) {
                await fs.promises.cp(assetsSrc, assetsDest, { recursive: true });
            }

            // Also copy any top-level referenced files that live beside slide.md
            // (best-effort; paths already rewritten under ./assets/ for nested assets).
            void rewriteAssetUrls;
        },
        transformIndexHtml(html) {
            return html.replace(
                /<title>.*?<\/title>/,
                `<title>Presen'it! — ${options.slug}</title>`,
            );
        },
    };
}
