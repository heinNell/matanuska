import { v4 as uuidv4 } from 'uuid';

// Define the inspection item type - this is what inspectors check
export interface InspectionItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  requiredRole: 'driver' | 'mechanic' | 'any';
  isCritical: boolean;
  passFailOnly: boolean;
  valueType?: 'numeric' | 'text' | 'yes-no' | 'pass-fail';
  minimumValue?: number;
  maximumValue?: number;
  unitOfMeasure?: string;
}

// Define the inspection template type - this is the full inspection form
export interface InspectionTemplate {
  id: string;
  name: string;
  description: string;
  vehicleType: 'truck' | 'trailer' | 'reefer' | 'any';
  categories: string[];
  items: InspectionItem[];
  version: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

// Pre-trip truck inspection template
export const preTrip: InspectionTemplate = {
  id: uuidv4(),
  name: 'Pre-Trip Truck Inspection',
  description: 'Standard inspection to be performed before starting a trip',
  vehicleType: 'truck',
  categories: [
    'Documentation',
    'Exterior',
    'Engine Compartment',
    'Interior',
    'Brakes & Tyres',
    'Safety Equipment'
  ],
  items: [
    // Documentation
    {
      id: uuidv4(),
      title: 'Driver\'s License',
      description: 'Driver\'s license is present and valid',
      category: 'Documentation',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },
    {
      id: uuidv4(),
      title: 'Vehicle Registration',
      description: 'Vehicle registration is present and valid',
      category: 'Documentation',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },
    {
      id: uuidv4(),
      title: 'Insurance Documents',
      description: 'Insurance documents are present and valid',
      category: 'Documentation',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },

    // Exterior
    {
      id: uuidv4(),
      title: 'Lights',
      description: 'All exterior lights are working',
      category: 'Exterior',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: false,
      valueType: 'yes-no'
    },
    {
      id: uuidv4(),
      title: 'Mirrors',
      description: 'Mirrors are clean, properly adjusted, and securely mounted',
      category: 'Exterior',
      requiredRole: 'driver',
      isCritical: false,
      passFailOnly: true
    },
    {
      id: uuidv4(),
      title: 'Windscreen Wipers',
      description: 'Wipers are in good condition and functioning',
      category: 'Exterior',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },

    // Engine Compartment
    {
      id: uuidv4(),
      title: 'Engine Oil Level',
      description: 'Check engine oil level',
      category: 'Engine Compartment',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: false,
      valueType: 'text'
    },
    {
      id: uuidv4(),
      title: 'Coolant Level',
      description: 'Check coolant level',
      category: 'Engine Compartment',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: false,
      valueType: 'text'
    },
    {
      id: uuidv4(),
      title: 'Brake Fluid',
      description: 'Check brake fluid level',
      category: 'Engine Compartment',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: false,
      valueType: 'text'
    },

    // Interior
    {
      id: uuidv4(),
      title: 'Seat Belts',
      description: 'Seat belts are present and functioning',
      category: 'Interior',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },
    {
      id: uuidv4(),
      title: 'Horn',
      description: 'Horn is functioning',
      category: 'Interior',
      requiredRole: 'driver',
      isCritical: false,
      passFailOnly: true
    },

    // Brakes & Tyres
    {
      id: uuidv4(),
      title: 'Tyre Pressure - Front Left',
      description: 'Check tyre pressure (PSI)',
      category: 'Brakes & Tyres',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: false,
      valueType: 'numeric',
      minimumValue: 100,
      maximumValue: 120,
      unitOfMeasure: 'PSI'
    },
    {
      id: uuidv4(),
      title: 'Tyre Pressure - Front Right',
      description: 'Check tyre pressure (PSI)',
      category: 'Brakes & Tyres',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: false,
      valueType: 'numeric',
      minimumValue: 100,
      maximumValue: 120,
      unitOfMeasure: 'PSI'
    },
    {
      id: uuidv4(),
      title: 'Brake Test',
      description: 'Perform stationary brake test',
      category: 'Brakes & Tyres',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },

    // Safety Equipment
    {
      id: uuidv4(),
      title: 'Fire Extinguisher',
      description: 'Fire extinguisher is present and charged',
      category: 'Safety Equipment',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },
    {
      id: uuidv4(),
      title: 'First Aid Kit',
      description: 'First aid kit is present and complete',
      category: 'Safety Equipment',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },
    {
      id: uuidv4(),
      title: 'Warning Triangles',
      description: 'Warning triangles are present',
      category: 'Safety Equipment',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    }
  ],
  version: '1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDefault: true
};

// Mechanic-focused detailed inspection template
export const mechanicInspection: InspectionTemplate = {
  id: uuidv4(),
  name: 'Detailed Mechanic Inspection',
  description: 'Comprehensive inspection to be performed by certified mechanics',
  vehicleType: 'truck',
  categories: [
    'Engine',
    'Transmission',
    'Brake System',
    'Suspension',
    'Electrical System',
    'Emissions',
    'Steering',
    'Chassis & Frame'
  ],
  items: [
    // Engine items
    {
      id: uuidv4(),
      title: 'Engine Oil Condition',
      description: 'Check oil quality and contamination',
      category: 'Engine',
      requiredRole: 'mechanic',
      isCritical: true,
      passFailOnly: false,
      valueType: 'text'
    },
    {
      id: uuidv4(),
      title: 'Cooling System',
      description: 'Check for leaks, proper function',
      category: 'Engine',
      requiredRole: 'mechanic',
      isCritical: true,
      passFailOnly: false,
      valueType: 'text'
    },

    // Add more items for other categories as needed
    // This is just a starter template
  ],
  version: '1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDefault: true
};

// Trailer inspection template
export const trailerInspection: InspectionTemplate = {
  id: uuidv4(),
  name: 'Trailer Inspection',
  description: 'Standard inspection for trailers',
  vehicleType: 'trailer',
  categories: [
    'Structure',
    'Coupling',
    'Brakes',
    'Lights & Electrical',
    'Tyres & Wheels',
    'Safety Equipment'
  ],
  items: [
    // Structure items
    {
      id: uuidv4(),
      title: 'Frame Integrity',
      description: 'Check for damage, cracks, or deformation',
      category: 'Structure',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },
    // Coupling items
    {
      id: uuidv4(),
      title: 'King Pin Condition',
      description: 'Check king pin for wear or damage',
      category: 'Coupling',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },
    // Brakes items
    {
      id: uuidv4(),
      title: 'Brake Pad Thickness',
      description: 'Check brake pad thickness',
      category: 'Brakes',
      requiredRole: 'mechanic',
      isCritical: true,
      passFailOnly: false,
      valueType: 'numeric',
      minimumValue: 5,
      unitOfMeasure: 'mm'
    },
    // Lights & Electrical items
    {
      id: uuidv4(),
      title: 'Marker Lights',
      description: 'Check all marker lights are working',
      category: 'Lights & Electrical',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },
    // Tyres & Wheels items
    {
      id: uuidv4(),
      title: 'Tyre Condition',
      description: 'Check tyres for damage, wear, or foreign objects',
      category: 'Tyres & Wheels',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    },
    // Safety Equipment items
    {
      id: uuidv4(),
      title: 'Load Restraints',
      description: 'Check load restraints are present and in good condition',
      category: 'Safety Equipment',
      requiredRole: 'driver',
      isCritical: true,
      passFailOnly: true
    }
  ],
  version: '1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDefault: true
};

// Export an array of all templates
export const inspectionTemplates: InspectionTemplate[] = [
  preTrip,
  mechanicInspection,
  trailerInspection
];

// Export default
export default inspectionTemplates;
