// src/components/wialon/WialonAlerts.tsx
import React from 'react';
import { useWialonUnits } from '../../hooks/useWialonUnits';
import type { WialonUnitComplete } from '../../types/wialon-complete';

interface WialonAlert {
  id: number;
  unitId: number;
  unitName: string;
  type: 'speed' | 'geofence' | 'fuel' | 'engine' | 'offline' | 'battery';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  position?: {
    lat: number;
    lng: number;
  };
}

interface WialonAlertsProps {
  unitIds?: number[];
  maxAlerts?: number;
  showFilters?: boolean;
  autoRefresh?: boolean;
  className?: string;
  onAlertClick?: (alert: WialonAlert) => void;
  onAlertAcknowledge?: (alertId: number) => void;
}

/**
 * Task 3.2.1: Alert management interface
 * Shows real-time alerts, filtering, acknowledgment, and history
 */
export const WialonAlerts: React.FC<WialonAlertsProps> = ({
  unitIds = [],
  maxAlerts = 50,
  showFilters = true,
  autoRefresh = true,
  className = '',
  onAlertClick,
  onAlertAcknowledge,
}) => {
  const { units, loading, error } = useWialonUnits();
  const [alerts, setAlerts] = React.useState<WialonAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = React.useState<WialonAlert[]>([]);
  const [filterType, setFilterType] = React.useState<string>('all');
  const [filterSeverity, setFilterSeverity] = React.useState<string>('all');
  const [showAcknowledged, setShowAcknowledged] = React.useState(false);
  const [selectedAlert, setSelectedAlert] = React.useState<WialonAlert | null>(null);

  // Generate mock alerts based on unit data
  const generateAlertsFromUnits = React.useCallback((unitsData: WialonUnitComplete[]): WialonAlert[] => {
    const mockAlerts: WialonAlert[] = [];
    let alertId = 1;

    unitsData.forEach(unit => {
      // Offline alert
      if (!unit.isOnline) {
        mockAlerts.push({
          id: alertId++,
          unitId: unit.id,
          unitName: unit.nm || unit.name || `Unit ${unit.id}`,
          type: 'offline',
          severity: 'high',
          message: `Unit went offline`,
          timestamp: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
          acknowledged: Math.random() > 0.7, // 30% acknowledged
          position: unit.currentPosition,
        });
      }

      // Speed alert
      if (unit.speed && unit.speed > 80) {
        mockAlerts.push({
          id: alertId++,
          unitId: unit.id,
          unitName: unit.nm || unit.name || `Unit ${unit.id}`,
          type: 'speed',
          severity: unit.speed > 100 ? 'critical' : 'high',
          message: `Speeding detected: ${unit.speed} km/h`,
          timestamp: new Date(Date.now() - Math.random() * 1800000), // Random time within last 30 min
          acknowledged: Math.random() > 0.8, // 20% acknowledged
          position: unit.currentPosition,
        });
      }

      // Fuel alert
      if (unit.fuelLevel && unit.fuelLevel < 20) {
        mockAlerts.push({
          id: alertId++,
          unitId: unit.id,
          unitName: unit.nm || unit.name || `Unit ${unit.id}`,
          type: 'fuel',
          severity: unit.fuelLevel < 10 ? 'critical' : 'medium',
          message: `Low fuel level: ${unit.fuelLevel}%`,
          timestamp: new Date(Date.now() - Math.random() * 7200000), // Random time within last 2 hours
          acknowledged: Math.random() > 0.6, // 40% acknowledged
          position: unit.currentPosition,
        });
      }

      // Engine hours alert
      if (unit.engineHours && unit.engineHours > 8000) {
        mockAlerts.push({
          id: alertId++,
          unitId: unit.id,
          unitName: unit.nm || unit.name || `Unit ${unit.id}`,
          type: 'engine',
          severity: 'medium',
          message: `High engine hours: ${unit.engineHours}h`,
          timestamp: new Date(Date.now() - Math.random() * 14400000), // Random time within last 4 hours
          acknowledged: Math.random() > 0.5, // 50% acknowledged
          position: unit.currentPosition,
        });
      }
    });

    // Sort by timestamp (newest first)
    return mockAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, maxAlerts);
  }, [maxAlerts]);

  // Load and refresh alerts
  React.useEffect(() => {
    if (units.length > 0) {
      const filteredUnits = unitIds.length > 0
        ? units.filter(unit => unitIds.includes(unit.id))
        : units;

      const generatedAlerts = generateAlertsFromUnits(filteredUnits);
      setAlerts(generatedAlerts);
    }
  }, [units, unitIds, generateAlertsFromUnits]);

  // Auto-refresh alerts
  React.useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (units.length > 0) {
        const filteredUnits = unitIds.length > 0
          ? units.filter(unit => unitIds.includes(unit.id))
          : units;

        const generatedAlerts = generateAlertsFromUnits(filteredUnits);
        setAlerts(generatedAlerts);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [units, unitIds, generateAlertsFromUnits, autoRefresh]);

  // Filter alerts
  React.useEffect(() => {
    let filtered = alerts;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(alert => alert.type === filterType);
    }

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

    // Filter by acknowledgment
    if (!showAcknowledged) {
      filtered = filtered.filter(alert => !alert.acknowledged);
    }

    setFilteredAlerts(filtered);
  }, [alerts, filterType, filterSeverity, showAcknowledged]);

  const handleAlertClick = (alert: WialonAlert) => {
    setSelectedAlert(alert);
    if (onAlertClick) {
      onAlertClick(alert);
    }
  };

  const handleAcknowledge = (alertId: number, event: React.MouseEvent) => {
    event.stopPropagation();

    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );

    if (onAlertAcknowledge) {
      onAlertAcknowledge(alertId);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'speed': return '🚗';
      case 'geofence': return '📍';
      case 'fuel': return '⛽';
      case 'engine': return '🔧';
      case 'offline': return '📵';
      case 'battery': return '🔋';
      default: return '⚠️';
    }
  };

  if (loading) {
    return (
      <div className={`wialon-alerts loading ${className}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`wialon-alerts error ${className}`}>
        <div className="error-container">
          <h3>Alerts Error</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length;

  return (
    <div className={`wialon-alerts ${className}`}>
      <div className="alerts-header">
        <div className="alerts-title">
          <h2>Fleet Alerts</h2>
          <div className="alerts-summary">
            <span className="alert-count critical">
              {criticalCount} Critical
            </span>
            <span className="alert-count unread">
              {unacknowledgedCount} Unread
            </span>
            <span className="alert-count total">
              {alerts.length} Total
            </span>
          </div>
        </div>

        {showFilters && (
          <div className="alerts-filters">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="speed">Speed</option>
              <option value="geofence">Geofence</option>
              <option value="fuel">Fuel</option>
              <option value="engine">Engine</option>
              <option value="offline">Offline</option>
              <option value="battery">Battery</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={showAcknowledged}
                onChange={(e) => setShowAcknowledged(e.target.checked)}
              />
              Show Acknowledged
            </label>
          </div>
        )}
      </div>

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <div className="no-alerts-icon">✅</div>
            <h3>No Alerts</h3>
            <p>All systems are running normally</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`alert-item ${alert.severity} ${alert.acknowledged ? 'acknowledged' : 'unacknowledged'} ${selectedAlert?.id === alert.id ? 'selected' : ''}`}
              onClick={() => handleAlertClick(alert)}
            >
              <div className="alert-icon">
                {getTypeIcon(alert.type)}
              </div>

              <div className="alert-content">
                <div className="alert-header">
                  <span className="alert-unit">{alert.unitName}</span>
                  <span className="alert-timestamp">
                    {alert.timestamp.toLocaleString()}
                  </span>
                </div>

                <div className="alert-message">
                  {alert.message}
                </div>

                <div className="alert-meta">
                  <span className="alert-type">{alert.type.toUpperCase()}</span>
                  <span
                    className="alert-severity"
                    style={{ color: getSeverityColor(alert.severity) }}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                  {alert.position && (
                    <span className="alert-position">
                      {alert.position.lat.toFixed(4)}, {alert.position.lng.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>

              <div className="alert-actions">
                {!alert.acknowledged && (
                  <button
                    onClick={(e) => handleAcknowledge(alert.id, e)}
                    className="acknowledge-btn"
                    title="Acknowledge Alert"
                  >
                    ✓
                  </button>
                )}
                {alert.acknowledged && (
                  <span className="acknowledged-badge">ACK</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .wialon-alerts {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .loading-container {
          text-align: center;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        .error-container {
          text-align: center;
          color: #666;
        }

        .error-container h3 {
          color: #dc3545;
          margin-bottom: 10px;
        }

        .alerts-header {
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .alerts-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .alerts-title h2 {
          margin: 0;
          color: #333;
        }

        .alerts-summary {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .alert-count {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .alert-count.critical {
          background: #dc3545;
          color: white;
        }

        .alert-count.unread {
          background: #ffc107;
          color: #333;
        }

        .alert-count.total {
          background: #e9ecef;
          color: #666;
        }

        .alerts-filters {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .filter-select {
          padding: 6px 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .filter-checkbox {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          color: #666;
        }

        .alerts-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .no-alerts {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .no-alerts-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .no-alerts h3 {
          margin: 0 0 10px 0;
          color: #28a745;
        }

        .alert-item {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .alert-item:hover {
          background: #f8f9fa;
        }

        .alert-item.selected {
          background: #e3f2fd;
          border-left: 4px solid #2196F3;
        }

        .alert-item.unacknowledged {
          border-left: 4px solid transparent;
        }

        .alert-item.critical.unacknowledged {
          border-left-color: #dc3545;
        }

        .alert-item.high.unacknowledged {
          border-left-color: #fd7e14;
        }

        .alert-item.medium.unacknowledged {
          border-left-color: #ffc107;
        }

        .alert-item.low.unacknowledged {
          border-left-color: #28a745;
        }

        .alert-item.acknowledged {
          opacity: 0.7;
        }

        .alert-icon {
          font-size: 24px;
          margin-right: 15px;
          flex-shrink: 0;
        }

        .alert-content {
          flex: 1;
          min-width: 0;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }

        .alert-unit {
          font-weight: 600;
          color: #333;
        }

        .alert-timestamp {
          font-size: 12px;
          color: #666;
        }

        .alert-message {
          color: #333;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .alert-meta {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .alert-type,
        .alert-severity {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 8px;
          background: #e9ecef;
          color: #666;
        }

        .alert-position {
          font-size: 11px;
          color: #666;
          font-family: monospace;
        }

        .alert-actions {
          margin-left: 15px;
          flex-shrink: 0;
        }

        .acknowledge-btn {
          background: #28a745;
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .acknowledge-btn:hover {
          background: #218838;
        }

        .acknowledged-badge {
          background: #6c757d;
          color: white;
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 10px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .alerts-title {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .alerts-filters {
            flex-wrap: wrap;
          }

          .alert-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .alert-meta {
            flex-wrap: wrap;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default WialonAlerts;
