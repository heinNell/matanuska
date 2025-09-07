Phase one

wialon.core.Session: lifecycle & transport

initSession(baseUrl), loginToken(token, [operateAs], cb), updateDataFlags(spec[], cb), getItems(type), getItem(id), event polling (/avl_evts), feature flags, GIS endpoints, logout, etc.

wialon.item.Item: base model of all entities

Properties (name, dataFlags, userAccess, etc.), file ops, backups, and remote-update “property bus”.

These are exactly the calls your HTML uses (initSession, loginToken, loadLibrary('itemIcon'), updateDataFlags, getItems('avl_unit'), event-driven updates).

Minimal TypeScript facade (strongly-typed, zero behavior change)

Drop these ambient types somewhere like src/types/wialon.d.ts. They’re deliberately thin, covering only what your UI calls. (No any and aligned with your earlier no-explicit-any guideline.)

// src/types/wialon.d.ts
declare namespace wialon {
  namespace core {
    class Session {
      static getInstance(): Session;
      initSession(baseUrl: string, appName?: string, flags?: number, checkService?: string, version?: string, opts?: { apiPath?: string; gisUrl?: string; ignoreBaseUrl?: boolean; whiteLabel?: boolean }): boolean;
      loginToken(token: string, operateAsOrCb?: string | ((code: number) => void), cb?: (code: number) => void): void;
      updateDataFlags(spec: Array<{ type: "type" | "id" | "prop" | "list"; data: string | number | number[]; flags: number; mode: 0 | 1 }>, cb: (code: number) => void): void;
      getItems(type?: string): wialon.item.Item[] | null;
      getItem(id: number): wialon.item.Item | null;
      loadLibrary(name: "itemIcon" | "unit_sensors" | "unitEvents" | "report" | string): boolean;
      getBaseGisUrl(kind: "render" | "search" | "geocode" | "routing"): string;
      getId(): string | number;
      logout(cb: (code: number) => void): void;
      // events (simplified)
      addListener(event: "serverUpdated" | "invalidSession" | "featuresUpdated" | "unitsUpdated", fn: (data?: unknown) => void, ctx?: unknown): void;
    }

    namespace Errors {
      function getErrorText(code: number): string;
    }
  }

  namespace item {
    class Item {
      getId(): number;
      getType(): string;
      getName(): string;
    }

    // The Unit we actually use
    class Unit extends Item {
      // Wialon positions are (x=lon, y=lat), time in seconds
      getPosition(): { x: number; y: number; s: number; t: number } | null;
      static dataFlag: { base: number; lastMessage: number };
    }
  }

  namespace util {
    namespace Gis {
      // Geocoder/places search used by your autocomplete
      function searchByString(query: string, flags: number, limit: number,
        cb: (code: number, results?: string[]) => void): void;
    }
  }
}

declare const qx: any; // SDK’s Qooxdoo runtime (opaque to app)

Tiny, typed helpers you can import in your UI

Create a wrapper that your UI calls instead of reaching into the SDK directly. This keeps types tight and your surface area tiny.

// src/services/wialonClient.ts
export type UnitStatus = "active" | "idle" | "offline";

export interface UnitView {
  id: number;
  name: string;
  status: UnitStatus;
  position: { lat: number; lng: number } | null;
  lastUpdate: Date | null;
  speedKmh: number;
  wialonUnit: wialon.item.Unit;
}

export interface WialonConfig {
  baseUrl: string;
  token: string;
}

const LAST_MSG_FLAGS = wialon.item.Unit.dataFlag.base | wialon.item.Unit.dataFlag.lastMessage;

export function initSession(cfg: WialonConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = wialon.core.Session.getInstance();
    s.initSession(cfg.baseUrl);
    s.loginToken(cfg.token, (code) => {
      if (code) return reject(new Error(wialon.core.Errors.getErrorText(code)));
      resolve();
    });
  });
}

export function loadUnits(): Promise<UnitView[]> {
  return new Promise((resolve, reject) => {
    const s = wialon.core.Session.getInstance();
    s.loadLibrary("itemIcon");
    s.updateDataFlags(
      [{ type: "type", data: "avl_unit", flags: LAST_MSG_FLAGS, mode: 0 }],
      (code) => {
        if (code) return reject(new Error(wialon.core.Errors.getErrorText(code)));
        const units = (s.getItems("avl_unit") as wialon.item.Unit[]) ?? [];
        const nowSec = Date.now() / 1000;

        const mapped: UnitView[] = units.map((u) => {
          const pos = u.getPosition();
          let status: UnitStatus = "offline";
          if (pos) {
            const minSince = (nowSec - pos.t) / 60;
            status = minSince < 3 ? "active" : minSince < 15 ? "idle" : "offline";
          }
          return {
            id: u.getId(),
            name: u.getName(),
            status,
            position: pos ? { lat: pos.y, lng: pos.x } : null,
            lastUpdate: pos ? new Date(pos.t * 1000) : null,
            speedKmh: pos ? pos.s : 0,
            wialonUnit: u,
          };
        });

        resolve(mapped);
      }
    );
  });
}

export function geocodeSuggest(query: string, limit = 5): Promise<string[]> {
  return new Promise((resolve) => {
    if (!query || query.length < 3) return resolve([]);
    if (!wialon.util.Gis) return resolve([]);
    wialon.util.Gis.searchByString(query, 0, limit, (code, results) => {
      resolve(code ? [] : results ?? []);
    });
  });
}

How to use it in your page (no logic change)

Replace the raw SDK calls with these wrappers in your existing functions:

// before: app.session = wialon.core.Session.getInstance(); ... loginToken(...)
import { initSession, loadUnits, geocodeSuggest } from "@/services/wialonClient";

async function initializeWialonTyped() {
  try {
    await initSession({ baseUrl: CONFIG.WIALON_URL, token: CONFIG.WIALON_TOKEN });
    log("Wialon connection successful", "success");
    updateConnectionStatus("Connected - Real-time Active", "success");

    const units = await loadUnits();
    app.vehicles = units;
    renderVehicles();
    updateVehicleStats();
    populateVehicleSelectors();
    if (typeof google !== "undefined" && app.map) placeVehicleMarkers();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`Wialon login failed: ${msg}`, "error");
    updateConnectionStatus(`Connection Failed: ${msg}`, "error");
  }
}

// swap your initializeWialon() callsite:
initializeWialonTyped();


And for autocomplete:

// inside setupAutocomplete(...)
const suggestions = await geocodeSuggest(query, 5);
if (suggestions.length) showSuggestions(suggestions, dropdown);
else showMockSuggestions(query, dropdown);

Events you can safely rely on

unitsUpdated: emitted after /avl_evts polling; use to refresh markers without reloading flags.

serverUpdated / invalidSession: reconnect / surface banner if session drops.

You can keep your current polling; this just gives you typed hooks if you later want to react to push-like updates.

Security footnote (applies to this SDK too)

The session object stores token, eid, GIS URLs etc. Avoid logging the token (SDK sets __dq). Keep your earlier plan to load secrets at runtime (JSON blob or server-injected window.__APP_CONFIG__) and never print them.

Why this helps

No any: Every call in your UI now has a typed surface (units, position, statuses, suggestions).

Zero behavior change: Same endpoints, flags, and timing; you just call through a wrapper.

Safer refactors: If someone accidentally changes flags or types, TS will bark.

If you want, I can also generate a tiny Vitest suite that mocks wialon.core.Session and asserts your loadUnits() status logic (active/idle/offline) precisely.



### PHASE 2


Extend the ambient types (src/types/wialon.d.ts)

Add the following to the same wialon.d.ts file from before (or merge if you already created it). No any, and only the surfaces your app touches.

declare namespace wialon {
  namespace core {
    class Remote {
      static getInstance(): Remote;

      /** Core RPC with SDK routing, timeout in seconds (defaults to queue timeout). */
      remoteCall<TResp = unknown>(
        svc: string,
        params: Record<string, unknown> | null,
        cb: (code: number, data?: TResp) => void,
        timeoutSeconds?: number
      ): void;

      /** Start a batch; optionally set a name (ed). Returns 1 if started. */
      startBatch(name?: string): 0 | 1;

      /**
       * Finish an open batch. All queued calls are sent as `core/batch`.
       * flags: use `wialon.core.Remote.BatchFlag.breakFailure` to stop on first error.
       */
      finishBatch(
        cb: (
          code: number,
          lastNonZeroError?: number,
          errorCount?: number,
          results?: unknown[]
        ) => void,
        name?: string,
        flags?: number
      ): void;

      /** Update GIS senders when base URL changes. */
      updateGisSenders(): void;
      updateGisSender(kind: "search" | "geocode" | "routing"): void;

      /** Replace low-level sender (rarely used). */
      replaceSender(kind: "search" | "geocode" | "routing" | "sdk", sender: unknown): void;

      /** Default per-request timeout in seconds. */
      setTimeout(seconds: number): void;
      getTimeout(): number;

      /** Internal: set base URL (already managed by Session). */
      setRequestsBaseUrl(): void;

      /** Constants */
      static BatchFlag: { breakFailure: 0x01 };
    }

    /** Lightweight access to Ajax/iframe bridge (opaque to the app). */
    class PostMessage {
      constructor(url: string);
      send(
        url: string,
        params: Record<string, unknown> | null,
        onOk: (resp: unknown) => void,
        onErr: () => void,
        timeoutSeconds?: number
      ): void;
      supportAsync(): boolean;
      dispose(): void;
    }
  }

