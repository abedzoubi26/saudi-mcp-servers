import { describe, it, expect } from "vitest";
import {
  complianceCsidResponseSchema,
  reportingResponseSchema,
  clearanceResponseSchema,
  complianceCheckResponseSchema,
  invoiceInputSchema,
} from "../src/schemas.js";
import { buildInvoiceXml } from "../src/xml.js";
import { MOCK_RESPONSES } from "../src/mock.js";

const sampleInvoice = {
  uuid: "8e6b7d2e-5a4f-4c3b-9e1d-0f2a3b4c5d6e",
  invoiceNumber: "INV-001",
  invoiceType: "simplified" as const,
  issueDate: "2024-01-01",
  issueTime: "10:00:00",
  sellerName: "شركة اختبار",
  sellerVatNumber: "300000000000003",
  sellerAddress: { city: "الرياض", country: "SA" },
  lineItems: [
    { name: "منتج اختبار", quantity: 2, unitPrice: 100, vatRate: 0.15 },
  ],
  previousInvoiceHash:
    "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjOTliNTk4OTIwNDVjNmU0NTJiODMz",
};

describe("schemas parse real sparse ZATCA responses", () => {
  it("complianceCsid parses the mock", () => {
    expect(() =>
      complianceCsidResponseSchema.parse(MOCK_RESPONSES.complianceCsid),
    ).not.toThrow();
  });

  it("reporting parses the mock", () => {
    expect(() =>
      reportingResponseSchema.parse(MOCK_RESPONSES.reporting),
    ).not.toThrow();
  });

  it("clearance parses the mock with clearedInvoice", () => {
    const result = clearanceResponseSchema.parse(MOCK_RESPONSES.clearance);
    expect(result.clearanceStatus).toBe("CLEARED");
  });

  it("complianceCheck parses the mock", () => {
    const result = complianceCheckResponseSchema.parse(
      MOCK_RESPONSES.complianceCheck,
    );
    expect(result.validationResults?.status).toBe("PASS");
  });

  it("passthrough keeps unknown upstream keys", () => {
    const result = reportingResponseSchema.parse({
      reportingStatus: "REPORTED",
      newFutureField: "xyz",
    });
    expect((result as Record<string, unknown>).newFutureField).toBe("xyz");
  });
});

describe("invoiceInputSchema", () => {
  it("accepts a valid simplified invoice", () => {
    const result = invoiceInputSchema.parse(sampleInvoice);
    expect(result.invoiceType).toBe("simplified");
  });

  it("defaults previousInvoiceHash when omitted", () => {
    const { previousInvoiceHash: _, ...rest } = sampleInvoice;
    const result = invoiceInputSchema.parse(rest);
    expect(result.previousInvoiceHash).toBeTruthy();
  });

  it("rejects unknown invoiceType", () => {
    expect(() =>
      invoiceInputSchema.parse({ ...sampleInvoice, invoiceType: "debit" }),
    ).toThrow();
  });
});

describe("buildInvoiceXml", () => {
  it("produces valid XML with seller VAT number", () => {
    const xml = buildInvoiceXml(invoiceInputSchema.parse(sampleInvoice));
    expect(xml).toContain("<Invoice");
    expect(xml).toContain("300000000000003");
    expect(xml).toContain("شركة اختبار");
  });

  it("includes PIH reference", () => {
    const xml = buildInvoiceXml(invoiceInputSchema.parse(sampleInvoice));
    expect(xml).toContain("PIH");
    expect(xml).toContain(sampleInvoice.previousInvoiceHash);
  });

  it("computes totals correctly (200 + 30 VAT = 230)", () => {
    const xml = buildInvoiceXml(invoiceInputSchema.parse(sampleInvoice));
    expect(xml).toContain("230.00");
    expect(xml).toContain("30.00");
  });

  it("escapes XML special characters in seller name", () => {
    const xml = buildInvoiceXml(
      invoiceInputSchema.parse({ ...sampleInvoice, sellerName: "A & B <Test>" }),
    );
    expect(xml).toContain("A &amp; B &lt;Test&gt;");
    expect(xml).not.toContain("A & B");
  });
});
