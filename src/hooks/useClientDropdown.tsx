import { useMemo } from "react";
import { useClientDropdown as useClientDropdownBase } from "./useClients";

export interface ClientOption {
  label: string;
  value: string;
}

export interface UseClientDropdownOptions {
  activeOnly?: boolean;
  includeContact?: boolean;
  sortBy?: string;
  descending?: boolean;
}

// Define the client dropdown item interface based on what useClientDropdown returns
interface ClientDropdownItem {
  id: string;
  value: string;
  label: string;
  data: any;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

/**
 * Custom hook to fetch and format client data specifically for dropdowns.
 * Uses the useClientDropdown hook from useClients for data fetching.
 */
export function useClientDropdown(options: UseClientDropdownOptions = {}) {
  // Use the existing useClientDropdown hook from useClients
  const { clients: rawClients, loading, error } = useClientDropdownBase(options);

  // Transform ClientDropdownItem[] to ClientOption[] format
  const clients = useMemo(() => {
    return rawClients.map((client: ClientDropdownItem) => ({
      label: client.label,
      value: client.value,
    }));
  }, [rawClients]);

  return { clients, loading, error };
}
