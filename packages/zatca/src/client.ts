import { ApiError } from "@saudi-mcp/shared";
import type { ZatcaConfig } from "./config.js";
import { MOCK_RESPONSES } from "./mock.js";
import { buildInvoiceXml } from "./xml.js";
import type { InvoiceInput } from "./schemas.js";

const ACCEPT_VERSION = "V2";

export class ZatcaClient {
  private readonly config: ZatcaConfig;

  constructor(config: ZatcaConfig) {
    this.config = config;
  }

  // ── Onboarding ────────────────────────────────────────────────────────────

  async requestComplianceCsid(csrBase64: string, otp: string): Promise<unknown> {
    if (this.config.mock) return structuredClone(MOCK_RESPONSES.complianceCsid);

    return this.post("/compliance", { csr: csrBase64 }, { "OTP": otp });
  }

  async requestProductionCsid(complianceRequestId: string): Promise<unknown> {
    if (this.config.mock) return structuredClone(MOCK_RESPONSES.productionCsid);

    return this.post(
      "/production/csids",
      { compliance_request_id: complianceRequestId },
      this.csidAuthHeaders(),
    );
  }

  // ── Compliance check ──────────────────────────────────────────────────────

  async checkInvoiceCompliance(invoice: InvoiceInput): Promise<unknown> {
    if (this.config.mock) return structuredClone(MOCK_RESPONSES.complianceCheck);

    const xml = buildInvoiceXml(invoice);
    const xmlBase64 = Buffer.from(xml).toString("base64");
    const hash = await hashInvoiceXml(xml);

    return this.post(
      "/compliance/invoices",
      {
        invoiceHash: hash,
        uuid: invoice.uuid,
        invoice: xmlBase64,
      },
      this.csidAuthHeaders(),
    );
  }

  // ── Invoice submission ────────────────────────────────────────────────────

  async reportInvoice(invoice: InvoiceInput): Promise<unknown> {
    if (this.config.mock) return structuredClone(MOCK_RESPONSES.reporting);

    const xml = buildInvoiceXml(invoice);
    const xmlBase64 = Buffer.from(xml).toString("base64");
    const hash = await hashInvoiceXml(xml);

    return this.post(
      "/invoices/reporting/single",
      {
        invoiceHash: hash,
        uuid: invoice.uuid,
        invoice: xmlBase64,
      },
      this.csidAuthHeaders(),
    );
  }

  async clearInvoice(invoice: InvoiceInput): Promise<unknown> {
    if (this.config.mock) return structuredClone(MOCK_RESPONSES.clearance);

    const xml = buildInvoiceXml(invoice);
    const xmlBase64 = Buffer.from(xml).toString("base64");
    const hash = await hashInvoiceXml(xml);

    return this.post(
      "/invoices/clearance/single",
      {
        invoiceHash: hash,
        uuid: invoice.uuid,
        invoice: xmlBase64,
      },
      {
        ...this.csidAuthHeaders(),
        "Clearance-Status": "1",
      },
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private csidAuthHeaders(): Record<string, string> {
    const token = Buffer.from(
      `${this.config.cert}:${this.config.privateKey}`,
    ).toString("base64");
    return { Authorization: `Basic ${token}` };
  }

  private async post(
    path: string,
    body: unknown,
    extraHeaders: Record<string, string> = {},
  ): Promise<unknown> {
    const url = `${this.config.baseUrl}${path}`;
    let res: Response;

    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": ACCEPT_VERSION,
          ...extraHeaders,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new ApiError({
        kind: "network",
        service: "zatca",
        message: err instanceof Error ? err.message : String(err),
      });
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      throw new ApiError({
        kind: res.status === 401 ? "auth" : res.status === 429 ? "rate_limit" : "upstream",
        service: "zatca",
        upstreamCode: String(res.status),
        message: `ZATCA returned ${res.status}: ${text.slice(0, 200)}`,
      });
    }

    return data;
  }
}

async function hashInvoiceXml(xml: string): Promise<string> {
  const bytes = new TextEncoder().encode(xml);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return Buffer.from(buffer).toString("base64");
}
