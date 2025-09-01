import * as admin from "firebase-admin";

// Define service account type
interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;
}

// Check if we're in the serverless environment
const isServerless = process.env.VERCEL || process.env.NODE_ENV === "production";
console.log("Environment:", process.env.NODE_ENV, "Vercel:", process.env.VERCEL ? "Yes" : "No");

// Service account setup - directly embed the service account details
const serviceAccount: ServiceAccount = {
  type: "service_account",
  project_id: "mat1-9e6b3",
  private_key_id: "30616262b0c12b3db77b03fed8dcd431e8b109e8",
  private_key:
    "AIzaSyBtq7Z6qqaVmb22d3aNcwNiqkrbGtIhJ7g\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+e2VqEXDTi48i\nV3oiwsCV80HfFo40OJmNuXc1ePzfhNbdjWT6OC8r3pIy5SeymkdjGiGdV/xwLipO\n+kb9CkmmF3X9DRp+N9uTgMbXqpsyWgTXxnwYQzPt7NczA1e/XIYHcTgiryWJXvv5\nKQx005GzVjRen77hMoV3Y7WA81G+aqc/cC2Ke+dbFm1inKnzSq34u679L7Q2ezcs\nAZWkcZj1gT07T23dy1y02kNdgxJZZvIlpGzgVK342siJlg1QvFVxhQjj8Qg21KpS\n5oXcL7mbp2vcJB482eyIkBKyW4fetCjzP2OPNTXVA7cDamkIoVyL5G0GBOAQFniR\nyEN+NX+hAgMBAAECggEABSMf05H/2Hy5kgQI87oL5p9mZeVeVXM3VPatC+Ck9URI\nZTZEhGkSgJzilYPPo8X8aeRRBsTSNpZQJswiMP3fiZ61XGtHjSLlhZ9h/XwI7n02\nBzm/rAnX8zFBhosvCSauKLI5gNn3abKJmikswFPaaJtJE0o8pCcwKU2jngQx7rA2\nxDAX4Axbqf79Yg8vUywhN69Hqg63naycW7aHRM83GYvN1MeWv7GuGAEsdlz+a4KX\ndVk21VtPFnmkaVY2duj4qeE8tZWMcrhMzEMn9F+f5JMbnv9AkV/REyh7DOOMVSzz\no+Lo7Fqw9lSCEn7Y0WnW2QW1MtXXrhwtFhnqf1ibXwKBgQDeIPWBQJcNG4fiEwRs\n+P4Uq0aUishdJbKvqYE+0bNzmZYAVNDCXl+LsJSU03qgQ86oWpyB8E4jKdmDvW5C\nITXGL3JBspC95HLFnaF5l+UzVyMbGxCmtSGgyM9pZGC5qdQ24B+vVQa7tXmczHoB\nDYGYvYqV+Z94O2RfnPJGx3+m9wKBgQDbhxJ0Ej4dLyr8a/kUJ366f0gnN1PDDrkG\n63PQOGu/I3I+e0EcI+TuZFVBsEbB0RXLW9fgt1+gDv1f4pZVV7ou9nuOFJasDFFO\nkz1XEip6EoxAzpBzvv34U40RrcZ8tAAy1ydocGgTk0TP1xGHTO803yTet/My+Np6\niV3CBEFwJwKBgQDQ2Ig7WDEtH79orZyxoIGziT25F6s++NzCEEr2d0+T1smT0ird\nNMH8oq9wJk3bNSWuYFNaUEgHA6gBFy/9eSAIEEAKyQsRnyLR7l0N5+SVms3lBFNp\nik/tziBE5R2UMrrWRW9E+Fp2Ti/jXtUu/DXnF/6e964Z6y16QCQCrDu3DQKBgF8z\ne3A0vRUg8G5ZUMJJwm6UZjEDkGKlzt3OXAIvhaJ1d8Ta5MiUVGKBxmtfS8AfsWjo\nYn1EaMbb2Uus0u8dxVM6dyiNiy3/hX8i4VYSPbOEuagdLI3VhQQdD69cAhjwYqmp\nnqBvJuNeWVgc97AKUC5Imw+vDFvNicncKnnKKKq/AoGBAK10VpFz7cByGvMSN9st\nhqEbTXqH+IhfxRDzERmmsvTIjOvZflv7xIW/NJf62zkb67bjHGjWpDawcw0lHa3D\nr7RB7WeKs06ACufhO4qrskxCNBLqASh+T5zxT3ZD09pIotDrkQfJybh34bWUMXdB\n2ZNlmGxqXIRPChfhTW9lDjcv\nAIzaSyBtq7Z6qqaVmb22d3aNcwNiqkrbGtIhJ7g\n",
  client_email: "firebase-adminsdk-fbsvc@mat1-9e6b3.iam.gserviceaccount.com",
  client_id: "101330162184304566760",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mat1-9e6b3.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

// Database secret key
const dbSecret = "0MpRyYXn67xayFt4C8uNcXMII2IJWlXISzbwDQ3C";

// Check if Firebase Admin is already initialized
let firebaseApp: admin.app.App = null as unknown as admin.app.App;
try {
  if (!admin.apps.length) {
    // Initialize with the service account info
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
        // Database secret key for additional security
        databaseAuthVariableOverride: {
          secret: dbSecret,
        },
      });
      console.log("Firebase Admin SDK initialized with service account");
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);

      // Fallback to environment variables if direct initialization fails
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          const serviceAccountEnv = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountEnv as admin.ServiceAccount),
            databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
            databaseAuthVariableOverride: {
              secret: dbSecret,
            },
          });
          console.log("Firebase Admin SDK initialized with service account from environment");
        } catch (envError) {
          console.error("Error parsing service account from environment:", envError);
          if (isServerless) {
            // In serverless, try to use the default credentials
            firebaseApp = admin.initializeApp({
              credential: admin.credential.applicationDefault(),
              databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
            });
            console.log("Firebase Admin SDK initialized with application default credentials");
          } else {
            // In development, initialize with a project ID at minimum
            firebaseApp = admin.initializeApp({
              projectId: "mat1-9e6b3",
              databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
            });
            console.log("Firebase Admin SDK initialized with project ID only");
          }
        }
      } else if (isServerless) {
        // In serverless, use application default credentials
        firebaseApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
        });
        console.log("Firebase Admin SDK initialized with application default credentials");
      } else {
        // In development, initialize with a project ID at minimum
        firebaseApp = admin.initializeApp({
          projectId: "mat1-9e6b3",
          databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
        });
        console.log("Firebase Admin SDK initialized with project ID only");
      }
    }
  } else {
    firebaseApp = admin.app();
    console.log("Using existing Firebase Admin SDK app");
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error("Firebase Admin SDK initialization failed:", errorMessage);
}

// Get Firebase Admin services
const db = admin.firestore(firebaseApp);
const auth = admin.auth(firebaseApp);
const storage = admin.storage(firebaseApp);
const rtdb = admin.database(firebaseApp);

// Import inventory items to Firestore with proper typing
const importInventoryItems = async (
  items: any[]
): Promise<{ success: boolean; count: number; message: string; chunkResults: number[] }> => {
  try {
    console.log(`Importing ${items.length} inventory items to Firestore...`);

    // Process items in smaller chunks to avoid Firestore batch limits
    const chunkSize = 20;
    const results: number[] = [];

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

// Get inventory item by ID with proper typing
const getInventoryItemById = async (id: string) => {
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

// Update inventory item with proper typing
const updateInventoryItem = async (id: string, data: Record<string, any>) => {
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

// Delete inventory item with proper typing
const deleteInventoryItem = async (id: string) => {
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

// Export Firebase Admin services and utility functions
export {
  admin,
  auth,
  db,
  deleteInventoryItem,
  firebaseApp,
  getAllInventoryItems,
  getInventoryItemById,
  importInventoryItems,
  rtdb,
  storage,
  updateInventoryItem,
};
