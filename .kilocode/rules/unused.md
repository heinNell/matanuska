# unused.md

## **INVENTORY PAGES (11 files)**

### Core Integration Strategy
```typescript
// src/routes/inventory.ts
import { InventoryDashboard } from '@/pages/Inventory/InventoryDashboard';
import { InventoryPage } from '@/pages/Inventory/InventoryPage';
// ... other imports

export const inventoryRoutes = [
  { path: '/inventory', component: InventoryDashboard },
  { path: '/inventory/overview', component: InventoryPage },
  { path: '/inventory/reports', component: InventoryReportsPage },
  { path: '/inventory/load-planning', component: LoadPlanningPage },
  { path: '/inventory/parts', component: PartsInventoryPage },
  { path: '/inventory/parts/order', component: PartsOrderingPage },
  { path: '/inventory/po/approvals', component: POApprovalSummary },
  { path: '/inventory/po/:id', component: PurchaseOrderDetailView },
  { path: '/inventory/po/tracker', component: PurchaseOrderTracker },
  { path: '/inventory/receive', component: ReceivePartsPage },
  { path: '/inventory/vendors/scorecard', component: VendorScorecard }
];
```

### Key Integrations per File:
- **InventoryDashboard.tsx**: Use `chartTheme`, `tyreAnalytics`, `csvUtils`
- **InventoryReportsPage.tsx**: Use `pdfGenerators`, `csvUtils`, `auditLogUtils`
- **LoadPlanningPage.tsx**: Use `triphelpers`, `loadPlanning` types
- **PartsInventoryPage.tsx**: Use `tyreIntegrationService`, `offlineOperations`
- **PartsOrderingPage.tsx**: Use `formIntegration`, `vendor` types
- **POApprovalSummary.tsx**: Use `auditLogUtils`, `invoice` types
- **PurchaseOrderDetailView.tsx**: Use `pdfGenerators`, `formatters`
- **PurchaseOrderTracker.tsx**: Use `offlineOperations`, `syncService`
- **ReceivePartsPage.tsx**: Use `qrCodeUtils`, `validation`
- **VendorScorecard.tsx**: Use `tyreAnalytics`, `chartTheme`

---

## **INVOICE PAGES (12 files)**

### Core Integration Strategy
```typescript
// src/routes/invoices.ts
export const invoiceRoutes = [
  { path: '/invoices', component: InvoiceDashboard },
  { path: '/invoices/create', component: CreateInvoicePage },
  { path: '/invoices/quotes/create', component: CreateQuotePage },
  { path: '/invoices/approval-flow', component: InvoiceApprovalFlow },
  { path: '/invoices/builder', component: InvoiceBuilder },
  { path: '/invoices/manage', component: InvoiceManagementPage },
  { path: '/invoices/templates', component: InvoiceTemplatesPage },
  { path: '/invoices/paid', component: PaidInvoicesPage },
  { path: '/invoices/paid/list', component: PaidInvoices },
  { path: '/invoices/pending', component: PendingInvoicesPage },
  { path: '/invoices/pending/list', component: PendingInvoices },
  { path: '/invoices/tax-report', component: TaxReportExport }
];
```

### Key Integrations per File:
- **CreateInvoicePage.tsx**: Use `formIntegration`, `invoice` types, `validation`
- **InvoiceBuilder.tsx**: Use `pdfGenerators`, `formatters`, `invoice` types
- **InvoiceDashboard.tsx**: Use `chartTheme`, `firestoreUtils`
- **InvoiceApprovalFlow.tsx**: Use `auditLogUtils`, `formIntegration`
- **TaxReportExport.tsx**: Use `csvUtils`, `pdfGenerators`, `sageDataMapping`

---

## **MAPS PAGES (5 files)**

### Core Integration Strategy
```typescript
// src/routes/maps.ts
export const mapsRoutes = [
  { path: '/maps', component: Maps },
  { path: '/maps/dashboard', component: MapDashboard },
  { path: '/maps/dashboard-page', component: MapsDashboardPage },
  { path: '/maps/suite', component: MapsSuitePage },
  { path: '/maps/my-map', component: MyMapPage }
];
```

