// Here are the Firebase functions that need to be implemented for Tyre and Inventory management
import { collection, doc, setDoc, updateDoc, deleteDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from './src/firebase';
import { handleFirestoreError } from './src/utils/firebaseConnectionHandler';
import { Tyre, TyreInspection, TyreStore } from './src/types/tyre';
import { InventoryItem, PurchaseOrder, StockMovement } from './src/types/inventory';

// ====================== TYRE MANAGEMENT FUNCTIONS ======================

// Add a new tyre to Firebase
export const addTyreToFirebase = async (tyre: Tyre) => {
  try {
    const tyreRef = doc(firestore, 'tyres', tyre.id);
    await setDoc(tyreRef, {
      ...tyre,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Tyre added with ID:', tyre.id);
    return tyre.id;
  } catch (error) {
    console.error('Error adding tyre:', error);
    await handleFirestoreError(error);
    throw error;
  }
};

// Update an existing tyre in Firebase
export async function updateTyreInFirebase(tyreId: string, tyreData: Partial<Tyre>) {
  try {
    const tyreRef = doc(firestore, 'tyres', tyreId);
    await setDoc(tyreRef, {
      ...tyreData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('Tyre updated with ID:', tyreId);
    return tyreId;
  } catch (error) {
    console.error('Error updating tyre:', error);
    await handleFirestoreError(error);
    throw error;
  }
}

// Delete a tyre from Firebase
export async function deleteTyreFromFirebase(tyreId: string) {
  try {
    const tyreRef = doc(firestore, 'tyres', tyreId);
    await deleteDoc(tyreRef);
    console.log('Tyre deleted with ID:', tyreId);
    return tyreId;
  } catch (error) {
    console.error('Error deleting tyre:', error);
    await handleFirestoreError(error);
    throw error;
  }
}

// Add a tyre inspection to Firebase
export const addTyreInspectionToFirebase = async (tyreId: string, inspection: TyreInspection) => {
  try {
    const inspectionRef = collection(firestore, 'tyres', tyreId, 'inspections');
    const docRef = await addDoc(inspectionRef, {
      ...inspection,
      createdAt: serverTimestamp()
    });
    console.log('Tyre inspection added with ID:', docRef.id);
    
    // Update the tyre record with the latest inspection details
    const tyreRef = doc(firestore, 'tyres', tyreId);
    await updateDoc(tyreRef, {
      'condition.treadDepth': inspection.treadDepth,
      'condition.pressure': inspection.pressure,
      'condition.temperature': inspection.temperature,
      'condition.lastInspectionDate': inspection.date,
      'updatedAt': serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding tyre inspection:', error);
    await handleFirestoreError(error);
    throw error;
  }
};

// Add a tyre store to Firebase
export const addTyreStoreToFirebase = async (store: TyreStore) => {
  try {
    const storeRef = doc(firestore, 'tyreStores', store.id);
    await setDoc(storeRef, {
      ...store,
      dateAdded: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Tyre store added with ID:', store.id);
    return store.id;
  } catch (error) {
    console.error('Error adding tyre store:', error);
    await handleFirestoreError(error);
    throw error;
  }
};

// Update a tyre store in Firebase
export async function updateTyreStoreInFirebase(storeId: string, storeData: Partial<TyreStore>) {
  try {
    const storeRef = doc(firestore, 'tyreStores', storeId);
    await setDoc(storeRef, {
      ...storeData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('Tyre store updated with ID:', storeId);
    return storeId;
  } catch (error) {
    console.error('Error updating tyre store:', error);
    await handleFirestoreError(error);
    throw error;
  }
}

// ====================== INVENTORY MANAGEMENT FUNCTIONS ======================

// Add an inventory item to Firebase
export const addInventoryItemToFirebase = async (item: InventoryItem) => {
  try {
    const itemRef = doc(firestore, 'inventory', item.id);
    await setDoc(itemRef, {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Inventory item added with ID:', item.id);
    return item.id;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    await handleFirestoreError(error);
    throw error;
  }
};

// Update an inventory item in Firebase
export async function updateInventoryItemInFirebase(itemId: string, itemData: Partial<InventoryItem>) {
  try {
    const itemRef = doc(firestore, 'inventory', itemId);
    await setDoc(itemRef, {
      ...itemData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('Inventory item updated with ID:', itemId);
    return itemId;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    await handleFirestoreError(error);
    throw error;
  }
}

// Delete an inventory item from Firebase
export async function deleteInventoryItemFromFirebase(itemId: string) {
  try {
    const itemRef = doc(firestore, 'inventory', itemId);
    await deleteDoc(itemRef);
    console.log('Inventory item deleted with ID:', itemId);
    return itemId;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    await handleFirestoreError(error);
    throw error;
  }
}

// Add a purchase order to Firebase
export const addPurchaseOrderToFirebase = async (order: PurchaseOrder) => {
  try {
    const orderRef = doc(firestore, 'purchaseOrders', order.id);
    await setDoc(orderRef, {
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Purchase order added with ID:', order.id);
    return order.id;
  } catch (error) {
    console.error('Error adding purchase order:', error);
    await handleFirestoreError(error);
    throw error;
  }
};

// Update a purchase order in Firebase
export async function updatePurchaseOrderInFirebase(orderId: string, orderData: Partial<PurchaseOrder>) {
  try {
    const orderRef = doc(firestore, 'purchaseOrders', orderId);
    await setDoc(orderRef, {
      ...orderData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('Purchase order updated with ID:', orderId);
    return orderId;
  } catch (error) {
    console.error('Error updating purchase order:', error);
    await handleFirestoreError(error);
    throw error;
  }
}

// Add a stock movement to Firebase
export const addStockMovementToFirebase = async (movement: StockMovement) => {
  try {
    // Add the stock movement record
    const movementRef = doc(firestore, 'stockMovements', movement.id);
    await setDoc(movementRef, {
      ...movement,
      createdAt: new Date().toISOString()
    });
    
    // Update the inventory item quantity
    const itemRef = doc(firestore, 'inventory', movement.itemId);
    
    // Get the current item data
    const itemDoc = await getDoc(itemRef);
    if (!itemDoc.exists()) {
      throw new Error(`Inventory item with ID ${movement.itemId} not found`);
    }
    
    const itemData = itemDoc.data() as InventoryItem;
    let newQuantity = itemData.quantity;
    
    // Adjust quantity based on movement type
    switch(movement.type) {
      case 'receipt':
      case 'return':
        newQuantity += movement.quantity;
        break;
      case 'issue':
      case 'scrap':
        newQuantity -= movement.quantity;
        break;
      case 'adjustment':
        // For adjustment, the quantity is the new absolute value
        newQuantity = movement.quantity;
        break;
      case 'transfer':
        // For transfer, we need to handle both source and destination locations
        // This would require additional logic in a real implementation
        break;
    }
    
    // Update the item quantity and last received date if applicable
    const updateData: Partial<InventoryItem> = {
      quantity: newQuantity,
      updatedAt: new Date().toISOString()
    };
    
    if (movement.type === 'receipt') {
      updateData.lastReceived = movement.date;
    }
    
    await updateDoc(itemRef, updateData);
    
    console.log('Stock movement added with ID:', movement.id);
    return movement.id;
  } catch (error) {
    console.error('Error processing stock movement:', error);
    await handleFirestoreError(error);
    throw error;
  }
};
