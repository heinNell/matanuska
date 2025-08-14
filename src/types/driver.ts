export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  status: "Active" | "Inactive" | "On Leave";
  licenseExpiry: string; // Should be ISO date string
  phone: string;
  safetyScore: number;
  location: string;
}
