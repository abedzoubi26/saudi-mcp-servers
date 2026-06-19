import { z } from "zod";

/**
 * Schemas for ZATCA Fatoora API requests and responses.
 *
 * Real ZATCA responses include a warnings array and a reportingStatus /
 * clearanceStatus string alongside the stamped invoice XML. Everything is
 * optional / passthrough so upstream additions never break parsing.
 */

/** Shared warning/error item returned by ZATCA. */
const warningSchema = z
  .object({
    type: z.string().optional(),
    code: z.string().optional(),
    category: z.string().optional(),
    message: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough();

/** Response from /compliance (CSID onboarding). */
export const complianceCsidResponseSchema = z
  .object({
    requestID: z.union([z.number(), z.string()]).optional(),
    dispositionMessage: z.string().optional(),
    binarySecurityToken: z.string().optional(),
    secret: z.string().optional(),
    errors: z.array(warningSchema).optional().default([]),
    warnings: z.array(warningSchema).optional().default([]),
  })
  .passthrough();

/** Response from /production/csids. */
export const productionCsidResponseSchema = z
  .object({
    requestID: z.union([z.number(), z.string()]).optional(),
    dispositionMessage: z.string().optional(),
    binarySecurityToken: z.string().optional(),
    secret: z.string().optional(),
    errors: z.array(warningSchema).optional().default([]),
    warnings: z.array(warningSchema).optional().default([]),
  })
  .passthrough();

/** Response from /invoices/reporting/single. */
export const reportingResponseSchema = z
  .object({
    reportingStatus: z.string().optional(),
    clearanceStatus: z.string().optional(),
    validationResults: z
      .object({
        infoMessages: z.array(warningSchema).optional().default([]),
        warningMessages: z.array(warningSchema).optional().default([]),
        errorMessages: z.array(warningSchema).optional().default([]),
        status: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

/** Response from /invoices/clearance/single. */
export const clearanceResponseSchema = z
  .object({
    clearanceStatus: z.string().optional(),
    clearedInvoice: z.string().optional(),
    validationResults: z
      .object({
        infoMessages: z.array(warningSchema).optional().default([]),
        warningMessages: z.array(warningSchema).optional().default([]),
        errorMessages: z.array(warningSchema).optional().default([]),
        status: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

/** Response from /compliance/invoices (compliance check). */
export const complianceCheckResponseSchema = z
  .object({
    validationResults: z
      .object({
        infoMessages: z.array(warningSchema).optional().default([]),
        warningMessages: z.array(warningSchema).optional().default([]),
        errorMessages: z.array(warningSchema).optional().default([]),
        status: z.string().optional(),
      })
      .passthrough()
      .optional(),
    reportingStatus: z.string().optional(),
    clearanceStatus: z.string().optional(),
  })
  .passthrough();

/** Structured invoice input accepted by the MCP tools. */
export const invoiceInputSchema = z.object({
  uuid: z.string().describe("Universally unique identifier for this invoice (UUID v4)."),
  invoiceNumber: z.string().describe("Sequential invoice number (e.g. INV-001)."),
  invoiceType: z
    .enum(["simplified", "standard"])
    .describe("simplified = B2C reporting; standard = B2B/B2G clearance."),
  issueDate: z.string().describe("Issue date in YYYY-MM-DD format."),
  issueTime: z.string().describe("Issue time in HH:MM:SS format."),
  sellerName: z.string().describe("Seller's registered commercial name."),
  sellerVatNumber: z.string().describe("Seller's 15-digit VAT registration number."),
  sellerAddress: z.object({
    street: z.string().optional(),
    city: z.string(),
    country: z.string().default("SA"),
  }),
  buyerName: z.string().optional().describe("Buyer name (required for standard invoices)."),
  buyerVatNumber: z.string().optional().describe("Buyer VAT number (required for standard invoices)."),
  lineItems: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      vatRate: z.number().default(0.15).describe("VAT rate as decimal, e.g. 0.15 for 15%."),
    }),
  ),
  previousInvoiceHash: z
    .string()
    .default("NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjOTliNTk4OTIwNDVjNmU0NTJiODMz")
    .describe("SHA-256 hash of the previous invoice XML (PIH). Use the default for the first invoice."),
});

export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
export type ComplianceCsidResponse = z.infer<typeof complianceCsidResponseSchema>;
export type ReportingResponse = z.infer<typeof reportingResponseSchema>;
export type ClearanceResponse = z.infer<typeof clearanceResponseSchema>;
