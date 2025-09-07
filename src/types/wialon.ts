// src/types/wialon.ts
/* ------------------------------------------------------------------
 * Shared Wialon-related typings
 * ------------------------------------------------------------------ */

/* ---------- Base Wialon Event and Callback Types ---------------------------------------- */

/** Base event type for Wialon SDK events */
export interface WialonEvent {
  name: string;
  target?: unknown;
  data?: unknown;
}

/** Generic callback for Wialon API operations */
export type WialonCallback<T = unknown> = (error: number | null, data?: T) => void;

/** Callback for message queries */
export type WialonMessageCallback = (error: number | null, messages?: WialonMessage[]) => void;

/** Wialon message structure from API */
export interface WialonMessage {
  t: number;  // timestamp
  tp: string; // message type
  pos: WialonPosition;
  p: Record<string, unknown>; // parameters
}

/** Data flags for Wialon items */
export type WialonDataFlags = Record<string, number>;

/** Time interval for reports */
export interface WialonInterval {
  from: number; // UNIX timestamp
  to: number;   // UNIX timestamp
}

/** Report template structure */
export interface WialonReportTemplate {
  id: number;
  name: string;
  resource_id: number;
  [key: string]: unknown;
}

/** Geometry for zones (can be points, polygons, circles) */
export interface WialonGeometry {
  x?: number;  // longitude for points
  y?: number;  // latitude for points
  r?: number;  // radius for circles
  points?: { x: number; y: number }[]; // for polygons
  [key: string]: unknown; // additional geometry properties
}

/* ---------- Positions & units ------------------------------------------------ */

export interface WialonPosition {
  x: number; // Longitude
  y: number; // Latitude
  z?: number; // Altitude
  t?: number; // Timestamp (UNIX, s)
  s?: number; // Speed
  c?: number; // Course
  sc?: number; // Status code
}

/** SDK object representing a unit (vehicle / asset) */
export interface WialonUnit {
  getId(): number;
  getName(): string;
  getPosition(): WialonPosition | undefined;
  getIconUrl(size?: number): string;
  getUniqueId(): string | number;

  /* SDK event interface */
  addListener(event: string, callback: (event: WialonEvent) => void): number;
  removeListenerById(id: number): void;

  /* Messages API */
  getMessages(from: number, to: number, flags: number, callback: WialonMessageCallback): void;
}

/** Lightweight DTO sometimes returned by REST adapters */
export interface WialonUnitBrief {
  id: number | string;
  name: string;
  lat?: number;
  lng?: number;
  speed?: number;
  course?: number;
  time?: number;
}

/* ---------- Other domain objects -------------------------------------------- */

export interface WialonDriver {
  id: number | string;
  n: string; // name
  ds?: string; // description
  p?: string; // phone
}

export interface WialonGeofence {
  id: number | string;
  n: string; // name
  t: number; // 3-circle, 2-polygon, 1-polyline
  w?: number; // radius (for circle)
  c?: number; // colour (decimal)
  p?: WialonGeometry; // geometry
}

/** Typed wrapper around a “resource” object */
export type WialonResource = {
  id: 25138250;
  name: string;
  getZones(): any;
  execReport(template: any, unitId: number, flags: number, interval: any, callback: any): void;
};

/** A new interface to correctly type the SDK User object. */
export interface WialonUser {
  getId(): number;
  getName(): string;
}

/**
 * Wialon Session methods from JS SDK.
 * This interface has been updated to include missing methods.
 */
export interface WialonSession {
  // Methods to get core session info
  getId(): number;
  getCurrUser(): WialonUser;

  // Existing methods
  initSession(url: string): void;
  loginToken(token: string, password: string, cb: (code: number) => void): void;
  logout(cb: (code: number) => void): void;
  loadLibrary(lib: string, cb?: () => void): void;
  updateDataFlags(flags: any, cb: (code: number) => void): void;
  getItems(type: string): any;
  getItem(id: number | string): any;

  sid: string;
}

/** Raw payload produced by a successful `/login_token` REST call */
export interface WialonApiSession {
  eid: number;
  au: number;
  auth_hash: number;
  /** single resource id **or** array (some accounts return many) */
  resource_id: number | number[];
  user: {
    id: number;
    name: string;
  };
  /* add extra properties if you need them */
}

/* ---------- Helper view-models ---------------------------------------------- */

export interface UnitInfo {
  id: number;
  name: string;
  iconUrl: string;
}

export interface ReportTableData {
  headers: string;
  rows: any;
}

export interface UnitDetail {
  id: number;
  name: string;
  iconUrl: string;
  uid?: string | number;
  position: { lat: number; lng: number } | null;
  speed: number;
  status: "onroad" | "pause" | "offline";
  lastMessageTime: number | null;
}

export interface WialonSession {
  host: string;
  eid: string;
  gis_sid: string;
  au: string;
  tm: number;
  wsdk_version: string;
  base_url: string;
  hw_gw_ip: string;
  hw_gw_dns: string;
  gis_search: string;
  gis_render: string;
  gis_geocode: string;
  gis_routing: string;
  billing_by_codes: string;
  drivers_feature_flags: string;
  user: {
    nm: string;
    cls: number;
    id: number;
    prp: {
      __sensolator_resource_id: string;
      access_templates: string;
      autoFillPromo: string;
      autocomplete: string;
      dst: string;
      evt_flags: string;
      forceAddedDashboardTabOnce: string;
      forceAddedTaskManagerTabOnce: string;
      fpnl: string;
      geodata_source: string;
      hbacit: string;
      hide_health_check_promo: string;
      hide_health_check_promo_message: string;
      hpnl: string;
      i_agree_with_gdpr_dpa: string;
      isDeviceTypeTooltipWasShown: string;
      language: string;
      lastmsgl: string;
      m_gia: string;
      m_ml: string;
      m_mm: string;
      m_mm2: string;
      m_monu: string;
      m_ms: string;
      mf_use_sensors: string;
      minimap_zoom_level: string;
      mon_units_update_m: string;
      mongr: string;
      monitoringAutoAdd: string;
      mont: string;
      monu: string;
      monuei: string;
      monuexpg: string;
      monugv: string;
      monuv: string;
      mu_cmd_btn: string;
      mu_delete_from_list: string;
      mu_dev_cfg: string;
      mu_events: string;
      mu_fast_report: string;
      mu_fast_report_tmpl: string;
      mu_fast_track_ival: string;
      mu_gprs: string;
      mu_gps: string;
      mu_loc_mode: string;
      mu_location: string;
      mu_msgs: string;
      mu_photo: string;
      mu_sl_type: string;
      mu_tbl_cols_sizes: string;
      mu_tbl_sort: string;
      mu_tr_mode: string;
      mu_tracks: string;
      mu_trailer: string;
      mu_video: string;
      mu_watch: string;
      muf: string;
      mugow: string;
      muow: string;
      new_login_skin: string;
      notify_block_account: string;
      radd: string;
      rtssn: string;
      sens_color_tooltip: string;
      show_log: string;
      taskManagerTableState: string;
      tracingService: string;
      trlsvlist: string;
      tz: string;
      umap: string;
      unit_extra_order: string;
      ursstp: string;
      us_addr_fmt: string;
      us_addr_ordr: string;
      usdrva: string;
      used_hw: string;
      used_vehicle_types: string;
      user_settings_sensors: string;
      usuei: string;
      vsplit: string;
      znsn: string;
      znsrv: string;
      znsvlist: string;
    };
    crt: number;
    bact: number;
    mu: number;
    ct: number;
    ftp: { ch: number; tp: number; fl: number };
    fl: number;
    hm: string;
    ld: number;
    pfl: number;
    mapps: Record<string, {
      id: number;
      n: string;
      uid: string;
      cp: { ui: number; un: string };
      as: { appid: string; device: string; type: string };
      e: number;
      ct: number;
      mt: number;
    }>;
    mappsmax: number;
    uacl: number;
  };
  token: string;
  th: string;
  classes: {
    avl_hw: number;
    avl_resource: number;
    avl_retranslator: number;
    avl_route: number;
    avl_unit: number;
    avl_unit_group: number;
    user: number;
  };
  features: {
    unlim: number;
    svcs: Record<string, number>;
  };
  video_service_url: string;
}
export interface WialonUnitSearchResult {
  searchSpec: {
    itemsType: string;        // "avl_unit"
    propName: string;         // e.g., "sys_name"
    propValueMask: string;    // e.g., "*"
    sortType: string;         // e.g., "sys_name"
    propType: string;
    or_logic: string | number; // "0" or 0 (API sometimes returns as string)
  };
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: WialonUnitShort[];
}