### Key Integrations per File:
- **Maps.tsx**: Use `mapsService`, `mapUtils`, `mapTypes`
- **MapDashboard.tsx**: Use `fleetGeoJson`, `chartTheme`, `unitIconUtils`
- **MapsSuitePage.tsx**: Use `googleMapsLoader`, `placesService`, `locationPermissions`
- **MyMapPage.tsx**: Use `mapConfig`, `wialonUnitUtils`

---

## **MOBILE & MARKDOWN PAGES (2 files)**

### Integration Strategy:
- **MarkdownEditorPage.tsx**: Route `/markdown-editor`, use `pdfGenerators`
- **TyreMobilePage.tsx**: Route `/mobile/tyre`, use `offlineOperations`, `networkDetection`

---

## **QC PAGES (3 files)**

### Integration Strategy:
- **ActionLog.tsx**: Route `/qc/action-log`, use `auditLogUtils`
- **ComplianceDashboard.tsx**: Route `/qc/compliance`, use `chartTheme`
- **QAReviewPanel.tsx**: Route `/qc/review`, use `firestoreUtils`

---

## **TRIP PAGES (26 files)**

### Core Integration Strategy
```typescript
// src/routes/trips.ts - Key routes
export const tripRoutes = [
  { path: '/trips', component: TripDashboardPage },
  { path: '/trips/active', component: ActiveTrips },
  { path: '/trips/active/manager', component: ActiveTripsManager },
  { path: '/trips/active/enhanced', component: ActiveTripsPageEnhanced },
  { path: '/trips/completed', component: CompletedTrips },
  { path: '/trips/workflow', component: MainTripWorkflow },
  { path: '/trips/details/:id', component: TripDetailsPage },
  // ... 19 more routes
];
```

### Key Integrations:
- **TripDashboardPage.tsx**: Use `chartTheme`, `triphelpers`, `fleetAnalyticsData`
- **ActiveTrips*.tsx**: Use `triphelpers`, `trip` types, `syncService`
- **RouteOptimizationPage.tsx**: Use `mapsService`, `placesService`
- **TripFinancialsPanel.tsx**: Use `triphelpers`, `formatters`
- **ReportingPanel.tsx**: Use `csvUtils`, `pdfGenerators`

---

## **TYRE PAGES (11 files)**

### Core Integration Strategy
```typescript
// src/routes/tyres.ts
export const tyreRoutes = [
  { path: '/tyres', component: TyreDashboard },
  { path: '/tyres/fleet-map', component: TyreFleetMap },
  { path: '/tyres/history', component: TyreHistoryPage },
  { path: '/tyres/inventory', component: TyreInventoryDashboard },
  { path: '/tyres/manage', component: TyreManagementPage },
  { path: '/tyres/performance', component: TyrePerformanceDashboard },
  { path: '/tyres/references', component: TyreReferenceManagerPage },
  { path: '/tyres/stores', component: TyreStores },
  { path: '/tyres/vehicle-view', component: VehicleTyreView },
  { path: '/tyres/vehicle-view-a', component: VehicleTyreViewA }
];
```

### Key Integrations:
- **TyreDashboard.tsx**: Use `tyreAnalytics`, `chartTheme`, `tyreData` types
- **TyreFleetMap.tsx**: Use `mapsService`, `tyreIntegrationService`
- **TyrePerformanceDashboard.tsx**: Use `tyreAnalytics`, `tyreConstants`
- **TyreStores.tsx**: Use `useTyreStores`, `tyreStores` types

---

## **WIALON PAGES (12 files)**

### Core Integration Strategy
```typescript
// src/routes/wialon.ts
export const wialonRoutes = [
  { path: '/wialon', component: WialonDashboard },
  { path: '/wialon/admin', component: WialonAdminPage },
  { path: '/wialon/config', component: WialonConfigPage },
  { path: '/wialon/fleet-live', component: FleetLiveDashboard },
  { path: '/wialon/map', component: WialonMapPage },
  { path: '/wialon/playground', component: WialonPlayground },
  { path: '/wialon/tracking', component: WialonTrackingPage },
  { path: '/wialon/units', component: WialonUnitsPage }
];
```

