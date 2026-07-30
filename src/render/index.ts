import type { Deck } from "../types";
import { renderDeckHtml, renderDeckSlides, type RenderedSlide } from "./html";
import { buildThemeCss } from "./theme";

export type RenderDeckResult = {
    /** Full deck HTML fragment including embedded theme CSS. */
    html: string;
    /** Theme CSS alone (for injection into a host document). */
    css: string;
    slides: RenderedSlide[];
    /** Whether KaTeX styles were included for math content. */
    hasMath: boolean;
};

/**
 * Render a parsed deck into HTML + CSS.
 */
export async function renderDeckAsync(deck: Deck): Promise<RenderDeckResult> {
    const css = buildThemeCss(deck.config);
    const { slides, hasMath } = await renderDeckSlides(deck);
    const slidesHtml = slides.map((slide) => slide.html).join("\n");
    return {
        html: renderDeckHtml(deck, css, slidesHtml, hasMath),
        css,
        slides,
        hasMath,
    };
}

/** @alias renderDeckAsync */
export const renderDeck = renderDeckAsync;

export { buildThemeCss } from "./theme";
export { renderDeckHtml, renderDeckSlides, renderSlideHtml } from "./html";
export type { RenderedSlide } from "./html";
