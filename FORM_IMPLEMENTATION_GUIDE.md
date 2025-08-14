# Form Integration Implementation Guide

## Introduction

This guide provides instructions for implementing and connecting form components in the Heavy Vehicle Fleet Management application. It covers how to use the form utilities, connect components to Firestore, and ensure proper frontend integration.

## Quick Start

### 1. Adding a Form to a Page

```jsx
import React, { useState } from "react";
import FormSelector from "../components/forms/FormSelector";
import { useFormSubmit } from "../utils/formIntegration";

const MyPage = () => {
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const { handleSubmit, isSubmitting, error } = useFormSubmit({
    collection: "trips",
    onSuccess: () => {
      // Handle successful submission
      alert("Form submitted successfully!");
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Trip Form</h1>

      <form onSubmit={handleSubmit}>
        <FormSelector
          label="Select Vehicle"
          name="vehicleId"
          value={selectedVehicle}
          onChange={setSelectedVehicle}
          collection="fleet"
          labelField="registrationNumber"
          valueField="id"
          required={true}
        />

        {/* Add more form fields as needed */}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>

        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default MyPage;
```

### 2. Adding a Route

Update the App.tsx file to include a route to your form page:

```jsx
<Route path="my-form-page" element={<MyPage />} />
```

## Using Form Components

### FormSelector

The `FormSelector` component provides a dropdown that connects directly to Firestore collections.

```jsx
<FormSelector
  label="Select Driver"
  name="driverId"
  value={selectedDriver}
  onChange={setSelectedDriver}
  collection="drivers"
  labelField="name"
  valueField="id"
  sortField="name"
  required={true}
  placeholder="Select a driver"
  className="mb-4"
/>
```

#### Props:

- `label`: Display label for the form field
- `name`: Name attribute for the form field
- `value`: Current selected value
- `onChange`: Function to handle value changes
- `collection`: Firestore collection name
- `labelField`: Field to display in the dropdown
- `valueField`: Field to use as the option value
- `sortField`: Field to sort the options by
- `required`: Whether the field is required
- `placeholder`: Placeholder text
- `className`: Additional CSS classes

### TyreSelectionForm

Use this component to handle tyre selection and management:

```jsx
<TyreSelectionForm
  onTyreSelect={handleTyreSelect}
  selectedTyres={selectedTyres}
  vehicleType="Truck"
  onSubmit={handleTyreFormSubmit}
/>
```

### FleetSelectionForm

For selecting vehicles from the fleet:

```jsx
<FleetSelectionForm
  onVehicleSelect={handleVehicleSelect}
  fleetFilter={{
    status: "active",
    vehicleType: "truck",
  }}
  allowMultiple={false}
  onSubmit={handleFleetFormSubmit}
/>
```

### RouteSelectionForm

For planning and selecting routes:

```jsx
<RouteSelectionForm
  onRouteSelect={handleRouteSelect}
  defaultOrigin={defaultOrigin}
  defaultDestination={defaultDestination}
  onSubmit={handleRouteFormSubmit}
/>
```

### InventorySelectionForm

For inventory management:

```jsx
<InventorySelectionForm
  onItemSelect={handleItemSelect}
  categoryFilter="spares"
  allowMultiple={true}
  onSubmit={handleInventoryFormSubmit}
/>
```

## Form Integration Utilities

### useFirestoreOptions

This hook fetches options from Firestore collections for use in dropdowns and selectors:

```jsx
import { useFirestoreOptions } from "../utils/formIntegration";

const MyComponent = () => {
  const { options, loading, error } = useFirestoreOptions({
    collection: "drivers",
    labelField: "name",
    valueField: "id",
    sortField: "name",
    filterField: "status",
    filterValue: "active",
  });

  return (
    <select>
      {loading ? (
        <option>Loading...</option>
      ) : (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      )}
    </select>
  );
};
```

### useFormSubmit

This hook handles form submission with validation and error handling:

```jsx
import { useFormSubmit } from "../utils/formIntegration";

const MyForm = () => {
  const { handleSubmit, isSubmitting, error, isSuccess } = useFormSubmit({
    collection: "trips",
    validationSchema: {
      // Zod schema or validation function
      driverId: (value) => (value ? null : "Driver is required"),
      vehicleId: (value) => (value ? null : "Vehicle is required"),
    },
    onSuccess: () => {
      console.log("Form submitted successfully");
      // Additional success handling
    },
    onError: (err) => {
      console.error("Form submission failed", err);
      // Additional error handling
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>

      {error && <div className="error">{error}</div>}
      {isSuccess && <div className="success">Form submitted successfully!</div>}
    </form>
  );
};
```

## Integration with SyncContext

The forms system integrates with the SyncContext to handle offline operations:

```jsx
import { useSyncContext } from "../context/SyncContext";

const OfflineAwareComponent = () => {
  const { isOnline, pendingOperations, syncNow } = useSyncContext();

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 p-4 rounded mb-4">
          <p>You are currently offline. Form submissions will be queued.</p>
          {pendingOperations > 0 && (
            <div>
              <p>You have {pendingOperations} pending operations.</p>
              <button onClick={syncNow} className="bg-blue-500 text-white px-4 py-2 rounded">
                Sync when online
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form components */}
    </div>
  );
};
```

## Dashboard Integration

To integrate forms with the dashboard:

1. Navigate to the Dashboard component at `/src/pages/Dashboard.tsx`
2. Use the tabs to navigate between different views
3. Forms are fully integrated and functional in the "Fleet Management" tab

## Testing Your Integration

1. **Connection Testing**:
   - Test forms in online and offline modes
   - Verify queued operations are processed when back online

2. **Form Validation**:
   - Test required fields and validation rules
   - Ensure error messages are displayed correctly

3. **Data Flow**:
   - Verify data is saved correctly to Firestore
   - Check that form selections are preserved

## Troubleshooting

### Common Issues

1. **Form not submitting**:
   - Check network connectivity
   - Verify form validation isn't failing
   - Check console for errors

2. **Data not loading in selectors**:
   - Verify collection path is correct
   - Check Firestore permissions
   - Ensure the label and value fields exist in documents

3. **SyncContext errors**:
   - Make sure your component is within a SyncProvider
   - Check that queueOperation is being called correctly

### Getting Help

If you encounter issues not covered in this guide:

1. Check the `FORM_INTEGRATION_ARCHITECTURE.md` file for more details on the system design
2. Look at the examples in the FormsIntegrationPage component
3. Contact the development team for additional support

## Conclusion

By following this guide, you can successfully integrate form components into your pages and ensure they connect properly with Firestore data. The form system is designed to be flexible, reusable, and handle offline operations gracefully.
