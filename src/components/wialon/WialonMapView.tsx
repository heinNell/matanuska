// src/components/wialon/WialonMapView.tsx
import React from 'react';
import { useWialonUnits } from '../../hooks/useWialonUnits';
import { useWialonContext } from '../../context/WialonContext';
import type { WialonUnitComplete } from '../../types/wialon-complete';

interface WialonMapViewProps {
  selectedUnitIds?: number[];
  showTrails?: boolean;
  showGeofences?: boolean;
  mapHeight?: string;
  className?: string;
  onUnitClick?: (unit: WialonUnitComplete) => void;
}

interface ExtendedMarker extends google.maps.Marker {
  infoWindow?: google.maps.InfoWindow;
}

/**
 * Task 3.1.6: Interactive map component with Google Maps integration
 * Shows unit positions, trails, geofences with real-time updates
 */
export const WialonMapView: React.FC<WialonMapViewProps> = ({
  selectedUnitIds = [],
  showTrails = false,
  showGeofences = false,
  mapHeight = '500px',
  className = '',
  onUnitClick,
}) => {
  const { units, loading, error, refreshUnits } = useWialonUnits();
  const { selectedUnit, setSelectedUnit } = useWialonContext();
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const googleMapRef = React.useRef<google.maps.Map | null>(null);
  const markersRef = React.useRef<Map<number, ExtendedMarker>>(new Map());

  // Load Google Maps API
  React.useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'}&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        setMapLoaded(true);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  React.useEffect(() => {
    if (mapLoaded && mapRef.current && !googleMapRef.current) {
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 64.2008, lng: -149.4937 }, // Fairbanks, Alaska default
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
    }
  }, [mapLoaded]);

  // Update markers when units change
  React.useEffect(() => {
    if (!googleMapRef.current || !units.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    const bounds = new google.maps.LatLngBounds();

    units.forEach(unit => {
      if (!unit.currentPosition && !unit.position) return;

      const position = unit.currentPosition ||
        (unit.position ? {
          lat: unit.position.latitude,
          lng: unit.position.longitude
        } : null);

      if (!position) return;

      const isSelected = selectedUnitIds.includes(unit.id) ||
                        (selectedUnit && selectedUnit.id === unit.id);

      // Create marker
      const marker = new google.maps.Marker({
        position: { lat: position.lat, lng: position.lng },
        map: googleMapRef.current,
        title: unit.nm || unit.name || `Unit ${unit.id}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 8,
          fillColor: unit.isOnline ? '#4CAF50' : '#f44336',
          fillOpacity: 1,
          strokeColor: isSelected ? '#2196F3' : '#ffffff',
          strokeWeight: 2,
        },
        zIndex: isSelected ? 1000 : 100,
      }) as ExtendedMarker;

      // Add click handler
      marker.addListener('click', () => {
        if (onUnitClick) {
          onUnitClick(unit);
        } else {
          setSelectedUnit(unit);
        }
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="map-info-window">
            <h3>${unit.nm || unit.name || 'Unknown Unit'}</h3>
            <p><strong>Status:</strong> ${unit.isOnline ? 'Online' : 'Offline'}</p>
            ${unit.speed !== undefined ? `<p><strong>Speed:</strong> ${unit.speed} km/h</p>` : ''}
            ${unit.registrationNumber ? `<p><strong>Registration:</strong> ${unit.registrationNumber}</p>` : ''}
            <p><strong>Last Update:</strong> ${unit.lastSeen?.toLocaleString() || 'N/A'}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        // Close all other info windows
        markersRef.current.forEach((otherMarker, otherId) => {
          if (otherId !== unit.id && otherMarker.infoWindow) {
            otherMarker.infoWindow.close();
          }
        });

        infoWindow.open(googleMapRef.current, marker);
      });

      marker.infoWindow = infoWindow;
      markersRef.current.set(unit.id, marker);
      bounds.extend({ lat: position.lat, lng: position.lng });
    });

    // Fit bounds if we have markers
    if (markersRef.current.size > 0) {
      googleMapRef.current.fitBounds(bounds);

      // Don't zoom too far if only one unit
      if (markersRef.current.size === 1) {
        const listener = google.maps.event.addListener(googleMapRef.current, 'idle', () => {
          if (googleMapRef.current!.getZoom()! > 15) {
            googleMapRef.current!.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        });
      }
    }
  }, [units, selectedUnitIds, selectedUnit, onUnitClick, setSelectedUnit]);

  // Auto-refresh units
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshUnits();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshUnits]);

  if (error) {
    return (
      <div className={`wialon-map-view error ${className}`}>
        <div className="error-content">
          <h3>Map Error</h3>
          <p>{error.message}</p>
          <button onClick={() => refreshUnits()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`wialon-map-view ${className}`}>
      <div className="map-controls">
        <div className="map-stats">
          <span className="stat">
            Total: {units.length}
          </span>
          <span className="stat online">
            Online: {units.filter(u => u.isOnline).length}
          </span>
          <span className="stat offline">
            Offline: {units.filter(u => !u.isOnline).length}
          </span>
        </div>

        <div className="map-actions">
          <button
            onClick={() => refreshUnits()}
            className="refresh-button"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>

          {/* Future toggle buttons for trails and geofences */}
          {showTrails && (
            <button className="toggle-button trails">
              🛤️ Trails
            </button>
          )}

          {showGeofences && (
            <button className="toggle-button geofences">
              📍 Geofences
            </button>
          )}
        </div>
      </div>

      <div
        ref={mapRef}
        className="google-map"
        style={{ height: mapHeight }}
      >
        {!mapLoaded && (
          <div className="map-loading">
            <div className="loading-spinner" />
            <p>Loading map...</p>
          </div>
        )}
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker online" />
          Online Units
        </div>
        <div className="legend-item">
          <span className="legend-marker offline" />
          Offline Units
        </div>
        <div className="legend-item">
          <span className="legend-marker selected" />
          Selected Unit
        </div>
      </div>

      <style jsx>{`
        .wialon-map-view {
          position: relative;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .error {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .error-content {
          text-align: center;
          color: #666;
        }

        .error-content h3 {
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

        .map-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .map-stats {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .stat {
          font-size: 14px;
          font-weight: 500;
          color: #666;
        }

        .stat.online {
          color: #28a745;
        }

        .stat.offline {
          color: #dc3545;
        }

        .map-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .refresh-button {
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 12px;
        }

        .refresh-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .refresh-button:hover:not(:disabled) {
          background: #218838;
        }

        .toggle-button {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 12px;
        }

        .toggle-button:hover {
          background: #0056b3;
        }

        .google-map {
          width: 100%;
          position: relative;
        }

        .map-loading {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          background: #f8f9fa;
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

        .map-legend {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 6px;
          padding: 10px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          font-size: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }

        .legend-item:last-child {
          margin-bottom: 0;
        }

        .legend-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          border: 2px solid white;
        }

        .legend-marker.online {
          background: #4CAF50;
        }

        .legend-marker.offline {
          background: #f44336;
        }

        .legend-marker.selected {
          background: #2196F3;
          border-color: #1976D2;
        }

        @media (max-width: 768px) {
          .map-controls {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .map-stats {
            order: 2;
          }

          .map-actions {
            order: 1;
            justify-content: center;
          }

          .map-legend {
            position: relative;
            bottom: auto;
            right: auto;
            margin: 10px;
          }
        }
      `}</style>

      {/* Global styles for info windows */}
      <style jsx global>{`
        .map-info-window {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          max-width: 200px;
        }

        .map-info-window h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #333;
        }

        .map-info-window p {
          margin: 4px 0;
          font-size: 12px;
          color: #666;
        }

        .map-info-window strong {
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default WialonMapView;
