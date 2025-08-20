// src/services/wialonReportService.ts
import type { Session } from "../types/wialon-types";

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

export async function getReportTables(session: Session): Promise<ReportTable[]> {
  if (!session?.sid) throw new Error("No active session");
  
  try {
    const response = await fetch("https://hst-api.wialon.com/wialon/ajax.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `sid=${session.sid}&svc=report/get_report_tables`
    });

    const data = await response.json();
    if (!data?.items) throw new Error("Invalid response format");

    return data.items;
  } catch (err) {
    console.error("Failed to fetch report tables:", err);
    throw new Error("Failed to fetch report tables");
  }
}

export async function getReportData(session: Session, params: ReportParams): Promise<any> {
  if (!session?.sid) throw new Error("No active session");

  try {
    const response = await fetch("https://hst-api.wialon.com/wialon/ajax.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `sid=${session.sid}&svc=report/get_report_data&params=${JSON.stringify(params)}`
    });

    return await response.json();
  } catch (err) {
    console.error("Failed to fetch report data:", err);
    throw new Error("Failed to fetch report data");
  }
}

export async function waitForReport(session: Session): Promise<void> {
  if (!session?.sid) throw new Error("No active session");

  try {
    const response = await fetch("https://hst-api.wialon.com/wialon/ajax.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `sid=${session.sid}&svc=report/wait_report`
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
  } catch (err) {
    console.error("Failed to wait for report:", err);
    throw new Error("Failed to wait for report");
  }
}

export async function applyReportResult(session: Session): Promise<any[]> {
  if (!session?.sid) throw new Error("No active session");

  try {
    const response = await fetch("https://hst-api.wialon.com/wialon/ajax.html", {
      method: "POST", 
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `sid=${session.sid}&svc=report/apply_report_result`
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    return data;
  } catch (err) {
    console.error("Failed to apply report result:", err);
    throw new Error("Failed to apply report result");
  }
}
