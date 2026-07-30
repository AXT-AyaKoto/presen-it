import { defineCommand, runMain } from "citty";
import { consola } from "consola";
import { runBuild, runDev } from "./commands/dev";

const main = defineCommand({
    meta: {
        name: "presenit",
        version: "0.0.0",
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
                consola.info(`\`presenit export ${args.slug}\` is not implemented yet.`);
            },
        }),
    },
});

runMain(main);
