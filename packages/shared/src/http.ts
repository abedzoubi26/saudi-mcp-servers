import { ApiError, type ApiErrorKind } from "./errors.js";

export interface HttpClientOptions {
  /** Base URL, e.g. https://api.wathq.sa/sandbox/commercial-registration */
  baseUrl: string;
  /** Value for the `apiKey` header. */
  apiKey: string;
  /** Service name for error attribution, e.g. "wathq". */
  service: string;
  /** Max retry attempts for transient failures (429/5xx/network). Default 3. */
  maxRetries?: number;
  /** Base backoff in ms (exponential). Default 500. */
  backoffMs?: number;
  /** Per-request timeout in ms. Default 15000. */
  timeoutMs?: number;
  /** Override fetch (for testing). Defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

interface UpstreamError {
  code?: string | number;
  message?: string;
}

const RETRYABLE: ReadonlySet<ApiErrorKind> = new Set([
  "rate_limit",
  "server",
  "network",
]);

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly service: string;
  private readonly maxRetries: number;
  private readonly backoffMs: number;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: HttpClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.apiKey = opts.apiKey;
    this.service = opts.service;
    this.maxRetries = opts.maxRetries ?? 3;
    this.backoffMs = opts.backoffMs ?? 500;
    this.timeoutMs = opts.timeoutMs ?? 15_000;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  /**
   * GET a JSON resource. `path` is appended to baseUrl. `query` values
   * are URL-encoded; undefined/null entries are skipped.
   */
  async get<T>(
    path: string,
    query?: Record<string, string | number | undefined | null>,
  ): Promise<T> {
    const url = this.buildUrl(path, query);
    let lastError: ApiError | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.attempt<T>(url);
      } catch (err) {
        const apiErr =
          err instanceof ApiError
            ? err
            : new ApiError({
                kind: "unknown",
                message: err instanceof Error ? err.message : String(err),
                service: this.service,
                cause: err,
              });
        lastError = apiErr;

        const canRetry =
          RETRYABLE.has(apiErr.kind) && attempt < this.maxRetries;
        if (!canRetry) throw apiErr;

        await this.delay(this.backoffMs * 2 ** attempt);
      }
    }
    // Unreachable, but satisfies the type checker.
    throw lastError;
  }

  private async attempt<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let res: Response;
    try {
      res = await this.fetchImpl(url, {
        method: "GET",
        headers: {
          apiKey: this.apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      });
    } catch (err) {
      throw new ApiError({
        kind: "network",
        message:
          err instanceof Error
            ? `Request failed: ${err.message}`
            : "Request failed",
        service: this.service,
        cause: err,
      });
    } finally {
      clearTimeout(timer);
    }

    if (res.ok) {
      return (await res.json()) as T;
    }

    throw await this.toApiError(res);
  }

  private async toApiError(res: Response): Promise<ApiError> {
    let upstream: UpstreamError | undefined;
    let raw = "";
    try {
      raw = await res.text();
      upstream = raw ? (JSON.parse(raw) as UpstreamError) : undefined;
    } catch {
      // Non-JSON error body; keep raw text as the message.
    }

    const message =
      upstream?.message ||
      raw ||
      `${this.service} request failed with status ${res.status}`;

    return new ApiError({
      kind: ApiError.kindFromStatus(res.status),
      status: res.status,
      upstreamCode:
        upstream?.code !== undefined ? String(upstream.code) : undefined,
      message,
      service: this.service,
    });
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | undefined | null>,
  ): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(this.baseUrl + cleanPath);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
