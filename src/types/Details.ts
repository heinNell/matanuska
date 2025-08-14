import { DriverLicense } from "../hooks/useDriverFormData";

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface MedicalInfo {
  conditions: string;
  bloodType?: string;
  allergies?: string;
}

export interface DriverDocuments {
  licenseFile?: string;
  passportFile?: string;
  defensiveDrivingPermit?: string;
}

export interface DriverData {
  id?: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  dateOfBirth?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  employeeNumber: string;
  licenseInfo: DriverLicense;
  dateHired: string;
  status: "active" | "inactive" | "on-leave" | "suspended";
  emergencyContact?: EmergencyContact;
  medicalInfo?: MedicalInfo;
  profilePhotoUrl?: string;
  documents?: DriverDocuments;
}
