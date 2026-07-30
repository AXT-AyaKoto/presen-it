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
        expect(dark.css).toContain("letter-spacing: 0.01em");
        expect(dark.css).toMatch(/--presenit-slide-bg:\s*oklch\(0\.2 0\.012 /);
        expect(dark.css).toContain("--presenit-slide-bg-top:");
        expect(dark.css).toContain("linear-gradient(165deg");
        expect(dark.css).toContain(".presenit-column em");
        expect(dark.css).not.toMatch(/\.presenit-column em \{[^}]*text-muted/);
        expect(dark.css).toContain("fonts.googleapis.com/css2?family=M+PLUS+1");
    });

    it("requests Google Fonts for custom fontFamily names", async () => {
        const result = await renderDeckAsync(
            parseSlideMarkdown(`---
fontFamily:
  sans: '"Libertinus Serif", serif'
  mono: Ubuntu Mono, monospace
---

# Title
`),
        );
        expect(result.css).toContain("family=Libertinus+Serif");
        expect(result.css).toContain("family=Ubuntu+Mono");
    });

    it("renders read-only GFM task lists with task-list styles", async () => {
        const result = await renderDeckAsync(
            parseSlideMarkdown(`- [ ] open
- [x] done`),
        );

        expect(result.html).toContain('class="contains-task-list"');
        expect(result.html).toContain('class="task-list-item"');
        expect(result.html).toContain('type="checkbox"');
        expect(result.html).toContain("disabled");
        expect(result.html).toContain("checked");
        expect(result.css).toContain("ul.contains-task-list");
        expect(result.css).toContain("li.task-list-item::before");
        expect(result.css).toContain('li.task-list-item > input[type="checkbox"]');
        expect(result.css).toContain("appearance: none");
        expect(result.css).toContain("clip: rect(0 0 0 0)");
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

    it("renders GitHub alert blockquotes as labelled asides", async () => {
        const result = await renderDeckAsync(
            parseSlideMarkdown(`> [!NOTE]
> Useful context.

> [!tip]
> A helpful suggestion.

> [!IMPORTANT]
> Critical detail.

> [!WARNING]
> Take care.

> [!CAUTION]
> Irreversible action.`),
        );

        for (const [kind, label] of [
            ["note", "Note"],
            ["tip", "Tip"],
            ["important", "Important"],
            ["warning", "Warning"],
            ["caution", "Caution"],
        ]) {
            expect(result.html).toContain(`class="presenit-alert presenit-alert--${kind}"`);
            expect(result.html).toContain(`data-alert="${kind.toUpperCase()}"`);
            expect(result.html).toContain(`<p class="presenit-alert__label">${label}</p>`);
        }

        expect(result.html).toContain("Useful context.");
        expect(result.html).not.toContain("[!NOTE]");
        expect(result.css).toContain(".presenit-column .presenit-alert");
        expect(result.css).toContain("--presenit-alert-icon");
        expect(result.css).toContain(".presenit-alert__label::before");
    });

    it("keeps non-alert blockquotes unchanged", async () => {
        const result = await renderDeckAsync(parseSlideMarkdown(`> A normal quote.`));
        const slide = result.slides[0]!.html;

        expect(slide).toContain("<blockquote>");
        expect(slide).toContain("A normal quote.");
        expect(slide).not.toContain("presenit-alert");
    });

    it("renders soft breaks as <br> when break: soft", async () => {
        const result = await renderDeckAsync(
            parseSlideMarkdown(`---
break: soft
---

line one
line two
`),
        );
        expect(result.slides[0]!.html).toContain("line one<br>");
        expect(result.slides[0]!.html).toContain("line two");
    });

    it("does not render soft breaks when break: hard", async () => {
        const result = await renderDeckAsync(
            parseSlideMarkdown(`---
break: hard
---

line one
line two
`),
        );
        const slide = result.slides[0]!.html;
        expect(slide).toContain("line one\nline two");
        expect(slide).not.toContain("<br>");
    });
});