  namespace util {
    /** Stronger types for helpers we actually call */
    namespace Helper {
      function wrapCallback<T extends (...a: any[]) => any>(cb?: T | null): T;
      function filterItems<T extends wialon.item.Item>(items: T[] | null, accessMask: number): T[] | null;
      function wildcardCompare(value: string, pattern: string, autoWrap?: boolean): boolean;
    }

    namespace Json {
      function stringify(obj: unknown): string;
      function parse(text: string, safe?: boolean): any;
    }

    namespace Number {
      function and(...values: (number | string)[]): number;
      function or(...values: (number | string)[]): number;
      function not(value: number | string): number;
      function exclude(...values: (number | string)[]): number;
    }

    namespace Uri {
      function appendParamsToUrl(url: string, params?: Record<string, string> | string): string;
      function toParameter(params: Record<string, string | number | boolean | string[]>): string;
      function getAbsolute(url: string): string;
    }
  }
}


Tip: these are agnostic of Qooxdoo internals, so your app doesn’t depend on qx.* types.

2) Small improvements to the wrapper (src/services/wialonClient.ts)

Now that Remote is available, you can (a) use batches to reduce latency on cold loads, and (b) set transport timeouts centrally.

// add at module top:
const Remote = wialon.core.Remote.getInstance();

export function configureTransport({ timeoutSeconds = 30 }: { timeoutSeconds?: number } = {}) {
  Remote.setTimeout(timeoutSeconds); // applies to subsequent calls
}

/** Uses a batch so flags + initial lookups happen in one roundtrip. */
export async function primeUnits(): Promise<UnitView[]> {
  return new Promise((resolve, reject) => {
    const s = wialon.core.Session.getInstance();

    // ensure we have the library we need
    s.loadLibrary("itemIcon");

    const LAST_MSG_FLAGS = wialon.item.Unit.dataFlag.base | wialon.item.Unit.dataFlag.lastMessage;

    // start a batch
    Remote.startBatch("prime");
    // 1) update data flags for units
    s.updateDataFlags(
      [{ type: "type", data: "avl_unit", flags: LAST_MSG_FLAGS, mode: 0 }],
      (/* code ignored here; batch will report */) => {}
    );

    // 2) (optional) preload any other things you need into the same batch
    // Remote.remoteCall("core/get_hw_types", { includeType: 1 }, () => {});

    // finish the batch (stop on first failure)
    Remote.finishBatch((code, lastErr, errCount) => {
      if (code) {
        const msg = wialon.core.Errors.getErrorText(code || lastErr || 5);
        return reject(new Error(msg));
      }
      try {
        const units = (s.getItems("avl_unit") as wialon.item.Unit[]) ?? [];
        resolve(mapUnits(units));
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    }, "prime", wialon.core.Remote.BatchFlag.breakFailure);
  });
}

function mapUnits(units: wialon.item.Unit[]): UnitView[] {
  const nowSec = Date.now() / 1000;
  return units.map((u) => {
    const pos = u.getPosition();
    let status: UnitStatus = "offline";
    if (pos) {
      const minSince = (nowSec - pos.t) / 60;
      status = minSince < 3 ? "active" : minSince < 15 ? "idle" : "offline";
    }
    return {
      id: u.getId(),
      name: u.getName(),
      status,
      position: pos ? { lat: pos.y, lng: pos.x } : null,
      lastUpdate: pos ? new Date(pos.t * 1000) : null,
      speedKmh: pos ? pos.s : 0,
      wialonUnit: u,
    };
  });
}


Use it in your init path:

await initSession({ baseUrl: CONFIG.WIALON_URL, token: CONFIG.WIALON_TOKEN });
configureTransport({ timeoutSeconds: 30 });
const units = await primeUnits();

3) Optional: typed GIS helpers via Remote

If you’d rather hit the SDK’s GIS bridge (the PostMessage paths you pasted) than wialon.util.Gis, expose tiny wrappers:

type GisSearchResult = string[]; // Wialon returns array of strings for simple search

export function gisSearch(query: string, limit = 5, timeoutSeconds = 15): Promise<GisSearchResult> {
  return new Promise((resolve) => {
    if (!query || query.length < 3) return resolve([]);
    Remote.remoteCall<GisSearchResult>(
      "gis/search",
      { q: query, limit },
      (code, data) => resolve(code ? [] : (data ?? [])),
      timeoutSeconds
    );
  });
}

export function gisGeocode(query: string, timeoutSeconds = 15): Promise<GisSearchResult> {
  return new Promise((resolve) => {
    if (!query) return resolve([]);
    Remote.remoteCall<GisSearchResult>(
      "gis/geocode",
      { q: query },
      (code, data) => resolve(code ? [] : (data ?? [])),
      timeoutSeconds
    );
  });
}


You can now swap your autocomplete to call gisSearch() (or keep using geocodeSuggest if you prefer the earlier util path).

4) Safety & reliability knobs you now control

Timeouts: configureTransport({ timeoutSeconds }) affects all RPCs; override per call by passing the fourth arg to remoteCall.

Batching: group multiple updateDataFlags / lookups at startup—fewer roundtrips, faster paint.

GIS sender switching: the SDK already maps to /gis_search, /gis_geocode, /gis_post depending on your Session base GIS URLs; no code changes needed, but the types are ready if you ever call updateGisSenders() after setBaseUrl().



### PHASE 3

1) Extend src/types/wialon.d.ts

Append these to the same ambient file I gave you earlier.

declare namespace wialon {
  namespace util {
    namespace PropertyUtil {
      function getAllProperties(klass: any): Record<string, any>;
    }
    namespace Request {
      function isSuccessful(status: number): boolean;
      function isCrossDomain(url: string): boolean;
      function isMethod(method: string): boolean;
      function methodAllowsRequestBody(method: string): boolean;
    }
  }

  namespace core {
    /** Iframe-based uploader used by Unit HW param API. */
    class Uploader {
      static getInstance(): Uploader;
      /**
       * Upload file inputs to a remote `svc`, passing params and firing the callback.
       * @param inputs Array of <input type="file"> elements (or clones with files)
       * @param svc    Service path, e.g. "unit/update_hw_params"
       * @param params Arbitrary params passed to the service
       * @param cb     (code, data?) callback
       * @param waitForNotify If true, wait for server event to complete
       * @param fallbackTimeoutSec Optional fallback completion timeout (ms in SDK, we expose seconds)
       */
      uploadFiles(
        inputs: HTMLInputElement[],
        svc: string,
        params: Record<string, unknown>,
        cb: (code: number, data?: any) => void,
        waitForNotify?: boolean,
        fallbackTimeoutSec?: number
      ): boolean;
    }
  }

  namespace item {
    interface MessagePosition {
      x: number; // lon
      y: number; // lat
      t: number; // unix sec
      s?: number; // speed km/h
      lc?: number; // location source
      f?: number; // flags
      _noPosition?: boolean;
    }

    interface LastMessage {
      t: number; // unix sec
      f?: number;
      lc?: number;
      pos?: MessagePosition | null;
      p?: Record<string, any>;
      tp?: string;
    }

    class User extends Item {
      // props (getters exist; setters are internal via remote updates)
      getUserFlags(): number | null;
      getHostsMask(): string | null;
      getLoginDate(): number | null;
      getAuthParams(): Record<string, unknown> | null;

      // API
      getItemsAccess(
        arg:
          | { directAccess?: number; itemSuperclass?: string; flags?: number }
          | number,
        itemSuperclass?: string,
        cb?: (code: number, data?: any) => void
      ): void;

      updateItemAccess(item: Item, accessMask: number, cb?: (code: number) => void): void;
      updateUserFlags(flags: number, mask: number, cb?: (code: number) => void): void;
      updateHostsMask(mask: string, cb?: (code: number) => void): void;
      getLocale(cb: (code: number, data?: any) => void): void;
      updateLocale(locale: string, cb?: (code: number) => void): void;
      updatePassword(oldPw: string, newPw: string, cb?: (code: number) => void, logInvalid?: number): void;
      sendPushMessage(appName: string, message: string, params: any, ttl: number, cb?: (code: number) => void): void;
      verifyAuth(args: { type: number; destination: string }, cb?: (code: number, data?: any) => void): void;
      updateAuthParams(args: { type: number; phone?: string }, cb?: (code: number, data?: any) => void): void;

      /** Flags & constants */
      static dataFlag: {
        flags: number;
        notifications: number;
        connSettings: number;
        mobileApps: number;
      };
      static accessFlag: {
        setItemsAccess: number;
        operateAs: number;
        editUserFlags: number;
      };
      static userFlag: {
        isDisabled: number;
        cantChangePassword: number;
        canCreateItems: number;
        isReadonly: number;
        canSendSMS: number;
      };
    }

    class Unit extends Item {
      // getters (SDK emits change events to update these)
      getUniqueId(): string | null;
      getUniqueId2(): string | null;
      getDeviceTypeId(): number | null;
      getPhoneNumber(): string | null;
      getPhoneNumber2(): string | null;
      getAccessPassword(): string | null;
      getCommands(): any[] | null;
      getPosition(): MessagePosition | null;
      getLastMessage(): LastMessage | null;
      getPrevMessage(): LastMessage | null;
      getDriverCode(): string | null;
      getCalcFlags(): number | null;
      getMileageCounter(): number | null;
      getEngineHoursCounter(): number | null;
      getTrafficCounter(): number | null;
      getMessageParams(): Record<string, any> | null;
      getNetConn(): number;
      getActivity(): number | null;
      getActivityReason(): number | null;
      getDeactivationTime(): number | null;
      getVideoParams(): Record<string, any> | null;

