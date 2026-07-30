import { describe, expect, it } from "vitest";
import { rewriteAssetUrls } from "../src/project/load";

describe("rewriteAssetUrls", () => {
    it("rewrites relative image urls to the asset middleware path", () => {
        const input = `<img src="./assets/pic.png"><img src="hogehoge.png"><a href="https://example.com">x</a>`;
        const out = rewriteAssetUrls(input);
        expect(out).toContain('src="/__presenit_assets__/assets/pic.png"');
        expect(out).toContain('src="/__presenit_assets__/hogehoge.png"');
        expect(out).toContain('href="https://example.com"');
    });
});

describe("rewriteAssetUrlsForBuild (inline)", () => {
    it("keeps slide-dir relative structure", () => {
        const rewrite = (html: string) =>
            html.replace(
                /\b(src|href)=["']\/__presenit_assets__\/([^"']+)["']/g,
                (_match, attr: string, url: string) => `${attr}="./${url}"`,
            );
        expect(rewrite('src="/__presenit_assets__/assets/pic.png"')).toBe('src="./assets/pic.png"');
        expect(rewrite('src="/__presenit_assets__/hogehoge.png"')).toBe('src="./hogehoge.png"');
    });
});
