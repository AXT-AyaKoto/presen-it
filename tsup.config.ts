import { defineConfig } from "tsup";
import fs from "node:fs";
import path from "node:path";

function cleanPackageArtifacts(): void {
    const dist = path.resolve("dist");
    if (!fs.existsSync(dist)) {
        return;
    }
    for (const name of fs.readdirSync(dist)) {
        if (
            name === "cli.js" ||
            name === "cli.js.map" ||
            name === "cli.d.ts" ||
            name === "index.js" ||
            name === "index.js.map" ||
            name === "index.d.ts" ||
            name === "index.d.ts.map"
        ) {
            fs.rmSync(path.join(dist, name), { force: true });
        }
    }
}

cleanPackageArtifacts();

export default defineConfig([
    {
        entry: { cli: "src/cli.ts" },
        format: ["esm"],
        target: "node22",
        dts: false,
        clean: false,
        sourcemap: true,
        splitting: false,
        banner: {
            js: "#!/usr/bin/env node",
        },
        external: ["vite", "preact", "@preact/signals", "@preact/preset-vite", "puppeteer"],
    },
    {
        entry: { index: "src/index.ts" },
        format: ["esm"],
        target: "node22",
        dts: true,
        clean: false,
        sourcemap: true,
        splitting: false,
        external: ["vite", "preact", "@preact/signals", "@preact/preset-vite", "puppeteer"],
    },
]);