      // Commands
      remoteCommand(
        commandName: string,
        linkType: number,
        param: string | Record<string, any>,
        timeoutSec?: number,
        flags?: number,
        cb?: (code: number, data?: any) => void
      ): void;

      remoteCommandDefinitions(
        args: { commands: string[] },
        cb?: (code: number, data?: any) => void
      ): void;

      getVirtualCommandsQueue(cb: (code: number, data?: any) => void): void;
      resetVirtualCommandsQueue(cb: (code: number) => void): void;

      // Updates
      updateDeviceSettings(deviceTypeId: number, uniqueId: string, cb?: (code: number) => void): void;
      updateUniqueId2(val: string, cb?: (code: number) => void): void;
      updatePhoneNumber(val: string, cb?: (code: number) => void): void;
      updatePhoneNumber2(val: string, cb?: (code: number) => void): void;
      updateAccessPassword(val: string, cb?: (code: number) => void): void;
      updateMileageCounter(val: number, cb?: (code: number) => void): void;
      updateEngineHoursCounter(val: number, cb?: (code: number) => void): void;
      updateTrafficCounter(val: number, regReset?: number, cb?: (code: number) => void): void;
      updateCalcFlags(val: number, cb?: (code: number) => void): void;
      updateActive(active: 0 | 1, cb?: (code: number) => void): void;

      // Misc
      getActive(): 0 | 1;
      getActiveReason(): number;
      changeAccount(args: { resourceId: number }, cb?: (code: number) => void): void;

      /** Build URL for a photo attached to a message. */
      getMessageImageUrl(timeSec: number, msgIndex: number, fsRel?: string): string;

      /** Download HW param file (returns URL). */
      downloadHwParamFile(hwId: number, fileId: number, _unused?: any): string;

      /** Update HW params; if files provided, uses core.Uploader internally. */
      updateHwParams(
        hwId: number,
        params: Record<string, any> & { full_data?: boolean },
        files?: HTMLInputElement[],
        cb?: (code: number, data?: any) => void
      ): void;

      getDriverActivitySettings(cb: (code: number, data?: any) => void): void;
      updateDriverActivitySettings(type: number, cb: (code: number, data?: any) => void): void;

      /** Flags */
      static dataFlag: {
        restricted: number;
        commands: number;
        lastMessage: number;
        driverCode: number;
        sensors: number;
        counters: number;
        routeControl: number;
        maintenance: number;
        log: number;
        reportSettings: number;
        other: number;
        commandAliases: number;
        messageParams: number;
        netConn: number;
        lastPosition: number;
      };
      static accessFlag: {
        editDevice: number;
        viewDevice: number;
        editSensors: number;
        editCounters: number;
        deleteMessages: number;
        executeCommands: number;
        registerEvents: number;
        editTasks: number;
        editTasksStatusAndComment: number;
        editActivationCodes: number;
        viewServiceIntervals: number;
        editServiceIntervals: number;
        importMessages: number;
        exportMessages: number;
        viewCmdAliases: number;
        editCmdAliases: number;
        editReportSettings: number;
        monitorState: number;
      };
      static calcFlag: {
        mileageMask: number;
        mileageGps: number;
        mileageAbsOdometer: number;
        mileageRelOdometer: number;
        mileageGpsIgn: number;
        engineHoursMask: number;
        engineHoursIgn: number;
        engineHoursAbs: number;
        engineHoursRel: number;
        mileageAuto: number;
        engineHoursAuto: number;
        trafficAuto: number;
      };
      static execCmdFlag: {
        primaryPhone: number;
        secondaryPhone: number;
        paramFsLink: number;
        paramTempFile: number;
        paramJson: number;
      };
    }
  }

  namespace services {
    class Tasks {
      static getInstance(): Tasks;

      /** In-memory map keyed by task_id; structure mirrors message payloads. */
      getTask(taskId: number | string): any | undefined;
      getTasks(): Record<string | number, any>;
      clear(): void;

      /** Update existing task config. */
      updateTaskAsync(
        args: { taskId: number; props: Record<string, any> },
        cb?: (errCode: number | null, data?: any) => void
      ): void;

      /** Create a new task. */
      createTaskAsync(
        args: Record<string, any>,
        cb?: (errCode: number | null, data?: any) => void
      ): void;

      /** Fetch tasks’ messages into cache. */
      getRemoteTasksAsync(
        args: { itemIds: number[]; timeFrom: number; timeTo: number; loadCount?: number; isPartialRefresh?: boolean },
        cb?: (errCode: number | null, data?: any) => void
      ): void;

      /** Remove cached tasks for a unit and emit deletion event. */
      deleteTasksByUnitId(unitId: number): void;
    }
  }
}

2) Handy helpers (src/services/wialonUnit.ts)

A small façade to make common Unit ops pleasant.

import type { wialon } from "../types/wialon"; // only for TS intellisense

/** Send a JSON command to a unit; resolves with raw SDK payload. */
export function sendJsonCommand(
  unit: wialon.item.Unit,
  name: string,
  payload: unknown,
  { timeoutSec = 30, useSecondary = false }: { timeoutSec?: number; useSecondary?: boolean } = {}
): Promise<any> {
  return new Promise((res, rej) => {
    const flags = (useSecondary ? wialon.item.Unit.execCmdFlag.secondaryPhone : 0) |
                  wialon.item.Unit.execCmdFlag.paramJson;
    unit.remoteCommand(name, 0, JSON.stringify(payload), timeoutSec, flags, (code, data) => {
      if (code) return rej(new Error(`Command failed (${code})`));
      res(data);
    });
  });
}

/** Quick counters update utilities */
export const counters = {
  mileage(unit: wialon.item.Unit, valueKm: number) {
    return new Promise<void>((res, rej) =>
      unit.updateMileageCounter(valueKm, (code) => (code ? rej(new Error(String(code))) : res()))
    );
  },
  engineHours(unit: wialon.item.Unit, valueHours: number) {
    return new Promise<void>((res, rej) =>
      unit.updateEngineHoursCounter(valueHours, (code) => (code ? rej(new Error(String(code))) : res()))
    );
  },
  traffic(unit: wialon.item.Unit, valueMb: number, resetReg = 0) {
    return new Promise<void>((res, rej) =>
      unit.updateTrafficCounter(valueMb, resetReg, (code) => (code ? rej(new Error(String(code))) : res()))
    );
  },
};

/** Build a message image URL (safe to drop into <img src>) */
export function messageImageUrl(unit: wialon.item.Unit, msgTimeSec: number, msgIndex: number, fsRel = "") {
  return unit.getMessageImageUrl(msgTimeSec, msgIndex, fsRel);
}

3) Task stream glue (src/services/wialonTasks.ts)

Listen once and fan out updates to your app’s event bus/state.

type TasksMap = Record<string | number, any>;

const Tasks = wialon.services.Tasks.getInstance();

/** Subscribe to task updates/deletes (idempotent per app lifecycle). */
export function onTasks(
  onUpdate: (tasks: TasksMap) => void,
  onDelete?: (deleted: TasksMap) => void
) {
  // Qooxdoo Emitter API: name, listener, ctx
  // @ts-ignore – SDK attaches on core object; typings are opaque here.
  Tasks.addListener("tasksUpdated", (e: any) => onUpdate(e.getData?.() ?? Tasks.getTasks()));
  // @ts-ignore
  Tasks.addListener("tasksDeleted", (e: any) => onDelete?.(e.getData?.() ?? {}));
}

/** Initial fetch into cache, then you’ll get live updates via messages. */
export function fetchTasksForUnits(unitIds: number[], fromSec: number, toSec: number) {
  return new Promise<TasksMap>((res, rej) => {
    Tasks.getRemoteTasksAsync({ itemIds: unitIds, timeFrom: fromSec, timeTo: toSec, loadCount: 1000 }, (err, data) =>
      err ? rej(new Error(String(err))) : res(data ?? {})
    );
  });
}

4) Notes & gotchas

Uploads: when passing file inputs to updateHwParams, ensure they’re real <input type="file"> elements (the SDK clones them internally). Multiple files are supported; the SDK chooses the Uploader path automatically if files are present.

JSONP/Script transports: you don’t need to call these directly; the SDK uses them under the hood for GIS and cross-domain scenarios. We typed only what your app touches.


#### PHASE 4


Below are tight TypeScript typings to append to your src/types/wialon.d.ts, plus a few helpers so you can use the new surfaces immediately.

1) Typings — append to wialon.d.ts
declare namespace wialon {
  namespace item {
    // ---- Icon mixin (MIcon) -------------------------------------------------
    interface MIcon {
      getIconUrl(size?: number): string;
      updateIcon(
        src: string | number | HTMLInputElement,
        cb?: (code: number, data?: any) => void
      ): any;
      updateIconLibrary(libId: number, path: string, cb?: (code: number) => void): void;
      canRotate(): boolean;
      getIconGroupId(): number;
      getIconCookie(): number | null;
      getIconUri(): string | null;
    }
    interface Item extends MIcon {} // mix it in onto items that use it

    // ---- Resource ------------------------------------------------------------
    class Resource extends Item {
      saveTachoData(
        driverCode: string,
        guid: string,
        outputFlag: number,
        cb?: (code: number, data?: any) => void
      ): void;
      getOrdersNotification(cb: (code: number, data?: any) => void): void;
      updateOrdersNotification(cfg: any, cb?: (code: number) => void): void;
      getEmailTemplate(cb: (code: number, data?: any) => void): void;
      updateEmailTemplate(subject: string, body: string, flags: number, cb?: (code: number) => void): void;

