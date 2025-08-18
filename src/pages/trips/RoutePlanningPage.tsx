/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "../../components/ui/Button";
import { Autocomplete, DirectionsRenderer, GoogleMap, Libraries, LoadScript } from "@react-google-maps/api";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Navigation,
  RotateCw,
  Route,
  Save,
  TrendingDown,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import LoadingIndicator from "../../components/ui/LoadingIndicator";
import { useAppContext } from "../../context/AppContext";
import { normalizeError, safeLogError } from "../../utils/error-utils";

// Google Maps API key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Map container styles
const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
};

// Map center (default to South Africa)
const center = {
  lat: -28.4793,
  lng: 24.6727,
};

// Libraries to load with Google Maps
const libraries: Libraries = ["places"];

const RoutePlanningPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getTrip, planRoute, optimizeRoute } = useAppContext();

  const [trip, setTrip] = useState<any>(null);
  const [origin, setOrigin] = useState<string>("");

  // Navigation handler for back button
  const handleBackToTrip = useCallback(() => {
    if (tripId) {
      navigate(`/trips/${tripId}`);
    }
  }, [navigate, tripId]);
  const [destination, setDestination] = useState<string>("");
  const [waypoints, setWaypoints] = useState<string[]>([""]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [optimized, setOptimized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [waypointsOpen, setWaypointsOpen] = useState<boolean>(false);

  // --- Core route helpers (defined early to avoid use-before-declare issues) ---
  // Calculate route using Google Directions Service
  const calculateRoute = useCallback(
    async (originValue = origin, destinationValue = destination, waypointsValue = waypoints) => {
      if (!originValue || !destinationValue) {
        setError("Origin and destination are required");
        return;
      }

      try {
        setError(null);
        const filteredWaypoints = waypointsValue.filter((wp) => wp.trim() !== "");
        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
          origin: originValue,
          destination: destinationValue,
          waypoints: filteredWaypoints.map((wp) => ({ location: wp, stopover: true })),
          optimizeWaypoints: optimized,
          travelMode: google.maps.TravelMode.DRIVING,
        });
        setDirections(result);
        const route = result.routes[0];
        const distance = route
          ? route.legs.reduce((total, leg) => total + (leg.distance?.value || 0), 0) / 1000
          : 0;
        const duration = route
          ? route.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0) / 60
          : 0;
        console.log("Route calculated:", { distance, duration });
        return {
          distance,
          duration,
          origin: originValue,
          destination: destinationValue,
          waypoints: filteredWaypoints,
        };
      } catch (err: any) {
        const normalized = normalizeError(err);
        safeLogError(err, {
          context: "DirectionsService",
          operation: "calculateRoute",
          origin: originValue,
          destination: destinationValue,
          waypoints: waypointsValue,
        });
        setError(normalized.message || "Failed to calculate route");
        return null;
      }
    },
    [origin, destination, waypoints, optimized]
  );

  // Save route to trip
  const saveRoute = useCallback(async () => {
    if (!tripId) return;
    try {
      const routeData = await calculateRoute();
      if (!routeData) return;
      await planRoute(tripId, routeData.origin, routeData.destination, routeData.waypoints);
      alert("Route saved successfully!");
    } catch (err: any) {
      const normalized = normalizeError(err);
      safeLogError(err, {
        context: "TripRouteManagement",
        operation: "saveRoute",
        tripId,
      });
      setError(normalized.message || "Failed to save route");
    }
  }, [tripId, calculateRoute, planRoute]);

  // Optimize route
  const handleOptimizeRoute = useCallback(async () => {
    if (!tripId) return;
    try {
      await optimizeRoute(tripId);
      setOptimized(true);
      const tripData = getTrip(tripId);
      if (tripData?.optimizedRoute) {
        calculateRoute(
          tripData.optimizedRoute.origin,
          tripData.optimizedRoute.destination,
          tripData.optimizedRoute.waypoints
        );
      }
      alert("Route optimized successfully!");
    } catch (err: any) {
      const normalized = normalizeError(err);
      safeLogError(err, {
        context: "RouteOptimization",
        operation: "optimizeRoute",
        tripId,
      });
      setError(normalized.message || "Failed to optimize route");
    }
  }, [tripId, optimizeRoute, getTrip, calculateRoute]);

  // Toggle waypoints visibility
  const toggleWaypoints = useCallback(() => {
    setWaypointsOpen((prev) => !prev);
  }, []);

  // Handler for removing a waypoint
  const handleRemoveWaypoint = useCallback((index: number) => {
    removeWaypoint(index);
  }, []);

  // Handler for adding a waypoint
  const handleAddWaypoint = useCallback(() => {
    addWaypoint();
  }, []);

  // (Wrappers removed; handlers now directly use calculateRoute/saveRoute/handleOptimizeRoute)

  // Autocomplete references
  const [originRef, setOriginRef] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinationRef, setDestinationRef] = useState<google.maps.places.Autocomplete | null>(
    null
  );
  const [waypointRefs, setWaypointRefs] = useState<(google.maps.places.Autocomplete | null)[]>([
    null,
  ]);

  // Removed custom Google Maps loader - using LoadScript component instead

  // Fetch trip data on component mount
  useEffect(() => {
    if (tripId) {
      const tripData = getTrip(tripId);
      if (tripData) {
        setTrip(tripData);

        // Initialize form with trip route data if available
        if (tripData.plannedRoute) {
          setOrigin(tripData.plannedRoute.origin);
          setDestination(tripData.plannedRoute.destination);
          setWaypoints(
            tripData.plannedRoute.waypoints.length > 0 ? tripData.plannedRoute.waypoints : [""]
          );
          setOptimized(!!tripData.optimizedRoute);
        }

        // If the trip has route data, calculate directions
        if (tripData.plannedRoute?.origin && tripData.plannedRoute?.destination) {
          calculateRoute(
            tripData.plannedRoute.origin,
            tripData.plannedRoute.destination,
            tripData.plannedRoute.waypoints
          );
        }
      }
    }
  }, [tripId, getTrip]);

  // Map load callback
  const onMapLoad = useCallback((_map: google.maps.Map) => {
    // Map initialization code could go here if needed
  }, []);

  // Add waypoint
  const addWaypoint = () => {
    setWaypoints([...waypoints, ""]);
    setWaypointRefs([...waypointRefs, null]);
  };

  // Remove waypoint
  const removeWaypoint = (index: number) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);

    const newRefs = [...waypointRefs];
    newRefs.splice(index, 1);
    setWaypointRefs(newRefs);
  };

  // Update waypoint
  const updateWaypoint = (index: number, value: string) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
  };

  // (Original calculateRoute/saveRoute/handleOptimizeRoute blocks moved above)

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY || ""}
      libraries={libraries}
      loadingElement={<LoadingIndicator text="Loading Google Maps..." />}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Route Planning & Optimization</h1>
            <p className="text-gray-600">
              {trip
                ? `Planning route for ${trip.fleetNumber} - ${trip.route}`
                : "Create and optimize routes for your trips"}
            </p>
          </div>
          <div>
            {trip && (
              <Button onClick={handleBackToTrip} variant="outline">
                Back to Trip Details
              </Button>
            )}
          </div>
        </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planning Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader title="Route Details" />
            <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                    <Autocomplete
                      onLoad={(autocomplete) => {
                        // Add safety check before setting ref
                        if (autocomplete && window.google?.maps?.places) {
                          setOriginRef(autocomplete);
                        }
                      }}
                      onPlaceChanged={() => {
                        // Add comprehensive safety checks
                        if (originRef && window.google?.maps?.places) {
                          try {
                            const place = originRef.getPlace();
                            if (place && place.formatted_address) {
                              setOrigin(place.formatted_address);
                            }
                          } catch (error) {
                            safeLogError(error, {
                              context: "GoogleMapsAutocomplete",
                              operation: "getPlace",
                              location: "origin",
                            });
                            // Gracefully handle the error without breaking the UI
                          }
                        }
                      }}
                    >
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter origin"
                      />
                    </Autocomplete>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination
                    </label>
                    <Autocomplete
                      onLoad={(autocomplete) => {
                        // Add safety check before setting ref
                        if (autocomplete && window.google?.maps?.places) {
                          setDestinationRef(autocomplete);
                        }
                      }}
                      onPlaceChanged={() => {
                        // Add comprehensive safety checks
                        if (destinationRef && window.google?.maps?.places) {
                          try {
                            const place = destinationRef.getPlace();
                            if (place && place.formatted_address) {
                              setDestination(place.formatted_address);
                            }
                          } catch (error) {
                            safeLogError(error, {
                              context: "GoogleMapsAutocomplete",
                              operation: "getPlace",
                              location: "destination",
                            });
                            // Gracefully handle the error without breaking the UI
                          }
                        }
                      }}
                    >
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter destination"
                      />
                    </Autocomplete>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Waypoints</label>
                      <button
                        type="button"
                        onClick={toggleWaypoints}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {waypointsOpen ? (
                          <>
                            Hide <ChevronUp className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Show <ChevronDown className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    </div>

                    {waypointsOpen && (
                      <div className="space-y-2">
                        {waypoints.map((waypoint, index) => (
                          <div key={index} className="flex space-x-2">
                            <Autocomplete
                              onLoad={(autocomplete) => {
                                // Add safety check before setting ref
                                if (autocomplete && window.google?.maps?.places) {
                                  const newRefs = [...waypointRefs];
                                  newRefs[index] = autocomplete;
                                  setWaypointRefs(newRefs);
                                }
                              }}
                              onPlaceChanged={() => {
                                const ref = waypointRefs[index];
                                // Add comprehensive safety checks
                                if (ref && window.google?.maps?.places) {
                                  try {
                                    const place = ref.getPlace();
                                    if (place && place.formatted_address) {
                                      updateWaypoint(index, place.formatted_address);
                                    }
                                  } catch (error) {
                                    safeLogError(error, {
                                      context: "GoogleMapsAutocomplete",
                                      operation: "getPlace",
                                      location: `waypoint-${index}`,
                                    });
                                    // Gracefully handle the error without breaking the UI
                                  }
                                }
                              }}
                            >
                              <input
                                type="text"
                                value={waypoint}
                                onChange={(e) => updateWaypoint(index, e.target.value)}
                                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder={`Waypoint ${index + 1}`}
                              />
                            </Autocomplete>

                            <button
                              type="button"
                              onClick={() => handleRemoveWaypoint(index)}
                              className="px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={handleAddWaypoint}
                          className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                        >
                          + Add Waypoint
                        </button>
                      </div>
                    )}
                  </div>

              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  onClick={() => calculateRoute()}
                  disabled={!origin || !destination}
                  icon={<Route className="w-4 h-4" />}
                >
                  Calculate Route
                </Button>

                <Button
                  onClick={saveRoute}
                  disabled={!directions || !tripId}
                  variant="outline"
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Route
                </Button>
              </div>
            </CardContent>
          </Card>

          {directions && (
            <Card>
              <CardHeader title="Route Summary" />
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center text-blue-700 mb-1">
                      <Navigation className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Distance</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      {directions.routes[0] ? (
                        directions.routes[0].legs.reduce(
                          (total, leg) => total + (leg.distance?.value || 0),
                          0
                        ) / 1000
                      ).toFixed(1) : '0'}{" "}
                      km
                    </p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center text-blue-700 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      {directions.routes[0] ? Math.round(
                        directions.routes[0].legs.reduce(
                          (total, leg) => total + (leg.duration?.value || 0),
                          0
                        ) / 60
                      ) : 0}{" "}
                      mins
                    </p>
                  </div>
                </div>

                {optimized ? (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-2 mr-3">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Route Optimized</h4>
                        <p className="text-xs text-green-700 mt-1">
                          This route has been optimized for maximum efficiency
                        </p>
                      </div>
                    </div>
                    {trip?.optimizedRoute && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center">
                          <Navigation className="w-3 h-3 text-green-600 mr-1" />
                          <span>Saved: {trip.optimizedRoute.fuelSavings} liters</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 text-green-600 mr-1" />
                          <span>Saved: {trip.optimizedRoute.timeSavings} mins</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handleOptimizeRoute}
                    disabled={!directions || !tripId || !trip?.plannedRoute}
                    icon={<RotateCw className="w-4 h-4" />}
                  >
                    Optimize Route
                  </Button>
                )}

                {trip?.plannedRoute && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Route Points</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <div className="bg-blue-50 p-2 rounded-md">
                        <div className="flex items-start">
                          <div className="bg-blue-100 rounded-full p-1 mr-2 mt-1">
                            <MapPin className="w-3 h-3 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-800">Origin</p>
                            <p className="text-xs text-blue-700">{trip.plannedRoute.origin}</p>
                          </div>
                        </div>
                      </div>

                      {trip.plannedRoute.waypoints.map((waypoint: string, index: number) => (
                        <div key={index} className="bg-gray-50 p-2 rounded-md">
                          <div className="flex items-start">
                            <div className="bg-gray-100 rounded-full p-1 mr-2 mt-1">
                              <MapPin className="w-3 h-3 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-800">
                                Waypoint {index + 1}
                              </p>
                              <p className="text-xs text-gray-700">{waypoint}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="bg-green-50 p-2 rounded-md">
                        <div className="flex items-start">
                          <div className="bg-green-100 rounded-full p-1 mr-2 mt-1">
                            <MapPin className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-800">Destination</p>
                            <p className="text-xs text-green-700">
                              {trip.plannedRoute.destination}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Route Map" />
            <CardContent>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={5}
                onLoad={onMapLoad}
              >
                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      options={{
                        polylineOptions: {
                          strokeColor: optimized ? "#10B981" : "#3B82F6",
                          strokeWeight: 5,
                        },
                      }}
                    />
                  )}
                </GoogleMap>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </LoadScript>
  );
};

export default RoutePlanningPage;
