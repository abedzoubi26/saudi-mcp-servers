import { HttpClient, ApiError, arabicDigitsToAscii } from "@saudi-mcp/shared";
import type { WathqConfig } from "./config.js";
import { MOCK_RESPONSES } from "./mock.js";
import { ID_TYPES, type IdType } from "./schemas.js";

/**
 * Validate a commercial-registration / national-unified number.
 * Wathq requires 10 digits (codes 400.1.2 / 400.1.3). We convert
 * Arabic-Indic digits first so users can paste either form.
 */
export function normalizeCrId(raw: string): string {
  const ascii = arabicDigitsToAscii(raw).trim();
  if (!/^\d+$/.test(ascii)) {
    throw new ApiError({
      kind: "bad_request",
      service: "wathq",
      message:
        "Identifier must contain digits only (CR number or unified national number).",
      upstreamCode: "400.1.2",
    });
  }
  if (ascii.length !== 10) {
    throw new ApiError({
      kind: "bad_request",
      service: "wathq",
      message: "Identifier must be exactly 10 digits.",
      upstreamCode: "400.1.3",
    });
  }
  return ascii;
}

export function assertIdType(value: string): IdType {
  if ((ID_TYPES as readonly string[]).includes(value)) return value as IdType;
  throw new ApiError({
    kind: "bad_request",
    service: "wathq",
    message: `idType must be one of: ${ID_TYPES.join(", ")}`,
  });
}

export class WathqClient {
  private readonly http?: HttpClient;
  private readonly mock: boolean;

  constructor(config: WathqConfig) {
    this.mock = config.mock;
    if (!config.mock) {
      this.http = new HttpClient({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        service: "wathq",
      });
    }
  }

  private async call<T>(path: string, language: "ar" | "en"): Promise<T> {
    if (this.mock) {
      const key = path.split("/")[1] ?? "";
      const data = MOCK_RESPONSES[key];
      if (data === undefined) {
        throw new ApiError({
          kind: "not_found",
          service: "wathq",
          message: `No mock data for "${key}".`,
        });
      }
      return structuredClone(data) as T;
    }
    return this.http!.get<T>(path, { language });
  }

  info(id: string, language: "ar" | "en") {
    return this.call<unknown>(`/info/${normalizeCrId(id)}`, language);
  }

  fullInfo(id: string, language: "ar" | "en") {
    return this.call<unknown>(`/fullinfo/${normalizeCrId(id)}`, language);
  }

  status(id: string, language: "ar" | "en") {
    return this.call<unknown>(`/status/${normalizeCrId(id)}`, language);
  }

  capital(id: string, language: "ar" | "en") {
    return this.call<unknown>(`/capital/${normalizeCrId(id)}`, language);
  }

  managers(id: string, language: "ar" | "en") {
    return this.call<unknown>(`/managers/${normalizeCrId(id)}`, language);
  }

  owners(id: string, language: "ar" | "en") {
    return this.call<unknown>(`/owners/${normalizeCrId(id)}`, language);
  }

  branches(id: string, language: "ar" | "en") {
    return this.call<unknown>(`/branches/${normalizeCrId(id)}`, language);
  }

  related(id: string, idType: string, language: "ar" | "en") {
    const t = assertIdType(idType);
    return this.call<unknown>(`/related/${id}/${t}`, language);
  }

  owns(id: string, idType: string, language: "ar" | "en") {
    const t = assertIdType(idType);
    return this.call<unknown>(`/owns/${id}/${t}`, language);
  }
}
