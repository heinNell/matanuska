# APppp Fleet Management: Page Navigation Mapping

This document provides a comprehensive mapping between sidebar navigation menu items and the corresponding pages that are loaded in the application.

## Navigation Structure

Each section below represents a top-level navigation item in the sidebar menu, with its child menu items and corresponding page components.

## Dashboard

| Menu Item | Path         | Component             |
| --------- | ------------ | --------------------- |
| Dashboard | `/dashboard` | `pages/DashboardPage` |

## Trip Management

| Menu Item                | Path                             | Component                                |
| ------------------------ | -------------------------------- | ---------------------------------------- |
| Trip Dashboard           | `/trips/dashboard`               | `pages/TripDashboardPage`                |
| Active Trips             | `/trips/active`                  | `pages/ActiveTripsPageEnhanced`          |
| Completed Trips          | `/trips/completed`               | `pages/CompletedTrips`                   |
| Route Planning           | `/trips/route-planning`          | `pages/RoutePlanningPage`                |
| Route Optimization       | `/trips/optimization`            | `pages/RouteOptimizationPage`            |
| Load Planning            | `/trips/load-planning`           | `pages/LoadPlanningPage`                 |
| Load Planning Component  | `/trips/load-planning/component` | `pages/LoadPlanningComponentPage`        |
| Trip Calendar            | `/trips/calendar`                | `pages/TripCalendarPage`                 |
| Trip Timeline            | `/trips/timeline`                | `pages/TripTimelinePage`                 |
| Add New Trip             | `/trips/new`                     | `pages/AddTripPage`                      |
| Trip Workflow            | `/trips/workflow`                | `pages/trips/MainTripWorkflow`           |
| Create Load Confirmation | `/trips/new-load-confirmation`   | `pages/trips/CreateLoadConfirmationPage` |
| Trip Reports             | `/trips/reports`                 | `pages/TripReportPage`                   |
| Missed Loads Tracker     | `/trips/missed-loads`            | `pages/MissedLoadsTracker`               |

## Invoices

| Menu Item          | Path                    | Component                             |
| ------------------ | ----------------------- | ------------------------------------- |
| Dashboard          | `/invoices/dashboard`   | `pages/invoices/InvoiceDashboard`     |
| Create New Invoice | `/invoices/new`         | `pages/invoices/CreateInvoicePage`    |
| Create New Quote   | `/invoices/new-quote`   | `pages/invoices/CreateQuotePage`      |
| Pending Invoices   | `/invoices/pending`     | `pages/invoices/PendingInvoicesPage`  |
| Paid Invoices      | `/invoices/paid`        | `pages/invoices/PaidInvoicesPage`     |
| Invoice Approval   | `/invoices/approval`    | `pages/invoices/InvoiceApprovalFlow`  |
| Invoice Builder    | `/invoices/builder`     | `pages/invoices/InvoiceBuilder`       |
| Invoice Templates  | `/invoices/templates`   | `pages/invoices/InvoiceTemplatesPage` |
| Tax Reports        | `/invoices/tax-reports` | `pages/invoices/TaxReportExport`      |

## Diesel Management

| Menu Item            | Path                    | Component                           |
| -------------------- | ----------------------- | ----------------------------------- |
| Dashboard            | `/diesel/dashboard`     | `pages/DieselDashboard`             |
| Diesel Analysis      | `/diesel/analysis`      | `pages/DieselAnalysis`              |
| Fuel Logs            | `/diesel/fuel-logs`     | `pages/diesel/FuelLogs`             |
| Add New Entry        | `/diesel/add-entry`     | `pages/diesel/AddFuelEntryPage`     |
| Fuel Card Management | `/diesel/fuel-cards`    | `pages/diesel/FuelCardManager`      |
| Fuel Analytics       | `/diesel/efficiency`    | `pages/diesel/FuelEfficiencyReport` |
| Fuel Stations        | `/diesel/stations`      | `pages/diesel/FuelStations`         |
| Cost Analysis        | `/diesel/cost-analysis` | `pages/diesel/CostAnalysis`         |
| Theft Detection      | `/diesel/fuel-theft`    | `pages/diesel/FuelTheftDetection`   |
| Carbon Footprint     | `/diesel/carbon`        | `pages/diesel/CarbonFootprintCalc`  |
| Driver Behavior      | `/diesel/driver-fuel`   | `pages/diesel/DriverFuelBehavior`   |
| Budget Planning      | `/diesel/budget`        | `pages/diesel/BudgetPlanning`       |

