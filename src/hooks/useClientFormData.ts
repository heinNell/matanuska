import { collection, getDocs, query, where } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/firebase";

export interface ClientContact {
  name: string;
  position: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface ClientBankingDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchCode: string;
  accountType: string;
}

export interface ClientData {
  id?: string;
  companyName: string;
  tradingAs?: string;
  registrationNumber: string;
  vatNumber?: string;
  contactPerson?: string;
  phone: string;
  email: string;
  website?: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  industry?: string;
  paymentTerms: string; // e.g., "Net 30", "COD"
  creditLimit?: number;
  status: "active" | "inactive" | "pending" | "blacklisted";
  notes?: string;
  contacts?: ClientContact[];
  bankingDetails?: ClientBankingDetails;
  createdAt?: any;
  updatedAt?: any;
}

export const usePaymentTermOptions = () => {
  return [
    { id: "net7", label: "Net 7 days" },
    { id: "net14", label: "Net 14 days" },
    { id: "net30", label: "Net 30 days" },
    { id: "net60", label: "Net 60 days" },
    { id: "cod", label: "Cash on Delivery" },
    { id: "prepaid", label: "Prepaid" },
    { id: "eom", label: "End of Month" },
    { id: "custom", label: "Custom" },
  ];
};

export const useIndustryOptions = () => {
  return [
    "Agriculture",
    "Construction",
    "Education",
    "Energy",
    "Finance",
    "Food & Beverage",
    "Government",
    "Healthcare",
    "Hospitality",
    "Information Technology",
    "Logistics",
    "Manufacturing",
    "Mining",
    "Real Estate",
    "Retail",
    "Services",
    "Telecommunications",
    "Transport",
    "Other",
  ];
};

export const useClientStatusOptions = () => {
  return [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending Approval" },
    { value: "blacklisted", label: "Blacklisted" },
  ];
};

export const useBankOptions = () => {
  return [
    "ABSA Bank",
    "Capitec Bank",
    "Discovery Bank",
    "First National Bank",
    "Investec Bank",
    "Nedbank",
    "Standard Bank",
    "TymeBank",
    "Other",
  ];
};

export const useAccountTypeOptions = () => {
  return ["Current/Cheque", "Savings", "Business", "Credit Card", "Transmission", "Other"];
};

export const useCountries = () => {
  return [
    "South Africa",
    "Namibia",
    "Botswana",
    "Zimbabwe",
    "Mozambique",
    "Lesotho",
    "Eswatini",
    "Zambia",
    "Angola",
    "Malawi",
  ];
};

export const useProvinces = (country: string = "South Africa") => {
  const provinces = {
    "South Africa": [
      "Eastern Cape",
      "Free State",
      "Gauteng",
      "KwaZulu-Natal",
      "Limpopo",
      "Mpumalanga",
      "North West",
      "Northern Cape",
      "Western Cape",
    ],
    Namibia: [
      "Erongo",
      "Hardap",
      "Karas",
      "Kavango East",
      "Kavango West",
      "Khomas",
      "Kunene",
      "Ohangwena",
      "Omaheke",
      "Omusati",
      "Oshana",
      "Oshikoto",
      "Otjozondjupa",
      "Zambezi",
    ],
    Botswana: [
      "Central",
      "Ghanzi",
      "Kgalagadi",
      "Kgatleng",
      "Kweneng",
      "North-East",
      "North-West",
      "South-East",
      "Southern",
    ],
    // Add more countries as needed
  };

  return provinces[country as keyof typeof provinces] || [];
};

export const useClientFormData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkDuplicateRegistrationNumber = async (
    regNumber: string,
    excludeId?: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const clientsRef = collection(db, "clients");
      const q = query(clientsRef, where("registrationNumber", "==", regNumber));

      const querySnapshot = await getDocs(q);

      // Check if there are any documents with the same regNumber, excluding the current client
      let isDuplicate = false;
      querySnapshot.forEach((doc) => {
        if (!excludeId || doc.id !== excludeId) {
          isDuplicate = true;
        }
      });

      return isDuplicate;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An error occurred checking duplicate registration")
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicateVATNumber = async (
    vatNumber: string,
    excludeId?: string
  ): Promise<boolean> => {
    if (!vatNumber) return false;

    setLoading(true);
    setError(null);

    try {
      const clientsRef = collection(db, "clients");
      const q = query(clientsRef, where("vatNumber", "==", vatNumber));

      const querySnapshot = await getDocs(q);

      // Check if there are any documents with the same VAT number, excluding the current client
      let isDuplicate = false;
      querySnapshot.forEach((doc) => {
        if (!excludeId || doc.id !== excludeId) {
          isDuplicate = true;
        }
      });

      return isDuplicate;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An error occurred checking duplicate VAT number")
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    checkDuplicateRegistrationNumber,
    checkDuplicateVATNumber,
  };
};

export default useClientFormData;
