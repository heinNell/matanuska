// firebase-tyre-fleet-seed.mjs
// Firestore Seeder for Tyre Patterns and Fleet Asset Tyre Configurations
// Requires: Node.js 18+, Firebase Admin SDK installed (npm i firebase-admin)

import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// --- Configure your Firebase Admin SDK credentials here ---
// Option 1: Use GOOGLE_APPLICATION_CREDENTIALS env var (recommended)
// Option 2: Hardcode service account JSON path (uncomment if required)
// const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount.json', 'utf8'));

initializeApp({
  // credential: cert(serviceAccount),
  credential: applicationDefault(),
});

const db = getFirestore();

// --- TYRE PATTERNS SEED DATA ---
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

// --- FLEET ASSET TYRE CONFIGS SEED DATA ---
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

// --- Seeder Logic ---
async function seedTyrePatterns() {
  const batch = db.batch();
  for (const pattern of tyrePatterns) {
    const ref = db.collection('tyrePatterns').doc();
    batch.set(ref, pattern);
  }
  await batch.commit();
  console.log(`Seeded ${tyrePatterns.length} tyrePatterns`);
}

async function seedFleetAssets() {
  const batch = db.batch();
  for (const asset of fleetAssets) {
    const ref = db.collection('fleetAssets').doc(asset.fleetNo);
    batch.set(ref, asset);
  }
  await batch.commit();
  console.log(`Seeded ${fleetAssets.length} fleetAssets`);
}

async function main() {
  try {
    await seedTyrePatterns();
    await seedFleetAssets();
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main();