import { buildGoogleFontsImports, namedFontFamilies } from "./fonts";

type ThemeBuildConfig = {
    theme: "light" | "dark";
    hue: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: { sans: string; mono: string };
};

function buildPaletteVars(theme: "light" | "dark", hue: number): string {
    if (theme === "light") {
        return `
        --presenit-bg: oklch(0.97 0.006 ${hue});
        --presenit-slide-bg: oklch(0.99 0.006 ${hue});
        --presenit-slide-bg-top: oklch(1 0.004 ${hue});
        --presenit-slide-bg-bottom: oklch(0.955 0.022 ${hue});
        --presenit-slide-wash: oklch(0.9 0.06 ${hue} / 0.32);
        --presenit-surface: oklch(0.955 0.01 ${hue});
        --presenit-text: oklch(0.24 0.025 ${hue});
        --presenit-text-muted: oklch(0.5 0.03 ${hue});
        --presenit-border: oklch(0.88 0.012 ${hue});
        --presenit-accent: oklch(0.52 0.17 ${hue});
        --presenit-accent-hover: oklch(0.45 0.19 ${hue});
        --presenit-code-bg: oklch(0.945 0.012 ${hue});
        --presenit-blockquote-bg: oklch(0.965 0.015 ${hue});
        `.trim();
    }

    return `
        --presenit-bg: oklch(0.16 0.008 ${hue});
        --presenit-slide-bg: oklch(0.2 0.012 ${hue});
        --presenit-slide-bg-top: oklch(0.255 0.02 ${hue});
        --presenit-slide-bg-bottom: oklch(0.16 0.01 ${hue});
        --presenit-slide-wash: oklch(0.48 0.1 ${hue} / 0.28);
        --presenit-surface: oklch(0.25 0.012 ${hue});
        --presenit-text: oklch(0.94 0.008 ${hue});
        --presenit-text-muted: oklch(0.66 0.012 ${hue});
        --presenit-border: oklch(0.34 0.014 ${hue});
        --presenit-accent: oklch(0.74 0.14 ${hue});
        --presenit-accent-hover: oklch(0.8 0.15 ${hue});
        --presenit-code-bg: oklch(0.23 0.01 ${hue});
        --presenit-blockquote-bg: oklch(0.22 0.011 ${hue});
    `.trim();
}

