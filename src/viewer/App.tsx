import type { JSX } from "preact";
import { useEffect } from "preact/hooks";
import { SlideFrame } from "./SlideFrame";
import {
    broadcastIndex,
    currentIndex,
    currentSlide,
    deckData,
    elapsedMs,
    goTo,
    listenSync,
    mode,
    next,
    nextSlide,
    prev,
    slideCount,
    timerRunning,
    toggleMode,
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
                    toggleMode();
                    break;
                case "t":
                case "T":
                    event.preventDefault();
                    timerRunning.value = !timerRunning.value;
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

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
    }, []);

    useEffect(() => {
        if (viewerMode !== "projection" || !slide) {
            return;
        }
        // Soft overflow detection for authors (console only).
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
                        ← → navigate · P projection · T timer · F fullscreen
                    </div>
                </aside>
                <style>{deck.css}</style>
            </div>
        );
    }

    return (
        <div
            class="projection"
            onClick={() => {
                next();
                broadcastIndex(currentIndex.value);
            }}
        >
            <SlideFrame
                html={slide.html}
                width={width}
                height={height}
                className="projection__slide"
            />
            <div class="projection__hud">
                {index + 1} / {total}
            </div>
            <style>{deck.css}</style>
        </div>
    );
}
