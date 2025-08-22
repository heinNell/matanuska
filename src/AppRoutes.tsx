import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";

// A tiny helper to keep JSX clean
const withSuspense = (Comp: React.LazyExoticComponent<any>, props = {}) => (
  <Suspense fallback={<div className="p-6">Loading…</div>}>
    <Comp {...props} />
  </Suspense>
);

/* -----------------------------
 * Top-level / dashboard pages
 * ----------------------------- */
const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const FormsIntegrationPage = lazy(() => import("./pages/FormsIntegrationPage"));
const FleetLocationMapPage = lazy(() => import("./pages/FleetLocationMapPage"));

/* -----------------------------
 * Analytics
 * ----------------------------- */
const AnalyticsDashboard = lazy(() => import("./pages/analytics/AnalyticsDashboard"));
const DashboardPageAnalytics = lazy(() => import("./pages/analytics/DashboardPage"));
const FleetAnalyticsPage = lazy(() => import("./pages/analytics/FleetAnalyticsPage"));
const PerformanceAnalyticsAnalytics = lazy(() => import("./pages/analytics/PerformanceAnalytics"));
const YearToDateKPIs = lazy(() => import("./pages/analytics/YearToDateKPIs"));

/* -----------------------------
 * Clients
 * ----------------------------- */
const CustomerRetentionDashboard = lazy(() => import("./pages/clients/CustomerRetentionDashboard"));
const CustomerReports = lazy(() => import("./pages/clients/CustomerReports"));
const CustomerDashboard = lazy(() => import("./pages/clients/CustomerDashboard"));
const ClientNetworkMap = lazy(() => import("./pages/clients/ClientNetworkMap"));
const ClientManagementPageIntegrated = lazy(
  () => import("./pages/clients/ClientManagementPageIntegrated")
);
const ClientManagementPage = lazy(() => import("./pages/clients/ClientManagementPage"));
const ClientDetail = lazy(() => import("./pages/clients/ClientDetail"));
const AddNewCustomer = lazy(() => import("./pages/clients/AddNewCustomer"));
const ActiveCustomers = lazy(() => import("./pages/clients/ActiveCustomers"));

/* -----------------------------
 * Diesel
 * ----------------------------- */
const FuelTheftDetection = lazy(() => import("./pages/diesel/FuelTheftDetection"));
const FuelStations = lazy(() => import("./pages/diesel/FuelStations"));
const FuelLogs = lazy(() => import("./pages/diesel/FuelLogs"));
const FuelEfficiencyReport = lazy(() => import("./pages/diesel/FuelEfficiencyReport"));
const FuelCardManager = lazy(() => import("./pages/diesel/FuelCardManager"));
const DriverFuelBehaviorDiesel = lazy(() => import("./pages/diesel/DriverFuelBehavior"));
const DieselManagementPage = lazy(() => import("./pages/diesel/DieselManagementPage"));
const DieselIntegratedPage = lazy(() => import("./pages/diesel/DieselIntegratedPage"));
const DieselDashboardComponent = lazy(() => import("./pages/diesel/DieselDashboardComponent"));
const DieselDashboard = lazy(() => import("./pages/diesel/DieselDashboard"));
const DieselAnalysis = lazy(() => import("./pages/diesel/DieselAnalysis"));
const CostAnalysis = lazy(() => import("./pages/diesel/CostAnalysis"));
const CarbonFootprintCalc = lazy(() => import("./pages/diesel/CarbonFootprintCalc"));
const BudgetPlanning = lazy(() => import("./pages/diesel/BudgetPlanning"));
const AddFuelEntryPageWrapper = lazy(() => import("./pages/diesel/AddFuelEntryPageWrapper"));
const AddFuelEntryPage = lazy(() => import("./pages/diesel/AddFuelEntryPage"));

/* -----------------------------
 * Trips
 * ----------------------------- */