      static dataFlag: Record<string, number>;
      static accessFlag: Record<string, number>;
    }

    // ---- UnitGroup -----------------------------------------------------------
    class UnitGroup extends Item {
      getUnits(): number[];
      updateUnits(unitIds: number[], cb?: (code: number) => void): void;

      static checkUnit(group: UnitGroup, unit: Item): boolean;
      static logMessageAction: Record<string, string>;
    }

    // ---- Retranslator --------------------------------------------------------
    class Retranslator extends Item {
      getOperating(): boolean | null;
      getStopTime(): number | null;
      getConfig(): Record<string, any> | null;
      getUnits(): number[];

      updateOperating(
        operate: boolean | { callMode?: number; operate: boolean; timeFrom?: number; timeTo?: number },
        cb?: (code: number) => void
      ): void;
      updateOperatingWithTimeout(
        operate: boolean,
        deltaOrAbs: number,
        isAbs: boolean,
        cb?: (code: number) => void
      ): void;
      getStatistics(cb: (code: number, data?: any) => void): void;
      updateConfig(cfg: Record<string, any>, cb?: (code: number) => void): void;
      updateUnits(unitIds: number[], cb?: (code: number) => void): void;

      static dataFlag: Record<string, number>;
      static accessFlag: Record<string, number>;
    }

    // ---- Route ---------------------------------------------------------------
    type RouteCheckpoint = { x: number; y: number; [k: string]: any };
    class Route extends Item {
      getConfig(): Record<string, any> | null;
      getCheckPoints(): RouteCheckpoint[] | null;

      updateConfig(cfg: Record<string, any>, cb?: (code: number) => void): void;
      getNextRoundTime(scheduleId: number, from: number, to: number, cb: (code: number, data?: any) => void): void;
      loadRoundsHistory(from: number, to: number, fullJson: number, cb: (code: number, data?: any) => void): void;
      updateCheckPoints(points: RouteCheckpoint[], cb?: (code: number) => void): void;
      getRouteRounds(from: number, to: number, fullJson: number, cb: (code: number, data?: any) => void): void;

      static dataFlag: Record<string, number>;
      static accessFlag: Record<string, number>;
      static states: Record<string, number>;
      static routePointFlag: Record<string, number>;
      static scheduleFlag: Record<string, number>;
      static roundFlag: Record<string, number>;
    }

    // ---- Messages / Sensors mixins ------------------------------------------
    interface MUnitSensor {
      calculateSensorValue(sensor: any, msg?: any, last?: any): number | string;
      remoteCalculateLastMessage(sensorIds: any[], cb: (code: number, data?: any) => void): void;
      remoteCalculateMsgs(
        source: number, indexFrom: number, indexTo: number, sensorId: number,
        cb: (code: number, data?: any) => void
      ): void;
      remoteCalculateFilteredMsgs(
        source: number, indexFrom: number, indexTo: number, sensorId: number, width: number,
        cb: (code: number, data?: any) => void
      ): void;
      getValue(sensor: any, message: any): number | string;
    }
    interface Unit extends MUnitSensor {} // mix onto Unit

    interface MUnitTripDetector {
      getTripDetector(cb: (code: number, data?: any) => void): void;
      getTrips(timeFrom: number, timeTo: number, msgsSource: number, cb: (code: number, data?: any) => void): void;
      updateTripDetector(
        type: number,
        gpsCorrection: number,
        minSat: number,
        minMovingSpeed: number,
        minStayTime: number,
        maxMessagesDistance: number,
        minTripTime: number,
        minTripDistance: number,
        cb?: (code: number) => void
      ): void;
    }
    interface Unit extends MUnitTripDetector {}

    interface MUnitMessagesFilter {
      getMessagesFilter(cb: (code: number, data?: any) => void): void;
      updateMessagesFilter(
        enabled: boolean | Record<string, any>,
        skipInvalid?: number,
        minSats?: number,
        maxHdop?: number,
        maxSpeed?: number,
        lbsCorrection?: number,
        cb?: (code: number) => void
      ): void;
    }
    interface Unit extends MUnitMessagesFilter {}

    interface MUnitEventRegistrar {
      registryStatusEvent(date: number, description: string, params: any, cb?: (code: number) => void): void;
      registryInsuranceEvent(description: string, type: number, caseNum: string, cb?: (code: number) => void): void;
      registryCustomEvent(
        date: number, description: string, x: number, y: number, violation: number,
        cb?: (code: number) => void, extra?: { nt?: string; nct?: string }
      ): void;
      registryFuelFillingEvent(
        date: number, description: string, x: number, y: number, location: string,
        volume: number, cost: number, deviation: number, cb?: (code: number) => void
      ): void;
      registryMaintenanceEvent(
        date: number, description: string, x: number, y: number, location: string,
        info: string, duration: number, cost: number, mileage: number, eh: number,
        done_svcs: any, cb?: (code: number) => void
      ): void;
    }
    interface Unit extends MUnitEventRegistrar {}

    // ---- PluginsManager (binding helper; minimal) ----------------------------
    class PluginsManager {
      static bindPropItem(
        clazz: any,
        propName:
          | string
          | {
              propName: string;
              itemName: string;
              ajaxPath?: string;
              extAjaxPath?: string;
              preProcessPropObj?: (x: any) => any;
              preProcessUpdateCallObj?: (x: any) => any;
            },
        itemName?: string,
        ajaxPath?: string,
        extAjaxPath?: string
      ): void;
    }
  }

  // ---- Rendering -------------------------------------------------------------
  namespace render {
    class Layer {
      constructor(data: any);
      getName(): string;
      getBounds(): any;
      getEnabled(): boolean;
      setEnabled(v: boolean): void;
    }

    class MessagesLayer extends Layer {
      getUnitsCount(): number;
      getUnitId(index?: number): number;
      getMaxSpeed(index?: number): number;
      getMileage(index?: number): number;
      getMessagesCount(index?: number): number;
      getFirstPoint(index?: number): number;
      getLastPoint(index?: number): number;

      getMessageImageUrl(unitIdx: number, msgIdx: number, fsRel?: string): string;

      getMessages(
        arg:
          | { unitIndex?: number; indexFrom: number; indexTo: number; calcSensors?: number }
          | number,
        indexFrom?: number,
        indexTo?: number,
        cb?: (code: number, data?: any) => void
      ): void;

      deleteMessage(unitIdx: number, msgIdx: number, cb?: (code: number) => void): void;

      hitTest(
        arg:
          | { unitId: number; time: number; revert?: number; anyMsg?: number }
          | number,
        time?: number,
        revert?: number,
        cb?: (code: number, data?: any) => void
      ): void;
    }

    class Renderer extends qx.core.Object {
      getLayers(): Layer[];
      getReportLayer(): Layer | null;
      getTileUrl(x: number, y: number, z: number): string;

      setLocale(
        tzOffset: number,
        language: string,
        optsOrFlags?: number | { flags?: number; formatDate?: string } | ((...args: any[]) => void),
        cb?: (code: number) => void
      ): void;

      createMessagesLayer(
        params: any,
        cb: (code: number, layer?: MessagesLayer | null) => void
      ): void;
      createPoiLayer(
        name: string, pois: any[], flags: number,
        cb: (code: number, layer?: Layer | null) => void
      ): void;
      createZonesLayer(
        name: string, zones: any[], flags: number,
        cb: (code: number, layer?: Layer | null) => void
      ): void;

      removeLayer(layer: Layer, cb?: (code: number) => void): void;
      enableLayer(layer: Layer, enable: boolean, cb?: (code: number) => void): void;
      removeAllLayers(cb?: (code: number) => void): void;

      hitTest(
        lat: number, lon: number, scale: number, radius: number, layerName?: string,
        flagsOrCb?: number | ((code: number, data?: any) => void),
        cb?: (code: number, data?: any) => void
      ): void;

      createZoneByTrack(params: any, cb?: (code: number, data?: any) => void): void;

      // Flags
      static PoiFlag: Record<string, number>;
      static Hittest: Record<string, number>;
      static ZonesFlag: Record<string, number>;
      static MarkerFlag: Record<string, number>;
      static OptionalFlag: Record<string, number>;
    }
  }

  // ---- Messages loader -------------------------------------------------------
  namespace core {
    class MessagesLoader {
      loadInterval(
        itemId: number, from: number, to: number,
        flags: number, flagsMask: number, loadCount: number,
        cb: (code: number, data?: any) => void
      ): void;

      loadLast(
        itemId: number, lastTime: number, lastCount: number,
        flags: number, flagsMask: number, loadCount: number,
        cb: (code: number, data?: any) => void
      ): void;

      unload(cb: (code: number) => void): void;

      getMessages(indexFrom: number, indexTo: number, cb: (code: number, data?: any) => void): void;

      getMessageFile(msgIndex: number, fileName: string): string;

      deleteMessage(msgIndex: number, cb: (code: number) => void): void;

      getPackedMessages(
        itemId: number, from: number, to: number, filtrationFlags: number,
        cb: (code: number, data?: any) => void
      ): void;

      static packedFiltration: { sats: number };
    }
  }

  // ---- Utils: Sensors / RPN / String (minimal surfaces) ---------------------
  namespace util {
    class Rpn extends qx.core.Object {
      constructor(opts?: { skipOperators?: string[] });
      convert(expr: string): string | null;
      parse(postfix: string): number;
      mathregexp: RegExp;
    }

    class Sensors {
      static isAvailable: 0 | 1;
      static debug: 0 | 1;
      /** Returns the computed value (string/number) or null on error. */
      static calculate(
        expr: string,
        get?: (ctx: { expression: string; math: RegExpMatchArray | null; isSensorParam?: boolean }) => any
      ): any;
    }

