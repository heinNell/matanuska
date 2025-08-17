/**
 * Validation schemas for form data
 * This file contains Zod schemas for validating form data before submission
 * to APIs or storage in local database
 */

import { z } from "zod";

/**
 * Vehicle form schema
 */
export const vehicleSchema = z.object({
  id: z.string().optional(),
  registrationNumber: z.string().min(1, "Registration number is required"),
  vehicleType: z.enum(["truck", "van", "car"], {
    errorMap: () => ({ message: "Invalid vehicle type" }),
  }),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().min(11).max(17).optional(),
  status: z.enum(["active", "maintenance", "retired"]).default("active"),
  lastServiceDate: z.union([z.date(), z.number(), z.string()]).optional(),
  nextServiceDue: z.union([z.date(), z.number(), z.string()]).optional(),
});

/**
 * Driver form schema
 */
export const driverSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  licenseNumber: z.string().min(3, "License number is required"),
  licenseClass: z.string(),
  licenseExpiry: z.union([z.date(), z.number(), z.string()]),
  contactNumber: z.string().min(6).optional(),
  email: z.string().email().optional(),
  status: z.enum(["active", "inactive", "on-leave"]).default("active"),
});

/**
 * Trip form schema
 */
export const tripSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  driverId: z.string().min(1, "Driver ID is required"),
  startTime: z.union([z.date(), z.number(), z.string()]),
  endTime: z.union([z.date(), z.number(), z.string()]).optional(),
  startOdometer: z.number().min(0, "Start odometer reading is required"),
  endOdometer: z.number().min(0).optional(),
  startLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    name: z.string().optional(),
  }),
  endLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    name: z.string().optional(),
  }).optional(),
  status: z.enum(["planned", "in-progress", "completed", "cancelled"]).default("planned"),
  purpose: z.string().max(1000).optional(),
});

/**
 * Maintenance form schema
 */
export const maintenanceSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  type: z.enum(["inspection", "repair", "scheduled", "unscheduled"]),
  date: z.union([z.date(), z.number(), z.string()]),
  odometer: z.number().min(0),
  description: z.string().min(1, "Description is required"),
  technician: z.string().optional(),
  cost: z.number().min(0).optional(),
  parts: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    cost: z.number().min(0).optional(),
  })).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(["scheduled", "in-progress", "completed", "cancelled"]).default("scheduled"),
});

/**
 * Fuel entry form schema
 */
export const fuelEntrySchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  date: z.union([z.date(), z.number(), z.string()]),
  odometer: z.number().min(0),
  fuelAmount: z.number().positive("Fuel amount must be positive"),
  fuelType: z.enum(["diesel", "petrol", "gasoline", "electric", "hybrid", "other"]),
  fullTank: z.boolean().default(true),
  cost: z.number().min(0).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    name: z.string().optional(),
  }).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Incident report schema
 */
export const incidentSchema = z.object({
  id: z.string().optional(),
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  driverId: z.string().min(1, "Driver ID is required"),
  date: z.union([z.date(), z.number(), z.string()]),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)").optional(),
  location: z.object({
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    address: z.string().optional(),
  }),
  type: z.enum(["accident", "breakdown", "damage", "theft", "other"]),
  description: z.string().min(1, "Description is required").max(5000),
  thirdPartyInvolved: z.boolean().default(false),
  policeReportFiled: z.boolean().default(false),
  policeReportNumber: z.string().optional(),
  injuriesReported: z.boolean().default(false),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  status: z.enum(["reported", "investigating", "resolved"]).default("reported"),
});

/**
 * Form type to schema mapping
 */
export const formSchemas = {
  vehicle: vehicleSchema,
  driver: driverSchema,
  trip: tripSchema,
  maintenance: maintenanceSchema,
  fuelEntry: fuelEntrySchema,
  incident: incidentSchema,
  // Add more schemas as needed
} as const;

// Add type for valid form types
export type FormType = keyof typeof formSchemas;

/**
 * Get schema for a specific form type
 */
export const getSchemaForForm = (formType: string): z.ZodSchema => {
  if (isValidFormType(formType)) {
    return formSchemas[formType];
  }
  return z.object({}).passthrough();
};

// Type guard to check if a string is a valid form type
function isValidFormType(type: string): type is FormType {
  return type in formSchemas;
}

/**
 * Validate form data based on form type
 * @param data The data to validate
 * @param formType The type of form (e.g. 'vehicle', 'trip')
 * @returns Validated data
 * @throws Error if validation fails
 */
export const validateFormData = <T>(data: unknown, formType: string): T => {
  try {
    const schema = getSchemaForForm(formType);
    return schema.parse(data) as T;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format error message
      const formattedErrors = error.errors.map(e => {
        const path = e.path.join('.');
        return `${path}: ${e.message}`;
      }).join('; ');

      throw new Error(`Validation failed: ${formattedErrors}`);
    }
    throw error;
  }
};

/**
 * Sanitize a collection path to prevent path traversal
 */
export const sanitizeCollectionPath = (path: string): string => {
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid collection path: Path must be a non-empty string');
  }

  // Check for path traversal attempts
  if (path.includes('..') || path.includes('~') || path.includes('/./') || path.includes('/./')) {
    throw new Error('Invalid collection path: Path traversal attempt detected');
  }

  // Validate path format (alphanumeric, hyphens, underscores, and forward slashes only)
  if (!path.match(/^[a-zA-Z0-9-_/]+$/)) {
    throw new Error('Invalid collection path: Path contains invalid characters');
  }

  return path;
};

/**
 * Validate an ID
 */
export const validateId = (id: unknown): string => {
  if (!id || typeof id !== 'string' || id.length < 1) {
    throw new Error('Invalid ID: ID must be a non-empty string');
  }
  return id;
};

export default {
  validateFormData,
  sanitizeCollectionPath,
  validateId,
  schemas: formSchemas,
};
