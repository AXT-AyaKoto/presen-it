import { describe, expect, it, beforeEach } from "vitest";
import { elapsedMs, resetTimer, timerRunning, toggleTimer } from "../src/viewer/store";

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
