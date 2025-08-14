import {
  Activity,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Globe,
  MapPin,
  PackageCheck,
  Pencil,
  RefreshCw,
  Trash2,
  Truck as TruckIcon,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadImportModal from "../../components/Models/Trips/LoadImportModal"; // Keep this import
import SystemCostsModal from "../../components/Models/Trips/SystemCostsModal";
import TripCostEntryModal from "../../components/Models/Trips/TripCostEntryModal";
import TripStatusUpdateModal from "../../components/Models/Trips/TripStatusUpdateModal";
import { useAppContext } from "../../context/AppContext";
import { CostBreakdown, ImportSource, SupportedCurrency, UITrip } from "../../types/index"; // import

// Define the SelectOption interface
// Removed unused SelectOption interface (was only for removed mock modal)

// Helper functions and constants
const displayCurrency: SupportedCurrency = "USD"; // Default currency
const formatCurrency = (amount: number, currency: SupportedCurrency) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
};
// Retained for potential future use (prefixed with underscore to avoid unused-var lint rule)
// const _formatDate = (dateString: string) =>
//   dateString
//     ? new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       })
//     : "-";
// const _formatDateTime = (dateTimeString: string) =>
//   dateTimeString
//     ? new Date(dateTimeString).toLocaleString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//     : "-";
// Real driver data would come from the AppContext or a custom hook
// No mock data needed here as we'll use the real data from context
const useRealtimeTrips = ({ status, onlyWebBook }: { status?: string; onlyWebBook?: boolean }) => {
  const { trips: allContextTrips } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const filteredTrips = useMemo(() => {
    setLoading(true);
    let filtered = allContextTrips;
    if (status) {
      filtered = filtered.filter((trip) => trip.status === status);
    }
    if (onlyWebBook) {
      filtered = filtered.filter((trip) => trip.importSource === "web_book");
    }
    setLoading(false);
    return filtered;
  }, [allContextTrips, status, onlyWebBook]);
  return { trips: filteredTrips, loading, error };
};
// Re-usable UI components (Card, Button, Modal, etc.) would be defined here or imported.
const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
);
const CardHeader = ({ title, subtitle, action }: any) => (
  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
    <div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
const CardContent = ({ children, className = "" }: any) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  icon,
  isLoading,
  title,
}: any) => {
  const baseStyle =
    "inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  let variantStyle = "";
  switch (variant) {
    case "outline":
      variantStyle =
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500";
      break;
    case "danger":
      variantStyle = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
      break;
    default:
      variantStyle = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500";
      break;
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} px-4 py-2 text-base ${variantStyle} ${className}`}
      title={title}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">⟳</span>
      ) : (
        icon && <span className="mr-2">{icon}</span>
      )}
      {children}
    </button>
  );
};
const Modal = ({ isOpen, onClose, title, maxWidth = "lg", children }: any) => {
  if (!isOpen) return null;
  type MaxWidthType = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth as MaxWidthType];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidthClass} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
// Removed unused form field components (Input, Select, TextArea) used only by deleted mock modals
const Checkbox = ({ label, ...props }: any) => (
  <div className="flex items-center">
    <input
      {...props}
      type="checkbox"
      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
    />
    {label && <label className="ml-2 text-sm text-gray-700">{label}</label>}
  </div>
);
// Mock components for modals

// Main Component
const ActiveTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    trips: allContextTrips,
    updateTrip,
    deleteTrip,
    addTrip,
    addCostEntry,
    updateTripStatus,
  } = useAppContext();
  const [filterWebBookOnly, setFilterWebBookOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const {
    trips: rtTrips,
    loading,
    error,
  } = useRealtimeTrips({
    onlyWebBook: filterWebBookOnly || undefined,
    status: statusFilter || undefined,
  });
  const [webhookTrips, setWebhookTrips] = useState<UITrip[]>([]);
  const [csvTrips, setCsvTrips] = useState<UITrip[]>([]);
  const [confirm, setConfirm] = useState<{ open: boolean; tripId?: string; action?: string }>({
    open: false,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<UITrip | null>(null);
  const [editForm, setEditForm] = useState<{
    cost: number;
    fuelCosts: number;
    tollFees: number;
    maintenanceCosts: number;
    driverExpenses: number;
    overheadCosts: number;
    total: number;
    currency: string;
    // Legacy properties for backward compatibility
    fuel: number;
    maintenance: number;
    driver: number;
    tolls: number;
    other: number;
  }>({
    cost: 0,
    fuelCosts: 0,
    tollFees: 0,
    maintenanceCosts: 0,
    driverExpenses: 0,
    overheadCosts: 0,
    total: 0,
    currency: "ZAR",
    fuel: 0,
    maintenance: 0,
    driver: 0,
    tolls: 0,
    other: 0,
  });
  const [showLoadImportModal, setShowLoadImportModal] = useState(false);
  const [statusUpdateTrip, setStatusUpdateTrip] = useState<UITrip | null>(null);
  const [statusUpdateType, setStatusUpdateType] = useState<"shipped" | "delivered">("shipped");
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [costTrip, setCostTrip] = useState<UITrip | null>(null);
  const [isSystemCostsOpen, setIsSystemCostsOpen] = useState(false);
  const [systemCostsTrip, setSystemCostsTrip] = useState<UITrip | null>(null);

  const normalizeRtTrip = (trip: any): UITrip => ({
    id: trip.id,
    fleetNumber: trip.fleetNumber || `TR-${trip.id.substring(0, 8)}`,
    driverName: trip.driverName || "Unassigned",
    clientName: trip.clientName,
    clientType: "external" as const,
    startDate: trip.startDate,
    endDate: trip.endDate,
    route: trip.route || "Unknown",
    status: trip.status,
    baseRevenue: trip.baseRevenue || 0,
    revenueCurrency: trip.revenueCurrency || ("ZAR" as const),
    distanceKm: trip.distanceKm || 0,
    costs: [],
    additionalCosts: [],
    paymentStatus: "unpaid" as const,
    followUpHistory: [],
    // UITrip specific properties
    displayStatus: trip.status || "active",
    displayRevenue: `${trip.revenueCurrency || "ZAR"} ${trip.baseRevenue || 0}`,
    displayCurrency: trip.revenueCurrency || "ZAR",
    origin: trip.route?.split(" - ")[0] || "Unknown",
    destination: trip.route?.split(" - ")[1] || "Unknown",
    shippedStatus: trip.status === "shipped" || trip.status === "delivered",
    deliveredStatus: trip.status === "delivered",
    importSource: (trip.importSource as ImportSource) || "manual",
    startTime: trip.startDate,
    endTime: trip.endDate,
    totalCost: trip.baseRevenue,
    costBreakdown: trip.costBreakdown || {},
    externalId: trip.externalId,
    // Remove lastUpdated as it's not part of UITrip interface
  });

  const fetchWebhookTrips = async () => {
    const mock: UITrip[] = [
      {
        id: "wh-1",
        fleetNumber: "WH-123",
        driverName: "Alex Thompson",
        clientName: "WebhookCustomer1",
        clientType: "external",
        startDate: "2025-07-14T10:00:00",
        endDate: "2025-07-15T16:00:00",
        route: "Miami, FL - Orlando, FL",
        baseRevenue: 2500,
        revenueCurrency: "USD",
        distanceKm: 235,
        status: "active",
        costs: [],
        additionalCosts: [],
        paymentStatus: "unpaid" as const,
        followUpHistory: [],
        // UITrip specific properties
        displayStatus: "Active",
        displayRevenue: "USD 2500",
        displayCurrency: "USD",
        origin: "Miami, FL",
        destination: "Orlando, FL",
        shippedStatus: false,
        deliveredStatus: false,
        importSource: "webhook",
        startTime: "2025-07-14T10:00:00",
        endTime: "2025-07-15T16:00:00",
        totalCost: 2500,
        costBreakdown: { fuel: 0, maintenance: 0, driver: 0, tolls: 0, other: 0 },
        externalId: "ext-12345",
      },
      {
        id: "wh-2",
        fleetNumber: "WH-456",
        driverName: "Jamie Rodriguez",
        clientName: "WebhookCustomer2",
        clientType: "external",
        startDate: "2025-07-16T08:30:00",
        endDate: "2025-07-17T12:00:00",
        route: "Austin, TX - Houston, TX",
        baseRevenue: 1800,
        revenueCurrency: "USD",
        distanceKm: 162,
        status: "active",
        costs: [],
        additionalCosts: [],
        paymentStatus: "unpaid" as const,
        followUpHistory: [],
        // UITrip specific properties
        displayStatus: "Active",
        displayRevenue: "USD 1800",
        displayCurrency: "USD",
        origin: "Austin, TX",
        destination: "Houston, TX",
        shippedStatus: false,
        deliveredStatus: false,
        importSource: "webhook",
        startTime: "2025-07-16T08:30:00",
        endTime: "2025-07-17T12:00:00",
        totalCost: 1800,
        costBreakdown: { fuel: 0, maintenance: 0, driver: 0, tolls: 0, other: 0 },
        externalId: "ext-67890",
      },
    ];
    setWebhookTrips(mock);
  };

  useEffect(() => {
    fetchWebhookTrips();
  }, []);

  const allTrips: UITrip[] = useMemo(
    () => [...rtTrips.map(normalizeRtTrip), ...webhookTrips, ...csvTrips],
    [rtTrips, webhookTrips, csvTrips]
  );
  const webBookTrips = allTrips.filter((trip) => trip.importSource === "web_book");
  const manualAndOtherTrips = allTrips.filter((trip) => trip.importSource !== "web_book");

  const handleEditTripCosts = (trip: UITrip) => {
    setEditingTrip(trip);
    const cb = trip.costBreakdown || {};
    const cost =
      (cb.fuel || 0) +
        (cb.maintenance || 0) +
        (cb.driver || 0) +
        (cb.tolls || 0) +
        (cb.other || 0) ||
      trip.totalCost ||
      0;
    setEditForm({
      cost,
      fuelCosts: cb.fuel || 0,
      tollFees: cb.tolls || 0,
      maintenanceCosts: cb.maintenance || 0,
      driverExpenses: cb.driver || 0,
      overheadCosts: cb.other || 0,
      total: cost,
      currency: "ZAR",
      // Legacy properties for backward compatibility
      fuel: cb.fuel || 0,
      maintenance: cb.maintenance || 0,
      driver: cb.driver || 0,
      tolls: cb.tolls || 0,
      other: cb.other || 0,
    });
  };
  const handleEditCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value || "0") || 0;
    setEditForm((prev) => {
      const updatedValues = { ...prev, [name]: numValue };
      const totalCost =
        (updatedValues.fuel || 0) +
        (updatedValues.maintenance || 0) +
        (updatedValues.driver || 0) +
        (updatedValues.tolls || 0) +
        (updatedValues.other || 0);
      return { ...updatedValues, cost: totalCost };
    });
  };
  const handleSaveCosts = async () => {
    if (!editingTrip) return;
    const updatedTrip: UITrip = {
      ...editingTrip,
      totalCost: editForm.cost,
      costBreakdown: {
        fuel: editForm.fuel,
        maintenance: editForm.maintenance,
        driver: editForm.driver,
        tolls: editForm.tolls,
        other: editForm.other,
      },
      // Remove lastUpdated as it's not part of UITrip interface
    };
    if (updatedTrip.importSource === "webhook") {
      setWebhookTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    } else if (updatedTrip.importSource === "csv") {
      setCsvTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    } else {
      const tripInContext = allContextTrips.find((t) => t.id === updatedTrip.id);
      if (tripInContext) {
        updateTrip({
          ...tripInContext,
          baseRevenue: updatedTrip.totalCost || 0,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    setEditingTrip(null);
  };
  const handleDeleteTrip = (tripId: string) => setConfirm({ open: true, tripId, action: "delete" });
  const handleShipTrip = async (trip: UITrip) => {
    setStatusUpdateTrip(trip);
    setStatusUpdateType("shipped");
  };
  const handleDeliverTrip = async (trip: UITrip) => {
    setStatusUpdateTrip(trip);
    setStatusUpdateType("delivered");
  };
  const handleCompleteTrip = async (trip: UITrip) => {
    setActionLoading(trip.id + ":complete");
    try {
      const tripInContext = allContextTrips.find((t) => t.id === trip.id);
      if (tripInContext) {
        const unresolvedCount = tripInContext.costs.filter(
          (c) => c.isFlagged && !(c as any).isResolved
        ).length;
        if (unresolvedCount > 0) {
          alert(`Cannot complete trip: ${unresolvedCount} unresolved flagged items.`);
          return;
        }
        updateTrip({
          ...tripInContext,
          status: "completed",
          completedAt: new Date().toISOString(),
        });
      }
    } finally {
      setActionLoading(null);
    }
  };
  const confirmYes = async () => {
    if (!confirm.tripId || !confirm.action) return;
    const { tripId, action } = confirm;
    setActionLoading(tripId + ":" + action);
    try {
      if (action === "delete") {
        const tripToDelete = allContextTrips.find((t) => t.id === tripId);
        if (tripToDelete) {
          deleteTrip(tripId);
        } else {
          setWebhookTrips((prev) => prev.filter((t) => t.id !== tripId));
          setCsvTrips((prev) => prev.filter((t) => t.id !== tripId));
        }
      }
    } finally {
      setActionLoading(null);
      setConfirm({ open: false });
    }
  };
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
    const sample =
      "TR-2025-0001,New York NY,Boston MA,2025-07-20,2025-07-22,John Doe,Truck 101,215,1200,600,200,300,75,25";
    const csv = [headers.join(","), sample].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trips-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleAddTripSubmit = (tripData: any) => {
    addTrip({
      ...tripData,
      id: `manual-${Date.now()}`,
      importSource: "manual",
      status: "active",
      costs: [],
      additionalCosts: [],
      delayReasons: [],
      followUpHistory: [],
      baseRevenue: tripData.baseRevenue,
      revenueCurrency: tripData.revenueCurrency,
      clientName: tripData.clientName,
      route: tripData.route,
      fleetNumber: tripData.fleetNumber,
      driverName: tripData.driver,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
    });
  };
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading active trips...</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error loading trips</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }
  const StatusBadge: React.FC<{ status?: string; shipped?: boolean; delivered?: boolean }> = ({
    status,
    shipped,
    delivered,
  }) => {
    if (delivered) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Delivered
        </span>
      );
    }
    if (shipped) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          Shipped
        </span>
      );
    }
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        {status || "Pending"}
      </span>
    );
  };
  return (
    <div className="p-6 space-y-6 bg-neutral-50 font-sans text-gray-800">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Trips</h1>
          <p className="text-gray-600">
            Real-time trip monitoring, webhook/CSV ingest and cost allocation
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Real-time updates enabled</span>
          </div>
        </div>
      </div>
      <Card className="rounded-xl shadow-sm border border-gray-100">
        <CardHeader
          title="Filters & Actions"
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowLoadImportModal(true)}
                className="bg-purple-500 text-white hover:bg-purple-600"
                icon={<Upload className="w-4 h-4" />}
              >
                Import CSV
              </Button>
              <Button
                onClick={handleDownloadTemplate}
                className="bg-gray-600 text-white hover:bg-gray-700"
                icon={<Download className="w-4 h-4" />}
              >
                Template
              </Button>
              <Button
                onClick={fetchWebhookTrips}
                className="bg-green-600 text-white hover:bg-green-700"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh Webhook Trips
              </Button>
              <Link
                to="/trips/add"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                + New Trip
              </Link>
            </div>
          }
        />
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Checkbox
              label="Web Book Trips Only"
              checked={filterWebBookOnly}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilterWebBookOnly(e.target.checked)
              }
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-5">
                <dt className="text-sm text-gray-500">Total Active</dt>
                <dd className="text-lg font-medium text-gray-900">{allTrips.length}</dd>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-green-600" />
              <div className="ml-5">
                <dt className="text-sm text-gray-500">Web Book</dt>
                <dd className="text-lg font-medium text-gray-900">{webBookTrips.length}</dd>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-5">
                <dt className="text-sm text-gray-500">Manual/Other</dt>
                <dd className="text-lg font-medium text-gray-900">{manualAndOtherTrips.length}</dd>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-5">
                <dt className="text-sm text-gray-500">Delivered</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {allTrips.filter((t) => t.deliveredStatus).length}
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-xl shadow-sm border border-gray-100">
        <CardHeader
          title={`Live Active Trips (${allTrips.length})`}
          subtitle="Combined real-time + webhook + CSV"
        />
        <CardContent className="p-0">
          {allTrips.length === 0 ? (
            <div className="text-center py-12">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active trips</h3>
              <p className="mt-1 text-sm text-gray-500">No trips match the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Load Ref
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer
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
                      Status
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
                      Start
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      End
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
                  {allTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/trips/${trip.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link to={`/trips/${trip.id}`} onClick={(e) => e.stopPropagation()}>
                          {trip.loadRef}
                        </Link>
                        {trip.importSource === "webhook" && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                            Webhook
                          </span>
                        )}
                        {trip.importSource === "csv" && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-800">
                            CSV
                          </span>
                        )}
                        {trip.externalId && (
                          <div className="text-xs text-gray-500 mt-1">
                            Ext ID: {trip.externalId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.customer || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span>{trip.origin || "-"}</span>
                          <span>→</span>
                          <span>{trip.destination || "-"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={trip.status}
                          shipped={!!trip.shippedStatus}
                          delivered={!!trip.deliveredStatus}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          {trip.importSource === "web_book" ? (
                            <>
                              <Globe className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">Web Book</span>
                            </>
                          ) : trip.importSource === "webhook" ? (
                            <>
                              <TruckIcon className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-600 font-medium">Webhook</span>
                            </>
                          ) : trip.importSource === "csv" ? (
                            <>
                              <TruckIcon className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-600 font-medium">CSV</span>
                            </>
                          ) : (
                            <>
                              <TruckIcon className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-600 font-medium">Manual</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trip.startTime ? new Date(trip.startTime).toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trip.endTime ? new Date(trip.endTime).toLocaleString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.totalCost != null
                          ? formatCurrency(trip.totalCost, displayCurrency)
                          : "-"}
                        {trip.costBreakdown && (
                          <button
                            className="text-xs text-blue-600 hover:underline ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTripCosts(trip);
                            }}
                          >
                            View / Edit
                          </button>
                        )}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/trips/${trip.id}`}
                            className="inline-flex items-center text-blue-600 hover:underline"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Link>
                          <button
                            className="inline-flex items-center text-indigo-600 hover:underline"
                            onClick={() => handleEditTripCosts(trip)}
                          >
                            <Pencil className="w-4 h-4 mr-1" /> Edit Costs
                          </button>
                          <button
                            className="inline-flex items-center text-red-600 hover:underline"
                            disabled={actionLoading === trip.id + ":delete"}
                            onClick={() => handleDeleteTrip(trip.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />{" "}
                            {actionLoading === trip.id + ":delete" ? "Deleting..." : "Delete"}
                          </button>
                          {!trip.shippedStatus && (
                            <button
                              className="inline-flex items-center text-blue-600 hover:underline"
                              disabled={actionLoading === trip.id + ":ship"}
                              onClick={() => handleShipTrip(trip)}
                            >
                              <TruckIcon className="w-4 h-4 mr-1" />{" "}
                              {actionLoading === trip.id + ":ship" ? "Shipping..." : "Ship"}
                            </button>
                          )}
                          {!trip.deliveredStatus && (
                            <button
                              className="inline-flex items-center text-green-600 hover:underline"
                              disabled={actionLoading === trip.id + ":deliver"}
                              onClick={() => handleDeliverTrip(trip)}
                            >
                              <PackageCheck className="w-4 h-4 mr-1" />{" "}
                              {actionLoading === trip.id + ":deliver" ? "Delivering..." : "Deliver"}
                            </button>
                          )}
                          {trip.status !== "completed" && (
                            <button
                              className="inline-flex items-center text-emerald-600 hover:underline"
                              disabled={actionLoading === trip.id + ":complete"}
                              onClick={() => handleCompleteTrip(trip)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />{" "}
                              {actionLoading === trip.id + ":complete"
                                ? "Completing..."
                                : "Complete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Modals */}
      <Modal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false })}
        title="Confirm action"
      >
        <p className="mb-4">Are you sure you want to {confirm.action} this trip?</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={() => setConfirm({ open: false })}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmYes}>
            Yes, {confirm.action}
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        title={`Edit Trip Costs${editingTrip?.importSource === "webhook" ? " (Webhook)" : ""}`}
        maxWidth="2xl"
      >
        {editingTrip && (
          <>
            <div className="mb-4 text-sm">
              <p>
                <span className="font-medium">Trip:</span> {editingTrip.loadRef}
              </p>
              <p>
                <span className="font-medium">Route:</span> {editingTrip.origin} →{" "}
                {editingTrip.destination}
              </p>
              {editingTrip.externalId && (
                <p>
                  <span className="font-medium">External ID:</span> {editingTrip.externalId}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["fuel", "maintenance", "driver", "tolls", "other"].map((k) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {k} Cost
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R</span>
                    </div>
                    <input
                      type="number"
                      name={k as keyof CostBreakdown}
                      value={(editForm as any)[k]}
                      onChange={handleEditCostChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
                <div className="mt-1 relative rounded-md shadow-sm bg-gray-50">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R</span>
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
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingTrip(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCosts}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </Modal>
      <TripStatusUpdateModal
        isOpen={!!statusUpdateTrip}
        onClose={() => setStatusUpdateTrip(null)}
        trip={{
          id: statusUpdateTrip?.id || "",
          fleetNumber: (statusUpdateTrip as any)?.fleetNumber || "",
          driverName: (statusUpdateTrip as any)?.driverName || "",
          route:
            (statusUpdateTrip as any)?.route ||
            `${statusUpdateTrip?.origin || ""} → ${statusUpdateTrip?.destination || ""}`,
          startDate: (statusUpdateTrip as any)?.startDate || statusUpdateTrip?.startTime || "",
          endDate: (statusUpdateTrip as any)?.endDate || statusUpdateTrip?.endTime || "",
          shippedAt: (statusUpdateTrip as any)?.shippedAt,
        }}
        status={statusUpdateType}
        onUpdateStatus={async (id: string, status: "shipped" | "delivered", notes: string) => {
          await updateTripStatus(id, status, notes);
          setStatusUpdateTrip(null);
        }}
      />

      <TripCostEntryModal
        isOpen={isCostModalOpen}
        onClose={() => {
          setIsCostModalOpen(false);
          setCostTrip(null);
        }}
        onSubmit={async (data: any, files?: FileList) => {
          if (!costTrip) return;
          await addCostEntry(
            {
              ...(data as any),
              tripId: costTrip.id,
            } as any,
            files
          );
          setIsCostModalOpen(false);
          setCostTrip(null);
        }}
      />

      {systemCostsTrip && (
        <SystemCostsModal
          isOpen={isSystemCostsOpen}
          onClose={() => {
            setIsSystemCostsOpen(false);
            setSystemCostsTrip(null);
          }}
          tripData={systemCostsTrip as any}
          onGenerateCosts={async (costs: any[]) => {
            for (const c of costs) {
              await addCostEntry({ ...(c as any), tripId: systemCostsTrip.id } as any);
            }
            setIsSystemCostsOpen(false);
            setSystemCostsTrip(null);
          }}
        />
      )}

      <LoadImportModal isOpen={showLoadImportModal} onClose={() => setShowLoadImportModal(false)} />
    </div>
  );
};
export default ActiveTripsPage;
