import { useState, useCallback } from "react";
import wialonService from "../services/wialonService";
import type { ReportTableData } from "../types/wialon";

interface UseWialonReportResult {
  reportData: ReportTableData | null;
  loading: boolean;
  error: string | null;
  executeReport: (resourceId: number, templateName: string, unitId: number, intervalSeconds: number) => Promise<void>;
}

export function useWialonReport(): UseWialonReportResult {
  const [reportData, setReportData] = useState<ReportTableData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const executeReport = useCallback(async (resourceId: number, templateName: string, unitId: number, intervalSeconds: number) => {
    setLoading(true);
    setError(null);
    try {
      const to = Math.floor(Date.now() / 1000);
      const from = to - intervalSeconds;
      const interval = { from, to };

      // Execute report using the corrected service method
      const result = await wialonService.executeReport(resourceId, templateName, unitId, interval);

      // Process the report result according to Wialon API structure
      if (result && result.reportResult && result.reportResult.tables) {
        const tables = result.reportResult.tables;
        if (tables.length > 0) {
          const firstTable = tables[0];
          setReportData({
            headers: firstTable?.header ?? ['Time', 'Position', 'Speed'],
            rows: firstTable?.data ?? []
          });
        } else {
          setReportData(null);
        }
      } else if (result && result.getTables && typeof result.getTables === 'function') {
        // Fallback for SDK-based results
        const tables = result.getTables();
        if (tables && tables.length > 0) {
          const table = tables[0];
          const headers = table.header || ['Time', 'Position', 'Speed'];

          // Use getTableRows if available
          if (result.getTableRows && typeof result.getTableRows === 'function') {
            const rows = await new Promise<any[][]>((resolve, reject) => {
              result.getTableRows!(0, 0, table.rows || 100, (code: number, rowData: any) => {
                if (code !== 0) {
                  reject(new Error(`Failed to get table rows. Code: ${code}`));
                } else {
                  resolve(Array.isArray(rowData) ? rowData.map((row: any) => row.c || row) : []);
                }
              });
            });
            setReportData({ headers, rows });
          } else {
            // Use table data directly if getTableRows is not available
            setReportData({ headers, rows: table.data || [] });
          }
        } else {
          setReportData(null);
        }
      } else {
        setReportData(null);
      }
    } catch (err: any) {
      console.error("Report execution failed:", err);
      setError("Failed to execute report: " + (err?.message || err));
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { reportData, loading, error, executeReport };
}
