#!/usr/bin/env node

/**
 * Matanuska Transport - Unified Data Seeding Utility
 *
 * This script provides an integrated approach to seeding all reference data
 * required by the Matanuska Transport Platform. It's written in a clean
 * and modular CommonJS format for easy understanding and maintenance.
 *
 * Usage:
 * node data-seeder.js [options] [collection]
 *
 * Options:
 * --force       : Force update existing records by deleting and re-creating them.
 * --verbose     : Show detailed progress for each item.
 * --no-validate : Skip data validation checks.
 *
 * Collections:
 * routes        : Route and distance data.
 * fleet         : Fleet vehicle data.
 * tyrebrands    : All tyre brand data
 * tyresizes     : All tyre size data
 * tyrepatterns  : All tyre pattern data
 * positions     : Vehicle position configurations
 * tyrestore     : Vehicle-tyre mappings.
 * inventory     : Workshop inventory items.
 * fleetassets   : Fleet asset tyre configurations.
 * vendors       : Vendor contact and address information.
 * all           : All collections (default).
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { readFileSync, existsSync } = require("fs");
const path = require("path");

// --- 1. CONFIGURATION AND UTILITIES ---

// Configuration constants
const CONFIG = {
  serviceAccountPath: "./serviceAccountKey.json",
  batchSize: 500, // Firestore limit for batch writes
  collections: {
    routes: "routeDistances",
    fleet: "fleet",
    tyreBrands: "tyreBrands",
    tyreSizes: "tyreSizes",
    tyrePatterns: "tyrePatterns",
    vehiclePositions: "vehiclePositions",
    tyreStore: "tyreStore",
    inventory: "stockInventory",
    fleetAssets: "fleetAssets",
    vendors: "vendors", // New collection added
  },
};

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
  force: args.includes("--force"),
  verbose: args.includes("--verbose"),
  validate: !args.includes("--no-validate"),
  collectionsToSeed: args.filter((arg) => !arg.startsWith("--")).map((arg) => arg.toLowerCase()),
};

// Default to 'all' if no specific collections are provided
if (options.collectionsToSeed.length === 0) {
  options.collectionsToSeed.push("all");
}

// Console coloring for better output readability
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// --- 2. DATA TO BE SEEDED ---

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
];

const tyreBrands = [
  "Bridgestone", "Michelin", "Goodyear", "Continental", "Pirelli", "Dunlop",
  "Hankook", "Yokohama", "Kumho", "Toyo", "Firemax", "Triangle", "Terraking",
  "Compasal", "Windforce", "Perelli", "Powertrac", "Sunfull", "Wellplus",
  "Techshield", "Sonix", "Formula",
];

const tyreSizes = [
  "295/80R22.5", "315/80R22.5", "295/75R22.5", "11R22.5", "12R22.5", "385/65R22.5",
  "275/70R22.5", "315/80R22.16", "315/80R22.17",
];

const tyrePatterns = [
  { brand: 'Firemax', pattern: '', size: '315/80R22.5', position: 'Drive' },
  { brand: 'TRIANGLE', pattern: 'TR688', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Terraking', pattern: 'HS102', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Compasal', pattern: 'TR688', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Windforce', pattern: 'WD2020', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Windforce', pattern: 'WD2060', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Compasal', pattern: 'CPD82', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Perelli', pattern: 'FG01S', size: '315/80R22.5', position: 'Drive' },
  { brand: 'POWERTRAC', pattern: 'TractionPro', size: '315/80R22.5', position: 'Drive' },
  { brand: 'SUNFULL', pattern: 'HF638', size: '315/80R22.5', position: 'Drive' },
  { brand: 'SUNFULL', pattern: 'HF768', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Wellplus', pattern: 'WDM16', size: '315/80R22.5', position: 'Drive' },
  { brand: 'Dunlop', pattern: 'SP571', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Firemax', pattern: 'FM188', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Firemax', pattern: 'FM19', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Terraking', pattern: 'HS268', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Windforce', pattern: 'WA1060', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Dunlop', pattern: 'SP320A', size: '315/80R22.5', position: 'Multi' },
  { brand: 'Traiangle', pattern: 'TRS03', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Sunfull', pattern: 'HF660', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Compasal', pattern: 'CPS60', size: '315/80R22.5', position: 'Steer' },
  { brand: 'SONIX', pattern: 'SX668', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Firemax', pattern: 'FM66', size: '315/80R22.5', position: 'Steer' },
  { brand: 'WellPlus', pattern: 'WDM916', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Firemax', pattern: 'FM166', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Windforce', pattern: 'WH1020', size: '315/80R22.5', position: 'Steer' },
  { brand: 'Firemax', pattern: 'FM18', size: '315/80R22.5', position: 'Steer' },
  { brand: 'POWERTRAC', pattern: 'Tracpro', size: '315/80R22.5', position: 'Trailer' },
  { brand: 'Sunfull', pattern: 'HF660', size: '315/80R22.5', position: 'Trailer' },
  { brand: 'SUNFULL', pattern: 'ST011', size: '315/80R22.5', position: 'Trailer' },
  { brand: 'Firemax', pattern: 'FM06', size: '385/65R22.5', position: 'Steer' },
  { brand: 'TECHSHIELD', pattern: 'TS778', size: '385/65R22.5', position: 'Steer' }
];

const vehiclePositions = [
  {
    vehicleType: "standard",
    name: "Standard Vehicle",
    positions: [
      { id: "Front Left", name: "Front Left" },
      { id: "Front Right", name: "Front Right" },
      { id: "Drive Axle Left Inner", name: "Drive Axle Left Inner" },
      // ... more position data
    ],
  },
  // ... other vehicle types
];

const fleetData = [
  {
    fleetNumber: "21H",
    registration: "ADS4865",
    make: "SCANIA",
    model: "G460",
    chassisNo: "9BS56440003882656",
    engineNo: "DC13106LO18271015",
    vehicleType: "Truck",
    status: "Active",
    odometer: 120000
  },
  {
    fleetNumber: "22H",
    registration: "ADS4866",
    make: "SCANIA",
    model: "G460",
    chassisNo: "9BSG6X40003882660",
    engineNo: "DC13106LO18271019",
    vehicleType: "Truck",
    status: "Active",
    odometer: 80000
  },
  {
    fleetNumber: "23H",
    registration: "AFQ1324",
    make: "SHACMAN",
    model: "X3000",
    chassisNo: "LZGJL5V42MX011270",
    engineNo: "1421A006077",
    vehicleType: "Truck",
    status: "Active",
    odometer: 25000
  },
  {
    fleetNumber: "24H",
    registration: "AFQ1325",
    make: "SHACMAN",
    model: "X3000",
    chassisNo: "LZGJL5V42MX011270",
    engineNo: "1421A006076",
    vehicleType: "Truck",
    status: "Active",
    odometer: 23000
  },
  {
    fleetNumber: "26H",
    registration: "AFQ1327",
    make: "SHACMAN",
    model: "X3000",
    chassisNo: "LZGJL5V44MX011271",
    engineNo: "1421A006085",
    vehicleType: "Truck",
    status: "Active",
    odometer: 28000
  },
  {
    fleetNumber: "28H",
    registration: "AFQ1329",
    make: "SHACMAN",
    model: "X3000",
    chassisNo: "LZGJL5V46MX011272",
    engineNo: "1421A006084",
    vehicleType: "Truck",
    status: "Active",
    odometer: 31000
  },
  {
    fleetNumber: "4F",
    registration: "AGK4430",
    make: "SERCO",
    model: "REEFER 30 PELLET",
    chassisNo: "AE93B41A3BSAF1407",
    vehicleType: "Reefer",
    status: "Active"
  },
  {
    fleetNumber: "5F",
    registration: "AGK7473",
    make: "SERCO",
    model: "REEFER 30 PELLET",
    chassisNo: "AE93B41A3BSAF1511",
    vehicleType: "Reefer",
    status: "Active"
  },
  {
    fleetNumber: "1T",
    registration: "ADZ9011/ADZ9010",
    make: "AFRIT",
    model: "36T FLAT DECK INTERLINK",
    chassisNo: "ADV16459AA10F2292/91",
    vehicleType: "Trailer",
    status: "Active"
  },
  {
    fleetNumber: "4H",
    registration: "AGZ1286",
    make: "SCANIA",
    model: "93H 250",
    chassisNo: "1203816",
    engineNo: "S112958",
    vehicleType: "Truck",
    status: "Active",
    odometer: 75000
  },
  {
    fleetNumber: "6H",
    registration: "ABJ3739",
    make: "SCANIA",
    model: "93H 250",
    chassisNo: "121005",
    engineNo: "511294",
    vehicleType: "Truck",
    status: "Active",
    odometer: 82000
  },
  {
    fleetNumber: "29H",
    registration: "AGJ3466",
    make: "SINOTRUK SA",
    model: "HOWA",
    chassisNo: "LZZ5BLSJ0PN256059",
    engineNo: "142K071819",
    vehicleType: "Truck",
    status: "Active",
    odometer: 15000
  },
  {
    fleetNumber: "30H",
    registration: "AGL4216",
    make: "SINOTRUK SA",
    model: "HOWA",
    chassisNo: "LZZ5BBFHIPE519418",
    engineNo: "E3717PY0093",
    vehicleType: "Truck",
    status: "Active",
    odometer: 12000
  },
  {
    fleetNumber: "31H",
    registration: "AGZ1963",
    make: "SHACMAN",
    model: "X3000",
    chassisNo: "LZGJL4W48PX122273",
    engineNo: "71129664",
    vehicleType: "Truck",
    status: "Active",
    odometer: 8000
  }
];

// --- Tyre Mappings & Fleet Assets ---
// The following data sets are grouped together for better organization.
const VehicleTyreStore = [
  // 15L
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V1', TyreCode: 'MAT0171' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V2', TyreCode: 'MAT0172' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V3', TyreCode: 'MAT0173' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V4', TyreCode: 'MAT0174' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'SP', TyreCode: 'MAT0175' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V1', TyreCode: 'MAT0471' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V2', TyreCode: 'MAT0472' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V3', TyreCode: 'MAT0473' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V4', TyreCode: 'MAT0474' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'SP', TyreCode: 'MAT0125' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T1', TyreCode: 'MAT0220' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T2', TyreCode: 'MAT0192' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T3', TyreCode: 'MAT0143' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T4', TyreCode: 'MAT0269' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T5', TyreCode: 'MAT0083' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T6', TyreCode: 'MAT0052' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T7', TyreCode: 'MAT0066' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T8', TyreCode: 'MAT0084' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T9', TyreCode: 'MAT0270' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T10', TyreCode: 'MAT0031' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'SP', TyreCode: 'MAT0108' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T12', TyreCode: 'MAT0230' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T13', TyreCode: 'MAT0029' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T14', TyreCode: 'MAT0228' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T15', TyreCode: 'MAT0232' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T16', TyreCode: 'MAT0056' },
  { RegistrationNo: 'ABB1578/ABB1577', StoreName: '2T', TyrePosDescription: 'T11', TyreCode: 'MAT0217' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V1', TyreCode: 'MAT0306' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V2', TyreCode: 'MAT0307' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V3', TyreCode: 'MAT0180' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V4', TyreCode: 'MAT0181' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V5', TyreCode: 'MAT0179' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V6', TyreCode: 'MAT0178' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'SP', TyreCode: 'MAT0182' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V1', TyreCode: 'MAT0022' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V2', TyreCode: 'MAT0023' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V3', TyreCode: 'MAT0035' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V4', TyreCode: 'MAT0037' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V5', TyreCode: 'MAT0036' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V6', TyreCode: 'MAT0034' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'SP', TyreCode: 'MAT0038' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V1', TyreCode: 'MAT0281' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V2', TyreCode: 'MAT0282' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V3', TyreCode: 'MAT0283' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V4', TyreCode: 'MAT0284' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V5', TyreCode: 'MAT0285' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V6', TyreCode: 'MAT0286' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V7', TyreCode: 'MAT0287' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V8', TyreCode: 'MAT0288' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V9', TyreCode: 'MAT0289' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'V10', TyreCode: 'MAT0280' },
  { RegistrationNo: 'AGZ1963', StoreName: '31H', TyrePosDescription: 'SP', TyreCode: 'MAT0520' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V1', TyreCode: 'MAT0450' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V2', TyreCode: 'MAT0451' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V3', TyreCode: 'MAT0452' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V4', TyreCode: 'MAT0453' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V5', TyreCode: 'MAT0454' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V6', TyreCode: 'MAT0455' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V7', TyreCode: 'MAT0456' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V8', TyreCode: 'MAT0457' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V9', TyreCode: 'MAT0458' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'V10', TyreCode: 'MAT0459' },
  { RegistrationNo: 'JFK963FS', StoreName: '33H', TyrePosDescription: 'SP', TyreCode: 'MAT0460' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V1', TyreCode: 'MAT0420' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V2', TyreCode: 'MAT0421' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V3', TyreCode: 'MAT0422' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V4', TyreCode: 'MAT0423' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V5', TyreCode: 'MAT0424' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V6', TyreCode: 'MAT0429' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V7', TyreCode: 'MAT0425' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V8', TyreCode: 'MAT0426' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V9', TyreCode: 'MAT0427' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'V10', TyreCode: 'MAT0428' },
  { RegistrationNo: 'JFK964FS', StoreName: '32H', TyrePosDescription: 'SP', TyreCode: 'MAT0519' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V1', TyreCode: 'MAT0167' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V2', TyreCode: 'MAT0276' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V3', TyreCode: 'MAT0431' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V4', TyreCode: 'MAT0432' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V5', TyreCode: 'MAT0433' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V6', TyreCode: 'MAT0434' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V7', TyreCode: 'MAT0435' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V8', TyreCode: 'MAT0436' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V9', TyreCode: 'MAT0437' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'V10', TyreCode: 'MAT0438' },
  { RegistrationNo: 'AFQ1324', StoreName: '23H', TyrePosDescription: 'SP', TyreCode: 'MAT0496' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V1', TyreCode: 'MAT0274' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V2', TyreCode: 'MAT0236' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V3', TyreCode: 'MAT0406' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V4', TyreCode: 'MAT0407' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V5', TyreCode: 'MAT0408' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V6', TyreCode: 'MAT0409' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V7', TyreCode: 'MAT0410' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V8', TyreCode: 'MAT0411' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V9', TyreCode: 'MAT0412' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'V10', TyreCode: 'MAT0413' },
  { RegistrationNo: 'AFQ1325', StoreName: '24H', TyrePosDescription: 'SP', TyreCode: '' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V1', TyreCode: 'MAT0204' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V2', TyreCode: 'MAT0205' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V3', TyreCode: 'MAT0206' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V4', TyreCode: 'MAT0207' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V5', TyreCode: 'MAT0208' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V6', TyreCode: 'MAT0209' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V7', TyreCode: 'MAT0210' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V8', TyreCode: 'MAT0211' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V9', TyreCode: 'MAT0212' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'V10', TyreCode: 'MAT0213' },
  { RegistrationNo: 'AFQ1327', StoreName: '26H', TyrePosDescription: 'SP', TyreCode: '' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V1', TyreCode: 'MAT0402' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V2', TyreCode: 'MAT0403' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V3', TyreCode: 'MAT0135' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V4', TyreCode: 'MAT0103' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V5', TyreCode: 'MAT0105' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V6', TyreCode: 'MAT0102' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V7', TyreCode: 'MAT0104' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V8', TyreCode: 'MAT0136' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V9', TyreCode: 'MAT0137' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'V10', TyreCode: 'MAT0138' },
  { RegistrationNo: 'AFQ1329', StoreName: '28H', TyrePosDescription: 'SP', TyreCode: '' }
];

const fleetAssets = [
  { fleetNo: '14L', positions: ['V1', 'V2', 'V3', 'V4', 'SP'], type: 'Horse' },
  { fleetNo: '15L', positions: ['V1', 'V2', 'V3', 'V4', 'SP'], type: 'Horse' },
  { fleetNo: '21H', positions: ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','SP'], type: 'Horse' },
  { fleetNo: '22H', positions: ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','SP'], type: 'Horse' },
  { fleetNo: '23H', positions: ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','SP'], type: 'Horse' },
  { fleetNo: '24H', positions: ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','SP'], type: 'Horse' },
  { fleetNo: '26H', positions: ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','SP'], type: 'Horse' },
  { fleetNo: '28H', positions: ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','SP'], type: 'Horse' },
  { fleetNo: '31H', positions: ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','SP'], type: 'Horse' },
  { fleetNo: '32H', positions: ['V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','SP'], type: 'Horse' },
  { fleetNo: '1T', positions: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14','T15','T16','SP1','SP2'], type: 'Interlink' },
  { fleetNo: '2T', positions: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14','T15','T16','SP1','SP2'], type: 'Interlink' },
  { fleetNo: '3T', positions: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14','T15','T16','SP1','SP2'], type: 'Interlink' },
  { fleetNo: '4T', positions: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','T13','T14','T15','T16','SP1','SP2'], type: 'Interlink' },
  { fleetNo: '4F', positions: ['T1','T2','T3','T4','T5','T6','SP1','SP2'], type: 'Reefer' },
  { fleetNo: '5F', positions: ['T1','T2','T3','T4','T5','T6','SP1','SP2'], type: 'Reefer' },
  { fleetNo: '6F', positions: ['T1','T2','T3','T4','T5','T6','SP1','SP2'], type: 'Reefer' },
  { fleetNo: '7F', positions: ['T1','T2','T3','T4','T5','T6','SP1','SP2'], type: 'Reefer' },
  { fleetNo: '8F', positions: ['T1','T2','T3','T4','T5','T6','SP1','SP2'], type: 'Reefer' },
  { fleetNo: '4H', positions: ['P1','P2','P3','P4','P5','P6','SP'], type: 'LMV' },
  { fleetNo: '6H', positions: ['P1','P2','P3','P4','P5','P6','SP'], type: 'LMV' },
  { fleetNo: 'UD', positions: ['P1','P2','P3','P4','P5','P6','SP'], type: 'LMV' },
  { fleetNo: '30H', positions: ['P1','P2','P3','P4','P5','P6','SP'], type: 'LMV' },
  { fleetNo: '29H', positions: ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10','SP'], type: 'Other' },
];

// Stock inventory data transformed from seedStockInventory.mjs to match the expected structure in WorkshopContext
// Import the full transformed inventory data (196 items)
const transformedInventory = require('./transformed-inventory.cjs');

// Include our manually transformed items with the full dataset
const stockInventory = [
  // Our manually transformed items from above
  {
    itemCode: "14LHUB",
    itemName: "14L HUB",
    category: "HUB PARTS",
    subCategory: "TRUCK PARTS",
    description: "14L HUB",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 250.0,
    vendor: "GENERAL SUPPLIER",
    vendorId: "general_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "215/80R15C TYRES",
    itemName: "215/80R15C TYRES",
    category: "TYRES",
    subCategory: "TRUCK TYRES",
    description: "215/80R15C TYRES",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 146.0,
    vendor: "TYRE SUPPLIER",
    vendorId: "tyre_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "24v",
    itemName: "H1 24V HALOGEN",
    category: "ELECTRICAL",
    subCategory: "LIGHTING",
    description: "H1 24V HALOGEN",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 2.0,
    vendor: "GENERAL SUPPLIER",
    vendorId: "general_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "24V 75/70W HALOGEN BULBS",
    itemName: "24V 75/70W HALOGEN BULBS",
    category: "ELECTRICAL",
    subCategory: "LIGHTING",
    description: "24V 75/70W HALOGEN BULBS",
    unit: "ea",
    quantity: 20.0,
    reorderLevel: 8,
    cost: 2.0,
    vendor: "GENERAL SUPPLIER",
    vendorId: "general_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "27H OIL PUMP",
    itemName: "OIL PUMP ASSEMBLY",
    category: "ENGINE PARTS",
    subCategory: "LUBRICATING SYSTEM",
    description: "OIL PUMP ASSEMBLY",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 385.31,
    vendor: "ENGINE PARTS SUPPLIER",
    vendorId: "engine_parts_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "295s retread",
    itemName: "295s retread tyres",
    category: "TYRES",
    subCategory: "RETREAD TYRES",
    description: "295s retread tyres",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 96.88,
    vendor: "TYRE SUPPLIER",
    vendorId: "tyre_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "385 STEER TYRES",
    itemName: "NEW STEER TYRES 385",
    category: "TYRES",
    subCategory: "STEER TYRES",
    description: "NEW STEER TYRES 385",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 247.0,
    vendor: "TYRE SUPPLIER",
    vendorId: "tyre_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "5F BATTERY",
    itemName: "5F BATTERY",
    category: "ELECTRICAL",
    subCategory: "BATTERIES",
    description: "5F BATTERY",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 195.0,
    vendor: "ELECTRICAL PARTS SUPPLIER",
    vendorId: "electrical_parts_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "5L HEAD GASKET",
    SupplierPartNo: "",
    StockDescription: "5L HEAD GASKET",
    StockCostPrice: 35.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "5L Oil pressure switch",
    SupplierPartNo: "",
    StockDescription: "5L Oil pressure switch",
    StockCostPrice: 5.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "AIR0002",
    SupplierPartNo: "R3000430/23",
    StockDescription: "AIRFILTERS CARRIER UNITS",
    StockCostPrice: 24.29,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "AIRBAG",
    SupplierPartNo: "",
    StockDescription: "30K BPW AIRBAG",
    StockCostPrice: 150.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Airbags",
    SupplierPartNo: "",
    StockDescription: "Airbags for JT62VYGP",
    StockCostPrice: 175.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "AIRC001",
    SupplierPartNo: "",
    StockDescription: "INNER AIR FILTER UD",
    StockCostPrice: 30.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "AIRC002",
    SupplierPartNo: "",
    StockDescription: "OUTER AIR FILTER UD",
    StockCostPrice: 70.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "ALLIGNMENT",
    SupplierPartNo: "",
    StockDescription: "Wheel Allignment",
    StockCostPrice: 80.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Batteries",
    SupplierPartNo: "",
    StockDescription: "Batteries",
    StockCostPrice: 190.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "batteries- 4H",
    SupplierPartNo: "",
    StockDescription: "Batteries- 4H",
    StockCostPrice: 190.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "BOTTLE JACKS",
    SupplierPartNo: "",
    StockDescription: "30T BOTTLE JACKS",
    StockCostPrice: 65.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "brake drums-Serco trailers",
    SupplierPartNo: "",
    StockDescription: "Brake drums- Serco Fridge trailers",
    StockCostPrice: 160.0,
    StockQty: 6.0,
    StockValue: 960.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Cab bushes",
    SupplierPartNo: "",
    StockDescription: "Cab bushes-6H",
    StockCostPrice: 55.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "CABLE TIES",
    SupplierPartNo: "",
    StockDescription: "CABLE TIES- 4 PACKS",
    StockCostPrice: 0.1,
    StockQty: 75.0,
    StockValue: 7.5,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "canter knuckles",
    SupplierPartNo: "",
    StockDescription: "Canter knuckles",
    StockCostPrice: 45.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "CFIL001",
    SupplierPartNo: "",
    StockDescription: "CANTER AIR FILTERS",
    StockCostPrice: 20.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "corner light",
    SupplierPartNo: "",
    StockDescription: "Corner light",
    StockCostPrice: 75.0,
    StockQty: 1.0,
    StockValue: 75.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "COUPON",
    SupplierPartNo: "",
    StockDescription: "COUPON BORDERS",
    StockCostPrice: 10.0,
    StockQty: 500.0,
    StockValue: 5000.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "crankshaft seal",
    SupplierPartNo: "",
    StockDescription: "Crakshaft seal for 27H",
    StockCostPrice: 145.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "DEGREASER",
    SupplierPartNo: "",
    StockDescription: "DEGREASER/LTR",
    StockCostPrice: 2.0,
    StockQty: 40.0,
    StockValue: 80.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "DOOR HANDLE",
    SupplierPartNo: "",
    StockDescription: "SHACMAN DOOR HANDLES",
    StockCostPrice: 28.48,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "DOU- 12V",
    SupplierPartNo: "",
    StockDescription: "12V DOUBLE CONTACT BULBS",
    StockCostPrice: 1.0,
    StockQty: 3.0,
    StockValue: 3.0,
    ReorderLevel: 8
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Draglink ball joints",
    SupplierPartNo: "",
    StockDescription: "Draglink ball joints",
    StockCostPrice: 166.16,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "EXHS001",
    SupplierPartNo: "",
    StockDescription: "EXHAUST SILINCER",
    StockCostPrice: 678.5,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "FANB001",
    SupplierPartNo: "",
    StockDescription: "FAN BELT V5462 P477",
    StockCostPrice: 12.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "FBRP001",
    SupplierPartNo: "",
    StockDescription: "BRAKE PADS ISUZU",
    StockCostPrice: 10.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    itemCode: "FFUE004",
    itemName: "Engine Oil",
    category: "FLUIDS",
    subCategory: "LUBRICANTS",
    description: "Engine Oil",
    unit: "lt",
    quantity: 235.0,
    reorderLevel: 100,
    cost: 2.91,
    vendor: "FLUIDS SUPPLIER",
    vendorId: "fluids_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "FFUE005",
    itemName: "Gear oil- SAE 80W90",
    category: "FLUIDS",
    subCategory: "LUBRICANTS",
    description: "Gear oil- SAE 80W90",
    unit: "lt",
    quantity: 869.0,
    reorderLevel: 100,
    cost: 4.15,
    vendor: "FLUIDS SUPPLIER",
    vendorId: "fluids_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "FIL001",
    itemName: "Volvo Gearbox Oil Filter",
    category: "FILTERS",
    subCategory: "GEARBOX FILTERS",
    description: "Volvo Gearbox Oil Filter",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 11.0,
    vendor: "FILTER SUPPLIER",
    vendorId: "filter_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "Fire extinguishers",
    itemName: "FIRE EXTINGUISHERS FOR TRAILERS",
    category: "SAFETY",
    subCategory: "FIRE SAFETY",
    description: "FIRE EXTINGUISHERS FOR TRAILERS",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 66.7,
    vendor: "SAFETY EQUIPMENT SUPPLIER",
    vendorId: "safety_equipment_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "FFUE004-50",
    itemName: "Engine Oil Bulk Package",
    category: "FLUIDS",
    subCategory: "LUBRICANTS",
    description: "Engine Oil 50L Container",
    unit: "container",
    quantity: 5,
    reorderLevel: 2,
    cost: 145.5,
    vendor: "FLUIDS SUPPLIER",
    vendorId: "fluids_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "FLAT WASHERS",
    itemName: "FLAT WASHERS",
    category: "FASTENERS",
    subCategory: "WASHERS",
    description: "FLAT WASHERS",
    unit: "ea",
    quantity: 16.0,
    reorderLevel: 0,
    cost: 3.0,
    vendor: "HARDWARE SUPPLIER",
    vendorId: "hardware_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "Flor brooms",
    itemName: "Floor brooms",
    category: "CLEANING",
    subCategory: "BROOMS",
    description: "Floor brooms",
    unit: "ea",
    quantity: 0.0,
    reorderLevel: 0,
    cost: 5.0,
    vendor: "GENERAL SUPPLIER",
    vendorId: "general_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "FN008",
    itemName: "Volvo FH12 Fan Belt",
    category: "ENGINE PARTS",
    subCategory: "BELTS",
    description: "Volvo FH12 Fan Belt",
    unit: "ea",
    quantity: 3.0,
    reorderLevel: 2,
    cost: 45.0,
    vendor: "VOLVO PARTS SUPPLIER",
    vendorId: "volvo_parts_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
    serialNumber: "FH12",
  },
  {
    itemCode: "BRAKE-PAD-001",
    itemName: "Front Brake Pads - Scania",
    category: "BRAKING SYSTEM",
    subCategory: "BRAKE PADS",
    description: "High performance front brake pads for Scania trucks",
    unit: "set",
    quantity: 8.0,
    reorderLevel: 3,
    cost: 85.0,
    vendor: "BRAKING SYSTEM SUPPLIER",
    vendorId: "braking_system_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    itemCode: "FILTER-AIR-002",
    itemName: "Air Filter - UD Trucks",
    category: "FILTERS",
    subCategory: "AIR FILTERS",
    description: "Air filter for UD truck models",
    unit: "ea",
    quantity: 12.0,
    reorderLevel: 5,
    cost: 32.0,
    vendor: "FILTER SUPPLIER",
    vendorId: "filter_supplier",
    location: "MUTARE DEPOT STOCK",
    lastRestocked: new Date().toISOString().split("T")[0],
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "FN010",
    SupplierPartNo: "3681811",
    StockDescription: "Fan Belt",
    StockCostPrice: 7.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "FN012",
    SupplierPartNo: "P478",
    StockDescription: "Fan Belt",
    StockCostPrice: 5.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "FRONT CAB",
    SupplierPartNo: "",
    StockDescription: "FRONT CAB MOUNTING",
    StockCostPrice: 9.62,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "H/LAMP- 12V",
    SupplierPartNo: "",
    StockDescription: "12V 100/90W HEADLAMP BULBS",
    StockCostPrice: 2.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 8
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "HGSC001",
    SupplierPartNo: "",
    StockDescription: "HEAD GASKETS- SCANIA G460",
    StockCostPrice: 25.0,
    StockQty: 6.0,
    StockValue: 150.0,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "HOSE CLAMPS",
    SupplierPartNo: "",
    StockDescription: "HOSE CLAMPS",
    StockCostPrice: 0.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "HSB002",
    SupplierPartNo: "",
    StockDescription: "Hacksaw blade sandflex",
    StockCostPrice: 3.14,
    StockQty: 2.0,
    StockValue: 6.28,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Idlier Arm",
    SupplierPartNo: "",
    StockDescription: "Idlier Arm",
    StockCostPrice: 40.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Injector Oil seals",
    SupplierPartNo: "",
    StockDescription: "Injector Oil seals- UD95",
    StockCostPrice: 0.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Inner Air filter",
    SupplierPartNo: "",
    StockDescription: "Inner Air filter",
    StockCostPrice: 121.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "INST001",
    SupplierPartNo: "",
    StockDescription: "Insulation Tape 18mm* 20m Red",
    StockCostPrice: 1.18,
    StockQty: 21.0,
    StockValue: 24.78,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Isuzu AIR filters",
    SupplierPartNo: "",
    StockDescription: "Air filters",
    StockCostPrice: 15.0,
    StockQty: 5.0,
    StockValue: 75.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "KLAM0001",
    SupplierPartNo: "",
    StockDescription: "TRUCK LAMB HOLDER",
    StockCostPrice: 19.7,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "KLDH0001",
    SupplierPartNo: "",
    StockDescription: "License Disc Holders-h5453",
    StockCostPrice: 5.0,
    StockQty: 3.0,
    StockValue: 0.15,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Large speed stickers",
    SupplierPartNo: "",
    StockDescription: "Maximum speed stickers- Large",
    StockCostPrice: 2.31,
    StockQty: 5.0,
    StockValue: 11.55,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "load sensing valve",
    SupplierPartNo: "",
    StockDescription: "Loading sensing valve",
    StockCostPrice: 120.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Loading bars",
    SupplierPartNo: "",
    StockDescription: "Loading bars",
    StockCostPrice: 30.84,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "LSPR001",
    SupplierPartNo: "",
    StockDescription: "LEAF SPRING KB",
    StockCostPrice: 45.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "MOVING NUTS",
    SupplierPartNo: "",
    StockDescription: "MOVING NUTS- NEW REFEERS",
    StockCostPrice: 3.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "NUT LOCKS",
    SupplierPartNo: "",
    StockDescription: "NUT LOCKS",
    StockCostPrice: 0.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Outer Air filter",
    SupplierPartNo: "",
    StockDescription: "Outer air filter",
    StockCostPrice: 146.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "PARK- 24V",
    SupplierPartNo: "",
    StockDescription: "24V PARLIGHT BULBS",
    StockCostPrice: 1.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 8
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "PKING",
    SupplierPartNo: "",
    StockDescription: "PARKING FEES",
    StockCostPrice: 5.0,
    StockQty: 200.0,
    StockValue: 1000.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Plastic corners",
    SupplierPartNo: "",
    StockDescription: "Plastic corners",
    StockCostPrice: 8.16,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "PPMP001",
    SupplierPartNo: "",
    StockDescription: "PRIME PUMP- 93H",
    StockCostPrice: 30.0,
    StockQty: 1.0,
    StockValue: 30.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "RATC001",
    SupplierPartNo: "",
    StockDescription: "CARGO RATCHETS",
    StockCostPrice: 15.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "RCAB001",
    SupplierPartNo: "",
    StockDescription: "REAR CAB AIR BAG SHACMAN",
    StockCostPrice: 165.0,
    StockQty: 1.0,
    StockValue: 165.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "REAR CAB",
    SupplierPartNo: "",
    StockDescription: "REAR CAB MOUNTING",
    StockCostPrice: 67.23,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "RED RFLECTIVE TAPE",
    SupplierPartNo: "",
    StockDescription: "RED REFLECTIVE TAPE",
    StockCostPrice: 3.0,
    StockQty: 4.5,
    StockValue: 13.5,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "SBSM001",
    SupplierPartNo: "",
    StockDescription: "Shacman blind spot mirror",
    StockCostPrice: 56.52,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "SCDC001",
    SupplierPartNo: "",
    StockDescription: "9 Inch Forte Steel Cutting Disc",
    StockCostPrice: 2.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "SFLT004",
    SupplierPartNo: "",
    StockDescription: "Z188 Fuel filter",
    StockCostPrice: 6.0,
    StockQty: 3.0,
    StockValue: 18.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "shac wip001",
    SupplierPartNo: "",
    StockDescription: "Shacman wiper blades",
    StockCostPrice: 5.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "shackle bushes",
    SupplierPartNo: "",
    StockDescription: "Shackel bushes",
    StockCostPrice: 5.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "SINGLE- 12V",
    SupplierPartNo: "",
    StockDescription: "12V SINGLE CONTACT BULBS",
    StockCostPrice: 1.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 8
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Soft brooms",
    SupplierPartNo: "",
    StockDescription: "Soft brooms",
    StockCostPrice: 0.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "SPRING PACK",
    SupplierPartNo: "",
    StockDescription: "SPRING PACK FOR ADZ9011",
    StockCostPrice: 140.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "spring packs",
    SupplierPartNo: "",
    StockDescription: "spring packs",
    StockCostPrice: 200.0,
    StockQty: 2.0,
    StockValue: 279.99,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "starter motor- 5L",
    SupplierPartNo: "",
    StockDescription: "STARTER MOTOR- 5L",
    StockCostPrice: 238.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Starter motor-14L/15L",
    SupplierPartNo: "",
    StockDescription: "Starter motor- 14L/15L",
    StockCostPrice: 100.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Starter-G460",
    SupplierPartNo: "",
    StockDescription: "Starter for scania G460",
    StockCostPrice: 340.58,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "steering box 93h recon",
    SupplierPartNo: "",
    StockDescription: "steering box 93h recon",
    StockCostPrice: 100.0,
    StockQty: 1.0,
    StockValue: 100.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Stop signs",
    SupplierPartNo: "",
    StockDescription: "Stop signs",
    StockCostPrice: 2.0,
    StockQty: 10.0,
    StockValue: 20.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "Stoplight switch",
    SupplierPartNo: "",
    StockDescription: "Stop light switch",
    StockCostPrice: 6.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "T-PIECE",
    SupplierPartNo: "",
    StockDescription: "T-PIECE- NEW REFEERS",
    StockCostPrice: 5.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TAIR0002",
    SupplierPartNo: "",
    StockDescription: "Fridge trailer air filter",
    StockCostPrice: 30.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TAIR003",
    SupplierPartNo: "",
    StockDescription: "AIR CLEANER HOUSING",
    StockCostPrice: 330.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TAOF001",
    SupplierPartNo: "",
    StockDescription: "OIL FILTER UD",
    StockCostPrice: 35.0,
    StockQty: 1.0,
    StockValue: 35.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TARG0001",
    SupplierPartNo: "",
    StockDescription: "SINOTRUCK FUEL FILTER",
    StockCostPrice: 24.0,
    StockQty: 2.0,
    StockValue: 48.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TARPS",
    SupplierPartNo: "",
    StockDescription: "TARPS/LABOUR",
    StockCostPrice: 5.0,
    StockQty: 400.0,
    StockValue: 3000.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TASP0001",
    SupplierPartNo: "",
    StockDescription: "Assorted Push ons&round Terminals (Each)",
    StockCostPrice: 0.15,
    StockQty: 126.0,
    StockValue: 18.9,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TASR0001",
    SupplierPartNo: "",
    StockDescription: "14 Assorted studs",
    StockCostPrice: 0.05,
    StockQty: 12.0,
    StockValue: 0.6,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TASR0002",
    SupplierPartNo: "",
    StockDescription: "15 Assorted Bolts/Nuts",
    StockCostPrice: 0.31,
    StockQty: 649.0,
    StockValue: 201.19,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBAL0001",
    SupplierPartNo: "",
    StockDescription: "Ball Bearings-KM48548/10-KB (Each)",
    StockCostPrice: 0.09,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBAL0003",
    SupplierPartNo: "",
    StockDescription: "Isuzu Ball Joints",
    StockCostPrice: 0.41,
    StockQty: 1.0,
    StockValue: 0.41,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBAP0001",
    SupplierPartNo: "",
    StockDescription: "Battery lugs",
    StockCostPrice: 0.05,
    StockQty: 15.0,
    StockValue: 0.75,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBAW0001",
    SupplierPartNo: "",
    StockDescription: "Battery Water",
    StockCostPrice: 0.7,
    StockQty: 6.0,
    StockValue: 4.2,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBEA0001",
    SupplierPartNo: "HM911245/10",
    StockDescription: "HM 911245/10 BEARINGS",
    StockCostPrice: 1.35,
    StockQty: 2.0,
    StockValue: 2.7,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBEA0002",
    SupplierPartNo: "",
    StockDescription: "REAR HURB BEARING KIT",
    StockCostPrice: 60.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBEA0004",
    SupplierPartNo: "M86649",
    StockDescription: "BEARINGS M86649",
    StockCostPrice: 0.23,
    StockQty: 2.0,
    StockValue: 0.46,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBEA0005",
    SupplierPartNo: "",
    StockDescription: "BEARINGS HM88649",
    StockCostPrice: 0.46,
    StockQty: 4.0,
    StockValue: 1.84,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBEA0006",
    SupplierPartNo: "",
    StockDescription: "Gearbox Bearings-SB1716BBNS (Each)",
    StockCostPrice: 0.23,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBEA0010",
    SupplierPartNo: "",
    StockDescription: "BEARINGS 6306",
    StockCostPrice: 0.07,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBEA0012",
    SupplierPartNo: "",
    StockDescription: "BEARING 6304",
    StockCostPrice: 10.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBEL0001",
    SupplierPartNo: "",
    StockDescription: "Belt Tensioner Scania 124G",
    StockCostPrice: 1.18,
    StockQty: 1.0,
    StockValue: 1.18,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBEL0002",
    SupplierPartNo: "",
    StockDescription: "ALT BELT 97721",
    StockCostPrice: 0.32,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBLA0001",
    SupplierPartNo: "",
    StockDescription: "Black Mamba(Electric Cables)",
    StockCostPrice: 0.09,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "tbls0001",
    SupplierPartNo: "",
    StockDescription: "Brake light switch- shacman",
    StockCostPrice: 28.86,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBOL0001",
    SupplierPartNo: "",
    StockDescription: "Bolts-Cylinders",
    StockCostPrice: 0.18,
    StockQty: 18.0,
    StockValue: 3.24,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBOL0002",
    SupplierPartNo: "",
    StockDescription: "Veranda bolts",
    StockCostPrice: 0.27,
    StockQty: 110.0,
    StockValue: 29.7,
    ReorderLevel: 50
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBOL0005",
    SupplierPartNo: "",
    StockDescription: "Centre Bolt Long",
    StockCostPrice: 0.14,
    StockQty: 4.0,
    StockValue: 4.4,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBOL0006",
    SupplierPartNo: "",
    StockDescription: "Tie Bolts",
    StockCostPrice: 0.12,
    StockQty: 2.0,
    StockValue: 0.24,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBOL0007",
    SupplierPartNo: "",
    StockDescription: "U BOLTS",
    StockCostPrice: 30.0,
    StockQty: 6.0,
    StockValue: 1.92,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBPW0001",
    SupplierPartNo: "",
    StockDescription: "BPW BRAKE SHOES- NEW",
    StockCostPrice: 50.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBRA0001",
    SupplierPartNo: "",
    StockDescription: "BRAKE FLUID",
    StockCostPrice: 4.9,
    StockQty: 16.0,
    StockValue: 78.4,
    ReorderLevel: 10
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBRAK0001",
    SupplierPartNo: "",
    StockDescription: "BRAKE SHOES",
    StockCostPrice: 35.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 12
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBRD001",
    SupplierPartNo: "",
    StockDescription: "BRAKE DRUMS",
    StockCostPrice: 120.0,
    StockQty: 7.0,
    StockValue: 1400.0,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBRP0001",
    SupplierPartNo: "",
    StockDescription: "BRAKE ROLLERS AND PINS",
    StockCostPrice: 6.0,
    StockQty: 9.0,
    StockValue: 34.69,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBRS0001",
    SupplierPartNo: "",
    StockDescription: "BRAKE RETURN SPRING",
    StockCostPrice: 4.5,
    StockQty: 37.0,
    StockValue: 49.21,
    ReorderLevel: 10
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUL0005",
    SupplierPartNo: "",
    StockDescription: "12V WEDGE BULBS",
    StockCostPrice: 1.54,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUL0006",
    SupplierPartNo: "",
    StockDescription: "12V/100/90W HEAD LAMP BULBS",
    StockCostPrice: 3.18,
    StockQty: 6.0,
    StockValue: 19.08,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUL0007",
    SupplierPartNo: "",
    StockDescription: "Shacman Oil Filter - service",
    StockCostPrice: 15.53,
    StockQty: 4.0,
    StockValue: 89.29,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUL0008",
    SupplierPartNo: "",
    StockDescription: "Shacman DIesel Filter - Service",
    StockCostPrice: 17.25,
    StockQty: 3.0,
    StockValue: 51.25,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUL0009",
    SupplierPartNo: "",
    StockDescription: "Shacman Water Filter - Service",
    StockCostPrice: 27.6,
    StockQty: 13.0,
    StockValue: 358.8,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUL0010",
    SupplierPartNo: "",
    StockDescription: "H7 24V 70/75W HEADLAMP BULBS",
    StockCostPrice: 5.22,
    StockQty: 29.0,
    StockValue: 151.38,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUL0011",
    SupplierPartNo: "",
    StockDescription: "H13 24V 70/75W SPOTLIGHT BULBS ",
    StockCostPrice: 4.27,
    StockQty: 57.0,
    StockValue: 243.39,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUS0001",
    SupplierPartNo: "",
    StockDescription: "SPRING HANGER BUSH PIN",
    StockCostPrice: 20.0,
    StockQty: 2.0,
    StockValue: 47.5,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUS0002",
    SupplierPartNo: "",
    StockDescription: "CAB BUSHES",
    StockCostPrice: 27.52,
    StockQty: 1.0,
    StockValue: 27.52,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUS0004",
    SupplierPartNo: "",
    StockDescription: "EQUALIZER BUSHES",
    StockCostPrice: 5.21,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUS0005",
    SupplierPartNo: "",
    StockDescription: "TRAILER TORQUE ARM BUSHES",
    StockCostPrice: 4.34,
    StockQty: 3.0,
    StockValue: 11.06,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUS0006",
    SupplierPartNo: "",
    StockDescription: "SPHERICAL BUSHES BRAKE CAM SPH BUS",
    StockCostPrice: 0.15,
    StockQty: 1.0,
    StockValue: 0.15,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TBUS0008",
    SupplierPartNo: "",
    StockDescription: "BRAS BUSHES",
    StockCostPrice: 0.14,
    StockQty: 9.0,
    StockValue: 1.26,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCAB003",
    SupplierPartNo: "",
    StockDescription: "AIR BAG BPW ECO ",
    StockCostPrice: 145.0,
    StockQty: 1.0,
    StockValue: 145.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCAM0001",
    SupplierPartNo: "",
    StockDescription: "CAM BUSHES",
    StockCostPrice: 2.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCAR0001",
    SupplierPartNo: "",
    StockDescription: "CARGO BELTS",
    StockCostPrice: 5.0,
    StockQty: 2.0,
    StockValue: 10.0,
    ReorderLevel: 10
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCLA0002",
    SupplierPartNo: "",
    StockDescription: "HOSE CLAMPS",
    StockCostPrice: 0.7,
    StockQty: 25.0,
    StockValue: 17.5,
    ReorderLevel: 10
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCOO0001",
    SupplierPartNo: "",
    StockDescription: "COOLANT",
    StockCostPrice: 2.62,
    StockQty: 33.0,
    StockValue: 86.46,
    ReorderLevel: 20
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCOS0001",
    SupplierPartNo: "",
    StockDescription: "SILICONE SEALANT",
    StockCostPrice: 5.0,
    StockQty: 4.0,
    StockValue: 20.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCOU00005",
    SupplierPartNo: "",
    StockDescription: "COUPLINGS 105614-3360",
    StockCostPrice: 0.02,
    StockQty: 1.0,
    StockValue: 0.02,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCOU0002",
    SupplierPartNo: "",
    StockDescription: "AIR FEMALE COUPLING",
    StockCostPrice: 4.73,
    StockQty: 4.0,
    StockValue: 18.92,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCOU0003",
    SupplierPartNo: "",
    StockDescription: "ELECTRIC MALE COUPLING",
    StockCostPrice: 4.03,
    StockQty: 18.0,
    StockValue: 72.54,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCOU0004",
    SupplierPartNo: "",
    StockDescription: "FEMALE ELECTRICAL COUPLINGS",
    StockCostPrice: 5.02,
    StockQty: 12.0,
    StockValue: 60.24,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCOW0001",
    SupplierPartNo: "",
    StockDescription: "COWLING DISCOVERY ESR 2308",
    StockCostPrice: 1.17,
    StockQty: 1.0,
    StockValue: 1.17,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCST0001",
    SupplierPartNo: "",
    StockDescription: "COMPLETE STUDS TRUCK AND TRAILER",
    StockCostPrice: 5.31,
    StockQty: 1.0,
    StockValue: 5.31,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCTB0001",
    SupplierPartNo: "",
    StockDescription: "CLUTCH THRUST BEARING-XC1021/1 NISSAN HB",
    StockCostPrice: 8.6,
    StockQty: 1.0,
    StockValue: 8.6,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TCYL0002",
    SupplierPartNo: "",
    StockDescription: "SLAVE CYLINDER",
    StockCostPrice: 25.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TDAL0001",
    SupplierPartNo: "",
    StockDescription: "DEPO AUTO LAMP",
    StockCostPrice: 0.54,
    StockQty: 3.0,
    StockValue: 1.62,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TDAS0001",
    SupplierPartNo: "",
    StockDescription: "SCANIA DASHBOARD BULBS",
    StockCostPrice: 0.11,
    StockQty: 24.0,
    StockValue: 2.64,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TDAS0002",
    SupplierPartNo: "",
    StockDescription: "SCANIA DASHBOARD-383-609",
    StockCostPrice: 1.22,
    StockQty: 1.0,
    StockValue: 1.22,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TDBO0001",
    SupplierPartNo: "",
    StockDescription: "DOUBLE BOOSTER ",
    StockCostPrice: 45.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TDIS0001",
    SupplierPartNo: "",
    StockDescription: "GRINDING DISC- 9 INCH",
    StockCostPrice: 7.51,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TDIS0003",
    SupplierPartNo: "",
    StockDescription: "4.5 INCH CUTTING DISC",
    StockCostPrice: 0.02,
    StockQty: 10.0,
    StockValue: 0.2,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TDIS0004",
    SupplierPartNo: "",
    StockDescription: "GRINDING DISC 4.5 INCH",
    StockCostPrice: 0.03,
    StockQty: 16.0,
    StockValue: 0.48,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TDSB0001",
    SupplierPartNo: "",
    StockDescription: "DOUBLE SPRING BRAKE CHAMBER",
    StockCostPrice: 44.1,
    StockQty: 7.0,
    StockValue: 308.7,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TDUO0002",
    SupplierPartNo: "",
    StockDescription: "24V 21W DOUBLE CONTACT",
    StockCostPrice: 0.26,
    StockQty: 69.0,
    StockValue: 17.94,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TECL0001",
    SupplierPartNo: "",
    StockDescription: "ENGINE CLEANER",
    StockCostPrice: 2.15,
    StockQty: 23.0,
    StockValue: 49.56,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TEEPOL",
    SupplierPartNo: "",
    StockDescription: "TEEPOL",
    StockCostPrice: 2.0,
    StockQty: 2.0,
    StockValue: 4.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TEFLON PLATES",
    SupplierPartNo: "9707010156",
    StockDescription: "Teflon Plates",
    StockCostPrice: 19.9,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TEL0002",
    SupplierPartNo: "",
    StockDescription: "SCANIA 24V RELAY 1391322-1-.22091",
    StockCostPrice: 0.05,
    StockQty: 2.0,
    StockValue: 0.1,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TEMC0001",
    SupplierPartNo: "",
    StockDescription: "TEMC0001",
    StockCostPrice: 3.15,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TENF0001",
    SupplierPartNo: "",
    StockDescription: "ENGINE FLUSH",
    StockCostPrice: 0.15,
    StockQty: 33.0,
    StockValue: 4.95,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TEQU0001",
    SupplierPartNo: "",
    StockDescription: "EQUALISERS",
    StockCostPrice: 305.0,
    StockQty: 6.0,
    StockValue: 600.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TEQU0002",
    SupplierPartNo: "",
    StockDescription: "EQUALIZER BUSHES",
    StockCostPrice: 10.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TERMINALS",
    SupplierPartNo: "",
    StockDescription: "BATTERY TERMINALS",
    StockCostPrice: 1.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFAN0003",
    SupplierPartNo: "",
    StockDescription: "93H FAN BELT",
    StockCostPrice: 0.32,
    StockQty: 4.0,
    StockValue: 1.28,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFAN0005",
    SupplierPartNo: "",
    StockDescription: "814204 93H FAN BELT SCANIA",
    StockCostPrice: 0.44,
    StockQty: 2.0,
    StockValue: 0.88,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFAN0006",
    SupplierPartNo: "",
    StockDescription: "FAN BELT 3681811",
    StockCostPrice: 1.68,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 1
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "tfan0008",
    SupplierPartNo: "",
    StockDescription: "V belts for isuzu- pg475 isuzu",
    StockCostPrice: 9.6,
    StockQty: 5.0,
    StockValue: 48.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFAN0012",
    SupplierPartNo: "",
    StockDescription: "FANBELTS SCANIA 93H A1780 A 69",
    StockCostPrice: 0.18,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFAN01",
    SupplierPartNo: "",
    StockDescription: "FAN BELTS-  SHACMAN",
    StockCostPrice: 25.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFFB0001",
    SupplierPartNo: "",
    StockDescription: "FUEL FILTERS BOWLS- 124G",
    StockCostPrice: 0.27,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0001",
    SupplierPartNo: "Z153",
    StockDescription: "OIL FILTERS Z153",
    StockCostPrice: 7.16,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0002",
    SupplierPartNo: "Z94",
    StockDescription: "Z94 FILTERS ",
    StockCostPrice: 13.8,
    StockQty: 7.0,
    StockValue: 96.6,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0003",
    SupplierPartNo: "",
    StockDescription: "OIL FILTERS- FRIDGE TRAILERS",
    StockCostPrice: 25.0,
    StockQty: 1.0,
    StockValue: 25.0,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0005",
    SupplierPartNo: "",
    StockDescription: "Z248 FILTERS",
    StockCostPrice: 6.83,
    StockQty: 1.0,
    StockValue: 6.83,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0006",
    SupplierPartNo: "",
    StockDescription: "Z131 FILTERS",
    StockCostPrice: 5.0,
    StockQty: 10.0,
    StockValue: 50.0,
    ReorderLevel: 5
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0007",
    SupplierPartNo: "",
    StockDescription: "Z164 FILTERS",
    StockCostPrice: 12.06,
    StockQty: 4.0,
    StockValue: 48.24,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0008",
    SupplierPartNo: "",
    StockDescription: "Z258/37 FILTERS",
    StockCostPrice: 0.14,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0016",
    SupplierPartNo: "",
    StockDescription: "SCANIA 93H AIF FILTERS-1335681",
    StockCostPrice: 70.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0021",
    SupplierPartNo: "",
    StockDescription: "SCANIA OIL FILTERS G460",
    StockCostPrice: 18.0,
    StockQty: 8.0,
    StockValue: 144.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0024",
    SupplierPartNo: "",
    StockDescription: "Z75 93H FUEL FILTER",
    StockCostPrice: 5.0,
    StockQty: 5.0,
    StockValue: 25.0,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0026",
    SupplierPartNo: "",
    StockDescription: "FUEL FILTER UD",
    StockCostPrice: 15.0,
    StockQty: 1.0,
    StockValue: 15.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0028",
    SupplierPartNo: "",
    StockDescription: "GEAR BOX OIL FILTER- 93H",
    StockCostPrice: 9.81,
    StockQty: 1.0,
    StockValue: 9.81,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0029",
    SupplierPartNo: "Z95",
    StockDescription: "OIL FILTERS- Z95",
    StockCostPrice: 4.94,
    StockQty: 6.0,
    StockValue: 29.64,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFIL0030",
    SupplierPartNo: "Z84",
    StockDescription: "OIL FILTERS Z84",
    StockCostPrice: 4.8,
    StockQty: 2.0,
    StockValue: 9.6,
    ReorderLevel: 4
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFLA0001",
    SupplierPartNo: "",
    StockDescription: "FLASHER UNIT 090215-43",
    StockCostPrice: 1.35,
    StockQty: 1.0,
    StockValue: 1.35,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFUS0002",
    SupplierPartNo: "",
    StockDescription: "10AMP FUSE",
    StockCostPrice: 0.23,
    StockQty: 16.0,
    StockValue: 3.68,
    ReorderLevel: 10
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFUS0003",
    SupplierPartNo: "",
    StockDescription: "15AMP FUSE",
    StockCostPrice: 0.23,
    StockQty: 32.0,
    StockValue: 7.36,
    ReorderLevel: 10
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFUS0005",
    SupplierPartNo: "",
    StockDescription: "25AMP FUSE",
    StockCostPrice: 0.09,
    StockQty: 77.0,
    StockValue: 6.93,
    ReorderLevel: 10
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFUS0006",
    SupplierPartNo: "",
    StockDescription: "30 AMP FUSE",
    StockCostPrice: 1.0,
    StockQty: 3.0,
    StockValue: 0.03,
    ReorderLevel: 10
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFUS0007",
    SupplierPartNo: "",
    StockDescription: "20AMP FUSE",
    StockCostPrice: 0.01,
    StockQty: 14.0,
    StockValue: 0.14,
    ReorderLevel: 10
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TFWS001",
    SupplierPartNo: "",
    StockDescription: "FRONT WHEEL STURDS SCANIA",
    StockCostPrice: 8.0,
    StockQty: 20.0,
    StockValue: 160.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TGAS0002",
    SupplierPartNo: "",
    StockDescription: "MANIFOLD GASKET 93H",
    StockCostPrice: 0.05,
    StockQty: 2.0,
    StockValue: 0.1,
    ReorderLevel: 2
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TGAS0005",
    SupplierPartNo: "",
    StockDescription: "FLEXOID GASKET 3M-PAPER GASKET",
    StockCostPrice: 3.0,
    StockQty: 0.55,
    StockValue: 0.01,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "TGAS0006",
    SupplierPartNo: "",
    StockDescription: "45OIL COMPRESSOR GASKET- 3076226",
    StockCostPrice: 0.07,
    StockQty: 1.0,
    StockValue: 0.07,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "215/80R15C TYRES",
    SupplierPartNo: "",
    StockDescription: "215/80R15C TYRES",
    StockCostPrice: 146.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "24v",
    SupplierPartNo: "",
    StockDescription: "H1 24V HALOGEN",
    StockCostPrice: 2.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "24V 75/70W HALOGEN BULBS",
    SupplierPartNo: "",
    StockDescription: "24V 75/70W HALOGEN BULBS",
    StockCostPrice: 2.0,
    StockQty: 20.0,
    StockValue: 40.0,
    ReorderLevel: 8
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "27H OIL PUMP",
    SupplierPartNo: "",
    StockDescription: "OIL PUMP ASSEMBLY",
    StockCostPrice: 385.31,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "295s retread ",
    SupplierPartNo: "",
    StockDescription: "295s retread tyres",
    StockCostPrice: 96.88,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  {
    StoreName: "MUTARE DEPOT STOCK",
    StockCde: "385 STEER TYRES",
    SupplierPartNo: "",
    StockDescription: "NEW STEER TYRES 385",
    StockCostPrice: 247.0,
    StockQty: 0.0,
    StockValue: 0.0,
    ReorderLevel: 0
  },
  // Add more items as needed from seedStockInventory.mjs
];

const vendorList = [
  { vendorId: "Joharita Enterprizes CC t/a Field Tyre", vendorName: "Field Tyre Services", contactPerson: "Joharita", workEmail: "admin@fieldtyreservices.co.za", mobile: "", address: "13 Varty Street Duncanville Vereeniging 1930", city: "Vereeniging" },
  { vendorId: "Art Cooperation Battery express", vendorName: "Art Cooperation Battery express", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "City Path Trading", vendorName: "City Path Trading", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Spetmic Investments (Pvt) Ltd t/a City Path Trading", vendorName: "Spetmic Investments (Pvt) Ltd t/a City Path Trading", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Spare Parts Exchange (Pvt) Ltd", vendorName: "Spare Parts Exchange (Pvt) Ltd", contactPerson: "", workEmail: "", mobile: "", address: "5a Martin Drive, Msasa, Harare", city: "Harare" },
  { vendorId: "general_supplier", vendorName: "General Supplier", contactPerson: "John Smith", workEmail: "contact@generalsupplier.com", mobile: "+263782123456", address: "123 Main Street", city: "Mutare" },
  { vendorId: "tyre_supplier", vendorName: "Premium Tyre Supplier", contactPerson: "Mary Johnson", workEmail: "sales@premiumtyres.com", mobile: "+263772987654", address: "45 Industrial Avenue", city: "Harare" },
  { vendorId: "engine_parts_supplier", vendorName: "Engine Parts Ltd", contactPerson: "Robert Brown", workEmail: "parts@engineparts.com", mobile: "+263712345678", address: "78 Workshop Road", city: "Bulawayo" },
  { vendorId: "electrical_parts_supplier", vendorName: "Electric World", contactPerson: "Alice Green", workEmail: "info@electricworld.com", mobile: "+263773456789", address: "90 Power Street", city: "Harare" },
  { vendorId: "fluids_supplier", vendorName: "Fluids & Lubricants Co.", contactPerson: "David Wilson", workEmail: "orders@fluidslubricants.com", mobile: "+263783567890", address: "34 Oil Avenue", city: "Mutare" },
  { vendorId: "filter_supplier", vendorName: "Filter Systems Inc", contactPerson: "Sarah Miller", workEmail: "sales@filtersystems.com", mobile: "+263774678901", address: "56 Clean Road", city: "Harare" },
  { vendorId: "safety_equipment_supplier", vendorName: "Safety First Equipment", contactPerson: "James Taylor", workEmail: "info@safetyfirst.com", mobile: "+263785789012", address: "67 Secure Street", city: "Bulawayo" },
  { vendorId: "hardware_supplier", vendorName: "Hardware Solutions", contactPerson: "Patricia Lee", workEmail: "orders@hardwaresolutions.com", mobile: "+263776890123", address: "89 Tools Road", city: "Mutare" },
  { vendorId: "volvo_parts_supplier", vendorName: "Volvo Truck Parts", contactPerson: "Michael Davis", workEmail: "parts@volvotrucks.com", mobile: "+263787901234", address: "12 Swedish Avenue", city: "Harare" },
  { vendorId: "braking_system_supplier", vendorName: "Braking Systems Ltd", contactPerson: "Thomas Johnson", workEmail: "sales@brakingsystems.com", mobile: "+263778012345", address: "23 Stop Street", city: "Bulawayo" },
  { vendorId: "Hinge Master", vendorName: "Hinge Master SA", contactPerson: "", workEmail: "", mobile: "", address: "18 Buwbes Road - Sebenza. Edenvale", city: "Johannesburg" },
  { vendorId: "Impala Truck Spares (PTA) CC", vendorName: "Impala Truck Spares (PTA) CC", contactPerson: "Andre", workEmail: "", mobile: "", address: "1311 Van Der Hoff Road, Zandfontein, Pretoria, 0082 Gauteng", city: "Pretoria" },
  { vendorId: "Monfiq Trading (Pvt) Ltd t/a Online Motor Spares", vendorName: "Monfiq Trading (Pvt) Ltd t/a Online Motor Spares", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "A&J Field Services", vendorName: "A&J Field Services", contactPerson: "JJ", workEmail: "", mobile: "", address: "", city: "" },
  { vendorId: "ELlemand", vendorName: "ELlemand", contactPerson: "", workEmail: "", mobile: "", address: "Polokwane", city: "Polokwane South Africa" },
  { vendorId: "Eurosanparts", vendorName: "Eurosanparts", contactPerson: "Daniel van Zyl", workEmail: "", mobile: "0795140948", address: "Robbertville Roodepoort", city: "Johannesburg,South Africa" },
  { vendorId: "EASY COOL REFRIGERATION", vendorName: "EASY COOL REFRIGERATION", contactPerson: "Jacob", workEmail: "jacob@tashrefrigeration.co.za", mobile: "0766520310", address: "9 Bogenia st,Pomona, Kemptonpark, Kemptonpark jhb 1619", city: "Johannesburg" },
  { vendorId: "Horse Tech Engineering", vendorName: "Horse Tech Engineering", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "28 B Chimoiio Ave", city: "Mutare" },
  { vendorId: "Victor Onions", vendorName: "Victor Onions", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "18 Edison Crescent Graniteside Harare, Zimbabwe", city: "Harare" },
  { vendorId: "Indale investments", vendorName: "Indale investments", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "263242486200", address: "BAY 2, 40 MARTIN DRIVE, HARARE", city: "Harare" },
  { vendorId: "Brake and Clutch", vendorName: "Brake and Clutch", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Matanuska Inventory", vendorName: "Matanuska", contactPerson: "Cain Jeche", workEmail: "cain@matanuska.co.zw", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Drum City Pvt Ltd", vendorName: "Drum City Pvt Ltd", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "669905.669889", address: "859 Bignell Rd, New Ardbennie", city: "Harare" },
  { vendorId: "BSI Motor Spares", vendorName: "BSI Motor Spares", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "21 Jameson Street", city: "Mutare" },
  { vendorId: "Ace Hardware Zimbabwe (Pvt) Ltd t/a Ace Industrial Hardware", vendorName: "Ace Hardware Zimbabwe (Pvt) Ltd t/a Ace Industrial Hardware", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "35 Coventry Rd, Harare, Zimbabwe", city: "Harare" },
  { vendorId: "Scanlink", vendorName: "Scanlink", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "", city: "Harare" },
  { vendorId: "Wardstore Enterprises t/a Taita Trading", vendorName: "Wardstore Enterprises t/a Taita Trading", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "", city: "Harare" },
  { vendorId: "Dorems Investments", vendorName: "Dorems Investments", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Bessell Investments", vendorName: "Bessell Investments", contactPerson: "Laminanes", workEmail: "cain@matanuska.co.zw", mobile: "0712752122", address: "31 Tembwe Street", city: "Mutare" },
  { vendorId: "BOC Zimbabwe PVT Ltd", vendorName: "BPC Gas", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "", city: "Mutare" },
  { vendorId: "ELVITATE TRADING ( PVT) LTD", vendorName: "ELVITATE TRADING ( PVT) LTD", contactPerson: "Elvis", workEmail: "cain@matanuska.co.zw", mobile: "263774330394", address: "14 Riverside Mutare", city: "Mutare" },
  { vendorId: "BRAFORD INVESTMENTS (PVT) LTD", vendorName: "BRAFORD INVESTMENTS (PVT) LTD", contactPerson: "", workEmail: "accounts@braford.co.zw, sales@braford.co.zw", mobile: "", address: "2 SILVERTON AVENUE GREENDALE HARARE", city: "Harare" },
  { vendorId: "Rodirsty International", vendorName: "Rodirsty International", contactPerson: "VAT22027338", workEmail: "sales@rodirsty.com", mobile: "0772900347", address: "29 MAZOE TRAVEL PLAZA", city: "Harare" },
  { vendorId: "Valtech", vendorName: "Valtech", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Zuva Fuel", vendorName: "Zuva", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Five Star Fuel", vendorName: "Five Star", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Fuel", vendorName: "Super Fuels", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Steel", vendorName: "Steelmakers Zimbabwe (Pvt) Ltd", contactName: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Tracking", vendorName: "Ezytrack (Pvt) Ltd", contactName: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Tyres", vendorName: "Wardstore Enterprises t/a Taita Trading", contactName: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Alignment", vendorName: "Rite-Line Alignment (pvt) Ltd", contactName: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "RIC", vendorName: "RIC Hyraulic And Engineering P/L", contactName: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Pro Tyre", vendorName: "Associated Tyres (Pvt) Ltd t/a Protyre Mutare", contactName: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Nichpau Automotive", vendorName: "Nichpau Automotive t/a Spares Centre", contactName: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Tentrack", vendorName: "Tentrack Investments (Pvt) Ltd", contactName: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Mountskills", vendorName: "Mountskills Enterprises", contactName: "", workEmail: "cain@matanuska.co.zw", mobile: "0772731426,071863660", address: "6 Vumba Road Eastern District Engineering Complex", city: "Mutare" },
  { vendorId: "Mallworth Investments", vendorName: "Mallworth Investments (Pvt) Ltd", contactName: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Bering Strait Investments", vendorName: "Bering Strait Investments (Pvt) Ltd t/a B.S.I Motor Parts", contactName: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Axle Investments Pvt Ltd t/a Matebeleland Trucks", vendorName: "Axle Investments Pvt Ltd t/a Matebeleland Trucks", contactName: "", workEmail: "", mobile: "", address: "", city: "Harare" },
];

// --- 3. DATA VALIDATION SCHEMAS ---
const schemas = {
  routes: (item) => {
    if (!item.route || typeof item.route !== "string") return "Missing or invalid route";
    if (!item.distance || typeof item.distance !== "number") return "Missing or invalid distance";
    return null;
  },
  fleet: (item) => {
    if (!item.fleetNumber) return "Missing fleet number";
    if (!item.registration) return "Missing registration number";
    return null;
  },
  tyreBrands: (item) => (!item.name ? "Missing tyre brand name" : null),
  tyreSizes: (item) => (!item.size ? "Missing tyre size" : null),
  tyrePatterns: (item) => {
    if (!item.brand) return "Missing tyre pattern brand";
    if (!item.size) return "Missing tyre pattern size";
    if (!item.position) return "Missing tyre pattern position";
    return null;
  },
  vehiclePositions: (item) => {
    if (!item.vehicleType) return "Missing vehicle type";
    if (!item.positions || !Array.isArray(item.positions)) return "Missing or invalid positions array";
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
  fleetAssets: (item) => {
    if (!item.fleetNo) return "Missing fleet number";
    if (!item.positions || !Array.isArray(item.positions)) return "Missing or invalid positions array";
    if (!item.type) return "Missing vehicle type";
    return null;
  },
  vendors: (item) => {
    if (!item.vendorId) return "Missing vendorId";
    if (!item.vendorName) return "Missing vendorName";
    return null;
  },
};

// --- 4. CORE SEEDING LOGIC ---

let db;

/**
 * Initializes the Firebase Admin SDK.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
async function initializeFirebase() {
  try {
    if (!existsSync(CONFIG.serviceAccountPath)) {
      console.error(colorize(`\n❌ Service account key not found at: ${CONFIG.serviceAccountPath}`, "red"));
      console.log("\n📝 Please go to Firebase Console > Project Settings > Service Accounts, generate a new private key, and save it as 'serviceAccountKey.json' in the project root.");
      return false;
    }
    const serviceAccount = JSON.parse(readFileSync(CONFIG.serviceAccountPath, "utf8"));
    initializeApp({ credential: cert(serviceAccount) });
    db = getFirestore();
    console.log(colorize("✅ Firebase initialized successfully", "green"));
    return true;
  } catch (error) {
    console.error(colorize(`❌ Failed to initialize Firebase: ${error.message}`, "red"));
    return false;
  }
}

/**
 * A generic function to seed a Firestore collection.
 * @param {string} collectionName - The name of the collection.
 * @param {Array<object>} data - The data array to seed.
 * @param {object} seedOptions - Options for this specific seeding operation.
 * @param {function} seedOptions.idGenerator - A function to generate a document ID from an item.
 * @param {function} [seedOptions.preprocessor] - A function to process an item before it's saved.
 * @returns {Promise<object>} An object with seeding statistics.
 */
