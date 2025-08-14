import { v4 as uuidv4 } from 'uuid';

// Define Fault Category interface
export interface FaultCategory {
  id: string;
  name: string;
  description: string;
  subcategories: FaultSubcategory[];
}

// Define Fault Subcategory interface
export interface FaultSubcategory {
  id: string;
  name: string;
  description: string;
  typicalSeverity: FaultSeverity; // Default severity for this type
  typicalPartsNeeded?: string[];
  estimatedRepairHours?: number;
  specialistRequired?: boolean;
}

// Define Fault Severity enum
export type FaultSeverity = 'critical' | 'high' | 'medium' | 'low';

// Define Fault Status enum
export type FaultStatus = 'open' | 'in_progress' | 'resolved' | 'deferred';

// Define Fault interface
export interface Fault {
  id: string;
  fleetNumber: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  severity: FaultSeverity;
  status: FaultStatus;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  estimatedRepairHours?: number;
  jobCardId?: string;
  parts?: {
    name: string;
    quantity: number;
  }[];
  comments?: {
    id: string;
    text: string;
    createdBy: string;
    createdAt: string;
  }[];
  images?: {
    id: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
  }[];
}

// Predefined fault categories and subcategories
export const faultCategories: FaultCategory[] = [
  {
    id: uuidv4(),
    name: 'Engine',
    description: 'Engine and related components',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Engine Oil Leak',
        description: 'Oil leaking from engine components',
        typicalSeverity: 'high',
        typicalPartsNeeded: ['Gasket', 'Sealant'],
        estimatedRepairHours: 2.5
      },
      {
        id: uuidv4(),
        name: 'Overheating',
        description: 'Engine temperature exceeds normal operating range',
        typicalSeverity: 'critical',
        typicalPartsNeeded: ['Thermostat', 'Water Pump', 'Radiator Cap'],
        estimatedRepairHours: 3,
        specialistRequired: true
      },
      {
        id: uuidv4(),
        name: 'Excessive Smoke',
        description: 'Abnormal smoke from exhaust',
        typicalSeverity: 'high',
        estimatedRepairHours: 4,
        specialistRequired: true
      },
      {
        id: uuidv4(),
        name: 'Check Engine Light',
        description: 'Check engine light illuminated on dashboard',
        typicalSeverity: 'medium',
        estimatedRepairHours: 1,
        specialistRequired: true
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Brakes',
    description: 'Brake system components',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Brake Pads Worn',
        description: 'Brake pads worn below minimum thickness',
        typicalSeverity: 'high',
        typicalPartsNeeded: ['Brake Pads'],
        estimatedRepairHours: 2
      },
      {
        id: uuidv4(),
        name: 'Air Leak',
        description: 'Air leak in brake system',
        typicalSeverity: 'critical',
        typicalPartsNeeded: ['Air Line', 'Fittings'],
        estimatedRepairHours: 1.5
      },
      {
        id: uuidv4(),
        name: 'Brake Drums Worn',
        description: 'Brake drums worn beyond specifications',
        typicalSeverity: 'high',
        typicalPartsNeeded: ['Brake Drums'],
        estimatedRepairHours: 3
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Electrical',
    description: 'Electrical system components',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Battery Failure',
        description: 'Battery not holding charge or failed',
        typicalSeverity: 'medium',
        typicalPartsNeeded: ['Battery'],
        estimatedRepairHours: 0.5
      },
      {
        id: uuidv4(),
        name: 'Alternator Issue',
        description: 'Alternator not charging properly',
        typicalSeverity: 'high',
        typicalPartsNeeded: ['Alternator', 'Drive Belt'],
        estimatedRepairHours: 1.5
      },
      {
        id: uuidv4(),
        name: 'Lighting Failure',
        description: 'Exterior lights not functioning properly',
        typicalSeverity: 'medium',
        typicalPartsNeeded: ['Bulbs', 'Fuses', 'Relay'],
        estimatedRepairHours: 1
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Suspension',
    description: 'Suspension system components',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Air Bag Leak',
        description: 'Air suspension bag leaking',
        typicalSeverity: 'high',
        typicalPartsNeeded: ['Air Bag'],
        estimatedRepairHours: 1.5
      },
      {
        id: uuidv4(),
        name: 'Shock Absorber Failure',
        description: 'Shock absorber damaged or leaking',
        typicalSeverity: 'medium',
        typicalPartsNeeded: ['Shock Absorber'],
        estimatedRepairHours: 1.5
      },
      {
        id: uuidv4(),
        name: 'Spring Broken',
        description: 'Leaf spring broken or damaged',
        typicalSeverity: 'critical',
        typicalPartsNeeded: ['Leaf Spring'],
        estimatedRepairHours: 4,
        specialistRequired: true
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Tyres',
    description: 'Tyre-related issues',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Tyre Puncture',
        description: 'Tyre has puncture or damage',
        typicalSeverity: 'medium',
        typicalPartsNeeded: ['Tyre', 'Patch Kit'],
        estimatedRepairHours: 1
      },
      {
        id: uuidv4(),
        name: 'Tread Worn Below Minimum',
        description: 'Tyre tread depth below legal minimum',
        typicalSeverity: 'high',
        typicalPartsNeeded: ['Tyre'],
        estimatedRepairHours: 1
      },
      {
        id: uuidv4(),
        name: 'Valve Stem Leak',
        description: 'Air leaking from valve stem',
        typicalSeverity: 'low',
        typicalPartsNeeded: ['Valve Stem'],
        estimatedRepairHours: 0.5
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Transmission',
    description: 'Transmission system issues',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Fluid Leak',
        description: 'Transmission fluid leaking',
        typicalSeverity: 'high',
        typicalPartsNeeded: ['Gasket', 'Sealant'],
        estimatedRepairHours: 3,
        specialistRequired: true
      },
      {
        id: uuidv4(),
        name: 'Gear Shifting Issues',
        description: 'Difficulty shifting gears or grinding noise',
        typicalSeverity: 'high',
        estimatedRepairHours: 4,
        specialistRequired: true
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Cooling System',
    description: 'Radiator and cooling system issues',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Radiator Leak',
        description: 'Coolant leaking from radiator',
        typicalSeverity: 'high',
        typicalPartsNeeded: ['Radiator', 'Hose', 'Clamp'],
        estimatedRepairHours: 2
      },
      {
        id: uuidv4(),
        name: 'Fan Belt Broken',
        description: 'Fan belt broken or damaged',
        typicalSeverity: 'critical',
        typicalPartsNeeded: ['Fan Belt'],
        estimatedRepairHours: 1
      },
      {
        id: uuidv4(),
        name: 'Water Pump Failure',
        description: 'Water pump not functioning properly',
        typicalSeverity: 'critical',
        typicalPartsNeeded: ['Water Pump', 'Gasket'],
        estimatedRepairHours: 2.5,
        specialistRequired: true
      }
    ]
  }
];

// Export a function to find a specific subcategory by ID
export const findSubcategory = (subcategoryId: string): FaultSubcategory | undefined => {
  for (const category of faultCategories) {
    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
    if (subcategory) return subcategory;
  }
  return undefined;
};

// Export a function to find a category by ID
export const findCategory = (categoryId: string): FaultCategory | undefined => {
  return faultCategories.find(category => category.id === categoryId);
};

export default faultCategories;