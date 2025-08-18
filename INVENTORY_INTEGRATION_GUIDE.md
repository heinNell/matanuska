# Stock Inventory Data Integration Guide

## Overview

This document describes the process of integrating stock inventory data from the legacy system into the new Matanuska Transport application. The integration involves transforming data from the original format to match the structure expected by the WorkshopContext in the frontend application.

## Data Formats

### Original Data Format (seedStockInventory.mjs)

```javascript
{
  StoreName: "MUTARE DEPOT STOCK",
  StockCde: "14LHUB",
  SupplierPartNo: "",
  StockDescription: "14L HUB",
  StockCostPrice: 250.0,
  StockQty: 0.0,
  StockValue: 0.0,
  ReorderLevel: 0
}
```

### Transformed Data Format (Expected by WorkshopContext)

```javascript
{
  itemCode: "14LHUB",
  itemName: "14L HUB",
  category: "HUB PARTS",
  subCategory: "TRUCK PARTS",
  description: "14L HUB",
  unit: "ea",
  quantity: 0.0,
  reorderLevel: 0,
  cost: 250.0,
  vendor: "GENERAL SUPPLIER",
  vendorId: "general_supplier",
  location: "MUTARE DEPOT STOCK",
  lastRestocked: "2025-08-18",
}
```

## Transformation Process

The transformation process involves:

1. Reading data from `seedStockInventory.mjs`
2. Converting each item to match the expected format for WorkshopContext
3. Adding additional metadata such as categories, vendor information, and units
4. Saving the transformed data to `transformed-inventory.cjs`

## Tools Available

### transform-inventory-data.cjs

A utility script that automates the transformation of inventory data:

```bash
node scripts/transform-inventory-data.cjs
```

This script:
- Reads data from `seedStockInventory.mjs`
- Applies transformation logic to match the expected format
- Writes the transformed data to `transformed-inventory.cjs`
- Uses intelligent categorization based on item descriptions

### data-seeder.cjs

The main data seeding script that populates the Firestore database:

```bash
node scripts/data-seeder.cjs --collections inventory --force
```

This script:
- Reads transformed inventory data
- Seeds it into the Firestore database in the `stockInventory` collection
- Uses unique item codes as document IDs
- Adds timestamp metadata to each item

## Integration Flow

1. If new inventory data is available, update `seedStockInventory.mjs`
2. Run the transformation script:
   ```
   node scripts/transform-inventory-data.cjs
   ```
3. Run the seeder script to populate Firestore:
   ```
   node scripts/data-seeder.cjs --collections inventory --force
   ```

## Frontend Integration

The StockInventoryPage component and WorkshopContext handle the display and management of inventory items in the frontend. The transformed data structure aligns with what these components expect, allowing seamless integration.

## Adding New Vendors

When adding new items that reference new vendors, make sure to add the vendor information to the `vendorList` array in `data-seeder.cjs`.
