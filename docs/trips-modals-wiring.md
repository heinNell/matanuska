# Trip Modals Wiring Guide

This document summarizes the integration of trip-related modals and updates to diesel modals.

## Scope

- Trip modals integrated:
  - TripStatusUpdateModal (mark shipped/delivered)
  - TripCostEntryModal (add a single cost with optional files)
  - SystemCostsModal (bulk system-generated costs)
  - LoadImportModal (CSV/import entry)
  - CompletedTripEditModal and TripDeletionModal were already present in relevant pages

- Diesel pages updated previously:
  - AutomaticProbeVerificationModal wired with `dieselRecordId`
  - EnhancedDieselDebriefModal wired with `records` and `norms`
  - TripLinkageModal wired with `dieselRecordId`
  - DieselEditModal wired with `dieselRecordId`

## Files changed for trip wiring

- pages/trips/ActiveTripsPageEnhanced.tsx
  - Replaced AddTripModal usage with LoadImportModal
  - Added TripStatusUpdateModal with callbacks to AppContext.updateTripStatus
  - Added TripCostEntryModal with callbacks to AppContext.addCostEntry
  - Added SystemCostsModal with bulk `onGenerateCosts` -> AppContext.addCostEntry
  - UI buttons added: Add Cost, System Costs, Mark Shipped, Mark Delivered

No changes needed in:

- pages/trips/ActiveTripsManager.tsx (already using TripStatusUpdateModal and LoadImportModal)
- pages/trips/CompletedTrips.tsx (already using CompletedTripEditModal and TripDeletionModal)
- components/lists/WebBookTripsList.tsx (already using CompletedTripEditModal)

## AppContext APIs used

- updateTripStatus(tripId, status, notes)
- addCostEntry(costData, files?)

## Notes

- This pass focused on the enhanced Active Trips page. If you want the same cost/system-cost modals on other trip pages, we can replicate the minimal state/handlers there.
- Global type errors unrelated to these changes remain in legacy/demo areas; they don’t originate from the wiring above.

## Next steps

- Optionally add TripCostEntryModal and SystemCostsModal to ActiveTrips.tsx and component variants for parity.
- Unify cost entry types (types/index vs types/trip) if needed.
