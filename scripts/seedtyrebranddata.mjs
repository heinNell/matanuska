// Tyre Brand, Size, Pattern Seed Data for Firebase
// This script populates Firestore collections with tyre-related data:
// - tyreBrands: All the brands
// - tyreSizes: Standard industry sizes
// - tyrePatterns: All brand-pattern-size combinations
// - vehiclePositions: Standardized positions based on vehicle type

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from 'fs';

// Command line arguments
const args = process.argv.slice(2);
const forceUpdate = args.includes('--force');
const specificCollection = args.find(arg => !arg.startsWith('--'));

// Check if service account key file exists and load it
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  console.log('✅ Service account key loaded successfully');
} catch (error) {
  console.error('❌ Error loading service account key:', error.message);
  console.log('\n📝 INSTRUCTIONS:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the file as "serviceAccountKey.json" in the project root directory');
  console.log('4. Run this script again\n');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  initializeApp({
    credential: cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

// --- TYRE BRANDS ---
const tyreBrands = [
  'Bridgestone', 'Michelin', 'Goodyear', 'Continental', 'Pirelli',
  'Dunlop', 'Hankook', 'Yokohama', 'Kumho', 'Toyo',
  'Firemax', 'Triangle', 'Terraking', 'Compasal', 'Windforce',
  'Perelli', 'Powertrac', 'Sunfull', 'Wellplus', 'Techshield',
  'Sonix', 'Formula'
];

// --- TYRE SIZES ---
const tyreSizes = [
  '295/80R22.5',
  '315/80R22.5',
  '295/75R22.5',
  '11R22.5',
  '12R22.5',
  '385/65R22.5',
  '275/70R22.5',
  '315/80R22.16',
  '315/80R22.17'
];

// --- TYRE PATTERN DATA ---
const tyrePatterns = [
  // 315/80R22.5 (Drive)
  { brand: 'Firemax',    pattern: '',         size: '315/80R22.5',  position: 'Drive' },
  { brand: 'TRIANGLE',   pattern: 'TR688',    size: '315/80R22.5',  position: 'Drive' },
  { brand: 'Terraking',  pattern: 'HS102',    size: '315/80R22.5',  position: 'Drive' },
  { brand: 'Compasal',   pattern: 'TR688',    size: '315/80R22.5',  position: 'Drive' },
  { brand: 'Windforce',  pattern: 'WD2020',   size: '315/80R22.5',  position: 'Drive' },
  { brand: 'Windforce',  pattern: 'WD2060',   size: '315/80R22.5',  position: 'Drive' },
  { brand: 'Compasal',   pattern: 'CPD82',    size: '315/80R22.5',  position: 'Drive' },
  { brand: 'Perelli',    pattern: 'FG01S',    size: '315/80R22.5',  position: 'Drive' },
  { brand: 'POWERTRAC',  pattern: 'TractionPro', size: '315/80R22.5', position: 'Drive' },
  { brand: 'SUNFULL',    pattern: 'HF638',    size: '315/80R22.5',  position: 'Drive' },
  { brand: 'SUNFULL',    pattern: 'HF768',    size: '315/80R22.5',  position: 'Drive' },
  { brand: 'FORMULA',    pattern: '',         size: '315/80R22.16', position: 'Drive' },
  { brand: 'PIRELLI',    pattern: '',         size: '315/80R22.17', position: 'Drive' },
  { brand: 'Wellplus',   pattern: 'WDM16',    size: '315/80R22.5',  position: 'Drive' },

  // 315/80R22.5 (Dual / Multi)
  { brand: 'Dunlop',     pattern: 'SP571',    size: '315/80R22.5',  position: 'Multi' },
  { brand: 'Firemax',    pattern: 'FM188',    size: '315/80R22.5',  position: 'Multi' },
  { brand: 'Firemax',    pattern: 'FM19',     size: '315/80R22.5',  position: 'Multi' },
  { brand: 'Terraking',  pattern: 'HS268',    size: '315/80R22.5',  position: 'Multi' },
  { brand: 'Windforce',  pattern: 'WA1060',   size: '315/80R22.5',  position: 'Multi' },
  { brand: 'Dunlop',     pattern: 'SP320A',   size: '315/80R22.5',  position: 'Multi' },
  { brand: 'Sonix',      pattern: '',         size: '315/80R22.5',  position: 'Multi' },
  { brand: 'FORMULA',    pattern: '',         size: '315/80R22.29', position: 'Multi' },
  { brand: 'PIRELLI',    pattern: '',         size: '315/80R22.5',  position: 'Multi' },

  // 315/80R22.5 (Steer)
  { brand: 'Traiangle',  pattern: 'TRS03',    size: '315/80R22.5',  position: 'Steer' },
  { brand: 'Sunfull',    pattern: 'HF660',    size: '315/80R22.5',  position: 'Steer' },
  { brand: 'Compasal',   pattern: 'CPS60',    size: '315/80R22.5',  position: 'Steer' },
  { brand: 'SONIX',      pattern: 'SX668',    size: '315/80R22.5',  position: 'Steer' },
  { brand: 'FORMULA',    pattern: '',         size: '315/80R22.5',  position: 'Steer' },
  { brand: 'PIRELLI',    pattern: '',         size: '315/80R22.5',  position: 'Steer' },
  { brand: 'Firemax',    pattern: 'FM66',     size: '315/80R22.5',  position: 'Steer' },
  { brand: 'WellPlus',   pattern: 'WDM916',   size: '315/80R22.5',  position: 'Steer' },
  { brand: 'Firemax',    pattern: 'FM166',    size: '315/80R22.5',  position: 'Steer' },
  { brand: 'Windforce',  pattern: 'WH1020',   size: '315/80R22.5',  position: 'Steer' },
  { brand: 'Firemax',    pattern: 'FM18',     size: '315/80R22.5',  position: 'Steer' },

  // 315/80R22.5 (Trailer)
  { brand: 'POWERTRAC',  pattern: 'Tracpro',  size: '315/80R22.5',  position: 'Trailer' },
  { brand: 'Sunfull',    pattern: 'HF660',    size: '315/80R22.5',  position: 'Trailer' },
  { brand: 'SUNFULL',    pattern: 'ST011',    size: '315/80R22.5',  position: 'Trailer' },

  // 385/65R22.5 (Steer)
  { brand: 'Firemax',    pattern: 'FM06',     size: '385/65R22.5',  position: 'Steer' },
  { brand: 'TECHSHIELD', pattern: 'TS778',    size: '385/65R22.5',  position: 'Steer' }
];

// --- VEHICLE POSITION CONFIGURATIONS ---
// This defines the available positions for each vehicle type
const vehiclePositions = [
  {
    vehicleType: 'standard',
    name: 'Standard Vehicle',
    positions: [
      { id: 'Front Left', name: 'Front Left' },
      { id: 'Front Right', name: 'Front Right' },
      { id: 'Drive Axle Left Inner', name: 'Drive Axle Left Inner' },
      { id: 'Drive Axle Left Outer', name: 'Drive Axle Left Outer' },
      { id: 'Drive Axle Right Inner', name: 'Drive Axle Right Inner' },
      { id: 'Drive Axle Right Outer', name: 'Drive Axle Right Outer' },
      { id: 'Trailer Axle 1 Left', name: 'Trailer Axle 1 Left' },
      { id: 'Trailer Axle 1 Right', name: 'Trailer Axle 1 Right' },
      { id: 'Trailer Axle 2 Left', name: 'Trailer Axle 2 Left' },
      { id: 'Trailer Axle 2 Right', name: 'Trailer Axle 2 Right' },
      { id: 'Spare', name: 'Spare' }
    ]
  },
  {
    vehicleType: 'reefer',
    name: 'Reefer (3-Axle Trailer, Single Tyres)',
    positions: [
      { id: 'T1', name: 'Axle 1 - Left Side' },
      { id: 'T2', name: 'Axle 1 - Right Side' },
      { id: 'T3', name: 'Axle 2 - Left Side' },
      { id: 'T4', name: 'Axle 2 - Right Side' },
      { id: 'T5', name: 'Axle 3 - Left Side' },
      { id: 'T6', name: 'Axle 3 - Right Side' },
      { id: 'SP1', name: 'Spare 1' },
      { id: 'SP2', name: 'Spare 2' }
    ]
  },
  {
    vehicleType: 'horse',
    name: 'Horse (Truck Tractor)',
    positions: [
      { id: 'V1', name: 'Axle 1 - Left Side' },
      { id: 'V2', name: 'Axle 1 - Right Side' },
      { id: 'V3', name: 'Axle 2 - Left Outer' },
      { id: 'V4', name: 'Axle 2 - Left Inner' },
      { id: 'V5', name: 'Axle 2 - Right Outer' },
      { id: 'V6', name: 'Axle 2 - Right Inner' },
      { id: 'V7', name: 'Axle 3 - Left Outer' },
      { id: 'V8', name: 'Axle 3 - Left Inner' },
      { id: 'V9', name: 'Axle 3 - Right Outer' },
      { id: 'V10', name: 'Axle 3 - Right Inner' },
      { id: 'SP', name: 'Spare' }
    ]
  },
  {
    vehicleType: 'interlink',
    name: 'Interlink (4-Axle Trailer, Dual Tyres)',
    positions: [
      { id: 'T1', name: 'Axle 1 - Left Rear Outer' },
      { id: 'T2', name: 'Axle 1 - Right Rear Outer' },
      { id: 'T3', name: 'Axle 2 - Left Rear Outer' },
      { id: 'T4', name: 'Axle 2 - Right Rear Outer' },
      { id: 'T5', name: 'Axle 1 - Left Rear Inner' },
      { id: 'T6', name: 'Axle 1 - Right Rear Inner' },
      { id: 'T7', name: 'Axle 2 - Left Rear Inner' },
      { id: 'T8', name: 'Axle 2 - Right Rear Inner' },
      { id: 'T9', name: 'Axle 3 - Left Rear Outer' },
      { id: 'T10', name: 'Axle 3 - Right Rear Outer' },
      { id: 'T11', name: 'Axle 4 - Left Rear Outer' },
      { id: 'T12', name: 'Axle 4 - Right Rear Outer' },
      { id: 'T13', name: 'Axle 3 - Left Rear Inner' },
      { id: 'T14', name: 'Axle 3 - Right Rear Inner' },
      { id: 'T15', name: 'Axle 4 - Left Rear Inner' },
      { id: 'T16', name: 'Axle 4 - Right Rear Inner' },
      { id: 'SP1', name: 'Spare 1' },
      { id: 'SP2', name: 'Spare 2' }
    ]
  },
  {
    vehicleType: 'lmv',
    name: 'Light Motor Vehicle (LMV)',
    positions: [
      { id: 'P1', name: 'Front Left' },
      { id: 'P2', name: 'Front Right' },
      { id: 'P3', name: 'Rear Left' },
      { id: 'P4', name: 'Rear Right' },
      { id: 'P5', name: 'Middle Left' },  // For 6-wheelers
      { id: 'P6', name: 'Middle Right' }, // For 6-wheelers
      { id: 'SP', name: 'Spare' }
    ]
  }
];

// --- SEEDING FUNCTIONS ---

// Helper function to check if collection should be processed
function shouldProcessCollection(collectionName) {
  return !specificCollection || specificCollection === collectionName;
}

// Seed tyre brands
async function seedTyreBrands() {
  if (!shouldProcessCollection('tyreBrands')) return;
  
  console.log(`🔄 Starting to seed tyre brands...`);
  const batch = db.batch();
  let count = 0;
  
  // Check if we should delete existing data
  if (forceUpdate) {
    const snapshot = await db.collection('tyreBrands').get();
    console.log(`ℹ️ Found ${snapshot.size} existing tyre brands, deleting...`);
    
    const deleteBatch = db.batch();
    snapshot.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log(`✅ Deleted ${snapshot.size} existing tyre brands`);
  }
  
  // Add new data
  for (const brand of tyreBrands) {
    const docId = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
    const ref = db.collection('tyreBrands').doc(docId);
    
    batch.set(ref, {
      name: brand,
      createdAt: new Date().toISOString()
    });
    count++;
    
    if (count % 500 === 0) {
      // Commit in batches of 500 to avoid Firestore limits
      await batch.commit();
      console.log(`✅ Committed batch of ${count} tyre brands`);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`✅ Successfully seeded ${count} tyre brands`);
}

// Seed tyre sizes
async function seedTyreSizes() {
  if (!shouldProcessCollection('tyreSizes')) return;
  
  console.log(`🔄 Starting to seed tyre sizes...`);
  const batch = db.batch();
  let count = 0;
  
  // Check if we should delete existing data
  if (forceUpdate) {
    const snapshot = await db.collection('tyreSizes').get();
    console.log(`ℹ️ Found ${snapshot.size} existing tyre sizes, deleting...`);
    
    const deleteBatch = db.batch();
    snapshot.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log(`✅ Deleted ${snapshot.size} existing tyre sizes`);
  }
  
  // Add new data
  for (const size of tyreSizes) {
    const docId = size.replace(/[^a-z0-9]/g, '');
    const ref = db.collection('tyreSizes').doc(docId);
    
    batch.set(ref, {
      size: size,
      createdAt: new Date().toISOString()
    });
    count++;
  }
  
  await batch.commit();
  console.log(`✅ Successfully seeded ${count} tyre sizes`);
}

// Seed tyre patterns (brand-pattern-size combinations)
async function seedTyrePatterns() {
  if (!shouldProcessCollection('tyrePatterns')) return;
  
  console.log(`🔄 Starting to seed tyre patterns...`);
  const batch = db.batch();
  let count = 0;
  
  // Check if we should delete existing data
  if (forceUpdate) {
    const snapshot = await db.collection('tyrePatterns').get();
    console.log(`ℹ️ Found ${snapshot.size} existing tyre patterns, deleting...`);
    
    const deleteBatch = db.batch();
    snapshot.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log(`✅ Deleted ${snapshot.size} existing tyre patterns`);
  }
  
  // Add new data
  for (const pattern of tyrePatterns) {
    // Create a unique ID based on brand, pattern, and size
    const patternName = pattern.pattern || 'standard';
    const docId = `${pattern.brand.toLowerCase()}_${patternName.toLowerCase()}_${pattern.size.replace(/[^a-z0-9]/g, '')}`;
    const ref = db.collection('tyrePatterns').doc(docId);
    
    batch.set(ref, {
      ...pattern,
      createdAt: new Date().toISOString()
    });
    count++;
    
    if (count % 500 === 0) {
      // Commit in batches of 500 to avoid Firestore limits
      await batch.commit();
      console.log(`✅ Committed batch of ${count} tyre patterns`);
    }
  }
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`✅ Successfully seeded ${count} tyre patterns`);
}

// Seed vehicle position configurations
async function seedVehiclePositions() {
  if (!shouldProcessCollection('vehiclePositions')) return;
  
  console.log(`🔄 Starting to seed vehicle positions...`);
  const batch = db.batch();
  let count = 0;
  
  // Check if we should delete existing data
  if (forceUpdate) {
    const snapshot = await db.collection('vehiclePositions').get();
    console.log(`ℹ️ Found ${snapshot.size} existing vehicle positions, deleting...`);
    
    const deleteBatch = db.batch();
    snapshot.docs.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log(`✅ Deleted ${snapshot.size} existing vehicle positions`);
  }
  
  // Add new data
  for (const config of vehiclePositions) {
    const ref = db.collection('vehiclePositions').doc(config.vehicleType);
    
    batch.set(ref, {
      ...config,
      createdAt: new Date().toISOString()
    });
    count++;
  }
  
  await batch.commit();
  console.log(`✅ Successfully seeded ${count} vehicle position configurations`);
}

// Main execution function
async function main() {
  try {
    console.log(`🚀 Starting tyre seed data import with${forceUpdate ? '' : 'out'} force update`);
    
    if (specificCollection) {
      console.log(`ℹ️ Only processing collection: ${specificCollection}`);
    } else {
      console.log(`ℹ️ Processing all collections`);
    }
    
    await seedTyreBrands();
    await seedTyreSizes();
    await seedTyrePatterns();
    await seedVehiclePositions();
    
    console.log('✅ Tyre seed data import completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during tyre seed data import:', error);
    process.exit(1);
  }
}

// Execute the main function
main();