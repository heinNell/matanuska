import React, { useState, useEffect } from 'react';
import { useWialonReports } from '../../hooks/useWialonReports';
import { useWialonContext } from '../../context/WialonContext';
import type { WialonReportTemplate, WialonReportResult, ReportExecutionOptions } from '../../types/wialon-complete';

interface WialonReportsProps {
  className?: string;
  onReportGenerated?: (report: WialonReportResult) => void;
}

// Predefined report templates for common fleet management reports
const REPORT_TEMPLATES: WialonReportTemplate[] = [
  {
    id: 1,
    name: "Vehicle Activity Summary",
    type: "activity",
    description: "Daily vehicle activity including mileage, fuel consumption, and work hours",
    parameters: ["startDate", "endDate", "units"],
    defaultTimeRange: "today"
  },
  {
    id: 2,
    name: "Fuel Consumption Report",
    type: "fuel",
    description: "Detailed fuel usage analysis with efficiency metrics",
    parameters: ["startDate", "endDate", "units", "fuelType"],
    defaultTimeRange: "week"
  },
  {
    id: 3,
    name: "Mileage Report",
    type: "mileage",
    description: "Distance traveled with route analysis",
    parameters: ["startDate", "endDate", "units"],
    defaultTimeRange: "week"
  },
  {
    id: 4,
    name: "Driver Performance",
    type: "driver",
    description: "Driver behavior analysis including speed violations and harsh events",
    parameters: ["startDate", "endDate", "units", "drivers"],
    defaultTimeRange: "month"
  },
  {
    id: 5,
    name: "Geofence Report",
    type: "geofence",
    description: "Entry/exit times and duration in specified geofences",
    parameters: ["startDate", "endDate", "units", "geofences"],
    defaultTimeRange: "week"
  }
];

