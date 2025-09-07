/**
 * Minimal, practical Wialon types for fleet apps.
 * Extend as needed when you consume more fields.
 */

/** A single decoded track position (seconds since epoch). */
export interface WialonPosition {
  /** Unix timestamp (seconds) */
  t: number;
  /** Latitude */
  lat: number;
  /** Longitude */
  lon: number;
  /** Speed (km/h) if available */
  sp?: number;
  /** Course/heading (degrees) if available */
  cr?: number;
  /** Optional extras (altitude, satellites, etc.) */
  [k: string]: unknown;
}

/** Core shape of a Wialon unit (vehicle). */
export interface WialonUnit {
  id: number;
  /** Name; Wialon often uses `nm` */
  nm?: string;
  /** System name; sometimes present as `sys_name` */
  sys_name?: string;
  /** Last known position */
  pos?: {
    t?: number;
    y?: number; // latitude
    x?: number; // longitude
    sp?: number;
    cr?: number;
    [k: string]: unknown;
  };
  /** Last message object (alternative to pos) */
  lmsg?: unknown;
  /** Arbitrary extra fields Wialon may return */
  [k: string]: unknown;
}

/** Search result for lists like core/search_items - matches actual API response structure */
export interface WialonSearchItemsResult<T = unknown> {
  searchSpec: {
    itemsType: string;
    propName: string;
    propValueMask: string;
    sortType: string;
    propType?: string;
    or_logic?: string;
  };
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: T[];
}

/** Report export response commonly returns a URL or descriptor. */
export interface WialonReportExport {
  /** Direct or relative URL to the exported file */
  url?: string;
  /** Optional additional meta */
  [k: string]: unknown;
}

/** Useful flags to request richer unit details. */
export const WialonFlags = {
  /** Generous bitmask to include core fields & last position */
  UNIT_RICH: 0x0001ffff,
} as const;
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
export interface WialonAvlUnit {
  type: "avl_unit";
  version: string;
  mu: number;
  general: {
    n: string;          // unit name
    uid: string;        // main IMEI
    uid2: string;       // second sim/IMEI
    ph: string;         // phone
    ph2: string;        // alt phone
    psw: string;
    hw: string;         // hardware type
  };
  icon: {
    lib: string;
    url: string;
    imgRot: string;
  };
  hwConfig: {
    hw: string;
    fullData: number;
    params: WialonHwParam[];
  };
  counters: {
    cfl: number;
    cnm: number;
    cneh: number;
    cnkb: number;
  };
  advProps: {
    monitoring_sensor: string;
    use_sensor_color: string;
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
    msgFilter: {
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
    };
    speed_source: {
      speed_parameter: string;
      speed_measure: string;
    };
  };
  fields: unknown[];
  afields: unknown[];
  profile: WialonProfileField[];
  intervals: unknown[];
  healthCheck: WialonHealthCheck;
  sensors: WialonSensor[];
  reportProps: WialonReportProps;
  aliases: WialonAlias[];
  driving: WialonDrivingProfile;
  trip: WialonTripConfig;
}

// Hardware param (in hwConfig.params)
export interface WialonHwParam {
  default: string;
  description: string;
  label: string;
  maxval: number;
  minval: number;
  name: string;
  readonly: number;
  type: "text" | "bool" | "int" | string;
  value: string;
}

// Profile fields
export interface WialonProfileField {
  id: number;
  n: string;
  v: string;
  ct: number;
  mt: number;
}

// Health check (alerts)
export interface WialonHealthCheck {
  missing_position_data: { period: string };
  insufficient_satellite_coverage: { period: string };
  low_battery: { period: string; unhealthy_conditions: { type: string; value: number }[] };
  voltage_out_of_range: { period: string };
  max_messages_last_hour: { period: string };
  max_distance_between_messages: { period: string; unhealthy_conditions: { type: string; value: number }[] };
  no_data: { period: string };
  stuck_fls: { period: string };
  ignition_is_off: { period: string };
}

// Sensors
export interface WialonSensor {
  id: number;
  n: string;
  t: string;
  d: string;
  m: string;
  p: string;
  f: number;
  c: string; // config object, often as JSON string
  vt: number;
  vs: number;
  tbl: { x: number; a: number; b: number }[];
  ct: number;
  mt: number;
}

// Aliases (commands)
export interface WialonAlias {
  id: number;
  n: string;
  c: string;
  l: string;
  p: string;
  a: number;
  f: number;
  jp: string;
}

// Report Props
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
  fuelConsRates: {
    consSummer: number;
    consWinter: number;
    winterMonthFrom: number;
    winterDayFrom: number;
    winterMonthTo: number;
    winterDayTo: number;
  };
}

// Driving Profile
export interface WialonDrivingProfile {
  acceleration: WialonDrivingThreshold[];
  brake: WialonDrivingThreshold[];
  global: { accel_mode: string };
  harsh: WialonDrivingThreshold[];
  speeding: {
    flags: number;
    max_duration: number;
    max_value: number;
    min_duration: number;
    min_value: number;
    name: string;
    penalties: number;
  }[];
  turn: WialonDrivingThreshold[];
}

export interface WialonDrivingThreshold {
  flags: number;
  max_value: number;
  min_value: number;
  name: string;
  penalties: number;
}

// Trip config
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
// Single report type for the "rep" object
export interface WialonResourceReport {
  id: number;
  n: string;     // Report name
  ct: string;    // "avl_unit" (report context type)
  c: number;     // Report code/id
}

// "rep" can have any number of numbered keys (1, 2, 3, ...)
export type WialonResourceRep = Record<string, WialonResourceReport>;

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
// Core param for HW Config
export interface WialonHWConfigParam {
  default: string;
  description: string;
  label: string;
  maxval: number;
  minval: number;
  name: string;
  readonly: number;
  type: string;
  value: string;
}

// HW Config
export interface WialonHWConfig {
  hw: string;
  fullData: number;
  params: WialonHWConfigParam[];
}

// Sensor calibration table
export interface WialonSensorTableEntry {
  x: number;
  a: number;
  b: number;
}

// Sensor
export interface WialonSensor {
  id: number;
  n: string;           // Name
  t: string;           // Type (fuel level, voltage, etc)
  d: string;           // Description/calibration string
  m: string;           // Measure (unit)
  p: string;           // Parameter/code (e.g., io_273)
  f: number;
  c: string;           // JSON config as string
  vt: number;
  vs: number;
  tbl: WialonSensorTableEntry[];
  ct: number;
  mt: number;
}

// Health Check
export interface WialonHealthCondition {
  type: string;
  value: number;
}
export interface WialonHealthCheckPeriod {
  period: string;
  unhealthy_conditions?: WialonHealthCondition[];
}



// Profile field
export interface WialonProfileField {
  id: number;
  n: string;
  v: string;
  ct: number;
  mt: number;
}

// Driving rule
export interface WialonDrivingRule {
  flags: number;
  min_value: number;
  max_value?: number;
  min_duration?: number;
  max_duration?: number;
  name: string;
  penalties: number;
}

// Driving config
export interface WialonDrivingConfig {
  acceleration: WialonDrivingRule[];
  brake: WialonDrivingRule[];
  global: { accel_mode: string };
  harsh: WialonDrivingRule[];
  speeding: WialonDrivingRule[];
  turn: WialonDrivingRule[];
}

// Trip config
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

// Aliases
export interface WialonAlias {
  id: number;
  n: string;
  c: string;
  l: string;
  p: string;
  a: number;
  f: number;
  jp: string;
}

// Icon info
export interface WialonIcon {
  lib: string;
  url: string;
  imgRot: string;
}

