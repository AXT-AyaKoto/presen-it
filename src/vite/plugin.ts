import type { Plugin } from "vite";
import path from "node:path";
import fs from "node:fs";
import { loadDeck, toClientData } from "../project/load";
import type { DeckConfig } from "../types";
import { transformViewerIndexHtml } from "./viewer-html";

export const VIRTUAL_DECK_ID = "virtual:presenit-deck";
const RESOLVED_VIRTUAL_DECK_ID = "\0" + VIRTUAL_DECK_ID;

export type PresenitPluginOptions = {
    cwd: string;
    slug: string;
};

/**
 * Dev uses `/__presenit_assets__/...`.
 * Build rewrites to paths relative to the slide directory root.
 */
function rewriteAssetUrlsForBuild(html: string): string {
    return html.replace(
        /\b(src|href)=["']\/__presenit_assets__\/([^"']+)["']/g,
        (_match, attr: string, url: string) => `${attr}="./${url}"`,
    );
}

async function copySlideMedia(slideDir: string, outDir: string): Promise<void> {
    const entries = await fs.promises.readdir(slideDir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === "slide.md" || entry.name.startsWith(".")) {
            continue;
        }
        const src = path.join(slideDir, entry.name);
        const dest = path.join(outDir, entry.name);
        if (entry.name === "_viewer") {
            continue;
        }
        await fs.promises.cp(src, dest, { recursive: true });
    }
}

export function presenitPlugin(options: PresenitPluginOptions): Plugin {
    let slideDir = path.resolve(options.cwd, "src", options.slug);
    let deckConfig: DeckConfig | undefined;
    let command: "build" | "serve" = "serve";

    async function ensureDeckConfig(): Promise<DeckConfig> {
        if (deckConfig) {
            return deckConfig;
        }
        const loaded = await loadDeck(options.cwd, options.slug);
        slideDir = loaded.slideDir;
        deckConfig = loaded.config;
        return deckConfig;
    }

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
                    deckConfig = undefined;
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
            deckConfig = loaded.config;
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
            await copySlideMedia(slideDir, outDir);
        },
        async transformIndexHtml(html) {
            const config = await ensureDeckConfig();
            return transformViewerIndexHtml(html, options.slug, config);
        },
    };
}
