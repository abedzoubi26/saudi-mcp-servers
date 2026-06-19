import type { InvoiceInput } from "./schemas.js";

/**
 * Generate a minimal ZATCA-compliant UBL 2.1 invoice XML.
 *
 * This produces the canonical structure required by Fatoora — UBL extensions
 * placeholder, invoice counter, PIH, and line items with VAT — without
 * XAdES signing (signing is applied separately by the client layer).
 */
export function buildInvoiceXml(invoice: InvoiceInput): string {
  const totals = computeTotals(invoice);
  const typeCode = invoice.invoiceType === "simplified" ? "388" : "388";
  const invoiceSubTypeCode =
    invoice.invoiceType === "simplified" ? "0200000" : "0100000";

  const buyerBlock =
    invoice.buyerName || invoice.buyerVatNumber
      ? `
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escXml(invoice.buyerName ?? "")}</cbc:Name>
      </cac:PartyName>
      ${
        invoice.buyerVatNumber
          ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${escXml(invoice.buyerVatNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>`
          : ""
      }
    </cac:Party>
  </cac:AccountingCustomerParty>`
      : "";

  const lineXml = invoice.lineItems
    .map(
      (item, i) => `
  <cac:InvoiceLine>
    <cbc:ID>${i + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SAR">${(item.quantity * item.unitPrice).toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${escXml(item.name)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${(item.vatRate * 100).toFixed(2)}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="SAR">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
      <ext:ExtensionContent/>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${escXml(invoice.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${escXml(invoice.uuid)}</cbc:UUID>
  <cbc:IssueDate>${escXml(invoice.issueDate)}</cbc:IssueDate>
  <cbc:IssueTime>${escXml(invoice.issueTime)}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${invoiceSubTypeCode}">${typeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${escXml(invoice.invoiceNumber)}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${escXml(invoice.previousInvoiceHash)}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escXml(invoice.sellerName)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escXml(invoice.sellerAddress.street ?? "")}</cbc:StreetName>
        <cbc:CityName>${escXml(invoice.sellerAddress.city)}</cbc:CityName>
        <cac:Country><cbc:IdentificationCode>${escXml(invoice.sellerAddress.country)}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escXml(invoice.sellerVatNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>${buyerBlock}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${totals.totalVat.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SAR">${totals.subtotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SAR">${totals.totalVat.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${totals.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${totals.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${totals.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SAR">${totals.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${lineXml}
</Invoice>`;
}

function computeTotals(invoice: InvoiceInput) {
  let subtotal = 0;
  let totalVat = 0;
  for (const item of invoice.lineItems) {
    const lineTotal = item.quantity * item.unitPrice;
    subtotal += lineTotal;
    totalVat += lineTotal * item.vatRate;
  }
  return { subtotal, totalVat, total: subtotal + totalVat };
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
