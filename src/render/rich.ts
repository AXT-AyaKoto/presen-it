import { renderMermaidSVG } from "beautiful-mermaid";
import type { Code, Html, RootContent } from "mdast";
import { unified } from "unified";
import rehypeKatex from "rehype-katex";
import type { Root as HastRoot } from "hast";
import type { ThemeName } from "../types";
import { highlightCode } from "./highlighter";

export type EnrichResult = {
    nodes: RootContent[];
    hasEnrichedHtml: boolean;
    hasMath: boolean;
};

function containsMath(nodes: RootContent[]): boolean {
    for (const node of nodes) {
        if (node.type === "math" || node.type === "inlineMath") {
            return true;
        }
        if ("children" in node && Array.isArray(node.children)) {
            if (containsMath(node.children as RootContent[])) {
                return true;
            }
        }
    }
    return false;
}

async function enrichCodeBlock(node: Code, theme: ThemeName): Promise<Html> {
    const lang = node.lang?.toLowerCase();

    if (lang === "mermaid") {
        try {
            const svg = renderMermaidSVG(node.value.trim(), {
                bg: "var(--presenit-slide-bg)",
                fg: "var(--presenit-text)",
                transparent: true,
            });
            return {
                type: "html",
                value: `<div class="presenit-mermaid">${svg}</div>`,
            };
        } catch {
            const highlighted = await highlightCode(node.value, "text", theme);
            return { type: "html", value: highlighted };
        }
    }

    const highlighted = await highlightCode(node.value, lang, theme);
    return { type: "html", value: highlighted };
}

async function enrichNodes(nodes: RootContent[], theme: ThemeName): Promise<RootContent[]> {
    const result: RootContent[] = [];

    for (const node of nodes) {
        if (node.type === "code") {
            result.push(await enrichCodeBlock(node, theme));
            continue;
        }

        if ("children" in node && Array.isArray(node.children)) {
            result.push({
                ...node,
                children: await enrichNodes(node.children as RootContent[], theme),
            } as RootContent);
            continue;
        }

        result.push(node);
    }

    return result;
}

export async function enrichRichContent(
    nodes: RootContent[],
    theme: ThemeName,
): Promise<EnrichResult> {
    const enriched = await enrichNodes(nodes, theme);
    return {
        nodes: enriched,
        hasEnrichedHtml: enriched.some((node) => node.type === "html"),
        hasMath: containsMath(enriched),
    };
}

export function applyKatex(hast: HastRoot): HastRoot {
    return unified().use(rehypeKatex).runSync(hast) as HastRoot;
}

export const KATEX_CSS_URL = "https://cdn.jsdelivr.net/npm/katex@0.18.1/dist/katex.min.css";
