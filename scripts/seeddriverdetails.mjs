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

// Driver authorization data - flat array for storing in Firestore
const authorisationMapping = [
  {
    "idNo": "53/070281M53",
    "name": "Adrian",
    "surname": "Moyo",
    "authorization": "PASSPORT",
    "issueDate": null,
    "expireDate": "17/03/2032",
    "authRef": "AE024812",
    "authorised": "Yes"
  },
  {
    "idNo": "53/070281M53",
    "name": "Adrian",
    "surname": "Moyo",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "10/03/2026",
    "authRef": "08969DJ",
    "authorised": "Yes"
  },
  {
    "idNo": "53/070281M53",
    "name": "Adrian",
    "surname": "Moyo",
    "authorization": "INTERNATIONAL DRIVING PERMIT",
    "issueDate": null,
    "expireDate": "25/02/2026",
    "authRef": "235111",
    "authorised": "Yes"
  },
  {
    "idNo": "53/070281M53",
    "name": "Adrian",
    "surname": "Moyo",
    "authorization": "DRIVERS LICENSE",
    "issueDate": null,
    "expireDate": "24/10/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "53/070281M53",
    "name": "Adrian",
    "surname": "Moyo",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": "08/11/2024",
    "expireDate": "07/11/2028",
    "authRef": "329482",
    "authorised": "Yes"
  },
  {
    "idNo": "86-019045-L86",
    "name": "Biggie",
    "surname": "Mugwa",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "01/03/2026",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "86-019045-L86",
    "name": "Biggie",
    "surname": "Mugwa",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "05/10/2025",
    "authRef": "N239172",
    "authorised": "Yes"
  },
  {
    "idNo": "86-019045-L86",
    "name": "Biggie",
    "surname": "Mugwa",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "01/86019045L86",
    "authorised": "Yes"
  },
  {
    "idNo": "86-019045-L86",
    "name": "Biggie",
    "surname": "Mugwa",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "01/01/2019",
    "expireDate": "21/08/2029",
    "authRef": "65376LM",
    "authorised": "Yes"
  },
  {
    "idNo": "AE779063",
    "name": "Canaan",
    "surname": "Chipfurutse",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "22/10/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "AE779063",
    "name": "Canaan",
    "surname": "Chipfurutse",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "63-1159761S07",
    "authorised": "Yes"
  },
  {
    "idNo": "AE779063",
    "name": "Canaan",
    "surname": "Chipfurutse",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "21/06/2006",
    "expireDate": "01/07/2029",
    "authRef": "80059GM",
    "authorised": "Yes"
  },
  {
    "idNo": "AE779063",
    "name": "Canaan",
    "surname": "Chipfurutse",
    "authorization": "PASSPORT",
    "issueDate": "11/09/2023",
    "expireDate": "11/09/2033",
    "authRef": "EN772421",
    "authorised": "Yes"
  },
  {
    "idNo": "AE779063",
    "name": "Canaan",
    "surname": "Chipfurutse",
    "authorization": "INTERNATIONAL DRIVING PERMIT",
    "issueDate": "02/07/2024",
    "expireDate": "29/06/2027",
    "authRef": "264895",
    "authorised": "Yes"
  },
  {
    "idNo": "AE779063",
    "name": "Canaan",
    "surname": "Chipfurutse",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": "22/11/2024",
    "expireDate": "21/11/2028",
    "authRef": "311139",
    "authorised": "Yes"
  },
  {
    "idNo": "75-374887",
    "name": "Decide",
    "surname": "Murahwa",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "10/06/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "75-374887",
    "name": "Decide",
    "surname": "Murahwa",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "04/10/2025",
    "authRef": "N234827",
    "authorised": "Yes"
  },
  {
    "idNo": "75-374887",
    "name": "Decide",
    "surname": "Murahwa",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "08/12/2012",
    "expireDate": "15/11/2026",
    "authRef": "89002JC",
    "authorised": "Yes"
  },
  {
    "idNo": "75-374887",
    "name": "Decide",
    "surname": "Murahwa",
    "authorization": "ID",
    "issueDate": "18/12/2012",
    "expireDate": null,
    "authRef": "75-374887Z75",
    "authorised": "Yes"
  },
  {
    "idNo": "43-051679C43",
    "name": "Doctor",
    "surname": "Kondwani",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "06/06/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "43-051679C43",
    "name": "Doctor",
    "surname": "Kondwani",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "12/05/2029",
    "authRef": "N342921",
    "authorised": "Yes"
  },
  {
    "idNo": "43-051679C43",
    "name": "Doctor",
    "surname": "Kondwani",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "43-051679C43",
    "authorised": "Yes"
  },
  {
    "idNo": "43-051679C43",
    "name": "Doctor",
    "surname": "Kondwani",
    "authorization": "DRIVERS LICENSE",
    "issueDate": null,
    "expireDate": "16/05/2026",
    "authRef": "48478JC",
    "authorised": "Yes"
  },
  {
    "idNo": "GN483945",
    "name": "Enock",
    "surname": "Mukonyerwa",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "30/06/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "GN483945",
    "name": "Enock",
    "surname": "Mukonyerwa",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "01/11/2025",
    "authRef": "N244187",
    "authorised": "Yes"
  },
  {
    "idNo": "GN483945",
    "name": "Enock",
    "surname": "Mukonyerwa",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "44-066516L44",
    "authorised": "Yes"
  },
  {
    "idNo": "GN483945",
    "name": "Enock",
    "surname": "Mukonyerwa",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "06/08/2012",
    "expireDate": "21/10/2027",
    "authRef": "16246JC",
    "authorised": "Yes"
  },
  {
    "idNo": "GN483945",
    "name": "Enock",
    "surname": "Mukonyerwa",
    "authorization": "PASSPORT",
    "issueDate": "12/09/2013",
    "expireDate": "11/09/2033",
    "authRef": "GN483945",
    "authorised": "Yes"
  },
  {
    "idNo": "GN483945",
    "name": "Enock",
    "surname": "Mukonyerwa",
    "authorization": "INTERNATIONAL DRIVING PERMIT",
    "issueDate": "14/03/2028",
    "expireDate": "14/03/2028",
    "authRef": "231634",
    "authorised": "Yes"
  },
  {
    "idNo": "EN905695",
    "name": "Jonathan",
    "surname": "Bepete",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "10/10/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "EN905695",
    "name": "Jonathan",
    "surname": "Bepete",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "08/06/2025",
    "authRef": "N230457",
    "authorised": "Yes"
  },
  {
    "idNo": "EN905695",
    "name": "Jonathan",
    "surname": "Bepete",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "75-167967L75",
    "authorised": "Yes"
  },
  {
    "idNo": "EN905695",
    "name": "Jonathan",
    "surname": "Bepete",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "15/12/2009",
    "expireDate": "04/08/2025",
    "authRef": "71196K",
    "authorised": "Yes"
  },
  {
    "idNo": "EN905695",
    "name": "Jonathan",
    "surname": "Bepete",
    "authorization": "PASSPORT",
    "issueDate": "24/03/2016",
    "expireDate": "23/03/2026",
    "authRef": "EN905695",
    "authorised": "Yes"
  },
  {
    "idNo": "EN905695",
    "name": "Jonathan",
    "surname": "Bepete",
    "authorization": "INTERNATIONAL DRIVING PERMIT",
    "issueDate": "23/07/2024",
    "expireDate": "20/07/2027",
    "authRef": "265656",
    "authorised": "Yes"
  },
  {
    "idNo": "DN396706",
    "name": "Lovemore",
    "surname": "Qochiwe",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "09/09/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "DN396706",
    "name": "Lovemore",
    "surname": "Qochiwe",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "13/02/2027",
    "authRef": "N279649",
    "authorised": "Yes"
  },
  {
    "idNo": "DN396706",
    "name": "Lovemore",
    "surname": "Qochiwe",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "13-142798Z13",
    "authorised": "Yes"
  },
  {
    "idNo": "DN396706",
    "name": "Lovemore",
    "surname": "Qochiwe",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "31/07/2017",
    "expireDate": "31/05/2027",
    "authRef": "30030DK",
    "authorised": "Yes"
  },
  {
    "idNo": null,
    "name": "Luckson",
    "surname": "Tanyanyiwa",
    "authorization": "DRIVERS LICENSE",
    "issueDate": null,
    "expireDate": "10/10/2025",
    "authRef": "13007JZ",
    "authorised": "Yes"
  },
  {
    "idNo": null,
    "name": "Luckson",
    "surname": "Tanyanyiwa",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "09/10/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": null,
    "name": "Luckson",
    "surname": "Tanyanyiwa",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "10/10/2028",
    "authRef": "N327407",
    "authorised": "Yes"
  },
  {
    "idNo": null,
    "name": "Luckson",
    "surname": "Tanyanyiwa",
    "authorization": "ID",
    "issueDate": "23/06/2013",
    "expireDate": null,
    "authRef": "34-103687Z34",
    "authorised": "Yes"
  },
  {
    "idNo": "EN772421",
    "name": "Peter",
    "surname": "Farai",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "23/04/2026",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "EN772421",
    "name": "Peter",
    "surname": "Farai",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE", 
    "issueDate": null,
    "expireDate": "02/03/2026",
    "authRef": "N248545",
    "authorised": "Yes"
  },
  {
    "idNo": "EN772421",
    "name": "Peter",
    "surname": "Farai",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "75-268211X75",
    "authorised": "Yes"
  },
  {
    "idNo": "EN772421",
    "name": "Peter",
    "surname": "Farai",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "13/09/1997",
    "expireDate": "24/03/2026",
    "authRef": "17067G",
    "authorised": "Yes"
  },
  {
    "idNo": "EN772421",
    "name": "Peter",
    "surname": "Farai",
    "authorization": "PASSPORT",
    "issueDate": "25/11/2015",
    "expireDate": "24/11/2025",
    "authRef": "EN772421",
    "authorised": "Yes"
  },
  {
    "idNo": "AE020649",
    "name": "Phillimon",
    "surname": "Kwarire",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "30/08/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "AE020649",
    "name": "Phillimon",
    "surname": "Kwarire",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "44-047755T24",
    "authorised": "Yes"
  },
  {
    "idNo": "AE020649",
    "name": "Phillimon",
    "surname": "Kwarire",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "29/05/2003",
    "expireDate": "03/08/2027",
    "authRef": "68993AM",
    "authorised": "Yes"
  },
  {
    "idNo": "AE020649",
    "name": "Phillimon",
    "surname": "Kwarire",
    "authorization": "PASSPORT",
    "issueDate": "09/03/2022",
    "expireDate": "08/03/2032",
    "authRef": "AE020649",
    "authorised": "Yes"
  },
  {
    "idNo": "AE020649",
    "name": "Phillimon",
    "surname": "Kwarire",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": "22/11/2024",
    "expireDate": "21/11/2028",
    "authRef": "311137",
    "authorised": "Yes"
  },
  {
    "idNo": "AE020649",
    "name": "Phillimon",
    "surname": "Kwarire",
    "authorization": "INTERNATIONAL DRIVING PERMIT",
    "issueDate": "07/05/2025",
    "expireDate": "04/05/2028",
    "authRef": "281381",
    "authorised": "Yes"
  },
  {
    "idNo": "S8140154T58",
    "name": "Taurayi",
    "surname": "Vherenaisi",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "30/09/2025",
    "authRef": "N234685",
    "authorised": "Yes"
  },
  {
    "idNo": "S8140154T58",
    "name": "Taurayi",
    "surname": "Vherenaisi",
    "authorization": "PASSPORT",
    "issueDate": "04/10/2023",
    "expireDate": "03/10/2033",
    "authRef": "AE808055",
    "authorised": "Yes"
  },
  {
    "idNo": "S8140154T58",
    "name": "Taurayi",
    "surname": "Vherenaisi",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "15/12/2023",
    "expireDate": "15/12/2028",
    "authRef": "AA00169144",
    "authorised": "Yes"
  },
  {
    "idNo": "S8140154T58",
    "name": "Taurayi",
    "surname": "Vherenaisi",
    "authorization": "INTERNATIONAL DRIVING PERMIT",
    "issueDate": "03/03/2025",
    "expireDate": "01/03/2026",
    "authRef": "277904",
    "authorised": "Yes"
  },
  {
    "idNo": "S8140154T58",
    "name": "Taurayi",
    "surname": "Vherenaisi",
    "authorization": "MEDICAL CERT",
    "issueDate": "07/03/2025",
    "expireDate": "07/03/2026",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "EN109903",
    "name": "Vengayi",
    "surname": "Makozhombwe",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "09/09/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "EN109903",
    "name": "Vengayi",
    "surname": "Makozhombwe",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "11/11/2028",
    "authRef": "N329776",
    "authorised": "Yes"
  },
  {
    "idNo": "EN109903",
    "name": "Vengayi",
    "surname": "Makozhombwe",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "71-076347Y71",
    "authorised": "Yes"
  },
  {
    "idNo": "EN109903",
    "name": "Vengayi",
    "surname": "Makozhombwe",
    "authorization": "DRIVERS LICENSE",
    "issueDate": "18/01/2013",
    "expireDate": "11/11/2028",
    "authRef": "91629JC",
    "authorised": "Yes"
  },
  {
    "idNo": "29-240694M75",
    "name": "Wellington",
    "surname": "Musumbu",
    "authorization": "MEDICAL CERT",
    "issueDate": null,
    "expireDate": "24/06/2025",
    "authRef": null,
    "authorised": "Yes"
  },
  {
    "idNo": "29-240694M75",
    "name": "Wellington",
    "surname": "Musumbu",
    "authorization": "DEFENSIVE DRIVING CERTIFICATE",
    "issueDate": null,
    "expireDate": "02/10/2028",
    "authRef": "N326835",
    "authorised": "Yes"
  },
  {
    "idNo": "29-240694M75",
    "name": "Wellington",
    "surname": "Musumbu",
    "authorization": "ID",
    "issueDate": null,
    "expireDate": null,
    "authRef": "29-240694M75",
    "authorised": "Yes"
  },
  {
    "idNo": "29-240694M75",
    "name": "Wellington",
    "surname": "Musumbu",
    "authorization": "DRIVERS LICENSE",
    "issueDate": null,
    "expireDate": "18/09/2029",
    "authRef": "169167LD",
    "authorised": "Yes"
  },
  {
    "idNo": "29-240694M75",
    "name": "Wellington",
    "surname": "Musumbu",
    "authorization": "PASSPORT",
    "issueDate": "08/08/2023",
    "expireDate": "08/08/2033",
    "authRef": "AE731406",
    "authorised": "Yes"
  }
]

