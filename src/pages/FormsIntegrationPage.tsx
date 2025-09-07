// src/pages/FormsIntegrationPage.tsx
import React, { useState } from "react";
import FleetSelectionForm from "../components/forms/FleetSelectionForm";
import RouteSelectionForm from "../components/forms/trips/RouteSelectionForm";
import TyreSelectionForm from "../components/forms/tyre/TyreSelectionForm";
import InventorySelectionForm from "../components/forms/workshop/InventorySelectionForm";
import { useSyncContext } from "../context/SyncContext";

/**
 * Forms Integration Page
 *
 * This page demonstrates all the form components working together with Firestore data.
 * It serves as a dashboard for fleet managers to perform common operations.
 */
const FormsIntegrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"fleet" | "tyres" | "routes" | "inventory">("fleet");
  const syncContext = useSyncContext();

  // Success messages
  const [successMessages, setSuccessMessages] = useState<{
    fleet?: string;
    tyres?: string;
    routes?: string;
    inventory?: string;
  }>({});

  // Show a success message for a specific form
  const showSuccessMessage = (
    form: "fleet" | "tyres" | "routes" | "inventory",
    message: string
  ) => {
    setSuccessMessages((prev) => ({
      ...prev,
      [form]: message,
    }));

    // Clear message after 5 seconds
    setTimeout(() => {
      setSuccessMessages((prev) => ({
        ...prev,
        [form]: undefined,
      }));
    }, 5000);
  };

  // Handle form submissions
  const handleFleetSelection = (data: any) => {
    console.log("Fleet selection data:", data);
    showSuccessMessage("fleet", `Fleet vehicle ${data.fleetId} assigned successfully`);
  };

  const handleTyreSelection = (data: any) => {
    console.log("Tyre selection data:", data);
    showSuccessMessage("tyres", `Tyre ${data.brand} ${data.size} assigned successfully`);
  };

  const handleRouteSelection = (data: any) => {
    console.log("Route selection data:", data);
    showSuccessMessage(
      "routes",
      `Route from ${data.startLocation} to ${data.endLocation} planned successfully`
    );
  };

  const handleInventorySelection = (data: any) => {
    console.log("Inventory selection data:", data);
    showSuccessMessage("inventory", `${data.quantity} x ${data.description} added to job card`);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Forms Integration</h1>
        <p className="text-gray-600">Manage fleet, tyres, routes, and inventory in one place</p>

        {/* Connection status */}
        <div className="mt-2">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              syncContext.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                syncContext.isOnline ? "bg-green-500" : "bg-red-500"
              }`}
             />
            {syncContext.isOnline ? "Online" : "Offline"}
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === "fleet"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Fleet Vehicles
          </button>
          <button
            onClick={() => setActiveTab("tyres")}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === "tyres"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tyre Management
          </button>
          <button
            onClick={() => setActiveTab("routes")}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === "routes"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Route Planning
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === "inventory"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Inventory
          </button>
        </nav>
      </div>

      {/* Success messages */}
      {successMessages[activeTab] && (
        <div className="mb-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessages[activeTab]}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form content based on active tab */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {activeTab === "fleet" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Fleet Vehicle Assignment</h2>
            <FleetSelectionForm onComplete={handleFleetSelection} />
          </div>
        )}

        {activeTab === "tyres" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tyre Assignment</h2>
            <TyreSelectionForm
              onComplete={handleTyreSelection}
              vehicleId="vehicle-123"
              positionId="front-left"
            />
          </div>
        )}

        {activeTab === "routes" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Route Planning</h2>
            <RouteSelectionForm onComplete={handleRouteSelection} tripId="trip-123" />
          </div>
        )}

        {activeTab === "inventory" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Inventory Selection</h2>
            <InventorySelectionForm
              onComplete={handleInventorySelection}
              jobCardId="job-123"
              storeLocation="Main Store"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsIntegrationPage;
