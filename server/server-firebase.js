import * as admin from "firebase-admin";
// Import the service account as a require to avoid TypeScript issues
const serviceAccount = require("./serviceAccountKey.json");

// Check if we're in the serverless environment
console.log("Environment:", process.env.NODE_ENV, "Vercel:", process.env.VERCEL ? "Yes" : "No");

// Check if Firebase Admin is already initialized
let firebaseApp;
try {
  if (!admin.apps.length) {
    // Initialize with the service account file
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
        // Database secret key for additional security
        databaseAuthVariableOverride: {
          secret: "0MpRyYXn67xayFt4C8uNcXMII2IJWlXISzbwDQ3C",
        },
      });
      console.log("Firebase initialized with service account from file");
    } catch (error) {
      console.error("Error initializing Firebase with service account file:", error);

      // Fallback to environment variables if file loading fails
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          const serviceAccountEnv = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountEnv),
            databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
          });
          console.log("Firebase initialized with service account from environment");
        } catch (envError) {
          console.error("Error initializing Firebase with service account from env:", envError);
          if (isServerless) {
            // In serverless, try to use the default credentials
            firebaseApp = admin.initializeApp({
              credential: admin.credential.applicationDefault(),
              databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
            });
            console.log("Firebase initialized with application default credentials");
          } else {
            // In development, initialize with a project ID at minimum
            firebaseApp = admin.initializeApp({
              projectId: "mat1-9e6b3",
              databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
            });
            console.log("Firebase initialized with project ID only");
          }
        }
      } else if (isServerless) {
        // In serverless, use application default credentials
        firebaseApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
        });
        console.log("Firebase initialized with application default credentials");
      } else {
        // In development, initialize with a project ID at minimum
        firebaseApp = admin.initializeApp({
          projectId: "mat1-9e6b3",
          databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
        });
        console.log("Firebase initialized with project ID only");
      }
    }
  } else {
    firebaseApp = admin.app();
    console.log("Using existing Firebase app");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error.message);
}

// Get Firestore instance
const db = admin.firestore(firebaseApp);

// Import inventory items to Firestore
const importInventoryItems = async (items) => {
  try {
    console.log(`Importing ${items.length} inventory items to Firestore...`);

    // Instead of using batch, process items in smaller chunks to avoid errors
    const chunkSize = 20;
    const results = [];

    // Process in chunks to avoid Firestore batch limits
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      console.log(
        `Processing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(items.length / chunkSize)}, size: ${chunk.length}`
      );

      const inventoryRef = db.collection("inventory");
      const batch = db.batch();

      // Process each item in the chunk
      for (const item of chunk) {
        // Generate a unique document ID if not provided
        const docId =
          item.id || `tyre_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const docRef = inventoryRef.doc(docId);

        // First check if the document exists
        try {
          const doc = await docRef.get();

          // If document exists, update it; otherwise create it
          batch.set(
            docRef,
            {
              ...item,
              id: docId,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              ...(doc.exists ? {} : { createdAt: admin.firestore.FieldValue.serverTimestamp() }),
            },
            { merge: true }
          ); // Use merge option to prevent complete overwrites
        } catch (docError) {
          console.error(`Error checking document ${docId}:`, docError);
          // Create a new document anyway
          batch.set(docRef, {
            ...item,
            id: docId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // Commit the batch for this chunk
      await batch.commit();
      console.log(`Chunk ${Math.floor(i / chunkSize) + 1} committed successfully`);
      results.push(chunk.length);
    }

    // Total imported
    const totalImported = results.reduce((total, num) => total + num, 0);

    return {
      success: true,
      count: totalImported,
      message: `${totalImported} inventory items imported successfully`,
      chunkResults: results,
    };
  } catch (error) {
    console.error("Error importing inventory items:", error);
    throw error;
  }
};

// Get all inventory items
const getAllInventoryItems = async () => {
  try {
    const snapshot = await db.collection("inventory").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting inventory items:", error);
    throw error;
  }
};

// Get inventory item by ID
const getInventoryItemById = async (id) => {
  try {
    const doc = await db.collection("inventory").doc(id).get();
    if (!doc.exists) {
      throw new Error(`Inventory item with ID ${id} not found`);
    }
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error(`Error getting inventory item ${id}:`, error);
    throw error;
  }
};

// Update inventory item
const updateInventoryItem = async (id, data) => {
  try {
    await db
      .collection("inventory")
      .doc(id)
      .update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    return {
      success: true,
      message: `Inventory item ${id} updated successfully`,
    };
  } catch (error) {
    console.error(`Error updating inventory item ${id}:`, error);
    throw error;
  }
};

// Delete inventory item
const deleteInventoryItem = async (id) => {
  try {
    await db.collection("inventory").doc(id).delete();
    return {
      success: true,
      message: `Inventory item ${id} deleted successfully`,
    };
  } catch (error) {
    console.error(`Error deleting inventory item ${id}:`, error);
    throw error;
  }
};

export {
  admin,
  db,
  deleteInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  importInventoryItems,
  updateInventoryItem,
};
