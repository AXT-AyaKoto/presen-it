import { signal, computed } from "@preact/signals";
import type { DeckClientData } from "../project/load";

export type ViewerMode = "projection" | "presenter";

export const deckData = signal<DeckClientData | null>(null);
export const currentIndex = signal(0);
export const mode = signal<ViewerMode>("projection");
export const elapsedMs = signal(0);
export const timerRunning = signal(true);

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

export function toggleMode(): void {
    mode.value = mode.value === "projection" ? "presenter" : "projection";
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
