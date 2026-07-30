import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { ProjectionStage } from "./ProjectionStage";
import { SlideFrame } from "./SlideFrame";
import { ViewerNav } from "./ViewerNav";
import { clickZoneWidthRatio } from "../shared/slide-padding";
import {
    blackout,
    broadcastIndex,
    clearLaserDot,
    currentIndex,
    currentSlide,
    deckData,
    elapsedMs,
    exitOverviewTo,
    goTo,
    laserDot,
    laserOn,
    listenSync,
    mode,
    next,
    nextSlide,
    prev,
    readHashIndex,
    resetTimer,
    setBlackout,
    setLaserDot,
    slideCount,
    timerRunning,
    toggleBlackout,
    toggleTimer,
    leavePresenter,
    openPresenterWindow,
    toggleLaser,
    toggleOverview,
} from "./store";

function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type PressOrigin = {
    x: number;
    y: number;
    t: number;
    pointerId: number;
};

type ClickZone = "prev" | "next";

const MAX_PRESS_MS = 450;
const MAX_MOVE_PX = 8;

function isEditableTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) {
        return false;
    }
    if (el.closest("a, button, input, textarea, select, [contenteditable=true]")) {
        return true;
    }
    return el.tagName === "INPUT" || el.tagName === "TEXTAREA";
}

function zoneFromClientX(
    el: HTMLElement,
    clientX: number,
    deckWidth: number,
    deckHeight: number,
): ClickZone | null {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) {
        return null;
    }
    const x = (clientX - rect.left) / rect.width;
    const zone = clickZoneWidthRatio(deckWidth, deckHeight);
    if (x <= zone) {
        return "prev";
    }
    if (x >= 1 - zone) {
        return "next";
    }
    return null;
}

