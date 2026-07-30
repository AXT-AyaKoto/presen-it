import type { JSX } from "preact";
import { useEffect } from "preact/hooks";
import { SlideFrame } from "./SlideFrame";
import { ViewerNav } from "./ViewerNav";
import {
    broadcastIndex,
    currentIndex,
    currentSlide,
    deckData,
    elapsedMs,
    exitOverviewTo,
    goTo,
    listenSync,
    mode,
    next,
    nextSlide,
    prev,
    readHashIndex,
    slideCount,
    timerRunning,
    toggleOverview,
    togglePresenter,
} from "./store";

function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
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
                    togglePresenter();
                    break;
                case "o":
                case "O":
                    event.preventDefault();
                    toggleOverview();
                    break;
                case "t":
                case "T":
                    event.preventDefault();
                    timerRunning.value = !timerRunning.value;
                    break;
                case "Escape":
                    if (viewerMode === "presenter") {
                        event.preventDefault();
                        mode.value = "projection";
                    }
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [viewerMode]);

    useEffect(() => listenSync((nextIndex) => goTo(nextIndex)), []);

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

    if (!deck || !slide) {
        return <div class="viewer-loading">Loading…</div>;
    }

    const { width, height } = deck.config;

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
                    <SlideFrame html={slide.html} width={width} height={height} />
                </div>
                <aside class="presenter__side">
                    <div class="presenter__meta">
                        <span>
                            {index + 1} / {total}
                        </span>
                        <span class="presenter__timer">{formatTime(elapsed)}</span>
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
                    <div class="presenter__hint">
                        ← → navigate · O overview · P projection · T timer · F fullscreen · or use
                        the bottom-left toolbar
                    </div>
                </aside>
                <ViewerNav />
                <style>{deck.css}</style>
            </div>
        );
    }

    return (
        <div class="projection">
            <SlideFrame
                html={slide.html}
                width={width}
                height={height}
                className="projection__slide"
            />
            <button
                type="button"
                class="projection__zone projection__zone--prev"
                aria-label="Previous slide"
                disabled={index <= 0}
                onClick={() => {
                    prev();
                    broadcastIndex(currentIndex.value);
                }}
            />
            <button
                type="button"
                class="projection__zone projection__zone--next"
                aria-label="Next slide"
                disabled={index >= total - 1}
                onClick={() => {
                    next();
                    broadcastIndex(currentIndex.value);
                }}
            />
            <ViewerNav />
            <style>{deck.css}</style>
        </div>
    );
}
