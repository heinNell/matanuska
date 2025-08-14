# Tyre Management System Refactoring Guide

## Recent Changes Made

1. **Fixed TyreContext.tsx Type Issues**
   - Updated the TyreContext.tsx to fix TypeScript errors related to missing properties

2. **Created useTyrePageState Hook**
   - Added a new hook (`useTyrePageState.ts`) that extends the core TyreContext with UI-specific state
   - This hook provides search, filter, and UI presentation functionality

3. **Integrated TyreInventoryFilters Component**
   - Added the TyreInventoryFilters component to the TyreManagementPage
   - This provides a standardized, reusable filtering interface

## Remaining Issues

There are still some type compatibility issues between different Tyre type definitions:

1. **Tyre Type Conflicts**
   - The application has two different Tyre types:
     - One from `/src/types/tyre.ts`
     - Another from `/src/data/tyreData.ts`
   - These have incompatible properties, especially with the `installation` field

2. **Type Casting Required**
   - In places where we handle Tyre objects, we need to add type assertions:

   ```typescript
   // Example
   const handleEditTyre = (tyre: any) => {
     setEditTyre(tyre as any);
   };
   ```

3. **Adapt Function Issues**
   - The `adaptTyreFormatIfNeeded` function needs to be updated to handle both Tyre types

## Recommendations

1. **Consolidate Tyre Types**
   - Choose one canonical Tyre type definition
   - Update all type imports to reference this single type
   - Update any components that rely on specific fields

2. **Short-term Fixes**
   - Add type assertions (`as any`) where necessary to bypass TypeScript errors
   - Update component props to use more generic types where needed

3. **Long-term Refactoring**
   - Create an adapter layer that converts between different Tyre representations
   - Consider a data migration to standardize on a single Tyre format

## Using TyreInventoryFilters

To use the TyreInventoryFilters component:

```tsx
import { useTyrePageState } from "../../hooks/useTyrePageState";
import { TyreInventoryFilters } from "../../components/Tyremanagement/TyreInventoryFilters";

const YourComponent = () => {
  const { searchTerm, setSearchTerm, brandFilter, setBrandFilter, statusFilter, setStatusFilter } =
    useTyrePageState();

  return (
    <TyreInventoryFilters
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      brandFilter={brandFilter}
      setBrandFilter={setBrandFilter}
      brands={yourBrandsArray}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      statuses={[
        { label: "All", value: "all" },
        { label: "In Service", value: "in_service" },
        // ...more statuses
      ]}
      onAddStock={handleAddItem}
    />
  );
};
```

This should provide a standardized filtering experience across all tyre-related pages.
