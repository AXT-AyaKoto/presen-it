import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolve the installed/source package root for Presen'it!
 * (works for both `tsx src/...` and bundled `dist/cli.js`).
 */
export function getPackageRoot(importMetaUrl = import.meta.url): string {
    let dir = path.dirname(fileURLToPath(importMetaUrl));

    while (true) {
        const pkgPath = path.join(dir, "package.json");
        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { name?: string };
                if (pkg.name === "@axt_ayakoto/presenit") {
                    return dir;
                }
            } catch {
                // continue walking
            }
        }

        const parent = path.dirname(dir);
        if (parent === dir) {
            break;
        }
        dir = parent;
    }

    throw new Error("Unable to locate @axt_ayakoto/presenit package root");
}
