/**
 * Type definitions for vendor related data
 */

/**
 * Represents a vendor/supplier in the system
 */
export interface Vendor {
  /** Unique identifier for the vendor */
  vendorId: string;
  /** Display name of the vendor */
  vendorName: string;
  /** Name of primary contact person */
  contactPerson: string;
  /** Business email address */
  workEmail: string;
  /** Contact phone number */
  mobile: string;
  /** Physical/postal address */
  address: string;
  /** City where vendor is located */
  city: string;
}

/**
 * Type guard to check if an object is a valid Vendor
 */
export function isVendor(obj: any): obj is Vendor {
  return (
    obj &&
    typeof obj.vendorId === 'string' &&
    typeof obj.vendorName === 'string' &&
    typeof obj.contactPerson === 'string' &&
    typeof obj.workEmail === 'string' &&
    typeof obj.mobile === 'string' &&
    typeof obj.address === 'string' &&
    typeof obj.city === 'string'
  );
}
