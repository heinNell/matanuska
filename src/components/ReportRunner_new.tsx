import React, { useState, useEffect } from "react";
import { useWialonResources } from "../hooks/useWialonResources";
import type { WialonResource } from "../types/wialon-types";
import {
  getReportData,
  getReportTables,
  waitForReport,
  applyReportResult,
  type ReportTable,
} from "../services/wialonReportService";

interface ReportRunnerProps {
  session: any;
  loggedIn: boolean;
}

const ReportRunner: React.FC<ReportRunnerProps> = ({ session, loggedIn }) => {
  // State for resource selection
  const resources: WialonResource[] = useWialonResources(session, loggedIn);
  const [selectedResId, setSelectedResId] = useState<number | null>(null);

  // State for templates
  const [templates, setTemplates] = useState<ReportTable[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  // State for report data/results
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Fetch report templates on mount or when session/resource changes
  useEffect(() => {
    if (!session || !selectedResId) {
      setTemplates([]);
      setSelectedTemplateId(null);
      return;
    }

    const fetchTemplates = async () => {
      try {
        const data = await getReportTables(session, selectedResId);
        setTemplates(data || []);
      } catch (err: any) {
        setTemplates([]);
        setSelectedTemplateId(null);
        setReportError("Failed to fetch report templates: " + (err?.message || err));
      }
    };

    fetchTemplates();
  }, [session, selectedResId]);

  // Fetch report based on selected template
  const fetchReport = async () => {
    if (!selectedResId || !selectedTemplateId || !session) return;
    setReportLoading(true);
    setReportError(null);

    try {
      const flags = 0x0; // full JSON, customize if needed
      const data = await getReportData(session, {
        itemId: selectedResId,
        tableId: selectedTemplateId, // Changed from 'col' to 'tableId' based on your service
        flags,
      });
      await waitForReport(session);
      const result = await applyReportResult(session);
      setReportData(result || []);
    } catch (err: any) {
      setReportError("Failed to fetch report: " + (err?.message || err));
      setReportData([]);
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
          onChange={(e) => {
            const value = Number(e.target.value);
            setSelectedResId(isNaN(value) ? null : value);
          }}
          className="ml-2 p-1 border border-gray-300 rounded"
        >
          <option value="">-- select resource --</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>

      {/* Template Selection */}
      <label className="block mb-2 mt-2">
        Report Template:
        <select
          value={selectedTemplateId ?? ""}
          onChange={(e) => {
            const value = Number(e.target.value);
            setSelectedTemplateId(isNaN(value) ? null : value);
          }}
          className="ml-2 p-1 border border-gray-300 rounded"
        >
          <option value="">-- select template --</option>
          {templates.map((t) => (
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
        <pre className="mt-4 p-2 bg-gray-100 rounded overflow-auto text-xs">
          {JSON.stringify(reportData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ReportRunner;
