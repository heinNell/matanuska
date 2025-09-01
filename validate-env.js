#!/usr/bin/env node
/* eslint-env node */

// Console styling for better output
const styles = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Required environment variables for Matanuska platform
const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_GOOGLE_MAPS_API_KEY",
  "VITE_WIALON_TOKEN",
];

function checkEnvVariables() {
  const variables = [];
  const missingVariables = [];

  requiredEnvVars.forEach((varName) => {
    const value = process.env[varName];
    const exists = !!value;

    if (!exists) {
      missingVariables.push(varName);
    }

    variables.push({
      name: varName,
      exists,
      preview: exists ? `${value.substring(0, 8)}...` : "Not set",
    });
  });

  return { variables, missingVariables };
}

const isVercel = !!process.env.VERCEL;
const isNetlify = !!process.env.NETLIFY;
const platform = isVercel ? "Vercel" : isNetlify ? "Netlify" : "local";

console.log(`${styles.blue}${styles.bold}Matanuska Environment Validation${styles.reset}`);
console.log(`Running for ${process.env.NODE_ENV || "current"} environment on ${platform}...`);

const { variables, missingVariables } = checkEnvVariables();

// Format output
console.log("\nEnvironment Variables:");
console.log("---------------------");
variables.forEach((v) => {
  const status = v.exists ? `${styles.green}✓${styles.reset}` : `${styles.red}✗${styles.reset}`;
  console.log(`${status} ${v.name}: ${v.preview}`);
});

// Show summary
console.log("\nSummary:");
console.log("--------");
if (missingVariables.length === 0) {
  console.log(`${styles.green}✓ All required environment variables are set${styles.reset}`);
} else {
  console.log(
    `${styles.red}✗ Missing ${missingVariables.length} required variables:${styles.reset}`
  );
  missingVariables.forEach((varName) => {
    console.log(`  - ${varName}`);
  });
  process.exit(1);
}