export function App(): JSX.Element {
    const deck = deckData.value;
    const slide = currentSlide.value;
    const index = currentIndex.value;
    const total = slideCount.value;
    const viewerMode = mode.value;
    const running = timerRunning.value;
    const elapsed = elapsedMs.value;
    const upcoming = nextSlide.value;
    const isBlackout = blackout.value;
    const isLaserOn = laserOn.value;
    const laserPosition = laserDot.value;
    const pressRef = useRef<PressOrigin | null>(null);
    const [hoverZone, setHoverZone] = useState<ClickZone | null>(null);

    useEffect(() => {
        if (viewerMode !== "projection") {
            setHoverZone(null);
        }
    }, [viewerMode]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
                return;
            }

            if (event.key === "Escape" && blackout.value) {
                event.preventDefault();
                setBlackout(false);
                return;
            }

            if (viewerMode === "overview") {
                switch (event.key) {
                    case "Escape":
                    case "o":
                    case "O":
                        event.preventDefault();
                        mode.value = "projection";
                        break;
                    case "ArrowRight":
                    case "ArrowDown":
                        event.preventDefault();
                        next();
                        broadcastIndex(currentIndex.value);
                        break;
                    case "ArrowLeft":
                    case "ArrowUp":
                        event.preventDefault();
                        prev();
                        broadcastIndex(currentIndex.value);
                        break;
                    case "Enter":
                    case " ":
                        event.preventDefault();
                        exitOverviewTo(currentIndex.value);
                        break;
                    default:
                        break;
                }
                return;
            }

            switch (event.key) {
                case "ArrowRight":
                case "PageDown":
                case " ":
                case "Enter":
                    event.preventDefault();
                    next();
                    broadcastIndex(currentIndex.value);
                    break;
                case "ArrowLeft":
                case "PageUp":
                case "Backspace":
                    event.preventDefault();
                    prev();
                    broadcastIndex(currentIndex.value);
                    break;
                case "Home":
                    event.preventDefault();
                    goTo(0);
                    broadcastIndex(0);
                    break;
                case "End":
                    event.preventDefault();
                    goTo(slideCount.value - 1);
                    broadcastIndex(slideCount.value - 1);
                    break;
                case "f":
                case "F":
                    event.preventDefault();
                    if (!document.fullscreenElement) {
                        void document.documentElement.requestFullscreen();
                    } else {
                        void document.exitFullscreen();
                    }
                    break;
                case "p":
                case "P":
                    event.preventDefault();
                    if (viewerMode === "presenter") {
                        leavePresenter();
                    } else {
                        openPresenterWindow();
                    }
                    break;
                case "o":
                case "O":
                    event.preventDefault();
                    toggleOverview();
                    break;
                case "b":
                case "B":
                    event.preventDefault();
                    toggleBlackout();
                    break;
                case "t":
                case "T":
                    event.preventDefault();
                    toggleTimer();
                    break;
                case "r":
                case "R":
                    if (viewerMode === "presenter") {
                        event.preventDefault();
                        resetTimer();
                    }
                    break;
                case "l":
                case "L":
                    event.preventDefault();
                    toggleLaser();
                    break;
                case "Escape":
                    if (viewerMode === "presenter") {
                        event.preventDefault();
                        leavePresenter();
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [viewerMode]);

    useEffect(() => listenSync({ onIndex: goTo }), []);

    useEffect(() => {
        if (viewerMode !== "presenter" || !running) {
            return;
        }
        const id = window.setInterval(() => {
            elapsedMs.value += 1000;
        }, 1000);
        return () => window.clearInterval(id);
    }, [viewerMode, running]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has("presenter")) {
            mode.value = "presenter";
        }
        const hashIndex = readHashIndex();
        if (hashIndex !== null) {
            goTo(hashIndex);
        }

        const onHash = () => {
            const nextIndex = readHashIndex();
            if (nextIndex !== null) {
                goTo(nextIndex);
            }
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    useEffect(() => {
        if (viewerMode !== "projection" || !slide) {
            return;
        }
        const id = window.requestAnimationFrame(() => {
            const columns = document.querySelectorAll(".presenit-column");
            for (const column of columns) {
                if (column.scrollHeight > column.clientHeight + 1) {
                    console.warn(
                        `[presenit] Slide ${index + 1}: content overflows a column (overflow is clipped).`,
                    );
                    break;
                }
            }
        });
        return () => window.cancelAnimationFrame(id);
    }, [viewerMode, slide, index]);

    const onProjectionPointerDown = (event: PointerEvent) => {
        if (event.button !== 0 || isEditableTarget(event.target)) {
            pressRef.current = null;
            return;
        }
        pressRef.current = {
            x: event.clientX,
            y: event.clientY,
            t: Date.now(),
            pointerId: event.pointerId,
        };
    };

    const onProjectionPointerMove = (event: PointerEvent) => {
        const el = event.currentTarget as HTMLElement;
        setHoverZone(zoneFromClientX(el, event.clientX, width, height));
    };

    const onProjectionPointerUp = (event: PointerEvent) => {
        const origin = pressRef.current;
        pressRef.current = null;
        if (!origin || origin.pointerId !== event.pointerId || event.button !== 0) {
            return;
        }
        if (isEditableTarget(event.target)) {
            return;
        }
        const selection = window.getSelection()?.toString() ?? "";
        if (selection.length > 0) {
            return;
        }
        const dt = Date.now() - origin.t;
        const dist = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
        if (dt > MAX_PRESS_MS || dist > MAX_MOVE_PX) {
            return;
        }
        const el = event.currentTarget as HTMLElement;
        const zone = zoneFromClientX(el, event.clientX, width, height);
        if (zone === "prev") {
            prev();
            broadcastIndex(currentIndex.value);
        } else if (zone === "next") {
            next();
            broadcastIndex(currentIndex.value);
        }
    };

    const onProjectionPointerCancel = () => {
        pressRef.current = null;
    };

    const onProjectionPointerLeave = () => {
        pressRef.current = null;
        setHoverZone(null);
    };

    if (!deck || !slide) {
        return <div class="viewer-loading">Loading…</div>;
    }

    const { width, height } = deck.config;

    const projectionLaser = {
        active: isLaserOn,
        dot: laserPosition,
        onMove: (x: number, y: number) => setLaserDot(x, y, false),
        onLeave: () => clearLaserDot(false),
        hideCursor: true,
    };

    const presenterLaser = {
        active: isLaserOn,
        dot: laserPosition,
        onMove: (x: number, y: number) => setLaserDot(x, y, true),
        onLeave: () => clearLaserDot(true),
        hideCursor: true,
    };

    if (viewerMode === "overview") {
        return (
            <div class="overview">
                <div class="overview__header">
                    <span>Overview</span>
                    <span>
                        {index + 1} / {total} · Enter to open · Esc to close
                    </span>
                </div>
                <div class="overview__grid">
                    {deck.slides.map((entry, slideIndex) => (
                        <button
                            type="button"
                            class={`overview__item${slideIndex === index ? " is-active" : ""}`}
                            onClick={() => exitOverviewTo(slideIndex)}
                        >
                            <div class="overview__frame">
                                <SlideFrame html={entry.html} width={width} height={height} />
                            </div>
                            <div class="overview__label">{slideIndex + 1}</div>
                        </button>
                    ))}
                </div>
                <ViewerNav />
                <style>{deck.css}</style>
            </div>
        );
    }

    if (viewerMode === "presenter") {
        return (
            <div class="presenter">
                <div class="presenter__main">
                    <SlideFrame
                        html={slide.html}
                        width={width}
                        height={height}
                        laser={presenterLaser}
                    />
                </div>
                <aside class="presenter__side">
                    <div class="presenter__meta">
                        <span>
                            {index + 1} / {total}
                        </span>
                        <div class="presenter__timer-row">
                            <span class="presenter__timer">{formatTime(elapsed)}</span>
                            <div class="presenter__timer-controls">
                                <button
                                    type="button"
                                    class="presenter__timer-btn"
                                    onClick={toggleTimer}
                                >
                                    {running ? "Pause" : "Resume"}
                                </button>
                                <button
                                    type="button"
                                    class="presenter__timer-btn"
                                    onClick={resetTimer}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="presenter__next-label">Next</div>
                    <div class="presenter__next">
                        {upcoming ? (
                            <SlideFrame html={upcoming.html} width={width} height={height} />
                        ) : (
                            <div class="presenter__end">End</div>
                        )}
                    </div>
                    <div class="presenter__notes-label">Notes</div>
                    <div class="presenter__notes">{slide.notes ?? "—"}</div>
                    <button
                        type="button"
                        class={`presenter__blackout${isBlackout ? " is-active" : ""}`}
                        aria-pressed={isBlackout}
                        onClick={() => toggleBlackout()}
                    >
                        Blackout
                    </button>
                    <div class="presenter__hint">
                        ← → navigate · B blackout · L laser · O overview · P projection · T
                        pause/resume · R reset · F fullscreen · or use the bottom-left toolbar
                    </div>
                </aside>
                <ViewerNav />
                <style>{deck.css}</style>
            </div>
        );
    }

    const clickZone = `${clickZoneWidthRatio(width, height) * 100}%`;

    return (
        <div
            class="projection"
            style={{ "--presenit-click-zone": clickZone }}
            onPointerDown={onProjectionPointerDown}
            onPointerMove={onProjectionPointerMove}
            onPointerUp={onProjectionPointerUp}
            onPointerCancel={onProjectionPointerCancel}
            onPointerLeave={onProjectionPointerLeave}
        >
            <ProjectionStage
                html={slide.html}
                width={width}
                height={height}
                index={index}
                transitionType={deck.config.pageTransition.type}
                duration={deck.config.pageTransition.duration}
                laser={projectionLaser}
            />
            <div
                class={`projection__affordance projection__affordance--prev${hoverZone === "prev" ? " is-visible" : ""}`}
                aria-hidden="true"
            />
            <div
                class={`projection__affordance projection__affordance--next${hoverZone === "next" ? " is-visible" : ""}`}
                aria-hidden="true"
            />
            {isBlackout ? <div class="projection__blackout" aria-hidden="true" /> : null}
            <ViewerNav />
            <style>{deck.css}</style>
        </div>
    );
}