const TripTimelinePage = lazy(() => import("./pages/trips/TripTimelinePage"));
const TripReportPage = lazy(() => import("./pages/trips/TripReportPage"));
const TripManager = lazy(() => import("./pages/trips/TripManager"));
const TripManagementPage = lazy(() => import("./pages/trips/TripManagementPage"));
const TripInvoicingPanel = lazy(() => import("./pages/trips/TripInvoicingPanel"));
const TripFinancialsPanel = lazy(() => import("./pages/trips/TripFinancialsPanel"));
const TripDetailsPage = lazy(() => import("./pages/trips/TripDetailsPage"));
const TripDashboardPage = lazy(() => import("./pages/trips/TripDashboardPage"));
const TripCompletionPanel = lazy(() => import("./pages/trips/TripCompletionPanel"));
const TripCalendarPage = lazy(() => import("./pages/trips/TripCalendarPage"));
const SystemCostGenerator = lazy(() => import("./pages/trips/SystemCostGenerator"));
const RoutePlanningPage = lazy(() => import("./pages/trips/RoutePlanningPage"));
const RouteOptimizationPage = lazy(() => import("./pages/trips/RouteOptimizationPage"));
const PaymentTrackingPanel = lazy(() => import("./pages/trips/PaymentTrackingPanel"));
const MissedLoadsTracker = lazy(() => import("./pages/trips/MissedLoadsTracker"));
const MainTripWorkflow = lazy(() => import("./pages/trips/MainTripWorkflow"));
const LoadPlanningPage = lazy(() => import("./pages/trips/LoadPlanningPage"));
const IndirectCostBreakdown = lazy(() => import("./pages/trips/IndirectCostBreakdown"));
const FleetManagementPage = lazy(() => import("./pages/trips/FleetManagementPage"));
const FlagsInvestigationsPage = lazy(() => import("./pages/trips/FlagsInvestigationsPage"));
const FlagInvestigationPanel = lazy(() => import("./pages/trips/FlagInvestigationPanel"));
const CreateLoadConfirmationPage = lazy(() => import("./pages/trips/CreateLoadConfirmationPage"));
const CostEntryForm = lazy(() => import("./pages/trips/CostEntryForm"));
const CompletedTrips = lazy(() => import("./pages/trips/CompletedTrips"));
const ActiveTripsPageEnhanced = lazy(() => import("./pages/trips/ActiveTripsPageEnhanced"));
const ActiveTripsManager = lazy(() => import("./pages/trips/ActiveTripsManager"));
const ActiveTrips = lazy(() => import("./pages/trips/ActiveTrips"));

/* -----------------------------
 * Drivers
 * ----------------------------- */
const TrainingRecords = lazy(() => import("./pages/drivers/TrainingRecords"));
const SafetyScores = lazy(() => import("./pages/drivers/SafetyScores"));
const PerformanceAnalyticsDrivers = lazy(() => import("./pages/drivers/PerformanceAnalytics"));
const LicenseManagement = lazy(() => import("./pages/drivers/LicenseManagement"));
const HoursOfService = lazy(() => import("./pages/drivers/HoursOfService"));
const EditDriver = lazy(() => import("./pages/drivers/EditDriver"));
const DriverViolations = lazy(() => import("./pages/drivers/DriverViolations"));
const DriverScheduling = lazy(() => import("./pages/drivers/DriverScheduling"));
const DriverRewards = lazy(() => import("./pages/drivers/DriverRewards"));
const DriverProfiles = lazy(() => import("./pages/drivers/DriverProfiles"));
const DriverPerformancePage = lazy(() => import("./pages/drivers/DriverPerformancePage"));
const DriverManagementWrapper = lazy(() => import("./pages/drivers/DriverManagementWrapper"));
const DriverManagementPageIntegrated = lazy(
  () => import("./pages/drivers/DriverManagementPageIntegrated")
);
const DriverManagementPage = lazy(() => import("./pages/drivers/DriverManagementPage"));
const DriverFuelBehaviorDrivers = lazy(() => import("./pages/drivers/DriverFuelBehavior"));
const DriverDetailsPage = lazy(() => import("./pages/drivers/DriverDetailsPage"));
const DriverDetails = lazy(() => import("./pages/drivers/DriverDetails"));
const DriverBehaviorPage = lazy(() => import("./pages/drivers/DriverBehaviorPage"));
const AddNewDriverPage = lazy(() => import("./pages/drivers/AddNewDriverPage"));
const AddEditDriverPage = lazy(() => import("./pages/drivers/AddEditDriverPage"));

