// seedVehicleTyreStore.mjs - For use with Node.js to seed fleet data into Firestore
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
// --- DIE HELE TYRE MAPPING DATA, ALLES IN EEN ---
const VehicleTyreStore = [
  // 15L
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V1', TyreCode: 'MAT0171' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V2', TyreCode: 'MAT0172' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V3', TyreCode: 'MAT0173' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'V4', TyreCode: 'MAT0174' },
  { RegistrationNo: 'AAX2987', StoreName: '15L', TyrePosDescription: 'SP', TyreCode: 'MAT0175' },

  // 14L
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V1', TyreCode: 'MAT0471' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V2', TyreCode: 'MAT0472' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V3', TyreCode: 'MAT0473' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'V4', TyreCode: 'MAT0474' },
  { RegistrationNo: 'ABA3918', StoreName: '14L', TyrePosDescription: 'SP', TyreCode: 'MAT0125' },

  // 2T (Interlink)
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

  // 6H (LMV Example)
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V1', TyreCode: 'MAT0306' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V2', TyreCode: 'MAT0307' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V3', TyreCode: 'MAT0180' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V4', TyreCode: 'MAT0181' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V5', TyreCode: 'MAT0179' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'V6', TyreCode: 'MAT0178' },
  { RegistrationNo: 'ABJ3739', StoreName: '6H', TyrePosDescription: 'SP', TyreCode: 'MAT0182' },

  // UD
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V1', TyreCode: 'MAT0022' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V2', TyreCode: 'MAT0023' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V3', TyreCode: 'MAT0035' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V4', TyreCode: 'MAT0037' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V5', TyreCode: 'MAT0036' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'V6', TyreCode: 'MAT0034' },
  { RegistrationNo: 'ACO8468', StoreName: 'UD', TyrePosDescription: 'SP', TyreCode: 'MAT0038' },

  // --- SPESIALE HORSES EN GROOT VLOTE ---
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

  // 23H, 24H, 26H, 28H
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

async function seedFleet() {
  console.log(`🔄 Starting tyre store data seeding process...`);
  console.log(`📊 Found ${VehicleTyreStore.length} tyre store items to seed`);
  
  try {
    const batch = db.batch();
    let successCount = 0;
    let skipCount = 0;
    
    for (const vehicle of VehicleTyreStore) {
      const docRef = db.collection('tyreStore').doc(`${vehicle.StoreName}_${vehicle.TyrePosDescription}_${vehicle.TyreCode}`);
      
      // Check if document already exists to avoid duplicates
      const doc = await docRef.get();
      
      if (doc.exists) {
                console.log(`ℹ️ Tyre store item ${vehicle.StoreName}_${vehicle.TyrePosDescription} already exists, skipping...`);
        skipCount++;
        continue;
      }
      
      // Add vehicle data to batch
      batch.set(docRef, {
        ...vehicle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      successCount++;
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${successCount} tyre store items to Firestore`);
    console.log(`ℹ️ Skipped ${skipCount} existing tyre store items`);
  } catch (error) {
    console.error('❌ Error seeding fleet data:', error);
  }
}

// Run the seeding function
seedFleet().then(() => {
  console.log('🏁 Tyre store seeding process complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Unhandled error during tyre store seeding:', error);
  process.exit(1);
});