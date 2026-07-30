export type ThemeName = "light" | "dark";

export type FontFamilyConfig = {
    sans: string;
    mono: string;
};

export type PageTransitionType = "none" | "fade" | "scroll";

export type PageTransitionConfig = {
    type: PageTransitionType;
    /** Duration in seconds. */
    duration: number;
};

export type BreakMode = "soft" | "hard";

export type DeckConfig = {
    theme: ThemeName;
    hue: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: FontFamilyConfig;
    pageTransition: PageTransitionConfig;
    rawHTML: boolean;
    /** `soft`: single newlines become `<br>`; `hard`: CommonMark default. */
    break: BreakMode;
};

export type AlignOptions = {
    centerX: boolean;
    centerY: boolean;
};

export type Column = {
    /** Effective alignment after merging slide + column overrides. */
    align: AlignOptions;
    /** Raw mdast block nodes belonging to this column. */
    children: import("mdast").RootContent[];
};

export type Slide = {
    align: AlignOptions;
    /** Leading h2 used as the page header, if present. */
    header: import("mdast").Heading | null;
    columns: Column[];
    /** Speaker notes text (trimmed), if any. */
    notes: string | null;
};

export type DiagnosticSeverity = "warning" | "error";

export type Diagnostic = {
    severity: DiagnosticSeverity;
    message: string;
    line?: number;
};

export type Deck = {
    config: DeckConfig;
    slides: Slide[];
    diagnostics: Diagnostic[];
};

export const DEFAULT_CONFIG: DeckConfig = {
    theme: "light",
    hue: 210,
    width: 1920,
    height: 1080,
    fontSize: 32,
    fontFamily: {
        sans: '"M PLUS 1", system-ui, sans-serif',
        mono: '"M PLUS 1 Code", ui-monospace, monospace',
    },
    pageTransition: {
        type: "fade",
        duration: 0.2,
    },
    rawHTML: false,
    break: "soft",
};

export const DEFAULT_SLIDE_ALIGN: AlignOptions = {
    centerX: false,
    centerY: true,
};
