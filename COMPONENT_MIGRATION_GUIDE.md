# Domain-Based Component Structure Migration Guide

## Overview

This document outlines the migration plan for reorganizing our component structure into a domain-based hierarchy with specialized subdirectories:

```
components/
├── DomainManagement/
│   ├── forms/
│   └── pages/
│   └── (other specialized folders)
```

## New Directory Structure

The new structure organizes components by domain and then by type:

```
components/
├── ComplianceSafetyManagement/
│   ├── forms/
│   └── pages/
│
├── CostManagement/
│   ├── forms/
│   └── pages/
│
├── CustomerManagement/
│   ├── forms/
│   └── pages/
│
├── DieselManagement/
│   ├── forms/
│   └── pages/
│
├── DriverManagement/
│   ├── forms/
│   └── pages/
│
├── InventoryManagement/
│   ├── forms/
│   └── pages/
│
├── InvoiceManagement/
│   ├── forms/
│   └── pages/
│
├── TripManagement/
│   ├── forms/
│   └── pages/
│
├── TyreManagement/
│   ├── forms/
│   └── pages/
│
├── WorkshopManagement/
│   ├── forms/
│   └── pages/
│
└── DashboardManagement/
    ├── forms/
    ├── pages/
    └── reports/
```

## Component Classification Rules

### Forms Directory

Components should go in the `forms` directory if they:
- Are specifically designed for data input
- Handle form submissions
- Include validation logic
- Typically contain input fields, selects, textareas, etc.

Examples:
- `AddDriverForm.tsx`
- `TripPlanningForm.tsx`
- `VehicleInspectionForm.tsx`

### Pages Directory

Components should go in the `pages` directory if they:
- Represent a significant part of a page's UI
- Are not strictly forms but contain complex layout or business logic
- Might include multiple smaller components together

Examples:
- `TripDetailsDisplay.tsx`
- `CustomerProfileCard.tsx`
- `DriverScheduleCalendar.tsx`

### Reports Directory (DashboardManagement only)

Components should go in the `reports` directory if they:
- Visualize data with charts, tables, or other visualizations
- Focus on displaying analytics or metrics
- Are primarily read-only views of data

Examples:
- `RevenueReport.tsx`
- `DriverPerformanceChart.tsx`
- `FleetUtilizationDashboard.tsx`

## Migration Steps

1. **Create the new directory structure**
   - Run the `reorganize-components.js` script to create the directories

2. **Move files**
   - For each component, determine which domain and type it belongs to
   - Move it to the corresponding directory
   - Update imports in all files that reference the moved component

3. **Update import statements**
   - Find and replace import statements throughout the codebase
   - Example: 
     - Before: `import TripForm from '../../components/Tripmanagement/TripForm'`
     - After: `import TripForm from '../../components/TripManagement/forms/TripForm'`

4. **Test thoroughly**
   - After moving files, test the application to ensure everything works
   - Pay special attention to components that might have circular dependencies

## Import Path Strategy

To minimize the impact of this reorganization, consider using barrel exports:

```typescript
// In components/TripManagement/forms/index.ts
export { default as TripForm } from './TripForm';
export { default as TripCostForm } from './TripCostForm';
// etc.

// In components/TripManagement/index.ts
export * from './forms';
export * from './pages';
```

This allows for gradual migration of import statements.

## Advantages of This Structure

1. **Domain-based organization**
   - All related components are grouped together
   - Easier to find components related to a specific feature

2. **Clear component purpose**
   - The directory structure makes it clear what each component is for
   - New developers can quickly understand the codebase organization

3. **Improved maintainability**
   - When updating a feature, all related components are in one place
   - Reduces the chance of missing related files during changes

4. **Scalability**
   - Easy to add new domains as the application grows
   - Can add more specialized directories (like `modals/`, `tables/`, etc.) as needed

## Implementation Timeline

1. **Phase 1: Structure Setup** (1 day)
   - Create the new directory structure
   - Run analysis to map files to new locations

2. **Phase 2: Domain Migration** (3-4 days)
   - Migrate one domain at a time
   - Start with smaller domains to validate the approach
   - Test thoroughly after each domain migration

3. **Phase 3: Import Path Updates** (2-3 days)
   - Update import statements throughout the codebase
   - Consider implementing barrel exports to simplify imports

4. **Phase 4: Validation and Cleanup** (1-2 days)
   - Ensure all tests pass
   - Remove any unused files or directories
   - Update documentation
