import {
  Activity, Clock, Download, Globe, MapPin, RefreshCw, Upload,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Trip } from "../../api/tripsApi";
import AddTripModal from "../../components/Models/Trips/AddTripModal";
import { useAppContext } from "../../context/AppContext";
import { useRealtimeTrips } from "../../hooks/useRealtimeTrips";
import { useWebBookTrips } from "../../hooks/useWebBookTrips";
import { formatCurrency, SupportedCurrency } from "../../lib/currency";
import SystemCostsModal from "../Models/Trips/SystemCostsModal";
import TripCostEntryModal from "../Models/Trips/TripCostEntryModal";
import TripStatusUpdateModal from "../Models/Trips/TripStatusUpdateModal";

interface ActiveTripsProps {
  displayCurrency: SupportedCurrency;
}

// No initial mock data
const EMPTY_TRIPS: Trip[] = [];

const ActiveTrips: React.FC<ActiveTripsProps> = ({ displayCurrency = "USD" }) => {
  // Real-time trips (Firestore, etc)
  const { trips: realtimeTrips } = useRealtimeTrips({ status: "active" });

  // Web Book trips (external system)
  const {
    trips: webBookTrips,
    loading: webBookLoading,
    error: webBookError,
    activeTrips: activeWebBookTrips,
    deliveredTrips: deliveredWebBookTrips,
    completedTrips: completedWebBookTrips,
  } = useWebBookTrips();

  // State for user-added/manual trips, and webhook trips
  const [manualTrips, setManualTrips] = useState<Trip[]>(EMPTY_TRIPS);
  const [webhookTrips, setWebhookTrips] = useState<Trip[]>(EMPTY_TRIPS);

  // UI and modal state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [filterWebBookOnly, setFilterWebBookOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCost, setEditingCost] = useState<string | null>(null);
  const { addCostEntry, updateTripStatus } = useAppContext();
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [costTripId, setCostTripId] = useState<string | null>(null);
  const [isSystemCostsOpen, setIsSystemCostsOpen] = useState(false);
  const [systemCostsTrip, setSystemCostsTrip] = useState<Trip | null>(null);
  const [statusTrip, setStatusTrip] = useState<Trip | null>(null);
  const [statusType, setStatusType] = useState<"shipped" | "delivered" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    cost: 0,
    fuel: 0,
    maintenance: 0,
    driver: 0,
    tolls: 0,
    other: 0,
  });

  // Normalize all trips for consistent structure
  const normalizeTrip = (t: any, source = "internal"): Trip => ({
    id: t.id,
    tripNumber: t.tripNumber || t.loadRef || `TR-${t.id?.substring(0, 8) || ""}`,
    origin: t.origin || "Unknown",
    destination: t.destination || "Unknown",
    startDate: t.startDate || t.startTime || new Date().toISOString(),
    endDate: t.endDate || t.endTime || new Date().toISOString(),
    status: (t.status as Trip["status"]) || "active",
    driver: t.driver || "Unassigned",
    vehicle: t.vehicle || t.fleetNumber || "Unassigned",
    distance: t.distance || 0,
    cost: t.cost ?? t.totalCost ?? 0,
    costBreakdown: t.costBreakdown || {},
    source: source as any,
    externalId: t.externalId || t.id,
    lastUpdated: t.updatedAt || new Date().toISOString(),
  });

  // Unified trip list
  const allTrips = useMemo(() => {
    const arr: Trip[] = [
      ...(realtimeTrips || []).map((t) => normalizeTrip(t, "internal")),
      ...(webBookTrips || []).map((t) => normalizeTrip(t, "web_book")),
      ...manualTrips.map((t) => normalizeTrip(t, "manual")),
      ...webhookTrips.map((t) => normalizeTrip(t, "webhook")),
    ];
    return arr;
  }, [realtimeTrips, webBookTrips, manualTrips, webhookTrips]);

  // Filtered for table/stats
  const filteredTrips = useMemo(() => {
    let arr = [...allTrips];
    if (filterWebBookOnly) arr = arr.filter((t) => t.source === "web_book");
    if (statusFilter) arr = arr.filter((t) => t.status === statusFilter);
    return arr;
  }, [allTrips, filterWebBookOnly, statusFilter]);

  // Stats
  const webBookTripsCount = allTrips.filter((t) => t.source === "web_book").length;
  const manualAndOtherTripsCount = allTrips.filter((t) => t.source !== "web_book").length;

  // Fetch webhook trips (replace with actual API in prod)
  const fetchWebhookTrips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setWebhookTrips([
        {
          id: "webhook-1",
          tripNumber: "WH-2023-001",
          origin: "Miami, FL",
          destination: "Orlando, FL",
          startDate: "2025-07-14T10:00:00",
          endDate: "2025-07-15T16:00:00",
          status: "active",
          driver: "Alex Thompson",
          vehicle: "Truck WH-123",
          distance: 235,
          cost: 0,
          source: "webhook",
          externalId: "ext-12345",
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "webhook-2",
          tripNumber: "WH-2023-002",
          origin: "Austin, TX",
          destination: "Houston, TX",
          startDate: "2025-07-16T08:30:00",
          endDate: "2025-07-17T12:00:00",
          status: "active",
          driver: "Jamie Rodriguez",
          vehicle: "Truck WH-456",
          distance: 162,
          cost: 0,
          source: "webhook",
          externalId: "ext-67890",
          lastUpdated: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError("Failed to load trips from webhook. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { fetchWebhookTrips(); }, []);

  // Editing
  const handleEditClick = (trip: Trip) => {
    setEditingTrip(trip);
    setEditForm({
      cost: trip.cost,
      fuel: trip.costBreakdown?.fuel || 0,
      maintenance: trip.costBreakdown?.maintenance || 0,
      driver: trip.costBreakdown?.driver || 0,
      tolls: trip.costBreakdown?.tolls || 0,
      other: trip.costBreakdown?.other || 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    setEditForm((prev) => ({
      ...prev,
      [name]: numValue,
    }));

    if (name !== "cost") {
      const updatedValues = { ...editForm, [name]: numValue };
      const totalCost =
        (updatedValues.fuel || 0) +
        (updatedValues.maintenance || 0) +
        (updatedValues.driver || 0) +
        (updatedValues.tolls || 0) +
        (updatedValues.other || 0);

      setEditForm((prev) => ({
        ...prev,
        [name]: numValue,
        cost: totalCost,
      }));
    }
  };

  const handleSave = () => {
    if (!editingTrip) return;
    const source = editingTrip.source;
    if (source === "webhook") {
      setWebhookTrips(webhookTrips.map((trip) =>
        trip.id === editingTrip.id ? {
          ...trip,
          cost: editForm.cost,
          costBreakdown: {
            fuel: editForm.fuel,
            maintenance: editForm.maintenance,
            driver: editForm.driver,
            tolls: editForm.tolls,
            other: editForm.other,
          },
          lastUpdated: new Date().toISOString(),
        } : trip
      ));
    } else {
      setManualTrips(manualTrips.map((trip) =>
        trip.id === editingTrip.id ? {
          ...trip,
          cost: editForm.cost,
          costBreakdown: {
            fuel: editForm.fuel,
            maintenance: editForm.maintenance,
            driver: editForm.driver,
            tolls: editForm.tolls,
            other: editForm.other,
          },
          lastUpdated: new Date().toISOString(),
        } : trip
      ));
    }
    setEditingTrip(null);
  };
  const handleCancel = () => setEditingTrip(null);

  // File upload
  const handleFileUploadClick = () => fileInputRef.current?.click();
  const parseCSV = (text: string): Trip[] => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    if (lines.length < 2) return [];

    const firstLine = lines[0];
    if (!firstLine) return [];

    const headers = firstLine.split(",").map((h) => h.trim());
    return lines.slice(1).map((line, i) => {
      const values = line.split(",").map((v) => v.trim());
      const tripData: any = {};
      headers.forEach((header, idx) => { tripData[header] = values[idx] || ""; });
      return normalizeTrip({
        id: `imported-${Date.now()}-${i}`,
        tripNumber: tripData["Trip Number"],
        origin: tripData["Origin"],
        destination: tripData["Destination"],
        startDate: tripData["Start Date"],
        endDate: tripData["End Date"],
        driver: tripData["Driver"],
        vehicle: tripData["Vehicle"],
        distance: parseFloat(tripData["Distance"]) || 0,
        cost: parseFloat(tripData["Cost"]) || 0,
        costBreakdown: {
          fuel: parseFloat(tripData["Fuel Cost"]) || 0,
          maintenance: parseFloat(tripData["Maintenance Cost"]) || 0,
          driver: parseFloat(tripData["Driver Cost"]) || 0,
          tolls: parseFloat(tripData["Tolls"]) || 0,
          other: parseFloat(tripData["Other Costs"]) || 0,
        },
      }, "manual");
    });
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTrips = parseCSV(event.target?.result as string);
        if (importedTrips.length > 0) {
          setManualTrips((prev) => [...prev, ...importedTrips]);
          setSuccess(`Successfully imported ${importedTrips.length} trips.`);
        } else {
          setError("No valid trips found in the file.");
        }
      } catch (err) {
        setError("Failed to import trips. Please check the file format.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      setError("Error reading the file."); setIsUploading(false);
    };
    reader.readAsText(file);
  };

  // Download template
  const handleDownloadTemplate = () => {
    const headers = [
      "Trip Number",
      "Origin",
      "Destination",
      "Start Date",
      "End Date",
      "Driver",
      "Vehicle",
      "Distance",
      "Cost",
      "Fuel Cost",
      "Maintenance Cost",
      "Driver Cost",
      "Tolls",
      "Other Costs",
    ];
    const sampleData = [
      "TR-2023-004,New York NY,Boston MA,2023-07-20,2023-07-22,John Doe,Truck 101,215,1200,600,200,300,75,25",
    ];
    const csvContent = [headers.join(","), ...sampleData].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trips-import-template.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Refresh webhook trips
  const handleRefresh = () => {
    setError(null); setSuccess(null); fetchWebhookTrips();
  };

  // Add Trip
  const handleAddTrip = (tripData: any) => {
    setManualTrips((prev) => [
      {
        ...normalizeTrip({
          id: `new-${Date.now()}`,
          tripNumber: `TR-${Date.now().toString().slice(7)}`,
          ...tripData,
          source: "manual",
          lastUpdated: new Date().toISOString(),
        }, "manual"),
      },
      ...prev,
    ]);
    setIsAddTripModalOpen(false);
    setSuccess("Trip created successfully");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Active Trips</h1>
          <p className="text-gray-600">
            Showing {allTrips.length} trips ({manualAndOtherTripsCount} manual/webhook,{" "}
            {webBookTripsCount} from web book)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Real-time updates enabled</span>
          </div>
          {webBookLoading && (
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-600">Loading web book trips...</span>
            </div>
          )}
          {webBookError && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-red-600">Web book error: {webBookError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="webBookFilter"
              checked={filterWebBookOnly}
              onChange={(e) => setFilterWebBookOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="webBookFilter" className="ml-2 text-sm text-gray-700">
              Web Book Trips Only {webBookLoading && "(Loading...)"}
            </label>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {(activeWebBookTrips || deliveredWebBookTrips || completedWebBookTrips) && (
            <div className="text-sm text-gray-600">
              Web Book Details: {Array.isArray(activeWebBookTrips) ? activeWebBookTrips.length : activeWebBookTrips || 0} active, {Array.isArray(deliveredWebBookTrips) ? deliveredWebBookTrips.length : deliveredWebBookTrips || 0} delivered, {Array.isArray(completedWebBookTrips) ? completedWebBookTrips.length : completedWebBookTrips || 0} completed
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <div className="ml-5">
              <dt className="text-sm text-gray-500">Total Active</dt>
              <dd className="text-lg font-medium text-gray-900">{filteredTrips.length}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-green-600" />
            <div className="ml-5">
              <dt className="text-sm text-gray-500">Web Book</dt>
              <dd className="text-lg font-medium text-gray-900">{webBookTripsCount}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-5">
              <dt className="text-sm text-gray-500">Manual/Webhook</dt>
              <dd className="text-lg font-medium text-gray-900">{manualAndOtherTripsCount}</dd>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-purple-600" />
            <div className="ml-5">
              <dt className="text-sm text-gray-500">Completed</dt>
              <dd className="text-lg font-medium text-gray-900">
                {allTrips.filter((t) => t.status === "completed").length}
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* File upload button */}
        <button
          onClick={handleFileUploadClick}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </>
          )}
        </button>

        {/* Template download button */}
        <button
          onClick={handleDownloadTemplate}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </button>

        <button
          onClick={handleRefresh}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Webhook Trips
        </button>

        <button
          onClick={() => setIsAddTripModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + New Trip
        </button>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{success}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setSuccess(null)}
          >
            <svg
              className="fill-current h-6 w-6 text-green-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setError(null)}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <p>Loading webhook trips...</p>
        </div>
      )}

      {editingTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Edit Trip Costs: {editingTrip.tripNumber}
              {editingTrip.source === "webhook" && (
                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                  Webhook Trip
                </span>
              )}
            </h2>
            <div className="mb-4">
              <p>
                <span className="font-medium">Origin:</span> {editingTrip.origin}
              </p>
              <p>
                <span className="font-medium">Destination:</span> {editingTrip.destination}
              </p>
              <p>
                <span className="font-medium">Driver:</span> {editingTrip.driver}
              </p>
              {editingTrip.source === "webhook" && editingTrip.externalId && (
                <p>
                  <span className="font-medium">External ID:</span> {editingTrip.externalId}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Cost</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="fuel"
                      value={editForm.fuel}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Cost
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="maintenance"
                      value={editForm.maintenance}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Cost
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="driver"
                      value={editForm.driver}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tolls</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="tolls"
                      value={editForm.tolls}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Costs
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="other"
                      value={editForm.other}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                  <div className="mt-1 relative rounded-md shadow-sm bg-gray-50">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="cost"
                      value={editForm.cost}
                      readOnly
                      className="bg-gray-50 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Total is calculated automatically</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trip Number
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Route
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Driver / Vehicle
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Source
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Start Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Expected Completion
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cost
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {trip.tripNumber || "N/A"}
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          trip.source === "web_book"
                            ? "bg-blue-100 text-blue-800"
                            : trip.source === "webhook"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {trip.source === "web_book"
                          ? "Web Book"
                          : trip.source === "webhook"
                            ? "Webhook"
                            : "Manual"}
                      </span>
                    </div>
                    {trip.externalId && (
                      <div className="text-xs text-gray-500 mt-1">Ext ID: {trip.externalId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium">From: {trip.origin}</span>
                      <span>To: {trip.destination}</span>
                      <span className="text-xs text-gray-400">{trip.distance || "N/A"} miles</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-medium">{trip.driver || "N/A"}</span>
                      <span className="text-xs">{trip.vehicle || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trip.source === "web_book"
                          ? "bg-blue-100 text-blue-800"
                          : trip.source === "webhook"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trip.source === "web_book"
                        ? "Web Book"
                        : trip.source === "webhook"
                          ? "Webhook"
                          : "Manual"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trip.status === "active"
                          ? "bg-green-100 text-green-800"
                          : trip.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : trip.status === "scheduled"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {trip.status
                        ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1)
                        : "In Progress"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {editingCost === trip.id ? (
                          <input
                            type="number"
                            value={trip.cost || 0}
                            onChange={(e) => {
                              const newCost = parseFloat(e.target.value) || 0;
                              const isWebhookTrip = trip.source === "webhook";
                              if (isWebhookTrip) {
                                setWebhookTrips(webhookTrips.map((t) =>
                                  t.id === trip.id ? { ...t, cost: newCost } : t
                                ));
                              } else {
                                setManualTrips(manualTrips.map((t) =>
                                  t.id === trip.id ? { ...t, cost: newCost } : t
                                ));
                              }
                            }}
                            onBlur={() => setEditingCost(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingCost(null);
                            }}
                            className="w-20 px-2 py-1 text-sm border rounded"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                            onClick={() => setEditingCost(trip.id)}
                          >
                            {formatCurrency(trip.cost || 0, displayCurrency)}
                          </span>
                        )}
                      </div>
                      {trip.source !== "web_book" && (
                        <button
                          className="text-xs text-blue-600 hover:underline mt-1"
                          onClick={() => handleEditClick(trip)}
                        >
                          {trip.costBreakdown ? "View Breakdown" : "Allocate Costs"}
                        </button>
                      )}
                      <div className="mt-2 flex gap-3">
                        <button
                          className="text-xs text-indigo-600 hover:underline"
                          onClick={() => {
                            setCostTripId(trip.id);
                            setIsCostModalOpen(true);
                          }}
                        >
                          Add Cost
                        </button>
                        <button
                          className="text-xs text-purple-600 hover:underline"
                          onClick={() => {
                            setSystemCostsTrip(trip);
                            setIsSystemCostsOpen(true);
                          }}
                        >
                          System Costs
                        </button>
                      </div>
                      {trip.lastUpdated && (
                        <div className="text-xs text-gray-500 mt-1">
                          Updated: {new Date(trip.lastUpdated).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          setSelectedTrip(trip);
                          setShowViewModal(true);
                        }}
                      >
                        View
                      </button>
                      {trip.source !== "web_book" && (
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleEditClick(trip)}
                        >
                          Edit Costs
                        </button>
                      )}
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {
                          setStatusTrip(trip);
                          setStatusType("shipped");
                        }}
                      >
                        Mark Shipped
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {
                          setStatusTrip(trip);
                          setStatusType("delivered");
                        }}
                      >
                        Mark Delivered
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trip View Modal */}
      {selectedTrip && showViewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Trip Details: {selectedTrip.tripNumber}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Trip Information</h3>
                <p><span className="font-medium">Origin:</span> {selectedTrip.origin}</p>
                <p><span className="font-medium">Destination:</span> {selectedTrip.destination}</p>
                <p><span className="font-medium">Distance:</span> {selectedTrip.distance || "N/A"} miles</p>
                <p><span className="font-medium">Status:</span> {selectedTrip.status}</p>
                <p><span className="font-medium">Source:</span> {selectedTrip.source}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Personnel & Vehicle</h3>
                <p><span className="font-medium">Driver:</span> {selectedTrip.driver}</p>
                <p><span className="font-medium">Vehicle:</span> {selectedTrip.vehicle}</p>
                <p><span className="font-medium">Start Date:</span> {selectedTrip.startDate ? new Date(selectedTrip.startDate).toLocaleDateString() : "N/A"}</p>
                <p><span className="font-medium">End Date:</span> {selectedTrip.endDate ? new Date(selectedTrip.endDate).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            {selectedTrip.costBreakdown && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Cost Breakdown</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>Fuel: ${selectedTrip.costBreakdown.fuel || 0}</p>
                  <p>Maintenance: ${selectedTrip.costBreakdown.maintenance || 0}</p>
                  <p>Driver: ${selectedTrip.costBreakdown.driver || 0}</p>
                  <p>Tolls: ${selectedTrip.costBreakdown.tolls || 0}</p>
                  <p>Other: ${selectedTrip.costBreakdown.other || 0}</p>
                  <p className="font-semibold">Total: ${selectedTrip.cost || 0}</p>
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedTrip(null);
                  setShowViewModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cost entry modal */}
      <TripCostEntryModal
        isOpen={isCostModalOpen}
        onClose={() => {
          setIsCostModalOpen(false);
          setCostTripId(null);
        }}
        onSubmit={async (data, files) => {
          if (!costTripId) return;
          await addCostEntry({ ...(data as any), tripId: costTripId }, files);
          setIsCostModalOpen(false);
          setCostTripId(null);
        }}
      />

      {/* System costs modal */}
      {systemCostsTrip && (
        <SystemCostsModal
          isOpen={isSystemCostsOpen}
          onClose={() => {
            setIsSystemCostsOpen(false);
            setSystemCostsTrip(null);
          }}
          tripData={systemCostsTrip as any}
          onGenerateCosts={async (costs) => {
            for (const c of costs) {
              await addCostEntry({ ...(c as any), tripId: systemCostsTrip.id });
            }
            setIsSystemCostsOpen(false);
            setSystemCostsTrip(null);
          }}
        />
      )}

      {/* Status update modal */}
      {statusTrip && statusType && (
        <TripStatusUpdateModal
          isOpen
          onClose={() => {
            setStatusTrip(null);
            setStatusType(null);
          }}
          trip={{
            id: statusTrip.id,
            fleetNumber: (statusTrip as any).vehicle || "",
            driverName: (statusTrip as any).driver || "",
            route: `${(statusTrip as any).origin || ""} → ${(statusTrip as any).destination || ""}`,
            startDate: (statusTrip as any).startDate || "",
            endDate: (statusTrip as any).endDate || "",
            shippedAt: (statusTrip as any).shippedAt,
          }}
          status={statusType}
          onUpdateStatus={async (id: string, s: "shipped" | "delivered", notes: string) => {
            await updateTripStatus(id, s, notes);
            setStatusTrip(null);
            setStatusType(null);
          }}
        />
      )}

      {/* Add Trip Modal */}
      <AddTripModal
        isOpen={isAddTripModalOpen}
        onClose={() => setIsAddTripModalOpen(false)}
        onSubmit={handleAddTrip}
      />
    </div>
  );
};

export default ActiveTrips;
