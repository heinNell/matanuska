import { WialonPosition, WialonUnit, WialonSearchItemsResult, WialonFlags } from "../types/wialon-types";
import { WialonHttp } from "./wialon-http";

const DEFAULT_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: { VITE_WIALON_API_URL?: string } }).env?.VITE_WIALON_API_URL) ||
  "https://hst-api.wialon.com";

export interface FleetItem {
  id: number;
  name: string;
  status: "active" | "idle" | "offline";
  position: { lat: number; lng: number } | null;
  speed: number;
  heading?: number;
  lastUpdate: Date | null;
  raw: WialonUnit;
};

export class WialonService {
  private http: WialonHttp | null = null;
  private isInitialized = false;
  private pollHandle: any = null;
  private token: string | null = null;
  private subscriptions = new Map<number, number>();

  initialize(): void {
    if (this.isInitialized) return;
    this.http = new WialonHttp({ baseUrl: DEFAULT_URL, timeoutMs: 20_000 });
    this.isInitialized = true;
  }

  async loginWithToken(token: string): Promise<void> {
    if (!this.isInitialized) this.initialize();
    if (!this.http) throw new Error("HTTP not initialized");
    await this.http.loginWithToken(token);
    this.token = token;
    console.log("[Wialon] login OK, sid =", this.http.sessionId);
  }

  /**
   * Login using a Wialon token (prefer on the server). In the browser,
   * prefer bootstrapFromLoginResponse to avoid exposing tokens.
   */
  async login(token: string): Promise<void> {
    if (!this.isInitialized) this.initialize();
    if (!this.http) throw new Error("HTTP client not initialized");

    try {
      const res = await this.http.loginWithToken(token);
      this.token = token;
      console.log("[Wialon] Logged in as:", res?.user?.nm ?? "(unknown)");
    } catch (error) {
      console.error("[Wialon] Failed login:", error);
      throw new Error(`Wialon authentication failed: ${(error as Error)?.message ?? ""}`);
    }
  }

  /** Logout and clear local session + polling timers. */
  async logout(): Promise<void> {
    if (!this.isInitialized || !this.http) return;
    try {
      await this.http.logout();
      this.token = null;
      console.log("[Wialon] Logged out");
    } catch (error) {
      console.error("[Wialon] Logout error:", error);
    } finally {
      for (const id of this.subscriptions.values()) clearInterval(id);
      this.subscriptions.clear();
      if (this.pollHandle) {
        clearInterval(this.pollHandle);
        this.pollHandle = null;
      }
    }
  }

  bootstrapFromLoginResponse(resp: { base_url: string; eid: string }) {
    if (!this.isInitialized) this.initialize();
    if (!this.http) throw new Error("HTTP not initialized");
    this.http.setBaseUrl(resp.base_url);
    this.http.setSessionId(resp.eid);
  }

  async getUnitsSnapshot(): Promise<WialonUnit[]> {
    if (!this.isInitialized || !this.http) throw new Error("Service not ready");
    const res = await this.http.call<WialonSearchItemsResult<WialonUnit>>(
      "core/search_items",
      {
        searchSpec: {
          itemsType: "avl_unit",
          propName: "sys_name",
          propValueMask: "*",
          sortType: "sys_name",
          propType: "",
          or_logic: "0",
        },
        flags: WialonFlags.UNIT_RICH,
        force: 1,
      }
    );
    return res?.items ?? [];
  }

  /** List all units (vehicles). */
  async getUnits(): Promise<WialonUnit[]> {
    if (!this.isInitialized || !this.http || (!this.http.sessionId && !this.token)) {
      throw new Error("Wialon service not initialized or not logged in");
    }
    try {
      const res = await this.http.call<WialonSearchItemsResult<WialonUnit>>("core/search_items", {
        searchSpec: {
          itemsType: "avl_unit",
          propName: "sys_name",
          propValueMask: "*",
          sortType: "sys_name",
          propType: "",
          or_logic: "0",
        },
        flags: WialonFlags.UNIT_RICH,
        force: 1,
      });
      return res?.items ?? [];
    } catch (error) {
      console.error("[Wialon] getUnits failed:", error);
      throw new Error("Failed to retrieve fleet data from Wialon");
    }
  }

  /** Get one unit by id with rich fields & last position. */
  async getUnitById(unitId: number): Promise<WialonUnit | null> {
    if (!this.isInitialized || !this.http || (!this.http.sessionId && !this.token)) {
      throw new Error("Wialon service not initialized or not logged in");
    }
    try {
      const res = await this.http.call<any>("core/search_item", {
        id: unitId,
        flags: WialonFlags.UNIT_RICH,
      });
      return (res?.item as WialonUnit) ?? null;
    } catch (error) {
      console.error(`[Wialon] getUnitById ${unitId} failed:`, error);
      throw new Error("Failed to retrieve vehicle data from Wialon");
    }
  }

