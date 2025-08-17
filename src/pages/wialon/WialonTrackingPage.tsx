import React, { useState } from "react";
import WialonMap from "../../components/wialon/WialonMap";
import WialonUnitDetails from "../../components/wialon/WialonUnitDetails";
import { WialonProvider } from "../../context/WialonContext";

const WialonTrackingPage: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
  };

  return (
    <WialonProvider>
      <div className="wialon-tracking-page">
        <div className="wialon-page-header">
          <h1>Fleet Tracking</h1>
          <div className="actions">
            <button className="refresh-btn">
              <span className="material-icons">refresh</span>
              Refresh
            </button>
            <a 
              href="/admin-management/wialon-diagnostics" 
              className="diagnostics-btn"
              title="Run Wialon diagnostics"
            >
              <span className="material-icons">bug_report</span>
              Diagnostics
            </a>
            <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
              <span className="material-icons">
                {sidebarExpanded ? "chevron_right" : "chevron_left"}
              </span>
            </button>
          </div>
        </div>

        <div
          className={`wialon-tracking-container ${sidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`}
        >
          <div className="map-container">
            <WialonMap height="calc(100vh - 150px)" />
          </div>

          {sidebarExpanded && (
            <div className="sidebar">
              <div className="sidebar-header">
                <h2>Vehicle Details</h2>
              </div>
              <div className="sidebar-content">
                <WialonUnitDetails />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .wialon-tracking-page {
          padding: 20px;
          height: 100%;
        }

        .wialon-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .wialon-page-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .refresh-btn, .toggle-sidebar-btn {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .refresh-btn {
          background-color: #1976d2;
          color: white;
        }

        .refresh-btn:hover {
          background-color: #1565c0;
        }

        .toggle-sidebar-btn {
          background-color: #f5f5f5;
          color: #333;
        }

        .toggle-sidebar-btn:hover {
          background-color: #e0e0e0;
        }

        .material-icons {
          margin-right: 4px;
          font-size: 18px;
        }

        .wialon-tracking-container {
          display: flex;
          gap: 20px;
          height: calc(100% - 60px);
        }

        .wialon-tracking-container.sidebar-expanded .map-container {
          flex: 1;
        }

        .wialon-tracking-container.sidebar-collapsed .map-container {
          flex: 1;
        }

        .sidebar {
          width: 320px;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .sidebar-header {
          padding: 16px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #eee;
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .sidebar-content {
          padding: 16px;
        }
      `}</style>
    </WialonProvider>
  );
};

export default WialonTrackingPage;