const WialonReports: React.FC<WialonReportsProps> = ({
  className = "",
  onReportGenerated
}) => {
  const { units } = useWialonContext();
  const {
    executeReport,
    getReportTemplates,
    loading,
    error,
    lastReport
  } = useWialonReports();

  const [selectedTemplate, setSelectedTemplate] = useState<WialonReportTemplate | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    endDate: new Date()
  });
  const [reportOptions, setReportOptions] = useState<ReportExecutionOptions>({
    format: 'json',
    includeCharts: true,
    includeDetails: true
  });
  const [reportHistory, setReportHistory] = useState<WialonReportResult[]>([]);

  // Load report templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await getReportTemplates();
        // Merge with predefined templates if needed
        console.log('Available report templates:', templates);
      } catch (err) {
        console.error('Failed to load report templates:', err);
      }
    };
    loadTemplates();
  }, [getReportTemplates]);

  // Handle report execution
  const handleExecuteReport = async () => {
    if (!selectedTemplate) {
      alert('Please select a report template');
      return;
    }

    if (selectedUnits.length === 0) {
      alert('Please select at least one vehicle');
      return;
    }

    try {
      const result = await executeReport({
        templateId: selectedTemplate.id,
        unitIds: selectedUnits,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...reportOptions
      });

      if (result) {
        setReportHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 reports
        onReportGenerated?.(result);
      }
    } catch (err) {
      console.error('Failed to execute report:', err);
    }
  };

  // Handle unit selection toggle
  const handleUnitToggle = (unitId: number) => {
    setSelectedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  // Select all units
  const handleSelectAllUnits = () => {
    if (selectedUnits.length === units.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(units.map(unit => unit.id));
    }
  };

  // Handle date range presets
  const handleDatePreset = (preset: string) => {
    const now = new Date();
    let startDate = new Date();

    switch (preset) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      }
      default:
        return;
    }

    setDateRange({ startDate, endDate: now });
  };

  return (
    <div className={`wialon-reports ${className}`}>
      <div className="reports-header">
        <h2 className="text-2xl font-bold mb-4">Fleet Reports</h2>

        {error && (
          <div className="error-message bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      <div className="reports-content grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration Panel */}
        <div className="report-config lg:col-span-2">
          {/* Template Selection */}
          <div className="template-selection mb-6">
            <h3 className="text-lg font-semibold mb-3">Select Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REPORT_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className={`template-card p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="date-selection mb-6">
            <h3 className="text-lg font-semibold mb-3">Time Period</h3>

            {/* Quick Presets */}
            <div className="date-presets flex flex-wrap gap-2 mb-4">
              {['today', 'yesterday', 'week', 'month', 'quarter'].map(preset => (
                <button
                  key={preset}
                  className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 capitalize"
                  onClick={() => handleDatePreset(preset)}
                >
                  {preset === 'week' ? 'Last 7 days' :
                   preset === 'month' ? 'This month' :
                   preset === 'quarter' ? 'This quarter' : preset}
                </button>
              ))}
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={dateRange.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    startDate: new Date(e.target.value)
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={dateRange.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    endDate: new Date(e.target.value)
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="unit-selection mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Select Vehicles</h3>
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={handleSelectAllUnits}
              >
                {selectedUnits.length === units.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="units-grid max-h-60 overflow-y-auto border rounded-md p-2">
              {units.map(unit => (
                <label
                  key={unit.id}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUnits.includes(unit.id)}
                    onChange={() => handleUnitToggle(unit.id)}
                    className="mr-2"
                  />
                  <span className="flex-1">{unit.name}</span>
                  <span className="text-sm text-gray-500">
                    {unit.lastMessage ?
                      new Date(unit.lastMessage.timestamp * 1000).toLocaleDateString() :
                      'No data'
                    }
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Report Options */}
          <div className="report-options mb-6">
            <h3 className="text-lg font-semibold mb-3">Report Options</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportOptions.includeCharts}
                  onChange={(e) => setReportOptions(prev => ({
                    ...prev,
                    includeCharts: e.target.checked
                  }))}
                  className="mr-2"
                />
                Include charts and visualizations
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportOptions.includeDetails}
                  onChange={(e) => setReportOptions(prev => ({
                    ...prev,
                    includeDetails: e.target.checked
                  }))}
                  className="mr-2"
                />
                Include detailed data
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Format:</span>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={reportOptions.format === 'json'}
                    onChange={(e) => setReportOptions(prev => ({
                      ...prev,
                      format: e.target.value as 'json' | 'pdf' | 'excel'
                    }))}
                    className="mr-1"
                  />
                  JSON
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={reportOptions.format === 'pdf'}
                    onChange={(e) => setReportOptions(prev => ({
                      ...prev,
                      format: e.target.value as 'json' | 'pdf' | 'excel'
                    }))}
                    className="mr-1"
                  />
                  PDF
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={reportOptions.format === 'excel'}
                    onChange={(e) => setReportOptions(prev => ({
                      ...prev,
                      format: e.target.value as 'json' | 'pdf' | 'excel'
                    }))}
                    className="mr-1"
                  />
                  Excel
                </label>
              </div>
            </div>
          </div>

          {/* Generate Report Button */}
          <button
            className={`w-full py-3 px-6 rounded-md font-medium ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={handleExecuteReport}
            disabled={loading || !selectedTemplate || selectedUnits.length === 0}
          >
            {loading ? 'Generating Report...' : 'Generate Report'}
          </button>
        </div>

        {/* Report History & Preview */}
        <div className="report-sidebar">
          <h3 className="text-lg font-semibold mb-3">Recent Reports</h3>

          {reportHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No reports generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reportHistory.map(report => (
                <div
                  key={report.id}
                  className="report-item p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <h4 className="font-medium text-sm">{report.name}</h4>
                  <p className="text-xs text-gray-600">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {report.unitCount} vehicles • {report.format.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Current Report Preview */}
          {lastReport && (
            <div className="last-report mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h4 className="font-medium text-green-800">Latest Report Ready</h4>
              <p className="text-sm text-green-600">{lastReport.name}</p>
              <button className="mt-2 text-sm text-green-700 hover:text-green-900 underline">
                Download Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WialonReports;
