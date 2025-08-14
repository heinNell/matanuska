# Tyre Management Module Type Integration Guide

## Problem Overview

The Tyre Management system had several TypeScript errors due to inconsistent type definitions between different modules:

1. `src/types/tyre.ts` - One definition of `Tyre` type
2. `src/data/tyreData.ts` - Another definition of `Tyre` type
3. Missing properties in the context type definitions

## Solutions Implemented

### 1. Created Type Converter Utility

Created a `tyreTypeConverter.ts` utility that helps convert between the two different Tyre type formats:

```typescript
// src/utils/tyreTypeConverter.ts
export function isTyreDataType(tyre: any): boolean {
  return (
    tyre &&
    typeof tyre.installation === "object" &&
    !Array.isArray(tyre.installation) &&
    tyre.installation !== null &&
    !Object.prototype.hasOwnProperty.call(tyre.installation || {}, "position")
  );
}

export function convertTyreFormat(tyre: any, targetFormat: "tyre.ts" | "tyreData.ts"): any {
  // Converts between the two Tyre formats
}
```

### 2. Created Custom UI State Hook

Created a `useTyrePageState` hook to handle UI-specific state:

```typescript
// src/hooks/useTyrePageState.ts
export const useTyrePageState = () => {
  const { tyres, loading, error /* other context values */ } = useTyres();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [uiRecords, setUiRecords] = useState<any[]>([]);

  // Return combined state
  return {
    // Core context data
    tyres,
    loading,
    error /* other context values */,

    // UI state
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    brandFilter,
    setBrandFilter,
    uiRecords: uiRecords.length ? uiRecords : getUIRecords(),
    setUiRecords,
  };
};
```

### 3. Used Type Converter in Components

Applied the type converter in the TyreManagementPage to ensure compatibility:

```typescript
// In TyreManagementPage.tsx
onClick={() => setEditTyre(convertTyreFormat(tyre, 'tyreData.ts'))}

// For components
<TyreDashboard
  tyres={tyres.map(t => convertTyreFormat(t, 'tyreData.ts'))}
  stock={[]}
  assignments={[]}
/>
```

### 4. Fixed Status Handling

Updated status handling to use string literals instead of enum values:

```typescript
// Changed from:
[TyreStatus.NEW, TyreStatus.SPARE]
  .includes(t.status)

  [
    // To:
    ("new", "spare")
  ].includes(t.status);
```

## Best Practices Going Forward

1. **Standardize on One Type Definition**: Choose either `tyre.ts` or `tyreData.ts` as the canonical source for the `Tyre` type.

2. **Use Type Converters**: When you need to interact with components expecting different types, use the `convertTyreFormat` utility.

3. **Separate UI State from Core Data**: Use custom hooks like `useTyrePageState` to manage UI-specific state without polluting the core context.

4. **Prefer String Literals over Enums**: For values that are used in Firebase or passed to components, prefer string literals to avoid type incompatibilities.

## Future Improvements

1. **Consolidate Types**: Work toward a unified type system to eliminate the need for type converters.

2. **Type-Safe Components**: Update components to use proper typing and reduce the use of `any` type assertions.

3. **Improved Error Handling**: Add better error messages and recovery mechanisms.

4. **Comprehensive Testing**: Add unit tests to ensure type compatibility is maintained as the codebase evolves.
