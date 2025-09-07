import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SupportedCurrency } from "../../lib/currency";

// Firestore hooks
import { useRealtimeTrips } from "../../hooks/useRealtimeTrips";
import { useWebBookTrips } from "../../hooks/useWebBookTrips";

// Import consolidated view components
import ActiveTrips from "../../components/TripManagement/ActiveTrips";
import MissedLoadsTracker from "../../components/TripManagement/MissedLoadsTracker";
import CompletedTrips from "./CompletedTrips"; // Using local version
import TripCalendarPage from "./TripCalendarPage";

// Types
interface TripManagerProps {
  displayCurrency?: SupportedCurrency;
}

/**
 * TripManager - Consolidated component for trip management
 *
 * This component serves as a container for all trip-related functionality,
 * using a tabbed interface to navigate between different views.
 */
const TripManager: React.FC<TripManagerProps> = ({ displayCurrency = "USD" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Setup activeTab state based on current URL
  const [activeTab, setActiveTab] = useState(() => {
    // Extract the active tab from the URL path
    const path = location.pathname;
    if (path.includes("/trips/completed")) return "completed";
    if (path.includes("/trips/calendar")) return "calendar";
    if (path.includes("/trips/missed-loads")) return "missed-loads";
    return "active"; // Default tab
  });

  // Firestore data connections
  const {
    // trips: activeTrips, // Unused but kept for future integration
    loading: activeTripsLoading,
    error: activeTripsError,
  } = useRealtimeTrips({ status: "active" });

  const {
    // trips: completedTrips, // Unused but kept for future integration
    loading: completedTripsLoading,
    error: completedTripsError,
  } = useRealtimeTrips({ status: "completed" });

  const {
    // trips: webBookTrips, // Unused but kept for future integration
    loading: webBookLoading,
    error: webBookError,
    // activeTrips: activeWebBookTrips, // Unused but kept for future integration
  } = useWebBookTrips();

  // The following line is kept in comments for future integration
  // const allActiveTrips = [...(activeTrips || []), ...(activeWebBookTrips || [])];

  // Combined loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update combined loading and error states
  useEffect(() => {
    // Set loading state based on current tab
    const loadingStates = {
      active: activeTripsLoading || webBookLoading,
      completed: completedTripsLoading,
      calendar: false, // Calendar doesn't need to load Firestore data
      "missed-loads": false, // MissedLoads uses manually loaded data
    };

    setIsLoading(loadingStates[activeTab as keyof typeof loadingStates] || false);

    // Combine errors
    const activeError = activeTripsError || webBookError;
    const completedError = completedTripsError;

    if (activeTab === "active" && activeError) {
      setError(activeError);
    } else if (activeTab === "completed" && completedError) {
      setError(completedError);
    } else {
      setError(null);
    }
  }, [
    activeTab,
    activeTripsLoading,
    completedTripsLoading,
    webBookLoading,
    activeTripsError,
    completedTripsError,
    webBookError,
  ]);

  // Handle tab change
  const handleTabChange = (value: string): void => {
    setActiveTab(value);

    // Update the URL to reflect the selected tab
    switch (value) {
      case "active":
        navigate("/trips/active");
        break;
      case "completed":
        navigate("/trips/completed");
        break;
      case "calendar":
        navigate("/trips/calendar");
        break;
      case "missed-loads":
        navigate("/trips/missed-loads");
        break;
      default:
        navigate("/trips");
    }
  };

  // Dummy functions for the MissedLoadsTracker
  const handleAddMissedLoad = (load: any): void => {
    console.log("Add missed load", load);
    // Implementation would go here
  };

  const handleUpdateMissedLoad = (load: any): void => {
    console.log("Update missed load", load);
    // Implementation would go here
  };

  const handleDeleteMissedLoad = (id: string): void => {
    console.log("Delete missed load", id);
    // Implementation would go here
  };

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">Error loading data: {error}</span>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-4 mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
          <span className="ml-2 text-gray-700">Loading trip data...</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Trip Management</h1>
          <p className="text-gray-500">Manage all trips in one place</p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active Trips</TabsTrigger>
              <TabsTrigger value="completed">Completed Trips</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="missed-loads">Missed Loads</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="p-0">
              {/* Only pass props that ActiveTrips component accepts */}
              <ActiveTrips displayCurrency={displayCurrency} />
            </TabsContent>

            <TabsContent value="completed" className="p-0">
              {/* CompletedTrips expects trips & onView; currently no data wired, pass empty list & noop */}
              <CompletedTrips trips={[]} onView={() => {}} />
            </TabsContent>

            <TabsContent value="calendar" className="p-0">
              {/* TripCalendarPage doesn't have props defined for trip data */}
              <TripCalendarPage />
            </TabsContent>

            <TabsContent value="missed-loads" className="p-0">
              {/* Only pass props that MissedLoadsTracker component accepts */}
              <MissedLoadsTracker
                missedLoads={[]}
                onAddMissedLoad={handleAddMissedLoad}
                onUpdateMissedLoad={handleUpdateMissedLoad}
                onDeleteMissedLoad={handleDeleteMissedLoad}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripManager;
