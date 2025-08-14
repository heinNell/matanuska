# File Sorting Action Plan

## TripDeletionModal.tsx

The file `/src/components/Tripmanagement/TripDeletionModal.tsx` is correctly placed as a component because:
- It's a modal dialog, which is a reusable UI element
- It's used within pages but doesn't represent a complete page itself
- It handles a specific functionality (trip deletion confirmation)

This should remain in the components directory, but we should standardize the directory name:

```
Current: /src/components/Tripmanagement/TripDeletionModal.tsx
Recommended: /src/components/trips/TripDeletionModal.tsx
```

## Immediate Actions for Organization

1. **Standardize Directory Names**:
   ```
   /src/components/Tripmanagement/ → /src/components/trips/
   /src/components/DriverManagement/ → /src/components/drivers/
   /src/pages/Drivermanagementpages/ → /src/pages/drivers/
   ```

2. **Move Misplaced Files**:
   - Files ending in "Page" should be in the pages directory
   - Files that represent full views should be in the pages directory
   - Modal dialogs, forms, and reusable components should be in the components directory

3. **Example Moves**:
   - `/src/components/DriverManagement/DriverBehaviorEventspage.tsx` → `/src/pages/drivers/DriverBehaviorEventsPage.tsx`
   - `/src/components/Tripmanagement/ActiveTrips.tsx` → Either rename to `ActiveTripsList.tsx` if it's a component or move to `/src/pages/trips/` if it's a page

## Tips for Identifying Components vs Pages

### This is a Page if:
- It's the top-level component for a route/URL
- It contains mostly layout and composition of other components
- It's named with "Page" suffix
- It directly uses route parameters or navigation hooks at the top level
- It represents a complete screen in your application

### This is a Component if:
- It's reused across multiple pages
- It handles a specific piece of functionality
- It's a modal, dialog, form, card, or other UI element
- It doesn't have direct knowledge of the route it's in
- It receives data via props rather than directly accessing routes

## Common Components That Should Be in Components Directory

- Modals (e.g., `TripDeletionModal.tsx`)
- Forms (e.g., `TripPlanningForm.tsx`)
- Cards/List Items (e.g., components that display a single trip or driver)
- Widgets (e.g., small data visualization components)
- UI components (buttons, inputs, etc.)

## Common Files That Should Be in Pages Directory

- Main views (e.g., `TripManagementPage.tsx`)
- Detail views (e.g., `TripDetailsPage.tsx`)
- Dashboard views (e.g., `DashboardPage.tsx`)
- Any component that is directly associated with a route