    class String {
      static sprintf(fmt: string, ...args: any[]): string;
      static isValidEmail(email: string): boolean;
      static isValidPhone(phone: string): boolean;
      static strspn(haystack: string, charlist: string): number;
    }
  }
}

2) Quick helpers you can drop in
a) Icons
export function setUnitIconFromUrl(unit: wialon.item.Unit, url: string) {
  return new Promise<void>((res, rej) =>
    unit.updateIcon(url, (code) => (code ? rej(new Error(String(code))) : res()))
  );
}
export const unitIcon32 = (unit: wialon.item.Unit) => unit.getIconUrl(32);

b) Renderer bootstrap (POIs + messages)
export function buildRenderer() {
  const r = new wialon.render.Renderer();
  r.setLocale(0, "en", { flags: 0 }); // UTC, english
  return r;
}

export function renderPois(r: wialon.render.Renderer, name: string, pois: any[]) {
  return new Promise<wialon.render.Layer | null>((res, rej) =>
    r.createPoiLayer(name, pois, wialon.render.Renderer.PoiFlag.renderLabels, (code, layer) =>
      code ? rej(new Error(String(code))) : res(layer ?? null)
    )
  );
}

export function renderUnitTrack(r: wialon.render.Renderer, params: any) {
  return new Promise<wialon.render.MessagesLayer | null>((res, rej) =>
    r.createMessagesLayer(params, (code, layer) =>
      code ? rej(new Error(String(code))) : res((layer as any) ?? null)
    )
  );
}

c) Messages loader
export function loadUnitMessagesInterval(
  unitId: number, from: number, to: number, flags: number, flagsMask = 0, loadCount = 10000
) {
  const ml = new wialon.core.MessagesLoader();
  return new Promise<any>((res, rej) =>
    ml.loadInterval(unitId, from, to, flags, flagsMask, loadCount, (code, data) =>
      code ? rej(new Error(String(code))) : res(data)
    )
  );
}

d) Sensor calculation (safe wrapper)
/** Returns number/string; throws if invalid. */
export function calcSensorValue(unit: wialon.item.Unit, sensor: any, msg: any) {
  const v = unit.calculateSensorValue(sensor, msg);
  if (v === (wialon.item as any).MUnitSensor.invalidValue) {
    throw new Error("Invalid sensor value");
  }
  return v;
}

e) Unit messages filter
export function enableStrictMsgFilter(unit: wialon.item.Unit) {
  return new Promise<void>((res, rej) =>
    unit.updateMessagesFilter(
      { enabled: 1, skipInvalid: 1, minSats: 4, maxHdop: 3, maxSpeed: 300, lbsCorrection: 0 },
      (code) => (code ? rej(new Error(String(code))) : res())
    )
  );
}


### PHASE 5

Below are TypeScript typings to append to your wialon.d.ts, plus a few ready-to-use helpers.

Typings — append to wialon.d.ts
declare namespace wialon {
  namespace item {
    // -------- Unit: Report settings ------------------------------------------
    interface MUnitReportSettings {
      getReportSettings(cb: (code: number, data?: any) => void): void;
      updateReportSettings(params: any, cb?: (code: number) => void): void;
    }
    interface Unit extends MUnitReportSettings {}

    // -------- Unit: DriveRank + accelerometers -------------------------------
    interface MUnitDriveRankSettings {
      getDriveRankSettings(cb: (code: number, data?: any) => void): void;
      updateDriveRankSettings(driveRank: any, cb?: (code: number) => void): void;
      getAccelerometersCalibration(cb: (code: number, data?: any) => void): void;
      updateAccelerometersCalibration(timeFrom: number, timeTo: number, cb?: (code: number) => void): void;
      resetAccelerometersCalibration(cb?: (code: number) => void): void;
    }
    interface Unit extends MUnitDriveRankSettings {}

    // -------- Unit: Fuel settings --------------------------------------------
    interface MUnitFuelSettings {
      getFuelSettings(cb: (code: number, data?: any) => void): void;
      updateFuelCalcTypes(calcTypes: number, cb?: (code: number) => void): void;

      updateFuelLevelParams(
        params:
          | {
              flags: number;
              ignoreStayTimeout: number;
              minFillingVolume: number;
              minTheftTimeout: number;
              minTheftVolume: number;
              filterQuality: number;
              fillingsJoinInterval?: number;
              theftsJoinInterval?: number;
              extraFillingTimeout?: number;
            }
          | number, // flags
        ignoreStayTimeout?: number,
        minFillingVolume?: number,
        minTheftTimeout?: number,
        minTheftVolume?: number,
        filterQuality?: number,
        fillingsJoinInterval?: number,
        theftsJoinInterval?: number,
        cb?: (code: number) => void
      ): void;

      updateFuelConsMath(
        params:
          | { idling: number; urban: number; suburban: number }
          | number, // idling
        urban?: number,
        suburban?: number,
        _unused?: any,
        cb?: (code: number) => void
      ): void;

      updateFuelConsRates(
        idlingSummer: number,
        idlingWinter: number,
        consSummer: number,
        consWinter: number,
        winterMonthFrom: number,
        winterDayFrom: number,
        winterMonthTo: number,
        winterDayTo: number,
        cb?: (code: number) => void
      ): void;

      updateFuelConsImpulse(maxImpulses: number, skipZero: number, cb?: (code: number) => void): void;
    }
    interface Unit extends MUnitFuelSettings {}
    namespace MUnitFuelSettings {
      const fuelCalcType: {
        math: number; levelSensors: number; levelSensorsMath: number; absConsSensors: number;
        impConsSensors: number; instConsSensors: number; rates: number;
      };
      const fuelLevelFlag: {
        mergeSensors: number; smoothData: number; splitConsSensors: number; requireStay: number; calcByTime: number;
        calcFillingsByRaw: number; calcTheftsByRaw: number; detectTheftsInMotion: number; calcFillingsByTime: number;
        calcTheftsByTime: number; calcConsumptionByTime: number;
      };
    }

    // -------- Zones (images) -------------------------------------------------
    interface MZone {
      getZoneImageUrl(zone: { icon?: string }, size?: number): string;
      setZoneImage(
        zone: { id: number },
        src:
          | string                // url
          | null
          | { resId: number; zoneId: number } // reuse
          | File,                 // upload
        cb?: (code: number) => void
      ): any;
    }
    namespace MZone {
      const flags: { area: number; perimeter: number; boundary: number; points: number; base: number };
    }

    // -------- Driver/Trailer bindings & media --------------------------------
    interface MDriver {
      getDriverUnits(): number[] | null;
      getTrailerUnits(): number[] | null;

      updateDriverUnits(unitIds: number[], cb?: (code: number) => void): void;
      updateTrailerUnits(unitIds: number[], cb?: (code: number) => void): void;

      getDriverImageUrl(driver: { id: number; ck: number }, size?: number): string;
      getTrailerImageUrl(trailer: { id: number; ck: number }, size?: number): string;

      setDriverImage(
        driver: { id: number },
        src: File | { resId: number; drvId: number },
        cb?: (code: number) => void
      ): any;
      setTrailerImage(
        trailer: { id: number },
        src: File | { resId: number; trId: number },
        cb?: (code: number) => void
      ): any;

      bindDriverToUnit(driver: { id: number } | null, unit: Item | null, time: number, mode: number, cb?: (code: number) => void): void;
      bindTrailerToUnit(trailer: { id: number } | null, unit: Item | null, time: number, mode: number, cb?: (code: number) => void): void;

      registerDriverAction(params: {
        driver?: { id: number }; unit?: Item; time: number; action: number; timeTo?: number; ignoreState?: number;
      }, cb?: (code: number) => void): void;
      cleanupDriverAction(params: { driver?: { id: number } | null; timeFrom: number; timeTo: number; action?: number }, cb?: (code: number) => void): void;

      getDriverActions(params: { driver?: { id: number } | null; timeFrom: number; timeTo: number }, cb: (code: number, data?: any) => void): void;
      cleanupDriverInterval(driver: { id?: number } | null, from: number, to: number, cb?: (code: number) => void): void;
      cleanupTrailerInterval(trailer: { id?: number } | null, from: number, to: number, cb?: (code: number) => void): void;

      getDriverBindings(unit: Item | null, driver: { id?: number } | null, from: number, to: number, cb: (code: number, data?: any) => void): void;
      getTrailerBindings(unit: Item | null, trailer: { id?: number } | null, from: number, to: number, cb: (code: number, data?: any) => void): void;

      registerChatMessage(driver: { id: number }, message: string, cb?: (code: number) => void): void;
      getChatHistory(driver: { id: number }, from: number, to: number, cb?: (code: number, data?: any) => void): void;
    }
    interface Resource extends MDriver {}
    namespace MDriver {
      const flags: { driver: number; trailer: number; assignmentRestriction: number };
    }

