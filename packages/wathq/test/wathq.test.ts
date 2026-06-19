import { describe, it, expect } from "vitest";
import {
  infoSchema,
  fullInfoSchema,
  managersSchema,
  ownsSchema,
} from "../src/schemas.js";
import { normalizeCrId, assertIdType } from "../src/client.js";
import { MOCK_RESPONSES } from "../src/mock.js";

describe("normalizeCrId", () => {
  it("accepts a valid 10-digit id", () => {
    expect(normalizeCrId("4030010781")).toBe("4030010781");
  });

  it("converts Arabic-Indic digits", () => {
    expect(normalizeCrId("٤٠٣٠٠١٠٧٨١")).toBe("4030010781");
  });

  it("rejects non-digits", () => {
    expect(() => normalizeCrId("40300abc81")).toThrow(/digits only/i);
  });

  it("rejects wrong length", () => {
    expect(() => normalizeCrId("12345")).toThrow(/10 digits/i);
  });
});

describe("assertIdType", () => {
  it("accepts a known type", () => {
    expect(assertIdType("National_ID")).toBe("National_ID");
  });
  it("rejects an unknown type", () => {
    expect(() => assertIdType("Bogus")).toThrow(/idType must be/);
  });
});

describe("schemas parse the REAL sparse response", () => {
  it("info parses a record with empty arrays and missing nested blocks", () => {
    const real = {
      crNationalNumber: "7000850920",
      crNumber: "4030010781",
      name: "شركة اختبار",
      entityType: { id: 1, name: "شركة", characters: [] },
      status: { id: 1, name: "نشط" },
      activities: [],
    };
    const parsed = infoSchema.parse(real);
    expect(parsed.status?.name).toBe("نشط");
    expect(parsed.activities).toEqual([]);
  });

  it("fullinfo parses the mock", () => {
    expect(() => fullInfoSchema.parse(MOCK_RESPONSES.fullinfo)).not.toThrow();
  });

  it("managers parses the mock array", () => {
    expect(() => managersSchema.parse(MOCK_RESPONSES.managers)).not.toThrow();
  });

  it("owns parses boolean wrapper", () => {
    expect(ownsSchema.parse({ ownsCr: true }).ownsCr).toBe(true);
  });

  it("passthrough keeps unknown upstream keys", () => {
    const parsed = infoSchema.parse({ name: "x", brandNewField: 123 });
    expect((parsed as Record<string, unknown>).brandNewField).toBe(123);
  });
});
