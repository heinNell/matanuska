# Tyre Management System Documentation

This document provides a comprehensive overview of the Tyre Management System components, their relationships, and usage patterns.

## Component Structure

### Page Components
- `/src/pages/tyres/TyreManagementPage.tsx`: Main entry point for tyre management functionality

### Form Components
- `/src/components/forms/AddTyreForm.tsx`: Form for adding new tyres to the system
- `/src/components/forms/AddNewTireForm.tsx`: Duplicate of AddTyreForm (these appear to be identical)

### Model Components
- `/src/components/Models/Tyre/MoveTyreModal.tsx`: Modal for moving tyres between stores
- `/src/components/Models/Tyre/TyreModel.ts`: Domain model for tyre data

### Contexts
- `/src/context/TyreContext.tsx`: Context provider for tyre data operations
- `/src/context/TyreStoresContext.tsx`: Context provider for tyre store operations

### Data Files
- `/src/data/tyreReferenceData.ts`: Reference data for tyre sizes, brands, and patterns
- `/src/data/tyreMappingData.ts`: Mapping data for tyres

### Type Definitions
- `/src/types/tyre.ts`: Type definitions for tyre-related entities

## Component Details

### TyreManagementPage
**Purpose**: Provides a management interface for the tyre inventory system.

**Key Features**:
- Tyre listing with search and filtering capabilities
- Statistics dashboard showing tyre counts by status
- Modal for adding new tyres
- Status indicators for tyres

**Component Usage**:
```tsx
<TyreManagementPage />
```

**Key Dependencies**:
- `AddNewTyreForm`: Used in a modal for adding new tyres
- `Card`, `Button`: UI components for layout and actions
- `Modal`: For displaying the add tyre form

**Current Implementation Status**:
The current implementation uses mock data rather than the actual Firebase integration. It should be updated to use the `useTyres` and `useTyreStores` hooks to fetch real data.

### AddTyreForm (and AddNewTireForm)
**Purpose**: Provides a form for adding or editing tyre data.

**Key Features**:
- Fields for all tyre attributes (number, size, type, pattern, etc.)
- Validation logic for required fields
- Conditional validation based on mount status
- Support for both adding new tyres and editing existing ones

**Component Usage**:
```tsx
<AddTyreForm
  onSubmit={handleAddTyre}
  onCancel={() => setShowForm(false)}
  initialData={initialTyreData}
/>
```

**Props**:
- `onSubmit`: Callback function when form is submitted
- `onCancel`: Callback function when form is cancelled
- `initialData`: Optional initial data for editing an existing tyre

**Note**: Both `AddTyreForm.tsx` and `AddNewTireForm.tsx` appear to be identical components. This redundancy should be addressed by consolidating them into a single component.

### MoveTyreModal
**Purpose**: Provides a modal interface for moving tyres between different stores.

**Component Usage**:
```tsx
<MoveTyreModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onMove={handleMoveTyre}
  tyre={selectedTyre}
  stores={tyreStores}
/>
```

### TyreContext and TyreProvider
**Purpose**: Provides a context for tyre-related operations throughout the application.

**Key Features**:
- Real-time tyre data using Firebase listeners
- Methods for saving, retrieving, and deleting tyres
- Methods for tyre inspections
- Filtering capabilities

**Hook Usage**:
```tsx
const { 
  tyres, 
  loading, 
  saveTyre, 
  getTyreById, 
  filterTyres 
} = useTyres();
```

**Current Implementation Status**:
The Firebase functions referenced in this context (`saveTyre`, `getTyres`, etc.) are listed in FIREBASE_FUNCTIONS_TO_IMPLEMENT.ts but may not be fully implemented yet.

### TyreStoresContext and TyreStoresProvider
**Purpose**: Provides a context for tyre store operations.

**Key Features**:
- Real-time store data using Firebase listeners
- Methods for adding stores and managing tyre entries
- Support for moving tyres between stores

**Hook Usage**:
```tsx
const { 
  stores, 
  addStore, 
  updateEntry, 
  removeEntry, 
  moveEntry 
} = useTyreStores();
```

## Type Definitions

### Core Types
- `Tyre`: Comprehensive interface for a tyre entity
- `TyreSize`: Interface for tyre size information
- `TyreStore`: Firestore document representing a tyre store
- `StockEntry`: Entry in a tyre store inventory
- `TyreType`: Type for different tyre types (steer, drive, trailer, spare)
- `TyreStoreLocation`: Enum for different tyre locations

### History and Event Types
- `TyreRotation`: Record of a tyre rotation event
- `TyreRepair`: Record of a tyre repair event
- `TyreInspection`: Record of a tyre inspection event
- `StockEntryHistory`: Record of a tyre movement event

## Implementation Gaps

1. **Firebase Functions**: Many functions referenced in the contexts (like `saveTyre`, `getTyres`, etc.) are defined in FIREBASE_FUNCTIONS_TO_IMPLEMENT.ts but may not be implemented in the actual Firebase.ts file.

2. **Component Duplication**: AddTyreForm and AddNewTireForm appear to be identical components, which should be consolidated.

3. **Mock Data Usage**: The TyreManagementPage currently uses mock data instead of the context hooks.

## Integration Recommendations

1. Update TyreManagementPage to use the useTyres and useTyreStores hooks instead of mock data.

2. Consolidate AddTyreForm and AddNewTireForm into a single component.

3. Implement the missing Firebase functions from FIREBASE_FUNCTIONS_TO_IMPLEMENT.ts.

4. Enhance the MoveTyreModal to support selecting different positions when moving tyres to vehicle stores.

5. Add proper error handling and loading states in the UI components.

## Reference Data

### Tyre Sizes
The system currently supports these tyre sizes:
- 295/80R22.5
- 315/80R22.5
- 295/75R22.5
- 11R22.5
- 12R22.5
- 385/65R22.5
- 275/70R22.5

### Tyre Types
The system supports these tyre types:
- Drive
- Steer
- Trailer
- All-Position

### Tyre Brands
The reference data includes brands such as:
- Firemax
- TRIANGLE
- Terraking
- Compasal
- Windforce
- Perelli
- POWERTRAC
- SUNFULL
- FORMULA
- PIRELLI
- And more...

## Conclusion

The Tyre Management System provides a comprehensive solution for tracking and managing vehicle tyres throughout their lifecycle. The system combines React components with Firebase/Firestore for real-time data management. While some parts of the implementation are in place, there are areas that need completion or consolidation as noted above.