export interface WialonUnitShort {
  nm: string;    // unit name
  cls: number;   // always 2 for avl_unit
  id: number;    // Wialon internal unit ID
  mu: number;
  uacl: number;  // unit access control list (bitmask)
}
export interface WialonAvlUnitSearchResponse {
  searchSpec: {
    itemsType: string;
    propName: string;
    propValueMask: string;
    sortType: string;
    propType: string;
    or_logic: string | number; // it is actually "0" or 0, but safest to allow both
  };
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: WialonAvlUnitListItem[];
}

export interface WialonAvlUnitListItem {
  nm: string;     // Unit name
  cls: number;    // Class/type (2 = unit)
  id: number;     // Unique unit ID
  mu: number;     // Usually 0 (?)
  uacl: number;   // User access control list
}
// src/types/wialon.ts
/* ------------------------------------------------------------------
 * Wialon (AVL Unit) — TypeScript typings
 * Covers root object + advanced props, profile, health checks,
 * sensors, report props, driving & trip configurations, and SDK stubs.
 * ------------------------------------------------------------------ */

/** Unix timestamp in seconds */
export type UnixSeconds = number;

/** Generic “period” string used by health checks (examples: "none", "1h", "1d") */
export type WialonPeriod = 'none' | '1h' | '1d' | string;

/** Core response shape for a Wialon AVL unit */
export interface WialonAvlUnitResponse {
  /** Object type, typically "avl_unit" */
  type: string;
  version: string;
  /** Measurement units flag (as provided by API) */
  mu: number;

  /** Common unit metadata */
  general: WialonGeneral;

  /** Icon library reference and rendering hints */
  icon: WialonIcon;

  /** Hardware configuration and vendor-specific parameter list */
  hwConfig: WialonHWConfig;

  /** Arbitrary numeric counters (e.g., messages, km, etc.) */
  counters: Record<string, number>;

  /**
   * Advanced properties. Wialon exposes a flexible bag of keys.
   * Known fields are typed below; unknown ones remain allowed via index signature.
   */
  advProps?: WialonAdvProps;

  /** Custom fields (structure varies across deployments) */
  fields?: unknown[];

  /** Additional fields (structure varies across deployments) */
  afields?: unknown[];

  /** Key/value metadata for the unit */
  profile?: WialonProfileField[];

  /** Arbitrary interval objects (unknown structure by default) */
  intervals?: unknown[];

  /** Health monitoring rules per category */
  healthCheck?: WialonHealthCheck;

  /** List of configured sensors (fuel, ignition, voltage, custom, etc.) */
  sensors?: WialonSensor[];

  /** Reporting properties (speeding, fuel, rates, tolerances, etc.) */
  reportProps?: WialonReportProps;

  /** Aliases (implementation-specific). Kept open for forward-compat. */
  aliases?: WialonAlias[];

  /** Driving behavior thresholds & scoring rules */
  driving?: WialonDrivingConfig;

  /** Trip extraction configuration */
  trip?: WialonTripConfig;
}

/* ---------- General / Icon / HW config ------------------------------------- */

export interface WialonGeneral {
  /** Display name, e.g., "23H - AFQ 1324 (Int Sim)" */
  n: string;
  /** Primary unique device ID (IMEI, etc.) */
  uid: string;
  /** Secondary unique ID (if present) */
  uid2: string;
  /** Primary phone/MSISDN */
  ph: string;
  /** Secondary phone */
  ph2: string;
  /** Device password (if applicable) */
  psw: string;
  /** HW model name, e.g., "Teltonika FMB920" */
  hw: string;
}

export interface WialonIcon {
  /** Icon library identifier */
  lib: string;
  /** Icon filename/url inside the library */
  url: string;
  /** Whether to rotate image with course (0|1) or a numeric/string flag */
  imgRot: string | number;
}

export interface WialonHWConfig {
  /** HW model name */
  hw: string;
  /** Whether full parameter data is present (0|1) */
  fullData: 0 | 1;
  /** Vendor-specific parameter list */
  params: WialonHWParam[];
}

export type WialonHWParamType = 'text' | 'bool' | 'int' | 'float' | 'enum' | string;

export interface WialonHWParam {
  /** Technical parameter key */
  name: string;
  /** Human label */
  label: string;
  /** Optional description/help text */
  description?: string;
  /** Type hint */
  type: WialonHWParamType;
  /** Read-only flag (0|1) */
  readonly: 0 | 1;
  /** Optional bounds (when numeric) */
  minval?: number;
  maxval?: number;
  /**
   * Default and current values.
   * Wialon often serializes numbers/bools as strings; keep liberal.
   */
  default?: string | number | boolean;
  value?: string | number | boolean;
}

/* ---------- Advanced props -------------------------------------------------- */

export interface WialonMsgFilter {
  enabled: 0 | 1;
  skipInvalid: 0 | 1;
  lbsCorrection: 0 | 1;
  wifiCorrection: 0 | 1;
  minSats: number;
  maxHdop: number;
  maxSpeed: number;
  minWifiPoints: number;
  maxWifiPoints: number;
  wifiAccuracy: number;
}

export interface WialonSpeedSource {
  /** Device/parameter key providing speed */
  speed_parameter: string;
  /** Measurement/flag (string in samples) */
  speed_measure: string;
}

/**
 * Advanced properties. Known keys from sample payloads are optional;
 * arbitrary additional keys are allowed via the index signature.
 */
export interface WialonAdvProps {
  monitoring_sensor?: string;
  use_sensor_color?: string; // "0"/"1"
  monitoring_sensor_id?: string;
  motion_state_sensor_id?: string;
  monitoring_battery_id?: string;

  track_sensor?: string;
  sensors_colors?: string;
  sensors_colors_id?: string;
  track_solid?: string;
  solid_colors?: string;
  track_speed?: string;
  speed_colors?: string;
  label_color?: string;
  trip_colors?: string;

  msgFilter?: WialonMsgFilter;
  speed_source?: WialonSpeedSource;

  /** Forward-compatibility: allow any other advanced property */
  [key: string]: unknown;
}

/* ---------- Profile fields -------------------------------------------------- */

export interface WialonProfileField {
  /** Internal ID */
  id: number;
  /** Name/key, e.g., "vehicle_class" */
  n: string;
  /** Value (string in samples) */
  v: string;
  /** Created-at (unix sec) */
  ct: UnixSeconds;
  /** Modified-at (unix sec) */
  mt: UnixSeconds;
}

/* ---------- Health check configuration ------------------------------------- */

export interface WialonHealthCondition {
  /** Comparison type (examples: "less", "greater") */
  type: 'less' | 'greater' | string;
  /** Threshold value (unit depends on rule) */
  value: number;
}

export interface WialonHealthRule {
  period: WialonPeriod;
  unhealthy_conditions?: WialonHealthCondition[];
}

/**
 * Health checks keyed by category name.
 * Known keys are listed; others may exist and are preserved.
 */
export interface WialonHealthCheck extends Record<string, WialonHealthRule> {
  missing_position_data?: WialonHealthRule;
  insufficient_satellite_coverage?: WialonHealthRule;
  low_battery?: WialonHealthRule;
  voltage_out_of_range?: WialonHealthRule;
  max_messages_last_hour?: WialonHealthRule;
  max_distance_between_messages?: WialonHealthRule;
  no_data?: WialonHealthRule;
  stuck_fls?: WialonHealthRule;
  ignition_is_off?: WialonHealthRule;
}

/* ---------- Sensors --------------------------------------------------------- */

export type WialonSensorType =
  | 'engine operation'
  | 'fuel level'
  | 'voltage'
  | 'accelerometer'
  | 'custom'
  | string;

