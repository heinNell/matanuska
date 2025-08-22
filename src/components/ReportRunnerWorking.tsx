import { useState, useEffect } from "react";
import { useWialonAuth } from "../context/WialonAuthContext";
import { useWialonResources } from "../hooks/useWialonResources";
import {
  getReportTables,
  getReportData,
  waitForReport,
  applyReportResult,
  ReportTable
} from '../services/wialonReportService';
import type { WialonResource } from '../types/wialon-types';

const ReportRunner = () => {
  const { loginData, isLoggedIn } = useWialonAuth();
  const resources = useWialonResources(loginData?.session, isLoggedIn);

  const [templates, setTemplates] = useState<ReportTable[]>([]);
  const [selectedResId, setSelectedResId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Fetch report templates
  useEffect(() => {
    if (!loginData?.session) return;

    const fetchTemplates = async () => {
      try {
        const data = await getReportTables(loginData.session);
        setTemplates(data);
      } catch (err: any) {
        console.error("Failed to fetch report templates:", err);
      }
    };

    fetchTemplates();
  }, [loginData?.session]);

  // Fetch report based on selected template
  const fetchReport = async () => {
    if (!selectedResId || !selectedTemplateId || !loginData?.session) return;
    setReportLoading(true);
    setReportError(null);

    try {
      const flags = 0x0; // full JSON
      await getReportData(loginData.session, {
        itemId: selectedResId,
        col: [],
        flags
      });
      await waitForReport(loginData.session);
      const result = await applyReportResult(loginData.session);
      setReportData(result);
    } catch (err: any) {
      console.error("Failed to fetch report:", err);
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-2">Wialon Reports</h2>

      {/* Resource Selection */}
      <label className="block mb-2">
        Resource:
        <select
          value={selectedResId ?? ""}
          onChange={(e) => setSelectedResId(Number(e.target.value))}
          className="ml-2 p-1 border border-gray-300 rounded"
        >
          <option value="">-- select resource --</option>
          {resources.map((r: WialonResource) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>

      {/* Template Selection */}
      <label className="block mb-2 mt-2">
        Report Template:
        <select
          value={selectedTemplateId ?? ""}
          onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
          className="ml-2 p-1 border border-gray-300 rounded"
        >
          <option value="">-- select template --</option>
          {templates.map((t: ReportTable) => (
            <option key={t.id} value={t.id}>{t.l}</option>
          ))}
        </select>
      </label>

      {/* Fetch Report Button */}
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={fetchReport}
        disabled={!selectedResId || !selectedTemplateId || reportLoading}
      >
        {reportLoading ? "Fetching..." : "Fetch Report"}
      </button>

      {reportError && <p className="text-red-600 mt-2">{reportError}</p>}

      {/* Display Report Data */}
      {reportData && reportData.length > 0 && (
        <pre className="mt-4 p-2 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(reportData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ReportRunner;
