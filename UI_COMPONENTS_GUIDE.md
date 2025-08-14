# UI Components Guide

This document provides an overview of the reusable UI components available in the application. Use these components to ensure consistency across the user interface.

## Basic Components

### Button

**Location**: `/src/components/ui/Button.tsx`

A flexible button component with multiple variants and sizes.

```tsx
import Button from '../components/ui/Button';

// Usage
<Button>Default Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>
<Button variant="destructive">Delete Button</Button>
<Button size="sm">Small Button</Button>
<Button size="lg">Large Button</Button>
<Button isLoading>Loading Button</Button>
<Button fullWidth>Full Width Button</Button>
```

### Card

**Location**: `/src/components/ui/Card.tsx`

A card component with header, content and footer sections.

```tsx
import Card, { CardHeader, CardContent, CardFooter } from "../components/ui/Card";

// Usage
<Card>
  <CardHeader>Card Title</CardHeader>
  <CardContent>Card Content</CardContent>
  <CardFooter>Card Footer</CardFooter>
</Card>;
```

### Modal

**Location**: `/src/components/ui/Modal.tsx`

A modal dialog component that can be used to display forms, confirmations, etc.

```tsx
import Modal from '../components/ui/Modal';
import { useState } from 'react';

// Usage
const [isOpen, setIsOpen] = useState(false);

<Button onClick={() => setIsOpen(true)}>Open Modal</Button>

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
>
  <div>Modal Content</div>
</Modal>
```

## Form Components

### TripForm

**Location**: `/src/components/forms/trips/TripForm.tsx`

A reusable form for creating and editing trips.

```tsx
import TripForm, { TripFormData } from "../components/forms/trips/TripForm";

// Usage
const handleSubmit = (data: TripFormData) => {
  console.log(data);
};

<TripForm
  onSubmit={handleSubmit}
  onCancel={() => {}}
  initialData={
    {
      /* initial values */
    }
  }
  isModal={true}
/>;
```

### FuelEntryForm

**Location**: `/src/components/forms/diesel/FuelEntryFormFinal.tsx`

A form for creating and editing fuel entries.

```tsx
import FuelEntryForm, { FuelEntryData } from "../components/forms/diesel/FuelEntryFormFinal";

// Usage
const handleSubmit = async (data: FuelEntryData) => {
  console.log(data);
};

<FuelEntryForm
  onSubmit={handleSubmit}
  onCancel={() => {}}
  initialData={
    {
      /* initial values */
    }
  }
  isModal={true}
/>;
```

## Hooks

### useOfflineForm

**Location**: `/src/hooks/useOfflineForm.ts`

A hook that provides offline form submission capabilities.

```tsx
import { useOfflineForm } from "../hooks/useOfflineForm";

// Usage
const { submit, isSubmitting, isOfflineOperation } = useOfflineForm({
  collectionPath: "trips",
  showOfflineWarning: true,
  onSuccess: (data) => console.log("Success", data),
  onError: (error) => console.error("Error", error),
});

// Submit form data
const handleSubmit = async (formData) => {
  await submit(formData);
};
```

### useTripFormData

**Location**: `/src/hooks/useTripFormData.ts`

A collection of hooks for fetching trip-related data from Firestore.

```tsx
import {
  useClientsData,
  useDriversData,
  useVehiclesData,
  useRoutesData,
} from "../hooks/useTripFormData";

// Usage
const { clients, loading, error } = useClientsData();
const { drivers, loading, error } = useDriversData();
const { vehicles, loading, error } = useVehiclesData();
const { routes, loading, error } = useRoutesData();
```

### useFuelEntryData

**Location**: `/src/hooks/useFuelEntryData.ts`

Hooks for fetching fuel entry-related data from Firestore.

```tsx
import { useFleetData, useDepotsData, useRouteDistances } from "../hooks/useFuelEntryData";

// Usage
const { fleetVehicles, loading, error } = useFleetData();
const { depots, loading, error } = useDepotsData();
const { routes, loading, error } = useRouteDistances();
```

## Integration Patterns

### Modal Form Pattern

```tsx
// In a page component
import { useState } from "react";
import Modal from "../components/ui/Modal";
import { Button } from "@/components/ui/Button";
import SomeForm, { FormData } from "../components/forms/SomeForm";

const PageComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (data: FormData) => {
    // Handle form submission
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>Open Form</Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Title">
        <SomeForm onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} isModal={true} />
      </Modal>
    </div>
  );
};
```

### Firestore Data Loading Pattern

```tsx
// In a component
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const colRef = collection(db, "collection-name");
        const snapshot = await getDocs(colRef);
        const fetchedData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setData(fetchedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Display data */}</div>;
};
```
