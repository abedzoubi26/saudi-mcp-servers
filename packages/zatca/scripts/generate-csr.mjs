/**
 * Generate a ZATCA-compliant ECDSA CSR using node-forge.
 *
 * ZATCA requires specific OID extensions in the CSR:
 *   2.16.840.1.114412.1.1 = EGS Serial Number
 *   2.16.840.1.114412.1.2 = VAT Registration Number
 *
 * Usage: node generate-csr.mjs
 */

import forge from "node-forge";
import { writeFileSync } from "fs";

// ── Configuration ───────────────────────────────────────────────────────────
const VAT_NUMBER        = "310712587200003";
const ORG_NAME          = "Tahawwul Telecom and IT Company";
const BRANCH_NAME       = "Main Branch";
const SERIAL_NUMBER     = "1-Tahawwul|2-EGS1-001|3-MCP";  // SN field: 1-name|2-serial|3-solution
const CITY              = "Riyadh";
const COUNTRY           = "SA";
const BUSINESS_TYPE     = "1100";   // 1100 = B2B + B2C, 0100 = B2B only, 1000 = B2C only
const BUSINESS_CATEGORY = "Technology";
// ────────────────────────────────────────────────────────────────────────────

// node-forge doesn't natively support ECDSA CSR — use RSA-2048 for sandbox testing.
// Production requires ECDSA P-256 signed with the ZATCA-issued certificate.
console.log("Generating RSA-2048 key pair (ZATCA sandbox accepts RSA)...");
const keys = forge.pki.rsa.generateKeyPair(2048);
const privateKey = keys.privateKey;
const publicKey  = keys.publicKey;

const csr = forge.pki.createCertificationRequest();
csr.publicKey = publicKey;

// ZATCA-required Subject DN fields (section 4.3 of Developer Portal Manual)
// Using OIDs directly where node-forge doesn't know the shortName.
csr.setSubject([
  { name: "countryName",            value: COUNTRY },           // C  2.5.4.6
  { name: "organizationName",       value: ORG_NAME },          // O  2.5.4.10
  { name: "organizationalUnitName", value: BRANCH_NAME },       // OU 2.5.4.11
  { name: "commonName",             value: ORG_NAME },          // CN 2.5.4.3
  // SN (serialNumber 2.5.4.5) = "1-{name}|2-{serial}|3-{solution}"
  { type: "2.5.4.5",               value: SERIAL_NUMBER },
  // UID (userId 0.9.2342.19200300.100.1.1) = VAT number
  { type: "0.9.2342.19200300.100.1.1", value: VAT_NUMBER },
  // title (2.5.4.12) = business type
  { type: "2.5.4.12",              value: BUSINESS_TYPE },
  // businessCategory (2.5.4.15) = type of business
  { name: "businessCategory",      value: BUSINESS_CATEGORY },
  // registeredAddress (2.5.4.26) = city
  { type: "2.5.4.26",             value: CITY },
]);

csr.sign(privateKey, forge.md.sha256.create());

const csrPem = forge.pki.certificationRequestToPem(csr);
const keyPem = forge.pki.privateKeyToPem(privateKey);

// Write files
writeFileSync("zatca-private-key.pem", keyPem);
writeFileSync("zatca-csr.pem", csrPem);

// Base64 DER for API
const csrDer    = forge.asn1.toDer(forge.pki.certificationRequestToAsn1(csr)).getBytes();
const csrBase64 = Buffer.from(csrDer, "binary").toString("base64");

const keyAsn1   = forge.pki.privateKeyToAsn1(privateKey);
const keyDer    = forge.asn1.toDer(keyAsn1).getBytes();
const keyBase64 = Buffer.from(keyDer, "binary").toString("base64");

console.log("\nFiles written: zatca-private-key.pem, zatca-csr.pem\n");

console.log("=== CSR Base64 (paste as csrBase64) ===");
console.log(csrBase64);

console.log("\n=== Private Key Base64 (set as ZATCA_PRIVATE_KEY) ===");
console.log(keyBase64);

console.log("\n=== CSR Subject ===");
console.log(`C=${COUNTRY}, O=${VAT_NUMBER}, OU=${BRANCH_NAME}, CN=${EGS_SERIAL}`);
