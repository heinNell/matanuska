// Script to seed client data into Firestore
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin with service account
try {
  // Check if the GOOGLE_APPLICATION_CREDENTIALS environment variable is set
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('GOOGLE_APPLICATION_CREDENTIALS environment variable not set. Looking for serviceAccountKey.json...');
    
    // Try to use a local service account key file
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('Initialized Firebase Admin with local serviceAccountKey.json');
    } else {
      throw new Error('No service account credentials found. Please set GOOGLE_APPLICATION_CREDENTIALS or provide a serviceAccountKey.json file.');
    }
  } else {
    // Use the environment variable
    initializeApp();
    console.log('Initialized Firebase Admin with GOOGLE_APPLICATION_CREDENTIALS');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

// Get Firestore instance
const db = getFirestore();

// Read client data from the file
const clientsDataPath = path.join(__dirname, 'seedclientlist.cjs');
let clientsData;

try {
  // Read the file content
  const fileContent = fs.readFileSync(clientsDataPath, 'utf8');
  
  // Extract the JSON part from the JavaScript file
  const jsonContent = fileContent.trim().replace(/^module\.exports\s*=\s*/, '').replace(/;$/, '');
  
  // Parse the JSON
  clientsData = JSON.parse(jsonContent);
  
  if (!Array.isArray(clientsData)) {
    throw new Error('Client data is not an array');
  }
  
  console.log(`Successfully loaded ${clientsData.length} clients from seedclientlist.cjs`);
} catch (error) {
  console.error('Error reading client data:', error);
  
  // Try as a plain array
  try {
    clientsData = JSON.parse(fs.readFileSync(clientsDataPath, 'utf8'));
    console.log(`Successfully loaded ${clientsData.length} clients as direct JSON`);
  } catch (innerError) {
    console.error('Failed to parse as direct JSON too:', innerError);
    process.exit(1);
  }
}

// Process and seed client data
async function seedClients() {
  const clientsCollection = db.collection('clients');
  const batch = db.batch();
  let count = 0;
  let batchCount = 0;
  
  console.log(`Starting to seed ${clientsData.length} clients...`);
  
  // Process each client
  for (const client of clientsData) {
    // Create a clean document ID from the client name (remove special chars and spaces)
    const clientId = client.client
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-')        // Replace multiple hyphens with a single one
      .replace(/^-|-$/g, '');     // Remove hyphens at the beginning or end
    
    // Add metadata fields
    const enhancedClient = {
      ...client,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
      // Add more fields as needed
    };
    
    // Add to batch
    const docRef = clientsCollection.doc(clientId);
    batch.set(docRef, enhancedClient);
    
    count++;
    
    // Commit in batches of 500 (Firestore limit)
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Committed batch ${++batchCount} (${count} clients processed)`);
      batch = db.batch();
    }
  }
  
  // Commit any remaining documents
  if (count % 500 !== 0) {
    await batch.commit();
    console.log(`Committed final batch (${count} total clients processed)`);
  }
  
  console.log(`Successfully seeded ${count} clients into Firestore`);
}

// Execute the seeding function
seedClients()
  .then(() => {
    console.log('Client seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding clients:', error);
    process.exit(1);
  });
