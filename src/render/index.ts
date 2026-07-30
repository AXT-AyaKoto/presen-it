import type { Deck } from "../types";
import { renderDeckHtml, renderDeckSlides, type RenderedSlide } from "./html";
import { buildThemeCss } from "./theme";

export type RenderDeckResult = {
    /** Full deck HTML fragment including embedded theme CSS. */
    html: string;
    /** Theme CSS alone (for injection into a host document). */
    css: string;
    slides: RenderedSlide[];
};

/**
 * Render a parsed deck into HTML + CSS.
 */
export function renderDeck(deck: Deck): RenderDeckResult {
    const css = buildThemeCss(deck.config);
    return {
        html: renderDeckHtml(deck, css),
        css,
        slides: renderDeckSlides(deck),
    };
}

export { buildThemeCss } from "./theme";
export { renderDeckHtml, renderDeckSlides, renderSlideHtml } from "./html";
export type { RenderedSlide } from "./html";
