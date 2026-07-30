import type { Blockquote, Paragraph, PhrasingContent, RootContent, Text } from "mdast";

const ALERTS = {
    NOTE: "Note",
    TIP: "Tip",
    IMPORTANT: "Important",
    WARNING: "Warning",
    CAUTION: "Caution",
} as const;

type AlertKind = keyof typeof ALERTS;

const ALERT_MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:[ \t]*\n|[ \t]+|$)/i;

function alertMarker(paragraph: Paragraph): { kind: AlertKind; length: number } | null {
    const first = paragraph.children[0];
    if (!first || first.type !== "text") {
        return null;
    }

    const match = ALERT_MARKER.exec(first.value);
    if (!match) {
        return null;
    }

    return {
        kind: match[1]!.toUpperCase() as AlertKind,
        length: match[0].length,
    };
}

function createAlertLabel(kind: AlertKind): Paragraph {
    return {
        type: "paragraph",
        data: {
            hProperties: { className: ["presenit-alert__label"] },
        },
        children: [{ type: "text", value: ALERTS[kind] }],
    };
}

/**
 * Soft breaks turn the newline after `[!NOTE]` into a leading `break` node.
 * Drop those (and empty text) so the body doesn't start with a blank line.
 */
function trimLeadingBreaks(children: PhrasingContent[]): PhrasingContent[] {
    let index = 0;
    while (index < children.length) {
        const child = children[index]!;
        if (child.type === "break") {
            index += 1;
            continue;
        }
        if (child.type === "text" && child.value.trim() === "") {
            index += 1;
            continue;
        }
        break;
    }
    return children.slice(index);
}

/**
 * Converts GitHub alert blockquotes into semantic `aside` elements for the
 * mdast → hast renderer. Regular blockquotes are left untouched.
 */
export function transformAlertBlockquotes(nodes: RootContent[]): RootContent[] {
    return nodes.map((node) => {
        if (node.type !== "blockquote") {
            return node;
        }

        const first = node.children[0];
        if (!first || first.type !== "paragraph") {
            return node;
        }

        const marker = alertMarker(first);
        if (!marker) {
            return node;
        }

        const firstText = first.children[0] as Text;
        const remainder =
            firstText.value.slice(marker.length).length > 0
                ? ([
                      { ...firstText, value: firstText.value.slice(marker.length) },
                      ...first.children.slice(1),
                  ] as PhrasingContent[])
                : (first.children.slice(1) as PhrasingContent[]);
        const bodyFirstParagraph: Paragraph = {
            ...first,
            children: trimLeadingBreaks(remainder),
        };
        const body =
            bodyFirstParagraph.children.length > 0
                ? [bodyFirstParagraph, ...node.children.slice(1)]
                : node.children.slice(1);

        const alert: Blockquote = {
            ...node,
            data: {
                ...node.data,
                hName: "aside",
                hProperties: {
                    className: ["presenit-alert", `presenit-alert--${marker.kind.toLowerCase()}`],
                    dataAlert: marker.kind,
                },
            },
            children: [createAlertLabel(marker.kind), ...body],
        };

        return alert;
    });
}