async function seedCollection(collectionName, data, seedOptions) {
  const { idGenerator, preprocessor = (item) => item } = seedOptions;
  const { force, validate, verbose } = options;

  console.log(colorize(`\n🔄 Starting to seed collection: ${collectionName}`, "cyan"));
  console.log(`  Found ${data.length} items to process`);

  const stats = { success: 0, skipped: 0, errors: 0 };
  const validationErrors = [];

  try {
    if (force) {
      const snapshot = await db.collection(collectionName).get();
      if (snapshot.size > 0) {
        console.log(`  Deleting ${snapshot.size} existing items...`);
        const batches = [];
        let batch = db.batch();
        let operationCount = 0;
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          operationCount++;
          if (operationCount === CONFIG.batchSize) {
            batches.push(batch.commit());
            batch = db.batch();
            operationCount = 0;
          }
        });
        if (operationCount > 0) batches.push(batch.commit());
        await Promise.all(batches);
        console.log(colorize(`  ✅ Deleted existing data from ${collectionName}`, "yellow"));
      }
    }

    let batch = db.batch();
    let operationCount = 0;

    for (const item of data) {
      const docId = idGenerator(item);
      const ref = db.collection(collectionName).doc(docId);

      // Skip if document exists and --force is not used
      if (!force) {
        const doc = await ref.get();
        if (doc.exists) {
          if (verbose) console.log(colorize(`  ℹ️ Skipping existing item: ${docId}`, "blue"));
          stats.skipped++;
          continue;
        }
      }

      // Validate data
      if (validate && schemas[collectionName]) {
        const validationError = schemas[collectionName](item);
        if (validationError) {
          validationErrors.push({ id: docId, error: validationError });
          stats.errors++;
          continue;
        }
      }

      const processedItem = preprocessor(item);
      batch.set(ref, {
        ...processedItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      operationCount++;
      stats.success++;

      // Commit batch if size limit is reached
      if (operationCount === CONFIG.batchSize) {
        await batch.commit();
        if (verbose) console.log(colorize(`  ✅ Committed batch of ${operationCount} items`, "green"));
        batch = db.batch();
        operationCount = 0;
      }
    }

    // Commit final batch
    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(colorize(`  ✅ Successfully added ${stats.success} items`, "green"));
    if (stats.skipped > 0) {
      console.log(colorize(`  ℹ️ Skipped ${stats.skipped} existing items`, "blue"));
    }
    if (stats.errors > 0) {
      console.log(colorize(`  ❌ Failed to add ${stats.errors} items due to validation errors`, "red"));
      if (verbose) {
        console.log("    Validation errors:");
        console.log(validationErrors);
      }
    }

    return stats;
  } catch (error) {
    console.error(colorize(`❌ Error seeding collection ${collectionName}: ${error.message}`, "red"));
    console.error(error);
    return { success: 0, skipped: 0, errors: data.length };
  }
}

