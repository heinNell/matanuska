/* --------------------------------------------------------------------------
 *  Wialon report-related helpers
 * -------------------------------------------------------------------------- */
import type { WialonSession } from "../types/wialon";   // ✅ correct type import

/* ---------- types -------------------------------------------------------- */
export interface ReportTable {
  id: number;
  n: string;  // name
  l: string;  // label
  t: number;  // type
  c: number;  // columns
  r: number;  // rows
}

export interface ReportParams {
  itemId: number;
  col: number[];
  flags?: number;
}

/* ---------- constants ---------------------------------------------------- */
const API_URL = "https://hst-api.wialon.com/wialon/ajax.html";
const HEADERS  = { "Content-Type": "application/x-www-form-urlencoded" };

/* ---------- helpers ------------------------------------------------------ */
const buildBody = (sid: string, svc: string, params?: unknown) =>
  `sid=${encodeURIComponent(sid)}&svc=${svc}${
    params ? `&params=${encodeURIComponent(JSON.stringify(params))}` : ""
  }`;

/* ---------- API calls ---------------------------------------------------- */
export async function getReportTables(
  session: WialonSession
): Promise<ReportTable[]> {
  if (!session?.sid) throw new Error("No active Wialon session");

  const res  = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: buildBody(session.sid, "report/get_report_tables"),
  });
  const json = await res.json();

  if (!json?.items) throw new Error("Invalid response format");
  return json.items;
}

export async function getReportData(
  session: WialonSession,
  params: ReportParams
): Promise<any> {
  if (!session?.sid) throw new Error("No active Wialon session");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: buildBody(session.sid, "report/get_report_data", params),
  });
  return res.json();
}

export async function waitForReport(session: WialonSession): Promise<void> {
  if (!session?.sid) throw new Error("No active Wialon session");

  const res  = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: buildBody(session.sid, "report/wait_report"),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
}

export async function applyReportResult(
  session: WialonSession
): Promise<any[]> {
  if (!session?.sid) throw new Error("No active Wialon session");

  const res  = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: buildBody(session.sid, "report/apply_report_result"),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}