    // -------- Account mgmt ---------------------------------------------------
    interface MAccount {
      getAccountData(typeOrCb?: number | ((code: number, data?: any) => void), cb?: (code: number, data?: any) => void): void;
      getAccountHistory(days: number, tz: number, cb: (code: number, data?: any) => void): void;
      updateDealerRights(enable: number, cb?: (code: number) => void): void;
      updatePlan(plan: any, cb?: (code: number) => void): void;
      updateFlags(flags: number | { flags: number; blockBalance?: number; denyBalance?: number }, cb?: (code: number) => void): void;
      updateMinDays(minDays: number, cb?: (code: number) => void): void;
      updateHistoryPeriod(historyPeriod: number, cb?: (code: number) => void): void;
      updateBillingService(name: string, type: number, intervalType: number, costTable: any, cb?: (code: number) => void): void;
      enableAccount(enable: number, cb?: (code: number) => void): void;
      updateSubPlans(plans: any, cb?: (code: number) => void): void;
      doPayment(balanceUpdate: number, daysUpdate: number, description: string, cb?: (code: number) => void): void;
      createAccount(plan: any, cb?: (code: number) => void): void;
      deleteAccount(optsOrCb?: any | ((code: number) => void), cb?: (code: number) => void): void;
      getBillingPlans(cb: (code: number, data?: any) => void): void;
      updateBillingPlan(callMode: number, plan: any, cb?: (code: number) => void): void;
      updateBusinessSphere(sph: string, cb?: (code: number) => void): void;
      updateDriverFlags(flags: number, cb?: (code: number) => void): void;

      getBusinessSphere(): string | null;
      getFleetio(): any | null;
      getDriverFlags(): number;
    }
    interface Resource extends MAccount {}
    namespace MAccount {
      const billingPlanFlag: Record<string, number>;
      const billingIntervalType: Record<string, number>;
      const billingServiceType: Record<string, number>;
      const driverFlags: { enabled: number; canControl: number; logSwitching: number };
    }

    // -------- Reports (exec/apply/cleanup) -----------------------------------
    interface MReport {
      execReport(
        report:
          | { // full form
              report: { id?: number; [k: string]: any };
              objectId?: number;
              objectSecondaryId?: number;
              additionalObjectsIds?: (number | string)[];
              interval?: any;
              remoteExec?: 0 | 1;
            }
          | { id?: number; [k: string]: any }, // legacy: report object (with id)
        objectId?: number,
        objectSecondaryId?: number,
        interval?: any,
        cb?: (code: number, res?: wialon.report.ReportResult | any) => void
      ): void;

      getReportStatus(cb: (code: number, data?: any) => void): void;
      abortReport(cb?: (code: number) => void): void;
      applyReportResult(cb: (code: number, res?: wialon.report.ReportResult | any) => void): void;
      cleanupResult(cb?: (code: number) => void): void;
    }
    interface Resource extends MReport {}

    // -------- Unit events (trips/ignition/sensors) ---------------------------
    interface MUnitEvents {
      getTripsHistory(ivalType: number, from: number, to: number, diffOnly: number, cb: (code: number, data?: any) => void): void;
      getCurrentTrip(filter1: number, cb: (code: number, data?: any) => void): void;
      updateTripsData(params: any, ivalType: number, from: number, to: number, cb: (code: number) => void): void;
      resetTrips(hard: boolean, cb?: (code: number) => void): void;

      getIgnitionHistory(ivalType: number, from: number, to: number, diffOnly: number, filter1: number, filter2: string, cb: (code: number, data?: any) => void): void;
      getCurrentIgnition(filter1: number, filter2: number, diffOnly: number, cb: (code: number, data?: any) => void): void;
      updateIgnitionData(params: any, ivalType: number, from: number, to: number, cb: (code: number) => void): void;
      resetIgnition(hard: boolean, cb?: (code: number) => void): void;

      getSensorsHistory(ivalType: number, from: number, to: number, diffOnly: number, filter1: number, filter2: string, cb: (code: number, data?: any) => void): void;
      getCurrentSensors(filter1: number, filter2: number, diffOnly: number, cb: (code: number, data?: any) => void): void;
      updateSensorsData(params: any, ivalType: number, from: number, to: number, cb: (code: number) => void): void;
      resetSensors(hard: boolean, cb?: (code: number) => void): void;
    }
    interface Unit extends MUnitEvents {}

    // -------- Orders + Routes -------------------------------------------------
    interface MOrder {
      getOrderAttachments(order: { id: number }, cb: (code: number, data?: any) => void): void;
      attachToOrder(order: { id: number }, file: File, cb?: (code: number) => void): void;
      rejectOrder(order: { id: number }, cb?: (code: number) => void): void;
      confirmOrder(order: { id: number }, cb?: (code: number) => void): void;
      detachFromOrder(order: { id: number }, path: string, cb?: (code: number) => void): void;
      getOrderAttachment(order: { id: number }, path: string): string;
      assignUnitToOrder(order: { id: number }, unitId: number, cb?: (code: number) => void): void;
      moveOrderToHistory(order: { id: number }, cb?: (code: number) => void): void;

      remoteOptimizeOrderDelivery(
        orders: any[],
        unitsOrCount: number[] | number,
        flags: number,
        gis: number | { addPoints?: number },
        cb: (code: number, data?: any) => void
      ): void;

      remoteCompleteOrdersFromHistory(orders: any[], cb: (code: number, data?: any) => void): void;
      routeUpdate(orders: any[], routeId: number, callMode: string, cb: (code: number, data?: any) => void): void;
    }
    interface Resource extends MOrder {}
    namespace MOrder {
      const status: { inactive: number; active: number; completedInTime: number; completedOverdue: number; canceled: number };
      const trackingFlag: { stopRequired: number };
      const statusFlag: { rejected: number };
    }

    interface MOrderRoute {
      registerOrderRoute(payload: any, cb?: (code: number, data?: any) => void): void;
    }
    interface Resource extends MOrderRoute {}
    namespace MOrderRoute {
      const statusMask: number;
      const status: { notStarted: number; started: number; completed: number; cancelled: number };
      const statusFlagsMask: number;
      const statusFlag: { expired: number };
      const trackingFlag: { strict: number; fixed: number };
    }

    // -------- Tags ------------------------------------------------------------
    interface MTag {
      getTagUnits(): number[] | null;
      updateTagUnits(unitIds: number[], cb?: (code: number) => void): void;

      getTagImageUrl(tag: { id: number; ck: number }, size?: number): string;
      setTagImage(tag: { id: number }, src: File | { resId: number; tagId: number }, cb?: (code: number) => void): any;

      bindTagToUnit(tag: { id: number } | null, unit: Item | null, time: number, mode: number, cb?: (code: number) => void): void;
      getTagBindings(unit: Item | null, tag: { id?: number } | null, from: number, to: number, cb: (code: number, data?: any) => void): void;

      registerChatMessage(driver: { id: number }, message: string, cb?: (code: number) => void): void;
    }
    interface Resource extends MTag {}
    namespace MTag {
      const flags: { Passenger: number };
    }
  }

  // -------- Report result class ----------------------------------------------
  namespace report {
    class ReportResult extends qx.core.Object {
      constructor(raw: any);
      getTables(): any[];
      isRendered(): boolean;
      isEmpty(): boolean;

      getTableRows(tableIndex: number, indexFrom: number, indexTo: number, cb: (code: number, data?: any) => void): void;
      getRowDetail(tableIndex: number, rowIndex: number, cb: (code: number, data?: any) => void): void;
      selectRows(tableIndex: number, config: any, cb: (code: number, data?: any) => void): void;

      renderJSON(attachmentIndex: number, width: number, useCrop: number, cropBegin: number, cropEnd: number, cb: (code: number, data?: any) => void): void;

      getMessages(indexFrom: number, indexTo: number, cb: (code: number, data?: any) => void): void;
      getUnitMessages(opts: { index: number; indexFrom: number; indexTo: number }, cb: (code: number, data?: any) => void): void;

      getStatistics(): any[];
      getAttachments(): any[];

      getChartUrl(attachmentIndex: number, action: number, width: number, height: number, autoScaleY: number, pixelFrom: number, pixelTo: number, flags?: number): string;
      hitTestChart(
        opts:
          | { attachmentIndex: number; datasetIndex: number; valueX: number; valueY?: number; flags?: number; cropBegin?: number; cropEnd?: number }
          | number,
        datasetIndex?: number,
        valueX?: number,
        valueY?: number,
        flags?: number,
        cropBegin?: number,
        cropEnd?: number,
        cb?: (code: number, data?: any) => void
      ): void;

      getExportUrl(format: number, params: any): string;
      getMapUrl(width: number, height: number): string;
      getPhotoUrl(attachmentIndex: number, border: number, type?: number): string;
      getVideoUrl(attachmentIndex: number, cb: (code: number, data?: any) => void): void;

      getLayerData(): any;
      setLayer(layer: any): void;
    }
    namespace ReportResult {
      const chartFlag: Record<string, number>;
      const exportFormat: Record<string, number>;
    }
  }

  // -------- Apps API ----------------------------------------------------------
  namespace util {
    class Apps {
      static createApplication(
        name: string,
        description: string,
        url: string,
        flags: number,
        langs: string[],
        sortOrder: number,
        requiredServicesList: string[],
        billingPlans: any[],
        cb?: (code: number, data?: any) => void
      ): void;

      static updateApplication(
        id: number,
        name: string,
        description: string,
        url: string,
        flags: number,
        langs: string[],
        sortOrder: number,
        requiredServicesList: string[],
        billingPlans: any[],
        cb?: (code: number, data?: any) => void
      ): void;

      static deleteApplication(id: number, cb?: (code: number) => void): void;

      static getApplications(manageMode: number, filterLang: string, cb: (code: number, data?: any) => void): void;

      static remoteCheckTopService(cb: (code: number, data?: any) => void): void;

      static urlFlags: Record<string, number>;
      static appTypes: Record<string, number>;
    }
  }

