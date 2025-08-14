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

const depots = [
  { name: 'Hertzog Bridge Garage', town: 'Aliwal Noord', address: '3 Barkly Street Aliwal Noord' },
  { name: "Adami's Fuel", town: 'Cradock', address: '18 Voortrekker Street Cradock' },
  { name: 'Ropax Truckstop EL', town: 'East London', address: 'Cambridge Goods Yard, Western Avenue' },
  { name: 'WBG East London', town: 'East London', address: '10 Portland Road Woodbrook' },
  { name: 'Tembuland Gas', town: 'Mthatha', address: '11 Timber St, Vulindlela Heights Mthatha' },
  { name: "Andy's Truckport", town: 'Port Elizabeth', address: '127 Grahamstown Road Deal Party Port Elizabeth' },
  { name: 'ATMS Fuels PE', town: 'Port Elizabeth', address: '5 Murdoch Street Deal Party' },
  { name: 'ENGEN Swartkops', town: 'Port Elizabeth', address: '1 Old Grahamstown Road Port Elizabeth' },
  { name: 'ICR Utility', town: 'Port Elizabeth', address: '78 Pickering Street Port Elizabeth' },
  { name: 'Die Humansdorp Kooperasie', town: 'Queenstown', address: '7 Dickerson Street Queenstown' },
  { name: 'Metro Diesel', town: 'Uitenhage', address: 'Algoa Road Plot 4836' },
  { name: 'Viedgesville Wholesalers', town: 'Umtata', address: 'Main Coffee Bay Road Mthatha' },
  { name: 'Sasol N3 Truck Stop', town: 'Between Warden and Villiers', address: 'N3 & S589 Crossing, Opp Thanda Tau Rooiklaar 454' },
  { name: 'Remoho Fuel', town: 'Bloemfontein', address: 'Avenham No 5 Bloemfontein' },
  { name: 'Highway Junction BP', town: 'Harrismith', address: '1 Nywerheidsweg Harrismith' },
  { name: 'Highway Junction Harrismith', town: 'Harrismith', address: '1 Industrial Road, Hardustria' },
  { name: 'Highway Junction Total', town: 'Harrismith', address: '1 Nywerheidsweg Harrismith' },
  { name: 'Vaal Plaza Truck Stop', town: 'Parys', address: 'Off R59, Weiveld Offramp, Vaal Plaza' },
  { name: 'Phela Energies', town: 'Swinburne', address: 'Swinburne Swinburn' },
  { name: 'Vaal Truck Inn', town: 'Villiers', address: 'Off Ramp No 5 N3 Rietfontein Villiers' },
  { name: 'Big 5 Mega Stop Warden', town: 'Warden', address: '1 Nywerheidsweg Warden' },
  { name: 'Welkom Truck Stop', town: 'Welkom', address: '1 Fuel Street Welkom' },
  { name: 'BDN Diesel', town: 'Alrode South', address: '6 Rogers Road' },
  { name: 'Edge Fuels Boksburg', town: 'Boksburg', address: '113 Commissioner street Boksburg' },
  { name: 'Northrand Fuel Depot', town: 'Boksburg', address: '75 North Rand Road' },
  { name: 'Africa Truck Stop @ R23', town: 'Brakpan', address: '133 Floors Road Withok Estate' },
  { name: 'HMI Service Station', town: 'Germiston', address: '1 Stani Properties Sharland Street' },
  { name: 'Africa Truckstop', town: 'Kempton Park', address: '12 Pomona Road Pomona' },
  { name: 'Afpet Meyerton', town: 'Meyerton', address: '55 Cypress Road Meyerton' },
  { name: 'Laser Fast Truck Stop', town: 'Meyerton', address: '68 Rooibok Street Meyerton' },
  { name: 'Isomaster PTY LTD', town: 'Midrand', address: '1070 Old Pretoria Midrand' },
  { name: 'N14 Truck City', town: 'Mogale', address: 'Plot 16, Steyn Road Steynsville' },
  { name: 'Gaspet MK Depot', town: 'Pretoria', address: '24th street next to St Georges Hotel on M57 off R21' },
  { name: 'Zambesi Truckstop', town: 'Pretoria', address: 'Taaifontein & Moloto Road Pretoria' },
  { name: 'Randfontein Truck Stop', town: 'Randfontein', address: '1 Protea Street Aureus Randfontein' },
  { name: 'Turquoise Moon', town: 'Randfontein', address: '7 Volvo Street, Aureus' },
  { name: 'Gauteng Truck Stop', town: 'Wadeville', address: '403 Dekema Road' },
  { name: 'Shiptech Petroleum', town: 'Cato Ridge', address: 'Units 5, Cato Zulu Industrial Park Old Main Road' },
  { name: 'Sydney Road Pitstop', town: 'Durban', address: '115 Sydney Road Dalbridge' },
  { name: 'Wesgro Truck Station', town: 'Durban', address: '50 Electron Road Durban' },
  { name: 'Ipex Filling Station (PTY) Ltd', town: 'Mokopane', address: '42 Sussex Street Mokopane' },
  { name: 'Comar Fuel', town: 'Musina', address: 'R57 Pontdrift Road Musina' },
  { name: 'BF Distributors / CALTEX', town: 'Polokwane', address: '124 Blaauwberg Street' },
  { name: 'PPS Tzaneen', town: 'Tzaneen', address: '17 Kudu Street' },
  { name: 'GBP Fuels Bethal', town: 'Bethal', address: 'R35, N17 T Junction Bethal' },
  { name: 'Majuba King Petroleum', town: 'Ermelo', address: 'Cnr of Corrie Stolz & Havenga Road Ermelo' },
  { name: 'Shiptech Lydenburg', town: 'Lydenburg', address: '11 - 12 Platinum Street Lydenburg' },
  { name: 'Fuel Solution', town: 'Middelburg', address: 'Middelburg C/O R35 Samora Machel & N4 Highway' },
  { name: 'Shell Midwit Diesel en Olie', town: 'Middelburg', address: '10 Rand Street' },
  { name: 'JEV Petroleum Nelspruit', town: 'Nelspruit', address: 'Farm Alkmaar Nelspruit' },
  { name: 'Shiptech Nelspruit', town: 'Nelspruit', address: '115 Dickenhall Crescent Nelspruit' },
  { name: 'Midwit Diesel en Olie Witbank', town: 'Witbank', address: '82 Marelden, Ext 5, Witbank' },
  { name: 'Crescent Petroleum Distributors', town: 'Bloemhof', address: '13 Prince Street, on N12 Highway Bloemhof' },
  { name: 'Total Twin Cities', town: 'Brits', address: 'Cnr of R511 and R566' },
  { name: 'Eco 1 Stop Truck Inn', town: 'Klerksdorp', address: '15 Railway Avenue Klerksdorp' },
  { name: 'Quattro Diesel', town: 'Klerksdorp', address: '1A Mahogany Avenue' },
  { name: 'Mega 1 Stop', town: 'Potchefstroom', address: '200 Nelson Mandela Drive Potchefstroom' },
  { name: 'MS Petroleum', town: 'Potchefstroom', address: 'Vyfhoek Plot 754, 3rde laan Potchefstroom' },
  { name: 'BP Truck Inn Vryburg', town: 'Vryburg', address: 'Cnr Schweizer & Delarey Street' },
  { name: 'Zeerust Truckstop', town: 'Zeerust', address: '1214 Krans Street N4' },
  { name: 'DOTG Mooi Nooi', town: 'Mooi Nooi', address: 'Lonrho Drive Mooi Nooi' },
  { name: 'Africape N1 Colesburg', town: 'Colesburg', address: '1169 Buffelsvalley Farm Colesburg' },
  { name: 'Mega Fuels Hanover', town: 'Hanover', address: 'Mega Fuels N1 Hanover' },
  { name: 'Micaren Energy Centre Bestwood', town: 'Kathu', address: '1 Bestwood Boulevard Kathu' },
  { name: 'Arcy Diesel', town: 'Kimberley', address: 'Cnr of Landbou Road and Oliver Road Avenue' },
  { name: 'Force Petroleum', town: 'Kimberley, Barkly West', address: 'Plot 8994, Forrestdale Next to Kimberly Recycling' },
  { name: 'B+H Vulstasie', town: 'Modderrivier', address: 'Lillydale Road Modderrivier' },
  { name: 'Upington Truck Stop', town: 'Upington', address: '1 Olifantshoek Road Upington' },
  { name: 'Vryheid Petroleum', town: 'Upington', address: '2346 Old Keimoes Road Upington' },
  { name: 'Fuel 1 Retail (Pty) Ltd Manhattan', town: 'Airport industrial', address: '50 Manhattan Road Airport industrial' },
  { name: 'Express Beaufort Wes', town: 'Beaufort Wes', address: 'Fabriek Street Beaufort Wes' },
  { name: 'Engen Truck Stop Beaufort-Wes', town: 'Beaufort West', address: 'C/o Concrete and Production Street Beaufort-Wes' },
  { name: 'Quest Beaufort West', town: 'Beaufort West', address: 'Cnr Fabriek & Konkrete Street, N1' },
  { name: 'Fuel 1 Retail (Pty) Ltd Bellville', town: 'Bellville', address: '6 Mill Street Bellville' },
  { name: 'Mosh Diesel Bellville', town: 'Bellville South', address: 'Cnr Robert Sobukwe & McDonald Road' },
  { name: 'JEV Petroleum Cape', town: 'Brackenfell', address: '6 Viben Avenue, Brackenfell Industrial Brackenfell' },
  { name: 'Astron Energy N2 Caledon', town: 'Caledon', address: 'Nerine Street Caledon' },
  { name: 'Fuel 1 Retail Pty Ltd Buitengracht', town: 'Cape Town', address: '139 Buitengracht Street Cape Town' },
  { name: 'ATMS Epping Mobile', town: 'Epping', address: '3 Hawkins Avenue' },
  { name: 'ATMS Fuels Epping', town: 'Epping', address: '3 Hawkins Avenue Epping' },
  { name: 'Epping Diesel Depot', town: 'Epping', address: '5 Cable Close Epping' },
  { name: 'Fuel 1 Retail (Pty) Ltd Epping', town: 'Epping', address: '111 BOFOR CIRCLE Epping' },
  { name: 'George Express', town: 'George', address: 'Pearl Street & Saffier Cres George' },
  { name: 'Sandkraal Road Motors', town: 'George', address: '108 Nelson Mandela Blvd' },
  { name: 'Wine Route Truck Stop', town: 'Klapmuts', address: '80 Old Paarl Road' },
  { name: 'Fuel 1 Retail (Pty) Ltd Kraaifontein', town: 'Kraaifontein', address: '12 Acacia Road Kraaifontein' },
  { name: 'Boland Diesel', town: 'Moorreesburg', address: '33 River Street' },
  { name: 'Africa Truck Stop Mosselbaai', town: 'Mosselbaai', address: '-' },
  { name: 'Shell Voorbaai Truckport', town: 'Mosselbay', address: 'Louis Fourie Avenue Voorbaai' },
  { name: 'Fuel 1 Paarden Eiland', town: 'Paarden Eiland', address: '54 Section Street Cape Town' },
  { name: 'Fuel 1 Retail (Pty) Ltd Parow', town: 'Parow', address: 'Cnr Radnor & Spin Road Parow' },
  { name: 'Parow Diesel', town: 'Parow Industrial', address: 'c/o Stellenberg Road & Tekstiel Road' },
  { name: 'Petroport Piketberg Truck Stop', town: 'Piketberg', address: 'Cnr of N7 and R44 Piketberg' },
  { name: 'Hoofweg Motors', town: 'Prins Albert Weg', address: 'On N1 Prins Albert Weg' },
  { name: 'Saldanha Petrol & Diesel', town: 'Saldanha Bay', address: 'Unit 5, Platinum Street' },
  { name: 'ATMS Fuels Stikland', town: 'Stikland', address: '2 Hera Louw Stikland' },
  { name: 'Sir Lowry Diesel Depot', town: 'Strand/Somerset Wes', address: 'Cnr Laker Road & Prima Drive Strand Heidelberg Industrial' },
  { name: 'WBG Swellendam', town: 'Swellendam', address: 'Cnr of Stroom & Russelstreet Swellendam' },
  { name: 'Trawal Truck Inn', town: 'Trawal', address: 'Off N7 National Road' },
  { name: 'Puma Wellington', town: 'Wellington', address: '01 Oude Pont Street' },
  { name: 'Mosh Petroleum-Bergsig 1Stop', town: 'Worcester', address: 'Farm Bergsig, N1 North' }
];

async function seedDepots() {
  const batch = db.batch();
  for (const depot of depots) {
    // Composite key: name + town, sanitized for ID
    const id = (depot.name + '_' + depot.town).replace(/[^a-zA-Z0-9]/g, '_');
    const ref = db.collection('depots').doc(id);
    batch.set(ref, depot);
  }
  await batch.commit();
  console.log(`Seeded ${depots.length} depot records.`);
}

seedDepots().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
