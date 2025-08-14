import { FirebaseOptions, getApps, initializeApp } from "firebase/app";

// Development configuration - only used in development mode
const devConfig: FirebaseOptions = {
  apiKey: "AIzaSyBtq7Z6qqaVmb22d3aNcwNiqkrbGtIhJ7g",
  authDomain: "mat1-9e6b3.firebaseapp.com",
  databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
  projectId: "mat1-9e6b3",
  storageBucket: "mat1-9e6b3.appspot.com",
  messagingSenderId: "250085264089",
  appId: "1:250085264089:web:51c2b209e0265e7d04ccc8",
  measurementId: "G-YHQHSJN5CQ",
};

// Get Firebase configuration based on environment
const getFirebaseConfig = (): FirebaseOptions => {
  // In development, we can use the dev config or env vars if present
  if (import.meta.env.DEV) {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || devConfig.apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || devConfig.authDomain,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || devConfig.databaseURL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || devConfig.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || devConfig.storageBucket,
      messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || devConfig.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || devConfig.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || devConfig.measurementId,
    };

    console.log("Using development Firebase configuration");
    return config;
  }

  // In production, strictly require environment variables with no fallbacks
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  return config;
};

// Get the appropriate config based on environment
export const firebaseConfig = getFirebaseConfig();

// Validate the configuration
const validateConfig = () => {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
  );

  if (missingFields.length > 0) {
    if (import.meta.env.DEV) {
      console.warn("⚠️ Missing Firebase configuration fields:", missingFields.join(", "));
      return true; // Continue in development even with missing fields
    } else {
      // In production, throw an error for missing configuration
      const errorMessage = `Firebase initialization failed. Missing required configuration: ${missingFields.join(", ")}`;
      console.error(errorMessage);
      // We'll log the error but not throw to prevent app crash
      console.error(
        "Ensure all Firebase environment variables are set in your production environment"
      );
      return false;
    }
  }
  return true;
};

validateConfig();

// Initialize Firebase with the appropriate configuration - only if not already initialized
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export default firebaseApp;
