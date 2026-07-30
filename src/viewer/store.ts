import { signal, computed, effect } from "@preact/signals";
import type { DeckClientData } from "../project/load";

export type ViewerMode = "projection" | "presenter" | "overview";

export const deckData = signal<DeckClientData | null>(null);
/** Prefer URL hash so Vite full-reload after markdown edits keeps the current slide. */
export const currentIndex = signal(readHashIndexOnBoot());
export const mode = signal<ViewerMode>("projection");
export const elapsedMs = signal(0);
export const timerRunning = signal(true);

export function toggleTimer(): void {
    timerRunning.value = !timerRunning.value;
}

/** Clear elapsed time; running state is unchanged. */
export function resetTimer(): void {
    elapsedMs.value = 0;
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

export const nextSlide = computed(() => {
    const deck = deckData.value;
    if (!deck) {
        return null;
    }
    return deck.slides[currentIndex.value + 1] ?? null;
});

export function setDeck(data: DeckClientData): void {
    deckData.value = data;
    currentIndex.value = Math.min(currentIndex.value, Math.max(0, data.slides.length - 1));
}

export function goTo(index: number): void {
    const max = slideCount.value - 1;
    if (max < 0) {
        return;
    }
    currentIndex.value = Math.max(0, Math.min(max, index));
}

export function next(): void {
    goTo(currentIndex.value + 1);
}

export function prev(): void {
    goTo(currentIndex.value - 1);
}

const PRESENTER_WINDOW_NAME = "presenit-presenter";

/** Open or focus the presenter view in a separate tab/window (call from a user gesture). */
export function openPresenterWindow(): void {
    const url = new URL(window.location.href);
    url.searchParams.set("presenter", "");
    window.open(url.toString(), PRESENTER_WINDOW_NAME);
    broadcastIndex(currentIndex.value);
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
    goTo(index);
    mode.value = "projection";
    broadcastIndex(index);
}

const CHANNEL = "presenit-sync";

export function broadcastIndex(index: number): void {
    try {
        const channel = new BroadcastChannel(CHANNEL);
        channel.postMessage({ type: "index", index });
        channel.close();
    } catch {
        // BroadcastChannel may be unavailable in some contexts.
    }
}

export function listenSync(onIndex: (index: number) => void): () => void {
    try {
        const channel = new BroadcastChannel(CHANNEL);
        channel.onmessage = (event: MessageEvent) => {
            if (event.data?.type === "index" && typeof event.data.index === "number") {
                onIndex(event.data.index);
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