export interface WialonSensorCalibrationPoint {
  x: number;
  a?: number;
  b?: number;
  /** Extra coefficients may appear; keep it extensible */
  [key: string]: number | undefined;
}

export interface WialonSensor {
  id: number;
  /** Display name, e.g., "Ignition" */
  n: string;
  /** Type label, e.g., "fuel level" */
  t: WialonSensorType;
  /** Description */
  d: string;
  /** Measurement unit, e.g., "l", "V", "g", "" */
  m: string;
  /** Parameter mapping, e.g., "io_273", "gsm", "io_66/const1000" */
  p: string;
  /** Flags bitmask */
  f: number;
  /**
   * Stringified JSON with additional config (engine linkage, fuel params, etc.)
   * Consumer may parse this to a richer shape.
   */
  c: string;
  /** Value type code (vendor-specific) */
  vt: number;
  /** Value source code (vendor-specific) */
  vs: number;
  /** Calibration table */
  tbl: WialonSensorCalibrationPoint[];
  /** Created-at (unix sec) */
  ct: UnixSeconds;
  /** Modified-at (unix sec) */
  mt: UnixSeconds;
}

/* ---------- Report properties ---------------------------------------------- */

export interface WialonFuelConsumptionRates {
  consSummer?: number;
  consWinter?: number;
  winterMonthFrom?: number;
  winterDayFrom?: number;
  winterMonthTo?: number;
  winterDayTo?: number;
}

export interface WialonAvlUnitResponse {
  /** Object type, typically "avl_unit" */
  type: string;
  version: string;
  /** Measurement units flag (as provided by API) */
  mu: number;

  /** Common unit metadata */
  general: WialonGeneral;

  /** Icon library reference and rendering hints */
  icon: WialonIcon;

  /** Hardware configuration and vendor-specific parameter list */
  hwConfig: WialonHWConfig;

  /** Arbitrary numeric counters (e.g., messages, km, etc.) */
  counters: Record<string, number>;

  /**
   * Advanced properties. Wialon exposes a flexible bag of keys.
   * Known fields are typed below; unknown ones remain allowed via index signature.
   */
  advProps?: WialonAdvProps;
}

/** Unit “general” section */
export interface WialonGeneral {
  /** Name, e.g., "23H - AFQ 1324 (Int Sim)" */
  n: string;
  /** Primary unique device ID (IMEI, etc.) */
  uid: string;
  /** Secondary unique ID (if present) */
  uid2: string;
  /** Primary phone/MSISDN */
  ph: string;
  /** Secondary phone */
  ph2: string;
  /** Device password (if applicable) */
  psw: string;
  /** HW model name, e.g., "Teltonika FMB920" */
  hw: string;
}

/** Icon description */
export interface WialonIcon {
  /** Icon library identifier */
  lib: string;
  /** Icon filename/url inside the library */
  url: string;
  /** Whether to rotate image with course (0|1) or a numeric/string flag */
  imgRot: string | number;
}

/** Hardware configuration */
export interface WialonHWConfig {
  /** HW model name */
  hw: string;
  /** Whether full parameter data is present (0|1) */
  fullData: 0 | 1;
  /** Vendor-specific parameter list */
  params: WialonHWParam[];
}

/** Union of known parameter types; allow unknown strings for forward-compat */
export type WialonHWParamType = 'text' | 'bool' | 'int' | 'float' | 'enum' | string;

/** A single hardware parameter definition/value */
export interface WialonHWParam {
  /** Technical parameter key */
  name: string;
  /** Human label */
  label: string;
  /** Optional description/help text */
  description?: string;
  /** Type hint */
  type: WialonHWParamType;
  /** Read-only flag (0|1) */
  readonly: 0 | 1;
  /** Optional bounds (when numeric) */
  minval?: number;
  maxval?: number;
  /**
   * Default and current values.
   * Wialon often serializes numbers/bools as strings; keep this liberal.
   */
  default?: string | number | boolean;
  value?: string | number | boolean;
}

/** Message filtering configuration found under advProps.msgFilter */
export interface WialonMsgFilter {
  enabled: 0 | 1;
  skipInvalid: 0 | 1;
  lbsCorrection: 0 | 1;
  wifiCorrection: 0 | 1;
  minSats: number;
  maxHdop: number;
  maxSpeed: number;
  minWifiPoints: number;
  maxWifiPoints: number;
  wifiAccuracy: number;
}

/** Speed source configuration found under advProps.speed_source */
export interface WialonSpeedSource {
  /** Device/parameter key providing speed */
  speed_parameter: string;
  /**
   * Measurement flag (as string in sample payloads).
   * Keep open-ended to allow future enumerations.
   */
  speed_measure: string;
}

/**
 * Advanced properties. Known keys from sample payloads are optional;
 * arbitrary additional keys are allowed via the index signature.
 */
export interface WialonAdvProps {
  monitoring_sensor?: string;
  use_sensor_color?: string;
  monitoring_sensor_id?: string;
  motion_state_sensor_id?: string;
  monitoring_battery_id?: string;

  track_sensor?: string;
  sensors_colors?: string;
  sensors_colors_id?: string;
  track_solid?: string;
  solid_colors?: string;
  track_speed?: string;
  speed_colors?: string;
  label_color?: string;
  trip_colors?: string;

  /** Message filtering rules */
  msgFilter?: WialonMsgFilter;

  /** Speed source selection */
  speed_source?: WialonSpeedSource;

  /** Forward-compatibility: allow any other advanced property */
  [key: string]: unknown;
}

export interface WialonReportProps {
  /** Speed limit for reports (0 means disabled) */
  speedLimit?: number;
  maxMessagesInterval?: number;
  dailyEngineHoursRate?: number;
  urbanMaxSpeed?: number;
  mileageCoefficient?: number;
  fuelRateCoefficient?: number;
  speedingTolerance?: number;
  speedingMinDuration?: number;
  speedingMode?: number;
  driver_activity?: { type?: number };
  fuelConsRates?: WialonFuelConsumptionRates;

  /** Allow additional keys to pass through unchanged */
  [key: string]: unknown;
}

/* ---------- Aliases --------------------------------------------------------- */

/** Alias shape is not standardized across deployments; keep loose. */
export interface WialonAlias {
  [key: string]: unknown;
}

/* ---------- Driving behavior ------------------------------------------------ */

export interface WialonDrivingRuleBase {
  flags: number;
  /** Lower bound for rule trigger */
  min_value?: number;
  /** Upper bound for rule trigger */
  max_value?: number;
  /** Human-readable name */
  name: string;
  /** Penalty score/weight */
  penalties: number;
}

export interface WialonIdlingRule extends WialonDrivingRuleBase {
  /** Optional validator reference */
  validator_id?: number;
}

export interface WialonSpeedingRule extends WialonDrivingRuleBase {
  min_speed?: number;
  max_speed?: number;
  min_duration?: number; // seconds
  max_duration?: number; // seconds
}

export interface WialonDrivingConfig {
  acceleration?: WialonDrivingRuleBase[];
  brake?: WialonDrivingRuleBase[];
  idling?: WialonIdlingRule[];
  speeding?: WialonSpeedingRule[];
  turn?: WialonDrivingRuleBase[];
  /** Misc global settings (string in samples) */
  global?: { accel_mode?: string | number; [key: string]: unknown };
}

/* ---------- Trip extraction ------------------------------------------------- */

export interface WialonTripConfig {
  /** Trip detection type/mode (vendor-specific) */
  type?: number;
  /** Enable GPS correction (0/1) */
  gpsCorrection?: number;
  /** Minimum satellites for valid position */
  minSat?: number;
  /** Minimum speed to consider movement (km/h) */
  minMovingSpeed?: number;
  /** Minimum stay time to split trips (seconds) */
  minStayTime?: number;
  /** Max distance between consecutive messages (meters) */
  maxMessagesDistance?: number;
  /** Minimum trip duration (seconds) */
  minTripTime?: number;
  /** Minimum trip distance (meters) */
  minTripDistance?: number;

  [key: string]: unknown;
}

