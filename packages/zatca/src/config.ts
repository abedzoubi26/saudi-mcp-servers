/**
 * ZATCA Fatoora server configuration, read from environment variables.
 *
 *   ZATCA_CERT        Base64-encoded PEM certificate (compliance or production CSID)
 *   ZATCA_PRIVATE_KEY Base64-encoded PEM private key (ECDSA, 256-bit)
 *   ZATCA_BASE_URL    Optional; defaults to the ZATCA production gateway
 *   ZATCA_ENV         "sandbox" | "production" (default: "sandbox")
 *   ZATCA_MOCK        "true" to serve canned data with no network/key needed
 */

export type ZatcaEnv = "sandbox" | "production";

export interface ZatcaConfig {
  cert: string;
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
  const privateKey = env.ZATCA_PRIVATE_KEY ?? "";

  if (!mock && (!cert || !privateKey)) {
    throw new Error(
      "ZATCA_CERT and ZATCA_PRIVATE_KEY are required (or set ZATCA_MOCK=true to run without credentials).",
    );
  }

  const baseUrl = env.ZATCA_BASE_URL ?? BASE_URLS[environment];

  return { cert, privateKey, baseUrl, environment, mock };
}
