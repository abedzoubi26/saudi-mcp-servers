/**
 * ZATCA Fatoora server configuration, read from environment variables.
 *
 *   ZATCA_CERT        binarySecurityToken returned by the compliance/production CSID endpoint
 *   ZATCA_SECRET      secret returned alongside the binarySecurityToken
 *   ZATCA_PRIVATE_KEY Base64-encoded DER private key (ECDSA P-256) — used for CSR generation only
 *   ZATCA_BASE_URL    Optional; overrides the default gateway URL
 *   ZATCA_ENV         "sandbox" | "production" (default: "sandbox")
 *   ZATCA_MOCK        "true" to serve canned data with no network/key needed
 *
 * Auth: ZATCA uses HTTP Basic auth with binarySecurityToken:secret (base64-encoded).
 */

export type ZatcaEnv = "sandbox" | "production";

export interface ZatcaConfig {
  cert: string;
  secret: string;
  privateKey: string;
  baseUrl: string;
  environment: ZatcaEnv;
  mock: boolean;
}

const BASE_URLS: Record<ZatcaEnv, string> = {
  sandbox: "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal",
  production: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ZatcaConfig {
  const mock = env.ZATCA_MOCK === "true";
  const environment: ZatcaEnv =
    env.ZATCA_ENV === "production" ? "production" : "sandbox";

  const cert = env.ZATCA_CERT ?? "";
  const secret = env.ZATCA_SECRET ?? "";
  const privateKey = env.ZATCA_PRIVATE_KEY ?? "";

  if (!mock && (!cert || !secret)) {
    throw new Error(
      "ZATCA_CERT and ZATCA_SECRET are required (or set ZATCA_MOCK=true to run without credentials).",
    );
  }

  const baseUrl = env.ZATCA_BASE_URL ?? BASE_URLS[environment];

  return { cert, secret, privateKey, baseUrl, environment, mock };
}
