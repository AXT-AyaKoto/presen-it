import { describe, expect, it } from "vitest";
import { name, version } from "../src/index";

describe("package smoke", () => {
    it("exports package identity", () => {
        expect(name).toBe("presenit");
        expect(version).toBe("0.0.0");
    });
});