  // -------- Agro mixins -------------------------------------------------------
  namespace agro {
    interface MAgro {
      loadAgroLibrary(kind: "plots" | "plotGroups" | "machines" | "equipments" | "cultivationTypes" | "crops" | "fuelRates" | "agroUnit"): boolean;
      logMessageAction: Record<string, string>;
    }
    interface MFuelRates {
      getFuelRates(cb: (code: number, data?: any) => void): void;
      updateFuelRates(rates: any, cb?: (code: number) => void): void;
    }
    interface MAgroUnit {
      getAgroProps(cb: (code: number, data?: any) => void): void;
      updateAgroProps(props: any, cb?: (code: number) => void): void;
    }

    interface Resource extends MAgro, MFuelRates {}
    interface Unit extends MAgroUnit {}
  }

  // -------- DataFlags helper --------------------------------------------------
  namespace util {
    interface MDataFlagsHelper {
      startBatch(): 0 | 1;
      finishBatch(cb?: (code?: number) => void): void;

      addItems(owner: string, spec: any, cb?: (code: number) => void): void;
      removeItems(owner: string, spec: any, cb?: (code: number) => void): void;

      getItemsByOwner(owner: string, type?: string): wialon.item.Item[];
      getItemByOwner(owner: string, id: string): wialon.item.Item | null;
      getItemDataFlags(owner: string, id: string): number;

      startNewItemsChecking(filter?: Record<string, 1>): void;
      stopNewItemsChecking(): void;

      startItemsCreationChecking(type: string): void;
      finishItemsCreationChecking(type: string): void;
      findNewItems(type?: string, skipEvent?: boolean, startNow?: boolean, cb?: (err?: any) => void): void;
    }
  }

  // -------- File storage ------------------------------------------------------
  namespace util {
    class File {
      static fileStorageType: { publicType: number; protectedType: number };
      static getFileURL(itemId: number, path: string, flags?: number): string;

      static listFiles(
        itemId: number, path: string, mask: string, flags: number,
        cb: (code: number, files?: any) => void
      ): void;

      static rm(itemId: number, path: string, flags: number, cb?: (code: number) => void): void;

      static putFiles(
        itemId: number, path: string, files: File[], progressCb?: (p: any) => void,
        flags?: number, cb?: (code: number, res?: any) => void
      ): void;

      static readFile(itemId: number, path: string, flags: number, cb: (code: number, data?: any) => void): void;

      static writeFile(itemId: number, path: string, flags: number, fileData: string, cb?: (code: number) => void): void;
    }
  }
}

Handy helpers
// Run a report template by id on a unit for last 24h
export function runUnitReport(resource: wialon.item.Resource, tplId: number, unitId: number) {
  const now = Math.floor(Date.now() / 1000);
  const interval = { from: now - 86400, to: now, flags: 0 };
  return new Promise<wialon.report.ReportResult>((res, rej) =>
    resource.execReport(
      { report: { id: tplId }, objectId: unitId, interval },
      (code, rr) => (code ? rej(new Error(String(code))) : res(rr as wialon.report.ReportResult))
    )
  );
}

// Toggle strict fuel level detection on a unit
export function setStrictFuelLevel(unit: wialon.item.Unit) {
  const F = (wialon.item as any).MUnitFuelSettings.fuelLevelFlag;
  return new Promise<void>((res, rej) =>
    unit.updateFuelLevelParams(
      {
        flags: F.requireStay | F.smoothData | F.mergeSensors,
        ignoreStayTimeout: 0,
        minFillingVolume: 10,
        minTheftTimeout: 600,
        minTheftVolume: 5,
        filterQuality: 3,
        fillingsJoinInterval: 300,
        theftsJoinInterval: 300
      },
      (code: number) => (code ? rej(new Error(String(code))) : res())
    )
  );
}

// Quick file upload to resource's protected storage
export function uploadResourceFile(res: wialon.item.Resource, path: string, file: File) {
  return new Promise<void>((resolve, reject) =>
    wialon.util.File.putFiles(
      res.getId(),
      path,
      [file],
      undefined,
      wialon.util.File.fileStorageType.protectedType,
      (code: number) => (code ? reject(new Error(String(code))) : resolve())
    )
  );
}


### PHASE 6


Below are TypeScript typings you can append to your wialon.d.ts (kept concise but complete for the APIs you posted).

declare namespace wialon {
  // ===================== util ======================
  namespace util {
    // ---- Routing -------------------------------------------------------------
    class Routing {
      /** Optimize a courier route using path matrix and optional schedules. */
      static remoteOptimizeCourierRoute(
        pathMatrix: number[][],                          // NxN travel times/distances
        pointSchedules: any[] | null,                    // per-point windows etc.
        flags: number,                                   // combine remoteOptimizeFlag
        cb?: (code: number, data?: any) => void
      ): void;

      static remoteOptimizeFlag: {
        fitSchedule: number;
        optimizeDuration: number;
        optimizeTime: number;
        fixFirstPoint: number;
        fixLastPoint: number;
      };
    }

    // ---- Geometry ------------------------------------------------------------
    class Geometry {
      static getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number; // meters
      static getCoordDegrees(val: number, ...rest: any[]): string;
      static getCoordMinutes(
        value: number,
        widthMode: 2 | 3,
        decimals: number,
        posLetter: string,
        negLetter: string,
        degSuffix?: string
      ): string;
      static getCoord(...args: any[]): string;

      /** Distance from (lat,lon) to line A(lat1,lon1)–B(lat2,lon2). If clamp && outside: returns -1. */
      static getDistanceToLine(
        lat1: number, lon1: number,
        lat2: number, lon2: number,
        lat: number, lon: number,
        clampToSegment?: boolean
      ): number;

      /** Point-in-shape test; supports polygon (tolerance=0), polyline/point with tolerance (meters). */
      static pointInShape(
        shape: Array<{x:number; y:number; w?:number; radius?:number}>,
        toleranceMeters: number,
        x: number, y: number,
        bbox?: {min_y:number; min_x:number; max_y:number; max_x:number}
      ): boolean;

      static getShapeCenter(points: Array<{x:number;y:number}>): {x:number;y:number};

      static calculatePolygon(
        points: Array<{x:number;y:number}>,
        flags: number,
        cb: (code: number, data?: any) => void
      ): void;

      static calculatePolyline(
        points: Array<{x:number;y:number}>,
        flags: number,
        width: number,
        cb: (code: number, data?: any) => void
      ): void;

      static calculateBoundary(points: Array<{x:number;y:number;w?:number}>): {
        min_y:number; min_x:number; max_y:number; max_x:number;
      };
    }

    // ---- GIS (geocode/search/routing) ---------------------------------------
    class Gis {
      static geocodingFlags: {
        level_countries: number; level_regions: number; level_cities: number;
        level_streets: number; level_houses: number;
      };
      static searchFlags: {
        search_countries: number; search_regions: number; search_cities: number;
        search_streets: number; search_houses: number;
        search_full_path: number; search_map_name: number; search_coords: number;
      };
      static searchByStringFlags: {
        search_countries: number; search_regions: number; search_cities: number;
        search_streets: number; search_houses: number;
      };
      static geocodingParams: {
        flags: number; city_radius: number; dist_from_unit: number; txt_dist: string; house_detect_radius: number;
      };
      static routingFlags: { CH: number };
      static routingViaWaypointsFlags: { detailed_information_by_section: number };

      static decodePoly(encoded: string): Array<{lat:number; lon:number}>;

      static getRoute(
        lat1: number, lon1: number, lat2: number, lon2: number,
        flags?: number,
        cb?: (code: number, data?: any) => void
      ): void;

      static getRouteBetween(
        opts: {
          origin: {lat:number; lon:number};
          destination: {lat:number; lon:number};
          waypoints?: Array<{lat:number; lon:number}>;
          flags?: number;
          params?: any;
          searchProvider?: string;
        },
        cb?: (code: number, data?: any) => void
      ): void;

      static getRouteViaWaypoints(
        origin: {lat:number; lon:number},
        destination: {lat:number; lon:number},
        waypoints: Array<{lat:number; lon:number}>,
        cb: (code: number, data?: any) => void,
        flags?: number
      ): void;

      static getManyToManyRoute(points: Array<{lat:number; lon:number}>, cb: (code:number, data?:any)=>void): void;
      static manyToManyRouting(opts: {points: Array<{lat:number; lon:number}>; searchProvider?: string}, cb: (code:number, data?:any)=>void): void;

      static getOneToManyRoute(
        lat: number, lon: number,
        points: Array<{lat:number; lon:number}>,
        cb: (code: number, data?: any) => void
      ): void;

      static getLevelFlags(topLevel: 1|2|3|4|5, c?: number, r?: number, city?: number, street?: number): number;

      static getLocations(positions: Array<{lat:number; lon:number}>, cb: (code:number, data?:any)=>void): void;
      static pointsToAddresses(
        opts: {positions: Array<{lat:number; lon:number}>; lang?: string; searchProvider?: string; log?: any},
        cb: (code:number, data?:any)=>void
      ): void;

      static searchByString(
        phraseOrOpts:
          | { phrase: string; flags?: number; count: number; allow_irrelevant?: number; lang?: string; searchProvider?: string }
          | string,
        flagsOrCb?: number | ((code:number, data?:any)=>void),
        count?: number,
        allow_irrelevant?: number,
        cb?: (code:number, data?:any)=>void
      ): void;

      static addressToPoints(
        opts: { phrase: string; flags?: number; count: number; allow_irrelevant?: number; lang?: string; searchProvider?: string },
        cb: (code:number, data?:any)=>void
      ): void;

