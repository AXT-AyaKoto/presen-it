import type { DeckConfig } from "../types";

function escapeHtml(text: string): string {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

export function effectivePageTitle(config: DeckConfig, slug: string): string {
    const trimmed = config.title.trim();
    return trimmed || `Presen'it! — ${slug}`;
}

export function transformViewerIndexHtml(html: string, slug: string, config: DeckConfig): string {
    const pageTitle = effectivePageTitle(config, slug);
    const escapedTitle = escapeHtml(pageTitle);

    const metas = [
        `<meta property="og:title" content="${escapedTitle}">`,
        `<meta property="og:type" content="website">`,
    ];

    const description = config.description.trim();
    if (description) {
        const escapedDescription = escapeHtml(description);
        metas.push(`<meta name="description" content="${escapedDescription}">`);
        metas.push(`<meta property="og:description" content="${escapedDescription}">`);
    }

    const titleBlock = `<title>${escapedTitle}</title>\n        ${metas.join("\n        ")}`;

    return html.replace(/<title>.*?<\/title>/, titleBlock);
}
