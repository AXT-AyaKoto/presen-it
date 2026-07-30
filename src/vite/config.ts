import path from "node:path";
import preact from "@preact/preset-vite";
import type { InlineConfig } from "vite";
import { getPackageRoot } from "../paths";
import { presenitPlugin } from "./plugin";

export function createViteConfig(options: {
    cwd: string;
    slug: string;
    outDir?: string;
    command: "serve" | "build";
}): InlineConfig {
    const packageRoot = getPackageRoot();
    const viewerRoot = path.join(packageRoot, "src/viewer");
    const outDir = options.outDir ?? path.resolve(options.cwd, "dist", options.slug);

    return {
        root: viewerRoot,
        base: "./",
        configFile: false,
        clearScreen: false,
        plugins: [preact(), presenitPlugin({ cwd: options.cwd, slug: options.slug })],
        server: {
            port: 3030,
            strictPort: false,
            open: false,
            fs: {
                allow: [packageRoot, options.cwd],
            },
        },
        build: {
            outDir,
            emptyOutDir: true,
            sourcemap: true,
            assetsDir: "_viewer",
            rollupOptions: {
                input: path.join(viewerRoot, "index.html"),
            },
        },
        optimizeDeps: {
            include: ["preact", "@preact/signals", "preact/hooks"],
        },
    };
}

export { getPackageRoot };
