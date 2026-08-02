import { describe, expect, it, beforeEach } from "vitest";
import type { DeckClientData } from "../src/project/load";
import { DEFAULT_CONFIG } from "../src/types";
import {
    currentIndex,
    currentStep,
    elapsedMs,
    next,
    prev,
    resetTimer,
    setDeck,
    timerRunning,
    toggleTimer,
} from "../src/viewer/store";

function deckWithSteps(maxSteps: number[]): DeckClientData {
    return {
        slug: "test",
        config: {
            ...DEFAULT_CONFIG,
            fontFamily: { ...DEFAULT_CONFIG.fontFamily },
            pageTransition: { ...DEFAULT_CONFIG.pageTransition },
            animation: { ...DEFAULT_CONFIG.animation },
        },
        css: "",
        slides: maxSteps.map((maxStep, index) => ({
            html: `<section data-slide-index="${index}"></section>`,
            notes: null,
            maxStep,
        })),
    };
}

describe("presenter timer store", () => {
    beforeEach(() => {
        elapsedMs.value = 42_000;
        timerRunning.value = true;
    });

    it("toggleTimer flips running state", () => {
        toggleTimer();
        expect(timerRunning.value).toBe(false);
        toggleTimer();
        expect(timerRunning.value).toBe(true);
    });

    it("resetTimer clears elapsed time without changing running state", () => {
        timerRunning.value = false;
        resetTimer();
        expect(elapsedMs.value).toBe(0);
        expect(timerRunning.value).toBe(false);
    });
});

describe("reveal navigation", () => {
    beforeEach(() => {
        setDeck(deckWithSteps([2, 0, 3]));
        currentIndex.value = 0;
        currentStep.value = 0;
    });

    it("advances steps before changing slides; empty clicks consume counter", () => {
        expect(currentIndex.value).toBe(0);
        expect(currentStep.value).toBe(0);
        next();
        expect(currentIndex.value).toBe(0);
        expect(currentStep.value).toBe(1);
        next();
        expect(currentStep.value).toBe(2);
        next();
        expect(currentIndex.value).toBe(1);
        expect(currentStep.value).toBe(0);
        next();
        expect(currentIndex.value).toBe(2);
        expect(currentStep.value).toBe(0);
    });

    it("returns to previous slide at its maxStep", () => {
        currentIndex.value = 2;
        currentStep.value = 1;
        prev();
        expect(currentIndex.value).toBe(2);
        expect(currentStep.value).toBe(0);
        prev();
        expect(currentIndex.value).toBe(1);
        expect(currentStep.value).toBe(0);
        prev();
        expect(currentIndex.value).toBe(0);
        expect(currentStep.value).toBe(2);
    });
});
