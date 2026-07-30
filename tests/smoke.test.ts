import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { name, version } from "../src/index";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
    version: string;
};

describe("package smoke", () => {
    it("exports package identity", () => {
        expect(name).toBe("presenit");
        expect(version).toBe(pkg.version);
    });
});
