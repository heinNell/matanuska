import React from "react";
import { useWialonContext } from "../../context/WialonContext";
import { useWialonUnits } from "../../hooks/useWialonUnits";
import { ExtendedWialonUnit } from "../../hooks/useWialon";
import type { WialonUnitComplete } from "../../types/wialon-complete";

interface WialonUnitDetailsProps {
  unit?: ExtendedWialonUnit | null; // Optional override for selected unit
  unitId?: number; // For loading complete unit data
  className?: string;
  showHeader?: boolean;
  showActions?: boolean;
  onClose?: () => void;
}

const WialonUnitDetails: React.FC<WialonUnitDetailsProps> = ({
  unit,
  unitId,
  className = "",
  showHeader = true,
  showActions = true,
  onClose,
}) => {
  const { selectedUnit, setSelectedUnit } = useWialonContext();
  const { getUnitDetails, loading, error } = useWialonUnits();
  const [completeUnit, setCompleteUnit] = React.useState<WialonUnitComplete | null>(null);
  const unitToDisplay = unit || selectedUnit;

  // Load complete unit data if unitId provided
  React.useEffect(() => {
    const loadCompleteUnit = async () => {
      if (unitId) {
        try {
          const unitData = await getUnitDetails(unitId);
          setCompleteUnit(unitData);
        } catch (err) {
          console.error('Failed to load complete unit details:', err);
        }
      }
    };

    loadCompleteUnit();
  }, [unitId, getUnitDetails]);

  // Use complete unit data if available
  const displayUnit = completeUnit || unitToDisplay;

  if (!displayUnit) {
    return (
      <div className={`wialon-unit-details empty ${className}`}>
        {loading ? (
          <p>Loading vehicle details...</p>
        ) : (
          <p>No vehicle selected</p>
        )}
        {error && (
          <p className="error">Error: {error.message}</p>
        )}
      </div>
    );
  }

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Determine connection status
  const getConnectionStatus = () => {
    if (!unitToDisplay.connection_state) return "Offline";
    return "Online";
  };

  // Format speed
  const formatSpeed = (speed?: number) => {
    if (speed === undefined || speed === null) return "N/A";
    return `${speed} km/h`;
  };

  return (
    <div className={`wialon-unit-details ${className}`}>
      {showHeader && (
        <div className="wialon-unit-header">
          <h3>{displayUnit.name || displayUnit.nm || 'Unknown Vehicle'}</h3>
          <div className="header-actions">
            <div className={`status-indicator ${getConnectionStatus().toLowerCase()}`}>
              {getConnectionStatus()}
            </div>
            {onClose && (
              <button className="close-btn" onClick={onClose}>
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      <div className="wialon-unit-body">
        {/* Enhanced data from complete unit */}
        {completeUnit?.registrationNumber && (
          <div className="detail-row">
            <span className="label">Registration:</span>
            <span className="value">{completeUnit.registrationNumber}</span>
          </div>
        )}

        {displayUnit.registration && !completeUnit?.registrationNumber && (
          <div className="detail-row">
            <span className="label">Registration:</span>
            <span className="value">{displayUnit.registration}</span>
          </div>
        )}

        {completeUnit?.vehicleType && (
          <div className="detail-row">
            <span className="label">Vehicle Type:</span>
            <span className="value">{completeUnit.vehicleType}</span>
          </div>
        )}

        {displayUnit.type && !completeUnit?.vehicleType && (
          <div className="detail-row">
            <span className="label">Type:</span>
            <span className="value">{displayUnit.type}</span>
          </div>
        )}

        {completeUnit?.fleetId && (
          <div className="detail-row">
            <span className="label">Fleet ID:</span>
            <span className="value">{completeUnit.fleetId}</span>
          </div>
        )}

        {displayUnit.uniqueId && (
          <div className="detail-row">
            <span className="label">Unit ID:</span>
            <span className="value">{displayUnit.uniqueId}</span>
          </div>
        )}

        {/* Enhanced status information */}
        {completeUnit?.speed !== undefined && (
          <div className="detail-row">
            <span className="label">Current Speed:</span>
            <span className="value">{completeUnit.speed} km/h</span>
          </div>
        )}

        {completeUnit?.fuelLevel !== undefined && (
          <div className="detail-row">
            <span className="label">Fuel Level:</span>
            <span className="value">{completeUnit.fuelLevel}%</span>
          </div>
        )}

        {completeUnit?.engineHours !== undefined && (
          <div className="detail-row">
            <span className="label">Engine Hours:</span>
            <span className="value">{completeUnit.engineHours}h</span>
          </div>
        )}

        {/* Position information */}
        {(completeUnit?.currentPosition || displayUnit.position) && (
          <>
            <div className="detail-row">
              <span className="label">Position:</span>
              <span className="value">
                {completeUnit?.currentPosition ? (
                  `${completeUnit.currentPosition.lat.toFixed(6)}, ${completeUnit.currentPosition.lng.toFixed(6)}`
                ) : displayUnit.position ? (
                  `${displayUnit.position.latitude.toFixed(6)}, ${displayUnit.position.longitude.toFixed(6)}`
                ) : 'N/A'}
              </span>
            </div>

            {!completeUnit?.speed && displayUnit.position?.speed !== undefined && (
              <div className="detail-row">
                <span className="label">Speed:</span>
                <span className="value">{formatSpeed(displayUnit.position.speed)}</span>
              </div>
            )}

            <div className="detail-row">
              <span className="label">Last update:</span>
              <span className="value">
                {completeUnit?.lastSeen ?
                  completeUnit.lastSeen.toLocaleString() :
                  formatTimestamp(displayUnit.position?.timestamp)
                }
              </span>
            </div>
          </>
        )}

        {/* Sensors information for complete unit */}
        {completeUnit?.sensors && completeUnit.sensors.length > 0 && (
          <div className="detail-section">
            <div className="detail-row">
              <span className="label">Sensors:</span>
              <span className="value">{completeUnit.sensors.length} active</span>
            </div>
          </div>
        )}
      </div>

      {showActions && (
        <div className="wialon-unit-actions">
          <button className="center-map-btn" onClick={() => setSelectedUnit(unitToDisplay)}>
            Center on map
          </button>

          <button
            className="view-history-btn"
            onClick={() => {
              // Navigate to history view or open modal
              // Implementation depends on your application structure
              console.log("View history for unit:", unitToDisplay.id);
            }}
          >
            View history
          </button>
        </div>
      )}

      <style>{`
        .wialon-unit-details {
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 16px;
        }

        .wialon-unit-details.empty {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 150px;
          color: #666;
        }

        .wialon-unit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .close-btn {
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .close-btn:hover {
          background: #5a6268;
        }

        .wialon-unit-details.empty .error {
          color: #dc3545;
          margin-top: 10px;
        }

        .wialon-unit-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .status-indicator {
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-indicator.online {
          background-color: #e6f7e6;
          color: #2e7d32;
        }

        .status-indicator.offline {
          background-color: #ffeaeb;
          color: #d32f2f;
        }

        .wialon-unit-body {
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .label {
          color: #666;
          font-size: 14px;
        }

        .value {
          font-size: 14px;
          font-weight: 500;
          text-align: right;
        }

        .wialon-unit-actions {
          display: flex;
          gap: 8px;
        }

        .wialon-unit-actions button {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .center-map-btn {
          background-color: #1976d2;
          color: white;
        }

        .center-map-btn:hover {
          background-color: #1565c0;
        }

        .view-history-btn {
          background-color: #f5f5f5;
          color: #333;
        }

        .view-history-btn:hover {
          background-color: #e0e0e0;
        }
      `}</style>
    </div>
  );
};

export default WialonUnitDetails;
