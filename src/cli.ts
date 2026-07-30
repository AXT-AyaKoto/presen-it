import { defineCommand, runMain } from "citty";
import { consola } from "consola";

const stub = (command: string) => {
    consola.info(`\`${command}\` is not implemented yet.`);
    consola.info("See https://github.com/AXT-AyaKoto/experiment-md-slide-vibed for progress.");
};

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
            run({ args }) {
                stub(`presenit dev ${args.slug}`);
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
            run({ args }) {
                stub(`presenit build ${args.slug}`);
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
            run({ args }) {
                stub(`presenit export ${args.slug}`);
            },
        }),
    },
});

runMain(main);
