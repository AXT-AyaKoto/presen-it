import { describe, expect, it } from "vitest";
import { parseSlideMarkdown } from "../src/parse/index";
import { renderDeckAsync } from "../src/render/index";

describe("renderDeck", () => {
    it("renders slides with theme css and slide numbers", async () => {
        const deck = parseSlideMarkdown(`---
theme: dark
hue: 200
---

# Title

<!-- presen-it! slide-break -->

## Section

- one
- two

<!-- presen-it! column-break -->

![alt](./pic.png)
`);

        const result = await renderDeckAsync(deck);
        expect(result.css).toContain("--presenit-accent");
        expect(result.css).toContain("M+PLUS+1");
        expect(result.html).toContain('data-theme="dark"');
        expect(result.html).toContain("1 / 2");
        expect(result.html).toContain("2 / 2");
        expect(result.html).toContain("presenit-slide-header");
        expect(result.html).toContain("presenit-column");
        expect(result.html).toContain('src="./pic.png"');
        expect(result.slides).toHaveLength(2);
    });

    it("applies center alignment classes", async () => {
        const deck =
            parseSlideMarkdown(`<!-- presen-it! slide-break (center-x=true&center-y=false) -->

## Centered

hello
`);
        const result = await renderDeckAsync(deck);
        const slide = result.slides[0]!.html;
        expect(slide).toContain("presenit-column--center-x");
        expect(slide).not.toContain("presenit-column--center-y");
    });

    it("uses positive letter-spacing on h1 and a low-chroma dark palette", async () => {
        const dark = await renderDeckAsync(
            parseSlideMarkdown(`---
theme: dark
---

# Title
`),
        );
        expect(dark.css).toContain("letter-spacing: 0.03em");
        expect(dark.css).toMatch(/--presenit-slide-bg:\s*oklch\(0\.2 0\.01 /);
    });

    it("escapes HTML by default and allows rawHTML when enabled", async () => {
        const escaped = await renderDeckAsync(parseSlideMarkdown(`<div class="x">hi</div>`));
        expect(escaped.html).toMatch(/&lt;div|&#x3C;div/);
        expect(escaped.html).not.toContain('<div class="x">');

        const raw = await renderDeckAsync(
            parseSlideMarkdown(`---
rawHTML: true
---

<div class="x">hi</div>
`),
        );
        expect(raw.html).toContain('<div class="x">hi</div>');
    });
});
