// src/services/wialonReportService.ts
export interface ReportDataParams {
  itemId: number;          // Resource ID
  col: number[];           // Template IDs
  flags: number;           // 0x0, 0x1, 0x2, 0x4 etc.
}

export interface ReportDataTable {
  n: string;
  l: string;
  c?: string;
  cl?: string;
  cp?: string;
  s?: string;
  sl?: string;
  filter_order?: string;
  p?: string;
  sch?: Record<string, number>;
  f?: number;
}

export interface ReportData {
  id: number;
  n: string;
  ct: string;
  c?: string;
  p?: string;
  tbl?: ReportDataTable[];
}

export interface ReportTable {
  id: number;
  l: string; // label/name of the report template
  // Add other properties as needed
}

/**
 * Fetch report data safely
 */
export async function getReportData(session: any, params: ReportDataParams): Promise<ReportData[]> {
  if (!session) throw new Error("Wialon session is not initialized");

  return new Promise((resolve, reject) => {
    session.getReportData(
      params.itemId,
      params.col,
      params.flags,
      (code: number, data: any) => {
        if (code) return reject(new Error(`get_report_data failed with code ${code}`));
        resolve(data as ReportData[]);
      }
    );
  });
}

/**
 * Poll the report status until done
 */
export async function waitForReport(session: any, interval = 2000): Promise<void> {
  return new Promise((resolve, reject) => {
    const check = () => {
      session.getReportStatus((code: number) => {
        if (code === 4) return resolve(); // Done
        if ([8, 16].includes(code)) return reject(new Error(`Report failed with code ${code}`));
        setTimeout(check, interval);
      });
    };
    check();
  });
}

/**
 * Retrieve final report results
 */
export async function applyReportResult(session: any): Promise<any> {
  return new Promise((resolve, reject) => {
    session.applyReportResult((code: number, data: any) => {
      if (code) return reject(new Error(`apply_report_result failed with code ${code}`));
      resolve(data);
    });
  });
}
