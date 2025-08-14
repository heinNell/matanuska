import { serverTimestamp } from 'firebase/firestore';
// If you need Timestamp, import it from 'firebase/firestore' (modular SDK v9+)
import { Timestamp } from 'firebase/firestore';

/**
 * Utility functions for Firestore data handling
 */

/**
 * Cleans an object for storing in Firestore by removing undefined values
 * which Firestore doesn't accept.
 *
 * @param obj - Any object to clean
 * @returns A new object with undefined values removed
 */
export const cleanObjectForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectForFirestore(item));
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanObjectForFirestore(value);
      }
    }
    return cleaned;
  }

  return obj;
};

/**
 * Converts Firestore timestamp objects to ISO strings
 * for better compatibility with JavaScript dates.
 *
 * @param obj - Any object that might contain Firestore timestamps
 * @returns A new object with timestamps converted to ISO strings
 */
export const convertTimestamps = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Firestore Timestamp objects
  try {
    if (obj instanceof Timestamp) {
      return obj.toDate().toISOString();
    }

    // Also check for a toDate() method to handle different Timestamp implementations
    if (obj && typeof obj.toDate === 'function') {
      return obj.toDate().toISOString();
    }
  } catch (err) {
    console.error("Error converting timestamp:", err);
    // Return the original object if conversion fails
    return obj;
  }

  if (Array.isArray(obj)) {
    // Safely convert array items
    try {
      return obj.map(item => convertTimestamps(item));
    } catch (err) {
      console.error("Error converting array items:", err);
      return obj;
    }
  }

  if (typeof obj === 'object') {
    // Handle regular objects
    try {
      const converted: Record<string, any> = {};
      Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined) {
          converted[key] = convertTimestamps(value);
        }
      });
      return converted;
    } catch (err) {
      console.error("Error converting object properties:", err);
      return obj;
    }
  }

  return obj;
};

/**
 * Prepares data for Firestore by removing undefined values and adding timestamps
 *
 * @param data - The data object to prepare
 * @param addTimestamp - Whether to add server timestamps (default: true)
 * @returns A cleaned data object ready for Firestore
 */
export const prepareForFirestore = (data: any, addTimestamp = true): any => {
  const cleaned = cleanObjectForFirestore(data);

  if (addTimestamp) {
    return {
      ...cleaned,
      updatedAt: serverTimestamp(),
    };
  }

  return cleaned;
};
