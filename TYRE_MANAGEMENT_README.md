# Tyre Management System Documentation

## Overview

The Tyre Management System tracks and manages tyres across the fleet. It includes:

- Tyre inventory management
- Vehicle-specific tyre position configurations
- Tyre rotation tracking
- Tyre history and maintenance

## Database Structure

The system uses Firestore with the following collections:

### 1. `tyreBrands`
Contains all tyre manufacturers.

```
{
  "id": "michelin",
  "name": "Michelin",
  "createdAt": "2023-10-01T12:00:00.000Z"
}
```

### 2. `tyreSizes`
Standard tyre sizes in the industry.

```
{
  "id": "31580r225",
  "size": "315/80R22.5",
  "createdAt": "2023-10-01T12:00:00.000Z"
}
```

### 3. `tyrePatterns`
Brand-pattern-size combinations with recommended positions.

```
{
  "id": "michelin_xmultid_31580r225",
  "brand": "Michelin",
  "pattern": "X Multi D",
  "size": "315/80R22.5",
  "position": "Drive",
  "createdAt": "2023-10-01T12:00:00.000Z"
}
```

### 4. `vehiclePositions`
Defines available positions for each vehicle type.

```
{
  "id": "horse",
  "vehicleType": "horse",
  "name": "Horse (Truck Tractor)",
  "positions": [
    { "id": "V1", "name": "Axle 1 - Left Side" },
    { "id": "V2", "name": "Axle 1 - Right Side" },
    ...
  ],
  "createdAt": "2023-10-01T12:00:00.000Z"
}
```

### 5. `tyres`
Individual tyre records.

```
{
  "id": "T12345",
  "tyreNumber": "T12345",
  "tyreSize": "315/80R22.5",
  "type": "Drive",
  "pattern": "X Multi D",
  "manufacturer": "Michelin",
  "year": "2023",
  "cost": 3500,
  "condition": "New",
  "status": "In-Service",
  "vehicleAssigned": "MAT001",
  "vehicleType": "horse",
  "axlePosition": "V3",
  "mountStatus": "Mounted",
  "kmRun": 0,
  "kmLimit": 60000,
  "treadDepth": 14,
  "notes": "",
  "datePurchased": "2023-10-01T00:00:00.000Z",
  "lastInspection": "2023-10-01T00:00:00.000Z"
}
```

## Vehicle Types and Position Configurations

The system supports multiple vehicle types, each with specific tyre position configurations:

1. **Standard** - Generic configuration with front, drive, and trailer axle positions
2. **Horse (Truck Tractor)** - Steer axle and two drive axles, with dual tyres on drive axles
3. **Reefer (3-Axle Trailer)** - Single tyres on three axles
4. **Interlink (4-Axle Trailer)** - Dual tyres on four axles
5. **LMV (Light Motor Vehicle)** - Passenger vehicles and light trucks

Each vehicle type has a specific position mapping with unique IDs and human-readable names.

## Seeding the Database

### Setup

1. Create a `serviceAccountKey.json` file in the project root:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json`

### Available Seed Scripts

1. **`seedtyrebranddata.mjs`** - Seeds brands, sizes, patterns, and vehicle positions
2. **`seedVendors.mjs`** - Seeds tyre vendor data
3. **`seedpossitions.mjs`** - Seeds fleet assets and tyre pattern data (legacy)

### How to Use Seed Scripts

Run with Node.js (version 18+):

```bash
# Seed all tyre brand data
node seedtyrebranddata.mjs

# Force update (delete existing data first)
node seedtyrebranddata.mjs --force

# Seed only a specific collection
node seedtyrebranddata.mjs tyreBrands
node seedtyrebranddata.mjs tyreSizes
node seedtyrebranddata.mjs tyrePatterns
node seedtyrebranddata.mjs vehiclePositions

# Seed vendors
node seedVendors.mjs --force
```

## UI Components

### `AddNewTyreForm.tsx`

The main form component for adding or editing tyres.

Features:
- Vehicle type selector that affects available axle positions
- Dynamic axle position dropdown based on vehicle type
- Full tyre details input
- Validation for required fields

### Tyre Visualization

Vehicle-specific tyre position diagrams are available to help users understand the position naming convention:

1. **Horse (Truck Tractor)**
   - Steer axle (2 tyres): V1, V2
   - Drive axle 1 (4 tyres): V3, V4, V5, V6
   - Drive axle 2 (4 tyres): V7, V8, V9, V10
   - Spare: SP

2. **Reefer (3-Axle Trailer)**
   - Axle 1 (2 tyres): T1, T2
   - Axle 2 (2 tyres): T3, T4
   - Axle 3 (2 tyres): T5, T6
   - Spares: SP1, SP2

3. **Interlink (4-Axle Trailer)**
   - Axle 1 (4 tyres): T1, T2, T5, T6
   - Axle 2 (4 tyres): T3, T4, T7, T8
   - Axle 3 (4 tyres): T9, T10, T13, T14
   - Axle 4 (4 tyres): T11, T12, T15, T16
   - Spares: SP1, SP2

## Integration with Vehicle Management

The tyre system links with the fleet management system via the `vehicleAssigned` field in the tyre records. This allows for:

1. Tracking which tyres are on which vehicles
2. Planning tyre rotations and replacements
3. Monitoring tyre performance by vehicle

## Customization

To add new vehicle types or position configurations:

1. Update the `vehicleConfigurations` object in `AddNewTyreForm.tsx`
2. Add the new configuration to the `vehiclePositions` array in `seedtyrebranddata.mjs`
3. Run the seeding script with `--force` to update the database

## Maintenance Best Practices

1. **Regular Seeding**: Run seed scripts when adding new brands or patterns
2. **Data Validation**: Ensure all tyre numbers are unique
3. **Position Consistency**: Always use the proper vehicle-specific positions
4. **Fleet Updates**: When adding new vehicles, add them to the fleet assets in the seeding scripts
