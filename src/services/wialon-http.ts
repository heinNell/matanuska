const DEFAULT_API_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_WIALON_API_URL) ||
  "https://hst-api.wialon.com";

export type WialonSid = string;

export interface WialonHttpOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

// New minimal types for Wialon responses/params
export interface WialonLoginResponse {
  eid?: string;
  sid?: string;
  base_url?: string;
  [key: string]: unknown;
}
export type WialonParams = Record<string, unknown>;

export class WialonHttp {
  private baseUrl: string;
  private timeoutMs: number;
  private sid: WialonSid | null = null;

  constructor(opts: WialonHttpOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? DEFAULT_API_URL).replace(/\/+$/, "");
    this.timeoutMs = opts.timeoutMs ?? 20_000;
  }

  get sessionId(): WialonSid | null {
    return this.sid;
  }
  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, "");
  }
  setSessionId(sid: string) {
    this.sid = sid;
  }

  async loginWithToken(token: string): Promise<WialonLoginResponse> {
    const res = await this.call<WialonLoginResponse>("token/login", { token });
    const sid = res.eid || res.sid;
    if (!sid) throw new Error("Wialon login did not return eid/sid.");
    this.sid = sid;
    if (res.base_url) this.setBaseUrl(res.base_url);
    return res;
  }

  async logout(): Promise<void> {
    try {
      if (this.sid) await this.call<unknown>("core/logout", {});
    } finally {
      this.sid = null;
    }
  }

  async call<T>(svc: string, params: unknown): Promise<T> {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const url = `${this.baseUrl}/wialon/ajax.html`;
      const mergedParams: WialonParams =
        this.sid != null
          ? { ...(isRecord(params) ? params : {}), sid: this.sid }
          : (isRecord(params) ? params : {});
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ svc, params: JSON.stringify(mergedParams) }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${svc}`);
      return (await res.json()) as T;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Wialon call failed (${svc}): ${msg}`);
    } finally {
      clearTimeout(t);
    }
  }
}

// Local type guard to safely treat params as a record
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export default WialonHttp;
