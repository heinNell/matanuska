# File Organization Plan for Matanuska Transportation Project

## Current Structure Issues

The current file organization has some inconsistencies:

1. There are overlaps between components and pages (e.g., similar files in both locations)
2. Inconsistent naming between directories (e.g., "Tripmanagement" vs "trips")
3. Mixture of page components in components directory
4. Inconsistent casing (e.g., "Tripmanagement" vs "DriverManagement")

## Recommended Structure

### 1. Pages Directory (`/src/pages/`)

Pages should contain:
- Full routable views that represent a screen in your application
- Each page is typically associated with a route/URL
- Pages compose components together
- Follow consistent naming pattern: `EntityNamePage.tsx`

Examples:
```
/src/pages/
  ├── dashboard/
  │   ├── DashboardPage.tsx
  │   └── AnalyticsPage.tsx
  ├── trips/
  │   ├── TripManagementPage.tsx
  │   ├── TripDetailsPage.tsx
  │   ├── TripPlanningPage.tsx
  │   └── RouteOptimizationPage.tsx
  ├── drivers/
  │   ├── DriverManagementPage.tsx
  │   ├── DriverDetailsPage.tsx
  │   ├── LicenseManagementPage.tsx
  │   └── PerformanceAnalyticsPage.tsx
  └── ...
```

### 2. Components Directory (`/src/components/`)

Components should contain:
- Reusable UI elements
- Feature-specific components grouped by domain
- UI components that are used across multiple pages
- Follow consistent naming: `EntityNameComponent.tsx` or just `EntityName.tsx`

Examples:
```
/src/components/
  ├── ui/                           # Generic UI components
  │   ├── Button.tsx
  │   ├── Modal.tsx
  │   └── FormElements.tsx
  ├── trips/                        # Trip-specific components
  │   ├── TripCard.tsx
  │   ├── TripStatusBadge.tsx
  │   ├── TripDeletionModal.tsx
  │   └── forms/
  │       └── TripPlanningForm.tsx
  ├── drivers/                      # Driver-specific components
  │   ├── DriverCard.tsx
  │   ├── LicenseStatus.tsx
  │   └── forms/
  │       └── DriverProfileForm.tsx
  └── ...
```

## Migration Strategy

### Phase 1: Standardize Naming
- Ensure consistent naming conventions across all directories
- Change "Tripmanagement" to "trips"
- Change "Drivermanagementpages" to "drivers"

### Phase 2: Separate Pages and Components
- Move all page components (those that represent full views) to the pages directory
- Keep reusable components in the components directory
- Resolve duplicates and overlaps

### Phase 3: Update Imports
- Update import paths in all files to reflect the new structure
- Test the application to ensure everything still works

## File Classification Guide

### Pages (move to /src/pages/{domain}/)
- Components that represent a complete view/screen
- Components that are directly associated with a route
- Components that primarily compose other components
- Components with names ending in "Page"

### Components (keep in /src/components/{domain}/)
- Reusable UI elements
- Domain-specific components that appear on multiple pages
- Modal dialogs, forms, cards, lists, etc.
- Components that handle specific functionality but not entire views
