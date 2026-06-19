/**
 * Wathq server configuration, read from environment variables.
 *
 *   WATHQ_API_KEY   required (unless WATHQ_MOCK=true)
 *   WATHQ_BASE_URL  optional; defaults to the sandbox commercial-registration base
 *   WATHQ_MOCK      "true" to serve canned data with no network/key needed
 */

export interface WathqConfig {
  apiKey: string;
  baseUrl: string;
  mock: boolean;
}

const DEFAULT_BASE_URL =
  "https://api.wathq.sa/sandbox/commercial-registration";

export function loadConfig(env: NodeJS.ProcessEnv = process.env): WathqConfig {
  const mock = env.WATHQ_MOCK === "true";
  const apiKey = env.WATHQ_API_KEY ?? "";
  const baseUrl = env.WATHQ_BASE_URL ?? DEFAULT_BASE_URL;

  if (!mock && !apiKey) {
    throw new Error(
      "WATHQ_API_KEY is required (or set WATHQ_MOCK=true to run without a key).",
    );
  }

  return { apiKey, baseUrl, mock };
}
