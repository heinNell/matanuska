// Production deployment debug utility
// Add this script to index.html for debugging blank screens

console.log('=== DEPLOYMENT DEBUG START ===');

// 1. Check Environment Variables
const envVars = {
  MODE: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV,
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
};

console.log('Environment Variables:', envVars);

// 2. Check Critical Missing Variables
const requiredVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_AUTH_DOMAIN'];
const missingVars = requiredVars.filter(key => !import.meta.env[key]);
if (missingVars.length > 0) {
  console.error('❌ MISSING ENVIRONMENT VARIABLES:', missingVars);
}

// 3. Check DOM
if (!document.getElementById('root')) {
  console.error('❌ ROOT ELEMENT NOT FOUND');
}

// 4. Check Module Loading
let moduleLoadError = null;
window.addEventListener('error', (event) => {
  console.error('❌ GLOBAL ERROR:', event.error);
  if (event.filename && event.filename.includes('.js')) {
    console.error('❌ SCRIPT LOADING ERROR:', event.filename);
  }
});

// 5. Check for React
setTimeout(() => {
  if (typeof React === 'undefined') {
    console.error('❌ REACT NOT LOADED');
  }
  if (typeof ReactDOM === 'undefined') {
    console.error('❌ REACTDOM NOT LOADED');
  }
}, 1000);

console.log('=== DEPLOYMENT DEBUG END ===');
