# Sidebar Menu Options and Implementation

## Overview

The sidebar menu implementation in the Matanuska Transport application follows a hierarchical structure where sidebar items can have sub-items. The system is built on several key components:

1. **`src/config/sidebarConfig.ts`** - Defines the sidebar structure and mapping to components
2. **`src/components/layout/Sidebar.tsx`** - Renders the sidebar UI and handles interactions
3. **`src/AppRoutes.tsx`** - Defines the actual routes and lazy-loads components
4. **`src/components/layout/Layout.tsx`** - Connects the sidebar with navigation

## Sidebar Menu Structure

The sidebar is organized into the following main categories, each with their own set of options:

### 1. Main Navigation
- Dashboard

### 2. Core Business Operations

#### Trip Management
- Trip Dashboard
- Active Trips
- Enhanced Active Trips
- Completed Trips
- Route Planning
- Route Optimization
- Load Planning
- Trip Calendar
- Trip Timeline
- Add New Trip
- Trip Workflow

#### Diesel Management
- Diesel Dashboard
- Diesel Analysis
- Fuel Logs
- Add Fuel Entry
- Fuel Card Management
- Fuel Theft Detection

#### Fleet Management
- Vehicle Dashboard
- Vehicle Registry
- Maintenance Scheduling
- Vehicle Documentation
- Assignment & Availability

#### Workshop Operations
- Workshop Dashboard
- Work Orders
- Job Cards (Kanban Board)
- Inspections
- Purchase Orders
- PO Approval
- QA Review Panel
- QR Generator/Scanner

#### Tyre Management
- Tyre Dashboard
- Tyre Reference
- Performance Analytics
- History
- Fleet Map View
- Stores/Inventory

### 3. Business Management

#### Client Management
- Customer Dashboard
- Active Customers
- Client Reports
- Retention Metrics

#### Invoice Management
- Invoice Dashboard
- Pending Invoices
- Invoice Archive
- Payment Tracking

#### HR & Staff
- Staff Directory
- Driver Management
- Leave Management
- Training Records

#### Compliance
- Compliance Dashboard
- Document Expiry
- Incident Reports
- SHEQ Management

### 4. Analytics & Tools

#### Analytics
- Performance Metrics
- Vehicle Performance
- Driver Performance
- Route Analysis
- Vendor Scorecard

#### Map Tools
- Wialon Dashboard
- Fleet Location Map
- Route Planning Map
- Geofence Management

#### System Tools
- User Management
- Permissions
- Audit Logs
- System Settings

## Implementation Details

### Sidebar Item Structure

Each sidebar item in `sidebarConfig.ts` follows this interface:

```typescript
interface SidebarItem {
  id: string;
  label: string;
  path: string;
  component: string; // import path
  icon?: string;
  children?: SidebarItem[]; // For hierarchical navigation
  subComponents?: string[]; // Additional components that might be needed by this menu item
}
```

### Navigation Flow

1. User clicks on a sidebar menu item
2. `Sidebar.tsx` calls `onNavigate(route)` function provided by `Layout.tsx`
3. `Layout.tsx` uses React Router's `navigate()` to update the URL
4. The `AppRoutes.tsx` component maps the URL to the correct page component

### Key Features

1. **Expandable/Collapsible Sections**: Parent items can be expanded to show child items
2. **Active Item Highlighting**: Current route is highlighted in the sidebar
3. **Hierarchical Navigation**: Support for nested menu structures
4. **Icon Support**: Menu items can display icons for visual identification
5. **Lazy Loading**: Components are loaded only when needed using React.lazy

### Code Snippet: Sidebar Item Rendering

```tsx
<button
  className={`w-full flex items-center gap-3 px-6 py-2 rounded-lg transition-colors text-left ${
    isActive
      ? "bg-blue-50 text-blue-600 font-medium"
      : "text-gray-700 hover:bg-gray-50"
  }`}
  onClick={() => onNavigate(route)}
>
  {Icon && <Icon className="w-5 h-5" />}
  <span>{label}</span>
</button>
```

## Routing Pattern

The application uses React Router v6 with the following pattern:

```tsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={withSuspense(DashboardPage)} />
    <Route path="dashboard" element={withSuspense(DashboardPage)} />

    {/* Grouped routes */}
    <Route path="trips">
      <Route index element={withSuspense(TripManagementPage)} />
      <Route path="dashboard" element={withSuspense(TripDashboardPage)} />
      <Route path="active" element={withSuspense(ActiveTripsPage)} />
      {/* More trip routes... */}
    </Route>

    {/* More route groups... */}
  </Route>
</Routes>
```

## Integration Approach

The sidebar menu system works together with the routing system to provide a unified navigation experience:

1. **Single Source of Truth**: The sidebar configuration defines both navigation and routes
2. **Consistent Structure**: Menu hierarchy matches the URL structure
3. **Dynamic Highlighting**: Active route is automatically detected and highlighted
4. **Easy Extension**: Adding new routes requires updates to both `sidebarConfig.ts` and `AppRoutes.tsx`

## Best Practices

When adding new menu items or routes:
1. Add the route definition in `AppRoutes.tsx`
2. Update the sidebar configuration in `sidebarConfig.ts`
3. Create the corresponding page component
4. Import and lazy-load the component in `AppRoutes.tsx`
5. Ensure the path in the sidebar config matches the route path exactly
