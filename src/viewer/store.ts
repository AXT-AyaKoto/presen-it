import { signal, computed, effect } from "@preact/signals";
import type { DeckClientData } from "../project/load";

export type ViewerMode = "projection" | "presenter" | "overview";

export const deckData = signal<DeckClientData | null>(null);
/** Prefer URL hash so Vite full-reload after markdown edits keeps the current slide. */
export const currentIndex = signal(readHashIndexOnBoot());
/** Reveal counter for the current slide (0 = entrance; only at<=0 visible). */
export const currentStep = signal(0);
export const mode = signal<ViewerMode>("projection");
export const elapsedMs = signal(0);
export const timerRunning = signal(true);
export const blackout = signal(false);
export const laserOn = signal(false);
export const laserDot = signal<{ x: number; y: number } | null>(null);

export type LaserMessage = { on: boolean; x?: number; y?: number };

export function toggleTimer(): void {
    timerRunning.value = !timerRunning.value;
}

/** Clear elapsed time; running state is unchanged. */
export function resetTimer(): void {
    elapsedMs.value = 0;
}

export function setBlackout(on: boolean): void {
    if (blackout.value === on) {
        return;
    }
    blackout.value = on;
    broadcastBlackout(on);
}

export function toggleBlackout(): void {
    setBlackout(!blackout.value);
}

function readHashIndexOnBoot(): number {
    if (typeof window === "undefined") {
        return 0;
    }
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) {
        return 0;
    }
    const value = Number.parseInt(raw, 10);
    if (!Number.isFinite(value) || value < 1) {
        return 0;
    }
    return value - 1;
}

export const slideCount = computed(() => deckData.value?.slides.length ?? 0);

export const currentSlide = computed(() => {
    const deck = deckData.value;
    if (!deck) {
        return null;
    }
    return deck.slides[currentIndex.value] ?? null;
});

export const currentMaxStep = computed(() => currentSlide.value?.maxStep ?? 0);

/** Preview target for presenter "Next": same slide at next step, or following slide at 0. */
export const presenterNextPreview = computed(() => {
    const deck = deckData.value;
    if (!deck) {
        return null;
    }
    const index = currentIndex.value;
    const slide = deck.slides[index];
    if (!slide) {
        return null;
    }
    if (currentStep.value < slide.maxStep) {
        return { html: slide.html, step: currentStep.value + 1, kind: "step" as const };
    }
    const upcoming = deck.slides[index + 1];
    if (!upcoming) {
        return null;
    }
    return { html: upcoming.html, step: 0, kind: "slide" as const };
});

export const nextSlide = computed(() => {
    const deck = deckData.value;
    if (!deck) {
        return null;
    }
    return deck.slides[currentIndex.value + 1] ?? null;
});

function maxStepAt(index: number): number {
    return deckData.value?.slides[index]?.maxStep ?? 0;
}

export function setDeck(data: DeckClientData): void {
    deckData.value = data;
    currentIndex.value = Math.min(currentIndex.value, Math.max(0, data.slides.length - 1));
    currentStep.value = Math.min(currentStep.value, maxStepAt(currentIndex.value));
}

export function goTo(index: number, step = 0): void {
    const max = slideCount.value - 1;
    if (max < 0) {
        return;
    }
    const nextIndex = Math.max(0, Math.min(max, index));
    currentIndex.value = nextIndex;
    currentStep.value = Math.max(0, Math.min(maxStepAt(nextIndex), step));
}

export function next(): void {
    const maxStep = currentMaxStep.value;
    if (currentStep.value < maxStep) {
        currentStep.value += 1;
        return;
    }
    const max = slideCount.value - 1;
    if (currentIndex.value >= max) {
        return;
    }
    currentIndex.value += 1;
    currentStep.value = 0;
}

export function prev(): void {
    if (currentStep.value > 0) {
        currentStep.value -= 1;
        return;
    }
    if (currentIndex.value <= 0) {
        return;
    }
    const prevIndex = currentIndex.value - 1;
    currentIndex.value = prevIndex;
    currentStep.value = maxStepAt(prevIndex);
}

const PRESENTER_WINDOW_NAME = "presenit-presenter";

/** Open or focus the presenter view in a separate tab/window (call from a user gesture). */
export function openPresenterWindow(): void {
    const url = new URL(window.location.href);
    url.searchParams.set("presenter", "");
    window.open(url.toString(), PRESENTER_WINDOW_NAME);
    broadcastIndex(currentIndex.value, currentStep.value);
}

export function leavePresenter(): void {
    mode.value = "projection";
    stripPresenterQuery();
}

