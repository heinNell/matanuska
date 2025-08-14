/**
 * Utility functions for QR code generation and processing
 */
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';

/**
 * Generate a unique QR code value
 */
export const generateQRValue = (): string => {
  return uuidv4().substring(0, 12); // Create a shorter unique ID for QR codes
};

/**
 * Creates a URL for QR code deep linking
 * @param type The type of entity (vehicle, part, tyre, etc.)
 * @param id The ID of the entity
 * @param params Additional parameters
 * @returns A URL string for the QR code
 */
export const createQRCodeUrl = (type: string, id: string, params?: Record<string, string>): string => {
  const baseUrl = window.location.origin;
  let url = `${baseUrl}/workshop/${type}/${id}`;
  
  // Add query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    url += `?${queryParams.toString()}`;
  }
  
  return url;
};

/**
 * Register a QR code in the database
 */
export const registerQRCode = async (
  type: 'fleet' | 'part' | 'tyre' | 'inspection' | 'jobcard',
  entityId: string,
  metadata: Record<string, any>
): Promise<string> => {
  try {
    const db = getFirestore();
    const qrValue = generateQRValue();
    
    await addDoc(collection(db, 'qr_codes'), {
      qrValue,
      type,
      entityId,
      metadata,
      createdAt: new Date().toISOString(),
      lastScanned: null,
      scanCount: 0
    });
    
    return qrValue;
  } catch (error) {
    console.error('Error registering QR code:', error);
    throw error;
  }
};

/**
 * Process a scanned QR code
 * @param qrValue The scanned QR code value
 * @returns Information about the entity the QR code represents
 */
export const processQRCode = async (qrValue: string): Promise<{
  type: string;
  entityId: string;
  metadata: Record<string, any>;
  entity?: any;
} | null> => {
  try {
    const db = getFirestore();
    
    // First, check if this is a URL
    try {
      const url = new URL(qrValue);
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      // If it's one of our workshop URLs
      if (pathParts.length >= 2 && pathParts[0] === 'workshop') {
        const type = pathParts[1];
        const entityId = pathParts[2] || '';
        const params: Record<string, any> = {};
        
        // Extract query parameters
        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });
        
        // Load entity data based on type
        let entity = null;
        switch (type) {
          case 'vehicle':
          case 'fleet':
            if (entityId) {
              const vehiclesRef = collection(db, 'vehicles');
              const vehicleQuery = query(vehiclesRef, where('fleetNumber', '==', entityId));
              const vehicleSnapshot = await getDocs(vehicleQuery);
              if (!vehicleSnapshot.empty) {
                entity = { id: vehicleSnapshot.docs[0].id, ...vehicleSnapshot.docs[0].data() };
              }
            }
            break;
          case 'part':
          case 'parts':
            if (params.part) {
              const stockRef = collection(db, 'stock_items');
              const stockQuery = query(stockRef, where('itemCode', '==', params.part));
              const stockSnapshot = await getDocs(stockQuery);
              if (!stockSnapshot.empty) {
                entity = { id: stockSnapshot.docs[0].id, ...stockSnapshot.docs[0].data() };
              }
            }
            break;
          case 'tyre':
          case 'tyres':
            if (params.fleet && params.position) {
              const tyresRef = collection(db, 'tyre_inventory');
              const tyreQuery = query(
                tyresRef, 
                where('fleetNumber', '==', params.fleet),
                where('position', '==', params.position)
              );
              const tyreSnapshot = await getDocs(tyreQuery);
              if (!tyreSnapshot.empty) {
                entity = { id: tyreSnapshot.docs[0].id, ...tyreSnapshot.docs[0].data() };
              }
            }
            break;
          default:
            // Generic entity handling
            break;
        }
        
        return {
          type,
          entityId,
          metadata: params,
          entity
        };
      }
    } catch (e) {
      // Not a URL or not our URL format
    }
    
    // If not a URL, look up in QR codes collection
    const qrCodesRef = collection(db, 'qr_codes');
    const qrQuery = query(qrCodesRef, where('qrValue', '==', qrValue));
    const qrSnapshot = await getDocs(qrQuery);
    
    if (qrSnapshot.empty) {
      return null; // QR code not found
    }
    
    const qrDoc = qrSnapshot.docs[0];
    const qrData = qrDoc.data();
    
    // Update scan count and last scanned timestamp
    await updateDoc(doc(db, 'qr_codes', qrDoc.id), {
      scanCount: (qrData.scanCount || 0) + 1,
      lastScanned: new Date().toISOString()
    });
    
    // Load the associated entity
    let entity = null;
    switch (qrData.type) {
      case 'fleet':
        const vehicleRef = doc(db, 'vehicles', qrData.entityId);
        const vehicleSnap = await getDoc(vehicleRef);
        if (vehicleSnap.exists()) {
          entity = { id: vehicleSnap.id, ...vehicleSnap.data() };
        }
        break;
      case 'part':
        const partRef = doc(db, 'stock_items', qrData.entityId);
        const partSnap = await getDoc(partRef);
        if (partSnap.exists()) {
          entity = { id: partSnap.id, ...partSnap.data() };
        }
        break;
      case 'tyre':
        const tyreRef = doc(db, 'tyre_inventory', qrData.entityId);
        const tyreSnap = await getDoc(tyreRef);
        if (tyreSnap.exists()) {
          entity = { id: tyreSnap.id, ...tyreSnap.data() };
        }
        break;
      // Add more types as needed
    }
    
    return {
      type: qrData.type,
      entityId: qrData.entityId,
      metadata: qrData.metadata || {},
      entity
    };
  } catch (error) {
    console.error('Error processing QR code:', error);
    throw error;
  }
};

/**
 * Generate QR code for a stock item
 */
export const generateStockItemQR = async (itemId: string): Promise<string> => {
  try {
    const db = getFirestore();
    const itemRef = doc(db, 'stock_items', itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (!itemSnap.exists()) {
      throw new Error(`Stock item with ID ${itemId} not found`);
    }
    
    const itemData = itemSnap.data();
    const qrValue = generateQRValue();
    
    // Update the stock item with QR code
    await updateDoc(itemRef, {
      qrCode: qrValue,
      updatedAt: new Date().toISOString()
    });
    
    // Register QR code in the dedicated collection
    await registerQRCode('part', itemId, {
      itemCode: itemData.itemCode,
      itemName: itemData.itemName,
      category: itemData.category
    });
    
    return qrValue;
  } catch (error) {
    console.error('Error generating QR for stock item:', error);
    throw error;
  }
};

/**
 * Parse QR code data from URL or direct value
 */
export const parseQRCodeData = (qrData: string): {
  isUrl: boolean;
  type?: string;
  id?: string;
  params?: Record<string, string>;
} => {
  try {
    // Check if it's a URL
    const url = new URL(qrData);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Parse our app URLs
    if (pathParts.length >= 2 && pathParts[0] === 'workshop') {
      const type = pathParts[1];
      const id = pathParts[2] || '';
      const params: Record<string, string> = {};
      
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return { isUrl: true, type, id, params };
    }
    
    // It's a URL but not our format
    return { isUrl: true };
  } catch (e) {
    // Not a URL, could be a direct QR value or data
    return { isUrl: false };
  }
};
