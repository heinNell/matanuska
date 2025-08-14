# Unified Routing & Sidebar Mapping — Matanuska Transport Platform (2025)

## Overview

This document outlines the implementation of the unified routing and sidebar mapping system for the Matanuska Transport Platform. The system provides a centralized configuration that maps each menu option to its corresponding component path and route.

## Implementation Structure

The implementation revolves around the `sidebarConfig.ts` file, which serves as the single source of truth for all routing and navigation in the application. This configuration is used by:

1. The sidebar component to render navigation items
2. The routing system to define routes in React Router
3. Code generators to scaffold new components

## SidebarItem Interface

```typescript
export interface SidebarItem {
  id: string;          // Unique identifier for the menu item
  label: string;       // Display text in the UI
  path: string;        // URL route path
  component: string;   // Import path to the main component
  icon?: string;       // Optional icon identifier
  subComponents?: string[]; // Additional components used by this feature
}
```

## Directory Structure Standards

The routing system enforces consistent directory and file naming conventions:

- **Pages**: Primary route components in `/src/pages/{section}/`
- **Components**: Reusable UI components in `/src/components/{section}/`
- **Common Elements**: Shared UI elements in `/src/components/common/`
- **Naming Convention**: PascalCase for components, camelCase for directories

## Menu Sections and Routing

### A. Trip/Route Management

The Trip Management section provides functionality for planning and managing transportation routes and trips:

- Parent route: `/trips/*`
- Main component: `TripManagementPage`
- Key features: Route planning, trip timeline, vehicle tracking

### B. Invoice Management

The Invoice Management section handles all financial documentation:

- Parent route: `/invoices/*`
- Main component: `InvoiceManagementPage`
- Key features: Invoice creation, payment tracking, financial reports

### C. Diesel Management

The Diesel Management section tracks fuel consumption and related metrics:

- Parent route: `/diesel/*`
- Main component: `DieselManagementPage`
- Key features: Fuel logs, efficiency reports, carbon footprint tracking

### D. Customer Management

The Customer Management section handles client relationships and data:

- Parent route: `/clients/*`
- Main component: `ClientManagementPage`
- Key features: Customer profiles, retention metrics, reporting

### E. Driver Management

The Driver Management section tracks driver information and performance:

- Parent route: `/drivers/*`
- Main component: `DriverManagementPage`
- Key features: Driver profiles, performance metrics, violation tracking

### F. Compliance & Safety

The Compliance section ensures regulatory adherence:

- Parent route: `/compliance/*`
- Main component: `ComplianceManagementPage`
- Key features: Audit logs, inspection records, incident reporting

### G. Workshop Management

The Workshop section handles vehicle maintenance and repairs:

- Parent route: `/workshop/*`
- Main component: `WorkshopPage`
- Key features: Job cards, inspections, fault tracking, inventory

### H. Tyre Management

The Tyre Management section tracks tyre inventory and performance:

- Parent route: `/tyres/*`
- Main component: `TyreManagementPage`
- Key features: Tyre inventory, inspections, performance reporting

### I. Inventory Management

The Inventory Management section tracks parts and supplies:

- Parent route: `/inventory/*`
- Main component: `InventoryPage`
- Key features: Stock management, order tracking, cost analysis

## Tabbed Pages Implementation

For sections that use tabs (like Trip Management, Workshop, etc.), the implementation follows this pattern:

1. A parent page component that handles tab state and navigation
2. Child components rendered based on the active tab
3. URL parameters used to preserve tab state (e.g., `/trips?tab=active`)

Example:
```tsx
// TripManagementPage.tsx
export default function TripManagementPage() {
  const [tab, setTab] = useState('active');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) setTab(tabParam);
  }, [location]);

  const changeTab = (newTab: string) => {
    setTab(newTab);
    navigate(`/trips?tab=${newTab}`);
  };

  return (
    <div className="p-4">
      <TabNav activeTab={tab} onChange={changeTab} />
      {tab === 'active' && <ActiveTripsPage />}
      {tab === 'completed' && <CompletedTrips />}
      {/* Other tabs */}
    </div>
  );
}
```

## Backend Integration Standards

Each component follows these standards for backend integration:

1. **Data Fetching**: Import API hooks or Firestore functions at the top of each component
2. **Collection Names**: Use standardized collection names (`/trips`, `/tyres`, `/drivers`, etc.)
3. **Loading States**: Implement consistent loading and error states
4. **Real-time Updates**: Use Firestore listeners for real-time data where appropriate

Example:
```tsx
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function TyreInventory() {
  const [tyres, setTyres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'tyres'), where('status', '!=', 'scrapped'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tyreData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTyres(tyreData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Component UI
}
```

## Metrics and Localization Standards

The implementation enforces consistent use of:

1. **Distance**: Kilometers (KM)
2. **Currency**: South African Rand (ZAR) with USD equivalent where needed
3. **Dates**: ISO format (YYYY-MM-DD) with localized display
4. **Naming**: British English spelling (e.g., "tyre" not "tire")

## Auto-Discovery and Route Generation

The routing system supports automatic discovery and registration of routes based on the `sidebarConfig.ts` file. This ensures that:

1. All routes defined in the config are properly registered with React Router
2. The sidebar navigation correctly links to each route
3. New components can be scaffolded according to the configuration

## Conclusion

This unified routing and sidebar mapping system provides a maintainable, consistent approach to navigation and routing. By centralizing the configuration in `sidebarConfig.ts`, we ensure that UI navigation and routing logic remain synchronized and follow the established conventions.