export function buildThemeCss(config: ThemeBuildConfig): string {
    const { theme, hue, width, height, fontSize, fontFamily } = config;
    const slidePadding = height * 0.045;
    const paletteVars = buildPaletteVars(theme, hue);
    const fontFamilies = namedFontFamilies(fontFamily.sans, fontFamily.mono);
    const fontImport = buildGoogleFontsImports(fontFamilies);
    const fontImportBlock = fontImport ? `${fontImport}\n` : "";

    return `${fontImportBlock}
.presenit-deck,
.presenit-slide {
    ${paletteVars}
    --presenit-width: ${width}px;
    --presenit-height: ${height}px;
    --presenit-font-size: ${fontSize}px;
    --presenit-font-sans: ${fontFamily.sans};
    --presenit-font-mono: ${fontFamily.mono};
    --presenit-slide-padding: ${slidePadding}px;
    --presenit-slide-width: ${width}px;
    --presenit-slide-height: ${height}px;
    box-sizing: border-box;
    font-family: var(--presenit-font-sans);
    font-size: var(--presenit-font-size);
    line-height: 1.55;
    color: var(--presenit-text);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
}

.presenit-deck {
    background: var(--presenit-bg);
}

.presenit-deck *,
.presenit-deck *::before,
.presenit-deck *::after,
.presenit-slide *,
.presenit-slide *::before,
.presenit-slide *::after {
    box-sizing: border-box;
}

.presenit-slide {
    width: var(--presenit-slide-width);
    height: var(--presenit-slide-height);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: var(--presenit-slide-padding);
    background-color: var(--presenit-slide-bg);
    background-image:
        radial-gradient(ellipse 90% 70% at 100% -10%, var(--presenit-slide-wash), transparent 58%),
        linear-gradient(165deg, var(--presenit-slide-bg-top) 0%, var(--presenit-slide-bg-bottom) 100%);
    border: 1px solid var(--presenit-border);

    color: var(--presenit-text);
}

.presenit-slide-header {
    flex-shrink: 0;
    margin-bottom: calc(var(--presenit-slide-height) * 0.022);
    padding-bottom: calc(var(--presenit-slide-height) * 0.014);
    border-bottom: 1px solid var(--presenit-border);
}

.presenit-slide-header h2 {
    margin: 0;
    font-size: 1.55em;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.025em;
    color: var(--presenit-text);
}

.presenit-slide-body {
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: calc(var(--presenit-slide-width) * 0.032);
    min-height: 0;
}

.presenit-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.presenit-column--center-x {
    text-align: center;
    align-items: center;
}

.presenit-column--center-y {
    justify-content: center;
}

.presenit-column:not(.presenit-column--center-y) {
    justify-content: flex-start;
}

.presenit-slide-number {
    position: absolute;
    bottom: calc(var(--presenit-slide-height) * 0.028);
    right: calc(var(--presenit-slide-width) * 0.028);
    font-size: 0.625em;
    font-weight: 500;
    color: var(--presenit-text-muted);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
    line-height: 1;
}

.presenit-column h1 {
    margin: 0 0 0.45em;
    font-size: 2.2em;
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: 0.01em;
    color: var(--presenit-text);
}

.presenit-column h2 {
    margin: 0.65em 0 0.35em;
    font-size: 1.55em;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.025em;
    color: var(--presenit-text);
}

.presenit-column h2:first-child {
    margin-top: 0;
}

.presenit-column h3 {
    margin: 0.55em 0 0.3em;
    font-size: 1.28em;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.02em;
    color: var(--presenit-text);
}

.presenit-column h3:first-child {
    margin-top: 0;
}

.presenit-column p {
    margin: 0.4em 0;
    color: var(--presenit-text);
}

.presenit-column p:first-child {
    margin-top: 0;
}

.presenit-column p:last-child {
    margin-bottom: 0;
}

.presenit-column ul,
.presenit-column ol {
    margin: 0.45em 0;
    padding-left: 1.45em;
}

.presenit-column ul:first-child,
.presenit-column ol:first-child {
    margin-top: 0;
}

.presenit-column ul:last-child,
.presenit-column ol:last-child {
    margin-bottom: 0;
}

.presenit-column li {
    margin: 0.28em 0;
    padding-left: 0.15em;
}

.presenit-column li::marker {
    color: var(--presenit-accent);
    font-weight: 600;
}

.presenit-column blockquote {
    margin: 0.55em 0;
    padding: 0.7em 1em;
    border-left: 4px solid var(--presenit-accent);
    border-radius: 0 5px 5px 0;
    background: var(--presenit-blockquote-bg);
    color: var(--presenit-text);
}

.presenit-column blockquote p {
    margin: 0.25em 0;
}

.presenit-column blockquote p:first-child {
    margin-top: 0;
}

.presenit-column blockquote p:last-child {
    margin-bottom: 0;
}

.presenit-column pre {
    margin: 0.55em 0;
    padding: 0.8em 1em;
    overflow: auto;
    font-family: var(--presenit-font-mono);
    font-size: 0.84em;
    line-height: 1.45;
    background: var(--presenit-code-bg);
    border: 1px solid var(--presenit-border);
    border-radius: 5px;
    color: var(--presenit-text);
    text-align: left;
}

.presenit-column--center-x pre,
.presenit-column--center-x pre.shiki {
    align-self: center;
    width: fit-content;
    max-width: 100%;
    text-align: left;
}

.presenit-column pre:first-child {
    margin-top: 0;
}

.presenit-column pre:last-child {
    margin-bottom: 0;
}

.presenit-column pre code {
    padding: 0;
    background: none;
    border-radius: 0;
    font-size: inherit;
}

.presenit-column code {
    font-family: var(--presenit-font-mono);
    font-size: 0.88em;
}

.presenit-column :not(pre) > code {
    padding: 0.12em 0.38em;
    background: var(--presenit-code-bg);
    border: 1px solid var(--presenit-border);
    border-radius: 4px;
}

.presenit-column table {
    width: 100%;
    margin: 0.55em 0;
    border-collapse: collapse;
    font-size: 0.9em;
    line-height: 1.4;
}

.presenit-column table:first-child {
    margin-top: 0;
}

.presenit-column table:last-child {
    margin-bottom: 0;
}

.presenit-column th,
.presenit-column td {
    padding: 0.5em 0.75em;
    border: 1px solid var(--presenit-border);
    text-align: left;
    vertical-align: top;
}

.presenit-column th {
    font-weight: 600;
    background: var(--presenit-surface);
    border-bottom: 2px solid var(--presenit-accent);
    color: var(--presenit-text);
}

.presenit-column td {
    color: var(--presenit-text);
}

.presenit-column a {
    color: var(--presenit-accent);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.18em;
    font-weight: 500;
}

.presenit-column a:hover {
    color: var(--presenit-accent-hover);
}

.presenit-column img {
    display: block;
    max-width: 100%;
    max-height: calc(var(--presenit-slide-height) * 0.75);
    width: auto;
    height: auto;
    object-fit: contain;
}

.presenit-column--center-x img {
    margin-left: auto;
    margin-right: auto;
}

.presenit-column hr {
    margin: 0.85em 0;
    border: none;
    border-top: 1px solid var(--presenit-border);
    background: none;
}

.presenit-column strong,
.presenit-column b {
    font-weight: 700;
    color: var(--presenit-text);
}

.presenit-column em {
    font-style: italic;
}

.presenit-mermaid {
    margin: 0.55em 0;
    width: 100%;
    max-width: 100%;
    max-height: calc(var(--presenit-slide-height) * 2 / 3);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

.presenit-mermaid:first-child {
    margin-top: 0;
}

.presenit-mermaid:last-child {
    margin-bottom: 0;
}

.presenit-mermaid svg {
    display: block;
    width: auto;
    height: calc(var(--presenit-slide-height) * 2 / 3);
    max-width: 100%;
    max-height: calc(var(--presenit-slide-height) * 2 / 3);
}

.presenit-column--center-x .presenit-mermaid svg {
    margin-left: auto;
    margin-right: auto;
}

.presenit-column pre.shiki {
    margin: 0.55em 0;
    padding: 0.8em 1em;
    overflow: auto;
    font-family: var(--presenit-font-mono);
    font-size: 0.84em;
    line-height: 1.45;
    border: 1px solid var(--presenit-border);
    border-radius: 5px;
    text-align: left;
}

.presenit-column pre.shiki:first-child {
    margin-top: 0;
}

.presenit-column pre.shiki:last-child {
    margin-bottom: 0;
}

.presenit-column pre.shiki code {
    padding: 0;
    background: none;
    border: none;
    border-radius: 0;
    font-size: inherit;
}

.presenit-column .katex-display {
    margin: 0.55em 0;
    overflow-x: auto;
    overflow-y: visible;
    padding-top: 0.15em;
    padding-bottom: 0.15em;
}
`.trim();
}
