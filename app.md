Uses React Router v6 createBrowserRouter shape (RouteObject[]).

Lazy loads every page to keep your main bundle small.

Wraps everything inside your AppLayout (which renders the Sidebar).

Includes a catch‑all NotFound route.

You can trim / rename paths to match your exact sidebar labels — I kept them predictable and REST-ish.

How to use

Save this as src/config/AppRoutes.tsx.

Import it in App.tsx and pass to createBrowserRouter(routes).

Ensure your AppLayout and RootProviders are set up as in my previous message.

src/config/AppRoutes.tsx
tsx
Copy
Edit
import React, { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";

import AppLayout from "@/layout/AppLayout";

// Optional shared UI
import ErrorBoundary from "@/components/ErrorBoundary";

// A tiny Suspense wrapper to avoid repeating the fallback everywhere
const Load = (Comp: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<div className="p-6">Loading…</div>}>
    <Comp />
  </Suspense>
);

/* =========================
 *  DASHBOARD / KPI / COMPLIANCE
 * ========================= */
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const YearToDateKPIs = lazy(() => import("@/pages/YearToDateKPIs"));
const ComplianceDashboard = lazy(() => import("@/pages/ComplianceDashboard"));
const RetentionMetrics = lazy(() => import("@/pages/RetentionMetrics"));
const VendorScorecard = lazy(() => import("@/pages/VendorScorecard"));
const WorkshopAnalytics = lazy(() => import("@/pages/WorkshopAnalytics"));
const WorkshopOperations = lazy(() => import("@/pages/WorkshopOperations"));

/* =========================
 *  TRIPS
 * ========================= */
const TripDashboardPage = lazy(() => import("@/pages/TripDashboardPage"));
const TripManagementPage = lazy(() => import("@/pages/TripManagementPage"));
const TripReportPage = lazy(() => import("@/pages/TripReportPage"));
const TripTimelinePage = lazy(() => import("@/pages/TripTimelinePage"));
const TripCalendarPage = lazy(() => import("@/pages/TripCalendarPage"));
const ActiveTripsPage = lazy(() => import("@/pages/ActiveTripsPage"));
const CompletedTrips = lazy(() => import("@/pages/CompletedTrips"));
const FlagsInvestigationsPage = lazy(() => import("@/pages/FlagsInvestigationsPage"));
const LoadPlanningPage = lazy(() => import("@/pages/LoadPlanningPage"));
const LoadPlanningComponentPage = lazy(() => import("@/pages/LoadPlanningComponentPage"));
const RoutePlanningPage = lazy(() => import("@/pages/RoutePlanningPage"));
const RouteOptimizationPage = lazy(() => import("@/pages/RouteOptimizationPage"));
const TripDashboard = lazy(() => import("@/pages/TripDashboard"));
const TripReport = lazy(() => import("@/components/TripManagement/TripReport"));
const TripTimelineLive = lazy(() => import("@/components/TripManagement/TripTimelineLive"));

// trips/** (workflow panels)
const MainTripWorkflow = lazy(() => import("@/pages/trips/MainTripWorkflow"));
const TripDetailsPage = lazy(() => import("@/pages/trips/TripDetailsPage"));
const TripInvoicingPanel = lazy(() => import("@/pages/trips/TripInvoicingPanel"));
const TripCompletionPanel = lazy(() => import("@/pages/trips/TripCompletionPanel"));
const PaymentTrackingPanel = lazy(() => import("@/pages/trips/PaymentTrackingPanel"));
const ReportingPanel = lazy(() => import("@/pages/trips/ReportingPanel"));
const SystemCostGenerator = lazy(() => import("@/pages/trips/SystemCostGenerator"));
const CostEntryForm = lazy(() => import("@/pages/trips/CostEntryForm"));
const CreateLoadConfirmationPage = lazy(() => import("@/pages/trips/CreateLoadConfirmationPage"));
const FlagInvestigationPanel = lazy(() => import("@/pages/trips/FlagInvestigationPanel"));
const TripFormPage = lazy(() => import("@/pages/trips/TripForm")); // (there is also pages/TripManagementPage.tsx)

/* =========================
 *  INVOICES
 * ========================= */
const InvoiceManagementPage = lazy(() => import("@/pages/invoices/InvoiceManagementPage"));
const InvoiceDashboard = lazy(() => import("@/pages/invoices/InvoiceDashboard"));
const InvoiceTemplatesPage = lazy(() => import("@/pages/invoices/InvoiceTemplatesPage"));
const CreateInvoicePage = lazy(() => import("@/pages/invoices/CreateInvoicePage"));
const CreateQuotePage = lazy(() => import("@/pages/invoices/CreateQuotePage"));
const PendingInvoicesPage = lazy(() => import("@/pages/invoices/PendingInvoicesPage"));
const PaidInvoicesPage = lazy(() => import("@/pages/invoices/PaidInvoicesPage"));
const TaxReportExport = lazy(() => import("@/pages/invoices/TaxReportExport"));

/* =========================
 *  DIESEL / FUEL
 * ========================= */
