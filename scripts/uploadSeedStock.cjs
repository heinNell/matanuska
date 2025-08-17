// Usage: node uploadSeedStock.js

import fs from 'fs';
import path from 'path';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
});
const db = getFirestore();

// Read and parse the inventory file
const filePath = path.join(process.cwd(), 'seedstockinventory.mjs');
const fileContent = fs.readFileSync(filePath, 'utf8');

// Split into lines and parse header
const lines = fileContent.split('\n').filter(line => line.trim() !== '');
const header = lines[0].split('\t').map(h => h.trim());

// Utility: Map raw inventory row to Firestore document
function mapSeedStockRow(raw) {
  return {
    storeName: raw['StoreName'] || '',
    stockCode: raw['StockCde'] || '',
    supplierPartNo: raw['Supplier Part No'] || '',
    description: raw['StockDescription'] || '',
    costPrice: raw['StockCostPrice'] ? parseFloat(raw['StockCostPrice']) : 0,
    quantity: raw['StockQty'] ? parseFloat(raw['StockQty']) : 0,
    value: raw['Stock Value'] ? parseFloat(raw['Stock Value']) : 0,
    reorderLevel: raw['ReorderLevel'] ? parseInt(raw['ReorderLevel']) : 0,
    // Add more mappings if needed
  };
}

// Parse each row into an object
const items = lines.slice(1)
  .filter(line => line.trim() && !line.startsWith('//'))
  .map(line => {
    const cols = line.split('\t');
    // Pad columns if missing
    while (cols.length < header.length) cols.push('');
    const obj = {};
    header.forEach((key, idx) => {
      obj[key] = cols[idx] ? cols[idx].trim() : '';
    });
    return obj;
  })
  // Filter out summary/empty rows
  .filter(item => item['StoreName'] && item['StockCde'])
  .map(mapSeedStockRow); // <-- Apply mapping here

// Upload to Firestore
async function upload() {
  const batch = db.batch();
  const collection = db.collection('stockInventory');
  items.forEach(item => {
    const docRef = collection.doc(item['StockCde'] || undefined);
    batch.set(docRef, item);
  });
  await batch.commit();
  console.log(`Uploaded ${items.length} stock items to Firestore.`);
}

upload().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
