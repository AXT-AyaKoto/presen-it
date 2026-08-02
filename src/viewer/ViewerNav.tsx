import type { JSX } from "preact";
import {
    broadcastIndex,
    currentIndex,
    currentMaxStep,
    currentStep,
    laserOn,
    leavePresenter,
    mode,
    next,
    openPresenterWindow,
    prev,
    slideCount,
    toggleLaser,
    toggleOverview,
} from "./store";

function toggleFullscreen(): void {
    if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen();
    } else {
        void document.exitFullscreen();
    }
}

export function ViewerNav(): JSX.Element {
    const index = currentIndex.value;
    const total = slideCount.value;
    const step = currentStep.value;
    const maxStep = currentMaxStep.value;
    const viewerMode = mode.value;
    const isLaserOn = laserOn.value;
    const atStart = index <= 0 && step <= 0;
    const atEnd = index >= total - 1 && step >= maxStep;

    return (
        <div class="viewer-nav" onClick={(event) => event.stopPropagation()}>
            <div class="viewer-nav__panel" role="toolbar" aria-label="Slide navigation">
                <button
                    type="button"
                    class="viewer-nav__btn"
                    aria-label="Previous"
                    disabled={atStart}
                    onClick={() => {
                        prev();
                        broadcastIndex(currentIndex.value, currentStep.value);
                    }}
                >
                    ←
                </button>
                <button
                    type="button"
                    class="viewer-nav__btn"
                    aria-label="Next"
                    disabled={atEnd}
                    onClick={() => {
                        next();
                        broadcastIndex(currentIndex.value, currentStep.value);
                    }}
                >
                    →
                </button>
                <span class="viewer-nav__page">
                    {index + 1} / {total}
                    {maxStep > 0 ? ` · ${step}/${maxStep}` : ""}
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
                        if (viewerMode === "presenter") {
                            leavePresenter();
                        } else {
                            openPresenterWindow();
                        }
                    }}
                >
                    Presenter
                </button>
                <button type="button" class="viewer-nav__btn" onClick={() => toggleFullscreen()}>
                    Fullscreen
                </button>
                <button
                    type="button"
                    class={`viewer-nav__btn${isLaserOn ? " is-active" : ""}`}
                    aria-pressed={isLaserOn}
                    onClick={() => toggleLaser()}
                >
                    Laser
                </button>
            </div>
        </div>
    );
}