/* ---------- SDK surface (lightweight stubs) -------------------------------- */

// src/types/geofences.ts
/* ------------------------------------------------------------------
 * Geofences payload (Wialon-like unit object) — TypeScript typings
 * Cleaned from the provided JSON, deduped keys, and compile-safe.
 * ------------------------------------------------------------------ */

/** Unix timestamp in seconds */
export type UnixSeconds = number;

/** Generic “period” string used by health checks (examples: "none", "1h", "1d") */
export type WialonPeriod = 'none' | '1h' | '1d' | string;

/* ---------- Root object ----------------------------------------------------- */

export interface Geofences {
  /** Advanced properties / visualization & parsing flags */
  advProps: WialonAdvProps;

  /** Common unit metadata */
  general: WialonGeneral;

  /** Icon library reference and rendering hints */
  icon: WialonIcon;

  /** Hardware configuration and vendor-specific parameter list */
  hwConfig: WialonHWConfig;

  /** Arbitrary numeric counters (e.g., messages, km, etc.) */
  counters: Record<string, number>;

  /** Custom fields (structure varies across deployments) */
  fields: unknown[];

  /** Additional fields (structure varies across deployments) */
  afields: unknown[];

  /** Unit metadata/profile */
  profile: WialonProfileField[];

  /** Arbitrary interval objects (unknown structure by default) */
  intervals: unknown[];

  /** Health monitoring rules per category */
  healthCheck: WialonHealthCheck;

  /** List of configured sensors (fuel, ignition, voltage, custom, etc.) */
  sensors: WialonSensor[];

  /** Reporting properties (speeding, fuel, rates, tolerances, etc.) */
  reportProps: WialonReportProps;

  /** Aliases (implementation-specific). Kept open for forward-compat. */
  aliases: WialonAlias[];

  /** Driving behavior thresholds & scoring rules */
  driving: WialonDrivingConfig;

  /** Trip extraction configuration */
  trip: WialonTripConfig;
}

/** Backwards-compat alias if you need the exact original name */
export type geofences = Geofences;

/* ---------- General / Icon / HW config ------------------------------------- */

export interface WialonGeneral {
  /** Display name, e.g., "23H - AFQ 1324 (Int Sim)" */
  n: string;
  /** Primary unique device ID (IMEI, etc.) */
  uid: string;
  /** Secondary unique ID (if present) */
  uid2: string;
  /** Primary phone/MSISDN */
  ph: string;
  /** Secondary phone */
  ph2: string;
  /** Device password (if applicable) */
  psw: string;
  /** HW model name, e.g., "Teltonika FMB920" */
  hw: string;
}

export interface WialonIcon {
  /** Icon library identifier */
  lib: string;
  /** Icon filename/url inside the library */
  url: string;
  /** Whether to rotate image with course (0|1) or a numeric/string flag */
  imgRot: string | number;
}

export interface WialonHWConfig {
  /** HW model name */
  hw: string;
  /** Whether full parameter data is present (0|1) */
  fullData: 0 | 1;
  /** Vendor-specific parameter list */
  params: WialonHWParam[];
}

export type WialonHWParamType = 'text' | 'bool' | 'int' | 'float' | 'enum' | string;

export interface WialonHWParam {
  /** Technical parameter key */
  name: string;
  /** Human label */
  label: string;
  /** Optional description/help text */
  description?: string;
  /** Type hint */
  type: WialonHWParamType;
  /** Read-only flag (0|1) */
  readonly: 0 | 1;
  /** Optional bounds (when numeric) */
  minval?: number;
  maxval?: number;
  /**
   * Default and current values.
   * Wialon often serializes numbers/bools as strings; keep liberal.
   */
  default?: string | number | boolean;
  value?: string | number | boolean;
}

/* ---------- Advanced props -------------------------------------------------- */

export interface WialonMsgFilter {
  enabled: 0 | 1;
  skipInvalid: 0 | 1;
  lbsCorrection: 0 | 1;
  wifiCorrection: 0 | 1;
  minSats: number;
  maxHdop: number;
  maxSpeed: number;
  minWifiPoints: number;
  maxWifiPoints: number;
  wifiAccuracy: number;
}

export interface WialonSpeedSource {
  /** Device/parameter key providing speed */
  speed_parameter: string;
  /** Measurement/flag (string in samples) */
  speed_measure: string;
}

/**
 * Advanced properties. Known keys from sample payloads are optional;
 * arbitrary additional keys are allowed via the index signature.
 */
export interface WialonAdvProps {
  monitoring_sensor?: string;
  use_sensor_color?: string; // "0"/"1"
  monitoring_sensor_id?: string;
  motion_state_sensor_id?: string;
  monitoring_battery_id?: string;

  track_sensor?: string;
  sensors_colors?: string;
  sensors_colors_id?: string;
  track_solid?: string;
  solid_colors?: string;
  track_speed?: string;
  speed_colors?: string;
  label_color?: string;
  trip_colors?: string;

  msgFilter?: WialonMsgFilter;
  speed_source?: WialonSpeedSource;

  /** Forward-compatibility: allow any other advanced property */
  [key: string]: unknown;
}

/* ---------- Profile fields -------------------------------------------------- */

export interface WialonProfileField {
  /** Internal ID */
  id: number;
  /** Name/key, e.g., "vehicle_class" */
  n: string;
  /** Value (string in samples) */
  v: string;
  /** Created-at (unix sec) */
  ct: UnixSeconds;
  /** Modified-at (unix sec) */
  mt: UnixSeconds;
}

/* ---------- Health check configuration ------------------------------------- */

export interface WialonHealthCondition {
  /** Comparison type (examples: "less", "greater") */
  type: 'less' | 'greater' | string;
  /** Threshold value (unit depends on rule) */
  value: number;
}

export interface WialonHealthRule {
  period: WialonPeriod;
  unhealthy_conditions?: WialonHealthCondition[];
}

/**
 * Health checks keyed by category name.
 * Known keys are listed; others may exist and are preserved.
 */
export interface WialonHealthCheck extends Record<string, WialonHealthRule> {
  missing_position_data?: WialonHealthRule;
  insufficient_satellite_coverage?: WialonHealthRule;
  low_battery?: WialonHealthRule;
  voltage_out_of_range?: WialonHealthRule;
  max_messages_last_hour?: WialonHealthRule;
  max_distance_between_messages?: WialonHealthRule;
  no_data?: WialonHealthRule;
  stuck_fls?: WialonHealthRule;
  ignition_is_off?: WialonHealthRule;
}

/* ---------- Sensors --------------------------------------------------------- */

export type WialonSensorType =
  | 'engine operation'
  | 'fuel level'
  | 'voltage'
  | 'accelerometer'
  | 'custom'
  | string;

export interface WialonSensorCalibrationPoint {
  x: number;
  a?: number;
  b?: number;
  /** Extra coefficients may appear; keep it extensible */
  [key: string]: number | undefined;
}

export interface WialonSensor {
  id: number;
  /** Display name, e.g., "Ignition" */
  n: string;
  /** Type label, e.g., "fuel level" */
  t: WialonSensorType;
  /** Description */
  d: string;
  /** Measurement unit, e.g., "l", "V", "g", "" */
  m: string;
  /** Parameter mapping, e.g., "io_273", "gsm", "io_66/const1000" */
  p: string;
  /** Flags bitmask */
  f: number;
  /**
   * Stringified JSON with additional config (engine linkage, fuel params, etc.)
   * Consumer may parse this to a richer shape.
   */
  c: string;
  /** Value type code (vendor-specific) */
  vt: number;
  /** Value source code (vendor-specific) */
  vs: number;
  /** Calibration table */
  tbl: WialonSensorCalibrationPoint[];
  /** Created-at (unix sec) */
  ct: UnixSeconds;
  /** Modified-at (unix sec) */
  mt: UnixSeconds;
}

/* ---------- Report properties ---------------------------------------------- */

export interface WialonFuelConsumptionRates {
  consSummer?: number;
  consWinter?: number;
  winterMonthFrom?: number;
  winterDayFrom?: number;
  winterMonthTo?: number;
  winterDayTo?: number;
}

