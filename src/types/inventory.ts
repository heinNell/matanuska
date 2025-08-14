/**
 * Inventory Management Types
 *
 * This file contains TypeScript interfaces for the inventory management system,
 * including purchase orders, vendors, and inventory items.
 */

/**
 * Purchase Order Interface
 */
export interface PurchaseOrder {
  id: string;
  sageId?: string;
  poNumber: string;
  vendor: string;
  vendorId?: string;
  orderDate: string;
  expectedDelivery?: string;
  status:
    | "draft"
    | "pending"
    | "approved"
    | "ordered"
    | "partially_received"
    | "received"
    | "cancelled";
  totalAmount: number;
  paymentStatus: "unpaid" | "partially_paid" | "paid";
  items: POItem[];
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

/**
 * Purchase Order Item Interface
 */
export interface POItem {
  id: string;
  sageId?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
  deliveryStatus?: "pending" | "partial" | "complete";
}

/**
 * Vendor Interface
 */
export interface Vendor {
  id: string;
  sageId?: string;
  name: string;
  contactPerson?: string;
  email: string;
  mobile?: string;
  address?: string;
  city?: string;
  paymentTerms?: number;
  taxNumber?: string;
  status?: "active" | "inactive";
  reliability?: number;
  qualityScore?: number;
  costScore?: number;
  deliveryScore?: number;
  overallScore?: number;
  lastOrderDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Inventory Item Interface
 */
export interface InventoryItem {
  id: string;
  sageId?: string;
  name: string;
  code: string;
  quantity: number;
  unitPrice: number;
  category: string;
  reorderLevel?: number;
  status?: "active" | "inactive";
  stockValue?: number;
  location?: string;
  lastReceived?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Stock Movement Record Interface
 */
export interface StockMovement {
  id: string;
  itemId: string;
  sageId?: string;
  type: "receipt" | "issue" | "adjustment" | "transfer" | "return" | "scrap";
  quantity: number;
  date: string;
  referenceNumber?: string;
  documentType?: "po" | "jo" | "transfer" | "manual";
  documentId?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

/**
 * Vendor Score Interface
 */
export interface VendorScore {
  id: string;
  vendorId: string;
  reliabilityScore: number;
  qualityScore: number;
  costScore: number;
  deliveryScore: number;
  overallScore: number;
  period: string;
  createdAt?: string;
}

/**
 * Purchase Order Request Interface
 */
export interface PurchaseOrderRequest {
  id: string;
  requestedBy: string;
  requestedDate: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "draft" | "pending" | "approved" | "rejected" | "ordered";
  items: RequestItem[];
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  poId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Request Item Interface
 */
export interface RequestItem {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  estimatedCost?: number;
  reason?: string;
  urgency: "low" | "medium" | "high" | "critical";
  notes?: string;
}

/**
 * Purchase Order Approval Interface
 */
export interface POApproval {
  id: string;
  poId: string;
  requestId?: string;
  approver: string;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  timestamp: string;
}

/**
 * Integration Settings Interface
 */
export interface IntegrationSettings {
  id: string;
  name: "sage" | "wialon" | "google_maps";
  enabled: boolean;
  lastSynced?: string;
  syncFrequency?: "manual" | "hourly" | "daily" | "weekly";
  syncSchedule?: string;
  apiKey?: string;
  apiEndpoint?: string;
  additionalConfig?: Record<string, any>;
  updatedAt?: string;
}

/**
 * Sync Log Interface
 */
export interface SyncLog {
  id: string;
  integrationId: string;
  timestamp: string;
  status: "success" | "partial" | "failed";
  entitiesProcessed?: number;
  entitiesSucceeded?: number;
  entitiesFailed?: number;
  errorDetails?: string;
  duration?: number;
}

// src/types/inventory.ts
export type OrderPartStatus =
  | "PENDING"
  | "ORDERED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export interface OrderPart {
  id: string;
  sku: string;
  description: string;
  quantityOrdered: number;
  unitPrice: number;
  /** how many have been received so far */
  quantityReceived: number;
  status: OrderPartStatus;
}