  /**
   * Get decoded track between two dates (inclusive).
   * NOTE: Wialon uses seconds; we convert Date -> seconds.
   */
  async getUnitHistory(unitId: number, from: Date, to: Date): Promise<WialonPosition[]> {
    if (!this.isInitialized || !this.http || (!this.http.sessionId && !this.token)) {
      throw new Error("Wialon service not initialized or not logged in");
    }
    if (from > to) throw new Error("Invalid history range: 'from' is after 'to'");

    try {
      const timeFrom = Math.floor(from.getTime() / 1000);
      const timeTo = Math.floor(to.getTime() / 1000);

      const load = await this.http.call<any>("messages/load_interval", {
        itemId: unitId,
        timeFrom,
        timeTo,
        flags: 0,
        trackDecode: 1,
      });
      const mid = load?.mid;
      if (!mid) return [];

      const got = await this.http.call<any>("messages/get_messages", {
        mid,
        lastTime: timeFrom,
        lastI: 0,
      });

      const msgs = (got?.messages ?? []) as any[];
      const positions: WialonPosition[] = msgs
        .map((m) => {
          const p = m?.pos || m;
          if (!p) return null;
          return {
            t: p.t ?? m?.t,
            lat: (p.y ?? p.lat) as number,
            lon: (p.x ?? p.lng) as number,
            sp: p.sp ?? 0,
            cr: p.cr ?? 0,
          } as WialonPosition;
        })
        .filter(Boolean) as WialonPosition[];

      try {
        await this.http.call<any>("messages/unload", { mid });
      } catch {
        /* ignore */
      }

      return positions;
    } catch (error) {
      console.error(`[Wialon] getUnitHistory ${unitId} failed:`, error);
      throw new Error("Failed to retrieve vehicle history data from Wialon");
    }
  }

  /**
   * "Subscribe" to unit updates via lightweight polling (10s).
   */
  subscribeToUnit(unitId: number, callback: (unit: WialonUnit) => void): void {
    if (!this.isInitialized || !this.http || (!this.http.sessionId && !this.token)) {
      throw new Error("Wialon service not initialized or not logged in");
    }
    if (this.subscriptions.has(unitId)) return;

    const intervalId = window.setInterval(async () => {
      try {
        const u = await this.getUnitById(unitId);
        if (u) callback(u);
      } catch (e) {
        console.warn(`[Wialon] polling unit ${unitId} failed:`, (e as Error)?.message);
      }
    }, 10_000);

    this.subscriptions.set(unitId, intervalId);
  }

  /** Stop polling a unit. */
  unsubscribeFromUnit(unitId: number): void {
    if (!this.isInitialized) return;
    const id = this.subscriptions.get(unitId);
    if (id) {
      clearInterval(id);
      this.subscriptions.delete(unitId);
    }
  }

  /** Call any Wialon service by name with params. */
  async executeCustomMethod<T>(methodName: string, params: any): Promise<T> {
    if (!this.isInitialized || !this.http || (!this.http.sessionId && !this.token)) {
      throw new Error("Wialon service not initialized or not logged in");
    }
    try {
      return await this.http.call<T>(methodName, params);
    } catch (error) {
      console.error(`[Wialon] executeCustomMethod ${methodName} failed:`, error);
      throw new Error(`Failed to execute Wialon operation: ${methodName}`);
    }
  }

  /** Fetch all units (IDs + rich data via dataFlags) */
  async getUnitsFull(): Promise<WialonUnit[]> {
    if (!this.isInitialized || !this.http || (!this.http.sessionId && !this.token)) {
      throw new Error("Wialon service not initialized or not logged in");
    }

    try {
      const search = await this.http.call<any>("core/search_items", {
        searchSpec: {
          itemsType: "avl_unit",
          propName: "sys_name",
          propValueMask: "*",
          sortType: "sys_name",
          propType: "",
          or_logic: "0",
        },
        flags: 0,
        force: 1,
      });

      const ids = (search?.items ?? []).map((u: any) => u.id);
      if (ids.length === 0) return [];

      const checked = await this.http.call<any>("core/check_items", {
        ids,
        flags: 0x0001ffff,
      });

      return checked?.items ?? [];
    } catch (error) {
      console.error("[Wialon] getUnitsFull failed:", error);
      throw new Error("Failed to retrieve full fleet data from Wialon");
    }
  }

  classify(units: WialonUnit[]): FleetItem[] {
    const now = Date.now() / 1000;
    return (units ?? []).map((u) => {
      const pos = (u as any).pos;
      let status: FleetItem["status"] = "offline";
      let position: FleetItem["position"] = null;
      let speed = 0;
      let heading: number | undefined;
      let lastUpdate: Date | null = null;

      if (pos && typeof pos.t === "number" && typeof pos.y === "number" && typeof pos.x === "number") {
        const ageMin = (now - pos.t) / 60;
        if (ageMin < 3) status = "active";
        else if (ageMin < 15) status = "idle";
        else status = "offline";

        position = { lat: pos.y, lng: pos.x };
        speed = pos.sp ?? 0;
        heading = pos.cr;
        lastUpdate = new Date(pos.t * 1000);
      }

      return {
        id: (u as any).id,
        name: (u as any).nm ?? (u as any).sys_name ?? String((u as any).id),
        status,
        position,
        speed,
        heading,
        lastUpdate,
        raw: u,
      };
    });
  }

  /**
   * Start 'real-time' polling (30s default). Returns a stop() function.
   */
  watchFleet(intervalMs: number, onUpdate: (fleet: FleetItem[]) => void): () => void {
    if (!this.isInitialized || !this.http) throw new Error("Service not ready");
    const tick = async () => {
      try {
        const raw = await this.getUnitsSnapshot();
        const fleet = this.classify(raw);
        onUpdate(fleet);
      } catch (e) {
        console.warn("[Wialon] poll error:", (e as Error)?.message);
      }
    };

    tick();
    if (this.pollHandle) clearInterval(this.pollHandle);
    this.pollHandle = setInterval(tick, intervalMs);

    return () => {
      if (this.pollHandle) clearInterval(this.pollHandle);
      this.pollHandle = null;
    };
  }
}

// Singleton export
export const wialonService = new WialonService();
export default wialonService;
    throw new Error("Failed to retrieve full fleet data from Wialon");