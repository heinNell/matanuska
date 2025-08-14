# Form Integration Guide

This guide provides instructions on how to use the form integration utilities and components in the Matanuska Transport application.

## Overview

The form integration system provides a standardized way to connect forms with Firestore data. It includes:

1. **Reusable Form Components**
   - `FormSelector` - A dropdown component that loads options from Firestore
   - Form-specific components for common operations (fleet, tyres, routes, inventory)

2. **Form Integration Utilities**
   - Data loading hooks (useFirestoreOptions)
   - Form submission handlers (useFormSubmit)
   - Form validation utilities

3. **Offline Support**
   - Automatic queueing of form submissions when offline
   - Synchronization when back online
   - User feedback about connection status

## Using Form Components

### FormSelector

Use the FormSelector component to create dropdowns that load options from Firestore:

```jsx
import FormSelector from "../components/forms/FormSelector";

// In your component
<FormSelector
  label="Tyre Brand"
  name="brand"
  value={formData.brand}
  onChange={(value) => handleInputChange("brand", value)}
  collection="tyreBrands"
  labelField="name"
  valueField="name"
  sortField="name"
  required
  error={formErrors.brand}
/>;
```

### Ready-Made Form Components

#### TyreSelectionForm

Use this component to select and assign tyres to vehicles:

```jsx
import TyreSelectionForm from "../components/forms/TyreSelectionForm";

// In your component
<TyreSelectionForm
  onComplete={(data) => handleTyreSelection(data)}
  vehicleId="vehicle-123"
  positionId="front-left"
/>;
```

#### FleetSelectionForm

Use this component to select and assign fleet vehicles:

```jsx
import FleetSelectionForm from "../components/forms/FleetSelectionForm";

// In your component
<FleetSelectionForm onComplete={(data) => handleFleetSelection(data)} />;
```

#### RouteSelectionForm

Use this component for trip planning and route selection:

```jsx
import RouteSelectionForm from "../components/forms/RouteSelectionForm";

// In your component
<RouteSelectionForm onComplete={(data) => handleRouteSelection(data)} tripId="trip-123" />;
```

#### InventorySelectionForm

Use this component for inventory management:

```jsx
import InventorySelectionForm from "../components/forms/InventorySelectionForm";

// In your component
<InventorySelectionForm
  onComplete={(data) => handleInventorySelection(data)}
  jobCardId="job-123"
  storeLocation="Main Store"
/>;
```

## Form Integration Utilities

### Loading Options from Firestore

Use the `useFirestoreOptions` hook to load select options from Firestore:

```jsx
import { useFirestoreOptions } from "../utils/formIntegration";

// In your component
const { options, loading, error, refresh } = useFirestoreOptions({
  collection: "tyreBrands",
  labelField: "name",
  valueField: "id",
  sortField: "name",
});
```

### Specialized Data Loading Hooks

For common data types, use the specialized hooks:

```jsx
import {
  useFleetOptions,
  useTyreBrandOptions,
  useRouteOptions,
  useInventoryOptions,
} from "../utils/formIntegration";

// In your component
const { options: fleetOptions } = useFleetOptions();
const { options: tyreOptions } = useTyreBrandOptions();
const { options: routeOptions } = useRouteOptions();
const { options: inventoryOptions } = useInventoryOptions("Main Store");
```

### Form Submission

Use the `useFormSubmit` hook to handle form submission with offline support:

```jsx
import { useFormSubmit } from "../utils/formIntegration";

// In your component
const { submitForm, loading, error, success } = useFormSubmit("tyreAssignments");

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  await submitForm({
    // form data
    createdAt: new Date().toISOString(),
  });

  if (success) {
    // Handle successful submission
  }
};
```

### Form Validation

Use the `validateForm` utility to validate form data:

```jsx
import { validateForm } from "../utils/formIntegration";

// Validation schema
const validationSchema = {
  brand: { required: true },
  size: { required: true },
  quantity: { required: true, min: 1, max: 100 },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Validate form data
const { isValid, errors } = validateForm(formData, validationSchema);

if (!isValid) {
  setFormErrors(errors);
  return;
}
```

## Offline Support

The SyncContext provides offline support for form submissions:

```jsx
import { useSyncContext } from "../context/SyncContext";

// In your component
const syncContext = useSyncContext();

// Check if online
if (!syncContext.isOnline) {
  // Show offline warning
}

// Check queued operations
const pendingCount = syncContext.queuedOperations.length;
```

## Best Practices

1. **Always handle loading states** in your forms to provide feedback to users.
2. **Validate form data** before submission to ensure data integrity.
3. **Provide clear error messages** when validation fails.
4. **Use cascading selects** when one field depends on another (e.g., tyre pattern depends on brand).
5. **Test offline functionality** to ensure forms work properly without an internet connection.
6. **Add proper error handling** to all form submissions.
7. **Use form labels and placeholders** to provide clear instructions.
8. **Implement form reset** after successful submission.
9. **Make required fields obvious** with asterisks or other indicators.
10. **Use proper input types** for different data (e.g., number inputs for quantities).

## Troubleshooting

### Common Issues

1. **Form isn't loading data from Firestore**
   - Check if the collection name is correct
   - Ensure you have the right security rules in place
   - Verify that the labelField and valueField exist in your documents

2. **Form submission fails**
   - Check browser console for errors
   - Verify Firestore security rules
   - Ensure form data is properly formatted

3. **Offline submissions aren't synchronizing**
   - Make sure SyncContext is properly set up
   - Check if the sync process is completing properly
   - Look for errors in the synchronization process

4. **Form validation errors**
   - Ensure validation schema matches your form fields
   - Check that required fields are properly marked
   - Verify pattern matching for special formats

## Creating Custom Form Components

To create a custom form component:

1. Create a new component file in `src/components/forms`
2. Import the necessary utilities from `src/utils/formIntegration`
3. Structure your component with proper state management
4. Use the FormSelector component for dropdown fields
5. Implement form validation and submission
6. Add offline support with SyncContext

Example structure:

```jsx
// src/components/forms/CustomForm.tsx
import React, { useState } from "react";
import { useFirestoreOptions, useFormSubmit, validateForm } from "../../utils/formIntegration";
import FormSelector from "./FormSelector";
import { useSyncContext } from "../../context/SyncContext";

const CustomForm = ({ onComplete }) => {
  // Form state
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Get data and handle submission
  const { options } = useFirestoreOptions({ collection: "customCollection" });
  const { submitForm, loading, error, success } = useFormSubmit("customCollection");
  const syncContext = useSyncContext();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate and submit form
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
};

export default CustomForm;
```
