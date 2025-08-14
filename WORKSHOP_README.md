# Workshop Management Module

## Overview

The Workshop Management module is designed to provide comprehensive management capabilities for vehicle maintenance operations. It integrates with the broader transport management system, providing tools for tracking inventory, creating purchase orders, managing vendors, and handling vehicle maintenance workflows.

## Key Features

- **Real-time Data Integration**: All workshop data is synchronized in real-time with Firestore
- **Inventory Management**: Track parts, tools, and consumables with automatic low-stock alerts
- **Purchase Order System**: Create, approve, and track purchase orders for parts and equipment
- **Vendor Management**: Store and manage vendor details for easy procurement
- **Vehicle Inspections**: Conduct and record detailed vehicle inspections with customizable forms
- **Job Card System**: Create and track maintenance jobs with detailed task lists
- **Tyre Management**: Track tyre usage, rotation, and replacement schedules
- **Analytics & Reporting**: Comprehensive reporting on workshop operations and costs

## Technical Implementation

### Context Provider

The `WorkshopContext` serves as the central data management hub for the workshop module, providing:

- Real-time data synchronization with Firestore
- CRUD operations for vendors, stock items, and purchase orders
- Filtering and utility functions for data analysis

### Component Structure

- **WorkshopPage**: Main dashboard with overview metrics and navigation
- **VendorPage**: Interface for managing vendor information
- **PurchaseOrderPage**: Create and manage purchase orders
- **StockManager**: Track inventory levels and item details
- **InspectionForm**: Conduct vehicle inspections
- **JobCardManagement**: Create and track maintenance jobs

### Data Models

#### Vendor
```typescript
interface Vendor {
  id: string;
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  workEmail: string;
  mobile: string;
  address: string;
  city: string;
}
```

#### Stock Item
```typescript
interface StockItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  subCategory?: string;
  description: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  cost: number;
  vendor: string;
  vendorId: string;
  location: string;
  lastRestocked: string;
}
```

#### Purchase Order
```typescript
interface PurchaseOrder {
  id: string;
  poNumber: string;
  title: string;
  description: string;
  dueDate: string;
  vendor: string;
  vendorId?: string;
  requester: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Pending' | 'Approved' | 'Ordered' | 'Received' | 'Cancelled' | 'Completed';
  terms: string;
  poType: 'Standard' | 'Emergency' | 'Planned' | 'Service';
  shippingAddress: string;
  items: PurchaseOrderItem[];
  subTotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  attachments: string[];
}
```

## Integration Points

- **Driver Management**: Connects to driver records for assigning responsibility for vehicles
- **Trip Management**: Links to trip data to schedule maintenance around vehicle availability
- **Fleet Management**: Integrates with fleet records for comprehensive vehicle history
- **Reporting System**: Feeds data into the centralized reporting module for analytics

## Seeding Data

The repository includes seed scripts to populate test data for development:

- `seedVendors.mjs`: Populates vendor information
- `seedStockInventory.mjs`: Adds stock inventory items
- `seedPurchaseOrders.mjs`: Creates sample purchase orders

Run these scripts with Node.js to populate your Firestore database:

```
node seedVendors.mjs
node seedStockInventory.mjs
node seedPurchaseOrders.mjs
```

## Future Enhancements

- Barcode/QR code scanning for inventory management
- Predictive maintenance scheduling based on vehicle usage patterns
- Integration with supplier APIs for automated ordering
- Mobile app support for workshop technicians
- Advanced analytics for maintenance cost optimization

## Related Documentation

- [Equipment Management Guide](EQUIPMENT_MANAGEMENT.md)
- [Workshop Standard Operating Procedures](WORKSHOP_SOP.md)
- [Maintenance Schedule Templates](MAINTENANCE_TEMPLATES.md)
