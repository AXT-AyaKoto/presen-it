import { describe, expect, it } from "vitest";
import { parseSlideMarkdown } from "../src/parse/index";
import { renderDeck } from "../src/render/index";

describe("renderDeck", () => {
    it("renders slides with theme css and slide numbers", () => {
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

        const result = renderDeck(deck);
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

    it("applies center alignment classes", () => {
        const deck =
            parseSlideMarkdown(`<!-- presen-it! slide-break (center-x=true&center-y=false) -->

## Centered

hello
`);
        const result = renderDeck(deck);
        const slide = result.slides[1]!.html;
        expect(slide).toContain("presenit-column--center-x");
        expect(slide).not.toContain("presenit-column--center-y");
    });

    it("escapes HTML by default and allows rawHTML when enabled", () => {
        const escaped = renderDeck(parseSlideMarkdown(`<div class="x">hi</div>`));
        // hast-util-to-html may emit &#x3C; or &lt;
        expect(escaped.html).toMatch(/&lt;div|&#x3C;div/);
        expect(escaped.html).not.toContain('<div class="x">');

        const raw = renderDeck(
            parseSlideMarkdown(`---
rawHTML: true
---

<div class="x">hi</div>
`),
        );
        expect(raw.html).toContain('<div class="x">hi</div>');
    });
});
