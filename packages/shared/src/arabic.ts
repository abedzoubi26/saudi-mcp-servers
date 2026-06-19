/**
 * Arabic text helpers.
 *
 * These are intentionally conservative: they normalize text for
 * *searching and comparison*, never for display. We always pass the
 * original Arabic values from the API straight through to the user;
 * normalization is only for internal matching (e.g. comparing a
 * user-typed company name against API data).
 */

const TASHKEEL = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const TATWEEL = /\u0640/g;

/**
 * Remove diacritics (tashkeel) and tatweel (kashida).
 * "مُحَمَّد" -> "محمد", "كاااتب" stays (only the tatweel char ـ is removed).
 */
export function stripDiacritics(input: string): string {
  return input.replace(TASHKEEL, "").replace(TATWEEL, "");
}

/**
 * Normalize letter variants that users commonly mix up, so that
 * search/comparison is forgiving:
 *   أ إ آ ٱ -> ا
 *   ى       -> ي
 *   ة       -> ه
 *   ؤ       -> و
 *   ئ       -> ي
 */
export function normalizeLetters(input: string): string {
  return input
    .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627") // alef variants -> ا
    .replace(/\u0649/g, "\u064A") // ى -> ي
    .replace(/\u0629/g, "\u0647") // ة -> ه
    .replace(/\u0624/g, "\u0648") // ؤ -> و
    .replace(/\u0626/g, "\u064A"); // ئ -> ي
}

/**
 * Full normalization for matching: strip diacritics, unify letters,
 * collapse whitespace, trim. Use ONLY for comparison, never for output.
 */
export function normalizeArabic(input: string): string {
  return normalizeLetters(stripDiacritics(input))
    .replace(/\s+/g, " ")
    .trim();
}

/** Convert Arabic-Indic digits (٠١٢٣...) to ASCII (0123...). */
export function arabicDigitsToAscii(input: string): string {
  const map: Record<string, string> = {
    "\u0660": "0",
    "\u0661": "1",
    "\u0662": "2",
    "\u0663": "3",
    "\u0664": "4",
    "\u0665": "5",
    "\u0666": "6",
    "\u0667": "7",
    "\u0668": "8",
    "\u0669": "9",
  };
  return input.replace(/[\u0660-\u0669]/g, (d) => map[d] ?? d);
}
