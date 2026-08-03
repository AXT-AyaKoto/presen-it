import path from "node:path";
import { readFile } from "node:fs/promises";
import { consola } from "consola";

const ASSET_PATH_RE = /\/__presenit_assets__\/([^"']+)/g;

const MIME_BY_EXT: Record<string, string> = {
    ".apng": "image/apng",
    ".avif": "image/avif",
    ".bmp": "image/bmp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
};

function mimeFromPath(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

function isInsideSlideDir(filePath: string, slideDir: string): boolean {
    const resolvedSlideDir = path.resolve(slideDir);
    const resolvedFile = path.resolve(filePath);
    return (
        resolvedFile === resolvedSlideDir || resolvedFile.startsWith(resolvedSlideDir + path.sep)
    );
}

/**
 * Replace `/__presenit_assets__/...` with data URIs so Puppeteer `setContent`
 * (about:blank) can still load local images into the PDF.
 */
export async function inlineLocalAssets(html: string, slideDir: string): Promise<string> {
    const rels = [...html.matchAll(ASSET_PATH_RE)].map((match) => match[1]!).filter(Boolean);
    if (rels.length === 0) {
        return html;
    }

    const cache = new Map<string, string>();
    for (const rel of new Set(rels)) {
        const decoded = decodeURIComponent(rel);
        const filePath = path.resolve(slideDir, decoded);
        if (!isInsideSlideDir(filePath, slideDir)) {
            consola.warn(`Skipping asset outside slide directory: ${decoded}`);
            continue;
        }

        try {
            const bytes = await readFile(filePath);
            const mime = mimeFromPath(filePath);
            cache.set(rel, `data:${mime};base64,${bytes.toString("base64")}`);
        } catch {
            consola.warn(`Missing local asset for PDF export: ${decoded}`);
        }
    }

    return html.replace(ASSET_PATH_RE, (match, rel: string) => cache.get(rel) ?? match);
}
