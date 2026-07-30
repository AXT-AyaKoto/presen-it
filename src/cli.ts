import { defineCommand, runMain } from "citty";
import { runBuild, runDev } from "./commands/dev";
import { runExport } from "./commands/export";
import { runInit } from "./commands/init";
import { version } from "./pkg";

const main = defineCommand({
    meta: {
        name: "presenit",
        version,
        description: "Turn readable Markdown into beautiful presentation slides and PDFs.",
    },
    subCommands: {
        dev: defineCommand({
            meta: {
                name: "dev",
                description: "Start the interactive presentation viewer with live reload",
            },
            args: {
                slug: {
                    type: "positional",
                    description: "Slide slug under src/",
                    required: true,
                },
            },
            async run({ args }) {
                await runDev(args.slug);
            },
        }),
        build: defineCommand({
            meta: {
                name: "build",
                description: "Build the interactive presentation HTML",
            },
            args: {
                slug: {
                    type: "positional",
                    description: "Slide slug under src/",
                    required: true,
                },
            },
            async run({ args }) {
                await runBuild(args.slug);
            },
        }),
        init: defineCommand({
            meta: {
                name: "init",
                description: "Scaffold a starter slide deck with usage hints",
            },
            args: {
                slug: {
                    type: "positional",
                    description: "Slide slug under src/",
                    required: true,
                },
                force: {
                    type: "boolean",
                    description: "Overwrite an existing slide.md",
                    default: false,
                    alias: "f",
                },
            },
            async run({ args }) {
                await runInit(args.slug, { force: args.force });
            },
        }),
        export: defineCommand({
            meta: {
                name: "export",
                description: "Export the presentation as a PDF",
            },
            args: {
                slug: {
                    type: "positional",
                    description: "Slide slug under src/",
                    required: true,
                },
            },
            async run({ args }) {
                await runExport(args.slug);
            },
        }),
    },
});

runMain(main);
