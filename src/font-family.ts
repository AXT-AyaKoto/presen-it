const GENERIC_FAMILIES = new Set([
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "ui-sans-serif",
    "ui-serif",
    "ui-monospace",
    "ui-rounded",
    "emoji",
    "math",
    "fangsong",
    "inherit",
    "initial",
    "unset",
    "revert",
    "revert-layer",
]);

export function isGenericFontFamily(name: string): boolean {
    return GENERIC_FAMILIES.has(name.trim().toLowerCase());
}

/**
 * Format one family name for a CSS `font-family` list.
 */
export function formatCssFontFamilyName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
        return "";
    }
    if (isGenericFontFamily(trimmed) || /^[a-zA-Z][\w-]*$/.test(trimmed)) {
        return trimmed;
    }
    return `"${trimmed.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

/**
 * Join family names into a CSS `font-family` value (quotes added when needed).
 */
export function fontFamilyListToCss(names: string[]): string {
    return names.map(formatCssFontFamilyName).filter(Boolean).join(", ");
}

/**
 * Split a CSS `font-family` list into individual family names (quotes stripped).
 */
export function parseFontFamilyList(value: string): string[] {
    const families: string[] = [];
    let current = "";
    let quote: '"' | "'" | null = null;

    for (const ch of value) {
        if (quote) {
            if (ch === quote) {
                quote = null;
            } else {
                current += ch;
            }
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
        }
        if (ch === ",") {
            const trimmed = current.trim();
            if (trimmed) {
                families.push(trimmed);
            }
            current = "";
            continue;
        }
        current += ch;
    }

    const trimmed = current.trim();
    if (trimmed) {
        families.push(trimmed);
    }
    return families;
}

export function namedFontFamilies(...stacks: string[]): string[] {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const stack of stacks) {
        for (const family of parseFontFamilyList(stack)) {
            const key = family.toLowerCase();
            if (isGenericFontFamily(family) || seen.has(key)) {
                continue;
            }
            seen.add(key);
            names.push(family);
        }
    }
    return names;
}

/**
 * Build `@import` rules that ask Google Fonts for each declared named family.
 * Unknown families simply fail that one request; other families still load.
 * Locally installed fonts still win when the browser already has them.
 */
export function buildGoogleFontsImports(families: string[]): string {
    if (families.length === 0) {
        return "";
    }

    return families
        .map((family) => {
            const encoded = encodeURIComponent(family).replaceAll("%20", "+");
            return `@import url("https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap");`;
        })
        .join("\n");
}
