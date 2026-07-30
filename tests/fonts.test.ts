import { describe, expect, it } from "vitest";
import {
    buildGoogleFontsImports,
    namedFontFamilies,
    parseFontFamilyList,
} from "../src/render/fonts";

describe("font family helpers", () => {
    it("parses quoted and unquoted CSS font-family lists", () => {
        expect(parseFontFamilyList('"M PLUS 1", system-ui, sans-serif')).toEqual([
            "M PLUS 1",
            "system-ui",
            "sans-serif",
        ]);
        expect(parseFontFamilyList('Ubuntu, "M PLUS 1"')).toEqual(["Ubuntu", "M PLUS 1"]);
    });

    it("keeps named families and drops generics", () => {
        expect(
            namedFontFamilies(
                '"Libertinus Serif", serif',
                '"M PLUS 1 Code", ui-monospace, monospace',
            ),
        ).toEqual(["Libertinus Serif", "M PLUS 1 Code"]);
    });

    it("builds per-family Google Fonts imports", () => {
        const css = buildGoogleFontsImports(["Libertinus Serif", "Ubuntu"]);
        expect(css).toContain("family=Libertinus+Serif:wght@400;500;600;700");
        expect(css).toContain("family=Ubuntu:wght@400;500;600;700");
        expect(css.split("@import").length - 1).toBe(2);
    });
});
