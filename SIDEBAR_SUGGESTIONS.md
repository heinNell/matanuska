# Sidebar Entry Suggestions

The following entries can be added to your sidebarConfig.ts file:

```typescript
// Add these to your sidebarConfig array
{
  id: 'dashboard',
  label: 'Dashboard',
  path: '/components/Dashboard',
  component: 'components/Dashboard/Dashboard'
},

{
  id: 'dieseldashboardcomponent',
  label: 'Diesel Dashboard Component',
  path: '/components/DieselManagement',
  component: 'components/DieselManagement/DieselDashboardComponent'
},

{
  id: 'dieseltabbeddashboard',
  label: 'Diesel Tabbed Dashboard',
  path: '/components/DieselManagement',
  component: 'components/DieselManagement/DieselTabbedDashboard'
},

{
  id: 'analyticsdashboard',
  label: 'Analytics Dashboard',
  path: '/components/FleetAnalytics',
  component: 'components/FleetAnalytics/AnalyticsDashboard'
},

{
  id: 'genericplaceholderpage',
  label: 'Generic Placeholder',
  path: '/components',
  component: 'components/GenericPlaceholderPage'
},

{
  id: 'customerretentiondashboard',
  label: 'Customer Retention Dashboard',
  path: '/components/Performance',
  component: 'components/Performance/CustomerRetentionDashboard'
},

{
  id: 'tripdashboard',
  label: 'Trip Dashboard',
  path: '/components/TripManagement',
  component: 'components/TripManagement/TripDashboard'
},

{
  id: 'tyreinventorydashboard',
  label: 'Tyre Inventory Dashboard',
  path: '/components/TyreManagement',
  component: 'components/TyreManagement/TyreInventoryDashboard'
},

{
  id: 'tyremanagement',
  label: 'Tyre Management',
  path: '/components/TyreManagement',
  component: 'components/TyreManagement/TyreManagement'
},

{
  id: 'tyremanagementsystem',
  label: 'Tyre Management System',
  path: '/components/TyreManagement',
  component: 'components/TyreManagement/TyreManagementSystem'
},

{
  id: 'inspectionmanagement',
  label: 'Inspection Management',
  path: '/components/Workshop Management',
  component: 'components/Workshop Management/InspectionManagement'
},

{
  id: 'tyremanagementview',
  label: 'Tyre Management View',
  path: '/components/Workshop Management',
  component: 'components/Workshop Management/TyreManagementView'
},

{
  id: 'workordermanagement',
  label: 'Work Order Management',
  path: '/components/Workshop Management',
  component: 'components/Workshop Management/WorkOrderManagement'
},

{
  id: 'wialonmapdashboard',
  label: 'Wialon Map Dashboard',
  path: '/components/maps',
  component: 'components/maps/WialonMapDashboard'
},

{
  id: 'tripmanagement',
  label: 'Trip Management',
  path: '/components/trips',
  component: 'components/trips/TripManagement'
},

{
  id: 'pagewrapper',
  label: 'Wrapper',
  path: '/components/ui',
  component: 'components/ui/PageWrapper'
},

{
  id: 'actionlog',
  label: 'Action Log',
  path: '/actionlog',
  component: 'pages/ActionLog'
},

{
  id: 'activetrips',
  label: 'Active Trips',
  path: '/activetrips',
  component: 'pages/ActiveTrips'
},

{
  id: 'addfuelentrypage',
  label: 'Add Fuel Entry',
  path: '/addfuelentrypage',
  component: 'pages/AddFuelEntryPage'
},

{
  id: 'addnewtyrepage',
  label: 'Add New Tyre',
  path: '/addnewtyrepage',
  component: 'pages/AddNewTyrePage'
},

{
  id: 'analyticsdashboard',
  label: 'Analytics Dashboard',
  path: '/analyticsdashboard',
  component: 'pages/AnalyticsDashboard'
},

{
  id: 'auditlogpage',
  label: 'Audit Log',
  path: '/auditlogpage',
  component: 'pages/AuditLogPage'
},

{
  id: 'clientmanagementpage',
  label: 'Client Management',
  path: '/clientmanagementpage',
  component: 'pages/ClientManagementPage'
},

{
  id: 'clientnetworkmap',
  label: 'Client Network Map',
  path: '/clientnetworkmap',
  component: 'pages/ClientNetworkMap'
},

{
  id: 'completedtrips',
  label: 'Completed Trips',
  path: '/completedtrips',
  component: 'pages/CompletedTrips'
},

{
  id: 'compliancemanagementpage',
  label: 'Compliance Management',
  path: '/compliancemanagementpage',
  component: 'pages/ComplianceManagementPage'
},

{
  id: 'cpkpage',
  label: 'Cpk',
  path: '/cpkpage',
  component: 'pages/CpkPage'
},

{
  id: 'createpurchaseorderpage',
  label: 'Create Purchase Order',
  path: '/createpurchaseorderpage',
  component: 'pages/CreatePurchaseOrderPage'
},

{
  id: 'currencyfleetreport',
  label: 'Currency Fleet Report',
  path: '/currencyfleetreport',
  component: 'pages/CurrencyFleetReport'
},

{
  id: 'customerretentiondashboard',
  label: 'Customer Retention Dashboard',
  path: '/customerretentiondashboard',
  component: 'pages/CustomerRetentionDashboard'
},

{
  id: 'dashboardpage',
  label: 'Dashboard',
  path: '/dashboardpage',
  component: 'pages/DashboardPage'
},

{
  id: 'dieseldashboardcomponent',
  label: 'Diesel Dashboard Component',
  path: '/dieseldashboardcomponent',
  component: 'pages/DieselDashboardComponent'
},

{
  id: 'dieselmanagementpage',
  label: 'Diesel Management',
  path: '/dieselmanagementpage',
  component: 'pages/DieselManagementPage'
},

{
  id: 'driverinspectionform',
  label: 'Driver Inspection Form',
  path: '/driverinspectionform',
  component: 'pages/DriverInspectionForm'
},

{
  id: 'drivermanagementpage',
  label: 'Driver Management',
  path: '/drivermanagementpage',
  component: 'pages/DriverManagementPage'
},

{
  id: 'faulttracking',
  label: 'Fault Tracking',
  path: '/faulttracking',
  component: 'pages/FaultTracking'
},

{
  id: 'flagsinvestigations',
  label: 'Flags Investigations',
  path: '/flagsinvestigations',
  component: 'pages/FlagsInvestigations'
},

{
  id: 'fleetanalyticspage',
  label: 'Fleet Analytics',
  path: '/fleetanalyticspage',
  component: 'pages/FleetAnalyticsPage'
},

{
  id: 'fleetlocationmappage',
  label: 'Fleet Location Map',
  path: '/fleetlocationmappage',
  component: 'pages/FleetLocationMapPage'
},

{
  id: 'fleettable',
  label: 'Fleet Table',
  path: '/fleettable',
  component: 'pages/FleetTable'
},

{
  id: 'inspectionform',
  label: 'Inspection Form',
  path: '/inspectionform',
  component: 'pages/InspectionForm'
},

{
  id: 'inspectionhistory',
  label: 'Inspection History',
  path: '/inspectionhistory',
  component: 'pages/InspectionHistory'
},

{
  id: 'inspectionhistorypage',
  label: 'Inspection History',
  path: '/inspectionhistorypage',
  component: 'pages/InspectionHistoryPage'
},

{
  id: 'inventorypage',
  label: 'Inventory',
  path: '/inventorypage',
  component: 'pages/InventoryPage'
},

{
  id: 'invoicebuilder',
  label: 'Invoice Builder',
  path: '/invoicebuilder',
  component: 'pages/InvoiceBuilder'
},

{
  id: 'invoicemanagementpage',
  label: 'Invoice Management',
  path: '/invoicemanagementpage',
  component: 'pages/InvoiceManagementPage'
},

{
  id: 'invoicetemplatespage',
  label: 'Invoice Templates',
  path: '/invoicetemplatespage',
  component: 'pages/InvoiceTemplatesPage'
},

{
  id: 'jobcardkanbanboard',
  label: 'Job Card Kanban Board',
  path: '/jobcardkanbanboard',
  component: 'pages/JobCardKanbanBoard'
},

{
  id: 'loadplanningcomponentpage',
  label: 'Load Planning Component',
  path: '/loadplanningcomponentpage',
  component: 'pages/LoadPlanningComponentPage'
},

{
  id: 'loginpage',
  label: 'Login',
  path: '/loginpage',
  component: 'pages/LoginPage'
},

{
  id: 'maptestpage',
  label: 'Map Test',
  path: '/maptestpage',
  component: 'pages/MapTestPage'
},

{
  id: 'notificationspage',
  label: 'Notifications',
  path: '/notificationspage',
  component: 'pages/NotificationsPage'
},

{
  id: 'orderspage',
  label: 'Orders',
  path: '/orderspage',
  component: 'pages/OrdersPage'
},

{
  id: 'sageintegration',
  label: 'Sage Integration',
  path: '/sageintegration',
  component: 'pages/SageIntegration'
},

{
  id: 'settingspage',
  label: 'Settings',
  path: '/settingspage',
  component: 'pages/SettingsPage'
},

{
  id: 'triptimelinepage',
  label: 'Trip Timeline',
  path: '/triptimelinepage',
  component: 'pages/TripTimelinePage'
},

{
  id: 'wialonunitspage',
  label: 'Wialon Units',
  path: '/wialonunitspage',
  component: 'pages/WialonUnitsPage'
},

{
  id: 'workshoppage',
  label: 'Workshop',
  path: '/workshoppage',
  component: 'pages/WorkshopPage'
},

{
  id: 'systeminfopanel',
  label: 'System Info Panel',
  path: '/admin',
  component: 'pages/admin/SystemInfoPanel'
},

{
  id: 'analyticsdashboard',
  label: 'Analytics Dashboard',
  path: '/analytics',
  component: 'pages/analytics/AnalyticsDashboard'
},

{
  id: 'fleetanalyticspage',
  label: 'Fleet Analytics',
  path: '/analytics',
  component: 'pages/analytics/FleetAnalyticsPage'
},

{
  id: 'clientmanagementpage',
  label: 'Client Management',
  path: '/clients',
  component: 'pages/clients/ClientManagementPage'
},

{
  id: 'clientnetworkmap',
  label: 'Client Network Map',
  path: '/clients',
  component: 'pages/clients/ClientNetworkMap'
},

{
  id: 'customermanagementpage',
  label: 'Customer Management',
  path: '/clients',
  component: 'pages/clients/CustomerManagementPage'
},

{
  id: 'compliancemanagementpage',
  label: 'Compliance Management',
  path: '/compliance',
  component: 'pages/compliance/ComplianceManagementPage'
},

{
  id: 'incidentmanagement',
  label: 'Incident Management',
  path: '/compliance',
  component: 'pages/compliance/IncidentManagement'
},

{
  id: 'reportnewincidentpage',
  label: 'Report New Incident',
  path: '/compliance',
  component: 'pages/compliance/ReportNewIncidentPage'
},

{
  id: 'applicantinfodemo',
  label: 'Applicant Info Demo',
  path: '/demos',
  component: 'pages/demos/ApplicantInfoDemo'
},

{
  id: 'uicomponentsdemo',
  label: 'U I Components Demo',
  path: '/demos',
  component: 'pages/demos/UIComponentsDemo'
},

{
  id: 'addfuelentrypage',
  label: 'Add Fuel Entry',
  path: '/diesel',
  component: 'pages/diesel/AddFuelEntryPage'
},

{
  id: 'dashboard',
  label: 'Dashboard',
  path: '/diesel',
  component: 'pages/diesel/Dashboard'
},

{
  id: 'dieseldashboardcomponent',
  label: 'Diesel Dashboard Component',
  path: '/diesel',
  component: 'pages/diesel/DieselDashboardComponent'
},

{
  id: 'dieselmanagementpage',
  label: 'Diesel Management',
  path: '/diesel',
  component: 'pages/diesel/DieselManagementPage'
},

{
  id: 'driverbehaviorpage',
  label: 'Driver Behavior',
  path: '/drivers',
  component: 'pages/drivers/DriverBehaviorPage'
},

{
  id: 'drivermanagementpage',
  label: 'Driver Management',
  path: '/drivers',
  component: 'pages/drivers/DriverManagementPage'
},

{
  id: 'inventorysagesync',
  label: 'Inventory Sage Sync',
  path: '/integration',
  component: 'pages/integration/InventorySageSync'
},

{
  id: 'purchaseordersync',
  label: 'Purchase Order Sync',
  path: '/integration',
  component: 'pages/integration/PurchaseOrderSync'
},

{
  id: 'sageintegration',
  label: 'Sage Integration',
  path: '/integration',
  component: 'pages/integration/SageIntegration'
},

{
  id: 'inventorypage',
  label: 'Inventory',
  path: '/inventory',
  component: 'pages/inventory/InventoryPage'
},

{
  id: 'partsinventorypage',
  label: 'Parts Inventory',
  path: '/inventory',
  component: 'pages/inventory/PartsInventoryPage'
},

{
  id: 'dashboard',
  label: 'dashboard',
  path: '/inventory',
  component: 'pages/inventory/dashboard'
},

{
  id: 'receive-parts',
  label: 'receive-parts',
  path: '/inventory',
  component: 'pages/inventory/receive-parts'
},

{
  id: 'reports',
  label: 'reports',
  path: '/inventory',
  component: 'pages/inventory/reports'
},

{
  id: 'stock',
  label: 'stock',
  path: '/inventory',
  component: 'pages/inventory/stock'
},

{
  id: 'dashboard',
  label: 'Dashboard',
  path: '/invoices',
  component: 'pages/invoices/Dashboard'
},

{
  id: 'invoicebuilder',
  label: 'Invoice Builder',
  path: '/invoices',
  component: 'pages/invoices/InvoiceBuilder'
},

{
  id: 'invoicemanagementpage',
  label: 'Invoice Management',
  path: '/invoices',
  component: 'pages/invoices/InvoiceManagementPage'
},

{
  id: 'invoicetemplates',
  label: 'Invoice Templates',
  path: '/invoices',
  component: 'pages/invoices/InvoiceTemplates'
},

{
  id: 'loadconfirmation',
  label: 'Load Confirmation',
  path: '/invoices',
  component: 'pages/invoices/LoadConfirmation'
},

{
  id: 'activetripspage',
  label: 'Active Trips',
  path: '/trips',
  component: 'pages/trips/ActiveTripsPage'
},

{
  id: 'calendar',
  label: 'Calendar',
  path: '/trips',
  component: 'pages/trips/Calendar'
},

{
  id: 'completedtrips',
  label: 'Completed Trips',
  path: '/trips',
  component: 'pages/trips/CompletedTrips'
},

{
  id: 'completedtripspage',
  label: 'Completed Trips',
  path: '/trips',
  component: 'pages/trips/CompletedTripsPage'
},

{
  id: 'dashboard',
  label: 'Dashboard',
  path: '/trips',
  component: 'pages/trips/Dashboard'
},

{
  id: 'flags',
  label: 'Flags',
  path: '/trips',
  component: 'pages/trips/Flags'
},

{
  id: 'flagsinvestigations',
  label: 'Flags Investigations',
  path: '/trips',
  component: 'pages/trips/FlagsInvestigations'
},

{
  id: 'fleetlocationmappage',
  label: 'Fleet Location Map',
  path: '/trips',
  component: 'pages/trips/FleetLocationMapPage'
},

{
  id: 'fleetmanagementpage',
  label: 'Fleet Management',
  path: '/trips',
  component: 'pages/trips/FleetManagementPage'
},

{
  id: 'googlemappage',
  label: 'Google Map',
  path: '/trips',
  component: 'pages/trips/GoogleMapPage'
},

{
  id: 'loadplanningcomponentpage',
  label: 'Load Planning Component',
  path: '/trips',
  component: 'pages/trips/LoadPlanningComponentPage'
},

{
  id: 'routeoptimization',
  label: 'Route Optimization',
  path: '/trips',
  component: 'pages/trips/RouteOptimization'
},

{
  id: 'tripdashboard',
  label: 'Trip Dashboard',
  path: '/trips',
  component: 'pages/trips/TripDashboard'
},

{
  id: 'tripdashboardpage',
  label: 'Trip Dashboard',
  path: '/trips',
  component: 'pages/trips/TripDashboardPage'
},

{
  id: 'tripmanagementpage',
  label: 'Trip Management',
  path: '/trips',
  component: 'pages/trips/TripManagementPage'
},

{
  id: 'triptimelinepage',
  label: 'Trip Timeline',
  path: '/trips',
  component: 'pages/trips/TripTimelinePage'
},

{
  id: 'waypointspage',
  label: 'Waypoints',
  path: '/trips',
  component: 'pages/trips/WaypointsPage'
},

{
  id: 'tyremanagementpage',
  label: 'Tyre Management',
  path: '/tyres',
  component: 'pages/tyres/TyreManagementPage'
},

{
  id: 'tyrespage',
  label: 'Tyres',
  path: '/tyres',
  component: 'pages/tyres/TyresPage'
},

{
  id: 'add-new-tyre',
  label: 'add-new-tyre',
  path: '/tyres',
  component: 'pages/tyres/add-new-tyre'
},

{
  id: 'dashboard',
  label: 'dashboard',
  path: '/tyres',
  component: 'pages/tyres/dashboard'
},

{
  id: 'inspection',
  label: 'inspection',
  path: '/tyres',
  component: 'pages/tyres/inspection'
},

{
  id: 'inventory',
  label: 'inventory',
  path: '/tyres',
  component: 'pages/tyres/inventory'
},

{
  id: 'reports',
  label: 'reports',
  path: '/tyres',
  component: 'pages/tyres/reports'
},

{
  id: 'wialonconfigpage',
  label: 'Wialon Config',
  path: '/wialon',
  component: 'pages/wialon/WialonConfigPage'
},

{
  id: 'wialondashboard',
  label: 'Wialon Dashboard',
  path: '/wialon',
  component: 'pages/wialon/WialonDashboard'
},

{
  id: 'wialonunitspage',
  label: 'Wialon Units',
  path: '/wialon',
  component: 'pages/wialon/WialonUnitsPage'
},

{
  id: 'workshoppage',
  label: 'Workshop',
  path: '/workshop',
  component: 'pages/workshop/WorkshopPage'
},

{
  id: 'create-purchase-order',
  label: 'create-purchase-order',
  path: '/workshop',
  component: 'pages/workshop/create-purchase-order'
},

{
  id: 'inspections',
  label: 'inspections',
  path: '/workshop',
  component: 'pages/workshop/inspections'
},

{
  id: 'new-inspection',
  label: 'new-inspection',
  path: '/workshop',
  component: 'pages/workshop/new-inspection'
},

{
  id: 'new-job-card',
  label: 'new-job-card',
  path: '/workshop',
  component: 'pages/workshop/new-job-card'
},

{
  id: 'request-parts',
  label: 'request-parts',
  path: '/workshop',
  component: 'pages/workshop/request-parts'
},

{
  id: 'vehicle-inspection',
  label: 'vehicle-inspection',
  path: '/workshop',
  component: 'pages/workshop/vehicle-inspection'
}
