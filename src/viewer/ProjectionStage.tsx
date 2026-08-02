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
    /** Page transition duration in seconds */
    duration: number;
    /** Fragment fade duration in seconds */
    animDuration: number;
    revealStep: number;
    laser?: SlideFrameLaser;
};

type ActiveTransition = {
    fromHtml: string;
    toHtml: string;
    fromStep: number;
    toStep: number;
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
    animDuration,
    revealStep,
    laser,
}: Props): JSX.Element {
    const previousIndexRef = useRef(index);
    const previousHtmlRef = useRef(html);
    const previousStepRef = useRef(revealStep);
    const [stableHtml, setStableHtml] = useState(html);
    const [stableStep, setStableStep] = useState(revealStep);
    const [active, setActive] = useState<ActiveTransition | null>(null);

    useEffect(() => {
        if (index === previousIndexRef.current) {
            previousHtmlRef.current = html;
            previousStepRef.current = revealStep;
            setStableHtml(html);
            setStableStep(revealStep);
            return;
        }

        const direction: 1 | -1 = index > previousIndexRef.current ? 1 : -1;
        const fromHtml = previousHtmlRef.current;
        const fromStep = previousStepRef.current;
        previousIndexRef.current = index;
        previousHtmlRef.current = html;
        previousStepRef.current = revealStep;

        if (transitionType === "none" || duration <= 0) {
            setActive(null);
            setStableHtml(html);
            setStableStep(revealStep);
            return;
        }

        setActive({
            fromHtml,
            toHtml: html,
            fromStep,
            toStep: revealStep,
            direction,
            type: transitionType,
        });
        setStableHtml(html);
        setStableStep(revealStep);

        const timer = window.setTimeout(
            () => {
                setActive(null);
            },
            Math.max(16, duration * 1000),
        );
        return () => window.clearTimeout(timer);
    }, [index, html, revealStep, transitionType, duration]);

    const durationStyle = {
        "--presenit-page-duration": `${duration}s`,
        "--presenit-anim-duration": `${animDuration}s`,
    } as Record<string, string>;

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
                        revealStep={stableStep}
                        animDuration={animDuration}
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
                    revealStep={active.fromStep}
                    animDuration={animDuration}
                />
            </div>
            <div class={`projection__layer projection__layer--in is-${active.type}-in-${dir}`}>
                <SlideFrame
                    html={active.toHtml}
                    width={width}
                    height={height}
                    className="projection__slide"
                    laser={laser}
                    revealStep={active.toStep}
                    animDuration={animDuration}
                />
            </div>
        </div>
    );
}
