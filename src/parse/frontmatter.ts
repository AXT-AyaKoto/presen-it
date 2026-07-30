import type { DeckConfig, Diagnostic, FontFamilyConfig, ThemeName } from "../types";
import { DEFAULT_CONFIG } from "../types";
import { fontFamilyListToCss } from "../font-family";
import { parse as parseYaml } from "yaml";

export type FrontmatterResult = {
    config: DeckConfig;
    body: string;
    diagnostics: Diagnostic[];
};

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function splitFrontmatter(source: string): { raw: unknown; body: string } {
    const match = FRONTMATTER_RE.exec(source);
    if (!match) {
        return { raw: {}, body: source };
    }

    try {
        const raw = parseYaml(match[1] ?? "") ?? {};
        return { raw, body: match[2] ?? "" };
    } catch {
        return { raw: { __parseError: true }, body: match[2] ?? "" };
    }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function warn(diagnostics: Diagnostic[], message: string): void {
    diagnostics.push({ severity: "warning", message });
}

function normalizeTheme(value: unknown, diagnostics: Diagnostic[]): ThemeName {
    if (value === undefined) {
        return DEFAULT_CONFIG.theme;
    }
    if (value === "light" || value === "dark") {
        return value;
    }
    warn(diagnostics, `frontmatter.theme must be "light" | "dark", got ${JSON.stringify(value)}`);
    return DEFAULT_CONFIG.theme;
}

function normalizeHue(value: unknown, diagnostics: Diagnostic[]): number {
    if (value === undefined) {
        return DEFAULT_CONFIG.hue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return ((value % 360) + 360) % 360;
    }
    warn(diagnostics, `frontmatter.hue must be a number, got ${JSON.stringify(value)}`);
    return DEFAULT_CONFIG.hue;
}

function normalizePositiveNumber(
    value: unknown,
    key: string,
    fallback: number,
    diagnostics: Diagnostic[],
): number {
    if (value === undefined) {
        return fallback;
    }
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        return value;
    }
    warn(diagnostics, `frontmatter.${key} must be a positive number, got ${JSON.stringify(value)}`);
    return fallback;
}

function normalizeBoolean(
    value: unknown,
    key: string,
    fallback: boolean,
    diagnostics: Diagnostic[],
): boolean {
    if (value === undefined) {
        return fallback;
    }
    if (typeof value === "boolean") {
        return value;
    }
    warn(diagnostics, `frontmatter.${key} must be a boolean, got ${JSON.stringify(value)}`);
    return fallback;
}

function normalizeFontFamilyEntry(
    value: unknown,
    key: "sans" | "mono",
    fallback: string,
    diagnostics: Diagnostic[],
): string {
    if (value === undefined) {
        return fallback;
    }
    if (typeof value === "string") {
        return value;
    }
    if (Array.isArray(value)) {
        const names: string[] = [];
        let invalid = false;
        for (const entry of value) {
            if (typeof entry === "string" && entry.trim()) {
                names.push(entry.trim());
            } else {
                invalid = true;
            }
        }
        if (invalid) {
            warn(
                diagnostics,
                `frontmatter.fontFamily.${key} array entries must be non-empty strings`,
            );
        }
        if (names.length === 0) {
            warn(diagnostics, `frontmatter.fontFamily.${key} array was empty; using default`);
            return fallback;
        }
        return fontFamilyListToCss(names);
    }
    warn(
        diagnostics,
        `frontmatter.fontFamily.${key} must be a string or string array, got ${JSON.stringify(value)}`,
    );
    return fallback;
}

function normalizeFontFamily(value: unknown, diagnostics: Diagnostic[]): FontFamilyConfig {
    if (value === undefined) {
        return { ...DEFAULT_CONFIG.fontFamily };
    }
    if (!isPlainObject(value)) {
        warn(diagnostics, `frontmatter.fontFamily must be an object, got ${JSON.stringify(value)}`);
        return { ...DEFAULT_CONFIG.fontFamily };
    }

    return {
        sans: normalizeFontFamilyEntry(
            value.sans,
            "sans",
            DEFAULT_CONFIG.fontFamily.sans,
            diagnostics,
        ),
        mono: normalizeFontFamilyEntry(
            value.mono,
            "mono",
            DEFAULT_CONFIG.fontFamily.mono,
            diagnostics,
        ),
    };
}

export function normalizeConfig(raw: unknown): {
    config: DeckConfig;
    diagnostics: Diagnostic[];
} {
    const diagnostics: Diagnostic[] = [];

    if (isPlainObject(raw) && raw.__parseError === true) {
        warn(diagnostics, "Failed to parse YAML frontmatter; using defaults");
        return {
            config: { ...DEFAULT_CONFIG, fontFamily: { ...DEFAULT_CONFIG.fontFamily } },
            diagnostics,
        };
    }

    if (!isPlainObject(raw)) {
        warn(diagnostics, "Frontmatter must be a YAML mapping; using defaults");
        return {
            config: { ...DEFAULT_CONFIG, fontFamily: { ...DEFAULT_CONFIG.fontFamily } },
            diagnostics,
        };
    }

    const config: DeckConfig = {
        theme: normalizeTheme(raw.theme, diagnostics),
        hue: normalizeHue(raw.hue, diagnostics),
        width: normalizePositiveNumber(raw.width, "width", DEFAULT_CONFIG.width, diagnostics),
        height: normalizePositiveNumber(raw.height, "height", DEFAULT_CONFIG.height, diagnostics),
        fontSize: normalizePositiveNumber(
            raw.fontSize,
            "fontSize",
            DEFAULT_CONFIG.fontSize,
            diagnostics,
        ),
        fontFamily: normalizeFontFamily(raw.fontFamily, diagnostics),
        rawHTML: normalizeBoolean(raw.rawHTML, "rawHTML", DEFAULT_CONFIG.rawHTML, diagnostics),
    };

    return { config, diagnostics };
}

export function parseFrontmatter(source: string): FrontmatterResult {
    const { raw, body } = splitFrontmatter(source);
    const { config, diagnostics } = normalizeConfig(raw);
    return { config, body, diagnostics };
}
