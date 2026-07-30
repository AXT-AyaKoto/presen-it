import type { Page } from "puppeteer";
import { consola } from "consola";
import type { LoadedDeck } from "../project/load";

export type OverflowHit = {
    slideIndex: number;
    columnIndex: number;
};

/**
 * Detect clipped column overflow on rendered slides (scrollHeight > clientHeight).
 */
export async function detectOverflow(page: Page, deck: LoadedDeck): Promise<OverflowHit[]> {
    const hits: OverflowHit[] = [];

    for (let slideIndex = 0; slideIndex < deck.slides.length; slideIndex++) {
        const slide = deck.slides[slideIndex]!;
        await page.setContent(
            `<!doctype html><html><head><style>${deck.css}</style></head><body>${slide.html}</body></html>`,
            { waitUntil: "load" },
        );

        const columnHits = await page.$$eval(".presenit-column", (columns) =>
            columns
                .map((column, columnIndex) => ({
                    columnIndex,
                    overflow: column.scrollHeight > column.clientHeight + 1,
                }))
                .filter((entry) => entry.overflow)
                .map((entry) => entry.columnIndex),
        );

        for (const columnIndex of columnHits) {
            hits.push({ slideIndex, columnIndex });
        }
    }

    return hits;
}

export function logOverflowWarnings(hits: OverflowHit[]): void {
    for (const hit of hits) {
        consola.warn(
            `Slide ${hit.slideIndex + 1} column ${hit.columnIndex + 1}: content overflows and will be clipped`,
        );
    }
}
