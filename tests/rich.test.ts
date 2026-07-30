import { describe, expect, it } from "vitest";
import { parseSlideMarkdown } from "../src/parse/index";
import { renderDeckAsync } from "../src/render/index";

describe("rich content rendering", () => {
    it("renders mermaid code fences as SVG diagrams", async () => {
        const deck = parseSlideMarkdown(`\`\`\`mermaid
graph LR
    A --> B
\`\`\`
`);
        const result = await renderDeckAsync(deck);

        expect(result.html).toContain("presenit-mermaid");
        expect(result.html).toMatch(/<svg[\s>]/);
    });

    it("highlights code fences with Shiki", async () => {
        const deck = parseSlideMarkdown(`\`\`\`javascript
const answer = 42;
\`\`\`
`);
        const result = await renderDeckAsync(deck);

        expect(result.html).toContain('class="shiki');
        expect(result.html).toContain("const");
        expect(result.html).toContain("answer");
    });

    it("renders inline and block math with KaTeX", async () => {
        const deck = parseSlideMarkdown(`Inline $E = mc^2$ math.

$$
\\int_0^1 x^2 \\, dx
$$
`);
        const result = await renderDeckAsync(deck);

        expect(result.hasMath).toBe(true);
        expect(result.html).toContain("katex.min.css");
        expect(result.html).toContain('class="katex"');
        expect(result.html).toContain("katex-display");
        // KaTeX 0.18+ emits katex-sizing; CSS 0.18 only styles that class (not legacy "sizing").
        expect(result.html).toContain("katex-sizing");
        expect(result.css).toContain("katex@0.18");
    });
});