/* -----------------------------
 * Tyres
 * ----------------------------- */
const VehicleTyreViewA = lazy(() => import("./pages/tyres/VehicleTyreViewA"));
const VehicleTyreView = lazy(() => import("./pages/tyres/VehicleTyreView"));
const TyreStores = lazy(() => import("./pages/tyres/TyreStores"));
const TyreReferenceManagerPage = lazy(() => import("./pages/tyres/TyreReferenceManagerPage"));
const TyrePerformanceDashboard = lazy(() => import("./pages/tyres/TyrePerformanceDashboard"));
const TyreManagementView = lazy(() => import("./pages/tyres/TyreManagementView"));
const TyreManagementPage = lazy(() => import("./pages/tyres/TyreManagementPage"));
const TyreInventoryDashboard = lazy(() => import("./pages/tyres/TyreInventoryDashboard"));
const TyreHistoryPage = lazy(() => import("./pages/tyres/TyreHistoryPage"));
const TyreFleetMap = lazy(() => import("./pages/tyres/TyreFleetMap"));
const TyreDashboard = lazy(() => import("./pages/tyres/TyreDashboard"));

/* -----------------------------
 * Components
 * ----------------------------- */
const CARReportDetails = lazy(() => import("./components/Adminmangement/CARReportDetails"));
const ActionItemDetails = lazy(() => import("./components/Adminmangement/ActionItemDetails"));
// Lazy-loaded Wialon components with named exports
const WialonDriverManager = lazy(() =>
  import("./components/wialon/WialonDriverManager").then((m) => ({ default: m.WialonDriverManager }))
);

const WialonGeofenceManager = lazy(() =>
  import("./components/wialon/WialonGeofenceManager").then((m) => ({ default: m.WialonGeofenceManager }))
);

/* -----------------------------
 * 404
 * ----------------------------- */
const NotFound = () => <div className="p-6">404 – Page not found</div>;

interface Trip {
  id: string;
}

