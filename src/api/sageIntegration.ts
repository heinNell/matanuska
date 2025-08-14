/**
 * Sage Integration API
 * 
 * This file contains functions for interacting with the Sage API
 * to synchronize purchase orders, vendors, inventory, and other data.
 */
import axios from 'axios';
import { InventoryItem, Vendor, PurchaseOrder } from '../types/inventory';
// import { mapLocalToSageInventory } from '../../utils/sageDataMapping';
// import { mapSageToLocalInventory } from '../../utils/sageDataMapping'; // Uncomment if this export exists
import { sageAuthConfig } from '../config/sageAuth';

// Base API client for Sage
const createSageClient = async () => {
  const token = await getSageAccessToken();
  
  return axios.create({
    baseURL: sageAuthConfig.endpoint,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Error handling helper
const handleSageError = (error: any): never => {
  const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
  console.error(`Sage API Error: ${errorMessage}`, error);
  throw new Error(`Sage API Error: ${errorMessage}`);
};

/**
 * Fetch inventory items from Sage
 * @returns Promise with array of inventory items
 */
export async function fetchInventoryFromSage(): Promise<InventoryItem[]> {
  try {
    const client = await createSageClient();
    const response = await client.get('/inventory-items');
    
    // Map Sage format to local format
    // return response.data.items.map((item: SageInventoryItem) => 
    //   mapSageToLocalInventory(item)
    // );
    return response.data.items;
  } catch (error) {
    return handleSageError(error);
  }
}

/**
 * Synchronize local inventory item to Sage
 * @param itemData The inventory item data to synchronize
 * @returns Promise with the synchronized item
 */
export async function syncInventoryItemToSage(itemData: InventoryItem): Promise<InventoryItem> {
  try {
    const client = await createSageClient();
    const sageItemData = (itemData);
    
    // Determine if this is a new item or an update
    const isNewItem = !itemData.id;
    const url = isNewItem 
      ? '/inventory-items' 
      : `/inventory-items/${itemData.id}`;
    const method = isNewItem ? 'post' : 'put';
    
    const response = await client.request({
      method,
      url,
      data: sageItemData
    });
    // Return the updated item with Sage ID
    // return mapSageToLocalInventory(response.data);
    return response.data;
    return mapSageToLocalInventory(response.data);
  } catch (error) {
    return handleSageError(error);
  }
}

/**
 * Fetch single inventory item from Sage
 * @param itemId The Sage item ID to fetch
 * @returns Promise with inventory item
 */
export async function fetchInventoryItemFromSage(itemId: string): Promise<InventoryItem> {
  try {
    const client = await createSageClient();
    const response = await client.get(`/inventory-items/${itemId}`);
    
    return mapSageToLocalInventory(response.data);
  } catch (error) {
    return handleSageError(error);
  }
}

/**
 * Update inventory item quantity in Sage
 * @param itemId The Sage item ID to update
 * @param newQuantity The new quantity
 * @returns Promise with the updated item
 */
export async function updateInventoryQuantity(itemId: string, newQuantity: number): Promise<InventoryItem> {
  try {
    const client = await createSageClient();
    
    // First get the current item
    const response = await client.get(`/inventory-items/${itemId}`);
    const currentItem = response.data;
    
    // Update just the quantity
    const updateData = {
      quantityInStock: newQuantity
    };

    // Make the API call to update the item
    const updateResponse = await client.put(`/inventory-items/${itemId}`, {
      ...currentItem,
      ...updateData
    });

    // return mapSageToLocalInventory(updateResponse.data);
    return updateResponse.data;

    return mapSageToLocalInventory(updateResponse.data);
  } catch (error) {
    return handleSageError(error);
  }
}

/**
 * Delete inventory item in Sage
 * @param itemId The Sage item ID to delete
 * @returns Promise with success status
 */
export async function deleteInventoryItem(itemId: string): Promise<boolean> {
  try {
    const client = await createSageClient();
    await client.delete(`/inventory-items/${itemId}`);
    return true;
  } catch (error) {
    return handleSageError(error);
  }
}

/**
 * Sync a purchase order to Sage system
 * @param purchaseOrder - The purchase order to sync
 * @returns Success status
 */
export async function syncPurchaseOrderToSage(purchaseOrder: PurchaseOrder): Promise<boolean> {
  // This is a placeholder function - actual implementation would connect to Sage API
  console.log('Syncing purchase order to Sage:', purchaseOrder);
  return true;
}

/**
 * Update inventory items in Sage system
 * @param inventoryItems - The inventory items to update
 * @returns Success status
 */
export async function updateInventoryInSage(inventoryItems: InventoryItem[]): Promise<boolean> {
  // This is a placeholder function - actual implementation would connect to Sage API
  console.log('Updating inventory in Sage:', inventoryItems);
  return true;
}

/**
 * Import vendors from Sage system
 * @returns List of vendors from Sage
 */
export async function importVendorsFromSage(): Promise<Vendor[]> {
  // This is a placeholder function - actual implementation would connect to Sage API
  console.log('Importing vendors from Sage');
  return [];
}

/**
 * Import inventory items from Sage system
 * @returns List of inventory items from Sage
 */
export async function importInventoryFromSage(): Promise<InventoryItem[]> {
  // This is a placeholder function - actual implementation would connect to Sage API
  console.log('Importing inventory from Sage');
  return [];
}

/**
 * Import purchase orders from Sage system
 * @returns List of purchase orders from Sage
 */
export async function importPurchaseOrdersFromSage(): Promise<PurchaseOrder[]> {
  // This is a placeholder function - actual implementation would connect to Sage API
  console.log('Importing purchase orders from Sage');
  return [];
}

function mapSageToLocalInventory(data: any): InventoryItem {
  return {
    id: data.id || data.sageId || '',
    sageId: data.sageId || data.id,
    name: data.name || data.itemName || '',
    code: data.code || data.itemCode || '',
    quantity: typeof data.quantity === 'number' ? data.quantity : (data.quantityInStock ?? 0),
    unitPrice: typeof data.unitPrice === 'number' ? data.unitPrice : (data.price ?? 0),
    category: data.category || data.itemCategory || '',
    reorderLevel: data.reorderLevel ?? data.reorder_level,
    status: data.status === 'active' || data.status === 'inactive' ? data.status : undefined,
    stockValue: data.stockValue ?? data.stock_value,
    location: data.location,
    lastReceived: data.lastReceived ?? data.last_received,
    createdAt: data.createdAt ?? data.created_at,
    updatedAt: data.updatedAt ?? data.updated_at,
  };
}

function getSageAccessToken() {
  throw new Error('Function not implemented.');
}

