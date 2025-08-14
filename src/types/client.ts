import { v4 as uuidv4 } from 'uuid';

export interface Client {
  id: string;
  name: string;
  type: 'internal' | 'external';
  status: 'active' | 'inactive' | 'pending' | 'archived';
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  vatNumber?: string;
  registrationNumber?: string;
  paymentTerms?: number; // Days
  creditLimit?: number;
  currency: 'ZAR' | 'USD';
  notes?: string;
  website?: string;
  industry?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  relationships: ClientRelationship[];
}

export interface ClientRelationship {
  id: string;
  relatedClientId: string;
  relationType: 'parent' | 'subsidiary' | 'partner' | 'competitor';
  notes?: string;
  createdAt: string;
}

export const CLIENT_INDUSTRIES = [
  'Agriculture',
  'Mining',
  'Construction',
  'Manufacturing',
  'Wholesale & Retail',
  'Transportation',
  'Healthcare',
  'Financial Services',
  'Technology',
  'Other'
];

export const CLIENT_TYPES = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' }
];

export const CLIENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' }
];

export const CLIENT_RELATIONSHIP_TYPES = [
  { value: 'parent', label: 'Parent Company' },
  { value: 'subsidiary', label: 'Subsidiary' },
  { value: 'partner', label: 'Business Partner' },
  { value: 'competitor', label: 'Competitor' }
];

// Helper function to create a new client with default values
export const createNewClient = (): Omit<Client, 'id'> => {
  const timestamp = new Date().toISOString();
  
  return {
    name: '',
    type: 'external',
    status: 'active',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    currency: 'ZAR',
    createdAt: timestamp,
    updatedAt: timestamp,
    relationships: []
  };
};

// Helper function to add a relationship between clients
export const addClientRelationship = (
  client: Client,
  relatedClientId: string,
  relationType: 'parent' | 'subsidiary' | 'partner' | 'competitor',
  notes?: string
): Client => {
  const relationship: ClientRelationship = {
    id: uuidv4(),
    relatedClientId,
    relationType,
    notes,
    createdAt: new Date().toISOString()
  };
  
  return {
    ...client,
    relationships: [...client.relationships, relationship],
    updatedAt: new Date().toISOString()
  };
};