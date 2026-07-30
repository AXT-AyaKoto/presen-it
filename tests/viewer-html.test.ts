import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "../src/types";
import { effectivePageTitle, transformViewerIndexHtml } from "../src/vite/viewer-html";

const INDEX_HTML = readFileSync(new URL("../src/viewer/index.html", import.meta.url), "utf8");

describe("effectivePageTitle", () => {
    it("falls back to slug when title is empty", () => {
        expect(effectivePageTitle(DEFAULT_CONFIG, "demo")).toBe("AyaExpTech Presen'it! — demo");
    });

    it("uses trimmed frontmatter title when set", () => {
        expect(
            effectivePageTitle(
                { ...DEFAULT_CONFIG, title: "  My Talk  ", description: "" },
                "demo",
            ),
        ).toBe("My Talk");
    });
});

describe("transformViewerIndexHtml", () => {
    it("injects slug-based title and og tags without description", () => {
        const out = transformViewerIndexHtml(INDEX_HTML, "demo", DEFAULT_CONFIG);
        expect(out).toContain("<title>AyaExpTech Presen'it! — demo</title>");
        expect(out).toContain('<meta property="og:title" content="AyaExpTech Presen\'it! — demo">');
        expect(out).toContain('<meta property="og:type" content="website">');
        expect(out).not.toContain("og:description");
        expect(out).not.toContain('name="description"');
    });

    it("injects configured title and description metas", () => {
        const out = transformViewerIndexHtml(INDEX_HTML, "demo", {
            ...DEFAULT_CONFIG,
            title: "My Talk",
            description: "A short blurb",
        });
        expect(out).toContain("<title>My Talk</title>");
        expect(out).toContain('<meta property="og:title" content="My Talk">');
        expect(out).toContain('<meta name="description" content="A short blurb">');
        expect(out).toContain('<meta property="og:description" content="A short blurb">');
    });

    it("escapes HTML in title and description", () => {
        const out = transformViewerIndexHtml(INDEX_HTML, "demo", {
            ...DEFAULT_CONFIG,
            title: '<Talk> & "Quotes"',
            description: "Line <break>",
        });
        expect(out).toContain("<title>&lt;Talk&gt; &amp; &quot;Quotes&quot;</title>");
        expect(out).toContain(
            '<meta property="og:title" content="&lt;Talk&gt; &amp; &quot;Quotes&quot;">',
        );
        expect(out).toContain('<meta name="description" content="Line &lt;break&gt;">');
    });
});