export const AppRoutes: React.FC = () => {
  const [, setShowTripForm] = React.useState(false);
  const [, setEditingTrip] = React.useState<Trip | null>(null);

  const handleEditingTripChange = (trip: Trip | undefined) => {
    setEditingTrip(trip || null);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout setShowTripForm={setShowTripForm} setEditingTrip={handleEditingTripChange} />
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Top-Level Pages */}
        <Route path="dashboard" element={withSuspense(DashboardPage)} />
        <Route path="forms-integration" element={withSuspense(FormsIntegrationPage)} />
        <Route path="fleet-location-map" element={withSuspense(FleetLocationMapPage)} />

        {/* Analytics */}
        <Route path="analytics">
          <Route index element={withSuspense(AnalyticsDashboard)} />
          <Route path="dashboard" element={withSuspense(DashboardPageAnalytics)} />
          <Route path="fleet" element={withSuspense(FleetAnalyticsPage)} />
          <Route path="performance" element={withSuspense(PerformanceAnalyticsAnalytics)} />
          <Route path="ytd-kpis" element={withSuspense(YearToDateKPIs)} />
        </Route>

        {/* Clients */}
        <Route path="clients">
          <Route index element={withSuspense(ClientManagementPage)} />
          <Route path="management" element={withSuspense(ClientManagementPage)} />
          <Route path="integrated" element={withSuspense(ClientManagementPageIntegrated)} />
          <Route path="dashboard" element={withSuspense(CustomerDashboard)} />
          <Route path="reports" element={withSuspense(CustomerReports)} />
          <Route path="active" element={withSuspense(ActiveCustomers)} />
          <Route path="detail" element={withSuspense(ClientDetail)} />
          <Route path="retention" element={withSuspense(CustomerRetentionDashboard)} />
          <Route path="add-new-customer" element={withSuspense(AddNewCustomer)} />
          <Route path="network-map" element={withSuspense(ClientNetworkMap)} />
        </Route>

        {/* Diesel */}
        <Route path="diesel">
          <Route index element={withSuspense(DieselDashboard)} />
          <Route path="dashboard" element={withSuspense(DieselDashboard)} />
          <Route path="management" element={withSuspense(DieselManagementPage)} />
          <Route path="integrated" element={withSuspense(DieselIntegratedPage)} />
          <Route path="analysis" element={withSuspense(DieselAnalysis)} />
          <Route path="fuel-logs" element={withSuspense(FuelLogs)} />
          <Route path="fuel-theft" element={withSuspense(FuelTheftDetection)} />
          <Route path="driver-fuel-behavior" element={withSuspense(DriverFuelBehaviorDiesel)} />
          <Route path="fuel-efficiency" element={withSuspense(FuelEfficiencyReport)} />
          <Route path="fuel-card-manager" element={withSuspense(FuelCardManager)} />
          <Route path="budget-planning" element={withSuspense(BudgetPlanning)} />
          <Route path="carbon-footprint" element={withSuspense(CarbonFootprintCalc)} />
          <Route path="cost-analysis" element={withSuspense(CostAnalysis)} />
          <Route path="fuel-stations" element={withSuspense(FuelStations)} />
          <Route path="add-fuel-entry" element={withSuspense(AddFuelEntryPage)} />
          <Route path="add-fuel-entry-wrapper" element={withSuspense(AddFuelEntryPageWrapper)} />
          <Route path="dashboard-component" element={withSuspense(DieselDashboardComponent)} />
        </Route>

        {/* Drivers */}
        <Route path="drivers">
          <Route index element={withSuspense(DriverManagementPage)} />
          <Route path="management" element={withSuspense(DriverManagementPage)} />
          <Route path="integrated" element={withSuspense(DriverManagementPageIntegrated)} />
          <Route path="management-wrapper" element={withSuspense(DriverManagementWrapper)} />
          <Route path="add-edit" element={withSuspense(AddEditDriverPage)} />
          <Route path="add-new" element={withSuspense(AddNewDriverPage)} />
          <Route path="edit/:id" element={withSuspense(EditDriver)} />
          <Route path="details" element={withSuspense(DriverDetails)} />
          <Route path="details-page" element={withSuspense(DriverDetailsPage)} />
          <Route path="behavior" element={withSuspense(DriverBehaviorPage)} />
          <Route path="safety-scores" element={withSuspense(SafetyScores)} />
          <Route path="performance-analytics" element={withSuspense(PerformanceAnalyticsDrivers)} />
          <Route path="rewards" element={withSuspense(DriverRewards)} />
          <Route path="scheduling" element={withSuspense(DriverScheduling)} />
          <Route path="violations" element={withSuspense(DriverViolations)} />
          <Route path="hours-of-service" element={withSuspense(HoursOfService)} />
          <Route path="training-records" element={withSuspense(TrainingRecords)} />
          <Route path="license-management" element={withSuspense(LicenseManagement)} />
          <Route path="profiles" element={withSuspense(DriverProfiles)} />
          <Route path="performance-page" element={withSuspense(DriverPerformancePage)} />
          <Route path="fuel-behavior" element={withSuspense(DriverFuelBehaviorDrivers)} />
        </Route>

        {/* Tyres */}
        <Route path="tyres">
          <Route index element={withSuspense(TyreManagementPage)} />
          <Route path="dashboard" element={withSuspense(TyreDashboard)} />
          <Route path="management-view" element={withSuspense(TyreManagementView)} />
          <Route path="reference-manager" element={withSuspense(TyreReferenceManagerPage)} />
          <Route path="performance-dashboard" element={withSuspense(TyrePerformanceDashboard)} />
          <Route path="history" element={withSuspense(TyreHistoryPage)} />
          <Route path="fleet-map" element={withSuspense(TyreFleetMap)} />
          <Route path="stores" element={withSuspense(TyreStores)} />
          <Route path="vehicle-view" element={withSuspense(VehicleTyreView)} />
          <Route path="vehicle-view-a" element={withSuspense(VehicleTyreViewA)} />
          <Route path="inventory-dashboard" element={withSuspense(TyreInventoryDashboard)} />
        </Route>

        {/* Trips */}
        <Route path="trips">
          <Route index element={withSuspense(TripManager)} />
          <Route path="dashboard" element={withSuspense(TripDashboardPage)} />
          <Route path="management" element={withSuspense(TripManagementPage)} />
          <Route path="details/:tripId" element={withSuspense(TripDetailsPage)} />
          <Route path="active" element={withSuspense(ActiveTrips)} />
          <Route path="active-enhanced" element={withSuspense(ActiveTripsPageEnhanced)} />
          <Route path="active-manager" element={withSuspense(ActiveTripsManager)} />
          <Route path="completed" element={withSuspense(CompletedTrips)} />
          <Route path="load-planning" element={withSuspense(LoadPlanningPage)} />
          <Route path="route-planning" element={withSuspense(RoutePlanningPage)} />
          <Route path="route-optimization" element={withSuspense(RouteOptimizationPage)} />
          <Route path="timeline" element={withSuspense(TripTimelinePage)} />
          <Route path="report" element={withSuspense(TripReportPage)} />
          <Route path="invoicing-panel" element={withSuspense(TripInvoicingPanel)} />
          <Route path="completion-panel" element={withSuspense(TripCompletionPanel)} />
          <Route path="flags-investigations" element={withSuspense(FlagsInvestigationsPage)} />
          <Route path="flag-investigation-panel" element={withSuspense(FlagInvestigationPanel)} />
          <Route
            path="create-load-confirmation"
            element={withSuspense(CreateLoadConfirmationPage)}
          />
          <Route path="cost-entry-form" element={withSuspense(CostEntryForm)} />
          <Route path="financials-panel" element={withSuspense(TripFinancialsPanel)} />
          <Route path="calendar" element={withSuspense(TripCalendarPage)} />
          <Route path="system-cost-generator" element={withSuspense(SystemCostGenerator)} />
          <Route path="payment-tracking-panel" element={withSuspense(PaymentTrackingPanel)} />
          <Route path="missed-loads-tracker" element={withSuspense(MissedLoadsTracker)} />
          <Route path="main-trip-workflow" element={withSuspense(MainTripWorkflow)} />
          <Route path="indirect-cost-breakdown" element={withSuspense(IndirectCostBreakdown)} />
          <Route path="fleet-management" element={withSuspense(FleetManagementPage)} />
        </Route>

        {/* Admin Management (Components) */}
        <Route path="admin-management">
          <Route path="car-report-details" element={withSuspense(CARReportDetails)} />
          <Route path="action-item-details" element={withSuspense(ActionItemDetails)} />
          <Route path="wialon-diagnostics" element={withSuspense(lazy(() => import("./pages/admin/WialonDiagnosticsPage")))} />
          <Route path="wialon-drivers" element={withSuspense(WialonDriverManager)} />
          <Route path="wialon-geofences" element={withSuspense(WialonGeofenceManager)} />
        </Route>

        {/* Wialon shortcuts (aliases) */}
        <Route path="wialon">
          <Route path="drivers" element={withSuspense(WialonDriverManager)} />
          <Route path="geofences" element={withSuspense(WialonGeofenceManager)} />
        </Route>

        {/** dev all-pages explorer removed */}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