      static searchByStringArray(
        phrasesOrOpts:
          | { phrases: string[]; flags?: number; count: number; allow_irrelevant?: number; searchProvider?: string }
          | string[],
        flagsOrCb?: number | ((code:number, data?:any)=>void),
        count?: number,
        allow_irrelevant?: number,
        cb?: (code:number, data?:any)=>void
      ): void;

      static search(
        country: string, region: string, city: string, street: string,
        flags: number, count: number,
        cb: (code:number, data?:any)=>void
      ): void;

      static copyright(
        lat1:number, lon1:number, lat2:number, lon2:number, zoom:number,
        cb: (code:number, data?:any)=>void
      ): void;

      static checkPointForObject(
        lat:number, lon:number,
        country:string, region:string, city:string, street:string, house:string, radius:number,
        cb:(code:number, data?:any)=>void
      ): void;
    }

    // ---- File exchange/import/export ----------------------------------------
    class Exchange {
      static msgExportFormat: { plt: 'plt'; nmea: 'txt'; kml: 'kml'; wln: 'wln'; wlb: 'wlb' };

      static getJsonExportUrl(json: any, fileName?: string): string;
      static importJson(files: File[], cb?: (res: any) => void): void;
      static importXml(files: File[], cb?: (res: any) => void): void;
      static importCsv(files: File[], separator?: string | ((res:any)=>void), cb?: (res:any)=>void): void;

      static getMessagesExportUrl(layerName: string, format: string, compress?: number): string;
      static getPOIsExportUrl(fileName: string, pois: number[], compress?: number): string;
      static getZonesExportUrl(fileName: string, zones: number[], compress?: number): string;

      static importPois(itemId: number, pois: any, cb?: (code:number, data?:any)=>void): void;
      static importZones(itemId: number, zones: any, cb?: (code:number, data?:any)=>void): void;

      static getItemJson(id: number, cb: (data:any)=>void): void;

      static uploadTachoFile(files: File[], outputFlag: number, cb?: (res:any)=>void): void;
    }

    // ---- Trash bin -----------------------------------------------------------
    class Trash {
      static getDeletedItems(cb: (code:number, data?: any)=>void): void;
      static restoreDeletedItems(opts: { guids: string[] }, cb?: (code:number)=>void): void;
    }

    // ---- DateTime ------------------------------------------------------------
    class DateTime {
      /** Formats server/user time (seconds) to string; auto-time-only if same day when `shortMode` truthy (1 or 2). */
      static formatTime(sec: number, shortMode?: 0|1|2, fmt?: string): string;
      static formatDate(sec: number, fmt?: string): string;

      /** Duration in seconds -> string by pattern (e.g., "H:m:s"). */
      static formatDuration(sec: number, pattern?: string): string;

      static getAbsoluteDaysDuration(sec: number): number;
      static getPluralForm(days: number, forms?: [string,string,string]): string;
      static getAbsoluteHoursDuration(sec: number): number;
      static getRelativeHoursDuration(sec: number): number;
      static getAbsoluteMinutesDuration(sec: number): number;
      static getRelativeMinutesDuration(sec: number): number;
      static getAbsoluteSecondsDuration(sec: number): number;
      static getRelativeSecondsDuration(sec: number): number;

      static persianFormatTime(sec: number): string;

      static setLocale(days: string[], months: string[], daysAbbrev: string[], monthsAbbrev: string[], daysPlural: [string,string,string]): void;

      /** Convert between .NET-like and % tokens; if reverse=true, % -> .NET-like. */
      static convertFormat(fmt: string, reverse?: boolean): string;

      /** Returns user tz seconds offset (includes DST), stored in user prop "tz" if set. */
      static getTimezone(): number;
      static getTimezoneOffset(): number;
      static getDSTOffset(ts: number): number;

      static isLeapYear(year: number): boolean;
      static getWdayTime(
        year:number, month:number, weekIdx:number, wday:number,
        date?:number, hour?:number, min?:number, sec?:number, prevDays?:number
      ): number;
      static getMonthDays(month:number, year:number): number;
      static getYearDays(year:number): number;

      /** Server->user seconds. */
      static userTime(sec: number): number;
      /** User->server seconds. */
      static absoluteTime(sec: number): number;

      /** Packs weekday and flags into a bitmask for intervals. */
      static calculateFlags(flags: number, weekStart: 1|2|3|4|5|6|7): number;

      /** Builds absolute interval {from,to} from base, length and flags (see MReport.intervalFlag). */
      static calculateInterval(from: number, toOrLen: number, flags: number): { from:number; to:number };
    }
  }

  // ===================== agro ======================
  namespace agro {
    class Helper {
      static getPlotsInPoint(spec: any, cb: (code:number, data?:any)=>void): void;

      /** Fetch cultivations and render as layer; returns {layer, cultivation} in cb. */
      static getCultivations(
        plotItemId: number, plotId: number, timeFrom: number, timeTo: number,
        layerName?: string, paintingScheme?: any,
        cb?: (code:number, data?: {layer?: any; cultivation?: any}) => void
      ): void;

      static getCultivationsList(plotItemId:number, plotId:number, timeFrom:number, timeTo:number, cb:(code:number, data?:any)=>void): void;

      static uploadCultivation(files: File[], tzOffset: number, color: number, cb?: (code:number, data?:any)=>void): void;
      static updateCultivationLayer(time:number, action:number, color:number, cb?:(code:number, data?:any)=>void): void;

      static uploadUnitCultivation(
        unitId:number, from:number, to:number,
        switchSensorId:number, widthSensorId:number, flags:number,
        tzOffset:number, color:number, defaultWidth:number,
        plotItemId?:number, plotId?:number, withinPlot?:boolean,
        filter?: any,
        cb?: (code:number, data?: {layer?: any; registrar?: any[]}) => void
      ): void;

      static uploadPlot(files: File[], tzOffset:number, cb?:(code:number, data?:any)=>void): void;
      static uploadUnitPlot(unitId:number, from:number, to:number, switchSensorId:number, cb?:(code:number, data?:any)=>void): void;

      static clearUploadedCultivation(cb?: (code:number, data?: any)=>void): void;

      static registerUploadedCultivation(
        plotItemId:number, plotId:number,
        ctypeItemId:number, ctypeId:number,
        machineItemId:number, machineId:number,
        equipItemId:number, equipId:number,
        description:string, timeFrom:number, timeTo:number,
        unitId:number, fuelFlags:number,
        cb?: (code:number)=>void
      ): void;

      static registerUnitCultivation(
        plotItemId:number, plotId:number,
        ctypeItemId:number, ctypeId:number,
        machineItemId:number, machineId:number,
        equipItemId:number, equipId:number,
        description:string, timeFrom:number, timeTo:number,
        tzOffset:number, unitId:number, filter:any,
        cb?: (code:number)=>void
      ): void;

      static createPlotsLayer(layerName:string, plots:any[], flags:number, cb?:(code:number, layer?: any)=>void): void;

      static getPrintUrl(params:
        | {
            fileType: number; isPlotGroup: number; plots: any[];
            imageFlags: number; plotFlags: number;
            mapScale?: number; font?: string; fontSize?: number; fontColor?: string; lang?: string;
          }
        | number, // fileType
        isPlotGroup?: number, plots?: any[], imageFlags?: number, plotFlags?: number,
        mapScaleOrFont?: number | string, font?: string, fontSize?: number, fontColor?: string, lang?: string
      ): string;

      static getUnitSettings(cb:(code:number, data?:any)=>void): void;
      static updateUnitSettings(unitId:number, machineItemId:number, machineId:number, settings:any, cb?:(code:number)=>void): void;

      static convertPlots(resourceId:number, plots:any[], cb:(code:number, data?:any)=>void): void;
      static updateCultivationMsg(plotItemId:number, plotId:number, timeFrom:number, timeTo:number, msgIndex:number, params:any, cb?:(code:number)=>void): void;
      static deleteCultivationMsg(plotItemId:number, plotId:number, timeFrom:number, timeTo:number, msgIndex:number, cb?:(code:number)=>void): void;

      static getPlotsUrl(fileName:string, plots:any[], tzOffset:number): string;
      static importPlot(file: File, tzOffset:number, cb?:(code:number, data?:any)=>void): void;
      static registerPlots(resourceId:number, groupId:number, config:any, cb?:(code:number)=>void): void;

      static getUnitsInPlots(cb:(code:number, data?:any)=>void): void;

      /** Printing enums */
      static print: {
        fileType: { svg:number; png:number };
        imageFlag: { a0:number;a1:number;a2:number;a3:number;a4:number; attachMap:number; colored:number };
        mapScale: { normal:number;x2:number;x4:number;x6:number;x8:number;x10:number;x20:number;x50:number;x100:number;x200:number;x400:number;x1000:number };
        font: {
          dejaVuSans: string; dejaVuSansOblique: string; dejaVuSansBold: string; dejaVuSansBoldOblique: string;
          arial: string; arialBlack: string; courierNew: string; comicSansMS: string; georgia: string; impact: string; timesNewRoman: string; trebuchetMS: string; verdana: string;
        };
        plotFlag: {
          placementHorizontal:number; landscape:number; rotate90CCW:number; plotName:number; plotDescription:number;
          plotArea:number; usefulPlotArea:number; crop:number; placementVertical:number;
        };
      };
    }
  }

  // ===================== core ======================
  namespace core {
    class NodeHttp extends qx.core.Object {
      /** POST form-encoded to a path (internal use). */
      send(
        path: string,
        body: Record<string, any>,
        onResponse?: (json: any) => void,
        onBefore?: () => void,
        timeoutSec?: number
      ): void;

      supportAsync(): true;
    }

    class Errors {
      static getErrorText(code: number): string;
    }
  }
}