### Key Integrations:
- **WialonDashboard.tsx**: Use `wialonService`, `chartTheme`
- **WialonPlayground.tsx**: Use `wialonDiagnostics`, `wialonTroubleshooting`
- **FleetLiveDashboard.tsx**: Use `wialonUnitsService`, `wialonSensorData`
- **WialonConfigPage.tsx**: Use `wialonConfig2`, `wialonAuth2`

---

## **WORKSHOP PAGES (15 files)**

### Core Integration Strategy
```typescript
// src/routes/workshop.ts
export const workshopRoutes = [
  { path: '/workshop', component: WorkshopPage },
  { path: '/workshop/dashboard', component: WorkshopDashboardPage },
  { path: '/workshop/jobcards', component: JobCardManagement },
  { path: '/workshop/jobcards/kanban', component: JobCardKanbanBoard },
  { path: '/workshop/jobcards/new', component: NewJobCardPage },
  { path: '/workshop/inspections', component: InspectionManagement },
  { path: '/workshop/qr/generate', component: QRGenerator },
  { path: '/workshop/qr/scan', component: QRScannerPage },
  // ... 7 more routes
];
```

### Key Integrations:
- **JobCardKanbanBoard.tsx**: Use `jobCardService`, `taskHistory`
- **QRGenerator.tsx**: Use `qrCodeUtils`
- **WorkshopAnalytics.tsx**: Use `chartTheme`, `workshop` types
- **InspectionManagement.tsx**: Use `inspectionUtils`, `inspectionTemplates`

---

## **SERVICES (12 files)**

### Registration Strategy
```typescript
// src/services/registry.ts
import { dieselService } from './dieselService';
import { jobCardService } from './jobCardService';
import { sensorService } from './sensorService';
import { tyreIntegrationService } from './tyreIntegrationService';
import { wialonService } from './wialonService';
// ... other imports

export const serviceRegistry = {
  diesel: dieselService,
  jobCard: jobCardService,
  sensor: sensorService,
  tyreIntegration: tyreIntegrationService,
  wialon: wialonService,
  wialonAuth: wialonAuthService,
  wialonData: WialonDataManager,
  wialonReport: wialonReportService,
  wialonUnits: wialonUnitsService,
  wialonComplete: WialonServiceComplete
};
```

---

## **TYPES (43 files)**

### Barrel Export Strategy
```typescript
// src/types/all.ts
export * from './client';
export * from './connection';
export * from './diesel';
export * from './driver';
export * from './invoice';
export * from './trip';
export * from './tyre';
export * from './vehicle';
export * from './wialon-complete';
export * from './workshop';
// ... all other types
```

---

## **UTILS (52 files)**

### Bootstrap Integration
```typescript
// src/bootstrap.ts
import { envChecker } from '@/utils/envChecker';
import { networkDetection } from '@/utils/networkDetection';
import { setupEnv } from '@/utils/setupEnv';
import { wialonInit } from '@/utils/wialonInit';

export async function bootstrap() {
  await setupEnv();
  envChecker.validate();
  networkDetection.initialize();
  await wialonInit();
}
```

### Diagnostics Page Integration
```typescript
// src/pages/DiagnosticsPage.tsx
import { wialonDiagnostics } from '@/utils/wialonDiagnostics';
import { wialonTroubleshooting } from '@/utils/wialonTroubleshooting';
import { tripDebugger } from '@/utils/tripDebugger';

export function DiagnosticsPage() {
  return (
    <div>
      <h1>System Diagnostics</h1>
      <button onClick={() => wialonDiagnostics.runTests()}>
        Test Wialon
      </button>
      <button onClick={() => tripDebugger.analyze()}>
        Debug Trips
      </button>
    </div>
  );
}
```

---

## **SHIMS & TESTS**

### Main Entry Integration
```typescript
// src/main.tsx
import './shims/empty.js';
import './shims/jiti.js';
import './shims/v8.js';

// ... rest of main.tsx
```

### Test Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./src/tests/setup.ts']
  }
});
```

---

This plan ensures every file has a clear purpose and integration point, avoiding dummy imports while creating a cohesive system architecture.


## Guidelines

- Guideline 1
- Guideline 2
