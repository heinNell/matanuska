# 🔍 Integration Report

## 🧱 UI Component Usage
- Total in /components: 207
- Used: 200
- Unused: 7

### ❗ Unused Components
- Fleetdashboard
- LineChartPanel
- PeriodSelector
- import React from 'react';
- VehicleTyreViewA
- EnhancedJobCardItem
- LocationDetailPanel.new

## 🔗 Firebase API Usage

### setDoc used in:
- src/components/FleetAnalytics/AdHocReportBuilder.tsx
- src/firebase.ts
- src/tools/validateIntegrationFull.ts

### collection used in:
- src/components/FleetAnalytics/AdHocReportBuilder.tsx
- src/components/FleetAnalytics/KPIOverview.tsx
- src/components/FleetAnalytics/PredictiveModels.tsx
- src/components/FleetAnalytics/ROIReportView.tsx
- src/components/Inventory Management/InventoryDashboard.tsx
- src/components/Inventory Management/StockManager.tsx
- src/components/InvoiceManagement/TaxReportExport.tsx
- src/components/TripManagement/TripOverviewPanel.tsx
- src/components/TyreManagement/TyreInventoryManager.tsx
- src/components/TyreManagement/TyrePerformanceReport.tsx
- src/components/TyreManagement/TyreReports.tsx
- src/components/Workshop Management/FaultTracker.tsx
- src/components/Workshop Management/FleetVisualSetup.tsx
- src/components/Workshop Management/InspectionList.tsx
- src/components/Workshop Management/WorkshopAnalytics.tsx
- src/context/AppContext.tsx
- src/context/DriverBehaviorContext.tsx
- src/context/TripContext.tsx
- src/context/TyreStoresContext.tsx
- src/firebase.ts
- src/hooks/useFirestoreDoc.ts
- src/hooks/useRealtimeTrips.ts
- src/hooks/useWebBookTrips.ts
- src/pages/TripTimelinePage.tsx
- src/pages/tyres/TyreManagementPage.tsx
- src/tools/validateIntegrationFull.ts
- src/utils/syncService.ts

### onSnapshot used in:
- src/components/Inventory Management/StockManager.tsx
- src/components/TripManagement/TripTimelineLive.tsx
- src/components/TyreManagement/TyreReports.tsx
- src/context/DriverBehaviorContext.tsx
- src/context/TripContext.tsx
- src/firebase.ts
- src/hooks/useRealtimeTrips.ts
- src/tools/validateIntegrationFull.ts
- src/utils/syncService.ts

### addDoc used in:
- src/components/Inventory Management/StockManager.tsx
- src/components/TyreManagement/TyreInventoryManager.tsx
- src/components/Workshop Management/FaultTracker.tsx
- src/components/Workshop Management/FleetVisualSetup.tsx
- src/firebase.ts
- src/tools/validateIntegrationFull.ts
- src/utils/syncService.ts

### updateDoc used in:
- src/components/Inventory Management/StockManager.tsx
- src/components/TyreManagement/TyreInventoryManager.tsx
- src/components/Workshop Management/FaultTracker.tsx
- src/components/Workshop Management/FleetVisualSetup.tsx
- src/components/Workshop Management/JobCard.tsx
- src/context/TyreStoresContext.tsx
- src/firebase.ts
- src/tools/validateIntegrationFull.ts
- src/utils/syncService.ts

### deleteDoc used in:
- src/components/TyreManagement/TyreInventoryManager.tsx
- src/components/Workshop Management/FleetVisualSetup.tsx
- src/firebase.ts
- src/tools/validateIntegrationFull.ts

## 📂 Firestore Collections Referenced
- `reportFields`
- `reportConfigs`
- `kpis`
- `kpiTimeSeries`
- `predictiveModels`
- `predictions`
- `modelInsights`
- `roiProjects`
- `roiReports`
- `inventory`
- `invoices`
- `tyres`
- `faults`
- `vehicleTemplates`
- `inspections`
- `driverBehavior`
- `trips`
- `auditLogs`
- `missedLoads`
- `driverBehaviorEvents`
- `tyreStores`
- `diesel`
- `workshopInventory`
- `jobCards`
- `enhancedJobCards`
- `actionItems`
- `clients`
- `carReports`
- `reorderRequests`
