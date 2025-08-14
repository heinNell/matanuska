// Mobile Firebase Configuration for mat1-9e6b3 project
export const mobileFirebaseConfig = {
  projectId: "mat1-9e6b3",
  appId: "1:250085264089:android:eddb5bd08de0b1b604ccc8",
  storageBucket: "mat1-9e6b3.firebasestorage.app",
  apiKey: "AIzaSyDNk9iW1PTGM9hvcjJ0utBABs7ZiWCj3Xc",
  authDomain: "mat1-9e6b3.firebaseapp.com",
  databaseURL: "https://mat1-9e6b3-default-rtdb.firebaseio.com",
  messagingSenderId: "250085264089",
  measurementId: "G-XXXXXXXXXX" // Add your measurement ID if using Analytics
};

// Mobile app package configuration
export const mobileAppConfig = {
  packageName: "matmobile.com",
  appName: "MatMobile Fleet Management",
  version: "1.0.0",
  permissions: [
    "android.permission.CAMERA",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE"
  ]
};

// QR Code configuration for mobile linking
export const qrCodeConfig = {
  baseUrl: "https://mat1-9e6b3.web.app", // Your Firebase Hosting URL
  deepLinkScheme: "matmobile://",
  inspectionPath: "/mobile/inspection",
  workshopPath: "/mobile/workshop"
};

// Offline configuration for mobile
export const offlineConfig = {
  enablePersistence: true,
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
  synchronizeTabs: false // Mobile doesn't need tab sync
};
