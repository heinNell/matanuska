# Project Pages Documentation

This document provides a comprehensive overview of all pages in the application, organized by section and functionality.

## Dashboard

- **DashboardPage.tsx**: Main dashboard with overview of key metrics and quick access to major features.

## Trip Management

### Trip Overview Pages
- **trips/Dashboard.tsx**: Trip management dashboard showing key trip metrics, active trips, and upcoming trips.
- **trips/TripManagementPage.tsx**: Central hub for all trip-related operations, including viewing, editing, and creating trips.
- **trips/TripDashboardPage.tsx**: More detailed dashboard with trip statistics and performance metrics.
- **trips/AddTripPage.tsx**: Form for creating new trips with route information, driver assignments, etc.

### Trip Status Pages
- **trips/ActiveTripsPage.tsx**: Display and management of currently active trips.
- **trips/CompletedTripsPage.tsx**: History and details of completed trips.

### Trip Planning & Optimization
- **trips/LoadPlanningPage.tsx**: Planning interface for organizing loads onto vehicles.
- **trips/LoadPlanningComponentPage.tsx**: Component-based approach to load planning.
- **trips/RoutePlanningPage.tsx**: Interface for planning optimal routes for trips.
- **trips/RouteOptimizationPage.tsx**: Advanced route optimization tools using algorithms.
- **trips/RouteOptimization.tsx**: Alternative view for route optimization.

### Trip Analytics & Reporting
- **trips/TripReportPage.tsx**: Comprehensive reports on trip performance and metrics.
- **trips/CostAnalysisPage.tsx**: Analysis of trip costs and financial performance.
- **trips/TripTimelinePage.tsx**: Timeline view of trip progress and events.
- **trips/FleetUtilization.tsx**: Analytics on fleet utilization and efficiency.

### Trip Visualization & Maps
- **trips/Maps.tsx**: Map visualization for trip routes and vehicle locations.
- **trips/GoogleMapPage.tsx**: Google Maps integration for route visualization.
- **trips/FleetLocationMapPage.tsx**: Real-time map of fleet locations.
- **trips/WaypointsPage.tsx**: Management of trip waypoints and stops.

### Trip Calendar & Planning
- **trips/Calendar.tsx**: Calendar view of scheduled trips.
- **trips/TripCalendarPage.tsx**: Enhanced calendar interface for trip scheduling.
- **trips/Templates.tsx**: Management of reusable trip templates.

### Trip Operations
- **trips/DeliveryConfirmations.tsx**: Interface for confirming deliveries and completions.
- **trips/Flags.tsx**: System for flagging and handling trip issues or exceptions.
- **trips/DriverPerformancePage.tsx**: Analysis of driver performance on trips.

## Fleet Management
- **trips/FleetManagementPage.tsx**: Central hub for managing the vehicle fleet.
- **FleetAnalyticsPage.tsx**: Advanced analytics on fleet performance and utilization.

## Customer Management
- **clients/ClientManagementPage.tsx**: Central hub for managing client relationships.
- **clients/CustomerManagementPage.tsx**: Alternative view for customer management.
- **clients/AddNewCustomer.tsx**: Form for adding new customers to the system.
- **clients/ActiveCustomers.tsx**: List and management of active customer accounts.
- **clients/CustomerReports.tsx**: Reporting on customer activity and metrics.

## Driver Management
- **drivers/DriverManagementPage.tsx**: Central hub for managing drivers.
- **drivers/AddNewDriver.tsx**: Form for adding new drivers to the system.
- **drivers/DriverProfiles.tsx**: Detailed driver profile information.
- **drivers/DriverBehaviorPage.tsx**: Analysis and reporting on driver behavior and performance.

## Diesel Management
- **diesel/DieselManagementPage.tsx**: Central hub for tracking and managing diesel usage.
- **diesel/Dashboard.tsx**: Dashboard showing diesel consumption metrics.
- **diesel/AddFuelEntry.tsx**: Form for recording new fuel entries.
- **diesel/FuelLogs.tsx**: Historical logs of fuel consumption.

## Inventory Management

### Parts & Inventory
- **inventory/InventoryPage.tsx**: Main inventory management interface.
- **inventory/PartsInventoryPage.tsx**: Specific focus on parts inventory.
- **inventory/stock.tsx**: Stock level management and tracking.
- **inventory/dashboard.tsx**: Inventory metrics dashboard.
- **inventory/reports.tsx**: Inventory reporting tools.
- **inventory/receive-parts.tsx**: Interface for receiving new parts into inventory.

