// src/components/wialon/WialonReportViewer.tsx
import React from 'react';
import { useWialonReports } from '../../hooks/useWialonReports';
import type { WialonReportProcessed, WialonReportConfig } from '../../types/wialon-complete';

interface WialonReportViewerProps {
  reportConfig?: WialonReportConfig;
  reportData?: WialonReportProcessed;
  className?: string;
  showControls?: boolean;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
}

/**
 * Task 3.1.5: Report viewing component with export capabilities
 * Displays executed reports with tables, charts, and statistics
 */
export const WialonReportViewer: React.FC<WialonReportViewerProps> = ({
  reportConfig,
  reportData: externalData,
  className = '',
  showControls = true,
  onExport,
}) => {
  const { executeReport, loading, error } = useWialonReports();
  const [reportData, setReportData] = React.useState<WialonReportProcessed | null>(
    externalData || null
  );
  const [activeTab, setActiveTab] = React.useState<'summary' | 'tables' | 'charts'>('summary');

  // Execute report if config provided but no data
  React.useEffect(() => {
    const runReport = async () => {
      if (reportConfig && !externalData) {
        try {
          const result = await executeReport(reportConfig);
          setReportData(result);
        } catch (err) {
          console.error('Failed to execute report:', err);
        }
      }
    };

    runReport();
  }, [reportConfig, externalData, executeReport]);

  const currentData = externalData || reportData;

  if (loading) {
    return (
      <div className={`wialon-report-viewer loading ${className}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Executing report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`wialon-report-viewer error ${className}`}>
        <div className="error-container">
          <h3>Report Error</h3>
          <p>{error.message}</p>
          {reportConfig && (
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className={`wialon-report-viewer empty ${className}`}>
        <div className="empty-container">
          <h3>No Report Data</h3>
          <p>Please provide report configuration or data to display.</p>
        </div>
      </div>
    );
  }

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export handling
      console.log(`Exporting report ${currentData.reportId} as ${format}`);
      // Here you would implement actual export logic
    }
  };

  return (
    <div className={`wialon-report-viewer ${className}`}>
      {showControls && (
        <div className="report-controls">
          <div className="report-info">
            <h2>Report #{currentData.reportId}</h2>
            <p className="execution-time">
              Executed: {currentData.executedAt.toLocaleString()}
            </p>
          </div>

          <div className="export-controls">
            <button onClick={() => handleExport('csv')} className="export-btn csv">
              Export CSV
            </button>
            <button onClick={() => handleExport('excel')} className="export-btn excel">
              Export Excel
            </button>
            <button onClick={() => handleExport('pdf')} className="export-btn pdf">
              Export PDF
            </button>
          </div>
        </div>
      )}

      <div className="report-tabs">
        <button
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`tab-button ${activeTab === 'tables' ? 'active' : ''}`}
          onClick={() => setActiveTab('tables')}
        >
          Tables ({currentData.tables.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          Charts ({currentData.charts.length})
        </button>
      </div>

      <div className="report-content">
        {activeTab === 'summary' && (
          <div className="summary-tab">
            <div className="summary-overview">
              <h3>Report Summary</h3>
              <p>{currentData.summary}</p>
            </div>

            {Object.keys(currentData.statistics).length > 0 && (
              <div className="statistics-section">
                <h3>Statistics</h3>
                <div className="statistics-grid">
                  {Object.entries(currentData.statistics).map(([key, value]) => (
                    <div key={key} className="statistic-item">
                      <div className="statistic-label">{key.replace(/_/g, ' ')}</div>
                      <div className="statistic-value">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="report-meta">
              <h3>Report Information</h3>
              <div className="meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Report ID:</span>
                  <span className="meta-value">{currentData.reportId}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Execution Time:</span>
                  <span className="meta-value">{currentData.executedAt.toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Tables:</span>
                  <span className="meta-value">{currentData.tables.length}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Charts:</span>
                  <span className="meta-value">{currentData.charts.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="tables-tab">
            {currentData.tables.length === 0 ? (
              <div className="no-data">No tables available in this report.</div>
            ) : (
              currentData.tables.map((table, index) => (
                <div key={index} className="table-container">
                  <h3>{table.name}</h3>
                  <div className="table-info">
                    Rows: {table.rowCount} | Columns: {table.headers.length}
                  </div>

                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {table.headers.map((header, headerIndex) => (
                            <th key={headerIndex}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.data.slice(0, 100).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Array.isArray(row) ? (
                              row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{String(cell)}</td>
                              ))
                            ) : (
                              <td colSpan={table.headers.length}>
                                {String(row)}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {table.data.length > 100 && (
                      <div className="table-pagination">
                        Showing first 100 rows of {table.data.length}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="charts-tab">
            {currentData.charts.length === 0 ? (
              <div className="no-data">No charts available in this report.</div>
            ) : (
              currentData.charts.map((chart, index) => (
                <div key={index} className="chart-container">
                  <h3>Chart {index + 1} - {chart.type}</h3>
                  <div className="chart-placeholder">
                    <div className="chart-info">
                      <p>Chart Type: {chart.type}</p>
                      <p>Data Points: {chart.data.length}</p>
                      <p>Labels: {chart.labels.length}</p>
                    </div>
                    <div className="chart-note">
                      Chart visualization would be implemented here using a charting library like Chart.js or D3.js
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .wialon-report-viewer {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-container {
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error, .empty {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .error-container, .empty-container {
          text-align: center;
          color: #666;
        }

        .error-container h3 {
          color: #dc3545;
          margin-bottom: 10px;
        }

        .retry-button {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          margin-top: 15px;
        }

        .retry-button:hover {
          background: #0056b3;
        }

        .report-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .report-info h2 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .execution-time {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .export-controls {
          display: flex;
          gap: 8px;
        }

        .export-btn {
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }

        .export-btn.csv {
          background: #28a745;
          color: white;
        }

        .export-btn.excel {
          background: #17a2b8;
          color: white;
        }

        .export-btn.pdf {
          background: #dc3545;
          color: white;
        }

        .export-btn:hover {
          opacity: 0.9;
        }

        .report-tabs {
          display: flex;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .tab-button {
          flex: 1;
          padding: 15px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          transition: all 0.2s;
        }

        .tab-button:hover {
          background: #e9ecef;
          color: #333;
        }

        .tab-button.active {
          background: white;
          color: #007bff;
          border-bottom: 2px solid #007bff;
        }

        .report-content {
          padding: 20px;
        }

        .summary-overview {
          margin-bottom: 30px;
        }

        .summary-overview h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .statistics-section {
          margin-bottom: 30px;
        }

        .statistics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .statistic-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
        }

        .statistic-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .statistic-value {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .report-meta h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .meta-label {
          color: #666;
          font-weight: 500;
        }

        .meta-value {
          color: #333;
        }

        .table-container {
          margin-bottom: 40px;
        }

        .table-container h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .table-info {
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .table-wrapper {
          overflow-x: auto;
          border: 1px solid #e9ecef;
          border-radius: 6px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #e9ecef;
          font-weight: 600;
          color: #333;
        }

        .data-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f0f0f0;
          color: #666;
        }

        .data-table tr:hover {
          background: #f8f9fa;
        }

        .table-pagination {
          padding: 10px;
          text-align: center;
          background: #f8f9fa;
          color: #666;
          font-size: 14px;
        }

        .chart-container {
          margin-bottom: 40px;
        }

        .chart-container h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .chart-placeholder {
          border: 2px dashed #e9ecef;
          border-radius: 6px;
          padding: 40px;
          text-align: center;
          background: #f8f9fa;
        }

        .chart-info {
          margin-bottom: 20px;
        }

        .chart-info p {
          margin: 5px 0;
          color: #666;
        }

        .chart-note {
          color: #999;
          font-style: italic;
          font-size: 14px;
        }

        .no-data {
          text-align: center;
          color: #666;
          padding: 40px;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .report-controls {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .export-controls {
            justify-content: center;
          }

          .statistics-grid,
          .meta-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WialonReportViewer;