## Clients

| Menu Item         | Path                   | Component                                         |
| ----------------- | ---------------------- | ------------------------------------------------- |
| Client Dashboard  | `/clients/dashboard`   | `components/CustomerManagement/CustomerDashboard` |
| Add New Client    | `/clients/new`         | `pages/clients/AddNewCustomer`                    |
| Active Clients    | `/clients/active`      | `pages/clients/ActiveCustomers`                   |
| Client Reports    | `/clients/reports`     | `pages/clients/CustomerReports`                   |
| Retention Metrics | `/customers/retention` | `components/CustomerManagement/RetentionMetrics`  |
| Client Network    | `/clients/network`     | `pages/clients/ClientNetworkMap`                  |

## Drivers

| Menu Item             | Path                     | Component                            |
| --------------------- | ------------------------ | ------------------------------------ |
| Driver Dashboard      | `/drivers/dashboard`     | `pages/drivers/DriverDashboard`      |
| Add New Driver        | `/drivers/new`           | `pages/drivers/AddNewDriver`         |
| Driver Profiles       | `/drivers/profiles`      | `pages/drivers/DriverProfiles`       |
| License Management    | `/drivers/licenses`      | `pages/drivers/LicenseManagement`    |
| Training Records      | `/drivers/training`      | `pages/drivers/TrainingRecords`      |
| Performance Analytics | `/drivers/performance`   | `pages/drivers/PerformanceAnalytics` |
| Scheduling            | `/drivers/scheduling`    | `pages/drivers/DriverScheduling`     |
| Hours of Service      | `/drivers/hours`         | `pages/drivers/HoursOfService`       |
| Violations            | `/drivers/violations`    | `pages/drivers/DriverViolations`     |
| Rewards Program       | `/drivers/rewards`       | `pages/drivers/DriverRewards`        |
| Behavior Monitoring   | `/drivers/behavior`      | `pages/drivers/DriverBehaviorPage`   |
| Safety Scores         | `/drivers/safety-scores` | `pages/drivers/SafetyScores`         |

## Compliance Management

| Menu Item           | Path                             | Component                                 |
| ------------------- | -------------------------------- | ----------------------------------------- |
| Dashboard           | `/compliance/dashboard`          | `pages/compliance/ComplianceDashboard`    |
| DOT Compliance      | `/compliance/dot`                | `pages/compliance/DOTCompliancePage`      |
| Safety Inspections  | `/compliance/safety-inspections` | `pages/compliance/SafetyInspectionsPage`  |
| Incident Management | `/compliance/incidents`          | `pages/compliance/IncidentManagement`     |
| Training Records    | `/compliance/training`           | `pages/compliance/TrainingCompliancePage` |
| Audit Management    | `/compliance/audits`             | `pages/compliance/AuditManagement`        |
| Violations          | `/compliance/violations`         | `pages/compliance/ViolationTracking`      |
| Insurance           | `/compliance/insurance`          | `pages/compliance/InsuranceManagement`    |

## Fleet Analytics

