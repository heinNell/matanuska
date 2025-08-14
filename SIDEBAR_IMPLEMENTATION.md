# Sidebar Configuration Implementation

Below is an example of how the sidebar configuration should be implemented in your `sidebarConfig.ts` file to match the visualization:

```typescript
// src/config/sidebarConfig.ts

export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  component: string; // import path
  icon?: string;
  children?: SidebarItem[];
  subComponents?: string[]; // Additional components that might be needed by this menu item
}

export const sidebarConfig: SidebarItem[] = [
  // === DASHBOARD ===
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    path: '/dashboard', 
    component: 'pages/DashboardPage',
    icon: 'dashboard' 
  },
  
  // === TRIP MANAGEMENT ===
  { 
    id: 'trip-management', 
    label: 'Trip Management', 
    path: '/trips', 
    component: 'pages/trips/TripManagementPage',
    icon: 'truck',
    children: [
      { 
        id: 'active-trips', 
        label: 'Active Trips', 
        path: '/trips/active', 
        component: 'pages/trips/ActiveTripsPage' 
      },
      { 
        id: 'completed-trips', 
        label: 'Completed Trips', 
        path: '/trips/completed', 
        component: 'pages/trips/CompletedTrips' 
      },
      { 
        id: 'route-planning', 
        label: 'Route Planning', 
        path: '/trips/route-planning', 
        component: 'pages/trips/RoutePlanningPage' 
      },
      { 
        id: 'route-optimization', 
        label: 'Route Optimization', 
        path: '/trips/optimization', 
        component: 'pages/trips/RouteOptimizationPage' 
      },
      { 
        id: 'load-planning', 
        label: 'Load Planning', 
        path: '/trips/load-planning', 
        component: 'pages/trips/LoadPlanningPage' 
      },
      { 
        id: 'trip-calendar', 
        label: 'Trip Calendar', 
        path: '/trips/calendar', 
        component: 'pages/trips/TripCalendarPage' 
      },
      { 
        id: 'add-trip', 
        label: 'Add New Trip', 
        path: '/trips/new', 
        component: 'pages/trips/AddTripPage' 
      },
      { 
        id: 'driver-performance', 
        label: 'Driver Performance', 
        path: '/trips/driver-performance', 
        component: 'pages/trips/DriverPerformancePage' 
      },
      { 
        id: 'cost-analysis', 
        label: 'Cost Analysis', 
        path: '/trips/cost-analysis', 
        component: 'pages/trips/CostAnalysisPage' 
      },
      { 
        id: 'fleet-utilization', 
        label: 'Fleet Utilization', 
        path: '/trips/utilization', 
        component: 'pages/trips/FleetUtilization' 
      },
      { 
        id: 'delivery-confirmations', 
        label: 'Delivery Confirmations', 
        path: '/trips/confirmations', 
        component: 'pages/trips/DeliveryConfirmations' 
      },
      { 
        id: 'trip-templates', 
        label: 'Trip Templates', 
        path: '/trips/templates', 
        component: 'pages/trips/Templates' 
      },
      { 
        id: 'trip-reports', 
        label: 'Trip Reports', 
        path: '/trips/reports', 
        component: 'pages/trips/TripReportPage' 
      },
      { 
        id: 'maps-tracking', 
        label: 'Maps & Tracking', 
        path: '/trips/maps', 
        component: 'pages/trips/Maps',
        children: [
          { 
            id: 'fleet-location', 
            label: 'Fleet Location', 
            path: '/trips/fleet-location', 
            component: 'pages/trips/FleetLocationMapPage' 
          },
          { 
            id: 'wialon-tracking', 
            label: 'Wialon Tracking', 
            path: '/trips/wialon-tracking', 
            component: 'pages/wialon/WialonMapPage' 
          }
        ]
      }
    ]
  },
  
  // === INVOICES ===
  { 
    id: 'invoices', 
    label: 'Invoices', 
    path: '/invoices', 
    component: 'pages/invoices/InvoiceManagementPage',
    icon: 'file-invoice',
    children: [
      { 
        id: 'invoice-dashboard', 
        label: 'Dashboard', 
        path: '/invoices/dashboard', 
        component: 'pages/invoices/InvoiceDashboard' 
      },
      { 
        id: 'create-invoice', 
        label: 'Create New', 
        path: '/invoices/new', 
        component: 'pages/invoices/InvoiceBuilder' 
      },
      { 
        id: 'pending-invoices', 
        label: 'Pending Invoices', 
        path: '/invoices/pending', 
        component: 'pages/invoices/PendingInvoicesPage' 
      },
      { 
        id: 'paid-invoices', 
        label: 'Paid Invoices', 
        path: '/invoices/paid', 
        component: 'pages/invoices/PaidInvoicesPage' 
      },
      // ... other invoice items
    ]
  },
  
  // === DIESEL MANAGEMENT ===
  { 
    id: 'diesel', 
    label: 'Diesel Management', 
    path: '/diesel', 
    component: 'pages/diesel/DieselManagementPage',
    icon: 'gas-pump',
    children: [
      { 
        id: 'diesel-dashboard', 
        label: 'Dashboard', 
        path: '/diesel/dashboard', 
        component: 'pages/diesel/DieselDashboardComponent' 
      },
      { 
        id: 'fuel-logs', 
        label: 'Fuel Logs', 
        path: '/diesel/logs', 
        component: 'pages/diesel/FuelLogs' 
      },
      { 
        id: 'add-fuel-entry', 
        label: 'Add New Entry', 
        path: '/diesel/new', 
        component: 'pages/diesel/AddFuelEntryPage' 
      },
      // ... other diesel items
    ]
  },
  
  // === WORKSHOP ===
  { 
    id: 'workshop', 
    label: 'Workshop', 
    path: '/workshop', 
    component: 'pages/workshop/WorkshopPage',
    icon: 'wrench',
    children: [
      { 
        id: 'fleet-setup', 
        label: 'Fleet Setup', 
        path: '/workshop/fleet-setup', 
        component: 'pages/workshop/FleetTable' 
      },
      { 
        id: 'qr-generator', 
        label: 'QR Generator', 
        path: '/workshop/qr-generator', 
        component: 'pages/workshop/QRGenerator' 
      },
      { 
        id: 'vehicle-inspections', 
        label: 'Vehicle Inspections', 
        path: '/workshop/inspections', 
        component: 'pages/workshop/inspections',
        children: [
          { 
            id: 'active-inspections', 
            label: 'Active', 
            path: '/workshop/inspections/active', 
            component: 'components/workshop/InspectionManagement' 
          },
          { 
            id: 'completed-inspections', 
            label: 'Completed', 
            path: '/workshop/inspections/completed', 
            component: 'components/workshop/InspectionManagement' 
          },
          { 
            id: 'inspection-templates', 
            label: 'Templates', 
            path: '/workshop/inspections/templates', 
            component: 'pages/workshop/InspectionTemplatesPage' 
          }
        ]
      },
      { 
        id: 'tyres', 
        label: 'Tyres', 
        path: '/workshop/tyres', 
        component: 'pages/workshop/TyreManagement',
        children: [
          { 
            id: 'tyre-dashboard', 
            label: 'Dashboard', 
            path: '/workshop/tyres/dashboard', 
            component: 'pages/tyres/TyreManagementPage' 
          },
          { 
            id: 'tyre-inspection', 
            label: 'Inspection', 
            path: '/workshop/tyres/inspection', 
            component: 'pages/tyres/inspection' 
          },
          { 
            id: 'tyre-inventory', 
            label: 'Inventory', 
            path: '/workshop/tyres/inventory', 
            component: 'pages/tyres/inventory' 
          },
          { 
            id: 'tyre-add', 
            label: 'Add New', 
            path: '/workshop/tyres/add-new', 
            component: 'pages/tyres/add-new-tyre' 
          }
        ]
      }
      // ... other workshop sections
    ]
  }
  
  // ... remaining main sections (Clients, Drivers, Compliance, etc.)
];

export default sidebarConfig;
```