async function seedDriverAuthorizations() {
  console.log(`🔄 Starting driver authorization seeding process...`);
  console.log(`📊 Found ${authorisationMapping.length} authorizations to seed`);
  
  try {
    const batch = db.batch();
    let successCount = 0;
    let skipCount = 0;
    
    // First, let's create a unique ID for each authorization document
    for (const auth of authorisationMapping) {
      // Create a unique ID for the authorization document - ensure it's a valid document ID
      // Replace any characters that aren't allowed in Firestore document IDs
      let idPart = (auth.idNo || 'unknown').replace(/[\/\.\[\]\#\$\/\*]/g, '_');
      let authPart = auth.authorization.replace(/\s+/g, '_').toLowerCase();
      let refPart = (auth.authRef || Math.random().toString(36).substring(2, 10)).replace(/[\/\.\[\]\#\$\/\*]/g, '_');
      
      const docId = `${idPart}_${authPart}_${refPart}`;
      const docRef = db.collection('authorizations').doc(docId);
      
      // Check if document already exists to avoid duplicates
      const doc = await docRef.get();
      
      if (doc.exists) {
        console.log(`ℹ️ Authorization ${docId} already exists, skipping...`);
        skipCount++;
        continue;
      }
      
      // Add authorization data to batch
      batch.set(docRef, {
        ...auth,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      successCount++;
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${successCount} authorizations to Firestore`);
    console.log(`ℹ️ Skipped ${skipCount} existing authorizations`);
    
    // Now let's create or update the driver records
    const driverMap = {};
    
    // Group by driver ID and extract unique driver info
    for (const auth of authorisationMapping) {
      if (!auth.idNo) continue;
      
      if (!driverMap[auth.idNo]) {
        driverMap[auth.idNo] = {
          idNo: auth.idNo,
          name: auth.name,
          surname: auth.surname,
          status: 'Active',
          joinDate: new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    }
    
    // Create/update driver records
    const driverBatch = db.batch();
    let driverSuccessCount = 0;
    let driverSkipCount = 0;
    
    for (const [idNo, driverData] of Object.entries(driverMap)) {
      // Use idNo as document ID or generate a random one if not available
      // Sanitize the ID to be a valid Firestore document ID
      const docId = idNo ? idNo.replace(/[\/\.\[\]\#\$\/\*]/g, '_') : Math.random().toString(36).substring(2, 15);
      const docRef = db.collection('drivers').doc(docId);
      
      // Check if driver already exists
      const doc = await docRef.get();
      
      if (doc.exists) {
        console.log(`ℹ️ Driver ${driverData.name} ${driverData.surname} already exists, updating...`);
        driverBatch.update(docRef, {
          ...driverData,
          updatedAt: new Date().toISOString()
        });
      } else {
        console.log(`➕ Adding new driver: ${driverData.name} ${driverData.surname}`);
        driverBatch.set(docRef, driverData);
      }
      
      driverSuccessCount++;
    }
    
    // Commit the driver batch
    await driverBatch.commit();
    
    console.log(`✅ Successfully processed ${driverSuccessCount} drivers in Firestore`);
    
  } catch (error) {
    console.error('❌ Error seeding driver authorization data:', error);
    throw error;
  }
}

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

// Run the seeding functions
async function runAllSeeds() {
  try {
    console.log('📊 Starting data seeding process...');
    
    // Seed driver authorizations first
    await seedDriverAuthorizations();
    console.log('✅ Driver authorization seeding complete');
    
    console.log('🏁 All seeding processes completed successfully');
  } catch (error) {
    console.error('❌ Error during seeding process:', error);
    process.exit(1);
  }
}

// Run the seeding
runAllSeeds().then(() => {
  console.log('🏁 Driver data seeding complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Unhandled error during data seeding:', error);
  process.exit(1);
});