export interface WialonAvlUnitResponse {
  /** Object type, typically "avl_unit" */
  type: string;
  version: string;
  /** Measurement units flag (as provided by API) */
  mu: number;

  /** Common unit metadata */
  general: WialonGeneral;

  /** Icon library reference and rendering hints */
  icon: WialonIcon;

  /** Hardware configuration and vendor-specific parameter list */
  hwConfig: WialonHWConfig;

  /** Arbitrary numeric counters (e.g., messages, km, etc.) */
  counters: Record<string, number>;

  /**
   * Advanced properties. Wialon exposes a flexible bag of keys.
   * Known fields are typed below; unknown ones remain allowed via index signature.
   */
  advProps?: WialonAdvProps;
}

/** Unit “general” section */
export interface WialonGeneral {
  /** Name, e.g., "23H - AFQ 1324 (Int Sim)" */
  n: string;
  /** Primary unique device ID (IMEI, etc.) */
  uid: string;
  /** Secondary unique ID (if present) */
  uid2: string;
  /** Primary phone/MSISDN */
  ph: string;
  /** Secondary phone */
  ph2: string;
  /** Device password (if applicable) */
  psw: string;
  /** HW model name, e.g., "Teltonika FMB920" */
  hw: string;
}

/** Icon description */
export interface WialonIcon {
  /** Icon library identifier */
  lib: string;
  /** Icon filename/url inside the library */
  url: string;
  /** Whether to rotate image with course (0|1) or a numeric/string flag */
  imgRot: string | number;
}

/** Hardware configuration */
export interface WialonHWConfig {
  /** HW model name */
  hw: string;
  /** Whether full parameter data is present (0|1) */
  fullData: 0 | 1;
  /** Vendor-specific parameter list */
  params: WialonHWParam[];
}

/** Union of known parameter types; allow unknown strings for forward-compat */
export type WialonHWParamType = 'text' | 'bool' | 'int' | 'float' | 'enum' | string;

/** A single hardware parameter definition/value */
export interface WialonHWParam {
  /** Technical parameter key */
  name: string;
  /** Human label */
  label: string;
  /** Optional description/help text */
  description?: string;
  /** Type hint */
  type: WialonHWParamType;
  /** Read-only flag (0|1) */
  readonly: 0 | 1;
  /** Optional bounds (when numeric) */
  minval?: number;
  maxval?: number;
  /**
   * Default and current values.
   * Wialon often serializes numbers/bools as strings; keep this liberal.
   */
  default?: string | number | boolean;
  value?: string | number | boolean;
}

/** Message filtering configuration found under advProps.msgFilter */
export interface WialonMsgFilter {
  enabled: 0 | 1;
  skipInvalid: 0 | 1;
  lbsCorrection: 0 | 1;
  wifiCorrection: 0 | 1;
  minSats: number;
  maxHdop: number;
  maxSpeed: number;
  minWifiPoints: number;
  maxWifiPoints: number;
  wifiAccuracy: number;
}

/** Speed source configuration found under advProps.speed_source */
export interface WialonSpeedSource {
  /** Device/parameter key providing speed */
  speed_parameter: string;
  /**
   * Measurement flag (as string in sample payloads).
   * Keep open-ended to allow future enumerations.
   */
  speed_measure: string;
}

/**
 * Advanced properties. Known keys from sample payloads are optional;
 * arbitrary additional keys are allowed via the index signature.
 */
export interface WialonAdvProps {
  monitoring_sensor?: string;
  use_sensor_color?: string;
  monitoring_sensor_id?: string;
  motion_state_sensor_id?: string;
  monitoring_battery_id?: string;

  track_sensor?: string;
  sensors_colors?: string;
  sensors_colors_id?: string;
  track_solid?: string;
  solid_colors?: string;
  track_speed?: string;
  speed_colors?: string;
  label_color?: string;
  trip_colors?: string;

  /** Message filtering rules */
  msgFilter?: WialonMsgFilter;

  /** Speed source selection */
  speed_source?: WialonSpeedSource;

  /** Forward-compatibility: allow any other advanced property */
  [key: string]: unknown;
}

export interface WialonReportProps {
  /** Speed limit for reports (0 means disabled) */
  speedLimit?: number;
  maxMessagesInterval?: number;
  dailyEngineHoursRate?: number;
  urbanMaxSpeed?: number;
  mileageCoefficient?: number;
  fuelRateCoefficient?: number;
  speedingTolerance?: number;
  speedingMinDuration?: number;
  speedingMode?: number;
  driver_activity?: { type?: number };
  fuelConsRates?: WialonFuelConsumptionRates;

  /** Allow additional keys to pass through unchanged */
  [key: string]: unknown;
}

/* ---------- Aliases --------------------------------------------------------- */

/** Alias shape is not standardized across deployments; keep loose. */
export interface WialonAlias {
  [key: string]: unknown;
}

/* ---------- Driving behavior ------------------------------------------------ */

export interface WialonDrivingRuleBase {
  flags: number;
  /** Lower bound for rule trigger */
  min_value?: number;
  /** Upper bound for rule trigger */
  max_value?: number;
  /** Human-readable name */
  name: string;
  /** Penalty score/weight */
  penalties: number;
}

export interface WialonIdlingRule extends WialonDrivingRuleBase {
  /** Optional validator reference */
  validator_id?: number;
}

export interface WialonSpeedingRule extends WialonDrivingRuleBase {
  min_speed?: number;
  max_speed?: number;
  min_duration?: number; // seconds
  max_duration?: number; // seconds
}

export interface WialonDrivingConfig {
  acceleration?: WialonDrivingRuleBase[];
  brake?: WialonDrivingRuleBase[];
  idling?: WialonIdlingRule[];
  speeding?: WialonSpeedingRule[];
  turn?: WialonDrivingRuleBase[];
  /** Misc global settings (string in samples) */
  global?: { accel_mode?: string | number; [key: string]: unknown };
}

/* ---------- Trip extraction ------------------------------------------------- */

export interface WialonTripConfig {
  /** Trip detection type/mode (vendor-specific) */
  type?: number;
  /** Enable GPS correction (0/1) */
  gpsCorrection?: number;
  /** Minimum satellites for valid position */
  minSat?: number;
  /** Minimum speed to consider movement (km/h) */
  minMovingSpeed?: number;
  /** Minimum stay time to split trips (seconds) */
  minStayTime?: number;
  /** Max distance between consecutive messages (meters) */
  maxMessagesDistance?: number;
  /** Minimum trip duration (seconds) */
  minTripTime?: number;
  /** Minimum trip distance (meters) */
  minTripDistance?: number;

  [key: string]: unknown;
}

// src/types/wialon-resource.ts
/* ------------------------------------------------------------------
 * Wialon “avl_resource” (geofences/POIs) — TypeScript typings
 * Based on your sample shape with safe, extensible types.
 * ------------------------------------------------------------------ */

export type UnixSeconds = number;

/** Common lon/lat point (x = lon, y = lat) */
export interface WialonPoint {
  x: number;
  y: number;
}

/** Bounding box for a zone */
export interface WialonBBox {
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
  cen_x: number;
  cen_y: number;
}

/** Zone type codes (commonly used in Wialon) */
export type WialonZoneType =
  | 1 // polygon
  | 2 // polyline
  | 3 // circle
  | number; // fallback for vendor/custom types

/** Base properties shared by all zones */
export interface WialonZoneBase {
  id: number;          // zone id
  n: string;           // name
  d?: string;          // description
  rid: number;         // resource id
  t: WialonZoneType;   // geometry type
  w?: number;          // stroke width
  f?: number;          // fill opacity/flags (vendor-specific)
  c?: number;          // fill color (ARGB as number)
  tc?: number;         // text color (ARGB as number)
  ts?: number;         // text size
  min?: number;        // min threshold (semantics depend on setup)
  max?: number;        // max threshold
  i?: number;          // misc/icon color/flags (vendor-specific)
  icon?: string;       // absolute icon url
  libId?: number;      // icon library id
  path?: string;       // icon path within the library
  b?: WialonBBox;      // bounding box for geometry
  ct?: UnixSeconds;    // created at
  mt?: UnixSeconds;    // modified at
  /** Allow additional unknown zone props */
  [key: string]: unknown;
}

