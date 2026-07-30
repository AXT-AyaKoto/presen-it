import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { PageTransitionType } from "../types";
import type { SlideFrameLaser } from "./SlideFrame";
import { SlideFrame } from "./SlideFrame";

type Props = {
    html: string;
    width: number;
    height: number;
    index: number;
    transitionType: PageTransitionType;
    /** Seconds */
    duration: number;
    laser?: SlideFrameLaser;
};

type ActiveTransition = {
    fromHtml: string;
    toHtml: string;
    direction: 1 | -1;
    type: "fade" | "scroll";
};

/**
 * Projection slide stage with optional fade/scroll page transitions.
 */
export function ProjectionStage({
    html,
    width,
    height,
    index,
    transitionType,
    duration,
    laser,
}: Props): JSX.Element {
    const previousIndexRef = useRef(index);
    const previousHtmlRef = useRef(html);
    const [stableHtml, setStableHtml] = useState(html);
    const [active, setActive] = useState<ActiveTransition | null>(null);

    useEffect(() => {
        if (index === previousIndexRef.current) {
            previousHtmlRef.current = html;
            setStableHtml(html);
            return;
        }

        const direction: 1 | -1 = index > previousIndexRef.current ? 1 : -1;
        const fromHtml = previousHtmlRef.current;
        previousIndexRef.current = index;
        previousHtmlRef.current = html;

        if (transitionType === "none" || duration <= 0) {
            setActive(null);
            setStableHtml(html);
            return;
        }

        setActive({
            fromHtml,
            toHtml: html,
            direction,
            type: transitionType,
        });
        setStableHtml(html);

        const timer = window.setTimeout(
            () => {
                setActive(null);
            },
            Math.max(16, duration * 1000),
        );
        return () => window.clearTimeout(timer);
    }, [index, html, transitionType, duration]);

    const durationStyle = { "--presenit-page-duration": `${duration}s` } as Record<string, string>;

    if (!active) {
        return (
            <div class="projection__stage" style={durationStyle}>
                <div class="projection__layer">
                    <SlideFrame
                        html={stableHtml}
                        width={width}
                        height={height}
                        className="projection__slide"
                        laser={laser}
                    />
                </div>
            </div>
        );
    }

    const dir = active.direction > 0 ? "forward" : "back";

    return (
        <div class="projection__stage" style={durationStyle}>
            <div
                class={`projection__layer projection__layer--out is-${active.type}-out-${dir}`}
                aria-hidden="true"
            >
                <SlideFrame
                    html={active.fromHtml}
                    width={width}
                    height={height}
                    className="projection__slide"
                />
            </div>
            <div class={`projection__layer projection__layer--in is-${active.type}-in-${dir}`}>
                <SlideFrame
                    html={active.toHtml}
                    width={width}
                    height={height}
                    className="projection__slide"
                    laser={laser}
                />
            </div>
        </div>
    );
}
