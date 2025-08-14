# Trip Management Integration Guide

This document outlines how the trip management components are connected and how to ensure proper functionality throughout the system.

## Core Components

### 1. ActiveTripsPage

Located at `/workspaces/matanuskatp/src/pages/ActiveTripsPage.tsx`

- **Data Source**: Uses `useRealtimeTrips` hook to fetch active trips from Firestore
- **Navigation**: Clicking on a trip row navigates to `/trips/:id` (TripDetailsPage)
- **Purpose**: Displays all active trips in a table format with real-time updates

### 2. TripDetailsPage

Located at `/workspaces/matanuskatp/src/pages/trips/TripDetailsPage.tsx`

- **Data Source**: Uses AppContext's `getTrip` method to fetch a specific trip by ID
- **Features**:
  - Trip summary display
  - Cost entry management
  - Document management
  - Status updates
  - System cost generation

### 3. ActiveTrips Component

Located at `/workspaces/matanuskatp/src/components/TripManagement/ActiveTrips.tsx`

- **Data Source**: Also uses `useRealtimeTrips` hook
- **Purpose**: Reusable component for embedding in dashboards

## Data Flow

1. User views ActiveTripsPage
   - `useRealtimeTrips` hook establishes a Firestore listener
   - Real-time trip data is fetched and displayed
   
2. User clicks on a trip row
   - Navigation to `/trips/:id` occurs
   - TripDetailsPage loads
   - `getTrip` method fetches detailed trip information
   
3. User adds/edits a cost entry on TripDetailsPage
   - `addCostEntry` or `updateCostEntry` methods modify data
   - Trip data is refreshed via `getTrip`
   - UI updates to reflect changes

## Integration Points

### Router Integration

Ensure these routes are defined in App.tsx:

```jsx
<Route path="/trips/active" element={<ActiveTripsPage />} />
<Route path="/trips/:id" element={<TripDetailsPage />} />
```

### Context Requirements

The AppContext must provide these methods:
- `getTrip(id: string): Trip | undefined`
- `addCostEntry(data: CostEntryData, files?: FileList): Promise<string>`
- `updateCostEntry(data: CostEntry): Promise<void>`
- `deleteCostEntry(id: string): Promise<void>`
- `completeTrip(id: string): Promise<void>`
- `updateTripStatus(id: string, status: string, notes: string): Promise<void>`

### Reusable Components

These components should be properly connected:
- CostList: For displaying trip costs
- TripDetails: For showing trip summary

## Common Issues & Solutions

### Issue: Trips not loading in ActiveTripsPage
**Solution**: Check Firestore connection and ensure the `trips` collection exists

### Issue: Cannot navigate to TripDetailsPage
**Solution**: Verify route configuration in App.tsx includes `/trips/:id`

### Issue: Cost entries not saving
**Solution**: Verify AppContext methods are properly implemented and check Firestore permissions

### Issue: ActiveTrips component not showing real data
**Solution**: Make sure `useRealtimeTrips` hook is imported and used correctly

## Testing

To verify proper integration:
1. Navigate to ActiveTripsPage and confirm trips are loading
2. Click a trip to navigate to TripDetailsPage
3. Add a cost entry and verify it appears in the cost list
4. Update trip status and verify changes are reflected

---

Created: July 24, 2025  
Last Updated: July 24, 2025
