/**
 * Typed errors shared across all Saudi MCP servers.
 *
 * Saudi government APIs (Wathq, ZATCA, ...) return structured
 * `{ code, message }` errors. We normalize them into typed classes
 * so each server — and the MCP layer — can handle them consistently.
 */

export type ApiErrorKind =
  | "auth" // 401 — bad/missing/unsubscribed key
  | "forbidden" // 403 — key valid but not allowed for this resource
  | "not_found" // 404 — no record
  | "bad_request" // 400 — invalid input (wrong length, non-digit, ...)
  | "rate_limit" // 429 — too many requests
  | "server" // 5xx — upstream failure
  | "network" // request never completed
  | "unknown";

export interface ApiErrorOptions {
  kind: ApiErrorKind;
  /** HTTP status, if a response was received. */
  status?: number;
  /** Upstream error code, e.g. Wathq "400.1.3". */
  upstreamCode?: string;
  /** Human-readable message from upstream (may be Arabic or English). */
  message: string;
  /** The service that produced the error, e.g. "wathq". */
  service?: string;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly upstreamCode?: string;
  readonly service?: string;

  constructor(opts: ApiErrorOptions) {
    super(opts.message);
    this.name = "ApiError";
    this.kind = opts.kind;
    this.status = opts.status;
    this.upstreamCode = opts.upstreamCode;
    this.service = opts.service;
    if (opts.cause !== undefined) this.cause = opts.cause;
  }

  /** Map an HTTP status code to an error kind. */
  static kindFromStatus(status: number): ApiErrorKind {
    switch (status) {
      case 400:
        return "bad_request";
      case 401:
        return "auth";
      case 403:
        return "forbidden";
      case 404:
        return "not_found";
      case 429:
        return "rate_limit";
      default:
        return status >= 500 ? "server" : "unknown";
    }
  }

  /**
   * A short, user-facing hint for the most common failure modes.
   * Useful for surfacing actionable guidance through the MCP layer.
   */
  hint(): string | undefined {
    switch (this.kind) {
      case "auth":
        return "Check the API key and that the API is subscribed/enabled for your app.";
      case "rate_limit":
        return "Rate limit reached. Slow down requests or upgrade the subscription tier.";
      case "not_found":
        return "No record matched the provided identifier.";
      case "bad_request":
        return "The identifier looks invalid (must usually be 10 digits).";
      default:
        return undefined;
    }
  }
}
