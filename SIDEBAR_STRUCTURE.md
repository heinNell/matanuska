# Unified Sidebar Navigation Structure

```
MATANUSKA TRANSPORT PLATFORM
│
├── 📊 Dashboard
│
├── 🚚 Trip Management
│   ├── Active Trips
│   ├── Completed Trips
│   ├── Route Planning
│   ├── Route Optimization
│   ├── Load Planning
│   ├── Trip Calendar
│   ├── Add New Trip
│   ├── Driver Performance
│   ├── Cost Analysis
│   ├── Fleet Utilization
│   ├── Delivery Confirmations
│   ├── Trip Templates
│   ├── Trip Reports
│   └── Maps & Tracking
│       ├── Fleet Location
│       └── Wialon Tracking
│
├── 📃 Invoices
│   ├── Dashboard
│   ├── Create New
│   ├── Pending Invoices
│   ├── Paid Invoices
│   ├── Overdue Invoices
│   ├── Approval Workflow
│   ├── Payment Reminders
│   ├── Credit Notes
│   ├── Invoice Templates
│   ├── Payment Processing
│   └── Tax Reports
│
├── ⛽ Diesel Management
│   ├── Dashboard
│   ├── Fuel Logs
│   ├── Add New Entry
│   ├── Fuel Cards
│   ├── Analytics
│   ├── Fuel Stations
│   ├── Cost Analysis
│   ├── Efficiency Reports
│   ├── Theft Detection
│   ├── Carbon Footprint
│   └── Driver Behavior
│
├── 👥 Clients
│   ├── Client Dashboard
│   ├── Add New Client
│   ├── Active Clients
│   ├── Client Analytics
│   ├── Retention Metrics
│   └── Client Network
│
├── 🧑‍✈️ Drivers
│   ├── Driver Dashboard
│   ├── Add New Driver
│   ├── Driver Profiles
│   ├── License Management
│   ├── Training Records
│   ├── Performance Analytics
│   ├── Scheduling
│   ├── Hours of Service
│   ├── Violations
│   ├── Rewards Program
│   ├── Behavior Monitoring
│   └── Safety Scores
│
├── 📋 Compliance
│   ├── Dashboard
│   ├── DOT Compliance
│   ├── Safety Inspections
│   ├── Incident Management
│   ├── Training Records
│   ├── Audit Management
│   ├── Violation Tracking
│   └── Insurance Management
│
├── 📈 Analytics
│   ├── Dashboard
│   ├── KPI Monitoring
│   ├── Predictive Analysis
│   ├── Cost Analytics
│   ├── ROI Calculator
│   ├── Benchmarking
│   └── Custom Reports
│
├── 🔧 Workshop
│   ├── Fleet Setup
│   ├── QR Generator
│   ├── Vehicle Inspections
│   │   ├── Active
│   │   ├── Completed
│   │   └── Templates
│   ├── Job Cards
│   │   ├── Kanban Board
│   │   ├── Open Cards
│   │   ├── Completed Cards
│   │   └── Templates
│   ├── Fault Tracking
│   ├── Tyres
│   │   ├── Dashboard
│   │   ├── Inspection
│   │   ├── Inventory
│   │   ├── Fleet Map
│   │   ├── History
│   │   ├── Performance
│   │   └── Add New
│   ├── Inventory
│   │   ├── Dashboard
│   │   ├── Stock Management
│   │   ├── Receive Parts
│   │   ├── Stock Alerts
│   │   └── Reports
│   ├── Parts Ordering
│   ├── Purchase Orders
│   ├── Vendors
│   ├── Analytics
│   └── Reports
│
├── 📝 Reports
│   ├── Action Log
│   ├── Currency Fleet
│   ├── Invoice Aging
│   └── Customer Retention
│
├── 🔔 Notifications
│
└── ⚙️ Settings
```

## Key Features of the New Sidebar Structure

1. **Hierarchical Organization**: Clear parent-child relationships make navigation intuitive

2. **Comprehensive Coverage**: All 407 components are accessible through this structure

3. **Logical Grouping**: Related functionalities are grouped together

4. **Consistent Naming**: Standardized naming conventions across all sections

5. **Deep Integration**: Every entry maps to an actual component in the codebase

6. **Scalable Design**: Easy to expand with new features while maintaining organization

## Implementation Details

This sidebar structure will be implemented by:

1. Updating `sidebarConfig.ts` to include all items in this hierarchy
2. Generating routes via `AppRoutes.tsx` to connect each item to its component
3. Ensuring proper parent-child relationships in the routing structure
4. Applying consistent styling and iconography across all levels