/** Circle zone: points array has a single center with radius r */
export interface WialonCirclePoint extends WialonPoint {
  r: number; // radius (meters)
}
export interface WialonCircleZone extends WialonZoneBase {
  t: 3;
  p: WialonCirclePoint[]; // typically length = 1
}

/** Polygon zone: points array is a closed ring of vertices */
export interface WialonPolygonZone extends WialonZoneBase {
  t: 1;
  p: WialonPoint[]; // first/last may be equal depending on source
}

/** Polyline zone: points array is an ordered path of vertices */
export interface WialonPolylineZone extends WialonZoneBase {
  t: 2;
  p: WialonPoint[];
}

/** Fallback zone when t is an unknown numeric code */
export interface WialonUnknownZone extends WialonZoneBase {
  t: number;
  p: Record<string, number>[]; // keep numeric keys (x,y, r, etc.)
}

/** Discriminated union for zone shapes */
export type WialonZone =
  | WialonCircleZone
  | WialonPolygonZone
  | WialonPolylineZone
  | WialonUnknownZone;

/** Root resource object carrying the zones list */
export interface WialonResource {
  type: 'avl_resource';
  version: string; // e.g., "b4"
  mu: number;
  zones: WialonZone[];
  /** Forward-compatibility for extra fields on the resource */
  [key: string]: unknown;
}

/* ---------- Example: strongly-typed sample ------------------------------- */
// const sample: WialonResource = {
//   type: 'avl_resource',
//   version: 'b4',
//   mu: 0,
//   zones: [
//     {
//       id: 68,
//       n: '24 Hour Medical Centre (+263776008387)',
//       d: 'Manyoba Rd, Nketa, Bulawayo, Zimbabwe',
//       rid: 25138250,
//       t: 3,
//       w: 100,
//       f: 112,
//       c: 2568583984,
//       tc: 16733440,
//       ts: 12,
//       min: 0,
//       max: 11,
//       i: 3287700120,
//       icon: '/avl_library_image/0/0/library/poi/Q_1.png',
//       libId: 0,
//       path: 'library/poi/Q_1.png',
//       b: {
//         min_x: 28.5295702364,
//         min_y: -20.1936963404,
//         max_x: 28.5314837636,
//         max_y: -20.1918896596,
//         cen_x: 28.530527,
//         cen_y: -20.192793,
//       },
//       p: [{ x: 28.530527, y: -20.192793, r: 100 }],
//       ct: 1725443673,
//       mt: 1725445788,
//     },
//   ],
// };
// src/types/wialon-reports.ts
/* ------------------------------------------------------------------
 * Wialon “reports” payload — TypeScript typings
 * Matches your sample shape while remaining extensible/safe.
 * ------------------------------------------------------------------ */

export interface WialonReportsPayload {
  reports: WialonReport[];
}

/** Context object type a report is bound to */
export type WialonReportContextType =
  | 'avl_unit'
  | 'avl_resource'
  | string; // fallback for vendor/custom

/** A single report definition */
export interface WialonReport {
  id: number;
  n: string;                    // name
  ct: WialonReportContextType;  // context, e.g. "avl_unit"
  /**
   * Parameters JSON as string in the raw payload.
   * Typical shape: {"descr":"","bind":{"avl_unit":[]}}
   */
  p: string;
  tbl: WialonReportTable[];
  bsfl?: {
    ct: number; // created at (unix seconds)
    mt: number; // modified at (unix seconds)
  };
  [k: string]: unknown; // forward-compat fields
}

/** Known table names seen in your sample (fallback to string) */
export type WialonReportTableName =
  | 'unit_stays'
  | 'unit_videos'
  | 'unit_photos'
  | 'unit_events'
  | 'unit_fillings'
  | 'unit_speedings'
  | 'unit_thefts'
  | 'unit_stats'
  | 'unit_trips'
  | 'unit_generic'
  | 'unit_chart'
  | 'unit_stops'
  | string;

/** Known filter keys seen in your sample (fallback to string) */
export type WialonReportFilterKey =
  | 'duration'
  | 'mileage'
  | 'base_eh_sensor'
  | 'engine_hours'
  | 'speed'
  | 'stops'
  | 'sensors'
  | 'sensor_name'
  | 'driver'
  | 'trailer'
  | 'geozones_ex'
  | 'fillings'
  | 'charges'
  | 'thefts'
  | 'custom_sensor_name'
  | string;

/** Schedule object present on each table */
export interface WialonReportSchedule {
  f1: number;
  f2: number;
  t1: number;
  t2: number;
  m: number;
  y: number;
  w: number;
  fl: number;
}

/**
 * A report “table” (section).
 * Many props are JSON-encoded strings in raw payload (c, cl, cp, s, sl, p).
 */
export interface WialonReportTable {
  n: WialonReportTableName;      // internal name/id
  l: string;                     // label
  c?: string;                    // JSON string: string[] column keys
  cl?: string;                   // JSON string: string[] column labels
  cp?: string;                   // JSON string: unknown[] column params
  s?: string;                    // JSON string: string[] settings keys
  sl?: string;                   // JSON string: string[] settings labels
  filter_order: WialonReportFilterKey[];
  p: string;                     // JSON string: filters/params object
  sch: WialonReportSchedule;     // schedule
  f: number;                     // flags
  [k: string]: unknown;          // forward-compat fields
}

/* -------------------- Normalized helpers (optional) --------------------- */
/**
 * Parsed/normalized shapes if you want strongly-typed access after
 * JSON.parse on c/cl/cp/s/sl/p.
 */
export interface WialonReportTableNormalized
  extends Omit<WialonReportTable, 'c' | 'cl' | 'cp' | 's' | 'sl' | 'p'> {
  columns?: string[];
  columnLabels?: string[];
  columnParams?: unknown[];
  settings?: string[];
  settingsLabels?: string[];
  params?: Record<string, unknown>;
}

export interface WialonReportNormalized
  extends Omit<WialonReport, 'p' | 'tbl'> {
  params?: Record<string, unknown>;
  tbl: WialonReportTableNormalized[];
}



/** Normalize one table */
export function normalizeReportTable(t: WialonReportTable): WialonReportTableNormalized {
  return {
    ...t,
    columns: safeParseJSON<string[]>(t.c),
    columnLabels: safeParseJSON<string[]>(t.cl),
    columnParams: safeParseJSON<unknown[]>(t.cp),
    settings: safeParseJSON<string[]>(t.s),
    settingsLabels: safeParseJSON<string[]>(t.sl),
    params: safeParseJSON<Record<string, unknown>>(t.p),
  };
}

/** Normalize a full report */
export function normalizeReport(r: WialonReport): WialonReportNormalized {
  return {
    ...r,
    params: safeParseJSON<Record<string, unknown>>(r.p),
    tbl: r.tbl.map(normalizeReportTable),
  };
}
// Single report type for the "rep" object
export interface WialonResourceReport {
  id: number;
  n: string;     // Report name
  ct: string;    // "avl_unit" (report context type)
  c: number;     // Report code/id
}

// "rep" can have any number of numbered keys (1, 2, 3, ...)
export interface WialonResourceRep {
  [key: string]: WialonResourceReport;
}

// One resource in the "items" array
export interface WialonResourceListItem {
  nm: string;          // Resource name
  cls: number;         // Class/type (3 = resource)
  id: number;          // Resource ID
  mu: number;          // (unknown, usually 0)
  rep: WialonResourceRep;    // Reports for this resource
  repmax: number;      // Max report index or count, sometimes unused
  uacl: number;        // User access control list
}

export interface WialonResourceSearchResponse {
  searchSpec: {
    itemsType: string;
    propName: string;
    propValueMask: string;
    sortType: string;
    propType: string;
    or_logic: string | number;
  };
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: WialonResourceListItem[];
}
// src/types/wialon-session.ts
/* ------------------------------------------------------------------
 * Wialon “bootstrap/session” payload — TypeScript typings
 * Matches the structure you pasted while staying forward-compatible.
 * ------------------------------------------------------------------ */

