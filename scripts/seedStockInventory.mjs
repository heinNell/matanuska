// seedStockInventory.mjs - For use with Node.js to seed stock inventory data into Firestore
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

// Stock inventory data
const stockInventory = [
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
];

// Helper to sanitize Firestore document IDs
function sanitizeDocId(id) {
  // Replace spaces, slashes, and other invalid chars with underscores
  return id.replace(/[\/\\\s#?%]+/g, '_');
}

// Main seeding function for stock inventory
async function seedStockInventory() {
  console.log(`🔄 Starting stock inventory data seeding process...`);
  console.log(`📊 Found ${stockInventory.length} stock items to seed`);
  
  try {
    const batch = db.batch();
    let successCount = 0;
    let skipCount = 0;
    
    for (const item of stockInventory) {
      const docId = sanitizeDocId(item.StockCde);
      const docRef = db.collection('stockInventory').doc(docId);

      // Check if document already exists to avoid duplicates
      const doc = await docRef.get();
      
      if (doc.exists) {
        console.log(`ℹ️ Stock item ${item.StockCde} already exists, skipping...`);
        skipCount++;
        continue;
      }
      
      // Add stock item data to batch
      batch.set(docRef, {
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      successCount++;
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${successCount} stock items to Firestore`);
    console.log(`ℹ️ Skipped ${skipCount} existing stock items`);
  } catch (error) {
    console.error('❌ Error seeding stock inventory data:', error);
  }
}

// Run the seeding function
seedStockInventory().then(() => {
  console.log('🏁 Stock inventory seeding process complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Unhandled error during stock inventory seeding:', error);
  process.exit(1);
});