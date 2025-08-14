# MAT Application Pages Directory

This document provides a comprehensive listing of all pages in the application, organized by directory and sidebar menu visibility.

## Table of Contents

- [Sidebar Menu Structure](#sidebar-menu-structure)
- [Pages by Directory](#pages-by-directory)
  - [Root Pages](#root-pages)
  - [Analytics Pages](#analytics-pages)
  - [Clients Pages](#clients-pages)
  - [Dashboard Pages](#dashboard-pages)
  - [Diesel Pages](#diesel-pages)
  - [Drivers Pages](#drivers-pages)
  - [Examples Pages](#examples-pages)
  - [Inventory Pages](#inventory-pages)
  - [Invoices Pages](#invoices-pages)
  - [Mobile Pages](#mobile-pages)
  - [QC (Quality Control) Pages](#qc-quality-control-pages)
  - [Trips Pages](#trips-pages)
  - [Tyres Pages](#tyres-pages)
  - [Wialon Pages](#wialon-pages)
  - [Workshop Pages](#workshop-pages)
- [Potential Duplicate Pages](#potential-duplicate-pages)
- [Recommendations for Consolidation](#recommendations-for-consolidation)

## Sidebar Menu Structure

The application's sidebar menu is organized into the following categories, each containing links to various pages:

### 1. Dashboard Menu
- **Main Dashboard** → `/dashboard`
- **Consolidated Dashboard** → `/dashboard/consolidated`
- **Dashboard Wrapper** → `/dashboard/wrapper`
- **Forms Integration** → `/forms-integration`

### 2. Trips Menu
- **Trip Dashboard** → `/trips/dashboard`
- **Active Trips** → `/trips/active`
- **Completed Trips** → `/trips/completed`
- **Trip Calendar** → `/trips/calendar`
- **Trip Timeline** → `/trips/timeline`
- **Trip Reports** → `/trips/report`
- **Load Planning (Inventory)** → `/trips/load-planning`
- **Load Planning Component** → `/trips/load-planning/component`
- **Route Planning** → `/route-planning`
- **Route Optimization** → `/route-optimization`
- **Workflow** → `/trips/workflow`
- **Missed Loads** → `/trips/missed-loads`
- **Trip Details** → `/trips/:tripId`
- **Trip Management** → `/trips/manage`
- **Trip Management Integrated** → `/trips/management-integrated`
- **Flag Investigations** → `/flags`
- **System Costs** → `/trips/system-costs/:tripId`
- **Payment Tracking** → `/trips/payments/:tripId`
- **Reporting Panel** → `/trips/reports/:tripId`
- **Invoicing Panel** → `/trips/invoicing/:tripId`
- **Completion Panel** → `/trips/completion/:tripId`
- **Flag Investigation Panel** → `/trips/flags/:tripId`
- **Cost Entry Form** → `/trips/cost-entry`
- **Create Load Confirmation** → `/trips/create-load-confirmation`
- **Flag Resolution Modal** → `/trips/flag-resolution-modal`
- **Indirect Cost Breakdown** → `/costs/indirect`
- **Fleet Management** → `/maps/fleet`

### 3. Diesel Menu
- **Diesel Dashboard** → `/diesel/dashboard`
- **Diesel Analysis** → `/diesel/analysis`
- **Diesel Management** → `/diesel/manage`
- **Fuel Logs** → `/diesel/fuel-logs`
- **Diesel Integrated** → `/diesel/integrated`
- **Fuel Theft Detection** → `/diesel/fuel-theft`
- **Driver Fuel Behavior** → `/diesel/driver-fuel`
- **Fuel Efficiency Report** → `/diesel/efficiency`
- **Fuel Card Manager** → `/diesel/fuel-cards`
- **Budget Planning** → `/diesel/budget`
- **Carbon Footprint Calc** → `/diesel/carbon`
- **Cost Analysis** → `/diesel/cost-analysis`
- **Fuel Stations** → `/diesel/stations`
- **Add Fuel Entry** → `/diesel/add-fuel`
- **Add Fuel Entry Wrapper** → `/diesel/add-fuel-wrapper`
- **Diesel Component Dashboard** → `/diesel/component-dashboard`

### 4. Clients Menu
- **Client Management** → `/clients/manage`
- **Client Management Integrated** → `/clients/integrated`
- **Client Network Map** → `/clients/network-map`
- **Customer Dashboard** → `/clients/dashboard`
- **Customer Reports** → `/clients/reports`
- **Active Customers** → `/clients/active`
- **Client Detail** → `/clients/detail/:id`
- **Retention Metrics** → `/clients/retention`
- **Add New Customer** → `/clients/add`
- **Client Management Original** → `/clients/management-original`
- **Client Selection Example** → `/examples/client-selection`

### 5. Drivers Menu
- **Driver Management** → `/drivers/manage`
- **Driver Dashboard** → `/drivers/dashboard`
- **Driver Profiles** → `/drivers/profiles`
- **Driver Management Integrated** → `/drivers/integrated`
- **Driver Details** → `/drivers/profiles/:id`
- **Driver Behavior** → `/drivers/behavior`
- **Safety Scores** → `/drivers/safety-scores`
- **Performance Analytics** → `/drivers/performance-analytics`
- **Driver Rewards** → `/drivers/rewards`
- **Driver Scheduling** → `/drivers/scheduling`
- **Driver Violations** → `/drivers/violations`
- **Hours of Service** → `/drivers/hours-of-service`
- **Training Records** → `/drivers/training`
- **License Management** → `/drivers/licenses`
- **Add Driver** → `/drivers/add`
- **Edit Driver** → `/drivers/edit/:id`
- **Add New Driver** → `/drivers/add-new`
- **Driver Details View** → `/drivers/details-view/:id`
- **Driver Management Wrapper** → `/drivers/management-wrapper`
- **Edit Driver Page** → `/drivers/edit-driver-page/:id`

### 6. Invoices Menu
- **Invoice Dashboard** → `/invoices`
- **Invoice Management** → `/invoices/manage`
- **Invoice Builder** → `/invoices/builder`
- **Create Invoice** → `/invoices/create`
- **Create Quote** → `/invoices/quote`
- **Pending Invoices** → `/invoices/pending`
- **Paid Invoices** → `/invoices/paid`
- **Invoice Templates** → `/invoices/templates`
- **Tax Report Export** → `/invoices/tax-export`
- **Invoice Approval Flow** → `/invoices/approval-flow`
- **Paid Invoices Component** → `/invoices/paid-invoices-component`
- **Pending Invoices Component** → `/invoices/pending-invoices-component`

### 7. Workshop Menu
- **Workshop Overview** → `/workshop`
- **Job Cards** → `/workshop/job-cards`
- **Job Card Kanban Board** → `/workshop/job-cards/board`
- **Inspections** → `/workshop/inspections`
- **Workshop Operations** → `/workshop/operations`
- **Workshop Analytics** → `/workshop/analytics`
- **Work Order Management** → `/workshop/work-orders`
- **Purchase Orders** → `/workshop/purchase-orders`
- **PO Tracker** → `/workshop/po-tracker`
- **PO Detail View** → `/workshop/po/:id`
- **PO Approval Summary** → `/workshop/po-approval`
- **QR Generator** → `/workshop/qr-generator`
- **QR Scanner** → `/workshop/qr-scan`
- **Stock Inventory** → `/workshop/stock`
- **Vendors** → `/workshop/vendors`
- **Report New Incident** → `/workshop/incident/new`
- **Action Log (QC)** → `/workshop/action-log`
- **QA Review Panel (QC)** → `/workshop/qa`
- **QA Review Panel Container (QC)** → `/workshop/qa-review-container`

### 8. Tyres Menu
- **Tyre Management** → `/tyres/manage`
- **Tyre Performance Dashboard** → `/tyres/performance`
- **Tyre Reference Manager** → `/tyres/reference`
- **Tyre History** → `/tyres/history`
- **Tyre Fleet Map** → `/tyres/fleet-map`
- **Tyre Stores** → `/tyres/stores`
- **Vehicle Tyre View** → `/tyres/vehicle-view`
- **Mobile Tyre Page** → `/tyres/mobile`
- **Vehicle Tyre View A** → `/tyres/vehicle-view-a`

### 9. Inventory Menu
- **Inventory Dashboard** → `/inventory/dashboard`
- **Inventory Reports** → `/inventory/reports`
- **Inventory Page** → `/workshop/inventory`
- **Parts Inventory** → `/workshop/parts`
- **Parts Ordering** → `/workshop/parts-ordering`
- **Receive Parts** → `/workshop/parts-receive`

### 10. Analytics Menu
- **Analytics Dashboard** → `/analytics/dashboard`
- **Year-to-Date KPIs** → `/ytd-kpis`
- **Performance Analytics** → `/analytics`
- **Vendor Scorecard** → `/analytics/vendor-scorecard`
- **Fleet Analytics** → `/analytics/fleet`
- **Main Analytics Dashboard** → `/analytics/main-dashboard`
- **Compliance Dashboard (QC)** → `/compliance`

### 11. Wialon & Maps Menu
- **Wialon Dashboard** → `/maps/wialon`
- **Wialon Units** → `/maps/wialon/units`
- **Fleet Location Map** → `/maps/fleet-map`
- **Wialon Config** → `/maps/wialon/config`
- **Wialon Map Component** → `/maps/wialon/component`
- **Wialon Map Dashboard** → `/maps/wialon/map-dashboard`
- **Wialon Map Page** → `/maps/wialon/map-page`

### 12. Forms Testing Menu
- **Forms Test Wrapper** → `/forms-test`
- **Drivers Forms Test** → `/forms-test/drivers`
- **Clients Forms Test** → `/forms-test/clients`

## Pages by Directory

### Root Pages
*Core application pages at the root level (2 files)*

- **Dashboard.tsx** - Main application dashboard
- **FormsIntegrationPage.tsx** - Forms integration testing page

### Analytics Pages
*Pages dedicated to data analytics and reporting (5 files)*

- **AnalyticsDashboard.tsx** - Primary analytics overview
- **DashboardPage.tsx** - Analytics dashboard
- **FleetAnalyticsPage.tsx** - Fleet-specific analytics
- **PerformanceAnalytics.tsx** - Performance metrics and analysis
- **YearToDateKPIs.tsx** - Year-to-date key performance indicators

### Clients Pages
*Client management related pages (9 files)*

- **ActiveCustomers.tsx** - Active client listing
- **AddNewCustomer.tsx** - New client creation interface
- **ClientDetail.tsx** - Detailed client information
- **ClientManagementPage.tsx** - Client management overview
- **ClientManagementPageIntegrated.tsx** - Integrated client management
- **ClientNetworkMap.tsx** - Client network visualization
- **CustomerDashboard.tsx** - Client dashboard
- **CustomerReports.tsx** - Client reporting
- **RetentionMetrics.tsx** - Client retention analysis

### Dashboard Pages
*Dashboard related pages (3 files)*

- **ConsolidatedDashboard.tsx** - Consolidated metrics dashboard
- **DashboardWrapper.tsx** - Dashboard container component
- **FormsTestWrapper.tsx** - Forms testing wrapper

### Diesel Pages
*Fuel and diesel management pages (16 files)*

- **AddFuelEntryPage.tsx** - Add fuel entry interface
- **AddFuelEntryPageWrapper.tsx** - Fuel entry wrapper
- **BudgetPlanning.tsx** - Fuel budget planning
- **CarbonFootprintCalc.tsx** - Carbon footprint calculator
- **CostAnalysis.tsx** - Fuel cost analysis
- **DieselAnalysis.tsx** - Diesel usage analysis
- **DieselDashboard.tsx** - Diesel management dashboard
- **DieselDashboardComponent.tsx** - Dashboard component
- **DieselIntegratedPage.tsx** - Integrated diesel management
- **DieselManagementPage.tsx** - Main diesel management
- **DriverFuelBehavior.tsx** - Driver fuel behavior analysis
- **FuelCardManager.tsx** - Fuel card management
- **FuelEfficiencyReport.tsx** - Fuel efficiency reporting
- **FuelLogs.tsx** - Fuel logs listing
- **FuelStations.tsx** - Fuel stations management
- **FuelTheftDetection.tsx** - Fuel theft detection system

### Drivers Pages
*Driver management related pages (20 files)*

- **AddEditDriverPage.tsx** - Add or edit driver
- **AddNewDriver.tsx** - New driver registration
- **DriverBehaviorPage.tsx** - Driver behavior analysis
- **DriverDashboard.tsx** - Driver dashboard
- **DriverDetails.tsx** - Driver detailed information
- **DriverDetailsPage.tsx** - Driver details page
- **DriverFuelBehavior.tsx** - Driver fuel usage behavior
- **DriverManagementPage.tsx** - Driver management
- **DriverManagementPageIntegrated.tsx** - Integrated driver management
- **DriverManagementWrapper.tsx** - Driver management wrapper
- **DriverProfiles.tsx** - Driver profiles listing
- **DriverRewards.tsx** - Driver rewards system
- **DriverScheduling.tsx** - Driver scheduling
- **DriverViolations.tsx** - Driver violations tracking
- **EditDriver.tsx** - Driver information editing
- **HoursOfService.tsx** - Hours of service tracking
- **LicenseManagement.tsx** - Driver license management
- **PerformanceAnalytics.tsx** - Driver performance analytics
- **SafetyScores.tsx** - Driver safety scores
- **TrainingRecords.tsx** - Driver training records

### Examples Pages
*Example and demonstration pages (1 file)*

- **ClientSelectionExample.jsx** - Client selection example

### Inventory Pages
*Inventory management pages (11 files)*

- **InventoryDashboard.tsx** - Inventory dashboard
- **InventoryPage.tsx** - Main inventory page
- **InventoryReportsPage.tsx** - Inventory reports
- **LoadPlanningPage.tsx** - Load planning
- **PartsInventoryPage.tsx** - Parts inventory
- **PartsOrderingPage.tsx** - Parts ordering interface
- **POApprovalSummary.tsx** - Purchase order approval summary
- **PurchaseOrderDetailView.tsx** - Purchase order details
- **PurchaseOrderTracker.tsx** - Purchase order tracking
- **ReceivePartsPage.tsx** - Parts receiving interface
- **VendorScorecard.tsx** - Vendor performance scorecard

### Invoices Pages
*Invoice and billing related pages (12 files)*

- **CreateInvoicePage.tsx** - Create invoice interface
- **CreateQuotePage.tsx** - Create quote interface
- **InvoiceApprovalFlow.tsx** - Invoice approval workflow
- **InvoiceBuilder.tsx** - Invoice builder
- **InvoiceDashboard.tsx** - Invoice dashboard
- **InvoiceManagementPage.tsx** - Invoice management
- **InvoiceTemplatesPage.tsx** - Invoice templates
- **PaidInvoices.tsx** - Paid invoices listing
- **PaidInvoicesPage.tsx** - Paid invoices page
- **PendingInvoices.tsx** - Pending invoices listing
- **PendingInvoicesPage.tsx** - Pending invoices page
- **TaxReportExport.tsx** - Tax report export

### Mobile Pages
*Mobile-specific pages (1 file)*

- **TyreMobilePage.tsx** - Mobile tyre management

### QC (Quality Control) Pages
*Quality control and assurance pages (4 files)*

- **ActionLog.tsx** - Action log tracking
- **ComplianceDashboard.tsx** - Compliance dashboard
- **QAReviewPanel.tsx** - Quality assurance review panel
- **QAReviewPanelContainer.tsx** - QA review panel container

### Trips Pages
*Trip and route management pages (25 files)*

- **ActiveTrips.tsx** - Active trips listing
- **ActiveTripsPageEnhanced.tsx** - Enhanced active trips view
- **CompletedTrips.tsx** - Completed trips listing
- **CostEntryForm.tsx** - Cost entry form
- **CreateLoadConfirmationPage.tsx** - Load confirmation creation
- **FlagInvestigationPanel.tsx** - Flag investigation panel
- **FlagsInvestigationsPage.tsx** - Flags and investigations
- **FleetManagementPage.tsx** - Fleet management
- **IndirectCostBreakdown.tsx** - Indirect cost breakdown
- **LoadPlanningComponentPage.tsx** - Load planning component
- **MainTripWorkflow.tsx** - Main trip workflow
- **MissedLoadsTracker.tsx** - Missed loads tracking
- **PaymentTrackingPanel.tsx** - Payment tracking panel
- **ReportingPanel.tsx** - Reporting panel
- **RouteOptimizationPage.tsx** - Route optimization
- **RoutePlanningPage.tsx** - Route planning
- **SystemCostGenerator.tsx** - System cost generator
- **TripCalendarPage.tsx** - Trip calendar view
- **TripCompletionPanel.tsx** - Trip completion panel
- **TripDashboardPage.tsx** - Trip dashboard
- **TripDetailsPage.tsx** - Trip details
- **TripInvoicingPanel.tsx** - Trip invoicing panel
- **TripManagementPage.tsx** - Trip management
- **TripReportPage.tsx** - Trip reporting
- **TripTimelinePage.tsx** - Trip timeline visualization

### Tyres Pages
*Tyre management pages (8 files)*

- **TyreFleetMap.tsx** - Tyre fleet mapping
- **TyreHistoryPage.tsx** - Tyre history
- **TyreManagementPage.tsx** - Tyre management
- **TyrePerformanceDashboard.tsx** - Tyre performance dashboard
- **TyreReferenceManagerPage.tsx** - Tyre reference manager
- **TyreStores.tsx** - Tyre stores management
- **VehicleTyreView.tsx** - Vehicle tyre view
- **VehicleTyreViewA.tsx** - Alternative vehicle tyre view

### Wialon Pages
*Wialon integration pages (6 files)*

- **WialonConfigPage.tsx** - Wialon configuration
- **WialonDashboard.tsx** - Wialon dashboard
- **WialonMapComponent.tsx** - Wialon map component
- **WialonMapDashboard.tsx** - Wialon map dashboard
- **WialonMapPage.tsx** - Wialon map page
- **WialonUnitsPage.tsx** - Wialon units page

### Workshop Pages
*Workshop and maintenance related pages (13 files)*

- **InspectionManagement.tsx** - Inspection management
- **JobCardKanbanBoard.tsx** - Job card kanban board
- **JobCardManagement.tsx** - Job card management
- **PurchaseOrderPage.tsx** - Purchase order page
- **QRGenerator.tsx** - QR code generator
- **QRScannerPage.tsx** - QR code scanner
- **ReportNewIncidentPage.tsx** - Report new incident
- **StockInventoryPage.tsx** - Stock inventory
- **VendorPage.tsx** - Vendor management
- **WorkOrderManagement.tsx** - Work order management
- **WorkshopAnalytics.tsx** - Workshop analytics
- **WorkshopOperations.tsx** - Workshop operations
- **WorkshopPage.tsx** - Main workshop page

## Potential Duplicate Pages

Based on the analysis of pages and sidebar menu structure, the following potential duplicate or similar pages could be consolidated:

### Dashboard Related Duplicates
1. **Multiple Dashboard Views**: There are multiple dashboard pages (Main Dashboard, Consolidated Dashboard, Dashboard Wrapper)

### Trips Related Duplicates
1. **Trip Management Pages**: 
   - TripManagementPage.tsx
   - MainTripWorkflow.tsx
   - Trip Management Integrated (sidebar menu item)

2. **Active Trips Pages**:
   - ActiveTrips.tsx
   - ActiveTripsPageEnhanced.tsx

3. **Trip Details Pages**:
   - TripDetailsPage.tsx
   - Trip Details (dynamic path in sidebar)

### Diesel Related Duplicates
1. **Diesel Dashboard Pages**:
   - DieselDashboard.tsx
   - DieselDashboardComponent.tsx

2. **Diesel Management Pages**:
   - DieselManagementPage.tsx
   - DieselIntegratedPage.tsx

### Drivers Related Duplicates
1. **Driver Management Pages**:
   - DriverManagementPage.tsx
   - DriverManagementPageIntegrated.tsx
   - DriverManagementWrapper.tsx

2. **Driver Editing Pages**:
   - EditDriver.tsx
   - AddEditDriverPage.tsx
   - Edit Driver Page (in sidebar)

3. **Driver Details Pages**:
   - DriverDetails.tsx
   - DriverDetailsPage.tsx
   - Driver Details View (in sidebar)

4. **Driver Addition Pages**:
   - AddNewDriver.tsx
   - Add Driver (in sidebar)

### Clients Related Duplicates
1. **Client Management Pages**:
   - ClientManagementPage.tsx
   - ClientManagementPageIntegrated.tsx
   - Client Management Original (in sidebar)

### Invoices Related Duplicates
1. **Paid Invoices Pages**:
   - PaidInvoices.tsx
   - PaidInvoicesPage.tsx
   - Paid Invoices Component (in sidebar)

2. **Pending Invoices Pages**:
   - PendingInvoices.tsx
   - PendingInvoicesPage.tsx
   - Pending Invoices Component (in sidebar)

### Workshop/Inventory Overlap
1. **Inventory Pages in Workshop Menu**:
   - Several inventory-related pages appear under the Workshop menu instead of the Inventory menu

### QC Pages in Workshop Menu
1. **QC Pages Listed in Workshop Menu**:
   - Action Log (QC)
   - QA Review Panel (QC)
   - QA Review Panel Container (QC)

## Recommendations for Consolidation

1. **Standardize Navigation Structure**: 
   - Create a consistent hierarchy where sub-pages are properly nested under their parent category
   - Ensure pages appear in only one section of the sidebar

2. **Consolidate Duplicate Pages**:
   - Merge "Integrated" versions with their base versions
   - Combine similar functionality (e.g., one Driver Edit page instead of multiple)
   - Standardize naming conventions (e.g., consistently use "Page" suffix or not)

3. **Reorganize Menu Structure**:
   - Move QC pages to their own menu section
   - Ensure Inventory pages are consistently under the Inventory menu
   - Consider consolidating maps-related functionality 

4. **Review Component Pages vs. Full Pages**:
   - Determine which "-Component" suffixed files should be components within pages vs. standalone pages
   - Ensure components are properly imported into their parent pages

5. **Implement Proper Routing**:
   - Add navigation links between related pages
   - Consider breadcrumb navigation for clarity

By implementing these recommendations, the application would have a more streamlined structure with fewer duplicate pages, making navigation and maintenance easier.