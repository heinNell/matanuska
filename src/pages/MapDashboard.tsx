import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './MapDashboard.css';

// Import our custom map components
import { GoogleMapWrapper } from '../components/GoogleMapWrapper';
import { GoogleMap } from '../components/GoogleMap';

// Import any utility functions
import { formatAddress, LocationInput, calculateDistance } from '../utils/mapUtils';
import { fetchVehicleData, updateVehicleLocation } from '../api/vehicleApi';

// Types for our component
interface Vehicle {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdate: string;
}

interface Marker {
  id: string;
  marker: google.maps.Marker;
  infoWindow?: google.maps.InfoWindow;
}

const MapDashboard: React.FC = () => {
  // Map and map objects state
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);

  // Map bounds for auto-fitting the view
  const boundsRef = useRef<google.maps.LatLngBounds>(new google.maps.LatLngBounds());

  // Refresh timer ref
  const refreshTimerRef = useRef<number | null>(null);

  // Load vehicle data
  const loadVehicleData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchVehicleData();
      setVehicles(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading vehicle data:', error);
      setIsLoading(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    loadVehicleData();

    // Set up refresh interval
    refreshTimerRef.current = window.setInterval(() => {
      loadVehicleData();
    }, 60000); // Refresh every minute

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [loadVehicleData]);

  // Filter vehicles based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredVehicles(vehicles);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vehicles.filter(vehicle => {
      // Basic vehicle name search
      if (vehicle.name.toLowerCase().includes(query)) return true;

      // Calculate distance from search center if it's a selected vehicle
      if (selectedVehicle) {
        const distance = calculateDistance(
          selectedVehicle.location.lat,
          selectedVehicle.location.lng,
          vehicle.location.lat,
          vehicle.location.lng
        );
        // Include vehicles within 10km radius
        if (distance <= 10) return true;
      }

      // Format and search address if available
      if (vehicle.location) {
        const coordString = formatAddress(vehicle.location);
        if (coordString.toLowerCase().includes(query)) return true;
      }

      return false;
    });

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, selectedVehicle]);

  // Handle map load
  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    console.log('Map loaded successfully');
    setMap(mapInstance);
    setMapError(null);
  }, []);

  // Handle map error
  const handleMapError = useCallback((error: Error) => {
    setMapError(error.message);
    console.error('Map error:', error);
  }, []);

  // Create markers for vehicles
  useEffect(() => {
    if (!map) return;

    // Safety check for Google Maps
    if (!window.google?.maps?.Marker) {
      console.error('Google Maps Marker API not available');
      return;
    }

    try {
      // Clear existing markers
      markers.forEach(({ marker, infoWindow }) => {
        marker.setMap(null);
        infoWindow?.close();
      });

      // Reset bounds
      const bounds = new google.maps.LatLngBounds();

      // Create new markers
      const newMarkers = filteredVehicles.map(vehicle => {
        const position = new google.maps.LatLng(
          vehicle.location.lat,
          vehicle.location.lng
        );

        // Extend bounds to include this marker
        bounds.extend(position);

        // Create marker with custom icon based on status
        const marker = new google.maps.Marker({
          position,
          map,
          title: vehicle.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: getVehicleStatusColor(vehicle.status),
            fillOpacity: 0.7,
            strokeWeight: 2,
            strokeColor: '#FFFFFF'
          },
          animation: google.maps.Animation.DROP
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(vehicle)
        });

        // Add click listener
        marker.addListener('click', () => {
          // Close any open info windows
          closeAllInfoWindows();

          // Open this info window (with null check)
          if (map) {
            infoWindow.open(map, marker);
          }

          // Set selected vehicle
          setSelectedVehicle(vehicle);
        });

        return { id: vehicle.id, marker, infoWindow };
      });

      // Update markers state
      setMarkers(newMarkers);

      // Fit map to bounds if we have markers
      if (filteredVehicles.length > 0) {
        map.fitBounds(bounds);

        const currentZoom = map.getZoom();
        if (currentZoom !== undefined && currentZoom > 15) {
          map.setZoom(15);
        }
      }
    } catch (error) {
      console.error('Error creating markers:', error);
    }
  }, [map, filteredVehicles]);

  // Helper function to get color based on vehicle status
  const getVehicleStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#4CAF50'; // Green
      case 'inactive':
        return '#9E9E9E'; // Gray
      case 'maintenance':
        return '#FFC107'; // Amber
      default:
        return '#2196F3'; // Blue
    }
  };

  // Create info window content
  const createInfoWindowContent = (vehicle: Vehicle): string => {
    const lastUpdate = new Date(vehicle.lastUpdate).toLocaleString();

    return `
      <div class="info-window">
        <h3>${vehicle.name}</h3>
        <p><strong>ID:</strong> ${vehicle.id}</p>
        <p><strong>Status:</strong> ${vehicle.status}</p>
        <p><strong>Last Update:</strong> ${lastUpdate}</p>
        <p><strong>Location:</strong> ${vehicle.location.lat.toFixed(6)}, ${vehicle.location.lng.toFixed(6)}</p>
      </div>
    `;
  };

  const closeAllInfoWindows = () => {
    markers.forEach(m => m.infoWindow?.close());
  };

  return (
    <div className="map-dashboard-container">
      <div className="map-sidebar">
        <div className="map-search">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button
            className="refresh-button"
            onClick={loadVehicleData}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>

          <Link to="/wialon-dashboard" className="wialon-link">
            Switch to Wialon Tracking
          </Link>
        </div>
        <div className="vehicle-list">
          <h3>Vehicles ({filteredVehicles.length})</h3>
          {filteredVehicles.length === 0 && !isLoading && (
            <p className="no-results">No vehicles found</p>
          )}
          {isLoading ? (
            <p className="loading-message">Loading vehicles...</p>
          ) : (
            filteredVehicles.map(vehicle => (
              <div
                key={vehicle.id}
                className={`vehicle-item ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                onClick={() => {
                  // Find and click the corresponding marker
                  const markerToClick = markers.find(m => m.id === vehicle.id);
                  if (markerToClick) {
                    google.maps.event.trigger(markerToClick.marker, 'click');

                    // Center map on this marker
                    map?.panTo(markerToClick.marker.getPosition() as google.maps.LatLng);
                  }
                }}
              >
                <div className={`status-indicator ${vehicle.status}`}></div>
                <div className="vehicle-details">
                  <h4>{vehicle.name}</h4>
                  <p>Last updated: {new Date(vehicle.lastUpdate).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

            <div className="map-container">
        <GoogleMapWrapper
          fallback={<div className="loading-map">Loading Google Maps...</div>}
          onError={handleMapError}
        >
          {mapError ? (
            <div className="map-error">
              <h3>Error loading map</h3>
              <p>{mapError}</p>
              <button onClick={() => window.location.reload()}>
                Reload page
              </button>
            </div>
          ) : (
            <GoogleMap
              center={{ lat: 61.2181, lng: -149.9003 }}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              className="google-map"
              onLoad={handleMapLoad}
            />
          )}
        </GoogleMapWrapper>
      </div>
    </div>
  );
};

export default MapDashboard;
