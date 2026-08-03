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
    fromStep: number;
    direction: 1 | -1;
    type: "fade" | "scroll";
};

/**
 * Projection slide stage with optional fade/scroll page transitions.
 *
 * Incoming reveal step stays live during a page transition so mid-transition
 * fragment advances (keyboard repeat, etc.) are visible and do not cancel the
 * transition-end timer (see #106).
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
    const htmlRef = useRef(html);
    const revealStepRef = useRef(revealStep);
    htmlRef.current = html;
    revealStepRef.current = revealStep;

    const [stableHtml, setStableHtml] = useState(html);
    const [stableStep, setStableStep] = useState(revealStep);
    const [active, setActive] = useState<ActiveTransition | null>(null);

    // Keep settled slide content in sync. Must not share an effect with the
    // page-transition timer — otherwise a mid-transition revealStep change
    // clears the completion timeout and leaves `active` stuck (#106).
    useEffect(() => {
        setStableHtml(html);
        setStableStep(revealStep);
        if (index === previousIndexRef.current) {
            previousHtmlRef.current = html;
            previousStepRef.current = revealStep;
        }
    }, [index, html, revealStep]);

    useEffect(() => {
        if (index === previousIndexRef.current) {
            return;
        }

        const direction: 1 | -1 = index > previousIndexRef.current ? 1 : -1;
        const fromHtml = previousHtmlRef.current;
        const fromStep = previousStepRef.current;
        const toHtml = htmlRef.current;
        const toStep = revealStepRef.current;
        previousIndexRef.current = index;
        previousHtmlRef.current = toHtml;
        previousStepRef.current = toStep;

        if (transitionType === "none" || duration <= 0) {
            setActive(null);
            setStableHtml(toHtml);
            setStableStep(toStep);
            return;
        }

        setActive({
            fromHtml,
            fromStep,
            direction,
            type: transitionType,
        });
        setStableHtml(toHtml);
        setStableStep(toStep);

        const timer = window.setTimeout(
            () => {
                setActive(null);
            },
            Math.max(16, duration * 1000),
        );
        return () => window.clearTimeout(timer);
    }, [index, transitionType, duration]);

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
