#!/usr/bin/env node

/**
 * Environment Variable Setup Script
 * 
 * This script helps developers set up their .env file by:
 * 1. Checking if .env already exists
 * 2. Creating .env from .env.example if it doesn't exist
 * 3. Prompting for missing values
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define paths
const envExamplePath = path.join(__dirname, '.env.example');
const envPath = path.join(__dirname, '.env');

// Console styling
const styles = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Check if .env exists
console.log(`${styles.cyan}📝 Environment Variable Setup${styles.reset}`);

// Check if .env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.log(`${styles.red}❌ Error: .env.example file not found!${styles.reset}`);
  console.log('Please make sure the .env.example file exists in the project root.');
  process.exit(1);
}

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log(`${styles.yellow}⚠️ A .env file already exists.${styles.reset}`);
  
  rl.question('Do you want to overwrite it? (y/N) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      createEnvFile();
    } else {
      console.log(`${styles.green}✅ Keeping existing .env file.${styles.reset}`);
      console.log(`To manually update, edit the file at: ${envPath}`);
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  try {
    // Read the example file
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    
    // Copy the example to the .env file
    fs.writeFileSync(envPath, envExample);
    
    console.log(`${styles.green}✅ Created .env file from template.${styles.reset}`);
    console.log(`${styles.yellow}⚠️ Please edit the file and fill in all values.${styles.reset}`);
    console.log(`File location: ${envPath}`);
    
    // Highlight important variables
    console.log(`\n${styles.cyan}${styles.bold}Important variables to configure:${styles.reset}`);
    console.log(`${styles.yellow}• VITE_GOOGLE_MAPS_API_KEY${styles.reset}`);
    console.log(`${styles.yellow}• VITE_FIREBASE_API_KEY${styles.reset}`);
    console.log(`${styles.yellow}• VITE_FIREBASE_PROJECT_ID${styles.reset}`);
    
    console.log(`\n${styles.blue}See ENV_SETUP_GUIDE.md for detailed instructions.${styles.reset}`);
    
  } catch (error) {
    console.log(`${styles.red}❌ Error: Failed to create .env file:${styles.reset}`, error.message);
    console.log(`Please manually copy .env.example to .env and edit as needed.`);
  } finally {
    rl.close();
  }
}