export interface WialonSessionPayload {
  host: string;                 // e.g. "4.240.39.200"
  eid: string;
  gis_sid: string;
  au: string;                   // account/user email/login
  tm: number;                   // unix timestamp (s)
  wsdk_version: string;
  base_url: string;             // API base
  hw_gw_ip?: string;
  hw_gw_dns?: string;

  // Map services
  gis_search?: string;
  gis_render?: string;
  gis_geocode?: string;
  gis_routing?: string;

  billing_by_codes?: string;    // "0" | "1" (stringly-typed in payload)
  drivers_feature_flags?: string;

  user: WialonUser;
  /** JSON string with token details (see WialonTokenParsed) */
  token: string;
  /** Another token/hash value (opaque) */
  th: string;

  classes: WialonClasses;
  features: WialonFeatures;

  video_service_url?: string;

  [k: string]: unknown;         // forward-compat fields
}

/* ------------------------- User & props ------------------------- */

export interface WialonUser {
  nm: string;                   // username (login/email)
  cls: number;                  // class/type bitmask
  id: number;                   // user id
  prp: WialonUserProperties;    // user properties (mostly string values)
  crt: number;                  // creator id
  bact: number;                 // base resource id
  mu: number;                   // measurement units bitmask
  ct: number;                   // created time (unix s)

  ftp?: { ch: number; tp: number; fl: number };

  fl: number;                   // flags
  hm: string;                   // home page
  ld: number;                   // last login time (unix s)
  pfl: number;                  // profile flags

  /** Mobile app registrations keyed by integer-ish string ("1","2",...) */
  mapps?: Record<string, WialonMobileAppRegistration>;
  mappsmax?: number;

  /** User access control bitmask */
  uacl: number;

  [k: string]: unknown;
}

/**
 * Raw “prp” object carries many string values (some are JSON-encoded).
 * Keep it permissive and optionally parse known JSON strings into typed objects.
 */
export interface WialonUserProperties extends Record<string, string> {
  __sensolator_resource_id?: string;
  access_templates?: string;   // JSON string → WialonAccessTemplates
  autocomplete?: string;       // JSON string → WialonAutocompleteLists
  // dozens of other string flags/settings are left as string values
}

/* ------------------------- Mobile app registration -------------- */

export interface WialonMobileAppRegistration {
  id: number;
  n: string;                   // app name
  uid: string;                 // push token
  cp?: { ui: number; un: string };
  as?: { appid: string; device: string; type: string }; // e.g. { type: "fcm" }
  e?: number;                  // enabled
  ct?: number;                 // created time (unix s)
  mt?: number;                 // modified time (unix s)
  [k: string]: unknown;
}

/* ------------------------- Classes & features ------------------- */

export interface WialonClasses {
  avl_hw: number;
  avl_resource: number;
  avl_retranslator: number;
  avl_route: number;
  avl_unit: number;
  avl_unit_group: number;
  user: number;
  [k: string]: number;
}

export interface WialonFeatures {
  unlim: number;
  /** Service flags: 0/1 numeric values keyed by service name */
  svcs: Record<string, 0 | 1 | number>;
}

/* ------------------------- Optional parsed helpers -------------- */
/** Parsed structure of `token` JSON string when you choose to JSON.parse it */
export interface WialonTokenParsed {
  app: string;                 // "wialon"
  ct: number;                  // created at (unix s)
  at: number;                  // active at (unix s)
  dur: number;                 // duration (s)
  fl: number;                  // flags
  p: string;                   // payload (JSON string)
  items: unknown[];            // permitted items
}

/** Parsed structure of `prp.access_templates` */
export interface WialonAccessTemplates {
  avl_unit: {
    id: number;
    name: string;
    color?: string;
    acl: number;               // access mask (bitwise / -1 for full)
  }[];
  avl_unit_group: unknown[];
  avl_resource: unknown[];
  avl_route: unknown[];
  user: unknown[];
  [k: string]: unknown;
}

/** Parsed structure of `prp.autocomplete` */
export interface WialonAutocompleteLists {
  brand?: string[];
  model?: string[];
  color?: string[];
  primary_fuel_type?: string[];
  cargo_type?: string[];
  engine_model?: string[];
  [k: string]: string[] | undefined;
}

/* ------------------------- Utilities (optional) ----------------- */
/** Safe JSON.parse for string fields that sometimes contain JSON */
export function safeParseJSON<T = unknown>(s?: string): T | undefined;
export function safeParseJSON<T = unknown>(s: string, defaultValue: T): T;
export function safeParseJSON<T = unknown>(s?: string, defaultValue?: T): T | undefined {
  if (!s) return defaultValue;

  try {
    return JSON.parse(s) as T;
  } catch {
    return defaultValue;
  }
}

/** Convenience helpers to parse common JSON-encoded user props */
export function parseAccessTemplates(prp: WialonUserProperties): WialonAccessTemplates | undefined {
  return safeParseJSON<WialonAccessTemplates>(prp.access_templates);
}
export function parseAutocomplete(prp: WialonUserProperties): WialonAutocompleteLists | undefined {
  return safeParseJSON<WialonAutocompleteLists>(prp.autocomplete);
}
export function parseToken(token: string): WialonTokenParsed | undefined {
  return safeParseJSON<WialonTokenParsed>(token);
}
// src/types/wialon-search.ts
/* ------------------------------------------------------------------
 * Wialon core/search_items — typed responses for avl_unit & avl_resource
 * Based on the two payloads you pasted.
 * ------------------------------------------------------------------ */

export type WialonItemsType =
  | "avl_unit"
  | "avl_unit_group"
  | "avl_resource"
  | "avl_route"
  | "user"
  | string; // keep open-ended for other classes

export interface WialonSearchSpec {
  itemsType: WialonItemsType;
  propName: string;            // e.g., "sys_name"
  propValueMask: string;       // e.g., "*"
  sortType?: string;           // e.g., "sys_name"
  propType?: string;           // empty string in your sample
  or_logic?: "0" | "1" | string; // Wialon often stringifies 0/1
}

/** Generic search response container */
export interface WialonSearchResponse<TItem> {
  searchSpec: WialonSearchSpec;
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: TItem[];
}

/* ---------------------- Items: Units --------------------------- */

export interface WialonUnitListItem {
  nm: string;   // name, e.g. "21H - ADS 4865"
  cls: number;  // class id (2 for avl_unit)
  id: number;   // unit id
  mu: number;   // measurement units bitmask
  uacl: number; // access mask
}

export type WialonUnitSearchResponse = WialonSearchResponse<WialonUnitListItem>;

/* ---------------------- Items: Resources ---------------------- */

export interface WialonReportTemplateSummary {
  id: number;                // template id
  n: string;                 // template name
  ct: WialonItemsType;       // bound class type, e.g. "avl_unit"
  c: number;                 // internal checksum/code
}

/** Map of report template id (as string) -> summary */
export type WialonResourceReportsMap = Record<string, WialonReportTemplateSummary>;

export interface WialonResourceListItem {
  nm: string;                 // resource name
  cls: number;                // class id (3 for avl_resource)
  id: number;                 // resource id
  mu: number;                 // measurement units bitmask
  rep: WialonResourceReportsMap;
  repmax: number;             // max templates (0 means unlimited / not set)
  uacl: number;               // access mask
}

export type WialonResourceSearchResponse = WialonSearchResponse<WialonResourceListItem>;
// src/types/wialon-geofences-and-unit.ts

/* ------------------------------------------------------------------
 * Wialon — Geofences (zones) & full Unit payload typings
 * Derived from the JSON fragments you shared.
 * ------------------------------------------------------------------ */

/* ===================== Common helpers ===================== */

export interface WialonMsgFilter {
  enabled: number;
  skipInvalid: number;
  lbsCorrection: number;
  wifiCorrection: number;
  minSats: number;
  maxHdop: number;
  maxSpeed: number;
  minWifiPoints: number;
  maxWifiPoints: number;
  wifiAccuracy: number;
}

