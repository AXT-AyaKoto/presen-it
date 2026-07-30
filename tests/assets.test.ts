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
