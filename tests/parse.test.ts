import { describe, expect, it } from "vitest";
import { parseDirectiveComment } from "../src/parse/directive";
import { parseFrontmatter } from "../src/parse/frontmatter";
import { parseSlideMarkdown } from "../src/parse/index";
import type { Diagnostic } from "../src/types";
import { DEFAULT_CONFIG } from "../src/types";

function messages(diagnostics: Diagnostic[]): string[] {
    return diagnostics.map((d) => d.message);
}

describe("parseFrontmatter", () => {
    it("uses defaults when frontmatter is absent", () => {
        const result = parseFrontmatter("# Hello\n");
        expect(result.config).toEqual(DEFAULT_CONFIG);
        expect(result.body).toBe("# Hello\n");
        expect(result.diagnostics).toEqual([]);
    });

    it("parses valid frontmatter", () => {
        const result = parseFrontmatter(`---
theme: dark
hue: 400
width: 1280
height: 720
fontSize: 24
rawHTML: true
fontFamily:
  sans: '"Inter", sans-serif'
  mono: '"JetBrains Mono", monospace'
---

# Title
`);
        expect(result.config.theme).toBe("dark");
        expect(result.config.hue).toBe(40); // 400 % 360
        expect(result.config.width).toBe(1280);
        expect(result.config.height).toBe(720);
        expect(result.config.fontSize).toBe(24);
        expect(result.config.rawHTML).toBe(true);
        expect(result.config.fontFamily.sans).toBe('"Inter", sans-serif');
        expect(result.body.trimStart().startsWith("# Title")).toBe(true);
        expect(result.diagnostics).toEqual([]);
    });

    it("falls back and warns on type errors; ignores unknown keys", () => {
        const result = parseFrontmatter(`---
theme: neon
hue: "blue"
width: -1
extra: ignored
---

body
`);
        expect(result.config.theme).toBe("light");
        expect(result.config.hue).toBe(DEFAULT_CONFIG.hue);
        expect(result.config.width).toBe(DEFAULT_CONFIG.width);
        expect(messages(result.diagnostics).length).toBeGreaterThanOrEqual(3);
    });
});

describe("parseDirectiveComment", () => {
    it("parses slide-break with options", () => {
        const diagnostics: Diagnostic[] = [];
        const result = parseDirectiveComment(
            "<!-- presen-it! slide-break (center-x=true&center-y=false) -->",
            diagnostics,
        );
        expect(result).toEqual({
            command: "slide-break",
            options: { centerX: true, centerY: false },
        });
        expect(diagnostics).toEqual([]);
    });

    it("ignores unknown commands and spaced options", () => {
        const diagnostics: Diagnostic[] = [];
        expect(parseDirectiveComment("<!-- presen-it! zoom -->", diagnostics)).toBeNull();
        expect(
            parseDirectiveComment("<!-- presen-it! slide-break (center-x = true) -->", diagnostics),
        ).toBeNull();
        expect(diagnostics.length).toBe(2);
    });

    it("returns null for ordinary comments", () => {
        const diagnostics: Diagnostic[] = [];
        expect(parseDirectiveComment("<!-- just a note -->", diagnostics)).toBeNull();
        expect(diagnostics).toEqual([]);
    });
});

describe("parseSlideMarkdown", () => {
    it("parses the concept-doc sample structure", () => {
        const source = `---
theme: dark
width: 1920
height: 1080
---

# 等幅フォントを指定した要素にletter-spacingを使うな

2026-07-29 ― Ayasaka-Koto (@AXT_AyaKoto)

<!-- presen-it! slide-break -->

## 経緯

- 等幅フォントが指定されているのに文字の縦方向の位置が揃ってないサイト、あるよね

<!-- presen-it! slide-break (center-x=true) -->

## 原因

\`\`\`css
.selector {
    letter-spacing: 0.05em
}
\`\`\`

<!-- presen-it! slide-break -->

## 何が起こった？

- \`letter-spacing\`は文字間に空白を入れる

<!-- presen-it! column-break -->

![](hogehoge.png)

<!-- this is a speaker note -->

<!-- presen-it! slide-break -->

## 結論

等幅フォントを指定した要素にletter-spacingを使うな ズレるから
`;

        const deck = parseSlideMarkdown(source);
        expect(deck.config.theme).toBe("dark");
        expect(deck.slides).toHaveLength(5);

        // Title slide: h1 in column, no header
        expect(deck.slides[0]!.header).toBeNull();
        expect(deck.slides[0]!.columns[0]!.children[0]!.type).toBe("heading");

        // Second slide: header "経緯"
        expect(deck.slides[1]!.header?.depth).toBe(2);
        expect(deck.slides[1]!.align.centerX).toBe(false);
        expect(deck.slides[1]!.align.centerY).toBe(true);

        // Third: center-x=true
        expect(deck.slides[2]!.align.centerX).toBe(true);
        expect(deck.slides[2]!.header).not.toBeNull();

        // Fourth: two columns + notes
        expect(deck.slides[3]!.columns).toHaveLength(2);
        expect(deck.slides[3]!.notes).toBe("this is a speaker note");
        expect(deck.slides[3]!.columns[1]!.children[0]!.type).toBe("paragraph");

        // Fifth: conclusion
        expect(deck.slides[4]!.header).not.toBeNull();
        expect(deck.diagnostics).toEqual([]);
    });

    it("supports empty slides and column-break before header", () => {
        const deck = parseSlideMarkdown(`# A

<!-- presen-it! slide-break -->

<!-- presen-it! slide-break -->

<!-- presen-it! column-break -->

## Not a header

text
`);
        expect(deck.slides).toHaveLength(3);
        expect(deck.slides[1]!.header).toBeNull();
        expect(deck.slides[1]!.columns[0]!.children).toEqual([]);
        // column-break first → leading empty column is dropped; h2 stays in body (not header)
        expect(deck.slides[2]!.header).toBeNull();
        expect(deck.slides[2]!.columns).toHaveLength(1);
        expect(deck.slides[2]!.columns[0]!.children[0]!.type).toBe("heading");
    });

    it("warns on 4+ columns", () => {
        const deck = parseSlideMarkdown(`a

<!-- presen-it! column-break -->

b

<!-- presen-it! column-break -->

c

<!-- presen-it! column-break -->

d
`);
        expect(deck.slides[0]!.columns).toHaveLength(4);
        expect(messages(deck.diagnostics).some((m) => m.includes("4 columns"))).toBe(true);
    });

    it("lets column options override slide options", () => {
        const deck = parseSlideMarkdown(`<!-- presen-it! slide-break (center-x=true) -->

left? no, centered by slide

<!-- presen-it! column-break (center-x=false) -->

override left
`);
        // First slide-break starts slide 2 (slide 1 is empty before it)
        // Actually: content before first slide-break is slide 0.
        // Here the first node is slide-break, so slide 0 is empty, slide 1 has the content.
        expect(deck.slides.length).toBeGreaterThanOrEqual(2);
        const slide = deck.slides[1]!;
        expect(slide.align.centerX).toBe(true);
        expect(slide.columns[0]!.align.centerX).toBe(true);
        expect(slide.columns[1]!.align.centerX).toBe(false);
    });
});