## Workshop Management
- **WorkshopPage.tsx**: Main workshop management interface.
- **workshop/inspections.tsx**: Vehicle inspection management and records.
- **workshop/new-inspection.tsx**: Form for creating new vehicle inspections.
- **workshop/new-job-card.tsx**: Creation of new job cards for work orders.
- **workshop/request-parts.tsx**: System for workshop to request parts from inventory.
- **workshop/create-purchase-order.tsx**: Creation of purchase orders for needed parts.
- **workshop/vehicle-inspection.tsx**: Detailed vehicle inspection form and process.

## Tyre Management
- **tyres/TyresPage.tsx**: Main page for tyre management.
- **tyres/TyreManagementPage.tsx**: Comprehensive tyre management system.
- **tyres/add-new-tyre.tsx**: Form for adding new tyres to inventory.
- **tyres/inspection.tsx**: Tyre inspection recording and tracking.
- **tyres/inventory.tsx**: Tyre-specific inventory management.
- **tyres/dashboard.tsx**: Tyre metrics and performance dashboard.
- **tyres/reports.tsx**: Tyre-related reporting tools.

## Invoice Management
- **invoices/InvoiceManagementPage.tsx**: Central hub for managing invoices.
- **invoices/Dashboard.tsx**: Invoice metrics and status dashboard.
- **invoices/CreateInvoice.tsx**: Form for creating new invoices.
- **invoices/PendingInvoices.tsx**: Management of pending/unpaid invoices.
- **invoices/PaidInvoices.tsx**: Records of paid invoices.
- **invoices/InvoiceTemplates.tsx**: Management of reusable invoice templates.
- **invoices/LoadConfirmation.tsx**: Load confirmation records for invoicing.

## Compliance Management
- **compliance/ComplianceManagementPage.tsx**: Central hub for compliance management.
- **compliance/IncidentManagement.tsx**: Tracking and management of incidents.
- **compliance/ReportNewIncidentPage.tsx**: Form for reporting new incidents.

## Integration Management
- **integration/SageIntegration.tsx**: Integration with Sage accounting software.
- **integration/PurchaseOrderSync.tsx**: Synchronization of purchase orders with external systems.
- **integration/InventorySageSync.tsx**: Synchronization of inventory with Sage.
- **SageIntegration.tsx**: Alternative/legacy Sage integration page.

## Wialon Integration
- **WialonUnitsPage.tsx**: Management of Wialon GPS tracking units.
- **wialon/WialonConfigPage.tsx**: Configuration for Wialon integration.
- **wialon/WialonUnitsPage.tsx**: Detailed management of Wialon tracking units.
- **wialon/WialonDashboard.tsx**: Dashboard for Wialon tracking data.
- **WialonMapPage.tsx**: Map visualization of Wialon tracking data.

## Administration & Settings
- **SettingsPage.tsx**: Application settings and configuration.
- **NotificationsPage.tsx**: User notification management.
- **AuditLogPage.tsx**: System audit log for tracking changes.
- **admin/SystemInfoPanel.tsx**: System information and diagnostics.
- **OrdersPage.tsx**: Order management interface.

## Demo & Testing Pages
- **demos/UIComponentsDemo.tsx**: Demonstration of UI components.
- **demos/ApplicantInfoDemo.tsx**: Demonstration of applicant info components.
- **MapTestPage.tsx**: Testing page for map functionality.
- **CpkPage.tsx**: Testing or development page.

## Placeholders & Templates
- **GenericPlaceholderPage.tsx**: Generic placeholder for pages under development.
- **GenericPlaceholderPageTailwind.tsx**: Tailwind CSS version of placeholder page.

## Summary

This application has a comprehensive set of pages covering:

1. **Core Operations**:
   - Trip management and optimization
   - Fleet tracking and management
   - Customer relationship management
   - Driver management

2. **Resource Management**:
   - Diesel and fuel tracking
   - Inventory and parts management
   - Tyre management
   - Workshop operations

3. **Financial Operations**:
   - Invoice management
   - Integration with accounting systems
   - Cost analysis and reporting

4. **Compliance & Analytics**:
   - Compliance tracking
   - Performance analytics
   - Reporting tools

The application uses a modular approach, with specific pages dedicated to different operations within each major functional area, providing a comprehensive fleet and transport management solution.

## Empty/Under Development Pages

Based on the previously shared screenshots, these pages are currently under development:
1. Safety Inspections
2. DOT Compliance
3. Audit Management
