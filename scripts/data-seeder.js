#!/usr/bin/env node

/**
 * Matanuska Transport - Unified Data Seeding Utility
 *
 * This script provides an integrated approach to seeding all reference data
 * required by the Matanuska Transport Platform:
 * - Routes and distances
 * - Fleet vehicles
 * - Tyre reference data (brands, sizes, patterns)
 * - Vehicle-tyre mappings
 * - Workshop inventory
 *
 * Usage:
 *   node data-seeder.js [options] [collection]
 *
 * Options:
 *   --force       : Force update existing records
 *   --verbose     : Show detailed progress
 *   --no-validate : Skip data validation
 *
 * Collections:
 *   routes        : Route and distance data
 *   fleet         : Fleet vehicle data
 *   tyres         : All tyre reference data (brands, sizes, patterns, positions)
 *   tyrestore     : Vehicle-tyre mappings
 *   inventory     : Workshop inventory items
 *   all           : All collections (default)
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { readFileSync, existsSync } = require("fs");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  force: args.includes("--force"),
  verbose: args.includes("--verbose"),
  validate: !args.includes("--no-validate"),
};

// Find which collection(s) to seed
const collections = args.filter((arg) => !arg.startsWith("--")).map((arg) => arg.toLowerCase());

// If no specific collections, default to all
if (collections.length === 0) {
  collections.push("all");
}

// Configuration
const CONFIG = {
  serviceAccountPath: "./serviceAccountKey.json",
  batchSize: 500, // Maximum items per batch (Firestore limit)
  collections: {
    routes: "routeDistances",
    fleet: "fleet",
    tyreBrands: "tyreBrands",
    tyreSizes: "tyreSizes",
    tyrePatterns: "tyrePatterns",
    vehiclePositions: "vehiclePositions",
    tyreStore: "tyreStore",
    inventory: "stockInventory",
  },
};

// Validation schemas
const schemas = {
  routes: (item) => {
    if (!item.route || typeof item.route !== "string") return "Missing or invalid route";
    if (!item.distance || typeof item.distance !== "number") return "Missing or invalid distance";
    return null;
  },
  fleet: (item) => {
    if (!item.fleetNumber) return "Missing fleet number";
    if (!item.registrationNumber) return "Missing registration number";
    return null;
  },
  tyreBrands: (item) => {
    if (!item.name) return "Missing tyre brand name";
    return null;
  },
  tyreSizes: (item) => {
    if (!item.size) return "Missing tyre size";
    return null;
  },
  tyrePatterns: (item) => {
    if (!item.brand) return "Missing tyre pattern brand";
    if (!item.size) return "Missing tyre pattern size";
    if (!item.position) return "Missing tyre pattern position";
    return null;
  },
  vehiclePositions: (item) => {
    if (!item.vehicleType) return "Missing vehicle type";
    if (!item.positions || !Array.isArray(item.positions))
      return "Missing or invalid positions array";
    return null;
  },
  tyreStore: (item) => {
    if (!item.RegistrationNo) return "Missing registration number";
    if (!item.StoreName) return "Missing store name";
    if (!item.TyrePosDescription) return "Missing tyre position";
    return null;
  },
  inventory: (item) => {
    if (!item.StoreName) return "Missing store name";
    if (!item.StockCde) return "Missing stock code";
    if (!item.StockDescription) return "Missing stock description";
    return null;
  },
};

// Initialize Firebase
console.log("🚀 Matanuska Transport - Unified Data Seeding Utility");
console.log("====================================================");

let db;

// Helper function to colorize console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Initialize Firebase Admin SDK
async function initializeFirebase() {
  try {
    // Check if service account key exists
    if (!existsSync(CONFIG.serviceAccountPath)) {
      console.error(
        colorize("❌ Service account key not found at: " + CONFIG.serviceAccountPath, "red")
      );
      console.log("\n📝 INSTRUCTIONS:");
      console.log("1. Go to Firebase Console → Project Settings → Service Accounts");
      console.log('2. Click "Generate new private key"');
      console.log('3. Save the file as "serviceAccountKey.json" in the project root directory');
      console.log("4. Run this script again\n");
      process.exit(1);
    }

    // Load service account
    const serviceAccount = JSON.parse(readFileSync(CONFIG.serviceAccountPath, "utf8"));
    console.log(colorize("✅ Service account key loaded successfully", "green"));

    // Initialize app
    initializeApp({
      credential: cert(serviceAccount),
    });

    // Get Firestore instance
    db = getFirestore();
    console.log(colorize("✅ Firebase initialized successfully", "green"));

    return true;
  } catch (error) {
    console.error(colorize(`❌ Failed to initialize Firebase: ${error.message}`, "red"));
    return false;
  }
}

// Generic seeding function for any collection
async function seedCollection(collectionName, data, options = {
  force: false,
  validate: true,
  verbose: false,
  idGenerator: (item) =>
    item.id ||
    `${Object.values(item)
      .join("_")
      .replace(/[^a-zA-Z0-9]/g, "_")}`,
  preprocessor: (item) => item,
}) {
  console.log(colorize(`\n🔄 Starting to seed collection: ${collectionName}`, "cyan"));
  console.log(`Found ${data.length} items to process`);

  const {
    force,
    validate,
    verbose,
    idGenerator,
    preprocessor,
  } = options;

  try {
    // Delete existing data if force is true
    if (force) {
      console.log(`Deleting existing data from ${collectionName}...`);
      const snapshot = await db.collection(collectionName).get();
      if (snapshot.size > 0) {
        const batches = [];
        let batch = db.batch();
        let operationCount = 0;

        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          operationCount++;

          // Commit batch if size limit is reached
          if (operationCount === CONFIG.batchSize) {
            batches.push(batch.commit());
            batch = db.batch();
            operationCount = 0;
          }
        });

        // Commit final batch if any operations remain
        if (operationCount > 0) {
          batches.push(batch.commit());
        }

        await Promise.all(batches);
        console.log(
          colorize(`✅ Deleted ${snapshot.size} existing items from ${collectionName}`, "yellow")
        );
      }
    }

    // Process data in batches
    const batches = [];
    let batch = db.batch();
    let operationCount = 0;
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    let validationErrors = [];

    // Iterate through data
    for (const item of data) {
      // Generate document ID
      const docId = idGenerator(item);
      const ref = db.collection(collectionName).doc(docId);

      // Check if document exists (unless force is true)
      if (!force) {
        const doc = await ref.get();
        if (doc.exists) {
          if (options.verbose) {
            console.log(colorize(`ℹ️ Skipping existing item: ${docId}`, "blue"));
          }
          skipCount++;
          continue;
        }
      }

      // Validate data if required
      if (validate && schemas[collectionName]) {
        const validationError = schemas[collectionName](item);
        if (validationError) {
          validationErrors.push({ id: docId, error: validationError });
          errorCount++;
          continue;
        }
      }

      // Process item
      const processedItem = preprocessor(item);

      // Add to batch
      batch.set(ref, {
        ...processedItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      operationCount++;
      successCount++;

      // Commit batch if size limit is reached
      if (operationCount === CONFIG.batchSize) {
        batches.push(batch.commit());
        if (options.verbose) {
          console.log(colorize(`✅ Committed batch of ${operationCount} items`, "green"));
        }
        batch = db.batch();
        operationCount = 0;
      }
    }

    // Commit final batch if any operations remain
    if (operationCount > 0) {
      batches.push(batch.commit());
    }

    // Wait for all batches to complete
    await Promise.all(batches);

    console.log(
      colorize(`✅ Successfully added ${successCount} items to ${collectionName}`, "green")
    );
    if (skipCount > 0) {
      console.log(colorize(`ℹ️ Skipped ${skipCount} existing items`, "blue"));
    }
    if (errorCount > 0) {
      console.log(colorize(`❌ Failed to add ${errorCount} items due to validation errors`, "red"));
      if (options.verbose) {
        console.log("Validation errors:");
        console.log(validationErrors);
      }
    }

    return {
      success: successCount,
      skipped: skipCount,
      errors: errorCount,
    };
  } catch (error) {
    console.error(
      colorize(`❌ Error seeding collection ${collectionName}: ${error.message}`, "red")
    );
    console.error(error);
    return {
      success: 0,
      skipped: 0,
      errors: data.length,
    };
  }
}

// Import data modules
const routeDistances = [
  { route: "JHB - HARARE (NORTH BOUND)", distance: 1120 },
  { route: "JHB - BLANTYRE (NORTH BOUND)", distance: 1616 },
  { route: "JHB TO BLANTYRE AND BACK", distance: 3232 },
  { route: "JHB - LILONGWE (NORTH BOUND)", distance: 1875 },
  { route: "JHB TO LILONGWE AND BACK", distance: 3660 },
  { route: "JHB - BLANTYRE - LILONGWE", distance: 2045 },
  { route: "JHB - LUSAKA (NORTH BOUND)", distance: 1572 },
  { route: "JHB - LUSAKA AND BACK", distance: 3144 },
  { route: "JHB - MAPUTO", distance: 551 },
  { route: "JHB - BIARA", distance: 1700 },
  { route: "JHB - NAMPULA", distance: 2600 },
  { route: "PE - LUSAKA", distance: 2700 },
  { route: "PE - HARARE", distance: 2200 },
  { route: "PE - BLANTYRE", distance: 2850 },
  { route: "PE - LILONGWE", distance: 3050 },
  { route: "JHB - KASUMBULESA (NORTH BOUND)", distance: 2018 },
  { route: "DURBAN - LUSAKA", distance: 2300 },
  { route: "DURBAN - GABARONE", distance: 950 },
  { route: "DURBAN - HARARE", distance: 1700 },
  { route: "DURBAN  - BLANTYRE", distance: 2300 },
  { route: "DURBAN - LILONGWE", distance: 2500 },
  { route: "CPT - HARARE (NORTH BOUND)", distance: 2517 },
  { route: "CPT - LUSAKA (NORTH BOUND)", distance: 2962 },
  { route: "CPT - BLANTYRE (NORTH BOUND)", distance: 3127 },
  { route: "CPT - LILONGWE (NORTH BOUND)", distance: 3256 },
  // Additional routes omitted for brevity but included in full implementation
];

const tyreBrands = [
  "Bridgestone",
  "Michelin",
  "Goodyear",
  "Continental",
  "Pirelli",
  "Dunlop",
  "Hankook",
  "Yokohama",
  "Kumho",
  "Toyo",
  "Firemax",
  "Triangle",
  "Terraking",
  "Compasal",
  "Windforce",
  "Perelli",
  "Powertrac",
  "Sunfull",
  "Wellplus",
  "Techshield",
  "Sonix",
  "Formula",
];

const tyreSizes = [
  "295/80R22.5",
  "315/80R22.5",
  "295/75R22.5",
  "11R22.5",
  "12R22.5",
  "385/65R22.5",
  "275/70R22.5",
  "315/80R22.16",
  "315/80R22.17",
];

const tyrePatterns = [
  // Sample entries - actual implementation would include all patterns
  { brand: "Firemax", pattern: "", size: "315/80R22.5", position: "Drive" },
  { brand: "TRIANGLE", pattern: "TR688", size: "315/80R22.5", position: "Drive" },
  { brand: "Terraking", pattern: "HS102", size: "315/80R22.5", position: "Drive" },
  { brand: "Compasal", pattern: "TR688", size: "315/80R22.5", position: "Drive" },
  { brand: "Windforce", pattern: "WD2020", size: "315/80R22.5", position: "Drive" },
];

const vehiclePositions = [
  {
    vehicleType: "standard",
    name: "Standard Vehicle",
    positions: [
      { id: "Front Left", name: "Front Left" },
      { id: "Front Right", name: "Front Right" },
      { id: "Drive Axle Left Inner", name: "Drive Axle Left Inner" },
      { id: "Drive Axle Left Outer", name: "Drive Axle Left Outer" },
      { id: "Drive Axle Right Inner", name: "Drive Axle Right Inner" },
      { id: "Drive Axle Right Outer", name: "Drive Axle Right Outer" },
      { id: "Trailer Axle 1 Left", name: "Trailer Axle 1 Left" },
      { id: "Trailer Axle 1 Right", name: "Trailer Axle 1 Right" },
      { id: "Trailer Axle 2 Left", name: "Trailer Axle 2 Left" },
      { id: "Trailer Axle 2 Right", name: "Trailer Axle 2 Right" },
      { id: "Spare", name: "Spare" },
    ],
  },
  // Other vehicle types would be included here
];

// Sample of vehicle tyre mappings (abbreviated)
const vehicleTyreMappings = [
  { RegistrationNo: "AAX2987", StoreName: "15L", TyrePosDescription: "V1", TyreCode: "MAT0171" },
  { RegistrationNo: "AAX2987", StoreName: "15L", TyrePosDescription: "V2", TyreCode: "MAT0172" },
  { RegistrationNo: "AAX2987", StoreName: "15L", TyrePosDescription: "V3", TyreCode: "MAT0173" },
];

// Sample of stock inventory (abbreviated)
const stockInventory = [
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "14LHUB",
    SupplierPartNo: "",
    StockDescription: "14L HUB",
    StockCostPrice: 250.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0,
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "215/80R15C TYRES",
    SupplierPartNo: "",
    StockDescription: "215/80R15C TYRES",
    StockCostPrice: 146.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0,
  },
];

// Fleet data (to be loaded from an external file in real implementation)
const fleetData = [
  {
    fleetNumber: "15L",
    registrationNumber: "AAX2987",
    vehicleType: "horse",
    make: "Scania",
    model: "G460",
    year: 2018,
    status: "active",
  },
  {
    fleetNumber: "14L",
    registrationNumber: "ABA3918",
    vehicleType: "horse",
    make: "Scania",
    model: "G460",
    year: 2018,
    status: "active",
  },
];

// Main execution function
async function main() {
  try {
    // Initialize Firebase
    const initialized = await initializeFirebase();
    if (!initialized) {
      process.exit(1);
    }

    console.log(colorize("\n📊 Configuration", "magenta"));
    console.log(`Force update: ${options.force}`);
    console.log(`Verbose mode: ${options.verbose}`);
    console.log(`Validate data: ${options.validate}`);
    console.log(`Selected collections: ${collections.join(", ")}`);

    const stats = {
      total: 0,
      success: 0,
      skipped: 0,
      errors: 0,
    };

    // Seed route distances
    if (collections.includes("all") || collections.includes("routes")) {
      const routeStats = await seedCollection(CONFIG.collections.routes, routeDistances, {
        force: options.force,
        validate: options.validate,
        verbose: options.verbose,
        idGenerator: (item) => item.route.replace(/[^a-zA-Z0-9]/g, "_") + "_" + item.distance,
        preprocessor: (item) => item,
      });
      stats.total += routeDistances.length;
      stats.success += routeStats.success;
      stats.skipped += routeStats.skipped;
      stats.errors += routeStats.errors;
    }

    // Seed fleet data
    if (collections.includes("all") || collections.includes("fleet")) {
      const fleetStats = await seedCollection(CONFIG.collections.fleet, fleetData, {
        force: options.force,
        validate: options.validate,
        verbose: options.verbose,
        idGenerator: (item) => item.fleetNumber,
        preprocessor: (item) => item,
      });
      stats.total += fleetData.length;
      stats.success += fleetStats.success;
      stats.skipped += fleetStats.skipped;
      stats.errors += fleetStats.errors;
    }

    // Seed tyre reference data
    if (collections.includes("all") || collections.includes("tyres")) {
      // Seed tyre brands
      const brandStats = await seedCollection(
        CONFIG.collections.tyreBrands,
        tyreBrands.map((name) => ({ name })),
        {
          force: options.force,
          validate: options.validate,
          verbose: options.verbose,
          idGenerator: (item) => item.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          preprocessor: (item) => item,
        }
      );
      stats.total += tyreBrands.length;
      stats.success += brandStats.success;
      stats.skipped += brandStats.skipped;
      stats.errors += brandStats.errors;

      // Seed tyre sizes
      const sizeStats = await seedCollection(
        CONFIG.collections.tyreSizes,
        tyreSizes.map((size) => ({ size })),
        {
          force: options.force,
          validate: options.validate,
          verbose: options.verbose,
          idGenerator: (item) => item.size.replace(/[^a-z0-9]/g, ""),
    preprocessor: (item) => item,
        }
      );
      stats.total += tyreSizes.length;
      stats.success += sizeStats.success;
      stats.skipped += sizeStats.skipped;
      stats.errors += sizeStats.errors;

      // Seed tyre patterns
      const patternStats = await seedCollection(CONFIG.collections.tyrePatterns, tyrePatterns, {
        force: options.force,
        validate: options.validate,
        verbose: options.verbose,
        idGenerator: (item) => {
          const patternName = item.pattern || "standard";
          return `${item.brand.toLowerCase()}_${patternName.toLowerCase()}_${item.size.replace(/[^a-z0-9]/g, "")}`;
        },
        preprocessor: (item) => item,
      });
      stats.total += tyrePatterns.length;
      stats.success += patternStats.success;
      stats.skipped += patternStats.skipped;
      stats.errors += patternStats.errors;

      // Seed vehicle positions
      const positionStats = await seedCollection(
        CONFIG.collections.vehiclePositions,
        vehiclePositions,
        {
          force: options.force,
          validate: options.validate,
          verbose: options.verbose,
          idGenerator: (item) => item.vehicleType,
    preprocessor: (item) => item,
        }
      );
      stats.total += vehiclePositions.length;
      stats.success += positionStats.success;
      stats.skipped += positionStats.skipped;
      stats.errors += positionStats.errors;
    }

    // Seed tyre store mappings
    if (collections.includes("all") || collections.includes("tyrestore")) {
      const tyreStoreStats = await seedCollection(
        CONFIG.collections.tyreStore,
        vehicleTyreMappings,
        {
          force: options.force,
          validate: options.validate,
          verbose: options.verbose,
          idGenerator: (item) => `${item.StoreName}_${item.TyrePosDescription}_${item.TyreCode}`,
          preprocessor: (item) => item, // Add default preprocessor that returns item unchanged
        }
      );
      stats.total += vehicleTyreMappings.length;
      stats.success += tyreStoreStats.success;
      stats.skipped += tyreStoreStats.skipped;
      stats.errors += tyreStoreStats.errors;
    }

    // Seed inventory data
    if (collections.includes("all") || collections.includes("inventory")) {
      const inventoryStats = await seedCollection(CONFIG.collections.inventory, stockInventory, {
        force: options.force,
        validate: options.validate,
        verbose: options.verbose,
        idGenerator: (item) => item.StockCde.replace(/[^a-zA-Z0-9]/g, "_"),
    preprocessor: (item) => item,
      });
      stats.total += stockInventory.length;
      stats.success += inventoryStats.success;
      stats.skipped += inventoryStats.skipped;
      stats.errors += inventoryStats.errors;
    }

    // Print summary
    console.log(colorize("\n📊 Seeding Summary", "magenta"));
    console.log(`Total items processed: ${stats.total}`);
    console.log(colorize(`✅ Successfully added: ${stats.success}`, "green"));
    console.log(colorize(`ℹ️ Skipped existing: ${stats.skipped}`, "blue"));
    console.log(colorize(`❌ Failed to add: ${stats.errors}`, "red"));

    console.log(colorize("\n🏁 Data seeding completed", "green"));
    process.exit(0);
  } catch (error) {
    console.error(colorize(`\n❌ Unhandled error during data seeding: ${error.message}`, "red"));
    console.error(error);
    process.exit(1);
  }
}

// Run the main function
main();
