import type { JSX } from "preact";
import {
    broadcastIndex,
    currentIndex,
    mode,
    next,
    prev,
    slideCount,
    toggleOverview,
    togglePresenter,
} from "./store";

function toggleFullscreen(): void {
    if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen();
    } else {
        void document.exitFullscreen();
    }
}

function setPresenterQuery(enabled: boolean): void {
    const url = new URL(window.location.href);
    if (enabled) {
        url.searchParams.set("presenter", "");
    } else {
        url.searchParams.delete("presenter");
    }
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function ViewerNav(): JSX.Element {
    const index = currentIndex.value;
    const total = slideCount.value;
    const viewerMode = mode.value;

    return (
        <div class="viewer-nav" onClick={(event) => event.stopPropagation()}>
            <div class="viewer-nav__panel" role="toolbar" aria-label="Slide navigation">
                <button
                    type="button"
                    class="viewer-nav__btn"
                    aria-label="Previous slide"
                    disabled={index <= 0}
                    onClick={() => {
                        prev();
                        broadcastIndex(currentIndex.value);
                    }}
                >
                    ←
                </button>
                <button
                    type="button"
                    class="viewer-nav__btn"
                    aria-label="Next slide"
                    disabled={index >= total - 1}
                    onClick={() => {
                        next();
                        broadcastIndex(currentIndex.value);
                    }}
                >
                    →
                </button>
                <span class="viewer-nav__page">
                    {index + 1} / {total}
                </span>
                <span class="viewer-nav__sep" aria-hidden="true" />
                <button
                    type="button"
                    class={`viewer-nav__btn${viewerMode === "overview" ? " is-active" : ""}`}
                    aria-pressed={viewerMode === "overview"}
                    onClick={() => toggleOverview()}
                >
                    Overview
                </button>
                <button
                    type="button"
                    class={`viewer-nav__btn${viewerMode === "presenter" ? " is-active" : ""}`}
                    aria-pressed={viewerMode === "presenter"}
                    onClick={() => {
                        const nextMode = viewerMode === "presenter" ? "projection" : "presenter";
                        togglePresenter();
                        setPresenterQuery(nextMode === "presenter");
                    }}
                >
                    Presenter
                </button>
                <button type="button" class="viewer-nav__btn" onClick={() => toggleFullscreen()}>
                    Fullscreen
                </button>
            </div>
        </div>
    );
}
