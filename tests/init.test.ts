import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runInit } from "../src/commands/init";
import { resolveSlidePath } from "../src/project/load";

describe("presenit init", () => {
    const tempDirs: string[] = [];

    afterEach(async () => {
        for (const dir of tempDirs) {
            await rm(dir, { recursive: true, force: true });
        }
        tempDirs.length = 0;
    });

    async function makeTempCwd(): Promise<string> {
        const dir = await mkdtemp(path.join(os.tmpdir(), "presenit-init-"));
        tempDirs.push(dir);
        return dir;
    }

    it("creates src/<slug>/slide.md from the starter template", async () => {
        const cwd = await makeTempCwd();
        const slug = "my-talk";

        await runInit(slug, { cwd });

        const { slidePath } = resolveSlidePath(cwd, slug);
        const content = await readFile(slidePath, "utf8");

        expect(content).toContain("# はじめに");
        expect(content).toContain("<!-- presen-it! slide-break");
        expect(content).toContain("pnpm exec presenit dev my-talk");
        expect(content).toContain("```mermaid");
        expect(content).toContain("[!NOTE]");
    });

    it("refuses to overwrite an existing slide.md", async () => {
        const cwd = await makeTempCwd();
        const slug = "existing";

        await runInit(slug, { cwd });

        await expect(runInit(slug, { cwd })).rejects.toThrow(/Refusing to overwrite/);
    });

    it("overwrites when --force is set", async () => {
        const cwd = await makeTempCwd();
        const slug = "forced";

        await runInit(slug, { cwd });
        const { slidePath } = resolveSlidePath(cwd, slug);
        await writeFile(slidePath, "# overwritten", "utf8");

        await runInit(slug, { cwd, force: true });

        const content = await readFile(slidePath, "utf8");
        expect(content).toContain("# はじめに");
        expect(content).not.toContain("# overwritten");
    });
});
