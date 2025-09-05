// src/types/wialon-types.ts
import type { Position } from "./wialon-position";

/**
 * Shared UnitDetail shape for the app.
 * Keep this in one place so all hooks/components/sensor code can import it.
 */
export interface UnitDetail {
  id: number | string;
  name: string;
  iconUrl?: string | null;
  position?: Position | null;
  properties?: Record<string, any> | null;
  raw?: Record<string, any> | null;
}

export interface SensorValue {
  value: number | string | boolean;
  unit?: string;
  timestamp?: number;
}

export interface BaseSensorResult {
  fuel?: SensorValue;
  speed?: SensorValue;
  engineHours?: SensorValue;
  ignition?: SensorValue;
  loading?: boolean;
  error?: string | null;
}


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