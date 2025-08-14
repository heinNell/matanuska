/**
 * Sage Data Mapping Utilities
 * 
 * This file contains functions to map between local data formats
 * and Sage API data formats for various entity types.
 */
import { PurchaseOrder, Vendor, InventoryItem, POItem } from '../types/inventory';

// Sage format interfaces
export interface SagePurchaseOrder {
  id?: string;
  number: string;
  supplier_id: string;
  supplier_name: string;
  order_date: string;
  expected_delivery_date?: string;
  status: string;
  total_amount: number;
  payment_status: string;
  items: SagePurchaseOrderItem[];
  notes?: string;
  approved_by?: string;
  approved_date?: string;
}

export interface SagePurchaseOrderItem {
  id?: string;
  code: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity?: number;
  uom?: string;
  tax_code?: string;
  tax_amount?: number;
}

export interface SageVendor {
  id: string;
  code: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: SageAddress;
  tax_number?: string;
  payment_terms_days?: number;
  currency_code?: string;
  status: string;
}

export interface SageAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface SageInventoryItem {
  id: string;
  code: string;
  description: string;
  category_id?: string;
  category_name?: string;
  unit_price: number;
  cost_price: number;
  tax_code?: string;
  stock_on_hand: number;
  reorder_level?: number;
  uom?: string;
  status: string;
}

/**
 * Map local PurchaseOrder to Sage format
 * @param po Local purchase order
 * @returns Sage formatted purchase order
 */
export function mapPurchaseOrderToSageFormat(po: PurchaseOrder): SagePurchaseOrder {
  return {
    id: po.sageId,
    number: po.poNumber,
    supplier_id: po.vendorId || '',
    supplier_name: po.vendor,
    order_date: po.orderDate,
    expected_delivery_date: po.expectedDelivery,
    status: mapLocalStatusToSage(po.status),
    total_amount: po.totalAmount,
    payment_status: mapLocalPaymentStatusToSage(po.paymentStatus),
    items: po.items.map(mapPOItemToSageFormat),
    notes: po.notes,
    approved_by: po.approvedBy,
    approved_date: po.approvedDate
  };
}

/**
 * Map local POItem to Sage format
 * @param item Local purchase order item
 * @returns Sage formatted purchase order item
 */
export function mapPOItemToSageFormat(item: POItem): SagePurchaseOrderItem {
  return {
    id: item.sageId,
    code: item.sku,
    description: item.name,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
    received_quantity: item.receivedQuantity || 0
  };
}

/**
 * Map Sage Vendor to local format
 * @param sageVendor Sage vendor data
 * @returns Local vendor format
 */
export function mapSageVendorToLocalFormat(sageVendor: SageVendor): Vendor {
  return {
    id: `sage-${sageVendor.id}`,
    sageId: sageVendor.id,
    name: sageVendor.name,
    contactPerson: sageVendor.contact_name,
    email: sageVendor.email || '',
    mobile: sageVendor.phone || '',
    address: sageVendor.address?.line1 || '',
    city: sageVendor.address?.city || '',
    paymentTerms: sageVendor.payment_terms_days,
    taxNumber: sageVendor.tax_number,
    status: sageVendor.status === 'active' ? 'active' : 'inactive'
  };
}

/**
 * Map Sage Inventory Item to local format
 * @param sageItem Sage inventory item data
 * @returns Local inventory item format
 */
export function mapSageInventoryToLocalFormat(sageItem: SageInventoryItem): InventoryItem {
  return {
    id: `sage-${sageItem.id}`,
    sageId: sageItem.id,
    name: sageItem.description,
    code: sageItem.code,
    quantity: sageItem.stock_on_hand,
    unitPrice: sageItem.unit_price,
    category: sageItem.category_name || 'Uncategorized',
    reorderLevel: sageItem.reorder_level || 10,
    status: sageItem.status === 'active' ? 'active' : 'inactive'
  };
}

/**
 * Map local status to Sage format
 * @param localStatus Local status string
 * @returns Sage status string
 */
function mapLocalStatusToSage(localStatus: string): string {
  const statusMap: Record<string, string> = {
    'draft': 'draft',
    'pending': 'pending_approval',
    'approved': 'approved',
    'ordered': 'sent',
    'partially_received': 'partially_received',
    'received': 'completed',
    'cancelled': 'cancelled'
  };
  
  return statusMap[localStatus] || 'draft';
}

/**
 * Map local payment status to Sage format
 * @param localStatus Local payment status
 * @returns Sage payment status
 */
function mapLocalPaymentStatusToSage(localStatus: string): string {
  const statusMap: Record<string, string> = {
    'unpaid': 'unpaid',
    'partially_paid': 'partially_paid',
    'paid': 'paid'
  };
  
  return statusMap[localStatus] || 'unpaid';
}