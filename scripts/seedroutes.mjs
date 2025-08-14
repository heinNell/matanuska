import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from 'fs';

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

// Initialize Firebase
initializeApp({
  credential: cert(serviceAccount)
});

// Get Firestore instance
const db = getFirestore();

// Unique route and distance pairs (cleaned and deduped)
const routeDistances = [
  { route: 'JHB - HARARE (NORTH BOUND)', distance: 1120 },
  { route: 'JHB - BLANTYRE (NORTH BOUND)', distance: 1616 },
  { route: 'JHB TO BLANTYRE AND BACK', distance: 3232 },
  { route: 'JHB - LILONGWE (NORTH BOUND)', distance: 1875 },
  { route: 'JHB TO LILONGWE AND BACK', distance: 3660 },
  { route: 'JHB - BLANTYRE - LILONGWE', distance: 2045 },
  { route: 'JHB - LUSAKA (NORTH BOUND)', distance: 1572 },
  { route: 'JHB - LUSAKA AND BACK', distance: 3144 },
  { route: 'JHB - MAPUTO', distance: 551 },
  { route: 'JHB - BIARA', distance: 1700 },
  { route: 'JHB - NAMPULA', distance: 2600 },
  { route: 'PE - LUSAKA', distance: 2700 },
  { route: 'PE - HARARE', distance: 2200 },
  { route: 'PE - BLANTYRE', distance: 2850 },
  { route: 'PE - LILONGWE', distance: 3050 },
  { route: 'JHB - KASUMBULESA (NORTH BOUND)', distance: 2018 },
  { route: 'DURBAN - LUSAKA', distance: 2300 },
  { route: 'DURBAN - GABARONE', distance: 950 },
  { route: 'DURBAN - HARARE', distance: 1700 },
  { route: 'DURBAN  - BLANTYRE', distance: 2300 },
  { route: 'DURBAN - LILONGWE', distance: 2500 },
  { route: 'CPT - HARARE (NORTH BOUND)', distance: 2517 },
  { route: 'CPT - LUSAKA (NORTH BOUND)', distance: 2962 },
  { route: 'CPT - BLANTYRE (NORTH BOUND)', distance: 3127 },
  { route: 'CPT - LILONGWE (NORTH BOUND)', distance: 3256 },
  { route: 'JHB - GABARONE', distance: 350 },
  { route: 'JHB - MAPUTO', distance: 561 },
  { route: 'PE - GABARONE', distance: 1270 },
  { route: 'JHB - LUSAKA', distance: 1572 },
  { route: 'CPT - GABARONE', distance: 1600 },
  { route: 'PE - MAPUTO', distance: 1600 },
  { route: 'JHB - BLANTYRE', distance: 1616 },
  { route: 'JHB - LILONGWE', distance: 1875 },
  { route: 'CPT - MAPUTO', distance: 2000 },
  { route: 'JHB - KASUMBULESA', distance: 2018 },
  { route: 'CPT - HARARE', distance: 2517 },
  { route: 'DURBAN - KASUMBULESA', distance: 2800 },
  { route: 'CPT - LUSAKA', distance: 3160 },
  { route: 'JHB - LUSAKA AND RETURN', distance: 6254 },
  { route: 'JHB TO BLANTYRE AND RETURN', distance: 6320 },
  { route: 'CPT - LUSAKA', distance: 3256 },
  { route: 'CPT - KASUMBULESA', distance: 3550 },
  { route: 'JHB TO LILONGWE AND RETURN', distance: 7100 },
  { route: 'JHB - BULAWAYO', distance: 861 },
  { route: 'CPT - BULAWAYO', distance: 2061 },
  { route: 'PE - HARARE', distance: 2200 },
  { route: 'PE - BLANTYRE', distance: 2850 },
  { route: 'PE - LILONGWE', distance: 3050 },
  { route: 'KROONSTAD - BLANTYRE', distance: 1993 },
  { route: 'DURBAN - SHURUNGWI', distance: 1470 },
  { route: 'SHURUNGWI - DURBAN', distance: 1470 },
  { route: 'DURBAN - SHURUNGWI(ROUND TRIP)', distance: 2940 },
  { route: 'JHB - SHURUNGWI', distance: 880 },
  { route: 'SHURUNGWI - JHB', distance: 880 },
  { route: 'JHB - SHURUNGWI(ROUND TRIP)', distance: 1760 },
  { route: 'SHURUNGWI - CPT', distance: 2300 },
  { route: 'CPT - SHURUNGWI', distance: 2300 },
  { route: 'JHB - SHURUNGWI(ROUND TRIP)', distance: 4600 },
  { route: 'MUTARE - HARARE (LOCAL)', distance: 270 },
  { route: 'MUTARE - BULAWAYO (LOCAL)', distance: 450 },
  { route: 'MUTARE - CHIPINGE (LOCAL)', distance: 165 },
  { route: 'MUTARE - MORANDERA (LOCAL)', distance: 215 },
  { route: 'MUTARE - GWERU (LOCAL)', distance: 275 },
  { route: 'MUTARE - CHIREDZI (LOCAL)', distance: 314 },
  { route: 'MUTARE - CHECHECHE (LOCAL)', distance: 230 },
  { route: 'MUTARE - BIRCHENOUGH BRIDGE (LOCAL)', distance: 129 },
  { route: 'MUTARE - CHEGUTU (LOCAL)', distance: 357 },
  { route: 'MUTARE - CHIMANIMANI (LOCAL)', distance: 120 },
  { route: 'MUTARE - CHINHOYI (LOCAL)', distance: 385 },
  { route: 'MUTARE - CHIVHU (LOCAL)', distance: 357 },
  { route: 'MUTARE - BEITBRIDGE (LOCAL)', distance: 589 },
  { route: 'MUTARE - GOKWE (LOCAL)', distance: 445 },
  { route: 'MUTARE - GWANDA (LOCAL)', distance: 571 },
  { route: 'MUTARE - HWANGE (LOCAL)', distance: 613 },
  { route: 'MUTARE - KADOMA (LOCAL)', distance: 404 },
  { route: 'MUTARE - KARIBA (LOCAL)', distance: 634 },
  { route: 'MUTARE - KAROI (LOCAL)', distance: 385 },
  { route: 'MUTARE - MT DARWIN (LOCAL)', distance: 232 },
  { route: 'MUTARE - MUTOKO (LOCAL)', distance: 211 },
  { route: 'MUTARE - MASVINGO (LOCAL)', distance: 297 },
  { route: 'MUTARE - MVURWI (LOCAL)', distance: 275 },
  { route: 'MUTARE - NYANGA (LOCAL)', distance: 107 },
  { route: 'MUTARE - PLUMTREE (LOCAL)', distance: 676 },
  { route: 'MUTARE - RUSAPE (LOCAL)', distance: 94 },
  { route: 'MUTARE - RUWA (LOCAL)', distance: 200 },
  { route: 'MUTARE - NORTON (LOCAL)', distance: 250 },
  { route: 'MUTARE - TRIANGLE (LOCAL)', distance: 400 },
  { route: 'MUTARE - VIC FALLS (LOCAL)', distance: 800 },
  { route: 'MUTARE - GLENDALE (LOCAL)', distance: 250 },
  { route: 'MUTARE - NGEZI (LOCAL)', distance: 350 },
  { route: 'MUTARE - GUTU (LOCAL)', distance: 300 },
  { route: 'MUTARE - JERERA (LOCAL)', distance: 350 },
  { route: 'MUTARE - NYIKA (LOCAL)', distance: 320 },
  { route: 'MUTARE - NGUNDU (LOCAL)', distance: 400 },
  { route: 'MUTARE - ZVISHAVANE (LOCAL)', distance: 400 },
  { route: 'MUTARE - BINDURA (LOCAL)', distance: 250 },
  { route: 'MUTARE - HAUNA (LOCAL)', distance: 85 },
  { route: 'MUTARE - MURAMBINDA (LOCAL)', distance: 150 },
  { route: 'MUTARE - MUREHWA (LOCAL)', distance: 180 },
  { route: 'MUTARE - NYAZURA (LOCAL)', distance: 80 },
  { route: 'MUTARE - SHAMVA (LOCAL)', distance: 250 },
  { route: 'MUTARE - CHIVI (LOCAL)', distance: 300 },
  { route: 'HARARE - CHIPINGE (LOCAL)', distance: 430 },
  { route: 'HARARE - MUTARE (LOCAL)', distance: 270 },
  { route: 'HARARE - CHISUMBANJE (LOCAL)', distance: 473 },
  { route: 'HARARE - NYANGA (LOCAL)', distance: 271 },
  { route: 'HARARE - GWERU (LOCAL)', distance: 280 },
  { route: 'HARARE - KWEKWE (LOCAL)', distance: 215 },
  { route: 'HARARE - NORTON (LOCAL)', distance: 40 },
  { route: 'HARARE - BULAWAYO (LOCAL)', distance: 440 },
  { route: 'HARARE - MASVINGO (LOCAL)', distance: 296 },
  { route: 'HARARE - BURMA VALLEY (LOCAL)', distance: 320 },
  { route: 'HARARE - CHIREDZI (LOCAL)', distance: 434 },
  { route: 'HARARE - BEITHBRIDGE (LOCAL)', distance: 585 },
  { route: 'BULAWAYO - KWEKWE (LOCAL)', distance: 226 },
  { route: 'BULAWAYO - HARARE (LOCAL)', distance: 440 },
  { route: 'BULAWAYO - HARARE B/L (LOCAL)', distance: 440 },
  { route: 'BULAWAYO - MUTARE (LOCAL)', distance: 578 },
  { route: 'BULAWAYO - MUTARE B/L (LOCAL)', distance: 578 },
  { route: 'BULAWAYO - CHIPINGE (LOCAL)', distance: 512 },
  { route: 'BULAWAYO - CHIPINGE B/L (LOCAL)', distance: 512 },
  { route: 'CHIPINGE - HARARE (LOCAL)', distance: 430 },
  { route: 'CHIPINGE - BULAWAYO (LOCAL)', distance: 643 },
  { route: 'CHIPINGE - MUTARE  (LOCAL)', distance: 182 },
  { route: 'CHIPINGE - MUTARE B/L (LOCAL)', distance: 182 },
  { route: 'HARARE - CHIPINGE B/L (LOCAL)', distance: 430 },
  { route: 'HARARE - MUTARE B/L (LOCAL)', distance: 320 },
  { route: 'HARARE - MASVINGO (LOCAL) BL', distance: 296 },
  { route: 'HARARE - KWEKWE (LOCAL) BL', distance: 215 },
  { route: 'HARARE - CHIVHU (LOCAL)', distance: 149 },
  { route: 'HARARE - CHIVHU (LOCAL) BL', distance: 149 },
  { route: 'HARARE - CHIREDZI (LOCAL) BL', distance: 434 },
  { route: 'HARARE - BEITHBRIDGE (LOCAL) BL', distance: 585 },
  { route: 'BULAWAYO - CHIPINGE (LOCAL) (LONG)', distance: 639 },
  { route: 'HARARE - SHOLIVER FARM (LOCAL)', distance: 100 },
  { route: 'HARARE - LIONSDEN FARM (LOCAL)', distance: 140 },
  { route: 'HARARE - DOMA-SUMMERHILL FARM (LOCAL)', distance: 213 },
  { route: 'HARARE - ODZI (LOCAL)', distance: 216 }
];

async function seedRouteDistances() {
  const batch = db.batch();
  for (const rd of routeDistances) {
    // Use a composite key: route + distance for id (safe for deduplication)
    const id = rd.route.replace(/[^a-zA-Z0-9]/g, '_') + '_' + rd.distance;
    const ref = db.collection('routeDistances').doc(id);
    batch.set(ref, rd);
  }
  await batch.commit();
  console.log(`Seeded ${routeDistances.length} routeDistances`);
}

seedRouteDistances()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