| Menu Item           | Path                           | Component                                |
| ------------------- | ------------------------------ | ---------------------------------------- |
| Dashboard           | `/analytics/dashboard`         | `pages/analytics/AnalyticsDashboard`     |
| KPI Monitoring      | `/analytics/kpi`               | `pages/analytics/AnalyticsInsights`      |
| Year to Date KPIs   | `/analytics/year-to-date-kpis` | `pages/analytics/YearToDateKPIs`         |
| Predictive Analysis | `/analytics/predictive`        | `pages/analytics/PredictiveAnalysisPage` |
| Cost Analytics      | `/analytics/costs`             | `pages/analytics/CostsAnalyticsPage`     |
| ROI Calculator      | `/analytics/roi`               | `pages/analytics/ROICalculatorPage`      |
| Benchmarking        | `/analytics/benchmarks`        | `pages/analytics/VehiclePerformance`     |
| Custom Reports      | `/analytics/custom-reports`    | `pages/analytics/CreateCustomReport`     |

## Workshop Management

| Menu Item             | Path                              | Component                                        |
| --------------------- | --------------------------------- | ------------------------------------------------ |
| Fleet Setup           | `/workshop/fleet-setup`           | `pages/workshop/FleetTable`                      |
| Maintenance Scheduler | `/workshop/maintenance-scheduler` | `pages/workshop/MaintenanceSchedulerPage`        |
| Vehicle Inspection    | `/workshop/vehicle-inspection`    | `pages/vehicle-inspection/VehicleInspectionPage` |
| Parts Inventory       | `/workshop/parts-inventory`       | `pages/workshop/PartsInventoryPage`              |
| Service Requests      | `/workshop/service-requests`      | `pages/workshop/ServiceRequestsPage`             |
| Workshop Planning     | `/workshop/planning`              | `pages/workshop/WorkshopPlanningPage`            |

## Reports

| Menu Item             | Path                      | Component                                |
| --------------------- | ------------------------- | ---------------------------------------- |
| Financial Reports     | `/reports/financial`      | `pages/reports/FinancialReportsPage`     |
| Operations Reports    | `/reports/operations`     | `pages/reports/OperationsReportsPage`    |
| Compliance Reports    | `/reports/compliance`     | `pages/reports/ComplianceReportsPage`    |
| Environmental Reports | `/reports/environmental`  | `pages/reports/EnvironmentalReportsPage` |
| Custom Report Builder | `/reports/custom-builder` | `pages/reports/CustomReportBuilder`      |
| Scheduled Reports     | `/reports/scheduled`      | `pages/reports/ScheduledReportsPage`     |

## Maps & Tracking

| Menu Item            | Path                  | Component                                   |
| -------------------- | --------------------- | ------------------------------------------- |
| Wialon Dashboard     | `/maps/wialon`        | `pages/WialonDashboard`                     |
| Wialon Configuration | `/maps/wialon/config` | `pages/WialonConfigPage`                    |
| Wialon Units         | `/maps/wialon/units`  | `pages/WialonUnitsPage`                     |
| Fleet Management     | `/maps/fleet`         | `pages/FleetManagementPage`                 |
| Fleet Location       | `/maps/fleet-map`     | `components/Map/pages/FleetLocationMapPage` |

## Flags & Investigations

| Menu Item              | Path     | Component                       |
| ---------------------- | -------- | ------------------------------- |
| Flags & Investigations | `/flags` | `pages/FlagsInvestigationsPage` |

## Cost Management

| Menu Item               | Path              | Component                     |
| ----------------------- | ----------------- | ----------------------------- |
| Indirect Cost Breakdown | `/costs/indirect` | `pages/IndirectCostBreakdown` |
| Year to Date KPIs       | `/ytd-kpis`       | `pages/YearToDateKPIs`        |

## Quality Assurance

| Menu Item           | Path              | Component                 |
| ------------------- | ----------------- | ------------------------- |
| QA Review Panel     | `/qa/review`      | `pages/QAReviewPanel`     |
| PO Approval Summary | `/qa/po-approval` | `pages/POApprovalSummary` |

## Procurement

| Menu Item              | Path                        | Component                       |
| ---------------------- | --------------------------- | ------------------------------- |
| Purchase Order Tracker | `/procurement/po-tracker`   | `pages/PurchaseOrderTracker`    |
| Purchase Order Detail  | `/procurement/po/:id`       | `pages/PurchaseOrderDetailView` |
| Report New Incident    | `/procurement/incident/new` | `pages/ReportNewIncidentPage`   |

