import { FC, useState, useCallback } from 'react';
import { useWialonUnits } from '@/hooks/useWialonUnits';
import { useWialonUnitDetail } from '@/hooks/useWialonUnitDetail';
import WialonUnitsMapMarkers from '@/components/WialonUnitsMapMarkers';
import RealtimeUnitTracker from '@/components/RealtimeUnitTracker'; // FIX: Added import for RealtimeUnitTracker
import { UnitInfo } from '@/types/wialon';

// Helper function to render a single unit item in the sidebar list
const UnitListItem: FC<{ unit: UnitInfo, onUnitClick: (unit: UnitInfo) => void, isSelected: boolean }> = ({ unit, onUnitClick, isSelected }) => {
    return (
        <div
            className={`unit-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onUnitClick(unit)}
        >
            <span className="unit-title">{unit.name}</span>
            <span className="unit-meta">ID: {unit.id}</span>
        </div>
    );
};

const WialonDashboard: FC = () => {
    // Replace with your real Wialon token
    const WIALON_TOKEN = "c1099bc37c906fd0832d8e783b60ae0dD9D1A721B294486AC08F8AA3ACAC2D2FD45FF053";

    const { units, loading, error, refreshUnits } = useWialonUnits(WIALON_TOKEN);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const { unit: selectedUnitDetail, loading: detailLoading } = useWialonUnitDetail(selectedUnitId);

    // Placeholder for map state and instance
    const [map, setMap] = useState<any>(null);

    const handleUnitClick = useCallback((unit: UnitInfo) => {
        setSelectedUnitId(unit.id);
    }, []);

    // Placeholder for a detailed info panel for the selected unit
    const InfoPanel = () => {
        if (!selectedUnitDetail) return null;
        return (
            <div id="info-panel">
                <div id="panel-unit-name">{selectedUnitDetail.name}</div>
                <div id="panel-unit-meta">UID: {selectedUnitDetail.uid}</div>
                <div id="panel-details">
                    <div className="route-details"><b>Last Position:</b></div>
                    <ul className="timeline">
                        <li><b>Speed:</b> {selectedUnitDetail.speed} km/h</li>
                        <li><b>Status:</b> {selectedUnitDetail.status}</li>
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="app-dashboard">
            <aside className="sidebar" id="sidebar">
                <h2 className="sidebar-header">Wialon Dashboard</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}
                {!loading && units.length > 0 && (
                    <div id="unit-list">
                        {units.map(unit => (
                            <UnitListItem
                                key={unit.id}
                                unit={unit}
                                onUnitClick={handleUnitClick}
                                isSelected={selectedUnitId === unit.id}
                            />
                        ))}
                    </div>
                )}
                <InfoPanel />
            </aside>
            <div id="map-container" className="main-map">
                 <div id="map" ref={node => setMap(node)}></div> {/* Leaflet map mount point */}
            </div>

            {/* These components are mounted but not rendered in the DOM directly */}
            {/* They perform side effects on the map instance */}
            <WialonUnitsMapMarkers units={units} map={map} />
            <RealtimeUnitTracker unitId={selectedUnitId} map={map} />
        </div>
    );
};

export default WialonDashboard;