// --- 5. MAIN EXECUTION LOGIC ---

async function main() {
  console.log("🚀 Matanuska Transport - Unified Data Seeding Utility");
  console.log("====================================================");

  if (!await initializeFirebase()) {
    process.exit(1);
  }

  console.log(colorize("\n📊 Configuration:", "magenta"));
  console.log(`  Force update: ${options.force}`);
  console.log(`  Verbose mode: ${options.verbose}`);
  console.log(`  Validate data: ${options.validate}`);
  console.log(`  Selected collections: ${options.collectionsToSeed.join(", ")}`);

  const seedingSummary = {
    total: 0,
    success: 0,
    skipped: 0,
    errors: 0,
  };

  const seed = async (collectionKey, dataArray, idGenerator) => {
    const shouldSeed = options.collectionsToSeed.includes("all") ||
                       options.collectionsToSeed.includes(collectionKey.toLowerCase());
    if (!shouldSeed) return;

    const stats = await seedCollection(CONFIG.collections[collectionKey], dataArray, {
      idGenerator,
    });

    seedingSummary.total += dataArray.length;
    seedingSummary.success += stats.success;
    seedingSummary.skipped += stats.skipped;
    seedingSummary.errors += stats.errors;
  };

  // Seed all collections
  await seed("routes", routeDistances, (item) => `${item.route.replace(/[^a-zA-Z0-9]/g, "_")}_${item.distance}`);
  await seed("fleet", fleetData, (item) => item.fleetNumber);
  await seed("tyreBrands", tyreBrands.map((name) => ({ name })), (item) => item.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
  await seed("tyreSizes", tyreSizes.map((size) => ({ size })), (item) => item.size.replace(/[^a-z0-9]/g, ""));
  await seed("tyrePatterns", tyrePatterns, (item) => `${item.brand.toLowerCase()}_${(item.pattern || "standard").toLowerCase()}_${item.size.replace(/[^a-z0-9]/g, "")}`);
  await seed("vehiclePositions", vehiclePositions, (item) => item.vehicleType);
  await seed("tyreStore", VehicleTyreStore, (item) => `${item.StoreName}_${item.TyrePosDescription}_${item.TyreCode}`);
  // Combine our manually added items with the transformed inventory and remove duplicates
  const combinedInventory = [...stockInventory, ...transformedInventory];
  const uniqueInventory = Array.from(new Map(combinedInventory.map(item => [item.itemCode, item])).values());

  await seed("inventory", uniqueInventory.filter(item => item.itemCode), (item) => item.itemCode.replace(/[^a-zA-Z0-9]/g, "_"));
  await seed("fleetAssets", fleetAssets, (item) => item.fleetNo);
  await seed("vendors", vendorList, (item) => item.vendorId.replace(/[^a-zA-Z0-9]/g, "_"));

  // Print summary
  console.log(colorize("\n📊 Seeding Summary", "magenta"));
  console.log(`  Total items processed: ${seedingSummary.total}`);
  console.log(colorize(`  ✅ Successfully added: ${seedingSummary.success}`, "green"));
  console.log(colorize(`  ℹ️ Skipped existing: ${seedingSummary.skipped}`, "blue"));
  console.log(colorize(`  ❌ Failed to add: ${seedingSummary.errors}`, "red"));
  console.log(colorize("\n🏁 Data seeding completed", "green"));

  process.exit(0);
}

// Run the main function
main().catch((err) => {
  console.error(colorize(`\n❌ Unhandled error during data seeding: ${err.message}`, "red"));
  console.error(err);
  process.exit(1);
});
