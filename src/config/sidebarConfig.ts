// Sidebar menu configuration for mapping menu options to routes and components
// APppp Fleet Management – Sidebar mirrors AppRoutes (non-dynamic routes only)
export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  component: string; // import path used by the page component
  icon?: string;
  children?: SidebarItem[]; // hierarchical navigation
  subComponents?: string[]; // optional related components for tooling
}

export const sidebarConfig: SidebarItem[] = [
  // Dashboard and related
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    component: "pages/Dashboard",
    icon: "chart-bar",
    children: [
      {
        id: "ytd-kpis",
        label: "Year to Date KPIs",
        path: "/ytd-kpis",
        component: "pages/analytics/YearToDateKPIs",
      },
      {
        id: "forms-integration",
        label: "Forms Integration",
        path: "/forms-integration",
        component: "pages/FormsIntegrationPage",
      },
      {
        id: "dashboard-consolidated",
        label: "Consolidated Dashboard",
        path: "/dashboard/consolidated",
        component: "pages/dashboard/ConsolidatedDashboard",
      },
      {
        id: "dashboard-wrapper",
        label: "Dashboard Wrapper",
        path: "/dashboard/wrapper",
        component: "pages/dashboard/DashboardWrapper",
      },
      {
        id: "compliance-dashboard",
        label: "Compliance Dashboard",
        path: "/compliance",
        component: "pages/qc/ComplianceDashboard",
      },
    ],
  },

  // Dev utilities removed

  // Trips
  {
    id: "trips",
    label: "Trips",
    path: "/trips",
    component: "pages/trips/TripManager",
    icon: "truck",
    children: [
      {
        id: "trips-dashboard",
        label: "Trip Dashboard",
        path: "/trips/dashboard",
        component: "pages/trips/TripDashboardPage",
      },
      {
        id: "trips-manage",
        label: "Manage",
        path: "/trips/manage",
        component: "pages/trips/TripManager",
      },
      {
        id: "trips-active",
        label: "Active",
        path: "/trips/active",
        component: "pages/trips/TripManager",
      },
      {
        id: "trips-completed",
        label: "Completed",
        path: "/trips/completed",
        component: "pages/trips/TripManager",
      },
      {
        id: "trips-load-planning",
        label: "Load Planning",
        path: "/trips/load-planning",
        component: "pages/Inventory/LoadPlanningPage",
      },
      {
        id: "trips-calendar",
        label: "Calendar",
        path: "/trips/calendar",
        component: "pages/trips/TripManager",
      },
      {
        id: "trips-timeline",
        label: "Timeline",
        path: "/trips/timeline",
        component: "pages/trips/TripTimelinePage",
      },
      {
        id: "trips-report",
        label: "Trip Report",
        path: "/trips/report",
        component: "pages/trips/TripReportPage",
      },
      {
        id: "trips-create-load",
        label: "Create Load Confirmation",
        path: "/trips/create-load-confirmation",
        component: "pages/trips/CreateLoadConfirmationPage",
      },
      {
        id: "trips-cost-entry",
        label: "Cost Entry",
        path: "/trips/cost-entry",
        component: "components/forms/cost/CostForm",
      },
      {
        id: "trips-workflow",
        label: "Workflow",
        path: "/trips/workflow",
        component: "pages/trips/MainTripWorkflow",
      },
      {
        id: "trips-missed-loads",
        label: "Missed Loads",
        path: "/trips/missed-loads",
        component: "pages/trips/TripManager",
      },
    ],
  },

  // Diesel
  {
    id: "diesel",
    label: "Diesel",
    path: "/diesel",
    component: "pages/diesel/DieselDashboard",
    icon: "gas-pump",
    children: [
      {
        id: "diesel-dashboard",
        label: "Dashboard",
        path: "/diesel/dashboard",
        component: "pages/diesel/DieselDashboard",
      },
      {
        id: "diesel-analysis",
        label: "Analysis",
        path: "/diesel/analysis",
        component: "pages/diesel/DieselAnalysis",
      },
      {
        id: "diesel-manage",
        label: "Manage",
        path: "/diesel/manage",
        component: "pages/diesel/DieselManagementPage",
      },
      {
        id: "diesel-fuel-logs",
        label: "Fuel Logs",
        path: "/diesel/fuel-logs",
        component: "pages/diesel/FuelLogs",
      },
      {
        id: "diesel-integrated",
        label: "Integrated",
        path: "/diesel/integrated",
        component: "pages/diesel/DieselIntegratedPage",
      },
      {
        id: "diesel-fuel-theft",
        label: "Fuel Theft",
        path: "/diesel/fuel-theft",
        component: "pages/diesel/FuelTheftDetection",
      },
      {
        id: "diesel-driver-fuel",
        label: "Driver Fuel",
        path: "/diesel/driver-fuel",
        component: "pages/diesel/DriverFuelBehavior",
      },
      {
        id: "diesel-efficiency",
        label: "Efficiency",
        path: "/diesel/efficiency",
        component: "pages/diesel/FuelEfficiencyReport",
      },
      {
        id: "diesel-fuel-cards",
        label: "Fuel Cards",
        path: "/diesel/fuel-cards",
        component: "pages/diesel/FuelCardManager",
      },
      {
        id: "diesel-budget",
        label: "Budget",
        path: "/diesel/budget",
        component: "pages/diesel/BudgetPlanning",
      },
      {
        id: "diesel-carbon",
        label: "Carbon",
        path: "/diesel/carbon",
        component: "pages/diesel/CarbonFootprintCalc",
      },
      {
        id: "diesel-cost-analysis",
        label: "Cost Analysis",
        path: "/diesel/cost-analysis",
        component: "pages/diesel/CostAnalysis",
      },
      {
        id: "diesel-stations",
        label: "Stations",
        path: "/diesel/stations",
        component: "pages/diesel/FuelStations",
      },
      {
        id: "diesel-add-fuel",
        label: "Add Fuel",
        path: "/diesel/add-fuel",
        component: "pages/diesel/AddFuelEntryPage",
      },
      {
        id: "diesel-add-fuel-wrapper",
        label: "Add Fuel (Wrapper)",
        path: "/diesel/add-fuel-wrapper",
        component: "pages/diesel/AddFuelEntryPageWrapper",
      },
      {
        id: "diesel-component-dashboard",
        label: "Component Dashboard",
        path: "/diesel/component-dashboard",
        component: "pages/diesel/DieselDashboardComponent",
      },
    ],
  },

  // Drivers
  {
    id: "drivers",
    label: "Drivers",
    path: "/drivers",
    component: "pages/drivers/DriverManagementPage",
    icon: "id-badge",
    children: [
      {
        id: "drivers-dashboard",
        label: "Dashboard",
        path: "/drivers/dashboard",
        component: "pages/drivers/DriverManagementPage",
      },
      {
        id: "drivers-profiles",
        label: "Profiles",
        path: "/drivers/profiles",
        component: "pages/drivers/DriverProfiles",
      },
      {
        id: "drivers-integrated",
        label: "Integrated",
        path: "/drivers/integrated",
        component: "pages/drivers/DriverManagementPageIntegrated",
      },
      {
        id: "drivers-manage",
        label: "Manage",
        path: "/drivers/manage",
        component: "pages/drivers/DriverManagementPage",
      },
      {
        id: "drivers-behavior",
        label: "Behavior",
        path: "/drivers/behavior",
        component: "pages/drivers/DriverBehaviorPage",
      },
      {
        id: "drivers-safety-scores",
        label: "Safety Scores",
        path: "/drivers/safety-scores",
        component: "pages/drivers/SafetyScores",
      },
      {
        id: "drivers-performance-analytics",
        label: "Performance Analytics",
        path: "/drivers/performance-analytics",
        component: "pages/drivers/PerformanceAnalytics",
      },
      {
        id: "drivers-rewards",
        label: "Rewards",
        path: "/drivers/rewards",
        component: "pages/drivers/DriverRewards",
      },
      {
        id: "drivers-scheduling",
        label: "Scheduling",
        path: "/drivers/scheduling",
        component: "pages/drivers/DriverScheduling",
      },
      {
        id: "drivers-violations",
        label: "Violations",
        path: "/drivers/violations",
        component: "pages/drivers/DriverViolations",
      },
      {
        id: "drivers-hours-of-service",
        label: "Hours of Service",
        path: "/drivers/hours-of-service",
        component: "pages/drivers/HoursOfService",
      },
      {
        id: "drivers-training",
        label: "Training",
        path: "/drivers/training",
        component: "pages/drivers/TrainingRecords",
      },
      {
        id: "drivers-licenses",
        label: "Licenses",
        path: "/drivers/licenses",
        component: "pages/drivers/LicenseManagement",
      },
      {
        id: "drivers-add",
        label: "Add Driver",
        path: "/drivers/add",
        component: "pages/drivers/AddEditDriverPage",
      },
      {
        id: "drivers-add-new",
        label: "Add New (Legacy)",
        path: "/drivers/add-new",
        component: "pages/drivers/AddNewDriverPage",
      },
      {
        id: "drivers-management-wrapper",
        label: "Management Wrapper",
        path: "/drivers/management-wrapper",
        component: "pages/drivers/DriverManagementWrapper",
      },
    ],
  },

  // Clients
  {
    id: "clients",
    label: "Clients",
    path: "/clients",
    component: "pages/clients/ActiveCustomers",
    icon: "users",
    children: [
      {
        id: "clients-integrated",
        label: "Integrated",
        path: "/clients/integrated",
        component: "pages/clients/ClientManagementPageIntegrated",
      },
      {
        id: "clients-manage",
        label: "Manage",
        path: "/clients/manage",
        component: "pages/clients/ClientManagementPageIntegrated",
      },
      {
        id: "clients-dashboard",
        label: "Dashboard",
        path: "/clients/dashboard",
        component: "pages/clients/CustomerDashboard",
      },
      {
        id: "clients-reports",
        label: "Reports",
        path: "/clients/reports",
        component: "pages/clients/CustomerReports",
      },
      {
        id: "clients-active",
        label: "Active",
        path: "/clients/active",
        component: "pages/clients/ActiveCustomers",
      },
      {
        id: "clients-retention",
        label: "Retention",
        path: "/clients/retention",
        component: "pages/clients/CustomerRetentionDashboard",
      },
      {
        id: "clients-add",
        label: "Add Client",
        path: "/clients/add",
        component: "pages/clients/AddNewCustomer",
      },
      {
        id: "clients-network-map",
        label: "Network Map",
        path: "/clients/network-map",
        component: "pages/clients/ClientNetworkMap",
      },
      {
        id: "clients-management-original",
        label: "Management (Original)",
        path: "/clients/management-original",
        component: "pages/clients/ClientManagementPage",
      },
    ],
  },

  // Forms Test (developer)
  {
    id: "forms-test",
    label: "Forms Test",
    path: "/forms-test",
    component: "pages/dashboard/FormsTestWrapper",
    children: [
      {
        id: "forms-test-drivers",
        label: "Drivers Form",
        path: "/forms-test/drivers",
        component: "pages/drivers/DriverManagementPage",
      },
      {
        id: "forms-test-clients",
        label: "Clients Form",
        path: "/forms-test/clients",
        component: "pages/clients/ClientManagementPageIntegrated",
      },
    ],
  },

  // Invoices
  {
    id: "invoices",
    label: "Invoices",
    path: "/invoices",
    component: "pages/invoices/InvoiceDashboard",
    icon: "file-invoice",
    children: [
      {
        id: "invoices-manage",
        label: "Manage",
        path: "/invoices/manage",
        component: "pages/invoices/InvoiceManagementPage",
      },
      {
        id: "invoices-builder",
        label: "Builder",
        path: "/invoices/builder",
        component: "pages/invoices/InvoiceBuilder",
      },
      {
        id: "invoices-create",
        label: "Create",
        path: "/invoices/create",
        component: "pages/invoices/CreateInvoicePage",
      },
      {
        id: "invoices-quote",
        label: "Quote",
        path: "/invoices/quote",
        component: "pages/invoices/CreateQuotePage",
      },
      {
        id: "invoices-pending",
        label: "Pending",
        path: "/invoices/pending",
        component: "pages/invoices/PendingInvoicesPage",
      },
      {
        id: "invoices-paid",
        label: "Paid",
        path: "/invoices/paid",
        component: "pages/invoices/PaidInvoicesPage",
      },
      {
        id: "invoices-templates",
        label: "Templates",
        path: "/invoices/templates",
        component: "pages/invoices/InvoiceTemplatesPage",
      },
      {
        id: "invoices-tax-export",
        label: "Tax Export",
        path: "/invoices/tax-export",
        component: "pages/invoices/TaxReportExport",
      },
      {
        id: "invoices-approval-flow",
        label: "Approval Flow",
        path: "/invoices/approval-flow",
        component: "pages/invoices/InvoiceApprovalFlow",
      },
      {
        id: "invoices-paid-component",
        label: "Paid (Component)",
        path: "/invoices/paid-invoices-component",
        component: "pages/invoices/PaidInvoices",
      },
      {
        id: "invoices-pending-component",
        label: "Pending (Component)",
        path: "/invoices/pending-invoices-component",
        component: "pages/invoices/PendingInvoices",
      },
    ],
  },

  // Workshop / Inventory
  {
    id: "workshop",
    label: "Workshop",
    path: "/workshop",
    component: "pages/workshop/WorkshopPage",
    icon: "wrench",
    children: [
      {
        id: "workshop-operations",
        label: "Operations",
        path: "/workshop/operations",
        component: "pages/workshop/WorkshopOperations",
      },
      {
        id: "workshop-analytics",
        label: "Analytics",
        path: "/workshop/analytics",
        component: "pages/workshop/WorkshopAnalytics",
      },
      {
        id: "workshop-work-orders",
        label: "Work Orders",
        path: "/workshop/work-orders",
        component: "pages/workshop/WorkOrderManagement",
      },
      {
        id: "workshop-purchase-orders",
        label: "Purchase Orders",
        path: "/workshop/purchase-orders",
        component: "pages/workshop/PurchaseOrderPage",
      },
      {
        id: "workshop-po-tracker",
        label: "PO Tracker",
        path: "/workshop/po-tracker",
        component: "pages/Inventory/PurchaseOrderTracker",
      },
      {
        id: "workshop-po-detail",
        label: "PO Detail",
        path: "/workshop/po/:id",
        component: "pages/Inventory/PurchaseOrderDetailView",
      },
      {
        id: "workshop-po-approval",
        label: "PO Approval",
        path: "/workshop/po-approval",
        component: "pages/Inventory/POApprovalSummary",
      },
      {
        id: "workshop-qr-generator",
        label: "QR Generator",
        path: "/workshop/qr-generator",
        component: "pages/workshop/QRGenerator",
      },
      {
        id: "workshop-qr-scan",
        label: "QR Scan",
        path: "/workshop/qr-scan",
        component: "pages/workshop/QRScannerPage",
      },
      {
        id: "workshop-stock",
        label: "Stock",
        path: "/workshop/stock",
        component: "pages/workshop/StockInventoryPage",
      },
      {
        id: "workshop-vendors",
        label: "Vendors",
        path: "/workshop/vendors",
        component: "pages/workshop/VendorPage",
      },
      {
        id: "workshop-inventory",
        label: "Inventory",
        path: "/workshop/inventory",
        component: "pages/Inventory/InventoryPage",
      },
      {
        id: "workshop-inventory-dashboard",
        label: "Inventory Dashboard",
        path: "/workshop/inventory-dashboard",
        component: "pages/Inventory/InventoryDashboard",
      },
      {
        id: "workshop-inventory-reports",
        label: "Inventory Reports",
        path: "/workshop/inventory-reports",
        component: "pages/Inventory/InventoryReportsPage",
      },
      {
        id: "workshop-parts",
        label: "Parts",
        path: "/workshop/parts",
        component: "pages/Inventory/PartsInventoryPage",
      },
      {
        id: "workshop-parts-ordering",
        label: "Parts Ordering",
        path: "/workshop/parts-ordering",
        component: "pages/Inventory/PartsOrderingPage",
      },
      {
        id: "workshop-parts-receive",
        label: "Receive Parts",
        path: "/workshop/parts-receive",
        component: "pages/Inventory/ReceivePartsPage",
      },
      {
        id: "workshop-job-cards",
        label: "Job Cards",
        path: "/workshop/job-cards",
        component: "pages/workshop/JobCardManagement",
      },
      {
        id: "workshop-job-cards-new",
        label: "New Job Card",
        path: "/workshop/job-cards/new",
        component: "pages/workshop/NewJobCardPage",
      },
      {
        id: "workshop-job-cards-board",
        label: "Job Card Board",
        path: "/workshop/job-cards/board",
        component: "pages/workshop/JobCardKanbanBoard",
      },
      {
        id: "workshop-inspections",
        label: "Inspections",
        path: "/workshop/inspections",
        component: "pages/workshop/InspectionManagement",
      },
      {
        id: "workshop-qa",
        label: "QA Review",
        path: "/workshop/qa",
        component: "pages/qc/QAReviewPanel",
      },
      {
        id: "workshop-incident-new",
        label: "Report Incident",
        path: "/workshop/incident/new",
        component: "pages/workshop/ReportNewIncidentPage",
      },
      {
        id: "workshop-action-log",
        label: "Action Log",
        path: "/workshop/action-log",
        component: "pages/qc/ActionLog",
      },
    ],
  },

  // Tyres
  {
    id: "tyres",
    label: "Tyres",
    path: "/tyres",
    component: "pages/tyres/TyreManagementPage",
    icon: "circle-stack",
    children: [
      {
        id: "tyres-manage",
        label: "Manage",
        path: "/tyres/manage",
        component: "pages/tyres/TyreManagementPage",
      },
      {
        id: "tyres-reference",
        label: "Reference",
        path: "/tyres/reference",
        component: "pages/tyres/TyreReferenceManagerPage",
      },
      {
        id: "tyres-performance",
        label: "Performance",
        path: "/tyres/performance",
        component: "pages/tyres/TyrePerformanceDashboard",
      },
      {
        id: "tyres-history",
        label: "History",
        path: "/tyres/history",
        component: "pages/tyres/TyreHistoryPage",
      },
      {
        id: "tyres-fleet-map",
        label: "Fleet Map",
        path: "/tyres/fleet-map",
        component: "pages/tyres/TyreFleetMap",
      },
      {
        id: "tyres-stores",
        label: "Stores",
        path: "/tyres/stores",
        component: "pages/tyres/TyreStores",
      },
      {
        id: "tyres-vehicle-view",
        label: "Vehicle View",
        path: "/tyres/vehicle-view",
        component: "pages/tyres/VehicleTyreView",
      },
      {
        id: "tyres-mobile",
        label: "Mobile",
        path: "/tyres/mobile",
        component: "pages/mobile/TyreMobilePage",
      },
      {
        id: "tyres-vehicle-view-a",
        label: "Vehicle View A",
        path: "/tyres/vehicle-view-a",
        component: "pages/tyres/VehicleTyreViewA",
      },
      {
        id: "tyres-inventory",
        label: "Inventory",
        path: "/tyres/inventory",
        component: "pages/tyres/TyreInventoryDashboard",
      },
    ],
  },

  // Analytics
  {
    id: "analytics",
    label: "Analytics",
    path: "/analytics",
    component: "pages/analytics/PerformanceAnalytics",
    icon: "chart-line",
    children: [
      {
        id: "analytics-vendor-scorecard",
        label: "Vendor Scorecard",
        path: "/analytics/vendor-scorecard",
        component: "pages/Inventory/VendorScorecard",
      },
      {
        id: "analytics-dashboard",
        label: "Dashboard",
        path: "/analytics/dashboard",
        component: "pages/analytics/AnalyticsDashboard",
      },
      {
        id: "analytics-main-dashboard",
        label: "Main Dashboard",
        path: "/analytics/main-dashboard",
        component: "pages/analytics/DashboardPage",
      },
      {
        id: "analytics-fleet",
        label: "Fleet",
        path: "/analytics/fleet",
        component: "pages/analytics/FleetAnalyticsPage",
      },
    ],
  },

  // Maps & Wialon
  {
    id: "maps",
    label: "Maps",
    path: "/maps",
    component: "pages/maps/Maps",
    icon: "map-marked-alt",
    children: [
      {
        id: "maps-dashboard",
        label: "Maps Dashboard",
        path: "/maps/dashboard",
        component: "pages/maps/MapsDashboardPage",
      },
      {
        id: "maps-suite",
        label: "Maps Suite",
        path: "/maps/suite",
        component: "pages/maps/MapsSuitePage",
      },

      {
        id: "wialon-dashboard",
        label: "Wialon Dashboard",
        path: "/maps/wialon",
        component: "pages/wialon/WialonDashboard",
      },
      {
        id: "wialon-config",
        label: "Wialon Config",
        path: "/maps/wialon/config",
        component: "pages/wialon/WialonConfigPage",
      },
      {
        id: "wialon-units",
        label: "Wialon Units",
        path: "/maps/wialon/units",
        component: "pages/wialon/WialonUnitsPage",
      },
      {
        id: "wialon-suite",
        label: "Wialon Suite",
        path: "/maps/wialon/suite",
        component: "pages/wialon/WialonSuitePage",
      },
      {
        id: "wialon-tracking",
        label: "Wialon Tracking",
        path: "/maps/wialon/tracking",
        component: "pages/wialon/WialonTrackingPage",
      },
      {
        id: "wialon-component",
        label: "Wialon Component",
        path: "/maps/wialon/component",
        component: "pages/wialon/WialonMapComponent",
      },
      {
        id: "wialon-map-dashboard",
        label: "Wialon Map Dashboard",
        path: "/maps/wialon/map-dashboard",
        component: "pages/wialon/WialonMapDashboard",
      },
      {
        id: "wialon-map-page",
        label: "Wialon Map Page",
        path: "/maps/wialon/map-page",
        component: "pages/wialon/WialonMapPage",
      },

      {
        id: "maps-fleet",
        label: "Fleet",
        path: "/maps/fleet",
        component: "pages/trips/FleetManagementPage",
      },
      {
        id: "maps-fleet-map",
        label: "Fleet Map",
        path: "/maps/fleet-map",
        component: "pages/FleetLocationMapPage",
      },
    ],
  },

  // Singletons and utilities
  {
    id: "flags",
    label: "Flags & Investigations",
    path: "/flags",
    component: "pages/trips/FlagsInvestigationsPage",
    icon: "flag",
  },
  {
    id: "costs-indirect",
    label: "Indirect Costs",
    path: "/costs/indirect",
    component: "pages/trips/IndirectCostBreakdown",
    icon: "money-bill",
  },
  {
    id: "route-planning",
    label: "Route Planning",
    path: "/route-planning",
    component: "pages/trips/RoutePlanningPage",
  },
  {
    id: "route-optimization",
    label: "Route Optimization",
    path: "/route-optimization",
    component: "pages/trips/RouteOptimizationPage",
  },
  {
    id: "trip-calendar",
    label: "Trip Calendar",
    path: "/trip-calendar",
    component: "pages/trips/TripManager",
  },
];

// For CommonJS compatibility with scripts
module.exports = { sidebarConfig };