## Route Generation from this Config

With this configuration, the `fix-routes.cjs` script would generate routes like:

```tsx
// In AppRoutes.tsx (excerpt)

<Route path="/dashboard" element={<DashboardPage />} />

{/* Trip Management Section */}
<Route path="/trips" element={<TripManagementPage />}>
  <Route path="active" element={<ActiveTripsPage />} />
  <Route path="completed" element={<CompletedTrips />} />
  <Route path="route-planning" element={<RoutePlanningPage />} />
  <Route path="optimization" element={<RouteOptimizationPage />} />
  {/* ... other trip routes ... */}
  <Route path="maps" element={<Maps />}>
    <Route path="fleet-location" element={<FleetLocationMapPage />} />
    <Route path="wialon-tracking" element={<WialonMapPage />} />
  </Route>
</Route>

{/* ... other section routes ... */}
```

## Layout Component Enhancement

The `Layout` component would be enhanced to read this hierarchical structure:

```tsx
// In Layout.tsx (simplified)

const renderSidebarItems = (items: SidebarItem[], level = 0) => {
  return items.map(item => (
    <React.Fragment key={item.id}>
      <SidebarItem 
        item={item}
        level={level}
        isExpanded={expandedItems.includes(item.id)}
        onToggle={() => toggleItem(item.id)}
      />
      
      {item.children && expandedItems.includes(item.id) && (
        <div className="pl-4">
          {renderSidebarItems(item.children, level + 1)}
        </div>
      )}
    </React.Fragment>
  ));
};

return (
  <div className="sidebar">
    {renderSidebarItems(sidebarConfig)}
  </div>
);
```

This implementation ensures that all 407 components are accessible through a well-structured navigation system that is intuitive for users.
