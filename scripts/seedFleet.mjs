// seedFleet.mjs - For use with Node.js to seed fleet data into Firestore
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

// Fleet data
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

async function seedFleet() {
  console.log(`🔄 Starting fleet data seeding process...`);
  console.log(`📊 Found ${fleetData.length} fleet vehicles to seed`);
  
  try {
    const batch = db.batch();
    let successCount = 0;
    let skipCount = 0;
    
    for (const vehicle of fleetData) {
      const docRef = db.collection('fleet').doc(vehicle.fleetNumber);
      
      // Check if document already exists to avoid duplicates
      const doc = await docRef.get();
      
      if (doc.exists) {
        console.log(`ℹ️ Fleet ${vehicle.fleetNumber} already exists, skipping...`);
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
    
    console.log(`✅ Successfully seeded ${successCount} fleet vehicles to Firestore`);
    console.log(`ℹ️ Skipped ${skipCount} existing fleet vehicles`);
  } catch (error) {
    console.error('❌ Error seeding fleet data:', error);
  }
}

// Run the seeding function
seedFleet().then(() => {
  console.log('🏁 Fleet seeding process complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Unhandled error during fleet seeding:', error);
  process.exit(1);
});