// Main interface
export interface WialonAvlUnitResponse {
  type: string;                    // "avl_unit"
  version: string;
  mu: number;
  general: {
    n: string;
    uid: string;
    uid2: string;
    ph: string;
    ph2: string;
    psw: string;
    hw: string;
  };
  icon: WialonIcon;
  hwConfig: WialonHWConfig;
  counters: Record<string, number>;
  advProps: Record<string, unknown>;
  advProps: {
    monitoring_sensor: string;
    use_sensor_color: string;
    monitoring_sensor_id: string;
    motion_state_sensor_id: string;
    monitoring_battery_id: string;
  "track_sensor": "",
  "sensors_colors": "",
  "sensors_colors_id": "",
  "track_solid": "",
  "solid_colors": "",
  "track_speed": "",
  "speed_colors": "",
  "label_color": "",
  "trip_colors": "",
  "msgFilter": {
    "enabled": 0,
    "skipInvalid": 1,
    "lbsCorrection": 0,
    "wifiCorrection": 0,
    "minSats": 4,
    "maxHdop": 2,
    "maxSpeed": 0,
    "minWifiPoints": 2,
    "maxWifiPoints": 3,
    "wifiAccuracy": 10
  },
  "speed_source": { "speed_parameter": "", "speed_measure": "0" }
}, "general": {
  "n": "23H - AFQ 1324 (Int Sim)",
  "uid": "352592576285704",
  "uid2": "",
  "ph": "+891335182241",
  "ph2": "",
  "psw": "",
  "hw": "Teltonika FMB920"
},
"icon": { "lib": "600000003", "url": "A_39.png", "imgRot": "0" },
"hwConfig": {
  "hw": "Teltonika FMB920",
  "fullData": 1,
  "params": [
    {
      "default": "",
      "description": "Bytes order: 7,6,5,4,3,2,1,0. Byte numbers should be separated by comma. Usage Example: 6,5,4",
      "label": "IButton card number parsing mask",
      "maxval": 0,
      "minval": 0,
      "name": "ibutton_bytes_order",
      "readonly": 0,
      "type": "text",
      "value": ""
    },
    {
      "default": "",
      "description": "Indicate Communication Password",
      "label": "Communication Password",
      "maxval": 0,
      "minval": 0,
      "name": "comm_pass",
      "readonly": 0,
      "type": "text",
      "value": ""
    },
    {
      "default": "0",
      "description": "Use caiquen 212 by transparent channel",
      "label": "Use caiquen 212",
      "maxval": 0,
      "minval": 0,
      "name": "use_caiquen_212",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use caiquen 412 by transparent channel",
      "label": "Use caiquen 412",
      "maxval": 0,
      "minval": 0,
      "name": "use_caiquen_412",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use TPMS by transparent channel",
      "label": "Use TPMS",
      "maxval": 0,
      "minval": 0,
      "name": "use_tpms",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Power meter by transparent channel (Modbus protocol)",
      "label": "Power meter by transp",
      "maxval": 0,
      "minval": 0,
      "name": "power_meter",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "",
      "description": "Format: latitude;longitude or latitude,longitude,altitude(optional). Example: 53.13356;29.2274791 or 53.13356, 29.2274791",
      "label": "Coordinates for stationary units",
      "maxval": 0,
      "minval": 0,
      "name": "server_coord_and_time",
      "readonly": 0,
      "type": "text",
      "value": ""
    },
    {
      "default": "0",
      "description": "Bus Control Unit by transp",
      "label": "Bus Control Unit by transp",
      "maxval": 0,
      "minval": 0,
      "name": "bus_control",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Specific fuel controller by transparent channel",
      "label": "Fuel controller by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "parse_fuel_controller",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "TDI telemetria by transparent channel",
      "label": "TDI telemetria by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "tdi_telemetria",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "KN02 MAX RFID reader by transparent channel",
      "label": "KN02 MAX by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "kn02_max_transp",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Enable parsing of GetScale GS-404",
      "label": "Getscale GS-404 by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "gs_404",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use DZ300 speed sensor by transparent channel",
      "label": "DZ300 Speed sensor by transp",
      "maxval": 0,
      "minval": 0,
      "name": "dz300_speed_sensor",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use Chafon rfid reader by transparent channel",
      "label": "Chafon rfid by transp",
      "maxval": 0,
      "minval": 0,
      "name": "parse_chafon_rfid",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Teltonika DualCam is connected to device using the RS232 interface",
      "label": "DualCam connected",
      "maxval": 0,
      "minval": 0,
      "name": "dual_cam_connected",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Enable to get data from the Teltonika ADAS camera connected to the device via RS232",
      "label": "Teltonika ADAS connected",
      "maxval": 0,
      "minval": 0,
      "name": "adas_cam_connected",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use ETS RFID Reader by transparent channel",
      "label": "ETS RFID Reader by transp",
      "maxval": 0,
      "minval": 0,
      "name": "ets_rfid",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use BSTPL RFID Reader by transparent channel",
      "label": "BSTPL RFID Reader by transp",
      "maxval": 0,
      "minval": 0,
      "name": "bstpl_rfid",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "JT606X sensor current fuel level value by transparent channel",
      "label": "JT606X sensor by transp",
      "maxval": 0,
      "minval": 0,
      "name": "jointech_jt606x",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use JSN-SR04T-2.0 by transparent channel",
      "label": "Use JSN-SR04T-2.0",
      "maxval": 0,
      "minval": 0,
      "name": "jsn_sr04t_2_0",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Crash trace period(ms)",
      "label": "Crash trace period(ms)",
      "maxval": 1000,
      "minval": 0,
      "name": "io_257_period",
      "readonly": 0,
      "type": "int",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use Howen AI Box by transparent channel",
      "label": "Howen AI Box by transp",
      "maxval": 0,
      "minval": 0,
      "name": "parse_howen_ai_box",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use AM4160 by transparent channel",
      "label": "AM4160 by transp",
      "maxval": 0,
      "minval": 0,
      "name": "am4160",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use Hub 1 Wire by transparent channel",
      "label": "Hub 1 Wire by transp",
      "maxval": 0,
      "minval": 0,
      "name": "parse_hub_one_wire",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "SGBras RFID by transparent channel",
      "label": "SGBras RFID by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "sgbras_rfid",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Parse data from SGBras keyboard",
      "label": "SGBras keyboard data",
      "maxval": 0,
      "minval": 0,
      "name": "sgbras_keyboard",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Cipia by transparent channel",
      "label": "Cipia by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "cipia_transp",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "GetScale GS-302 by transparent channel",
      "label": "GS-302 by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "rs232_gs302",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "GS-601 by transparent channel",
      "label": "GS-601 by transp",
      "maxval": 0,
      "minval": 0,
      "name": "rs232_gs601",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "MR688B by transparent channel",
      "label": "MR688B by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "mr688b",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Uface 5 by RS-232 Delimiter mode",
      "label": "Uface 5 by RS-232 Delimiter mode",
      "maxval": 0,
      "minval": 0,
      "name": "rs232_uface_5",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use LinkedCore CAN60 by transparent channel",
      "label": "Use LinkedCore CAN60",
      "maxval": 0,
      "minval": 0,
      "name": "can60",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Enable parsing of DG400 by transparent channel",
      "label": "Use DG400",
      "maxval": 0,
      "minval": 0,
      "name": "dg400",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Enable UFH TAG parsing Chafon CF561-R by transparent channel",
      "label": "Parse UFH TAG from Chafon CF561-R",
      "maxval": 0,
      "minval": 0,
      "name": "parse_chafon_cfr561_r",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Do not register a response to a command from the tracker",
      "label": "Do not register response to command",
      "maxval": 0,
      "minval": 0,
      "name": "hide_ack",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    }
  ]
},
"counters": { "cfl": 275, "cnm": 410874, "cneh": 0, "cnkb": 0 },
"advProps": {
  "monitoring_sensor": "",
  "use_sensor_color": "0",
  "monitoring_sensor_id": "",
  "motion_state_sensor_id": "",
  "monitoring_battery_id": "",
  "track_sensor": "",
  "sensors_colors": "",
  "sensors_colors_id": "",
  "track_solid": "",
  "solid_colors": "",
  "track_speed": "",
  "speed_colors": "",
  "label_color": "",
  "trip_colors": "",
  "msgFilter": {
    "enabled": 0,
    "skipInvalid": 1,
    "lbsCorrection": 0,
    "wifiCorrection": 0,
    "minSats": 4,
    "maxHdop": 2,
    "maxSpeed": 0,
    "minWifiPoints": 2,
    "maxWifiPoints": 3,
    "wifiAccuracy": 10
  },
  "speed_source": { "speed_parameter": "", "speed_measure": "0" }
},
"fields": [],
"afields": [],
"profile": [
  { "id": 1, "n": "vehicle_class", "v": "heavy_truck", "ct": 1721828565, "mt": 1741619327 },
  { "id": 2, "n": "carrying_capacity", "v": "900", "ct": 1739466847, "mt": 1739466847 },
  { "id": 3, "n": "brand", "v": "Shacman", "ct": 1741619327, "mt": 1741619327 },
  { "id": 4, "n": "model", "v": "X3000", "ct": 1741619327, "mt": 1741619327 },
  { "id": 5, "n": "year", "v": "2020", "ct": 1741619327, "mt": 1741619327 },
  { "id": 6, "n": "color", "v": "White", "ct": 1741619327, "mt": 1741619327 },
  { "id": 7, "n": "engine_model", "v": "420HP", "ct": 1742967355, "mt": 1742967355 },
  { "id": 8, "n": "primary_fuel_type", "v": "Diesel", "ct": 1742967356, "mt": 1742967356 },
  { "id": 9, "n": "cargo_type", "v": "29.5 Ton (reefer)", "ct": 1742967356, "mt": 1742967356 },
  { "id": 10, "n": "effective_capacity", "v": "600", "ct": 1742967356, "mt": 1742967356 },
  { "id": 11, "n": "axles", "v": "2", "ct": 1742967356, "mt": 1742967356 }
],
"intervals": [],
"healthCheck": {
  "missing_position_data": { "period": "none" },
  "insufficient_satellite_coverage": { "period": "none" },
  "low_battery": { "period": "1h", "unhealthy_conditions": [{ "type": "less", "value": 20 }] },
  "voltage_out_of_range": { "period": "none" },
  "max_messages_last_hour": { "period": "none" },
  "max_distance_between_messages": {
    "period": "1h",
    "unhealthy_conditions": [{ "type": "greater", "value": 100000 }]
  },
  "no_data": { "period": "1d" },
  "stuck_fls": { "period": "none" },
  "ignition_is_off": { "period": "none" }
},
"sensors": [
  {
    "id": 1,
    "n": "Ignition",
    "t": "engine operation",
    "d": "",
    "m": "On/Off",
    "p": "io_1",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"consumption\":0,\"mu\":0,\"pos\":3,\"show_time\":false,\"timeout\":0}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1721828565,
    "mt": 1721828565
  },
  {
    "id": 2,
    "n": "Small Tank",
    "t": "fuel level",
    "d": "Fuel|1:0:178.92:20:356.83:40:534.74:60:712.66:80:890.57:100:1068.48:120:1246.39:140:1424.31:160:1602.22:180:1780.13:200",
    "m": "l",
    "p": "io_273",
    "f": 64,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"calc_fuel\":2,\"ci\":{},\"cm\":1,\"engine_sensors\":[1],\"fuel_params\":{\"extraFillingTimeout\":60,\"fillingsJoinInterval\":300,\"filterQuality\":10,\"flags\":5834,\"ignoreStayTimeout\":20,\"minFillingVolume\":20,\"minTheftTimeout\":20,\"minTheftVolume\":10,\"theftsJoinInterval\":300},\"lower_bound\":1,\"mu\":0,\"pos\":2,\"show_time\":false,\"upper_bound\":1780.13,\"flags\":\"64\"}",
    "vt": 0,
    "vs": 0,
    "tbl": [
      { "x": 1, "a": 0.112410071942, "b": -0.112410071942 },
      { "x": 178.92, "a": 0.11241639031, "b": -0.113540554213 },
      { "x": 356.83, "a": 0.11241639031, "b": -0.113540554213 },
      { "x": 534.74, "a": 0.112410071942, "b": -0.110161870504 },
      { "x": 712.66, "a": 0.11241639031, "b": -0.114664718116 },
      { "x": 890.57, "a": 0.11241639031, "b": -0.114664718116 },
      { "x": 1068.48, "a": 0.11241639031, "b": -0.114664718116 },
      { "x": 1246.39, "a": 0.112410071942, "b": -0.106789568345 },
      { "x": 1424.31, "a": 0.11241639031, "b": -0.115788882019 },
      { "x": 1602.22, "a": 0.11241639031, "b": -0.115788882019 }
    ],
    "ct": 1721828565,
    "mt": 1748926557
  },
  {
    "id": 3,
    "n": "Big Tank",
    "t": "fuel level",
    "d": "Fuel|1:0:355.83:40:709.65:80:1063.45:120:1417.25:160:1771.05:200:2124.87:240:2478.67:280:2832.47:320:3186.27:360:3539.3:400",
    "m": "l",
    "p": "io_270",
    "f": 64,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"calc_fuel\":2,\"ci\":{},\"cm\":1,\"engine_sensors\":[1],\"fuel_params\":{\"extraFillingTimeout\":60,\"fillingsJoinInterval\":300,\"filterQuality\":10,\"flags\":5834,\"ignoreStayTimeout\":10,\"minFillingVolume\":20,\"minTheftTimeout\":10,\"minTheftVolume\":10,\"theftsJoinInterval\":300},\"lower_bound\":1,\"mu\":0,\"pos\":1,\"show_time\":false,\"upper_bound\":3539.3,\"flags\":\"64\"}",
    "vt": 0,
    "vs": 0,
    "tbl": [
      { "x": 1, "a": 0.112730039737, "b": -0.112730039737 },
      { "x": 355.83, "a": 0.113051834266, "b": -0.227234186875 },
      { "x": 709.65, "a": 0.113058224986, "b": -0.231769361221 },
      { "x": 1063.45, "a": 0.113058224986, "b": -0.231769361221 },
      { "x": 1417.25, "a": 0.113058224986, "b": -0.231769361221 },
      { "x": 1771.05, "a": 0.113051834266, "b": -0.220451076819 },
      { "x": 2124.87, "a": 0.113058224986, "b": -0.234030525721 },
      { "x": 2478.67, "a": 0.113058224986, "b": -0.234030525721 },
      { "x": 2832.47, "a": 0.113058224986, "b": -0.234030525721 },
      { "x": 3186.27, "a": 0.113304818287, "b": -1.01974336459 }
    ],
    "ct": 1721828565,
    "mt": 1748926437
  },
  {
    "id": 4,
    "n": "External Voltage",
    "t": "voltage",
    "d": "",
    "m": "V",
    "p": "io_66/const1000",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":5,\"show_time\":false}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1721829751,
    "mt": 1721829751
  },
  {
    "id": 5,
    "n": "Signal Strenght",
    "t": "custom",
    "d": "",
    "m": "",
    "p": "gsm",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"mu\":0,\"pos\":4,\"show_time\":false,\"timeout\":0}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1721829751,
    "mt": 1721829751
  },
  {
    "id": 6,
    "n": "Harsh Acceleration Parameters",
    "t": "accelerometer",
    "d": "",
    "m": "g",
    "p": "io_67",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":8,\"show_time\":false}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1739468339,
    "mt": 1739468339
  },
  {
    "id": 7,
    "n": "Harsh Cornering Parameters",
    "t": "accelerometer",
    "d": "",
    "m": "g",
    "p": "io_11",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":6,\"show_time\":false}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1739466847,
    "mt": 1739466847
  },
  {
    "id": 8,
    "n": "Harsh Braking Parameters",
    "t": "accelerometer",
    "d": "",
    "m": "g",
    "p": "io_16",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":7,\"show_time\":false}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1739468339,
    "mt": 1739468339
  }
],
"reportProps": {
  "speedLimit": 0,
  "maxMessagesInterval": 0,
  "dailyEngineHoursRate": 0,
  "urbanMaxSpeed": 0,
  "mileageCoefficient": 0,
  "fuelRateCoefficient": 0,
  "speedingTolerance": 10,
  "speedingMinDuration": 1,
  "speedingMode": 0,
  "driver_activity": { "type": 0 },
  "fuelConsRates": {
    "consSummer": 10,
    "consWinter": 12,
    "winterMonthFrom": 11,
    "winterDayFrom": 1,
    "winterMonthTo": 1,
    "winterDayTo": 29
  }
},
"aliases": [],
"driving": {
  "acceleration": [
    { "flags": 2, "min_value": 0.5, "name": "Acceleration: extreme", "penalties": 2000 },
    {
      "flags": 2,
      "max_value": 0.5,
      "min_value": 0.4,
      "name": "Acceleration: medium",
      "penalties": 500
    }
  ],
  "brake": [
    {
      "flags": 2,
      "max_value": 0.5,
      "min_value": 0.4,
      "name": "Brake: extreme",
      "penalties": 2000
    },
    { "flags": 2, "min_value": 0.5, "name": "Brake: medium", "penalties": 500 }
  ],
  "global": { "accel_mode": "0" },
  "idling": [
    {
      "flags": 0,
      "max_value": 10800,
      "min_value": 1800,
      "name": "Idling",
      "penalties": 1,
      "validator_id": 1
    }
  ],
  "speeding": [
    {
      "flags": 2,
      "max_duration": 30,
      "max_speed": 95,
      "max_value": 95,
      "min_duration": 10,
      "min_speed": 85,
      "min_value": 85,
      "name": "Speeding: extreme",
      "penalties": 5000
    }
  ],
  "turn": [{ "flags": 2, "min_value": 0.5, "name": "Turn: extreme", "penalties": 500 }]
},
"trip": {
  "type": 1,
  "gpsCorrection": 1,
  "minSat": 2,
  "minMovingSpeed": 1,
  "minStayTime": 300,
  "maxMessagesDistance": 10000,
  "minTripTime": 60,
  "minTripDistance": 100
}// Can be further typed if needed
  fields: unknown[];
  afields: unknown[];
  profile: WialonProfileField[];
  intervals: unknown[];
  healthCheck: WialonHealthCheck;
  sensors: WialonSensor[];
  reportProps: Record<string, unknown>; // Can be further typed
  aliases: WialonAlias[];
  driving: WialonDrivingConfig;
  trip: WialonTripConfig;
}
advProps: {
  monitoring_sensor: string;
  use_sensor_color: string;
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
  msgFilter: {
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
  };
  speed_source: { speed_parameter: string; speed_measure: string; };
}

