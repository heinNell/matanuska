const DEFAULT_API_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_WIALON_API_URL) ||
  "https://hst-api.wialon.com";

export type WialonSid = string;

export interface WialonHttpOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

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

  async loginWithToken(token: string): Promise<any> {
    const res = await this.call<any>("token/login", { token });
    const sid = (res?.eid || res?.sid) as string | undefined;
    if (!sid) throw new Error("Wialon login did not return eid/sid.");
    this.sid = sid;
    if (res?.base_url) this.setBaseUrl(res.base_url);
    return res;
  }

  async logout(): Promise<void> {
    try {
      if (this.sid) await this.call<any>("core/logout", {});
    } finally {
      this.sid = null;
    }
  }

  async call<T>(svc: string, params: unknown): Promise<T> {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const url = `${this.baseUrl}/wialon/ajax.html`;
      const merged = this.sid != null ? { ...(params as any), sid: this.sid } : params;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ svc, params: JSON.stringify(merged ?? {}) }),
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

export default WialonHttp;