const DieselDashboard = lazy(() => import("@/pages/DieselDashboard"));
const DieselAnalysis = lazy(() => import("@/pages/DieselAnalysis"));
const DieselDashboardComponent = lazy(() => import("@/pages/diesel/DieselDashboardComponent"));
const DieselManagementPage = lazy(() => import("@/pages/diesel/DieselManagementPage"));
const FuelLogsPage = lazy(() => import("@/pages/diesel/FuelLogs"));
const FuelTheftDetectionPage = lazy(() => import("@/pages/diesel/FuelTheftDetection"));
const DriverFuelBehaviorPage = lazy(() => import("@/pages/diesel/DriverFuelBehavior"));
const FuelCardManager = lazy(() => import("@/pages/diesel/FuelCardManager"));
const FuelStations = lazy(() => import("@/pages/diesel/FuelStations"));
const FuelEfficiencyReport = lazy(() => import("@/pages/diesel/FuelEfficiencyReport"));
const CostAnalysis = lazy(() => import("@/pages/diesel/CostAnalysis"));
const BudgetPlanning = lazy(() => import("@/pages/diesel/BudgetPlanning"));
const CarbonFootprintCalc = lazy(() => import("@/pages/diesel/CarbonFootprintCalc"));
const AddFuelEntryPage = lazy(() => import("@/pages/diesel/AddFuelEntryPage"));

/* =========================
 *  DRIVERS
 * ========================= */
const DriverManagementPage = lazy(() => import("@/pages/drivers/DriverManagementPage"));
const DriverDashboard = lazy(() => import("@/pages/drivers/DriverDashboard"));
const DriverDetailsPage = lazy(() => import("@/pages/drivers/DriverDetailsPage"));
const DriverProfiles = lazy(() => import("@/pages/drivers/DriverProfiles"));
const DriverScheduling = lazy(() => import("@/pages/drivers/DriverScheduling"));
const DriverViolations = lazy(() => import("@/pages/drivers/DriverViolations"));
const LicenseManagement = lazy(() => import("@/pages/drivers/LicenseManagement"));
const PerformanceAnalyticsPage = lazy(() => import("@/pages/drivers/PerformanceAnalytics"));
const SafetyScores = lazy(() => import("@/pages/drivers/SafetyScores"));
const TrainingRecords = lazy(() => import("@/pages/drivers/TrainingRecords"));
const DriverFuelBehaviorDrivers = lazy(() => import("@/pages/drivers/DriverFuelBehavior"));
const EditDriver = lazy(() => import("@/pages/drivers/EditDriver"));
const DriverBehaviorPage = lazy(() => import("@/pages/drivers/DriverBehaviorPage"));
const AddNewDriver = lazy(() => import("@/pages/drivers/AddNewDriver"));

/* =========================
 *  TYRES
 * ========================= */
const TyreManagementPage = lazy(() => import("@/pages/tyres/TyreManagementPage"));
const TyreReferenceManagerPage = lazy(() => import("@/pages/tyres/TyreReferenceManagerPage"));
const AddNewTyrePage = lazy(() => import("@/pages/tyres/AddNewTyrePage"));
const TyreFleetMap = lazy(() => import("@/pages/TyreFleetMap"));
const TyreHistoryPage = lazy(() => import("@/pages/TyreHistoryPage"));
const TyrePerformanceDashboard = lazy(() => import("@/pages/TyrePerformanceDashboard"));
const TyreStores = lazy(() => import("@/pages/TyreStores"));
const VehicleTyreView = lazy(() => import("@/pages/VehicleTyreView"));
const VehicleTyreViewA = lazy(() => import("@/pages/VehicleTyreViewA"));
const TyreMobilePage = lazy(() => import("@/pages/mobile/TyreMobilePage"));

/* =========================
 *  WORKSHOP
 * ========================= */
const WorkshopPage = lazy(() => import("@/pages/workshop/WorkshopPage"));
const VendorPage = lazy(() => import("@/pages/workshop/VendorPage"));
const StockInventoryPage = lazy(() => import("@/pages/workshop/StockInventoryPage"));
const QRGenerator = lazy(() => import("@/pages/workshop/QRGenerator"));
const QRScannerPage = lazy(() => import("@/pages/workshop/QRScannerPage"));
const PurchaseOrderPage = lazy(() => import("@/pages/workshop/PurchaseOrderPage"));
const JobCardManagement = lazy(() => import("@/pages/JobCardManagement"));
const JobCardKanbanBoard = lazy(() => import("@/pages/JobCardKanbanBoard"));
const InspectionManagement = lazy(() => import("@/pages/InspectionManagement"));
const WorkOrderManagement = lazy(() => import("@/pages/WorkOrderManagement"));

/* =========================
 *  INVENTORY
 * ========================= */
