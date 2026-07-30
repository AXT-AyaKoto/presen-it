import path from "node:path";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { consola } from "consola";
import { resolveSlidePath } from "../project/load";

const SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

function assertValidSlug(slug: string): void {
    if (!slug) {
        throw new Error("Slug is required. Usage: presenit init <slug>");
    }
    if (!SLUG_PATTERN.test(slug)) {
        throw new Error(
            `Invalid slug "${slug}". Use letters, numbers, dots, underscores, and hyphens (must start with alphanumeric).`,
        );
    }
}

async function resolveStarterTemplatePath(): Promise<string> {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
        path.join(here, "../templates/starter-slide.md"),
        path.join(here, "../src/templates/starter-slide.md"),
    ];
    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch {
            // try next candidate
        }
    }
    throw new Error("Starter slide template not found in the package.");
}

async function readStarterTemplate(): Promise<string> {
    const templatePath = await resolveStarterTemplatePath();
    return await readFile(templatePath, "utf8");
}

export async function runInit(
    slug: string,
    options: { force?: boolean; cwd?: string } = {},
): Promise<void> {
    const cwd = options.cwd ?? process.cwd();
    assertValidSlug(slug);

    const { slidePath, slideDir } = resolveSlidePath(cwd, slug);
    const exists = await fileExists(slidePath);

    if (exists && !options.force) {
        throw new Error(
            [
                `Slide already exists: ${slidePath}`,
                `Refusing to overwrite. Use --force to replace it.`,
            ].join("\n"),
        );
    }

    const template = await readStarterTemplate();
    const content = template.replaceAll("<slug>", slug);
    await mkdir(slideDir, { recursive: true });
    await writeFile(slidePath, content, "utf8");

    const relSlide = path.relative(cwd, slidePath);
    consola.success(`Created ${relSlide}`);
    consola.info("");
    consola.info("Next steps:");
    consola.info(`  pnpm exec presenit dev ${slug}`);
    consola.info(`  pnpm exec presenit build ${slug}   # → dist/${slug}/view.html`);
    consola.info(`  pnpm exec presenit export ${slug}  # → dist/${slug}/resume.pdf`);
    consola.info("");
    consola.info(`Edit ${relSlide} to customize your deck.`);
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}
