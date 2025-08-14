# Trip Management System Integration Guide

This document outlines how to integrate the newly created Trip Management components to match the requirements.

## Components Created

1. **TripDetailsPage** (`/src/pages/trips/TripDetailsPage.tsx`)
   - Main page for displaying trip details
   - Shows financial information, trip route, and allows cost management

2. **TripCostEntryModal** (`/src/components/Models/Trips/TripCostEntryModal.tsx`)
   - Modal for adding or editing cost entries
   - Includes form fields for cost category, sub-type, amount, etc.
   - Handles document attachment and missing documentation reasons

3. **SystemCostsModal** (`/src/components/Models/Trips/SystemCostsModal.tsx`)
   - Modal for generating automatic operational costs
   - Calculates per-kilometer costs and per-day fixed costs
   - Shows breakdown of all costs that will be applied

## Integration Instructions

### 1. Fix Imports

In `/src/pages/trips/TripDetailsPage.tsx`:

1. Replace these imports:
```tsx
import {
  ArrowLeft,
  Truck,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Plus,
  Share2,
  Clipboard,
  AlertTriangle,
  CheckCircle,
  TruckIcon,
  PackageCheck,
  Flag
} from 'lucide-react';
import CostList from '../../components/lists/CostList';
import TripDetails from '../../components/TripManagement/TripDetails';

// Cost Entry Modal
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatters';
```

with these corrected imports:
```tsx
import {
  ArrowLeft,
  FileText,
  Plus,
  AlertTriangle,
  CheckCircle,
  TruckIcon,
  PackageCheck
} from 'lucide-react';
import CostList from '../../components/lists/CostList';
import { formatCurrency } from '../../utils/formatters';

// Import the actual modal components
import TripCostEntryModal from '../../components/Models/Trips/TripCostEntryModal';
import SystemCostsModal from '../../components/Models/Trips/SystemCostsModal';
```

### 2. Update Router Configuration

Add the following route to your router configuration file (likely in `App.tsx` or a separate router file):

```tsx
<Route path="/trips/:id" element={<TripDetailsPage />} />
```

### 3. Update Trip Context

Ensure your AppContext includes the following functions:
- `addCostEntry`
- `updateCostEntry` 
- `deleteCostEntry`
- `completeTrip`
- `updateTripStatus`

### 4. Update Active Trips Page

Modify your ActiveTripsPage to include links to the TripDetailsPage:

```tsx
<Button
  variant="link"
  onClick={() => navigate(`/trips/${trip.id}`)}
>
  View
</Button>
```

## Flow of Operation

1. **Active Trips Page** - Displays a list of all active trips
2. **Click "View"** - Opens TripDetailsPage for that specific trip
3. **TripDetailsPage** - Shows trip details and allows management of costs
4. **Add Cost Entry Button** - Opens TripCostEntryModal
5. **Generate System Costs Button** - Opens SystemCostsModal

## Data Structure Requirements

Ensure the following data structures are properly implemented in your types:

1. **Trip** - Should include:
   - Basic fields: id, fleetNumber, driverName, route, startDate, endDate
   - Financial fields: baseRevenue, costs, systemCostsGenerated
   - Status fields: status, shippedAt, deliveredAt

2. **CostEntry** - Should include:
   - Basic fields: id, category, subType, amount, referenceNumber, date
   - Document fields: attachments, missingDocReason
   - Flags: isFlagged, manuallyFlagged, isSystemGenerated

## Testing the Integration

1. Navigate to the ActiveTripsPage
2. Click "View" on a trip
3. Test the "Add Cost Entry" functionality
4. Test the "Generate System Costs" functionality
5. Test the "Ship", "Deliver", and "Complete Trip" buttons

This integration will provide the full trip management functionality as shown in the examples.
