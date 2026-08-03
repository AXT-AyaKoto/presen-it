import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { inlineLocalAssets } from "../src/project/assets";
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

describe("inlineLocalAssets", () => {
    it("inlines local assets as data URIs and leaves remote URLs alone", async () => {
        const slideDir = await mkdtemp(path.join(os.tmpdir(), "presenit-assets-"));
        await mkdir(path.join(slideDir, "assets"));
        const pngBytes = Buffer.from([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48,
            0x44, 0x52,
        ]);
        const webpBytes = Buffer.from("RIFF....WEBP", "utf8");
        await writeFile(path.join(slideDir, "assets", "pic.png"), pngBytes);
        await writeFile(path.join(slideDir, "assets", "pic.webp"), webpBytes);

        const input = [
            '<img src="/__presenit_assets__/assets/pic.png">',
            '<img src="/__presenit_assets__/assets/pic.webp">',
            '<img src="/__presenit_assets__/assets/pic.png">',
            '<img src="https://example.com/remote.png">',
        ].join("");

        const out = await inlineLocalAssets(input, slideDir);
        expect(out).toContain(`src="data:image/png;base64,${pngBytes.toString("base64")}"`);
        expect(out).toContain(`src="data:image/webp;base64,${webpBytes.toString("base64")}"`);
        expect(out).toContain('src="https://example.com/remote.png"');
        expect(out).not.toContain("/__presenit_assets__/");
    });

    it("keeps missing asset paths and skips path traversal", async () => {
        const slideDir = await mkdtemp(path.join(os.tmpdir(), "presenit-assets-"));
        const input = [
            '<img src="/__presenit_assets__/missing.webp">',
            '<img src="/__presenit_assets__/../outside.png">',
        ].join("");

        const out = await inlineLocalAssets(input, slideDir);
        expect(out).toContain('src="/__presenit_assets__/missing.webp"');
        expect(out).toContain('src="/__presenit_assets__/../outside.png"');
        expect(out).not.toContain("data:");
    });
});
