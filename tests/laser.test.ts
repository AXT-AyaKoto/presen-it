import { beforeEach, describe, expect, it } from "vitest";
import { applyLaserMessage, laserDot, laserOn, toggleLaser } from "../src/viewer/store";

describe("laser store", () => {
    beforeEach(() => {
        laserOn.value = false;
        laserDot.value = null;
    });

    it("toggleLaser flips mode and clears dot when off", () => {
        toggleLaser();
        expect(laserOn.value).toBe(true);

        laserDot.value = { x: 0.5, y: 0.5 };
        toggleLaser();
        expect(laserOn.value).toBe(false);
        expect(laserDot.value).toBeNull();
    });

    it("applyLaserMessage sets position when coordinates are present", () => {
        applyLaserMessage({ on: true, x: 0.25, y: 0.75 });
        expect(laserOn.value).toBe(true);
        expect(laserDot.value).toEqual({ x: 0.25, y: 0.75 });
    });

    it("applyLaserMessage hides dot when on without coordinates", () => {
        laserDot.value = { x: 0.1, y: 0.2 };
        applyLaserMessage({ on: true });
        expect(laserOn.value).toBe(true);
        expect(laserDot.value).toBeNull();
    });

    it("applyLaserMessage turns laser off and clears dot", () => {
        laserOn.value = true;
        laserDot.value = { x: 0.5, y: 0.5 };
        applyLaserMessage({ on: false });
        expect(laserOn.value).toBe(false);
        expect(laserDot.value).toBeNull();
    });
});
