import type { Html, Root, RootContent } from "mdast";
import { toHast } from "mdast-util-to-hast";
import { toHtml } from "hast-util-to-html";
import type { Column, Deck, DeckConfig, Slide } from "../types";

export type RenderedSlide = {
    html: string;
    notes: string | null;
};

export type RenderResult = {
    slides: RenderedSlide[];
    css: string;
    config: DeckConfig;
};

function escapeHtml(text: string): string {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function sanitizeNodes(nodes: RootContent[], rawHTML: boolean): RootContent[] {
    if (rawHTML) {
        return nodes;
    }

    return nodes.map((node) => {
        if (node.type === "html") {
            // Escape raw HTML into visible text when rawHTML is disabled.
            return {
                type: "paragraph",
                children: [
                    {
                        type: "text",
                        value: (node as Html).value,
                    },
                ],
            };
        }
        return node;
    });
}

function mdastToHtml(nodes: RootContent[], rawHTML: boolean): string {
    if (nodes.length === 0) {
        return "";
    }

    const root: Root = { type: "root", children: sanitizeNodes(nodes, rawHTML) };
    const hast = toHast(root, {
        allowDangerousHtml: rawHTML,
    });
    if (!hast) {
        return "";
    }
    return toHtml(hast, {
        allowDangerousHtml: rawHTML,
    });
}

function renderColumn(column: Column, rawHTML: boolean): string {
    const classes = ["presenit-column"];
    if (column.align.centerX) {
        classes.push("presenit-column--center-x");
    }
    if (column.align.centerY) {
        classes.push("presenit-column--center-y");
    }

    const content = mdastToHtml(column.children, rawHTML);
    return `<div class="${classes.join(" ")}">${content}</div>`;
}

function renderHeader(slide: Slide, rawHTML: boolean): string {
    if (!slide.header) {
        return "";
    }
    const html = mdastToHtml([slide.header], rawHTML);
    return `<header class="presenit-slide-header">${html}</header>`;
}

export function renderSlideHtml(
    slide: Slide,
    index: number,
    total: number,
    rawHTML: boolean,
): string {
    const header = renderHeader(slide, rawHTML);
    const columns = slide.columns.map((column) => renderColumn(column, rawHTML)).join("");
    const number = `<div class="presenit-slide-number">${index + 1} / ${total}</div>`;

    return [
        `<section class="presenit-slide" data-slide-index="${index}" aria-label="Slide ${index + 1} of ${total}">`,
        header,
        `<div class="presenit-slide-body">${columns}</div>`,
        number,
        `</section>`,
    ].join("");
}

export function renderDeckHtml(deck: Deck, css: string): string {
    const slides = deck.slides
        .map((slide, index) =>
            renderSlideHtml(slide, index, deck.slides.length, deck.config.rawHTML),
        )
        .join("\n");

    return [
        `<div class="presenit-deck" data-theme="${escapeHtml(deck.config.theme)}" style="--presenit-slide-width:${deck.config.width}px;--presenit-slide-height:${deck.config.height}px;">`,
        `<style>${css}</style>`,
        slides,
        `</div>`,
    ].join("\n");
}

export function renderDeckSlides(deck: Deck): RenderedSlide[] {
    return deck.slides.map((slide, index) => ({
        html: renderSlideHtml(slide, index, deck.slides.length, deck.config.rawHTML),
        notes: slide.notes,
    }));
}