export interface WialonSpeedSource {
  speed_parameter: string;
  speed_measure: string; // "0" etc.
}

export interface WialonAdvProps {
  monitoring_sensor: string;
  use_sensor_color: string;       // "0" | "1"
  monitoring_sensor_id: string;
  motion_state_sensor_id: string;
  monitoring_battery_id: string;
  track_sensor: string;
  sensors_colors: string;
  sensors_colors_id: string;
  track_solid: string;
  solid_colors: string;
  track_speed: string;
  speed_colors: string;
  label_color: string;
  trip_colors: string;
  msgFilter: WialonMsgFilter;
  speed_source: WialonSpeedSource;
}

/* ===================== Unit: General / Icon / HW ===================== */

export interface WialonGeneralInfo {
  n: string;      // name
  uid: string;    // unique id (IMEI)
  uid2: string;
  ph: string;     // phone
  ph2: string;
  psw: string;
  hw: string;     // hardware model
}

export interface WialonIconRef {
  lib: string;        // library id as string
  url: string;        // e.g. "A_39.png"
  imgRot: string;     // rotation flag as string ("0")
}

export type WialonHWParamType = "text" | "bool" | "int" | string;

export interface WialonHWParam {
  default: string;
  description: string;
  label: string;
  maxval: number;
  minval: number;
  name: string;
  readonly: 0 | 1;
  type: WialonHWParamType;
  value: string; // values are stringified in examples
}

export interface WialonHWConfig {
  hw: string;
  fullData: number;
  params: WialonHWParam[];
}

/* ===================== Unit: Counters / Profile / Health ===================== */

export interface WialonCounters {
  [key: string]: number;
  cfl?: number;
  cnm?: number;
  cneh?: number;
  cnkb?: number;
}

export interface WialonProfileField {
  id: number;
  n: string;   // name
  v: string;   // value as string
  ct: number;  // created (unix)
  mt: number;  // modified (unix)
}

export interface WialonHealthRule {
  period: "none" | "1h" | "1d" | string;
  unhealthy_conditions?: { type: "less" | "greater" | string; value: number }[];
}

export interface WialonHealthCheck {
  missing_position_data: WialonHealthRule;
  insufficient_satellite_coverage: WialonHealthRule;
  low_battery: WialonHealthRule;
  voltage_out_of_range: WialonHealthRule;
  max_messages_last_hour: WialonHealthRule;
  max_distance_between_messages: WialonHealthRule;
  no_data: WialonHealthRule;
  stuck_fls: WialonHealthRule;
  ignition_is_off: WialonHealthRule;
}

/* ===================== Unit: Sensors ===================== */

export interface WialonSensorTablePoint {
  x: number;
  a: number;
  b: number;
}

export interface WialonSensor {
  id: number;
  n: string;        // name
  t: string;        // type, e.g. "fuel level", "voltage", "accelerometer"
  d: string;        // description / calibration header
  m: string;        // measurement units (e.g. "l", "V", "g")
  p: string;        // parameter mapping, e.g. "io_270"
  f: number;        // flags
  c: string;        // JSON string with sensor config
  vt: number;
  vs: number;
  tbl: WialonSensorTablePoint[]; // calibration table
  ct: number;  // created
  mt: number;  // modified
}

/* ===================== Unit: Reports / Driving / Trip ===================== */

export interface WialonFuelConsRates {
  consSummer: number;
  consWinter: number;
  winterMonthFrom: number;
  winterDayFrom: number;
  winterMonthTo: number;
  winterDayTo: number;
}

export interface WialonReportProps {
  speedLimit: number;
  maxMessagesInterval: number;
  dailyEngineHoursRate: number;
  urbanMaxSpeed: number;
  mileageCoefficient: number;
  fuelRateCoefficient: number;
  speedingTolerance: number;
  speedingMinDuration: number;
  speedingMode: number;
  driver_activity: { type: number };
  fuelConsRates: WialonFuelConsRates;
}

export interface WialonDrivingValidator {
  flags: number;
  min_value?: number;
  max_value?: number;
  max_duration?: number;
  min_duration?: number;
  max_speed?: number;
  min_speed?: number;
  max?: number;
  min?: number;
  name: string;
  penalties: number;
  validator_id?: number;
}

export interface WialonDrivingConfig {
  acceleration: WialonDrivingValidator[];
  brake: WialonDrivingValidator[];
  global: { accel_mode: string };
  idling: WialonDrivingValidator[];
  speeding: WialonDrivingValidator[];
  turn: WialonDrivingValidator[];
}

export interface WialonTripConfig {
  type: number;
  gpsCorrection: number;
  minSat: number;
  minMovingSpeed: number;
  minStayTime: number;
  maxMessagesDistance: number;
  minTripTime: number;
  minTripDistance: number;
}

/* ===================== Full Unit (avl_unit) ===================== */

export interface WialonAvlUnitFull {
  type?: "avl_unit"; // when present
  version?: string;
  mu?: number;

  general: WialonGeneralInfo;
  icon: WialonIconRef;
  hwConfig: WialonHWConfig;

  counters: WialonCounters;

  advProps: WialonAdvProps;

  fields: unknown[];
  afields: unknown[];
  profile: WialonProfileField[];
  intervals: unknown[];

  healthCheck: WialonHealthCheck;
  sensors: WialonSensor[];

  reportProps: WialonReportProps;
  aliases: unknown[];

  driving: WialonDrivingConfig;
  trip: WialonTripConfig;
}

/* ===================== Geofences (Zones in avl_resource) ===================== */

/** Bounding box around a zone */
export interface WialonBBox {
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
  cen_x: number;
  cen_y: number;
}

/** A simple 2D point */
export interface WialonXY {
  x: number; // lon
  y: number; // lat
}

/** Circle geometry (center + radius in meters) */
export interface WialonZoneCirclePoint extends WialonXY {
  r: number;
}

/** Base metadata for a zone (geofence / POI / polygon) */
export interface WialonZoneBase {
  id: number;
  n: string;          // name
  d?: string;         // description / address
  rid: number;        // resource id owner
  t: number;          // type (3 in your example, but keep numeric)
  w: number;          // width/weight (semantics differ by type)
  f: number;          // flags/format
  c: number;          // color (ARGB as uint32)
  tc: number;         // text color
  ts: number;         // text size
  min: number;
  max: number;
  i: number;          // icon color/int
  icon: string;       // icon path (absolute)
  libId: number;      // library id
  path: string;       // icon path (relative)
  b: WialonBBox;      // bounding box
  ct: number;         // created (unix)
  mt: number;         // modified (unix)
}

/** Circle zone */
export interface WialonZoneCircle extends WialonZoneBase {
  p: WialonZoneCirclePoint[]; // typically single element
}

/** Polygon / Polyline zone */
export interface WialonZonePolygon extends WialonZoneBase {
  p: WialonXY[]; // vertices
}

/** Union of possible zone shapes */
export type WialonZone = WialonZoneCircle | WialonZonePolygon;

/* ===================== Resource (with zones & reports) ===================== */

export interface WialonReportTemplate {
  id: number;
  n: string;
  ct: "avl_unit" | "avl_unit_group" | "user" | "avl_resource" | string;
  p: string; // JSON string with binding params
  tbl: {
    n: string;        // table key
    l: string;        // label
    c: string;        // columns included (JSON array as string)
    cl: string;       // column labels (JSON array as string)
    cp: string;       // column params (JSON array as string)
    s: string;        // settings keys (JSON array as string)
    sl: string;       // settings labels (JSON array as string)
    filter_order: string[]; // filter order keys
    p: string;        // parameters JSON string
    sch: { f1: number; f2: number; t1: number; t2: number; m: number; y: number; w: number; fl: number };
    f: number;
  }[];
  bsfl: { ct: number; mt: number };
}

export interface WialonResourceWithZones {
  type: "avl_resource";
  version: string;
  mu: number;
  zones: WialonZone[];
  // optional reports list if loaded together
  reports?: WialonReportTemplate[];
}

/* ===================== Alias: your requested name ===================== */
/** Back-compat alias for your snippet's requested name */
export type Geofences = WialonResourceWithZones;
