import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc, QueryConstraint, DocumentData } from 'firebase/firestore';

// Define a type for the options object to fix implicit 'any' and property errors
interface ClientDropdownOptions {
  activeOnly?: boolean;
  includeContact?: boolean;
  sortBy?: string;
  descending?: boolean;
}

// Define a type for the client object returned by the hook
interface ClientDropdownItem {
  id: string;
  value: string;
  label: string;
  data: DocumentData; // Keep DocumentData for the raw Firestore data
  contactPerson?: string;
  email?: string;
  phone?: string;
}

/**
 * Custom hook to fetch client data for dropdown components
 *
 * @param {ClientDropdownOptions} options - Configuration options
 * @param {boolean} options.activeOnly - When true, only fetch active clients
 * @param {boolean} options.includeContact - When true, include contact information in the returned data
 * @param {string} options.sortBy - Field to sort by (default: 'client')
 * @param {boolean} options.descending - Sort in descending order when true
 * @returns {Object} Result object containing clients data and loading state
 */
export function useClientDropdown(options: ClientDropdownOptions = {}) {
  const {
    activeOnly = true,
    includeContact = false,
    sortBy = 'client',
    descending = false,
  } = options;

  // Specify the type for the state
  const [clients, setClients] = useState<ClientDropdownItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const db = getFirestore();

        // Build the query
        const clientsCollection = collection(db, 'clients');
        const queryConstraints: QueryConstraint[] = [];

        // Filter for active clients if requested
        if (activeOnly) {
          queryConstraints.push(where('active', '==', true));
        }

        // Add sorting
        queryConstraints.push(orderBy(sortBy, descending ? 'desc' : 'asc'));

        // Execute query
        const clientsSnapshot = await getDocs(query(clientsCollection, ...queryConstraints));

        // Process results
        const clientsList: ClientDropdownItem[] = clientsSnapshot.docs.map(doc => {
          const data = doc.data(); // data is already DocumentData

          // Base client object for dropdown
          const clientObj: ClientDropdownItem = {
            id: doc.id,
            value: doc.id,
            label: data.client || 'Unnamed Client',
            // Include full data for reference
            data: data,
          };

          // Add contact info if requested
          if (includeContact) {
            clientObj.contactPerson = data.contact || '';
            clientObj.email = data.email || '';
            clientObj.phone = data.telNo1 || data.telNo2 || '';
          }

          return clientObj;
        });

        setClients(clientsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching clients:', err);
        // Cast err to Error to get a message
        setError((err as Error).message);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [activeOnly, includeContact, sortBy, descending]);

  return { clients, loading, error };
}

// Define a type for the search options
interface ClientSearchOptions {
  limit?: number;
  activeOnly?: boolean;
  fields?: string[];
}

/**
 * Custom hook to search clients by name or other properties
 *
 * @param {string} searchTerm - Term to search for
 * @param {ClientSearchOptions} options - Additional options
 * @returns {Object} Search results and loading state
 */
export function useClientSearch(searchTerm = '', options: ClientSearchOptions = {}) {
  const {
    limit = 10,
    activeOnly = true,
    fields = ['client', 'contact', 'email'],
  } = options;

  const [results, setResults] = useState<ClientDropdownItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't search if term is too short
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const searchClients = async () => {
      try {
        setLoading(true);
        const db = getFirestore();

        // Get all clients (we'll filter client-side)
        const clientCollectionRef = collection(db, 'clients'); // Use a different name to avoid confusion

        let clientQuery = query(clientCollectionRef); // Start with a base query

        if (activeOnly) {
          clientQuery = query(clientQuery, where('active', '==', true));
        }

        const snapshot = await getDocs(clientQuery);

        // Convert search term to lowercase for case-insensitive matching
        const term = searchTerm.toLowerCase();

        // Filter and map results
        const filtered: ClientDropdownItem[] = snapshot.docs
          .filter(doc => {
            const data = doc.data();

            // Check if any specified field contains the search term
            return fields.some((field: string) => { // Explicitly type 'field' as string
              const value = data[field];
              return value && typeof value === 'string' && value.toLowerCase().includes(term);
            });
          })
          .slice(0, limit)
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              value: doc.id,
              label: data.client || 'Unnamed Client',
              data: data,
            };
          });

        setResults(filtered);
        setError(null);
      } catch (err) {
        console.error('Error searching clients:', err);
        setError((err as Error).message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search to avoid excessive Firestore reads
    const timer = setTimeout(() => {
      searchClients();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, limit, activeOnly, fields]);

  return { results, loading, error };
}

// Define a type for a single client document
interface ClientDocumentData { // Renamed to avoid confusion with ClientDocument in useClient
  client: string;
  contact?: string; // Optional contact
  email?: string; // Optional email
  telNo1?: string; // Optional phone numbers
  telNo2?: string;
  // Add any other fields you expect to retrieve from a client document
}

/**
 * Custom hook to get a single client by ID
 *
 * @param {string} clientId - The ID of the client to fetch
 * @returns {Object} Client data and loading state
 */
export function useClient(clientId: string) {
  // Specify the type for the state, which can be null
  const [client, setClient] = useState<ClientDocumentData & { id: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setClient(null);
      setLoading(false);
      return;
    }

    const fetchClient = async () => {
      try {
        setLoading(true);
        const db = getFirestore();

        // Use v9 syntax: doc() and getDoc()
        const clientDocRef = doc(db, 'clients', clientId);
        const clientDoc = await getDoc(clientDocRef);

        if (clientDoc.exists()) {
          setClient({
            id: clientDoc.id,
            ...(clientDoc.data() as ClientDocumentData) // Assert the data type
          });
        } else {
          setError(`Client with ID ${clientId} not found`);
          setClient(null);
        }
      } catch (err) {
        console.error(`Error fetching client ${clientId}:`, err);
        setError((err as Error).message);
        setClient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  return { client, loading, error };
}
