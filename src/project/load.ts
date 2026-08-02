import { readFile } from "node:fs/promises";
import path from "node:path";
import { consola } from "consola";
import { parseSlideMarkdown } from "../parse/index";
import { renderDeckAsync } from "../render/index";
import type { Deck, DeckConfig, Diagnostic } from "../types";
import type { RenderedSlide } from "../render/index";

export type LoadedDeck = {
    slug: string;
    slidePath: string;
    slideDir: string;
    deck: Deck;
    css: string;
    slides: RenderedSlide[];
    config: DeckConfig;
};

export function resolveSlidePath(
    cwd: string,
    slug: string,
): {
    slidePath: string;
    slideDir: string;
} {
    const slideDir = path.resolve(cwd, "src", slug);
    const slidePath = path.join(slideDir, "slide.md");
    return { slidePath, slideDir };
}

/**
 * Rewrite relative asset URLs so the Vite/dev server can resolve them
 * from the slide directory via `/__presenit_assets__/...`.
 */
export function rewriteAssetUrls(html: string): string {
    return html.replace(
        /\b(src|href)=["'](?!https?:|data:|\/|#)([^"']+)["']/g,
        (_match, attr: string, url: string) => {
            const cleaned = url.replace(/^\.\//, "");
            return `${attr}="/__presenit_assets__/${cleaned}"`;
        },
    );
}

export async function loadDeck(cwd: string, slug: string): Promise<LoadedDeck> {
    const { slidePath, slideDir } = resolveSlidePath(cwd, slug);
    const source = await readFile(slidePath, "utf8");
    const deck = parseSlideMarkdown(source);
    logDiagnostics(deck.diagnostics);

    const rendered = await renderDeckAsync(deck);
    const slides = rendered.slides.map((slide) => ({
        ...slide,
        html: rewriteAssetUrls(slide.html),
    }));

    return {
        slug,
        slidePath,
        slideDir,
        deck,
        css: rendered.css,
        slides,
        config: deck.config,
    };
}

export function logDiagnostics(diagnostics: Diagnostic[]): void {
    for (const diagnostic of diagnostics) {
        if (diagnostic.severity === "error") {
            consola.error(diagnostic.message);
        } else {
            consola.warn(diagnostic.message);
        }
    }
}

export type DeckClientData = {
    slug: string;
    config: DeckConfig;
    css: string;
    slides: Array<{ html: string; notes: string | null; maxStep: number }>;
};

export function toClientData(loaded: LoadedDeck): DeckClientData {
    return {
        slug: loaded.slug,
        config: loaded.config,
        css: loaded.css,
        slides: loaded.slides.map((slide) => ({
            html: slide.html,
            notes: slide.notes,
            maxStep: slide.maxStep,
        })),
    };
}
