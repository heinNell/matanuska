import React, { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { TripSelectionProvider, useTripSelection } from "../../context/TripSelectionContext";
import type { Trip } from "../../types"; // canonical Trip from your barrel
import { ErrorBoundary } from "../common/ErrorBoundary";
import Navigation from "./Navigation";
import SelectedTripBanner from "./SelectedTripBanner";
import Sidebar from "./Sidebar";
import { useEffect } from "react";

// Define the props for Layout. The state management for the sidebar
// has been moved here to allow communication between Navigation and Sidebar.
interface LayoutProps {
  setShowTripForm: (show: boolean) => void;
  setEditingTrip: (trip: Trip | undefined) => void;
}

/** Only enforce presence of additionalCosts; do NOT assume other fields (e.g., name) exist. */
const normalizeTrip = (t: Partial<Trip>): Trip => {
  return {
    ...(t as Trip), // keep whatever the caller provides
    additionalCosts: t.additionalCosts ?? [], // ensure required field
  };
};

const Layout: React.FC<LayoutProps> = ({ setShowTripForm, setEditingTrip }) => {


  // State to manage the selected trip
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // State to manage the mobile sidebar's open/close status
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useAppContext();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar now receives the isOpen state and a function to close it */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main content area. The left margin matches the sidebar's width on large screens. */}
      {/* The Navigation component can now toggle the sidebar. */}
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-72">
        <Navigation onToggleSidebar={toggleSidebar} />
        <TripSelectionProvider>
          {selectedTrip && (
            <LegacyTripStateBridge
              trip={normalizeTrip(selectedTrip)}
              clear={() => setSelectedTrip(null)}
            />
          )}
          <SelectedTripBanner />
          <main className="flex-1 overflow-y-auto p-2 md:p-3" role="main">
            <Suspense fallback={<div className="p-4 text-xs text-gray-500">Loading...</div>}>
              <ErrorBoundary>
                <Outlet
                  context={{
                    setSelectedTrip,
                    setEditingTrip,
                    setShowTripForm,
                  }}
                />
              </ErrorBoundary>
            </Suspense>
          </main>
        </TripSelectionProvider>
      </div>
    </div>
  );
};

// This component seems to be a bridge for legacy state management and might not be
// needed long-term, but for now, we will keep it as is.
const LegacyTripStateBridge: React.FC<{ trip: Trip; clear: () => void }> = ({ trip }) => {
  const { selectedTrip, setSelectedTrip } = useTripSelection();
  useEffect(() => {
    if (!selectedTrip /* first time */) {
      setSelectedTrip(trip);
    }
  }, [selectedTrip, setSelectedTrip, trip]);
  return null;
};

export default Layout;
