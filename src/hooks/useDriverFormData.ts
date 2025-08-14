import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

interface LicenseCategory {
  id: string;
  code: string;
  description: string;
}

export interface DriverLicense {
  number: string;
  expiry: string;
  categories: string[]; // Array of license category codes
  country: string;
  status: "valid" | "expired" | "revoked" | "suspended";
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
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo?: {
    conditions: string;
    bloodType?: string;
    allergies?: string;
  };
}

export const useDriverLicenseCategories = () => {
  const [categories, setCategories] = useState<LicenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesRef = collection(db, "licenseCategories");
        const snapshot = await getDocs(categoriesRef);
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<LicenseCategory, "id">),
        }));
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching license categories:", err);
        // Fallback to default categories if Firestore fails
        setCategories([
          { id: "1", code: "A", description: "Motorcycles" },
          { id: "2", code: "B", description: "Light motor vehicles" },
          { id: "3", code: "C", description: "Heavy motor vehicles" },
          { id: "4", code: "D", description: "Combination heavy vehicles" },
          { id: "5", code: "E", description: "Extra heavy vehicles" },
        ]);
        setError("Failed to load license categories from database");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export const useCountries = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);

        // Try to fetch from Firestore first
        const countriesRef = collection(db, "countries");
        const snapshot = await getDocs(countriesRef);

        if (!snapshot.empty) {
          const countriesData = snapshot.docs.map((doc) => doc.data().name as string);
          setCountries(countriesData);
        } else {
          // Fallback to default countries
          setCountries([
            "South Africa",
            "Namibia",
            "Botswana",
            "Zimbabwe",
            "Mozambique",
            "Lesotho",
            "Eswatini",
            "Zambia",
            "Malawi",
            "Angola",
          ]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching countries:", err);
        // Fallback to default African countries
        setCountries([
          "South Africa",
          "Namibia",
          "Botswana",
          "Zimbabwe",
          "Mozambique",
          "Lesotho",
          "Eswatini",
          "Zambia",
          "Malawi",
          "Angola",
        ]);
        setError("Failed to load countries from database");
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};

export const useDriverStatusOptions = () => {
  return [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on-leave", label: "On Leave" },
    { value: "suspended", label: "Suspended" },
  ];
};

export const useLicenseStatusOptions = () => {
  return [
    { value: "valid", label: "Valid" },
    { value: "expired", label: "Expired" },
    { value: "revoked", label: "Revoked" },
    { value: "suspended", label: "Suspended" },
  ];
};

export const useBloodTypes = () => {
  return ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
};

export const useDriver = (driverId: string | null) => {
  const [driver, setDriver] = useState<DriverData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) return;

    const fetchDriver = async () => {
      try {
        setLoading(true);
        // This would normally fetch the driver from Firestore
        // For now, we'll just simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setDriver(null); // In a real app, we would set actual driver data
        setError(null);
      } catch (err) {
        console.error("Error fetching driver data:", err);
        setError("Failed to load driver data");
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [driverId]);

  return { driver, loading, error };
};
