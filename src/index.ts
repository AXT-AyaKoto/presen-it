/**
 * Presen'it! — turn readable Markdown into beautiful presentation slides.
 */
export { parseSlideMarkdown } from "./parse/index";
export {
    renderDeck,
    renderDeckAsync,
    buildThemeCss,
    renderDeckHtml,
    renderDeckSlides,
} from "./render/index";
export type { RenderedSlide, RenderDeckResult } from "./render/index";
export type {
    AlignOptions,
    Column,
    Deck,
    DeckConfig,
    Diagnostic,
    FontFamilyConfig,
    Slide,
    ThemeName,
} from "./types";
export { DEFAULT_CONFIG, DEFAULT_SLIDE_ALIGN, name, version } from "./pkg";
