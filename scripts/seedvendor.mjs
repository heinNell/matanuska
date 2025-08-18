// src/components/vendors/VendorTable.tsx
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
const vendorList = [
  { vendorId: "Joharita Enterprizes CC t/a Field Tyre", vendorName: "Field Tyre Services", contactPerson: "Joharita", workEmail: "admin@fieldtyreservices.co.za", mobile: "", address: "13 Varty Street Duncanville Vereeniging 1930", city: "Vereeniging" },
  { vendorId: "Art Cooperation Battery express", vendorName: "Art Cooperation Battery express", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "City Path Trading", vendorName: "City Path Trading", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Spetmic Investments (Pvt) Ltd t/a City Path Trading", vendorName: "Spetmic Investments (Pvt) Ltd t/a City Path Trading", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Spare Parts Exchange (Pvt) Ltd", vendorName: "Spare Parts Exchange (Pvt) Ltd", contactPerson: "", workEmail: "", mobile: "", address: "5a Martin Drive, Msasa, Harare", city: "Harare" },
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
  { vendorId: "Steel", vendorName: "Steelmakers Zimbabwe (Pvt) Ltd", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Tracking", vendorName: "Ezytrack (Pvt) Ltd", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Tyres", vendorName: "Wardstore Enterprises t/a Taita Trading", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Alignment", vendorName: "Rite-Line Alignment (pvt) Ltd", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "RIC", vendorName: "RIC Hyraulic And Engineering P/L", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Pro Tyre", vendorName: "Associated Tyres (Pvt) Ltd t/a Protyre Mutare", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Nichpau Automotive", vendorName: "Nichpau Automotive t/a Spares Centre", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Tentrack", vendorName: "Tentrack Investments (Pvt) Ltd", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Mountskills", vendorName: "Mountskills Enterprises", contactPerson: "", workEmail: "cain@matanuska.co.zw", mobile: "0772731426,071863660", address: "6 Vumba Road Eastern District Engineering Complex", city: "Mutare" },
  { vendorId: "Mallworth Investments", vendorName: "Mallworth Investments (Pvt) Ltd", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
  { vendorId: "Bering Strait Investments", vendorName: "Bering Strait Investments (Pvt) Ltd t/a B.S.I Motor Parts", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Mutare" },
  { vendorId: "Axle Investments Pvt Ltd t/a Matebeleland Trucks", vendorName: "Axle Investments Pvt Ltd t/a Matebeleland Trucks", contactPerson: "", workEmail: "", mobile: "", address: "", city: "Harare" },
];

// Upload vendors to Firestore
async function uploadVendors() {
  const batch = db.batch();
  vendorList.forEach((vendor) => {
    const docRef = db.collection('vendors').doc();
    batch.set(docRef, vendor);
  });
  await batch.commit();
  console.log(`✅ Uploaded ${vendorList.length} vendors to Firestore`);
}

uploadVendors().catch((err) => {
  console.error('❌ Error uploading vendors:', err);
  process.exit(1);
});
