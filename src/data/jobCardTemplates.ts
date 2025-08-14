import { v4 as uuidv4 } from 'uuid';

// Define the task item type
export interface JobCardTaskItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  estimatedHours: number;
  partRequirements: {
    partName: string;
    quantity: number;
    isRequired: boolean;
  }[];
  skillLevel: 'junior' | 'intermediate' | 'senior' | 'specialist';
  safetyNotes?: string;
  requiresSpecialTools?: boolean;
  specialTools?: string[];
  isCritical: boolean;
}

// Define the job card template type
export interface JobCardTemplate {
  id: string;
  name: string;
  description: string;
  vehicleType: 'truck' | 'trailer' | 'reefer' | 'any';
  categories: string[];
  tasks: JobCardTaskItem[];
  estimatedTotalHours: number;
  version: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

// Define the service interval type
export interface ServiceInterval {
  km: number;
  months: number;
  description: string;
}

// 15,000 km Service job card template
export const service15k: JobCardTemplate = {
  id: uuidv4(),
  name: '15,000 km Service',
  description: 'Standard 15,000 km service for heavy trucks',
  vehicleType: 'truck',
  categories: ['Engine', 'Fluids', 'Filters', 'Safety Check'],
  tasks: [
    // Engine tasks
    {
      id: uuidv4(),
      title: 'Engine Oil Change',
      description: 'Drain old oil, replace with new oil to manufacturer specifications',
      category: 'Engine',
      estimatedHours: 0.5,
      partRequirements: [
        { partName: 'Engine Oil', quantity: 25, isRequired: true }
      ],
      skillLevel: 'junior',
      isCritical: true
    },
    {
      id: uuidv4(),
      title: 'Oil Filter Replacement',
      description: 'Replace oil filter',
      category: 'Filters',
      estimatedHours: 0.3,
      partRequirements: [
        { partName: 'Oil Filter', quantity: 1, isRequired: true }
      ],
      skillLevel: 'junior',
      isCritical: true
    },
    {
      id: uuidv4(),
      title: 'Air Filter Check/Replacement',
      description: 'Inspect air filter, replace if needed',
      category: 'Filters',
      estimatedHours: 0.3,
      partRequirements: [
        { partName: 'Air Filter', quantity: 1, isRequired: false }
      ],
      skillLevel: 'junior',
      isCritical: false
    },
    {
      id: uuidv4(),
      title: 'Fluid Levels Check',
      description: 'Check all fluid levels and top up as needed',
      category: 'Fluids',
      estimatedHours: 0.5,
      partRequirements: [
        { partName: 'Coolant', quantity: 1, isRequired: false },
        { partName: 'Brake Fluid', quantity: 1, isRequired: false },
        { partName: 'Power Steering Fluid', quantity: 1, isRequired: false },
        { partName: 'Windshield Washer Fluid', quantity: 1, isRequired: false }
      ],
      skillLevel: 'junior',
      isCritical: false
    },
    {
      id: uuidv4(),
      title: 'General Safety Check',
      description: 'Inspect lights, wipers, horn, and other safety features',
      category: 'Safety Check',
      estimatedHours: 0.5,
      partRequirements: [],
      skillLevel: 'junior',
      isCritical: true
    }
  ],
  estimatedTotalHours: 2.1,
  version: '1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDefault: true
};

// 50,000 km Service job card template
export const service50k: JobCardTemplate = {
  id: uuidv4(),
  name: '50,000 km Service',
  description: 'Comprehensive 50,000 km service for heavy trucks',
  vehicleType: 'truck',
  categories: ['Engine', 'Transmission', 'Brakes', 'Suspension', 'Electrical', 'Fluids', 'Filters'],
  tasks: [
    // Engine tasks
    {
      id: uuidv4(),
      title: 'Engine Oil Change',
      description: 'Drain old oil, replace with new oil to manufacturer specifications',
      category: 'Engine',
      estimatedHours: 0.5,
      partRequirements: [
        { partName: 'Engine Oil', quantity: 25, isRequired: true }
      ],
      skillLevel: 'junior',
      isCritical: true
    },
    {
      id: uuidv4(),
      title: 'Oil Filter Replacement',
      description: 'Replace oil filter',
      category: 'Filters',
      estimatedHours: 0.3,
      partRequirements: [
        { partName: 'Oil Filter', quantity: 1, isRequired: true }
      ],
      skillLevel: 'junior',
      isCritical: true
    },
    // More comprehensive items for 50k service
    {
      id: uuidv4(),
      title: 'Fuel Filter Replacement',
      description: 'Replace primary and secondary fuel filters',
      category: 'Filters',
      estimatedHours: 0.5,
      partRequirements: [
        { partName: 'Fuel Filter (Primary)', quantity: 1, isRequired: true },
        { partName: 'Fuel Filter (Secondary)', quantity: 1, isRequired: true }
      ],
      skillLevel: 'intermediate',
      isCritical: true
    },
    {
      id: uuidv4(),
      title: 'Air Filter Replacement',
      description: 'Replace air filter',
      category: 'Filters',
      estimatedHours: 0.3,
      partRequirements: [
        { partName: 'Air Filter', quantity: 1, isRequired: true }
      ],
      skillLevel: 'junior',
      isCritical: true
    },
    {
      id: uuidv4(),
      title: 'Transmission Fluid Check',
      description: 'Check transmission fluid level and condition, replace if needed',
      category: 'Transmission',
      estimatedHours: 1.0,
      partRequirements: [
        { partName: 'Transmission Fluid', quantity: 12, isRequired: false }
      ],
      skillLevel: 'intermediate',
      isCritical: false
    },
    {
      id: uuidv4(),
      title: 'Brake System Inspection',
      description: 'Inspect brake pads, rotors, and overall system function',
      category: 'Brakes',
      estimatedHours: 1.0,
      partRequirements: [],
      skillLevel: 'intermediate',
      isCritical: true
    },
    {
      id: uuidv4(),
      title: 'Battery Test',
      description: 'Test battery health and charging system',
      category: 'Electrical',
      estimatedHours: 0.3,
      partRequirements: [],
      skillLevel: 'junior',
      requiresSpecialTools: true,
      specialTools: ['Battery Tester'],
      isCritical: false
    }
    // Additional tasks would be added here
  ],
  estimatedTotalHours: 3.9,
  version: '1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDefault: true
};

// Brake System Repair template
export const brakeRepair: JobCardTemplate = {
  id: uuidv4(),
  name: 'Brake System Repair',
  description: 'Common brake system repairs for heavy trucks',
  vehicleType: 'truck',
  categories: ['Brake System'],
  tasks: [
    {
      id: uuidv4(),
      title: 'Brake Pad Replacement',
      description: 'Replace brake pads on all wheels',
      category: 'Brake System',
      estimatedHours: 2.0,
      partRequirements: [
        { partName: 'Brake Pads (Set)', quantity: 1, isRequired: true }
      ],
      skillLevel: 'intermediate',
      isCritical: true,
      safetyNotes: 'Ensure vehicle is properly supported on jack stands before beginning work.'
    },
    {
      id: uuidv4(),
      title: 'Brake Rotor Inspection',
      description: 'Inspect brake rotors for wear and damage',
      category: 'Brake System',
      estimatedHours: 0.5,
      partRequirements: [],
      skillLevel: 'intermediate',
      isCritical: true
    },
    {
      id: uuidv4(),
      title: 'Brake Fluid Flush',
      description: 'Flush and replace brake fluid',
      category: 'Brake System',
      estimatedHours: 1.0,
      partRequirements: [
        { partName: 'Brake Fluid', quantity: 2, isRequired: true }
      ],
      skillLevel: 'intermediate',
      isCritical: true
    }
    // Additional tasks would be added here
  ],
  estimatedTotalHours: 3.5,
  version: '1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isDefault: true
};

// Export an array of all templates
export const jobCardTemplates: JobCardTemplate[] = [
  service15k,
  service50k,
  brakeRepair
];

// Common service intervals
export const serviceIntervals: Record<string, ServiceInterval> = {
  A: { km: 15000, months: 3, description: 'Basic service - oil change, filters, safety check' },
  B: { km: 50000, months: 6, description: 'Intermediate service - A service plus transmission, brakes, electrical' },
  C: { km: 100000, months: 12, description: 'Comprehensive service - B service plus engine diagnostics, suspension, drivetrain' }
};

export default jobCardTemplates;