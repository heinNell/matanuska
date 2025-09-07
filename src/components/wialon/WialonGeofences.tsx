// src/components/wialon/WialonGeofences.tsx
import React from 'react';
import { useWialonUnits } from '../../hooks/useWialonUnits';
import type { WialonUnitComplete } from '../../types/wialon-complete';

interface WialonGeofence {
  id: number;
  name: string;
  type: 'circle' | 'polygon' | 'rectangle';
  description?: string;
  active: boolean;
  color: string;
  alertOnEnter: boolean;
  alertOnExit: boolean;
  // Circle properties
  center?: {
    lat: number;
    lng: number;
  };
  radius?: number; // meters
  // Polygon/Rectangle properties
  coordinates?: {
    lat: number;
    lng: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface WialonGeofenceEvent {
  id: number;
  geofenceId: number;
  geofenceName: string;
  unitId: number;
  unitName: string;
  eventType: 'enter' | 'exit';
  timestamp: Date;
  position: {
    lat: number;
    lng: number;
  };
}

interface WialonGeofencesProps {
  showMap?: boolean;
  showEvents?: boolean;
  maxEvents?: number;
  className?: string;
  onGeofenceSelect?: (geofence: WialonGeofence) => void;
  onGeofenceCreate?: (geofence: Omit<WialonGeofence, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onGeofenceEdit?: (geofence: WialonGeofence) => void;
  onGeofenceDelete?: (geofenceId: number) => void;
}

/**
 * Task 3.2.2: Geofence management interface
 * Shows geofences, events, creation/editing capabilities
 */
export const WialonGeofences: React.FC<WialonGeofencesProps> = ({
  showMap = true,
  showEvents = true,
  maxEvents = 100,
  className = '',
  onGeofenceSelect,
  onGeofenceCreate,
  onGeofenceEdit,
  onGeofenceDelete,
}) => {
  const { units, loading, error } = useWialonUnits();
  const [geofences, setGeofences] = React.useState<WialonGeofence[]>([]);
  const [events, setEvents] = React.useState<WialonGeofenceEvent[]>([]);
  const [selectedGeofence, setSelectedGeofence] = React.useState<WialonGeofence | null>(null);
  const [activeTab, setActiveTab] = React.useState<'geofences' | 'events'>('geofences');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingGeofence, setEditingGeofence] = React.useState<WialonGeofence | null>(null);

  // Mock geofences data
  const mockGeofences: WialonGeofence[] = React.useMemo(() => [
    {
      id: 1,
      name: 'Warehouse District',
      type: 'polygon',
      description: 'Main warehouse and distribution center',
      active: true,
      color: '#4CAF50',
      alertOnEnter: true,
      alertOnExit: true,
      coordinates: [
        { lat: 64.2108, lng: -149.4837 },
        { lat: 64.2118, lng: -149.4827 },
        { lat: 64.2118, lng: -149.4847 },
        { lat: 64.2108, lng: -149.4857 },
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-10'),
    },
    {
      id: 2,
      name: 'Downtown Delivery Zone',
      type: 'circle',
      description: 'Central business district delivery area',
      active: true,
      color: '#2196F3',
      alertOnEnter: false,
      alertOnExit: true,
      center: { lat: 64.2008, lng: -149.4937 },
      radius: 1000, // 1km radius
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-15'),
    },
    {
      id: 3,
      name: 'Airport Service Area',
      type: 'rectangle',
      description: 'Fairbanks International Airport service zone',
      active: false,
      color: '#ff9800',
      alertOnEnter: true,
      alertOnExit: true,
      coordinates: [
        { lat: 64.8158, lng: -147.8560 },
        { lat: 64.8158, lng: -147.8360 },
        { lat: 64.8058, lng: -147.8360 },
        { lat: 64.8058, lng: -147.8560 },
      ],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-05'),
    },
  ], []);

  // Generate mock geofence events
  const generateMockEvents = React.useCallback((unitsData: WialonUnitComplete[]): WialonGeofenceEvent[] => {
    const mockEvents: WialonGeofenceEvent[] = [];
    let eventId = 1;

    // Generate events for active units
    const activeUnits = unitsData.filter(unit => unit.isOnline).slice(0, 10);

    activeUnits.forEach(unit => {
      mockGeofences.forEach(geofence => {
        if (!geofence.active) return;

        // Generate random events
        const eventCount = Math.floor(Math.random() * 3);

        for (let i = 0; i < eventCount; i++) {
          const eventType: 'enter' | 'exit' = Math.random() > 0.5 ? 'enter' : 'exit';
          const baseTime = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000; // Within last week

          let eventPosition = { lat: 64.2008, lng: -149.4937 }; // Default Fairbanks

          if (geofence.center) {
            // For circular geofences
            const offset = 0.001;
            eventPosition = {
              lat: geofence.center.lat + (Math.random() - 0.5) * offset,
              lng: geofence.center.lng + (Math.random() - 0.5) * offset,
            };
          } else if (geofence.coordinates && geofence.coordinates.length > 0) {
            // For polygon/rectangle geofences
            const coord = geofence.coordinates[0];
            const offset = 0.0005;
            eventPosition = {
              lat: coord.lat + (Math.random() - 0.5) * offset,
              lng: coord.lng + (Math.random() - 0.5) * offset,
            };
          }

          mockEvents.push({
            id: eventId++,
            geofenceId: geofence.id,
            geofenceName: geofence.name,
            unitId: unit.id,
            unitName: unit.nm || unit.name || `Unit ${unit.id}`,
            eventType,
            timestamp: new Date(baseTime),
            position: eventPosition,
          });
        }
      });
    });

    return mockEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, maxEvents);
  }, [mockGeofences, maxEvents]);

  // Load data
  React.useEffect(() => {
    setGeofences(mockGeofences);

    if (units.length > 0) {
      const generatedEvents = generateMockEvents(units);
      setEvents(generatedEvents);
    }
  }, [mockGeofences, units, generateMockEvents]);

  const handleGeofenceSelect = (geofence: WialonGeofence) => {
    setSelectedGeofence(geofence);
    if (onGeofenceSelect) {
      onGeofenceSelect(geofence);
    }
  };

  const handleCreateGeofence = () => {
    setShowCreateModal(true);
  };

  const handleEditGeofence = (geofence: WialonGeofence) => {
    setEditingGeofence(geofence);
  };

  const handleDeleteGeofence = (geofenceId: number) => {
    if (window.confirm('Are you sure you want to delete this geofence?')) {
      setGeofences(prev => prev.filter(g => g.id !== geofenceId));
      if (onGeofenceDelete) {
        onGeofenceDelete(geofenceId);
      }
    }
  };

  const toggleGeofenceActive = (geofenceId: number) => {
    setGeofences(prev =>
      prev.map(g =>
        g.id === geofenceId ? { ...g, active: !g.active, updatedAt: new Date() } : g
      )
    );
  };

  if (loading) {
    return (
      <div className={`wialon-geofences loading ${className}`}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading geofences...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`wialon-geofences error ${className}`}>
        <div className="error-container">
          <h3>Geofences Error</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  const activeGeofences = geofences.filter(g => g.active);
  const recentEvents = events.slice(0, 10);

  return (
    <div className={`wialon-geofences ${className}`}>
      <div className="geofences-header">
        <div className="header-title">
          <h2>Geofence Management</h2>
          <div className="geofence-stats">
            <span className="stat">
              {geofences.length} Total
            </span>
            <span className="stat active">
              {activeGeofences.length} Active
            </span>
            <span className="stat events">
              {events.length} Events
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={handleCreateGeofence}
            className="create-btn"
          >
            + Create Geofence
          </button>
        </div>
      </div>

      <div className="geofences-tabs">
        <button
          className={`tab-button ${activeTab === 'geofences' ? 'active' : ''}`}
          onClick={() => setActiveTab('geofences')}
        >
          Geofences ({geofences.length})
        </button>
        {showEvents && (
          <button
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events ({events.length})
          </button>
        )}
      </div>

      <div className="geofences-content">
        {activeTab === 'geofences' && (
          <div className="geofences-list">
            {geofences.length === 0 ? (
              <div className="no-geofences">
                <div className="no-geofences-icon">📍</div>
                <h3>No Geofences</h3>
                <p>Create your first geofence to monitor areas of interest</p>
                <button onClick={handleCreateGeofence} className="create-first-btn">
                  Create Geofence
                </button>
              </div>
            ) : (
              geofences.map(geofence => (
                <div
                  key={geofence.id}
                  className={`geofence-item ${geofence.active ? 'active' : 'inactive'} ${selectedGeofence?.id === geofence.id ? 'selected' : ''}`}
                  onClick={() => handleGeofenceSelect(geofence)}
                >
                  <div className="geofence-color" style={{ backgroundColor: geofence.color }} />

                  <div className="geofence-info">
                    <div className="geofence-header">
                      <h3>{geofence.name}</h3>
                      <div className="geofence-meta">
                        <span className="geofence-type">{geofence.type.toUpperCase()}</span>
                        <span className={`geofence-status ${geofence.active ? 'active' : 'inactive'}`}>
                          {geofence.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>

                    {geofence.description && (
                      <p className="geofence-description">{geofence.description}</p>
                    )}

                    <div className="geofence-details">
                      <div className="detail-item">
                        <span>Alerts:</span>
                        <span>
                          {geofence.alertOnEnter && geofence.alertOnExit ? 'Enter & Exit' :
                           geofence.alertOnEnter ? 'Enter Only' :
                           geofence.alertOnExit ? 'Exit Only' : 'None'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span>Created:</span>
                        <span>{geofence.createdAt.toLocaleDateString()}</span>
                      </div>
                      {geofence.type === 'circle' && geofence.radius && (
                        <div className="detail-item">
                          <span>Radius:</span>
                          <span>{geofence.radius}m</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="geofence-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGeofenceActive(geofence.id);
                      }}
                      className={`toggle-btn ${geofence.active ? 'active' : 'inactive'}`}
                      title={geofence.active ? 'Deactivate' : 'Activate'}
                    >
                      {geofence.active ? '👁️' : '👁️‍🗨️'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGeofence(geofence);
                      }}
                      className="edit-btn"
                      title="Edit Geofence"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGeofence(geofence.id);
                      }}
                      className="delete-btn"
                      title="Delete Geofence"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'events' && showEvents && (
          <div className="events-list">
            {events.length === 0 ? (
              <div className="no-events">
                <div className="no-events-icon">📋</div>
                <h3>No Events</h3>
                <p>Geofence events will appear here as units enter and exit defined areas</p>
              </div>
            ) : (
              <div className="events-container">
                <div className="events-summary">
                  <div className="summary-item">
                    <span className="summary-label">Recent Activity:</span>
                    <span className="summary-value">{recentEvents.length} events</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Enter Events:</span>
                    <span className="summary-value">{events.filter(e => e.eventType === 'enter').length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Exit Events:</span>
                    <span className="summary-value">{events.filter(e => e.eventType === 'exit').length}</span>
                  </div>
                </div>

                <div className="events-timeline">
                  {events.map(event => (
                    <div key={event.id} className={`event-item ${event.eventType}`}>
                      <div className="event-indicator">
                        {event.eventType === 'enter' ? '→' : '←'}
                      </div>

                      <div className="event-content">
                        <div className="event-header">
                          <span className="event-unit">{event.unitName}</span>
                          <span className={`event-type ${event.eventType}`}>
                            {event.eventType.toUpperCase()}
                          </span>
                          <span className="event-timestamp">
                            {event.timestamp.toLocaleString()}
                          </span>
                        </div>

                        <div className="event-details">
                          <span className="event-geofence">📍 {event.geofenceName}</span>
                          <span className="event-position">
                            {event.position.lat.toFixed(4)}, {event.position.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal Placeholder */}
      {(showCreateModal || editingGeofence) && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setEditingGeofence(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGeofence ? 'Edit Geofence' : 'Create New Geofence'}</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingGeofence(null);
                }}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Geofence creation/editing interface would be implemented here.</p>
              <p>Features would include:</p>
              <ul>
                <li>Interactive map for drawing geofences</li>
                <li>Name and description fields</li>
                <li>Alert configuration options</li>
                <li>Color selection</li>
                <li>Shape type selection (circle, polygon, rectangle)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .wialon-geofences {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
          min-height: 300px;
        }

        .error-container {
          text-align: center;
          color: #666;
        }

        .error-container h3 {
          color: #dc3545;
          margin-bottom: 10px;
        }

        .geofences-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .header-title h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .geofence-stats {
          display: flex;
          gap: 15px;
        }

        .stat {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          background: #e9ecef;
          color: #666;
        }

        .stat.active {
          background: #d4edda;
          color: #155724;
        }

        .stat.events {
          background: #d1ecf1;
          color: #0c5460;
        }

        .create-btn {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 16px;
          cursor: pointer;
          font-weight: 500;
        }

        .create-btn:hover {
          background: #0056b3;
        }

        .geofences-tabs {
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

        .geofences-content {
          padding: 20px;
        }

        .no-geofences,
        .no-events {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .no-geofences-icon,
        .no-events-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .no-geofences h3,
        .no-events h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .create-first-btn {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 12px 24px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 15px;
        }

        .create-first-btn:hover {
          background: #0056b3;
        }

        .geofence-item {
          display: flex;
          align-items: center;
          padding: 15px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .geofence-item:hover {
          background: #f8f9fa;
          border-color: #007bff;
        }

        .geofence-item.selected {
          background: #e3f2fd;
          border-color: #2196F3;
        }

        .geofence-item.inactive {
          opacity: 0.7;
        }

        .geofence-color {
          width: 4px;
          height: 60px;
          border-radius: 2px;
          margin-right: 15px;
          flex-shrink: 0;
        }

        .geofence-info {
          flex: 1;
          min-width: 0;
        }

        .geofence-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .geofence-header h3 {
          margin: 0;
          color: #333;
          font-size: 16px;
        }

        .geofence-meta {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .geofence-type {
          background: #e9ecef;
          color: #666;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
        }

        .geofence-status.active {
          background: #d4edda;
          color: #155724;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
        }

        .geofence-status.inactive {
          background: #f8d7da;
          color: #721c24;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
        }

        .geofence-description {
          color: #666;
          font-size: 14px;
          margin: 0 0 10px 0;
        }

        .geofence-details {
          display: flex;
          gap: 20px;
          font-size: 12px;
        }

        .detail-item {
          display: flex;
          gap: 5px;
        }

        .detail-item span:first-child {
          color: #666;
          font-weight: 500;
        }

        .detail-item span:last-child {
          color: #333;
        }

        .geofence-actions {
          display: flex;
          gap: 8px;
          margin-left: 15px;
        }

        .toggle-btn,
        .edit-btn,
        .delete-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-btn.active {
          background: #d4edda;
        }

        .toggle-btn.inactive {
          background: #f8d7da;
        }

        .edit-btn {
          background: #fff3cd;
        }

        .delete-btn {
          background: #f8d7da;
        }

        .toggle-btn:hover,
        .edit-btn:hover,
        .delete-btn:hover {
          opacity: 0.8;
        }

        .events-summary {
          display: flex;
          gap: 30px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .summary-label {
          font-size: 12px;
          color: #666;
        }

        .summary-value {
          font-weight: 600;
          color: #333;
        }

        .events-timeline {
          max-height: 500px;
          overflow-y: auto;
        }

        .event-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-left: 3px solid transparent;
          border-bottom: 1px solid #f0f0f0;
        }

        .event-item.enter {
          border-left-color: #28a745;
        }

        .event-item.exit {
          border-left-color: #dc3545;
        }

        .event-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 16px;
          font-weight: bold;
        }

        .event-item.enter .event-indicator {
          background: #d4edda;
          color: #155724;
        }

        .event-item.exit .event-indicator {
          background: #f8d7da;
          color: #721c24;
        }

        .event-content {
          flex: 1;
        }

        .event-header {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 5px;
        }

        .event-unit {
          font-weight: 600;
          color: #333;
        }

        .event-type.enter {
          background: #d4edda;
          color: #155724;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }

        .event-type.exit {
          background: #f8d7da;
          color: #721c24;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
        }

        .event-timestamp {
          font-size: 12px;
          color: #666;
        }

        .event-details {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #666;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80%;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
        }

        .modal-close:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-body ul {
          margin: 15px 0;
          padding-left: 20px;
        }

        .modal-body li {
          margin-bottom: 8px;
          color: #666;
        }

        @media (max-width: 768px) {
          .geofences-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .geofence-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .geofence-details {
            flex-direction: column;
            gap: 8px;
          }

          .events-summary {
            flex-direction: column;
            gap: 15px;
          }

          .event-header {
            flex-direction: column;
            gap: 5px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default WialonGeofences;
