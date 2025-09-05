import { WialonSession } from "../types/wialon";

/**
 * Interface for the report table.
 * @property {number} id - The ID of the table.
 * @property {string} l - The name of the table.
 */
export interface ReportTable {
  id: number;
  l: string;
}

// Assume WIALON_API_URL and other constants are available from an environment file
declare const WIALON_API_URL: string;

/**
 * Wialon Report Service
 * This service encapsulates the Wialon API calls for managing and running reports.
 */

/**
 * Executes a report.
 * @param {WialonSession} session - The active Wialon session object.
 * @param {any} params - The report parameters.
 * @returns {Promise<any>} A promise that resolves with the report results.
 */
export async function getReportData(session: WialonSession, params: any): Promise<any> {
  const url = `${WIALON_API_URL}/report/exec_report?sid=${session.sid}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (data.error) {
    throw new Error(`Wialon API Error: ${data.reason}`);
  }
  return data;
}

/**
 * Waits for a report to finish.
 * @param {WialonSession} session - The active Wialon session object.
 * @returns {Promise<any>} A promise that resolves when the report is complete.
 */
export async function waitForReport(session: WialonSession): Promise<any> {
  const url = `${WIALON_API_URL}/report/get_result?sid=${session.sid}`;
  // Polling logic would be more robust in a real application
  await new Promise(resolve => setTimeout(resolve, 2000));
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) {
    throw new Error(`Wialon API Error: ${data.reason}`);
  }
  return data;
}

/**
 * Gets the report tables from a session.
 * @param {WialonSession} session - The active Wialon session object.
 * @returns {Promise<ReportTable[]>} A promise that resolves with the report tables.
 */
export async function getReportTables(session: WialonSession): Promise<ReportTable[]> {
  const url = `${WIALON_API_URL}/resource/get_report_templates?sid=${session.sid}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) {
    throw new Error(`Wialon API Error: ${data.reason}`);
  }
  return data.reportTables as ReportTable[];
}

/**
 * Applies the report result.
 * @param {WialonSession} session - The active Wialon session object.
 * @returns {Promise<any>} A promise that resolves with the applied report results.
 */
export async function applyReportResult(session: WialonSession): Promise<any> {
  const url = `${WIALON_API_URL}/report/apply_report_result?sid=${session.sid}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) {
    throw new Error(`Wialon API Error: ${data.reason}`);
  }
  return data;
}
"reportProps": {
  "speedLimit": 90,
  "maxMessagesInterval": 0,
  "dailyEngineHoursRate": 0,
  "urbanMaxSpeed": 0,
  "mileageCoefficient": 0,
  "fuelRateCoefficient": 55,
  "speedingTolerance": 10,
  "speedingMinDuration": 1,
  "speedingMode": 0,
  "driver_activity": { "type": 1 },
  "fuelConsRates": {
    "consSummer": 55,
    "consWinter": 55,
    "winterMonthFrom": 11,
    "winterDayFrom": 1,
    "winterMonthTo": 1,
    "winterDayTo": 29
  }
},
"aliases": [],
"driving": {
  "acceleration": [
    { "flags": 2, "min_value": 0.25, "name": "Acceleration: extreme", "penalties": 2000 },
    {
      "flags": 2,
      "max_value": 0.25,
      "min_value": 0.16,
      "name": "Acceleration: medium",
      "penalties": 500
    }
  ],
  "brake": [
    { "flags": 2, "min_value": 0.25, "name": "Brake: extreme", "penalties": 2000 },
    {
      "flags": 2,
      "max_value": 0.25,
      "min_value": 0.16,
      "name": "Brake: medium",
      "penalties": 500
    }
  ],
  "global": { "accel_mode": "0" },
  "idling": [
    {
      "flags": 0,
      "max_value": 10800,
      "min_value": 1800,
      "name": "Idling",
      "penalties": 1,
      "validator_id": 3
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
  "turn": [{ "flags": 2, "min_value": 0.25, "name": "Turn: extreme", "penalties": 500 }]
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
}