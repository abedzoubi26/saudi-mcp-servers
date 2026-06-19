import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ApiError } from "@saudi-mcp/shared";
import type { ZatcaClient } from "../client.js";
import { invoiceInputSchema } from "../schemas.js";

/**
 * Tool descriptions are in ENGLISH on purpose — same design principle as the
 * rest of saudi-mcp-servers: reliable tool selection in English, data returned
 * in Arabic / original form.
 */

function toResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function toError(err: unknown) {
  const e =
    err instanceof ApiError
      ? err
      : new ApiError({
          kind: "unknown",
          service: "zatca",
          message: err instanceof Error ? err.message : String(err),
        });
  const hint = e.hint();
  const text =
    `ZATCA error [${e.kind}` +
    (e.upstreamCode ? ` ${e.upstreamCode}` : "") +
    `]: ${e.message}` +
    (hint ? `\nHint: ${hint}` : "");
  return { content: [{ type: "text" as const, text }], isError: true };
}

export function registerTools(server: McpServer, client: ZatcaClient): void {
  // ── Onboarding ─────────────────────────────────────────────────────────

  server.tool(
    "zatca_request_compliance_csid",
    "Request a Compliance CSID (cryptographic stamp identifier) from ZATCA " +
      "for sandbox testing. Provide a Base64-encoded Certificate Signing Request (CSR) " +
      "and the One-Time Password (OTP) generated from the ZATCA developer portal. " +
      "Returns a binarySecurityToken and secret needed for subsequent API calls.",
    {
      csrBase64: z
        .string()
        .describe("Base64-encoded X.509 Certificate Signing Request (CSR)."),
      otp: z
        .string()
        .describe("One-Time Password from the ZATCA developer portal for this EGS unit."),
    },
    async ({ csrBase64, otp }) => {
      try {
        return toResult(await client.requestComplianceCsid(csrBase64, otp));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.tool(
    "zatca_request_production_csid",
    "Exchange a compliance CSID for a production CSID after passing all 12 " +
      "ZATCA compliance checks. Provide the requestID returned by the compliance " +
      "CSID endpoint. Returns the production binarySecurityToken and secret.",
    {
      complianceRequestId: z
        .string()
        .describe("The requestID returned by zatca_request_compliance_csid."),
    },
    async ({ complianceRequestId }) => {
      try {
        return toResult(await client.requestProductionCsid(complianceRequestId));
      } catch (err) {
        return toError(err);
      }
    },
  );

  // ── Compliance check ──────────────────────────────────────────────────

  server.tool(
    "zatca_check_invoice_compliance",
    "Submit an invoice to ZATCA's compliance endpoint to validate it against " +
      "all e-invoicing rules before going live. Use this during sandbox testing " +
      "to ensure your invoice structure is correct. Returns validation results " +
      "with any errors or warnings.",
    { invoice: invoiceInputSchema },
    async ({ invoice }) => {
      try {
        return toResult(await client.checkInvoiceCompliance(invoice));
      } catch (err) {
        return toError(err);
      }
    },
  );

  // ── Invoice submission ────────────────────────────────────────────────

  server.tool(
    "zatca_report_invoice",
    "Report a simplified (B2C) tax invoice to ZATCA. The invoice is delivered " +
      "to the customer immediately; ZATCA must receive the report within 24 hours. " +
      "Builds and submits the UBL 2.1 XML automatically from structured input. " +
      "Returns ZATCA's reporting status.",
    { invoice: invoiceInputSchema },
    async ({ invoice }) => {
      try {
        if (invoice.invoiceType !== "simplified") {
          return toError(
            new ApiError({
              kind: "bad_request",
              service: "zatca",
              message: "zatca_report_invoice is for simplified (B2C) invoices only. Use zatca_clear_invoice for standard B2B invoices.",
            }),
          );
        }
        return toResult(await client.reportInvoice(invoice));
      } catch (err) {
        return toError(err);
      }
    },
  );

  server.tool(
    "zatca_clear_invoice",
    "Submit a standard (B2B/B2G) tax invoice to ZATCA for clearance. ZATCA " +
      "validates and stamps the invoice before it can be delivered to the buyer. " +
      "Returns the cleared invoice XML (double-signed by you and ZATCA) and " +
      "clearance status.",
    { invoice: invoiceInputSchema },
    async ({ invoice }) => {
      try {
        if (invoice.invoiceType !== "standard") {
          return toError(
            new ApiError({
              kind: "bad_request",
              service: "zatca",
              message: "zatca_clear_invoice is for standard (B2B/B2G) invoices only. Use zatca_report_invoice for simplified B2C invoices.",
            }),
          );
        }
        return toResult(await client.clearInvoice(invoice));
      } catch (err) {
        return toError(err);
      }
    },
  );
}
