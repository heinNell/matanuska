# Firestore Migration and Refactoring Guide

This document outlines the process of migrating components from using mock data to leveraging Firestore with offline capabilities. The `DriverProfiles.tsx` component was used as a pilot for this migration.

## 1. Task Breakdown and Key Components

The primary goal was to replace mock data with live Firestore data, ensuring offline support, loading/error states, and robust error handling.

- **Key Hooks Identified:**
  - `useFirestoreQuery`: A hook that provides real-time data from Firestore with a "stale-while-revalidate" caching strategy.
  - `useOfflineForm`: A hook for handling form submissions (create, update, delete) with offline queuing.

## 2. Code Review and Refactoring

The refactoring process for the `DriverProfiles.tsx` component involved the following steps:

### Step 1: Centralize Type Definitions

A reusable `Driver` interface was created in `src/types/driver.ts` to ensure type consistency across the application.

```typescript
// src/types/driver.ts
export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  status: "Active" | "Inactive" | "On Leave";
  licenseExpiry: string;
  phone: string;
  safetyScore: number;
  location: string;
}
```

### Step 2: Replace Mock Data with `useFirestoreQuery`

The mock `drivers` array was removed and replaced with a call to the `useFirestoreQuery` hook.

```tsx
// src/pages/drivers/DriverProfiles.tsx
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery";
import { Driver } from "../../types/driver";

// ...

const { data: drivers, loading, error } = useFirestoreQuery<Driver>("drivers");
```

### Step 3: Implement Loading and Error States

The component now displays a loading spinner while data is being fetched and a user-friendly error message if the query fails.

```tsx
// src/pages/drivers/DriverProfiles.tsx
const renderContent = () => {
  if (loading) {
    return <div className="flex justify-center items-center h-64">...</div>;
  }

  if (error) {
    return <Alert variant="destructive">...</Alert>;
  }

  if (filteredDrivers.length === 0) {
    return <div className="text-center text-gray-500 p-4">...</div>;
  }

  return (
    // ... table rendering
  );
};
```

## 3. Error Handling

The `useFirestoreQuery` hook includes built-in error handling, which was leveraged in the `DriverProfiles` component to display a clear error message to the user.

- **Dependency Installation:** The `react-spinners` package was installed to provide a loading indicator.
- **Component Creation:** An `Alert` component was created in `src/components/ui/Alert.tsx` and exported from `src/components/ui/index.ts` to provide a standardized way of displaying error messages.

## 4. Testing and Validation

To validate the new Firestore implementation, the following steps are recommended:

1.  **Run Linting and Type Checks:** Ensure that all modified files pass the project's linting and TypeScript checks.
    ```bash
    npm run lint
    npm run typecheck
    ```
2.  **Manual Verification:**
    - Load the `DriverProfiles` page and verify that the loading indicator appears.
    - Confirm that driver data is displayed correctly.
    - Test the search and filter functionality.
    - Simulate an offline connection to verify that cached data is displayed.

## 5. Documentation and Usage Examples

This guide serves as the primary documentation for the migration process. The refactored `DriverProfiles.tsx` component is the canonical example of how to implement Firestore data fetching in the application.

### Usage Example:

To fetch data from a Firestore collection, use the `useFirestoreQuery` hook as follows:

```tsx
import { useFirestoreQuery } from "../hooks/useFirestoreQuery";
import { YourDataType } from "../types/your-data-type";

const YourComponent: React.FC = () => {
  const { data, loading, error } = useFirestoreQuery<YourDataType>("your-collection");

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <ul>
      {data?.map((item) => (
        <li key={item.id}>{/* ... render your item */}</li>
      ))}
    </ul>
  );
};
```