const InventoryDashboard = lazy(() => import("@/pages/InventoryDashboard"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const InventoryReportsPage = lazy(() => import("@/pages/InventoryReportsPage"));
const ReceivePartsPage = lazy(() => import("@/pages/ReceivePartsPage"));
const PartsInventoryPage = lazy(() => import("@/pages/PartsInventoryPage"));
const PartsOrderingPage = lazy(() => import("@/pages/PartsOrderingPage"));

/* =========================
 *  CLIENTS / CRM
 * ========================= */
const ClientDetail = lazy(() => import("@/pages/ClientDetail"));
const ActiveCustomers = lazy(() => import("@/pages/ActiveCustomers"));
const CustomerDashboard = lazy(() => import("@/pages/CustomerDashboard"));
const CustomerReports = lazy(() => import("@/pages/CustomerReports"));

const ClientsRoot = lazy(() => import("@/pages/clients/ClientManagementPage"));
const ClientsActiveCustomers = lazy(() => import("@/pages/clients/ActiveCustomers"));
const AddNewCustomer = lazy(() => import("@/pages/clients/AddNewCustomer"));
const ClientNetworkMap = lazy(() => import("@/pages/clients/ClientNetworkMap"));
const ClientsRetentionMetrics = lazy(() => import("@/pages/clients/RetentionMetrics"));

/* =========================
 *  MAPS / WIALON
 * ========================= */
const WialonDashboard = lazy(() => import("@/pages/WialonDashboard"));
const WialonConfigPage = lazy(() => import("@/pages/WialonConfigPage"));
const WialonUnitsPage = lazy(() => import("@/pages/WialonUnitsPage"));
const FleetManagementPage = lazy(() => import("@/pages/FleetManagementPage"));
const MapsView = lazy(() => import("@/components/Map/MapsView"));
const FleetLocationMapPage = lazy(() => import("@/components/Map/pages/FleetLocationMapPage"));
const Maps = lazy(() => import("@/components/Map/pages/Maps"));

/* =========================
 *  OTHER / TOOLS
 * ========================= */
const IndirectCostBreakdown = lazy(() => import("@/pages/IndirectCostBreakdown"));
const InvoiceApprovalFlow = lazy(() => import("@/pages/InvoiceApprovalFlow"));
const ReportNewIncidentPage = lazy(() => import("@/pages/ReportNewIncidentPage"));
const JobCardDetailView = lazy(() => import("@/pages/PurchaseOrderDetailView")); // you called it PurchaseOrderDetailView.tsx
const PurchaseOrderTracker = lazy(() => import("@/pages/PurchaseOrderTracker"));
const POApprovalSummary = lazy(() => import("@/pages/POApprovalSummary"));
const QAReviewPanel = lazy(() => import("@/pages/QAReviewPanel"));
const PaidInvoices = lazy(() => import("@/pages/PaidInvoices"));
const PendingInvoices = lazy(() => import("@/pages/PendingInvoices"));

/* =========================
 *  NOT FOUND
 * ========================= */
const NotFound = () => <div className="p-6">404 – Page not found</div>;

/* =========================================================================================
 *                                    ROUTE TREE
 * ========================================================================================= */
const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      /* ---- Dashboard / KPIs / Compliance ---- */
      { index: true, element: Load(DashboardPage) },
      { path: "kpis/ytd", element: Load(YearToDateKPIs) },
      {
        path: "compliance",
        children: [
          { index: true, element: Load(ComplianceDashboard) },
          { path: "retention-metrics", element: Load(RetentionMetrics) },
          { path: "vendor-scorecard", element: Load(VendorScorecard) },
          { path: "workshop-analytics", element: Load(WorkshopAnalytics) },
          { path: "workshop-operations", element: Load(WorkshopOperations) },
        ],
      },

      /* ---- Trips ---- */
      {
        path: "trips",
        children: [
          { index: true, element: Load(TripManagementPage) },
          { path: "dashboard", element: Load(TripDashboardPage) },
          { path: "active", element: Load(ActiveTripsPage) },
          { path: "completed", element: Load(CompletedTrips) },
          { path: "flags", element: Load(FlagsInvestigationsPage) },
          { path: "report", element: Load(TripReportPage) },
          { path: "timeline", element: Load(TripTimelinePage) },
          { path: "calendar", element: Load(TripCalendarPage) },
          { path: "load-planning", element: Load(LoadPlanningPage) },
          { path: "load-planning/component", element: Load(LoadPlanningComponentPage) },
          { path: "route-planning", element: Load(RoutePlanningPage) },
          { path: "route-optimization", element: Load(RouteOptimizationPage) },
          { path: "trip-dashboard", element: Load(TripDashboard) },
          { path: "trip-report", element: Load(TripReport) },
          { path: "timeline-live", element: Load(TripTimelineLive) },

          // workflow panels
          { path: "workflow", element: Load(MainTripWorkflow) },
          { path: ":tripId", element: Load(TripDetailsPage) },
          { path: ":tripId/invoicing", element: Load(TripInvoicingPanel) },
          { path: ":tripId/completion", element: Load(TripCompletionPanel) },
          { path: ":tripId/payment-tracking", element: Load(PaymentTrackingPanel) },
          { path: ":tripId/reporting", element: Load(ReportingPanel) },
          { path: ":tripId/system-costs", element: Load(SystemCostGenerator) },
          { path: ":tripId/cost-entry", element: Load(CostEntryForm) },
          { path: ":tripId/flag-investigation", element: Load(FlagInvestigationPanel) },
          { path: "create-load-confirmation", element: Load(CreateLoadConfirmationPage) },
          { path: "form", element: Load(TripFormPage) },
        ],
      },

      /* ---- Diesel / Fuel ---- */
      {
        path: "diesel",
        children: [
          { index: true, element: Load(DieselDashboard) },
          { path: "dashboard-legacy", element: Load(DieselDashboardComponent) },
          { path: "analysis", element: Load(DieselAnalysis) },
          { path: "management", element: Load(DieselManagementPage) },
          { path: "fuel-logs", element: Load(FuelLogsPage) },
          { path: "fuel-theft", element: Load(FuelTheftDetectionPage) },
          { path: "driver-behavior", element: Load(DriverFuelBehaviorPage) },
          { path: "fuel-cards", element: Load(FuelCardManager) },
          { path: "fuel-stations", element: Load(FuelStations) },
          { path: "efficiency-report", element: Load(FuelEfficiencyReport) },
          { path: "cost-analysis", element: Load(CostAnalysis) },
          { path: "budget-planning", element: Load(BudgetPlanning) },
          { path: "carbon-footprint", element: Load(CarbonFootprintCalc) },
          { path: "add-entry", element: Load(AddFuelEntryPage) },
        ],
      },

      /* ---- Drivers ---- */
      {
        path: "drivers",
        children: [
          { index: true, element: Load(DriverManagementPage) },
          { path: "dashboard", element: Load(DriverDashboard) },
          { path: "profiles", element: Load(DriverProfiles) },
          { path: "details/:driverId", element: Load(DriverDetailsPage) },
          { path: "scheduling", element: Load(DriverScheduling) },
          { path: "violations", element: Load(DriverViolations) },
          { path: "license-management", element: Load(LicenseManagement) },
          { path: "performance-analytics", element: Load(PerformanceAnalyticsPage) },
          { path: "safety-scores", element: Load(SafetyScores) },
          { path: "training-records", element: Load(TrainingRecords) },
          { path: "fuel-behavior", element: Load(DriverFuelBehaviorDrivers) },
          { path: "edit/:driverId", element: Load(EditDriver) },
          { path: "behavior", element: Load(DriverBehaviorPage) },
          { path: "add", element: Load(AddNewDriver) },
        ],
      },

      /* ---- Tyres ---- */
      {
        path: "tyres",
        children: [
          { index: true, element: Load(TyreManagementPage) },
          { path: "reference-manager", element: Load(TyreReferenceManagerPage) },
          { path: "add", element: Load(AddNewTyrePage) },
          { path: "fleet-map", element: Load(TyreFleetMap) },
          { path: "history", element: Load(TyreHistoryPage) },
          { path: "performance-dashboard", element: Load(TyrePerformanceDashboard) },
          { path: "stores", element: Load(TyreStores) },
          { path: "vehicle-view", element: Load(VehicleTyreView) },
          { path: "vehicle-view-a", element: Load(VehicleTyreViewA) },
          { path: "mobile", element: Load(TyreMobilePage) },
        ],
      },

      /* ---- Workshop ---- */
      {
        path: "workshop",
        children: [
          { index: true, element: Load(WorkshopPage) },
          { path: "vendors", element: Load(VendorPage) },
          { path: "stock", element: Load(StockInventoryPage) },
          { path: "qr-generator", element: Load(QRGenerator) },
          { path: "qr-scanner", element: Load(QRScannerPage) },
          { path: "purchase-orders", element: Load(PurchaseOrderPage) },
          { path: "job-cards", element: Load(JobCardManagement) },
          { path: "job-cards/kanban", element: Load(JobCardKanbanBoard) },
          { path: "inspections", element: Load(InspectionManagement) },
          { path: "work-orders", element: Load(WorkOrderManagement) },
        ],
      },

      /* ---- Inventory ---- */
      {
        path: "inventory",
        children: [
          { index: true, element: Load(InventoryDashboard) },
          { path: "page", element: Load(InventoryPage) },
          { path: "reports", element: Load(InventoryReportsPage) },
          { path: "receive-parts", element: Load(ReceivePartsPage) },
          { path: "parts", element: Load(PartsInventoryPage) },
          { path: "ordering", element: Load(PartsOrderingPage) },
        ],
      },

      /* ---- Clients / CRM ---- */
      {
        path: "clients",
        children: [
          { index: true, element: Load(ClientsRoot) },
          { path: "active", element: Load(ClientsActiveCustomers) },
          { path: "new", element: Load(AddNewCustomer) },
          { path: "network-map", element: Load(ClientNetworkMap) },
          { path: "retention-metrics", element: Load(ClientsRetentionMetrics) },
          { path: "detail/:clientId", element: Load(ClientDetail) },

          // Older / alias pages (top-level duplicates):
          { path: "dashboard", element: Load(CustomerDashboard) },
          { path: "reports", element: Load(CustomerReports) },
        ],
      },

      /* ---- Invoices ---- */
      {
        path: "invoices",
        children: [
          { index: true, element: Load(InvoiceManagementPage) },
          { path: "dashboard", element: Load(InvoiceDashboard) },
          { path: "templates", element: Load(InvoiceTemplatesPage) },
          { path: "create", element: Load(CreateInvoicePage) },
          { path: "create-quote", element: Load(CreateQuotePage) },
          { path: "pending", element: Load(PendingInvoicesPage) },
          { path: "paid", element: Load(PaidInvoicesPage) },
          { path: "tax-report", element: Load(TaxReportExport) },
          // misc invoice ops
          { path: "approval-flow", element: Load(InvoiceApprovalFlow) },
        ],
      },

      /* ---- Maps / Wialon ---- */
      {
        path: "wialon",
        children: [
          { index: true, element: Load(WialonDashboard) },
          { path: "config", element: Load(WialonConfigPage) },
          { path: "units", element: Load(WialonUnitsPage) },
        ],
      },
      {
        path: "maps",
        children: [
          { index: true, element: Load(MapsView) },
          { path: "fleet-location", element: Load(FleetLocationMapPage) },
          { path: "legacy", element: Load(Maps) },
          { path: "fleet-management", element: Load(FleetManagementPage) },
        ],
      },

      /* ---- Other / Tools ---- */
      { path: "indirect-costs", element: Load(IndirectCostBreakdown) },
      { path: "invoice-approval-summary", element: Load(POApprovalSummary) },
      { path: "purchase-orders/tracker", element: Load(PurchaseOrderTracker) },
      { path: "purchase-orders/:id", element: Load(JobCardDetailView) },
      { path: "paid-invoices", element: Load(PaidInvoices) },
      { path: "pending-invoices", element: Load(PendingInvoices) },
      { path: "qa-review", element: Load(QAReviewPanel) },
      { path: "report-incident", element: Load(ReportNewIncidentPage) },

      /* ---- Backward-compat / top-level duplicates ---- */
      { path: "active-customers", element: Load(ActiveCustomers) },

      /* ---- Catch all ---- */
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;
Next steps
Plug it into App.tsx:

tsx
Copy
Edit
import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "@/config/AppRoutes";
import { RootProviders } from "@/context/RootProviders";

const router = createBrowserRouter(routes);

export default function App() {
  return (
    <RootProviders>
      <RouterProvider router={router} />
    </RootProviders>
  );
}
Hook the Sidebar.tsx to point to these paths using your sidebarConfig.ts. If you want, paste your current sidebar config and I’ll align all paths 1:1 with the route tree above.

If you want code splitting per section (e.g., /trips chunk, /diesel chunk), I can refactor this into route-level lazy modules using React Router’s lazy() API directly on each route object.



src/config/AppRoutes.tsx
tsx
Copy
Edit
import React, { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";

import AppLayout from "@/layout/AppLayout";

// Optional shared UI
import ErrorBoundary from "@/components/ErrorBoundary";

// A tiny Suspense wrapper to avoid repeating the fallback everywhere
const Load = (Comp: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<div className="p-6">Loading…</div>}>
    <Comp />
  </Suspense>
);

/* =========================
 *  DASHBOARD / KPI / COMPLIANCE
 * ========================= */
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const YearToDateKPIs = lazy(() => import("@/pages/YearToDateKPIs"));
const ComplianceDashboard = lazy(() => import("@/pages/ComplianceDashboard"));
const RetentionMetrics = lazy(() => import("@/pages/RetentionMetrics"));
const VendorScorecard = lazy(() => import("@/pages/VendorScorecard"));
const WorkshopAnalytics = lazy(() => import("@/pages/WorkshopAnalytics"));
const WorkshopOperations = lazy(() => import("@/pages/WorkshopOperations"));

/* =========================
 *  TRIPS
 * ========================= */
const TripDashboardPage = lazy(() => import("@/pages/TripDashboardPage"));
const TripManagementPage = lazy(() => import("@/pages/TripManagementPage"));
const TripReportPage = lazy(() => import("@/pages/TripReportPage"));
const TripTimelinePage = lazy(() => import("@/pages/TripTimelinePage"));
const TripCalendarPage = lazy(() => import("@/pages/TripCalendarPage"));
const ActiveTripsPage = lazy(() => import("@/pages/ActiveTripsPage"));
const CompletedTrips = lazy(() => import("@/pages/CompletedTrips"));
const FlagsInvestigationsPage = lazy(() => import("@/pages/FlagsInvestigationsPage"));
const LoadPlanningPage = lazy(() => import("@/pages/LoadPlanningPage"));
const LoadPlanningComponentPage = lazy(() => import("@/pages/LoadPlanningComponentPage"));
const RoutePlanningPage = lazy(() => import("@/pages/RoutePlanningPage"));
const RouteOptimizationPage = lazy(() => import("@/pages/RouteOptimizationPage"));
const TripDashboard = lazy(() => import("@/pages/TripDashboard"));
const TripReport = lazy(() => import("@/components/TripManagement/TripReport"));
const TripTimelineLive = lazy(() => import("@/components/TripManagement/TripTimelineLive"));

// trips/** (workflow panels)
const MainTripWorkflow = lazy(() => import("@/pages/trips/MainTripWorkflow"));
const TripDetailsPage = lazy(() => import("@/pages/trips/TripDetailsPage"));
const TripInvoicingPanel = lazy(() => import("@/pages/trips/TripInvoicingPanel"));
const TripCompletionPanel = lazy(() => import("@/pages/trips/TripCompletionPanel"));
const PaymentTrackingPanel = lazy(() => import("@/pages/trips/PaymentTrackingPanel"));
const ReportingPanel = lazy(() => import("@/pages/trips/ReportingPanel"));
const SystemCostGenerator = lazy(() => import("@/pages/trips/SystemCostGenerator"));
const CostEntryForm = lazy(() => import("@/pages/trips/CostEntryForm"));
const CreateLoadConfirmationPage = lazy(() => import("@/pages/trips/CreateLoadConfirmationPage"));
const FlagInvestigationPanel = lazy(() => import("@/pages/trips/FlagInvestigationPanel"));
const TripFormPage = lazy(() => import("@/pages/trips/TripForm")); // (there is also pages/TripManagementPage.tsx)

/* =========================
 *  INVOICES
 * ========================= */
const InvoiceManagementPage = lazy(() => import("@/pages/invoices/InvoiceManagementPage"));
const InvoiceDashboard = lazy(() => import("@/pages/invoices/InvoiceDashboard"));
const InvoiceTemplatesPage = lazy(() => import("@/pages/invoices/InvoiceTemplatesPage"));
const CreateInvoicePage = lazy(() => import("@/pages/invoices/CreateInvoicePage"));
const CreateQuotePage = lazy(() => import("@/pages/invoices/CreateQuotePage"));
const PendingInvoicesPage = lazy(() => import("@/pages/invoices/PendingInvoicesPage"));
const PaidInvoicesPage = lazy(() => import("@/pages/invoices/PaidInvoicesPage"));
const TaxReportExport = lazy(() => import("@/pages/invoices/TaxReportExport"));

/* =========================
 *  DIESEL / FUEL
 * ========================= */
const DieselDashboard = lazy(() => import("@/pages/DieselDashboard"));
const DieselAnalysis = lazy(() => import("@/pages/DieselAnalysis"));
const DieselDashboardComponent = lazy(() => import("@/pages/diesel/DieselDashboardComponent"));
const DieselManagementPage = lazy(() => import("@/pages/diesel/DieselManagementPage"));
const FuelLogsPage = lazy(() => import("@/pages/diesel/FuelLogs"));
const FuelTheftDetectionPage = lazy(() => import("@/pages/diesel/FuelTheftDetection"));
const DriverFuelBehaviorPage = lazy(() => import("@/pages/diesel/DriverFuelBehavior"));
const FuelCardManager = lazy(() => import("@/pages/diesel/FuelCardManager"));
const FuelStations = lazy(() => import("@/pages/diesel/FuelStations"));
const FuelEfficiencyReport = lazy(() => import("@/pages/diesel/FuelEfficiencyReport"));
const CostAnalysis = lazy(() => import("@/pages/diesel/CostAnalysis"));
const BudgetPlanning = lazy(() => import("@/pages/diesel/BudgetPlanning"));
const CarbonFootprintCalc = lazy(() => import("@/pages/diesel/CarbonFootprintCalc"));
const AddFuelEntryPage = lazy(() => import("@/pages/diesel/AddFuelEntryPage"));

/* =========================
 *  DRIVERS
 * ========================= */
const DriverManagementPage = lazy(() => import("@/pages/drivers/DriverManagementPage"));
const DriverDashboard = lazy(() => import("@/pages/drivers/DriverDashboard"));
const DriverDetailsPage = lazy(() => import("@/pages/drivers/DriverDetailsPage"));
const DriverProfiles = lazy(() => import("@/pages/drivers/DriverProfiles"));
const DriverScheduling = lazy(() => import("@/pages/drivers/DriverScheduling"));
const DriverViolations = lazy(() => import("@/pages/drivers/DriverViolations"));
const LicenseManagement = lazy(() => import("@/pages/drivers/LicenseManagement"));
const PerformanceAnalyticsPage = lazy(() => import("@/pages/drivers/PerformanceAnalytics"));
const SafetyScores = lazy(() => import("@/pages/drivers/SafetyScores"));
const TrainingRecords = lazy(() => import("@/pages/drivers/TrainingRecords"));
const DriverFuelBehaviorDrivers = lazy(() => import("@/pages/drivers/DriverFuelBehavior"));
const EditDriver = lazy(() => import("@/pages/drivers/EditDriver"));
const DriverBehaviorPage = lazy(() => import("@/pages/drivers/DriverBehaviorPage"));
const AddNewDriver = lazy(() => import("@/pages/drivers/AddNewDriver"));

/* =========================
 *  TYRES
 * ========================= */
const TyreManagementPage = lazy(() => import("@/pages/tyres/TyreManagementPage"));
const TyreReferenceManagerPage = lazy(() => import("@/pages/tyres/TyreReferenceManagerPage"));
const AddNewTyrePage = lazy(() => import("@/pages/tyres/AddNewTyrePage"));
const TyreFleetMap = lazy(() => import("@/pages/TyreFleetMap"));
const TyreHistoryPage = lazy(() => import("@/pages/TyreHistoryPage"));
const TyrePerformanceDashboard = lazy(() => import("@/pages/TyrePerformanceDashboard"));
const TyreStores = lazy(() => import("@/pages/TyreStores"));
const VehicleTyreView = lazy(() => import("@/pages/VehicleTyreView"));
const VehicleTyreViewA = lazy(() => import("@/pages/VehicleTyreViewA"));
const TyreMobilePage = lazy(() => import("@/pages/mobile/TyreMobilePage"));

/* =========================
 *  WORKSHOP
 * ========================= */
const WorkshopPage = lazy(() => import("@/pages/workshop/WorkshopPage"));
const VendorPage = lazy(() => import("@/pages/workshop/VendorPage"));
const StockInventoryPage = lazy(() => import("@/pages/workshop/StockInventoryPage"));
const QRGenerator = lazy(() => import("@/pages/workshop/QRGenerator"));
const QRScannerPage = lazy(() => import("@/pages/workshop/QRScannerPage"));
const PurchaseOrderPage = lazy(() => import("@/pages/workshop/PurchaseOrderPage"));
const JobCardManagement = lazy(() => import("@/pages/JobCardManagement"));
const JobCardKanbanBoard = lazy(() => import("@/pages/JobCardKanbanBoard"));
const InspectionManagement = lazy(() => import("@/pages/InspectionManagement"));
const WorkOrderManagement = lazy(() => import("@/pages/WorkOrderManagement"));

/* =========================
 *  INVENTORY
 * ========================= */
const InventoryDashboard = lazy(() => import("@/pages/InventoryDashboard"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const InventoryReportsPage = lazy(() => import("@/pages/InventoryReportsPage"));
const ReceivePartsPage = lazy(() => import("@/pages/ReceivePartsPage"));
const PartsInventoryPage = lazy(() => import("@/pages/PartsInventoryPage"));
const PartsOrderingPage = lazy(() => import("@/pages/PartsOrderingPage"));

/* =========================
 *  CLIENTS / CRM
 * ========================= */
const ClientDetail = lazy(() => import("@/pages/ClientDetail"));
const ActiveCustomers = lazy(() => import("@/pages/ActiveCustomers"));
const CustomerDashboard = lazy(() => import("@/pages/CustomerDashboard"));
const CustomerReports = lazy(() => import("@/pages/CustomerReports"));

const ClientsRoot = lazy(() => import("@/pages/clients/ClientManagementPage"));
const ClientsActiveCustomers = lazy(() => import("@/pages/clients/ActiveCustomers"));
const AddNewCustomer = lazy(() => import("@/pages/clients/AddNewCustomer"));
const ClientNetworkMap = lazy(() => import("@/pages/clients/ClientNetworkMap"));
const ClientsRetentionMetrics = lazy(() => import("@/pages/clients/RetentionMetrics"));

/* =========================
 *  MAPS / WIALON
 * ========================= */
const WialonDashboard = lazy(() => import("@/pages/WialonDashboard"));
const WialonConfigPage = lazy(() => import("@/pages/WialonConfigPage"));
const WialonUnitsPage = lazy(() => import("@/pages/WialonUnitsPage"));
const FleetManagementPage = lazy(() => import("@/pages/FleetManagementPage"));
const MapsView = lazy(() => import("@/components/Map/MapsView"));
const FleetLocationMapPage = lazy(() => import("@/components/Map/pages/FleetLocationMapPage"));
const Maps = lazy(() => import("@/components/Map/pages/Maps"));

/* =========================
 *  OTHER / TOOLS
 * ========================= */
const IndirectCostBreakdown = lazy(() => import("@/pages/IndirectCostBreakdown"));
const InvoiceApprovalFlow = lazy(() => import("@/pages/InvoiceApprovalFlow"));
const ReportNewIncidentPage = lazy(() => import("@/pages/ReportNewIncidentPage"));
const JobCardDetailView = lazy(() => import("@/pages/PurchaseOrderDetailView")); // you called it PurchaseOrderDetailView.tsx
const PurchaseOrderTracker = lazy(() => import("@/pages/PurchaseOrderTracker"));
const POApprovalSummary = lazy(() => import("@/pages/POApprovalSummary"));
const QAReviewPanel = lazy(() => import("@/pages/QAReviewPanel"));
const PaidInvoices = lazy(() => import("@/pages/PaidInvoices"));
const PendingInvoices = lazy(() => import("@/pages/PendingInvoices"));

/* =========================
 *  NOT FOUND
 * ========================= */
const NotFound = () => <div className="p-6">404 – Page not found</div>;

/* =========================================================================================
 *                                    ROUTE TREE
 * ========================================================================================= */
const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      /* ---- Dashboard / KPIs / Compliance ---- */
      { index: true, element: Load(DashboardPage) },
      { path: "kpis/ytd", element: Load(YearToDateKPIs) },
      {
        path: "compliance",
        children: [
          { index: true, element: Load(ComplianceDashboard) },
          { path: "retention-metrics", element: Load(RetentionMetrics) },
          { path: "vendor-scorecard", element: Load(VendorScorecard) },
          { path: "workshop-analytics", element: Load(WorkshopAnalytics) },
          { path: "workshop-operations", element: Load(WorkshopOperations) },
        ],
      },

      /* ---- Trips ---- */
      {
        path: "trips",
        children: [
          { index: true, element: Load(TripManagementPage) },
          { path: "dashboard", element: Load(TripDashboardPage) },
          { path: "active", element: Load(ActiveTripsPage) },
          { path: "completed", element: Load(CompletedTrips) },
          { path: "flags", element: Load(FlagsInvestigationsPage) },
          { path: "report", element: Load(TripReportPage) },
          { path: "timeline", element: Load(TripTimelinePage) },
          { path: "calendar", element: Load(TripCalendarPage) },
          { path: "load-planning", element: Load(LoadPlanningPage) },
          { path: "load-planning/component", element: Load(LoadPlanningComponentPage) },
          { path: "route-planning", element: Load(RoutePlanningPage) },
          { path: "route-optimization", element: Load(RouteOptimizationPage) },
          { path: "trip-dashboard", element: Load(TripDashboard) },
          { path: "trip-report", element: Load(TripReport) },
          { path: "timeline-live", element: Load(TripTimelineLive) },

          // workflow panels
          { path: "workflow", element: Load(MainTripWorkflow) },
          { path: ":tripId", element: Load(TripDetailsPage) },
          { path: ":tripId/invoicing", element: Load(TripInvoicingPanel) },
          { path: ":tripId/completion", element: Load(TripCompletionPanel) },
          { path: ":tripId/payment-tracking", element: Load(PaymentTrackingPanel) },
          { path: ":tripId/reporting", element: Load(ReportingPanel) },
          { path: ":tripId/system-costs", element: Load(SystemCostGenerator) },
          { path: ":tripId/cost-entry", element: Load(CostEntryForm) },
          { path: ":tripId/flag-investigation", element: Load(FlagInvestigationPanel) },
          { path: "create-load-confirmation", element: Load(CreateLoadConfirmationPage) },
          { path: "form", element: Load(TripFormPage) },
        ],
      },

      /* ---- Diesel / Fuel ---- */
      {
        path: "diesel",
        children: [
          { index: true, element: Load(DieselDashboard) },
          { path: "dashboard-legacy", element: Load(DieselDashboardComponent) },
          { path: "analysis", element: Load(DieselAnalysis) },
          { path: "management", element: Load(DieselManagementPage) },
          { path: "fuel-logs", element: Load(FuelLogsPage) },
          { path: "fuel-theft", element: Load(FuelTheftDetectionPage) },
          { path: "driver-behavior", element: Load(DriverFuelBehaviorPage) },
          { path: "fuel-cards", element: Load(FuelCardManager) },
          { path: "fuel-stations", element: Load(FuelStations) },
          { path: "efficiency-report", element: Load(FuelEfficiencyReport) },
          { path: "cost-analysis", element: Load(CostAnalysis) },
          { path: "budget-planning", element: Load(BudgetPlanning) },
          { path: "carbon-footprint", element: Load(CarbonFootprintCalc) },
          { path: "add-entry", element: Load(AddFuelEntryPage) },
        ],
      },

      /* ---- Drivers ---- */
      {
        path: "drivers",
        children: [
          { index: true, element: Load(DriverManagementPage) },
          { path: "dashboard", element: Load(DriverDashboard) },
          { path: "profiles", element: Load(DriverProfiles) },
          { path: "details/:driverId", element: Load(DriverDetailsPage) },
          { path: "scheduling", element: Load(DriverScheduling) },
          { path: "violations", element: Load(DriverViolations) },
          { path: "license-management", element: Load(LicenseManagement) },
          { path: "performance-analytics", element: Load(PerformanceAnalyticsPage) },
          { path: "safety-scores", element: Load(SafetyScores) },
          { path: "training-records", element: Load(TrainingRecords) },
          { path: "fuel-behavior", element: Load(DriverFuelBehaviorDrivers) },
          { path: "edit/:driverId", element: Load(EditDriver) },
          { path: "behavior", element: Load(DriverBehaviorPage) },
          { path: "add", element: Load(AddNewDriver) },
        ],
      },

      /* ---- Tyres ---- */
      {
        path: "tyres",
        children: [
          { index: true, element: Load(TyreManagementPage) },
          { path: "reference-manager", element: Load(TyreReferenceManagerPage) },
          { path: "add", element: Load(AddNewTyrePage) },
          { path: "fleet-map", element: Load(TyreFleetMap) },
          { path: "history", element: Load(TyreHistoryPage) },
          { path: "performance-dashboard", element: Load(TyrePerformanceDashboard) },
          { path: "stores", element: Load(TyreStores) },
          { path: "vehicle-view", element: Load(VehicleTyreView) },
          { path: "vehicle-view-a", element: Load(VehicleTyreViewA) },
          { path: "mobile", element: Load(TyreMobilePage) },
        ],
      },

      /* ---- Workshop ---- */
      {
        path: "workshop",
        children: [
          { index: true, element: Load(WorkshopPage) },
          { path: "vendors", element: Load(VendorPage) },
          { path: "stock", element: Load(StockInventoryPage) },
          { path: "qr-generator", element: Load(QRGenerator) },
          { path: "qr-scanner", element: Load(QRScannerPage) },
          { path: "purchase-orders", element: Load(PurchaseOrderPage) },
          { path: "job-cards", element: Load(JobCardManagement) },
          { path: "job-cards/kanban", element: Load(JobCardKanbanBoard) },
          { path: "inspections", element: Load(InspectionManagement) },
          { path: "work-orders", element: Load(WorkOrderManagement) },
        ],
      },

      /* ---- Inventory ---- */
      {
        path: "inventory",
        children: [
          { index: true, element: Load(InventoryDashboard) },
          { path: "page", element: Load(InventoryPage) },
          { path: "reports", element: Load(InventoryReportsPage) },
          { path: "receive-parts", element: Load(ReceivePartsPage) },
          { path: "parts", element: Load(PartsInventoryPage) },
          { path: "ordering", element: Load(PartsOrderingPage) },
        ],
      },

      /* ---- Clients / CRM ---- */
      {
        path: "clients",
        children: [
          { index: true, element: Load(ClientsRoot) },
          { path: "active", element: Load(ClientsActiveCustomers) },
          { path: "new", element: Load(AddNewCustomer) },
          { path: "network-map", element: Load(ClientNetworkMap) },
          { path: "retention-metrics", element: Load(ClientsRetentionMetrics) },
          { path: "detail/:clientId", element: Load(ClientDetail) },

          // Older / alias pages (top-level duplicates):
          { path: "dashboard", element: Load(CustomerDashboard) },
          { path: "reports", element: Load(CustomerReports) },
        ],
      },

      /* ---- Invoices ---- */
      {
        path: "invoices",
        children: [
          { index: true, element: Load(InvoiceManagementPage) },
          { path: "dashboard", element: Load(InvoiceDashboard) },
          { path: "templates", element: Load(InvoiceTemplatesPage) },
          { path: "create", element: Load(CreateInvoicePage) },
          { path: "create-quote", element: Load(CreateQuotePage) },
          { path: "pending", element: Load(PendingInvoicesPage) },
          { path: "paid", element: Load(PaidInvoicesPage) },
          { path: "tax-report", element: Load(TaxReportExport) },
          // misc invoice ops
          { path: "approval-flow", element: Load(InvoiceApprovalFlow) },
        ],
      },

      /* ---- Maps / Wialon ---- */
      {
        path: "wialon",
        children: [
          { index: true, element: Load(WialonDashboard) },
          { path: "config", element: Load(WialonConfigPage) },
          { path: "units", element: Load(WialonUnitsPage) },
        ],
      },
      {
        path: "maps",
        children: [
          { index: true, element: Load(MapsView) },
          { path: "fleet-location", element: Load(FleetLocationMapPage) },
          { path: "legacy", element: Load(Maps) },
          { path: "fleet-management", element: Load(FleetManagementPage) },
        ],
      },

      /* ---- Other / Tools ---- */
      { path: "indirect-costs", element: Load(IndirectCostBreakdown) },
      { path: "invoice-approval-summary", element: Load(POApprovalSummary) },
      { path: "purchase-orders/tracker", element: Load(PurchaseOrderTracker) },
      { path: "purchase-orders/:id", element: Load(JobCardDetailView) },
      { path: "paid-invoices", element: Load(PaidInvoices) },
      { path: "pending-invoices", element: Load(PendingInvoices) },
      { path: "qa-review", element: Load(QAReviewPanel) },
      { path: "report-incident", element: Load(ReportNewIncidentPage) },

      /* ---- Backward-compat / top-level duplicates ---- */
      { path: "active-customers", element: Load(ActiveCustomers) },

      /* ---- Catch all ---- */
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;
Next steps
Plug it into App.tsx:

tsx
Copy
Edit
import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "@/config/AppRoutes";
import { RootProviders } from "@/context/RootProviders";

const router = createBrowserRouter(routes);

export default function App() {
  return (
    <RootProviders>
      <RouterProvider router={router} />
    </RootProviders>
  );