## Workshop Operations

| Menu Item             | Path                            | Component                    |
| --------------------- | ------------------------------- | ---------------------------- |
| Operations Dashboard  | `/workshop-ops/dashboard`       | `pages/WorkshopOperations`   |
| Workshop Analytics    | `/workshop-ops/analytics`       | `pages/WorkshopAnalytics`    |
| Work Order Management | `/workshop-ops/work-orders`     | `pages/WorkOrderManagement`  |
| Job Card Management   | `/workshop-ops/job-cards`       | `pages/JobCardManagement`    |
| Job Card Kanban Board | `/workshop-ops/job-cards/board` | `pages/JobCardKanbanBoard`   |
| Inspection Management | `/workshop-ops/inspections`     | `pages/InspectionManagement` |

## Tyre Management

| Menu Item       | Path                    | Component                              |
| --------------- | ----------------------- | -------------------------------------- |
| Dashboard       | `/tyres/dashboard`      | `pages/tyres/TyrePerformanceDashboard` |
| Tyre Inspection | `/tyres/inspection`     | `pages/tyres/inspection`               |
| Tyre Inventory  | `/tyres/inventory`      | `pages/tyres/inventory`                |
| Reference Data  | `/tyres/reference-data` | `pages/tyres/TyreReferenceManagerPage` |
| Add New Tyre    | `/tyres/add`            | `pages/tyres/AddNewTyre`               |
| Tyre Reports    | `/tyres/reports`        | `pages/tyres/reports`                  |
| Tyre Stores     | `/tyres/stores`         | `pages/tyres/TyreStoresPage`           |
| Tyre Fleet Map  | `/tyres/fleet-map`      | `pages/tyres/TyreFleetMap`             |
| Tyre History    | `/tyres/history`        | `pages/tyres/TyreHistoryPage`          |

## Inventory Management

| Menu Item         | Path                         | Component                              |
| ----------------- | ---------------------------- | -------------------------------------- |
| Dashboard         | `/inventory/dashboard`       | `pages/inventory/InventoryDashboard`   |
| Stock Management  | `/inventory/stock`           | `pages/inventory/PartsInventoryPage`   |
| Parts Ordering    | `/inventory/ordering`        | `pages/inventory/PartsOrderingPage`    |
| Receive Parts     | `/inventory/receive`         | `pages/inventory/ReceivePartsPage`     |
| Purchase Orders   | `/inventory/purchase-orders` | `pages/inventory/PurchaseOrderTracker` |
| Vendor Management | `/inventory/vendors`         | `pages/inventory/VendorScorecard`      |
| Stock Alerts      | `/inventory/alerts`          | `pages/inventory/StockAlertsPage`      |
| Reports           | `/inventory/reports`         | `pages/inventory/InventoryReportsPage` |

## Mobile Access

| Menu Item   | Path            | Component                     |
| ----------- | --------------- | ----------------------------- |
| Tyre Mobile | `/mobile/tyres` | `pages/mobile/TyreMobilePage` |

## Vehicle Views

| Menu Item                   | Path                               | Component                |
| --------------------------- | ---------------------------------- | ------------------------ |
| Vehicle Tyre View           | `/vehicles/tyre-view/:vehicleId`   | `pages/VehicleTyreView`  |
| Vehicle Tyre View Alternate | `/vehicles/tyre-view-a/:vehicleId` | `pages/VehicleTyreViewA` |

---

## Component Status Notes

1. Some pages may be in development and not fully functional.
2. Component paths in the sidebar configuration indicate the intended import path, but the actual component may be imported from a different location in the AppRoutes.tsx file.
3. When both a parent and child route exist (e.g., `/trips` and `/trips/dashboard`), typically the parent route displays a layout with the child as the default view.