export function stripPresenterQuery(): void {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("presenter")) {
        return;
    }
    url.searchParams.delete("presenter");
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function toggleOverview(): void {
    mode.value = mode.value === "overview" ? "projection" : "overview";
}

export function exitOverviewTo(index: number): void {
    goTo(index, 0);
    mode.value = "projection";
    broadcastIndex(index, 0);
}

const CHANNEL = "presenit-sync";

function postSyncMessage(message: Record<string, unknown>): void {
    try {
        const channel = new BroadcastChannel(CHANNEL);
        channel.postMessage(message);
        channel.close();
    } catch {
        // BroadcastChannel may be unavailable in some contexts.
    }
}

export function broadcastIndex(index: number, step = currentStep.value): void {
    postSyncMessage({ type: "index", index, step });
}

export function broadcastBlackout(on: boolean): void {
    postSyncMessage({ type: "blackout", on });
}

export function toggleLaser(): void {
    laserOn.value = !laserOn.value;
    if (!laserOn.value) {
        laserDot.value = null;
    }
    broadcastLaser({ on: laserOn.value });
}

export function setLaserDot(x: number, y: number, broadcast: boolean): void {
    if (!laserOn.value) {
        return;
    }
    laserDot.value = { x, y };
    if (broadcast) {
        broadcastLaser({ on: true, x, y });
    }
}

export function clearLaserDot(broadcast: boolean): void {
    laserDot.value = null;
    if (broadcast && laserOn.value) {
        broadcastLaser({ on: true });
    }
}

export function broadcastLaser(state: LaserMessage): void {
    postSyncMessage({ type: "laser", ...state });
}

export function applyLaserMessage(msg: LaserMessage): void {
    laserOn.value = msg.on;
    if (!msg.on) {
        laserDot.value = null;
        return;
    }
    if (typeof msg.x === "number" && typeof msg.y === "number") {
        laserDot.value = { x: msg.x, y: msg.y };
    } else {
        laserDot.value = null;
    }
}

export type SyncHandlers = {
    onIndex?: (index: number, step: number) => void;
    onBlackout?: (on: boolean) => void;
};

/** Accepts either a legacy index callback or a handlers object. */
export function listenSync(
    onIndexOrHandlers: ((index: number, step: number) => void) | SyncHandlers,
): () => void {
    const handlers: SyncHandlers =
        typeof onIndexOrHandlers === "function"
            ? { onIndex: onIndexOrHandlers }
            : onIndexOrHandlers;
    try {
        const channel = new BroadcastChannel(CHANNEL);
        channel.onmessage = (event: MessageEvent) => {
            if (event.data?.type === "index" && typeof event.data.index === "number") {
                const step = typeof event.data.step === "number" ? event.data.step : 0;
                handlers.onIndex?.(event.data.index, step);
            }
            if (event.data?.type === "blackout" && typeof event.data.on === "boolean") {
                blackout.value = event.data.on;
                handlers.onBlackout?.(event.data.on);
            }
            if (event.data?.type === "laser" && typeof event.data.on === "boolean") {
                applyLaserMessage(event.data as LaserMessage);
            }
        };
        return () => channel.close();
    } catch {
        return () => {};
    }
}

export function readHashIndex(): number | null {
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) {
        return null;
    }
    const value = Number.parseInt(raw, 10);
    if (!Number.isFinite(value) || value < 1) {
        return null;
    }
    return value - 1;
}

export function writeHashIndex(index: number): void {
    const nextHash = `#${index + 1}`;
    if (window.location.hash === nextHash) {
        return;
    }
    history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${nextHash}`,
    );
}

/**
 * Apply reveal visibility inside a slide root element.
 * When `showAll` is true (overview / PDF), every fragment is shown.
 */
export function applyRevealVisibility(
    root: ParentNode | null | undefined,
    step: number,
    showAll = false,
): void {
    if (!root) {
        return;
    }
    const nodes = root.querySelectorAll<HTMLElement>("[data-presenit-at]");
    for (const el of nodes) {
        const raw = el.getAttribute("data-presenit-at");
        const at = raw === null ? 0 : Number.parseInt(raw, 10);
        const visible = showAll || !Number.isFinite(at) || at <= step;
        el.classList.toggle("is-revealed", visible);
        el.classList.toggle("is-concealed", !visible);
    }
}

// Hide laser dot when the slide changes.
effect(() => {
    void currentIndex.value;
    laserDot.value = null;
});

// Keep URL hash in sync with the current slide (1-based).
effect(() => {
    if (typeof window === "undefined") {
        return;
    }
    if (!deckData.value) {
        return;
    }
    writeHashIndex(currentIndex.value);
});
