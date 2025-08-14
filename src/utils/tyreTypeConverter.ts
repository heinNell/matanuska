/**
 * A TypeScript adapter that handles converting between different Tyre type definitions
 * in the application.
 */
import { TyreDoc } from "../pages/tyres/TyreDashboard";

// Helper function to determine if a tyre comes from the tyreData.ts module vs tyre.ts
export function isTyreDataType(tyre: any): boolean {
  // Check for properties that are specific to one implementation
  return (
    tyre &&
    typeof tyre.installation === "object" &&
    !Array.isArray(tyre.installation) &&
    tyre.installation !== null &&
    !Object.prototype.hasOwnProperty.call(tyre.installation || {}, "position")
  );
}

/**
 * Convert a tyre from one format to another
 * @param tyre The tyre object to convert
 * @param targetFormat The target format ('tyre.ts', 'tyreData.ts', or 'TyreDashboard')
 */
export function convertTyreFormat(
  tyre: any,
  targetFormat: "tyre.ts" | "tyreData.ts" | "TyreDashboard"
): any {
  if (!tyre) return null;

  // Already in correct format
  if (
    (targetFormat === "tyre.ts" && !isTyreDataType(tyre)) ||
    (targetFormat === "tyreData.ts" && isTyreDataType(tyre))
  ) {
    return tyre;
  }

  // Special case for TyreDashboard format
  if (targetFormat === "TyreDashboard") {
    return convertToTyreDashboardFormat(tyre);
  }

  // Create a base object with common properties
  const baseTyre = {
    ...tyre,
    id: tyre.id || tyre.tyreId || "",
    serialNumber: tyre.serialNumber || "",
    dotCode: tyre.dotCode || "",
    manufacturingDate: tyre.manufacturingDate || "",
    brand: tyre.brand || "",
    model: tyre.model || "",
    pattern: tyre.pattern || "",
    loadIndex: tyre.loadIndex || 0,
    speedRating: tyre.speedRating || "",
    kmRun: tyre.kmRun || 0,
    kmRunLimit: tyre.kmRunLimit || 0,
    notes: tyre.notes || "",
  };

  // Handle size property
  const size = tyre.size || { width: 0, aspectRatio: 0, rimDiameter: 0 };
  baseTyre.size = {
    width: size.width || 0,
    aspectRatio: size.aspectRatio || 0,
    rimDiameter: size.rimDiameter || 0,
    displayString: size.displayString || `${size.width}/${size.aspectRatio}R${size.rimDiameter}`,
  };

  // Handle type-specific conversions
  if (targetFormat === "tyre.ts") {
    // Converting from tyreData.ts to tyre.ts format
    return {
      ...baseTyre,
      installation: tyre.installation
        ? {
            vehicleId: tyre.installation.vehicleId || "",
            position: tyre.installation.position || "V1",
            mileageAtInstallation: tyre.installation.mileageAtInstallation || 0,
            installationDate: tyre.installation.installationDate || "",
            installedBy: tyre.installation.installedBy || "",
          }
        : undefined,
      // Add other conversions as needed
    };
  } else {
    // Converting from tyre.ts to tyreData.ts format
    return {
      ...baseTyre,
      installation: {
        vehicleId: tyre.installation?.vehicleId || "",
        position: tyre.installation?.position || "V1",
        mileageAtInstallation: tyre.installation?.mileageAtInstallation || 0,
        installationDate: tyre.installation?.installationDate || "",
        installedBy: tyre.installation?.installedBy || "",
      },
      // Add other conversions as needed
    };
  }
}

/**
 * Convert a tyre to the TyreDashboard format
 * @param tyre The tyre object to convert
 * @returns A TyreDoc object compatible with TyreDashboard
 */
function convertToTyreDashboardFormat(tyre: any): TyreDoc {
  const size = tyre.size || { width: 0, aspectRatio: 0, rimDiameter: 0 };
  const sizeString =
    size.displayString || `${size.width || 0}/${size.aspectRatio || 0}R${size.rimDiameter || 0}`;

  // Current date for missing fields
  const today = new Date().toISOString().split("T")[0];

  return {
    id: tyre.id || tyre.tyreId || "",
    brand: tyre.brand || "",
    model: tyre.model || "",
    serialNumber: tyre.serialNumber || "",
    size: sizeString,
    pattern: tyre.pattern || "",
    status: tyre.status || "new",
    purchaseDate: tyre.purchaseDate || today,
    purchasePrice: tyre.purchasePrice || 0,
    treadDepth: tyre.treadDepth || 10, // Default value
    lastInspection: tyre.lastInspection || today,
    manufacturingDate: tyre.manufacturingDate || today,
    dotCode: tyre.dotCode || "",
    loadIndex: tyre.loadIndex || 0,
    speedRating: tyre.speedRating || "",
    kmRun: tyre.kmRun || 0,
    kmRunLimit: tyre.kmRunLimit || 0,
    notes: tyre.notes || "",
    location: tyre.location || tyre.storeLocation || "",
    // If we have installation data, extract vehicle and position
    vehicleReg: tyre.installation?.vehicleId || tyre.vehicleReg || "",
    position: tyre.installation?.position || tyre.position || "",
  };
}

/**
 * Adapts an array of tyres to the target format
 * @param tyres Array of tyre objects
 * @param targetFormat Format to convert to
 * @returns Array of converted tyres
 */
export function adaptTyreFormatIfNeeded(tyres: any[], targetFormat: string): any[] {
  return tyres.map((tyre) => convertTyreFormat(tyre, targetFormat as any));
}