// Raw JSON data below - this should be moved to a separate data file or used as example data
/*
const exampleWialonUnit = {
  "general": {
    "n": "23H - AFQ 1324 (Int Sim)",
"uid": "352592576285704",
"uid2": "",
"ph": "+891335182241",
"ph2": "",
"psw": "",
"hw": "Teltonika FMB920"
},
"icon": { "lib": "600000003", "url": "A_39.png", "imgRot": "0" },
"hwConfig": {
"hw": "Teltonika FMB920",
"fullData": 1,
"params": [
  {
    "default": "",
    "description": "Bytes order: 7,6,5,4,3,2,1,0. Byte numbers should be separated by comma. Usage Example: 6,5,4",
    "label": "IButton card number parsing mask",
    "maxval": 0,
    "minval": 0,
    "name": "ibutton_bytes_order",
    "readonly": 0,
    "type": "text",
    "value": ""
  },
  {
    "default": "",
    "description": "Indicate Communication Password",
    "label": "Communication Password",
    "maxval": 0,
    "minval": 0,
    "name": "comm_pass",
    "readonly": 0,
    "type": "text",
    "value": ""
  },
  {
    "default": "0",
    "description": "Use caiquen 212 by transparent channel",
    "label": "Use caiquen 212",
    "maxval": 0,
    "minval": 0,
    "name": "use_caiquen_212",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use caiquen 412 by transparent channel",
    "label": "Use caiquen 412",
    "maxval": 0,
    "minval": 0,
    "name": "use_caiquen_412",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use TPMS by transparent channel",
    "label": "Use TPMS",
    "maxval": 0,
    "minval": 0,
    "name": "use_tpms",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Power meter by transparent channel (Modbus protocol)",
    "label": "Power meter by transp",
    "maxval": 0,
    "minval": 0,
    "name": "power_meter",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "",
    "description": "Format: latitude;longitude or latitude,longitude,altitude(optional). Example: 53.13356;29.2274791 or 53.13356, 29.2274791",
    "label": "Coordinates for stationary units",
    "maxval": 0,
    "minval": 0,
    "name": "server_coord_and_time",
    "readonly": 0,
    "type": "text",
    "value": ""
  },
  {
    "default": "0",
    "description": "Bus Control Unit by transp",
    "label": "Bus Control Unit by transp",
    "maxval": 0,
    "minval": 0,
    "name": "bus_control",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Specific fuel controller by transparent channel",
    "label": "Fuel controller by transparent",
    "maxval": 0,
    "minval": 0,
    "name": "parse_fuel_controller",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "TDI telemetria by transparent channel",
    "label": "TDI telemetria by transparent",
    "maxval": 0,
    "minval": 0,
    "name": "tdi_telemetria",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "KN02 MAX RFID reader by transparent channel",
    "label": "KN02 MAX by transparent",
    "maxval": 0,
    "minval": 0,
    "name": "kn02_max_transp",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Enable parsing of GetScale GS-404",
    "label": "Getscale GS-404 by transparent",
    "maxval": 0,
    "minval": 0,
    "name": "gs_404",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use DZ300 speed sensor by transparent channel",
    "label": "DZ300 Speed sensor by transp",
    "maxval": 0,
    "minval": 0,
    "name": "dz300_speed_sensor",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use Chafon rfid reader by transparent channel",
    "label": "Chafon rfid by transp",
    "maxval": 0,
    "minval": 0,
    "name": "parse_chafon_rfid",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Teltonika DualCam is connected to device using the RS232 interface",
    "label": "DualCam connected",
    "maxval": 0,
    "minval": 0,
    "name": "dual_cam_connected",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Enable to get data from the Teltonika ADAS camera connected to the device via RS232",
    "label": "Teltonika ADAS connected",
    "maxval": 0,
    "minval": 0,
    "name": "adas_cam_connected",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use ETS RFID Reader by transparent channel",
    "label": "ETS RFID Reader by transp",
    "maxval": 0,
    "minval": 0,
    "name": "ets_rfid",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use BSTPL RFID Reader by transparent channel",
    "label": "BSTPL RFID Reader by transp",
    "maxval": 0,
    "minval": 0,
    "name": "bstpl_rfid",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "JT606X sensor current fuel level value by transparent channel",
    "label": "JT606X sensor by transp",
    "maxval": 0,
    "minval": 0,
    "name": "jointech_jt606x",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use JSN-SR04T-2.0 by transparent channel",
    "label": "Use JSN-SR04T-2.0",
    "maxval": 0,
    "minval": 0,
    "name": "jsn_sr04t_2_0",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Crash trace period(ms)",
    "label": "Crash trace period(ms)",
    "maxval": 1000,
    "minval": 0,
    "name": "io_257_period",
    "readonly": 0,
    "type": "int",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use Howen AI Box by transparent channel",
    "label": "Howen AI Box by transp",
    "maxval": 0,
    "minval": 0,
    "name": "parse_howen_ai_box",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use AM4160 by transparent channel",
    "label": "AM4160 by transp",
    "maxval": 0,
    "minval": 0,
    "name": "am4160",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use Hub 1 Wire by transparent channel",
    "label": "Hub 1 Wire by transp",
    "maxval": 0,
    "minval": 0,
    "name": "parse_hub_one_wire",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "SGBras RFID by transparent channel",
    "label": "SGBras RFID by transparent",
    "maxval": 0,
    "minval": 0,
    "name": "sgbras_rfid",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Parse data from SGBras keyboard",
    "label": "SGBras keyboard data",
    "maxval": 0,
    "minval": 0,
    "name": "sgbras_keyboard",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Cipia by transparent channel",
    "label": "Cipia by transparent",
    "maxval": 0,
    "minval": 0,
    "name": "cipia_transp",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "GetScale GS-302 by transparent channel",
    "label": "GS-302 by transparent",
    "maxval": 0,
    "minval": 0,
    "name": "rs232_gs302",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "GS-601 by transparent channel",
    "label": "GS-601 by transp",
    "maxval": 0,
    "minval": 0,
    "name": "rs232_gs601",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "MR688B by transparent channel",
    "label": "MR688B by transparent",
    "maxval": 0,
    "minval": 0,
    "name": "mr688b",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Uface 5 by RS-232 Delimiter mode",
    "label": "Uface 5 by RS-232 Delimiter mode",
    "maxval": 0,
    "minval": 0,
    "name": "rs232_uface_5",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Use LinkedCore CAN60 by transparent channel",
    "label": "Use LinkedCore CAN60",
    "maxval": 0,
    "minval": 0,
    "name": "can60",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Enable parsing of DG400 by transparent channel",
    "label": "Use DG400",
    "maxval": 0,
    "minval": 0,
    "name": "dg400",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Enable UFH TAG parsing Chafon CF561-R by transparent channel",
    "label": "Parse UFH TAG from Chafon CF561-R",
    "maxval": 0,
    "minval": 0,
    "name": "parse_chafon_cfr561_r",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  },
  {
    "default": "0",
    "description": "Do not register a response to a command from the tracker",
    "label": "Do not register response to command",
    "maxval": 0,
    "minval": 0,
    "name": "hide_ack",
    "readonly": 0,
    "type": "bool",
    "value": "0"
  }
]
},
"counters": { "cfl": 275, "cnm": 410874, "cneh": 0, "cnkb": 0 },
"advProps": {
"monitoring_sensor": "",
"use_sensor_color": "0",
"monitoring_sensor_id": "",
"motion_state_sensor_id": "",
"monitoring_battery_id": "",
"track_sensor": "",
"sensors_colors": "",
"sensors_colors_id": "",
"track_solid": "",
"solid_colors": "",
"track_speed": "",
"speed_colors": "",
"label_color": "",
"trip_colors": "",
"msgFilter": {
  "enabled": 0,
  "skipInvalid": 1,
  "lbsCorrection": 0,
  "wifiCorrection": 0,
  "minSats": 4,
  "maxHdop": 2,
  "maxSpeed": 0,
  "minWifiPoints": 2,
  "maxWifiPoints": 3,
  "wifiAccuracy": 10
},
"speed_source": { "speed_parameter": "", "speed_measure": "0" }
},
"fields": [],
"afields": [],
"profile": [
{ "id": 1, "n": "vehicle_class", "v": "heavy_truck", "ct": 1721828565, "mt": 1741619327 },
{ "id": 2, "n": "carrying_capacity", "v": "900", "ct": 1739466847, "mt": 1739466847 },
{ "id": 3, "n": "brand", "v": "Shacman", "ct": 1741619327, "mt": 1741619327 },
{ "id": 4, "n": "model", "v": "X3000", "ct": 1741619327, "mt": 1741619327 },
{ "id": 5, "n": "year", "v": "2020", "ct": 1741619327, "mt": 1741619327 },
{ "id": 6, "n": "color", "v": "White", "ct": 1741619327, "mt": 1741619327 },
{ "id": 7, "n": "engine_model", "v": "420HP", "ct": 1742967355, "mt": 1742967355 },
{ "id": 8, "n": "primary_fuel_type", "v": "Diesel", "ct": 1742967356, "mt": 1742967356 },
{ "id": 9, "n": "cargo_type", "v": "29.5 Ton (reefer)", "ct": 1742967356, "mt": 1742967356 },
{ "id": 10, "n": "effective_capacity", "v": "600", "ct": 1742967356, "mt": 1742967356 },
{ "id": 11, "n": "axles", "v": "2", "ct": 1742967356, "mt": 1742967356 }
],
"intervals": [],
"healthCheck": {
"missing_position_data": { "period": "none" },
"insufficient_satellite_coverage": { "period": "none" },
"low_battery": { "period": "1h", "unhealthy_conditions": [{ "type": "less", "value": 20 }] },
"voltage_out_of_range": { "period": "none" },
"max_messages_last_hour": { "period": "none" },
"max_distance_between_messages": {
  "period": "1h",
  "unhealthy_conditions": [{ "type": "greater", "value": 100000 }]
},
"no_data": { "period": "1d" },
"stuck_fls": { "period": "none" },
"ignition_is_off": { "period": "none" }
},
"sensors": [
{
  "id": 1,
  "n": "Ignition",
  "t": "engine operation",
  "d": "",
  "m": "On/Off",
  "p": "io_1",
  "f": 0,
  "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"consumption\":0,\"mu\":0,\"pos\":3,\"show_time\":false,\"timeout\":0}",
  "vt": 0,
  "vs": 0,
  "tbl": [],
  "ct": 1721828565,
  "mt": 1721828565
},
{
  "id": 2,
  "n": "Small Tank",
  "t": "fuel level",
  "d": "Fuel|1:0:178.92:20:356.83:40:534.74:60:712.66:80:890.57:100:1068.48:120:1246.39:140:1424.31:160:1602.22:180:1780.13:200",
  "m": "l",
  "p": "io_273",
  "f": 64,
  "c": "{\"act\":1,\"appear_in_popup\":true,\"calc_fuel\":2,\"ci\":{},\"cm\":1,\"engine_sensors\":[1],\"fuel_params\":{\"extraFillingTimeout\":60,\"fillingsJoinInterval\":300,\"filterQuality\":10,\"flags\":5834,\"ignoreStayTimeout\":20,\"minFillingVolume\":20,\"minTheftTimeout\":20,\"minTheftVolume\":10,\"theftsJoinInterval\":300},\"lower_bound\":1,\"mu\":0,\"pos\":2,\"show_time\":false,\"upper_bound\":1780.13,\"flags\":\"64\"}",
  "vt": 0,
  "vs": 0,
  "tbl": [
    { "x": 1, "a": 0.112410071942, "b": -0.112410071942 },
    { "x": 178.92, "a": 0.11241639031, "b": -0.113540554213 },
    { "x": 356.83, "a": 0.11241639031, "b": -0.113540554213 },
    { "x": 534.74, "a": 0.112410071942, "b": -0.110161870504 },
    { "x": 712.66, "a": 0.11241639031, "b": -0.114664718116 },
    { "x": 890.57, "a": 0.11241639031, "b": -0.114664718116 },
    { "x": 1068.48, "a": 0.11241639031, "b": -0.114664718116 },
    { "x": 1246.39, "a": 0.112410071942, "b": -0.106789568345 },
    { "x": 1424.31, "a": 0.11241639031, "b": -0.115788882019 },
    { "x": 1602.22, "a": 0.11241639031, "b": -0.115788882019 }
  ],
  "ct": 1721828565,
  "mt": 1748926557
},
{
  "id": 3,
  "n": "Big Tank",
  "t": "fuel level",
  "d": "Fuel|1:0:355.83:40:709.65:80:1063.45:120:1417.25:160:1771.05:200:2124.87:240:2478.67:280:2832.47:320:3186.27:360:3539.3:400",
  "m": "l",
  "p": "io_270",
  "f": 64,
  "c": "{\"act\":1,\"appear_in_popup\":true,\"calc_fuel\":2,\"ci\":{},\"cm\":1,\"engine_sensors\":[1],\"fuel_params\":{\"extraFillingTimeout\":60,\"fillingsJoinInterval\":300,\"filterQuality\":10,\"flags\":5834,\"ignoreStayTimeout\":10,\"minFillingVolume\":20,\"minTheftTimeout\":10,\"minTheftVolume\":10,\"theftsJoinInterval\":300},\"lower_bound\":1,\"mu\":0,\"pos\":1,\"show_time\":false,\"upper_bound\":3539.3,\"flags\":\"64\"}",
  "vt": 0,
  "vs": 0,
  "tbl": [
    { "x": 1, "a": 0.112730039737, "b": -0.112730039737 },
    { "x": 355.83, "a": 0.113051834266, "b": -0.227234186875 },
    { "x": 709.65, "a": 0.113058224986, "b": -0.231769361221 },
    { "x": 1063.45, "a": 0.113058224986, "b": -0.231769361221 },
    { "x": 1417.25, "a": 0.113058224986, "b": -0.231769361221 },
    { "x": 1771.05, "a": 0.113051834266, "b": -0.220451076819 },
    { "x": 2124.87, "a": 0.113058224986, "b": -0.234030525721 },
    { "x": 2478.67, "a": 0.113058224986, "b": -0.234030525721 },
    { "x": 2832.47, "a": 0.113058224986, "b": -0.234030525721 },
    { "x": 3186.27, "a": 0.113304818287, "b": -1.01974336459 }
  ],
  "ct": 1721828565,
  "mt": 1748926437
},
{
  "id": 4,
  "n": "External Voltage",
  "t": "voltage",
  "d": "",
  "m": "V",
  "p": "io_66/const1000",
  "f": 0,
  "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":5,\"show_time\":false}",
  "vt": 0,
  "vs": 0,
  "tbl": [],
  "ct": 1721829751,
  "mt": 1721829751
},
{
  "id": 5,
  "n": "Signal Strenght",
  "t": "custom",
  "d": "",
  "m": "",
  "p": "gsm",
  "f": 0,
  "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"mu\":0,\"pos\":4,\"show_time\":false,\"timeout\":0}",
  "vt": 0,
  "vs": 0,
  "tbl": [],
  "ct": 1721829751,
  "mt": 1721829751
},
{
  "id": 6,
  "n": "Harsh Acceleration Parameters",
  "t": "accelerometer",
  "d": "",
  "m": "g",
  "p": "io_67",
  "f": 0,
  "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":8,\"show_time\":false}",
  "vt": 0,
  "vs": 0,
  "tbl": [],
  "ct": 1739468339,
  "mt": 1739468339
},
{
  "id": 7,
  "n": "Harsh Cornering Parameters",
  "t": "accelerometer",
  "d": "",
  "m": "g",
  "p": "io_11",
  "f": 0,
  "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":6,\"show_time\":false}",
  "vt": 0,
  "vs": 0,
  "tbl": [],
  "ct": 1739466847,
  "mt": 1739466847
},
{
  "id": 8,
  "n": "Harsh Braking Parameters",
  "t": "accelerometer",
  "d": "",
  "m": "g",
  "p": "io_16",
  "f": 0,
  "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":7,\"show_time\":false}",
  "vt": 0,
  "vs": 0,
  "tbl": [],
  "ct": 1739468339,
  "mt": 1739468339
}
],
"reportProps": {
"speedLimit": 0,
"maxMessagesInterval": 0,
"dailyEngineHoursRate": 0,
"urbanMaxSpeed": 0,
"mileageCoefficient": 0,
"fuelRateCoefficient": 0,
"speedingTolerance": 10,
"speedingMinDuration": 1,
"speedingMode": 0,
"driver_activity": { "type": 0 },
"fuelConsRates": {
  "consSummer": 10,
  "consWinter": 12,
  "winterMonthFrom": 11,
  "winterDayFrom": 1,
  "winterMonthTo": 1,
  "winterDayTo": 29
}
},
"aliases": [],
"driving": {
"acceleration": [
  { "flags": 2, "min_value": 0.5, "name": "Acceleration: extreme", "penalties": 2000 },
  {
    "flags": 2,
    "max_value": 0.5,
    "min_value": 0.4,
    "name": "Acceleration: medium",
    "penalties": 500
  }
],
"brake": [
  {
    "flags": 2,
    "max_value": 0.5,
    "min_value": 0.4,
    "name": "Brake: extreme",
    "penalties": 2000
  },
  { "flags": 2, "min_value": 0.5, "name": "Brake: medium", "penalties": 500 }
],
"global": { "accel_mode": "0" },
"idling": [
  {
    "flags": 0,
    "max_value": 10800,
    "min_value": 1800,
    "name": "Idling",
    "penalties": 1,
    "validator_id": 1
  }
],
"speeding": [
  {
    "flags": 2,
    "max_duration": 30,
    "max_speed": 95,
    "max_value": 95,
    "min_duration": 10,
    "min_speed": 85,
    "min_value": 85,
    "name": "Speeding: extreme",
    "penalties": 5000
  }
],
"turn": [{ "flags": 2, "min_value": 0.5, "name": "Turn: extreme", "penalties": 500 }]
},
"trip": {
"type": 1,
"gpsCorrection": 1,
"minSat": 2,
"minMovingSpeed": 1,
"minStayTime": 300,
"maxMessagesDistance": 10000,
"minTripTime": 60,
"minTripDistance": 100
}
// src/types/wialon.ts
/* ------------------------------------------------------------------
 * Shared Wialon-related typings
 * ------------------------------------------------------------------ */

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
  addListener(event: string, callback: (event: any) => void): number;
  removeListenerById(id: number): void;

  /* Messages API */
  getMessages(from: number, to: number, flags: number, callback: any): void;
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
  p?: any; // geometry
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
export interface geofences {
  advProps: {
    monitoring_sensor: string;
    use_sensor_color: string;
    monitoring_sensor_id: string;
    motion_state_sensor_id: string;
    monitoring_battery_id: string;
  "track_sensor": "",
  "sensors_colors": "",
  "sensors_colors_id": "",
  "track_solid": "",
  "solid_colors": "",
  "track_speed": "",
  "speed_colors": "",
  "label_color": "",
  "trip_colors": "",
  "msgFilter": {
    "enabled": 0,
    "skipInvalid": 1,
    "lbsCorrection": 0,
    "wifiCorrection": 0,
    "minSats": 4,
    "maxHdop": 2,
    "maxSpeed": 0,
    "minWifiPoints": 2,
    "maxWifiPoints": 3,
    "wifiAccuracy": 10
  },
  "speed_source": { "speed_parameter": "", "speed_measure": "0" }
}, "general": {
  "n": "23H - AFQ 1324 (Int Sim)",
  "uid": "352592576285704",
  "uid2": "",
  "ph": "+891335182241",
  "ph2": "",
  "psw": "",
  "hw": "Teltonika FMB920"
},
"icon": { "lib": "600000003", "url": "A_39.png", "imgRot": "0" },
"hwConfig": {
  "hw": "Teltonika FMB920",
  "fullData": 1,
  "params": [
    {
      "default": "",
      "description": "Bytes order: 7,6,5,4,3,2,1,0. Byte numbers should be separated by comma. Usage Example: 6,5,4",
      "label": "IButton card number parsing mask",
      "maxval": 0,
      "minval": 0,
      "name": "ibutton_bytes_order",
      "readonly": 0,
      "type": "text",
      "value": ""
    },
    {
      "default": "",
      "description": "Indicate Communication Password",
      "label": "Communication Password",
      "maxval": 0,
      "minval": 0,
      "name": "comm_pass",
      "readonly": 0,
      "type": "text",
      "value": ""
    },
    {
      "default": "0",
      "description": "Use caiquen 212 by transparent channel",
      "label": "Use caiquen 212",
      "maxval": 0,
      "minval": 0,
      "name": "use_caiquen_212",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use caiquen 412 by transparent channel",
      "label": "Use caiquen 412",
      "maxval": 0,
      "minval": 0,
      "name": "use_caiquen_412",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use TPMS by transparent channel",
      "label": "Use TPMS",
      "maxval": 0,
      "minval": 0,
      "name": "use_tpms",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Power meter by transparent channel (Modbus protocol)",
      "label": "Power meter by transp",
      "maxval": 0,
      "minval": 0,
      "name": "power_meter",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "",
      "description": "Format: latitude;longitude or latitude,longitude,altitude(optional). Example: 53.13356;29.2274791 or 53.13356, 29.2274791",
      "label": "Coordinates for stationary units",
      "maxval": 0,
      "minval": 0,
      "name": "server_coord_and_time",
      "readonly": 0,
      "type": "text",
      "value": ""
    },
    {
      "default": "0",
      "description": "Bus Control Unit by transp",
      "label": "Bus Control Unit by transp",
      "maxval": 0,
      "minval": 0,
      "name": "bus_control",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Specific fuel controller by transparent channel",
      "label": "Fuel controller by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "parse_fuel_controller",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "TDI telemetria by transparent channel",
      "label": "TDI telemetria by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "tdi_telemetria",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "KN02 MAX RFID reader by transparent channel",
      "label": "KN02 MAX by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "kn02_max_transp",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Enable parsing of GetScale GS-404",
      "label": "Getscale GS-404 by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "gs_404",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use DZ300 speed sensor by transparent channel",
      "label": "DZ300 Speed sensor by transp",
      "maxval": 0,
      "minval": 0,
      "name": "dz300_speed_sensor",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use Chafon rfid reader by transparent channel",
      "label": "Chafon rfid by transp",
      "maxval": 0,
      "minval": 0,
      "name": "parse_chafon_rfid",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Teltonika DualCam is connected to device using the RS232 interface",
      "label": "DualCam connected",
      "maxval": 0,
      "minval": 0,
      "name": "dual_cam_connected",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Enable to get data from the Teltonika ADAS camera connected to the device via RS232",
      "label": "Teltonika ADAS connected",
      "maxval": 0,
      "minval": 0,
      "name": "adas_cam_connected",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use ETS RFID Reader by transparent channel",
      "label": "ETS RFID Reader by transp",
      "maxval": 0,
      "minval": 0,
      "name": "ets_rfid",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use BSTPL RFID Reader by transparent channel",
      "label": "BSTPL RFID Reader by transp",
      "maxval": 0,
      "minval": 0,
      "name": "bstpl_rfid",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "JT606X sensor current fuel level value by transparent channel",
      "label": "JT606X sensor by transp",
      "maxval": 0,
      "minval": 0,
      "name": "jointech_jt606x",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use JSN-SR04T-2.0 by transparent channel",
      "label": "Use JSN-SR04T-2.0",
      "maxval": 0,
      "minval": 0,
      "name": "jsn_sr04t_2_0",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Crash trace period(ms)",
      "label": "Crash trace period(ms)",
      "maxval": 1000,
      "minval": 0,
      "name": "io_257_period",
      "readonly": 0,
      "type": "int",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use Howen AI Box by transparent channel",
      "label": "Howen AI Box by transp",
      "maxval": 0,
      "minval": 0,
      "name": "parse_howen_ai_box",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use AM4160 by transparent channel",
      "label": "AM4160 by transp",
      "maxval": 0,
      "minval": 0,
      "name": "am4160",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use Hub 1 Wire by transparent channel",
      "label": "Hub 1 Wire by transp",
      "maxval": 0,
      "minval": 0,
      "name": "parse_hub_one_wire",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "SGBras RFID by transparent channel",
      "label": "SGBras RFID by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "sgbras_rfid",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Parse data from SGBras keyboard",
      "label": "SGBras keyboard data",
      "maxval": 0,
      "minval": 0,
      "name": "sgbras_keyboard",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Cipia by transparent channel",
      "label": "Cipia by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "cipia_transp",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "GetScale GS-302 by transparent channel",
      "label": "GS-302 by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "rs232_gs302",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "GS-601 by transparent channel",
      "label": "GS-601 by transp",
      "maxval": 0,
      "minval": 0,
      "name": "rs232_gs601",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "MR688B by transparent channel",
      "label": "MR688B by transparent",
      "maxval": 0,
      "minval": 0,
      "name": "mr688b",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Uface 5 by RS-232 Delimiter mode",
      "label": "Uface 5 by RS-232 Delimiter mode",
      "maxval": 0,
      "minval": 0,
      "name": "rs232_uface_5",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Use LinkedCore CAN60 by transparent channel",
      "label": "Use LinkedCore CAN60",
      "maxval": 0,
      "minval": 0,
      "name": "can60",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Enable parsing of DG400 by transparent channel",
      "label": "Use DG400",
      "maxval": 0,
      "minval": 0,
      "name": "dg400",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Enable UFH TAG parsing Chafon CF561-R by transparent channel",
      "label": "Parse UFH TAG from Chafon CF561-R",
      "maxval": 0,
      "minval": 0,
      "name": "parse_chafon_cfr561_r",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    },
    {
      "default": "0",
      "description": "Do not register a response to a command from the tracker",
      "label": "Do not register response to command",
      "maxval": 0,
      "minval": 0,
      "name": "hide_ack",
      "readonly": 0,
      "type": "bool",
      "value": "0"
    }
  ]
},
"counters": { "cfl": 275, "cnm": 410874, "cneh": 0, "cnkb": 0 },
"advProps": {
  "monitoring_sensor": "",
  "use_sensor_color": "0",
  "monitoring_sensor_id": "",
  "motion_state_sensor_id": "",
  "monitoring_battery_id": "",
  "track_sensor": "",
  "sensors_colors": "",
  "sensors_colors_id": "",
  "track_solid": "",
  "solid_colors": "",
  "track_speed": "",
  "speed_colors": "",
  "label_color": "",
  "trip_colors": "",
  "msgFilter": {
    "enabled": 0,
    "skipInvalid": 1,
    "lbsCorrection": 0,
    "wifiCorrection": 0,
    "minSats": 4,
    "maxHdop": 2,
    "maxSpeed": 0,
    "minWifiPoints": 2,
    "maxWifiPoints": 3,
    "wifiAccuracy": 10
  },
  "speed_source": { "speed_parameter": "", "speed_measure": "0" }
},
"fields": [],
"afields": [],
"profile": [
  { "id": 1, "n": "vehicle_class", "v": "heavy_truck", "ct": 1721828565, "mt": 1741619327 },
  { "id": 2, "n": "carrying_capacity", "v": "900", "ct": 1739466847, "mt": 1739466847 },
  { "id": 3, "n": "brand", "v": "Shacman", "ct": 1741619327, "mt": 1741619327 },
  { "id": 4, "n": "model", "v": "X3000", "ct": 1741619327, "mt": 1741619327 },
  { "id": 5, "n": "year", "v": "2020", "ct": 1741619327, "mt": 1741619327 },
  { "id": 6, "n": "color", "v": "White", "ct": 1741619327, "mt": 1741619327 },
  { "id": 7, "n": "engine_model", "v": "420HP", "ct": 1742967355, "mt": 1742967355 },
  { "id": 8, "n": "primary_fuel_type", "v": "Diesel", "ct": 1742967356, "mt": 1742967356 },
  { "id": 9, "n": "cargo_type", "v": "29.5 Ton (reefer)", "ct": 1742967356, "mt": 1742967356 },
  { "id": 10, "n": "effective_capacity", "v": "600", "ct": 1742967356, "mt": 1742967356 },
  { "id": 11, "n": "axles", "v": "2", "ct": 1742967356, "mt": 1742967356 }
],
"intervals": [],
"healthCheck": {
  "missing_position_data": { "period": "none" },
  "insufficient_satellite_coverage": { "period": "none" },
  "low_battery": { "period": "1h", "unhealthy_conditions": [{ "type": "less", "value": 20 }] },
  "voltage_out_of_range": { "period": "none" },
  "max_messages_last_hour": { "period": "none" },
  "max_distance_between_messages": {
    "period": "1h",
    "unhealthy_conditions": [{ "type": "greater", "value": 100000 }]
  },
  "no_data": { "period": "1d" },
  "stuck_fls": { "period": "none" },
  "ignition_is_off": { "period": "none" }
},
"sensors": [
  {
    "id": 1,
    "n": "Ignition",
    "t": "engine operation",
    "d": "",
    "m": "On/Off",
    "p": "io_1",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"consumption\":0,\"mu\":0,\"pos\":3,\"show_time\":false,\"timeout\":0}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1721828565,
    "mt": 1721828565
  },
  {
    "id": 2,
    "n": "Small Tank",
    "t": "fuel level",
    "d": "Fuel|1:0:178.92:20:356.83:40:534.74:60:712.66:80:890.57:100:1068.48:120:1246.39:140:1424.31:160:1602.22:180:1780.13:200",
    "m": "l",
    "p": "io_273",
    "f": 64,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"calc_fuel\":2,\"ci\":{},\"cm\":1,\"engine_sensors\":[1],\"fuel_params\":{\"extraFillingTimeout\":60,\"fillingsJoinInterval\":300,\"filterQuality\":10,\"flags\":5834,\"ignoreStayTimeout\":20,\"minFillingVolume\":20,\"minTheftTimeout\":20,\"minTheftVolume\":10,\"theftsJoinInterval\":300},\"lower_bound\":1,\"mu\":0,\"pos\":2,\"show_time\":false,\"upper_bound\":1780.13,\"flags\":\"64\"}",
    "vt": 0,
    "vs": 0,
    "tbl": [
      { "x": 1, "a": 0.112410071942, "b": -0.112410071942 },
      { "x": 178.92, "a": 0.11241639031, "b": -0.113540554213 },
      { "x": 356.83, "a": 0.11241639031, "b": -0.113540554213 },
      { "x": 534.74, "a": 0.112410071942, "b": -0.110161870504 },
      { "x": 712.66, "a": 0.11241639031, "b": -0.114664718116 },
      { "x": 890.57, "a": 0.11241639031, "b": -0.114664718116 },
      { "x": 1068.48, "a": 0.11241639031, "b": -0.114664718116 },
      { "x": 1246.39, "a": 0.112410071942, "b": -0.106789568345 },
      { "x": 1424.31, "a": 0.11241639031, "b": -0.115788882019 },
      { "x": 1602.22, "a": 0.11241639031, "b": -0.115788882019 }
    ],
    "ct": 1721828565,
    "mt": 1748926557
  },
  {
    "id": 3,
    "n": "Big Tank",
    "t": "fuel level",
    "d": "Fuel|1:0:355.83:40:709.65:80:1063.45:120:1417.25:160:1771.05:200:2124.87:240:2478.67:280:2832.47:320:3186.27:360:3539.3:400",
    "m": "l",
    "p": "io_270",
    "f": 64,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"calc_fuel\":2,\"ci\":{},\"cm\":1,\"engine_sensors\":[1],\"fuel_params\":{\"extraFillingTimeout\":60,\"fillingsJoinInterval\":300,\"filterQuality\":10,\"flags\":5834,\"ignoreStayTimeout\":10,\"minFillingVolume\":20,\"minTheftTimeout\":10,\"minTheftVolume\":10,\"theftsJoinInterval\":300},\"lower_bound\":1,\"mu\":0,\"pos\":1,\"show_time\":false,\"upper_bound\":3539.3,\"flags\":\"64\"}",
    "vt": 0,
    "vs": 0,
    "tbl": [
      { "x": 1, "a": 0.112730039737, "b": -0.112730039737 },
      { "x": 355.83, "a": 0.113051834266, "b": -0.227234186875 },
      { "x": 709.65, "a": 0.113058224986, "b": -0.231769361221 },
      { "x": 1063.45, "a": 0.113058224986, "b": -0.231769361221 },
      { "x": 1417.25, "a": 0.113058224986, "b": -0.231769361221 },
      { "x": 1771.05, "a": 0.113051834266, "b": -0.220451076819 },
      { "x": 2124.87, "a": 0.113058224986, "b": -0.234030525721 },
      { "x": 2478.67, "a": 0.113058224986, "b": -0.234030525721 },
      { "x": 2832.47, "a": 0.113058224986, "b": -0.234030525721 },
      { "x": 3186.27, "a": 0.113304818287, "b": -1.01974336459 }
    ],
    "ct": 1721828565,
    "mt": 1748926437
  },
  {
    "id": 4,
    "n": "External Voltage",
    "t": "voltage",
    "d": "",
    "m": "V",
    "p": "io_66/const1000",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":5,\"show_time\":false}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1721829751,
    "mt": 1721829751
  },
  {
    "id": 5,
    "n": "Signal Strenght",
    "t": "custom",
    "d": "",
    "m": "",
    "p": "gsm",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"mu\":0,\"pos\":4,\"show_time\":false,\"timeout\":0}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1721829751,
    "mt": 1721829751
  },
  {
    "id": 6,
    "n": "Harsh Acceleration Parameters",
    "t": "accelerometer",
    "d": "",
    "m": "g",
    "p": "io_67",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":8,\"show_time\":false}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1739468339,
    "mt": 1739468339
  },
  {
    "id": 7,
    "n": "Harsh Cornering Parameters",
    "t": "accelerometer",
    "d": "",
    "m": "g",
    "p": "io_11",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":6,\"show_time\":false}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1739466847,
    "mt": 1739466847
  },
  {
    "id": 8,
    "n": "Harsh Braking Parameters",
    "t": "accelerometer",
    "d": "",
    "m": "g",
    "p": "io_16",
    "f": 0,
    "c": "{\"act\":1,\"appear_in_popup\":true,\"ci\":{},\"cm\":1,\"pos\":7,\"show_time\":false}",
    "vt": 0,
    "vs": 0,
    "tbl": [],
    "ct": 1739468339,
    "mt": 1739468339
  }
],
"reportProps": {
  "speedLimit": 0,
  "maxMessagesInterval": 0,
  "dailyEngineHoursRate": 0,
  "urbanMaxSpeed": 0,
  "mileageCoefficient": 0,
  "fuelRateCoefficient": 0,
  "speedingTolerance": 10,
  "speedingMinDuration": 1,
  "speedingMode": 0,
  "driver_activity": { "type": 0 },
  "fuelConsRates": {
    "consSummer": 10,
    "consWinter": 12,
    "winterMonthFrom": 11,
    "winterDayFrom": 1,
    "winterMonthTo": 1,
    "winterDayTo": 29
  }
},
"aliases": [],
"driving": {
  "acceleration": [
    { "flags": 2, "min_value": 0.5, "name": "Acceleration: extreme", "penalties": 2000 },
    {
      "flags": 2,
      "max_value": 0.5,
      "min_value": 0.4,
      "name": "Acceleration: medium",
      "penalties": 500
    }
  ],
  "brake": [
    {
      "flags": 2,
      "max_value": 0.5,
      "min_value": 0.4,
      "name": "Brake: extreme",
      "penalties": 2000
    },
    { "flags": 2, "min_value": 0.5, "name": "Brake: medium", "penalties": 500 }
  ],
  "global": { "accel_mode": "0" },
  "idling": [
    {
      "flags": 0,
      "max_value": 10800,
      "min_value": 1800,
      "name": "Idling",
      "penalties": 1,
      "validator_id": 1
    }
  ],
  "speeding": [
    {
      "flags": 2,
      "max_duration": 30,
      "max_speed": 95,
      "max_value": 95,
      "min_duration": 10,
      "min_speed": 85,
      "min_value": 85,
      "name": "Speeding: extreme",
      "penalties": 5000
    }
  ],
  "turn": [{ "flags": 2, "min_value": 0.5, "name": "Turn: extreme", "penalties": 500 }]
},
"trip": {
  "type": 1,
  "gpsCorrection": 1,
  "minSat": 2,
  "minMovingSpeed": 1,
  "minStayTime": 300,
  "maxMessagesDistance": 10000,
  "minTripTime": 60,
  "minTripDistance": 100
}
*/

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
    mapps: {
      [id: string]: {
        id: number;
        n: string;
        uid: string;
        cp: { ui: number; un: string };
        as: { appid: string; device: string; type: string };
        e: number;
        ct: number;
        mt: number;
      };
    };
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
    svcs: {
      [k: string]: number;
    };
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

{
  "type": "avl_resource",
  "version": "b4",
  "mu": 0,
  "zones":


  "reports": [
    {
      "id": 2,
      "n": "MATANUSKA DAILY SUMMARY- ALL VALUES",
      "ct": "avl_unit",
      "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
      "tbl": [
        {
          "n": "unit_stays",
          "l": "Parkings",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"chart_stays_markers\"]",
          "sl": "[\"Parking markers\"]",
          "filter_order": [],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_videos",
          "l": "Video",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"chart_unit_videos\"]",
          "sl": "[\"Video markers\"]",
          "filter_order": [],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_photos",
          "l": "Images",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"chart_unit_photos\"]",
          "sl": "[\"Image markers\"]",
          "filter_order": [],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_events",
          "l": "Events",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"chart_events_markers\"]",
          "sl": "[\"Event markers\"]",
          "filter_order": [],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_fillings",
          "l": "Fuel fillings and battery charges",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"chart_filling_markers\"]",
          "sl": "[\"Filling markers\"]",
          "filter_order": [],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_speedings",
          "l": "Speedings",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"chart_speedings_markers\"]",
          "sl": "[\"Speeding markers\"]",
          "filter_order": [],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_thefts",
          "l": "Fuel drains",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"chart_theft_markers\"]",
          "sl": "[\"Drain markers\"]",
          "filter_order": [],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_stats",
          "l": "Statistics",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"address_format\",\"time_format\",\"us_units\",\"deviation\",\"averaging\"]",
          "sl": "[\"Address\",\"Time Format\",\"Measure\",\"Deviation\",\"Averaging\"]",
          "filter_order": [],
          "p": "{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%Y-%m-%E_%H:%M:%S\",\"us_units\":0,\"deviation\":\"30\",\"averaging\":\"none\"}",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_trips",
          "l": "Trip Report",
          "c": "[\"time_begin\",\"location_begin\",\"coord_begin\",\"time_end\",\"location_end\",\"coord_end\",\"duration\",\"duration_ival\",\"eh_duration\",\"mileage\",\"absolute_mileage_begin\",\"absolute_mileage_end\",\"avg_speed\",\"max_speed\",\"trips_count\",\"fuel_consumption_all\",\"avg_fuel_consumption_all\",\"fuel_level_begin\",\"fuel_level_end\",\"fuel_level_max\",\"fuel_level_min\",\"dummy\"]",
          "cl": "[\"Beginning\",\"Initial location\",\"Initial coordinates\",\"End\",\"Final location\",\"Final coordinates\",\"Duration\",\"Total time\",\"Engine hours\",\"Mileage\",\"Initial mileage\",\"Final mileage\",\"Avg speed\",\"Max speed\",\"Trips count\",\"Consumed\",\"Avg consumption\",\"Initial fuel level\",\"Final fuel level\",\"Max fuel level\",\"Min fuel level\",\"Notes\"]",
          "cp": "[{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]",
          "s": "",
          "sl": "",
          "filter_order": [
            "duration",
            "mileage",
            "base_eh_sensor",
            "engine_hours",
            "speed",
            "stops",
            "sensors",
            "sensor_name",
            "driver",
            "trailer",
            "geozones_ex"
          ],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_fillings",
          "l": "Fuel fillings",
          "c": "[\"time_end\",\"location_end\",\"fuel_level_begin\",\"fuel_level_filled\",\"filled\",\"difference\",\"absolute_mileage_begin\",\"registered\",\"sensor_name\"]",
          "cl": "[\"Time\",\"Location\",\"Initial fuel level\",\"Final fuel level\",\"Filled\",\"Difference\",\"Mileage\",\"Registered filling\",\"Sensor name\"]",
          "cp": "[{},{},{},{},{},{},{},{},{}]",
          "s": "",
          "sl": "",
          "filter_order": [
            "geozones_ex",
            "fillings",
            "charges",
            "driver",
            "trailer",
            "sensor_name",
            "custom_sensor_name"
          ],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_thefts",
          "l": "Fuel thefts",
          "c": "[\"time_begin\",\"location_begin\",\"time_end\",\"location_end\",\"fuel_level_begin\",\"initial_speed\",\"thefted\",\"fuel_level_thefted\",\"final_speed\",\"dummy\"]",
          "cl": "[\"Beginning\",\"Initial location\",\"Time\",\"Final location\",\"Initial fuel level\",\"Initial speed\",\"Stolen\",\"Final fuel level\",\"Final speed\",\"Notes\"]",
          "cp": "[{},{},{},{},{},{},{},{},{},{}]",
          "s": "",
          "sl": "",
          "filter_order": [
            "geozones_ex",
            "thefts",
            "driver",
            "trailer",
            "sensor_name",
            "custom_sensor_name"
          ],
          "p": "{\"thefts\":{\"type\":1,\"min\":5,\"max\":100,\"summarize\":1}}",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_speedings",
          "l": "Speedings",
          "c": "[\"time_begin\",\"location_begin\",\"duration\",\"duration_ival\",\"max_speed\",\"speed_limit\",\"avg_speed\",\"speedings_count\"]",
          "cl": "[\"Beginning\",\"Location\",\"Duration\",\"Total time\",\"Max speed\",\"Speed limit\",\"Avg speed\",\"Count\"]",
          "cp": "[{},{},{},{},{},{},{},{}]",
          "s": "",
          "sl": "",
          "filter_order": ["duration", "mileage", "driver", "trailer", "geozones_ex"],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_generic",
          "l": "Summary",
          "c": "[\"mileage\",\"eh\",\"duration_stay\",\"fuel_consumption_fls\",\"dist_fuel_consumption_fls\",\"fuel_level_begin\",\"fuel_level_end\",\"fillings_count\",\"thefts_count\",\"filled\",\"thefted\"]",
          "cl": "[\"Mileage in trips\",\"Engine hours\",\"Parkings\",\"Consumed by FLS\",\"Avg mileage per unit of fuel by FLS\",\"Initial fuel level\",\"Final fuel level\",\"Total fillings\",\"Total thefts\",\"Filled\",\"Stolen\"]",
          "cp": "[{},{},{},{},{},{},{},{},{},{},{}]",
          "s": "",
          "sl": "",
          "filter_order": ["base_eh_sensor", "sensor_name"],
          "p": "{\"custom_interval\":{\"type\":0}}",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_chart",
          "l": "FUEL LEVEL/ SPEED CHART",
          "c": "[\"instant_speed_base\",\"instant_speed_smooth\",\"fuel_level\",\"rpm_sensors_base\",\"rpm_sensors_smooth\"]",
          "cl": "[\"Speed\",\"Speed (smoothed)\",\"Fuel level\",\"Engine revs\",\"Engine revs (smoothed)\"]",
          "cp": "",
          "s": "",
          "sl": "",
          "filter_order": [],
          "p": "{\"chart_markers\":{\"f\":2428}}",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        }
      ],
      "bsfl": { "ct": 1663927697, "mt": 1741791078 }
    },
    {
      "id": 1,
      "n": "Matanuska Fuel report",
      "ct": "avl_unit",
      "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
      "tbl": [
        {
          "n": "unit_stats",
          "l": "Statistics",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"address_format\",\"time_format\",\"us_units\"]",
          "sl": "[\"Address\",\"Time Format\",\"Measure\"]",
          "filter_order": [],
          "p": "{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%E.%m.%Y_%H:%M:%S\",\"us_units\":0}",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_fillings",
          "l": "Fuel fillings",
          "c": "[\"time_end\",\"location_end\",\"fuel_level_begin\",\"fuel_level_filled\",\"filled\",\"filling_description\",\"sensor_name\",\"absolute_mileage_begin\"]",
          "cl": "[\"Time\",\"Location\",\"Initial fuel level\",\"Final fuel level\",\"Filled\",\"Description\",\"Sensor name\",\"Mileage\"]",
          "cp": "[{},{},{},{},{},{},{},{}]",
          "s": "",
          "sl": "",
          "filter_order": [
            "geozones_ex",
            "fillings",
            "driver",
            "trailer",
            "sensor_name",
            "custom_sensor_name"
          ],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_thefts",
          "l": "Fuel thefts",
          "c": "[\"time_begin\",\"location_begin\",\"time_end\",\"location_end\",\"fuel_level_begin\",\"initial_speed\",\"thefted\",\"fuel_level_thefted\",\"final_speed\",\"absolute_mileage_begin\"]",
          "cl": "[\"Beginning\",\"Initial location\",\"Time\",\"Final location\",\"Initial fuel level\",\"Initial speed\",\"Stolen\",\"Final fuel level\",\"Final speed\",\"Mileage\"]",
          "cp": "[{},{},{},{},{},{},{},{},{},{}]",
          "s": "",
          "sl": "",
          "filter_order": [
            "geozones_ex",
            "thefts",
            "driver",
            "trailer",
            "sensor_name",
            "custom_sensor_name"
          ],
          "p": "",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_generic",
          "l": "Summary",
          "c": "[\"mileage\",\"avg_speed\",\"max_speed\",\"eh\",\"fuel_consumption_fls\",\"avg_fuel_consumption_fls\",\"fuel_level_begin\",\"fuel_level_end\",\"fillings_count\",\"thefts_count\"]",
          "cl": "[\"Mileage in trips\",\"Avg speed\",\"Max speed\",\"Engine hours\",\"Consumed by FLS\",\"Avg consumption by FLS\",\"Initial fuel level\",\"Final fuel level\",\"Total fillings\",\"Total thefts\"]",
          "cp": "[{},{},{},{},{},{},{},{},{},{}]",
          "s": "",
          "sl": "",
          "filter_order": ["base_eh_sensor", "sensor_name"],
          "p": "{\"custom_interval\":{\"type\":0}}",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        }
      ],
      "bsfl": { "ct": 1646737127, "mt": 1646737127 }
    },
    {
      "id": 3,
      "n": "New report",
      "ct": "avl_unit",
      "p": "{\"descr\":\"\",\"bind\":{\"avl_unit\":[]}}",
      "tbl": [
        {
          "n": "unit_stats",
          "l": "Statistics",
          "c": "",
          "cl": "",
          "cp": "",
          "s": "[\"address_format\",\"time_format\",\"us_units\",\"deviation\",\"averaging\"]",
          "sl": "[\"Address\",\"Time Format\",\"Measure\",\"Deviation\",\"Averaging\"]",
          "filter_order": [],
          "p": "{\"address_format\":\"1255211008_10_5\",\"time_format\":\"%E.%m.%Y_%H:%M:%S\",\"us_units\":0,\"deviation\":\"30\",\"averaging\":\"none\"}",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        },
        {
          "n": "unit_stops",
          "l": "Stops",
          "c": "[\"time_begin\",\"time_end\",\"duration\",\"duration_ival\",\"duration_prev\",\"location\",\"coord\"]",
          "cl": "[\"Beginning\",\"End\",\"Duration\",\"Total time\",\"Off-time\",\"Location\",\"Coordinates\"]",
          "cp": "[{},{},{},{},{},{},{}]",
          "s": "",
          "sl": "",
          "filter_order": [
            "duration",
            "sensors",
            "sensor_name",
            "driver",
            "trailer",
            "fillings",
            "thefts",
            "charges",
            "geozones_ex"
          ],
          "p": "{\"duration\":{\"min\":7200,\"flags\":1,\"max\":86400},\"sensors\":{\"type\":1,\"min\":7200,\"flags\":1,\"max\":86400},\"geozones_ex\":{\"zones\":\"24979429_100,600541672_100,600590053_100,600610518_100,600614258_100,600665449_100,600672382_100,600695231_100,600702514_100,600754126_100,600769948_100\",\"types\":\"0,0,0,0,0,0,0,0,0,0,0\",\"flags\":0}}",
          "sch": { "f1": 0, "f2": 0, "t1": 0, "t2": 0, "m": 0, "y": 0, "w": 0, "fl": 0 },
          "f": 0
        }
      ],
      "bsfl": { "ct": 1743686051, "mt": 1743686051 }
    }
  ]
}
export interface WialonPosition {
  /** Unix timestamp (seconds) */
  t: number;
  /** Latitude */
  lat: number;
  /** Longitude */
  lon: number;
  /** Speed (km/h) if available */
  sp?: number;
  /** Course/heading (degrees) if available */
  cr?: number;
  /** Optional extras (altitude, satellites, etc.) */
  [k: string]: unknown;
}

/** Core shape of a Wialon unit (vehicle). */
export interface WialonUnit {
  id: number;
  /** Name; Wialon often uses `nm` */
  nm?: string;
  /** System name; sometimes present as `sys_name` */
  sys_name?: string;
  /** Last known position */
  pos?: {
    t?: number;
    y?: number; // latitude
    x?: number; // longitude
    sp?: number;
    cr?: number;
    [k: string]: unknown;
  };
  /** Last message object (alternative to pos) */
  lmsg?: unknown;
  /** Arbitrary extra fields Wialon may return */
  [k: string]: unknown;
}

/** Search result for lists like core/search_items - matches actual API response structure */
export interface WialonSearchItemsResult<T = unknown> {
  searchSpec: {
    itemsType: string;
    propName: string;
    propValueMask: string;
    sortType: string;
    propType?: string;
    or_logic?: string;
  };
  dataFlags: number;
  totalItemsCount: number;
  indexFrom: number;
  indexTo: number;
  items: T[];
}

/** Report export response commonly returns a URL or descriptor. */
export interface WialonReportExport {
  /** Direct or relative URL to the exported file */
  url?: string;
  /** Optional additional meta */
  [k: string]: unknown;
}

/** Useful flags to request richer unit details. */
export const WialonFlags = {
  /** Generous bitmask to include core fields & last position */
  UNIT_RICH: 0x0001ffff,
} as const;
