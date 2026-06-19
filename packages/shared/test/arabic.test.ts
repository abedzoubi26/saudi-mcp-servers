import { describe, it, expect } from "vitest";
import {
  normalizeArabic,
  stripDiacritics,
  normalizeLetters,
  arabicDigitsToAscii,
} from "../src/arabic.js";

describe("stripDiacritics", () => {
  it("removes tashkeel", () => {
    expect(stripDiacritics("مُحَمَّد")).toBe("محمد");
  });
  it("removes tatweel", () => {
    expect(stripDiacritics("كاـتب")).toBe("كاتب");
  });
});

describe("normalizeLetters", () => {
  it("unifies alef variants", () => {
    expect(normalizeLetters("أإآا")).toBe("اااا");
  });
  it("maps ta marbuta to ha and alef maqsura to ya", () => {
    expect(normalizeLetters("شركة")).toBe("شركه");
    expect(normalizeLetters("مصطفى")).toBe("مصطفي");
  });
});

describe("normalizeArabic", () => {
  it("combines normalization and collapses whitespace", () => {
    expect(normalizeArabic("  شَركةُ   التِجارة ")).toBe("شركه التجاره");
  });
});

describe("arabicDigitsToAscii", () => {
  it("converts Arabic-Indic digits", () => {
    expect(arabicDigitsToAscii("٤٠٣٠٠١٠٧٨١")).toBe("4030010781");
  });
  it("leaves ascii digits untouched", () => {
    expect(arabicDigitsToAscii("12345")).toBe("12345");
  });
});
