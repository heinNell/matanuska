/**
 * CommonJS version of the environment checker utility for use in Node.js scripts
 */

// Store environment variables
const env = process.env;

/**
 * Check if a specific environment variable exists and is not empty
 * @param {string} name - Name of the environment variable to check
 * @returns {Object} Object with existence status and a safe preview of the value
 */
function checkEnvVariable(name) {
  const value = env[name];
  const exists = !!value && value.length > 0;
  
  // Create a safe preview (first 4 chars + length info for sensitive values)
  let preview = 'undefined';
  
  if (value) {
    if (name.includes('KEY') || name.includes('SECRET') || name.includes('PASSWORD') || name.includes('TOKEN')) {
      // Handle sensitive values
      preview = value.length > 0 
        ? `${value.substring(0, 4)}... (${value.length} chars)`
        : '(empty string)';
    } else {
      // Non-sensitive values
      preview = value.length > 50 ? `${value.substring(0, 47)}...` : value;
    }
  }
  
  return { name, exists, preview, value };
}

/**
 * Check all important environment variables for the application
 * @returns {Object} Object with check results for specific and all variables
 */
function checkEnvVariables() {
  // Define critical environment variables
  const criticalVars = [
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_GOOGLE_MAPS_IFRAME_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  // Check each critical variable
  const variables = criticalVars.map(name => {
    const check = checkEnvVariable(name);
    return {
      name,
      exists: check.exists,
      preview: check.preview,
    };
  });

  // Get all available environment variables
  const allVariables = Object.keys(env).filter(key => 
    key.startsWith('VITE_') || !key.includes('_')
  );

  // Find missing critical variables
  const missingVariables = variables
    .filter(v => !v.exists)
    .map(v => v.name);

  return {
    variables,
    allVariables,
    missingVariables,
  };
}

/**
 * Displays environment status in the console in a developer-friendly way
 */
function displayEnvironmentStatus() {
  const { variables, missingVariables } = checkEnvVariables();
  
  const styles = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  };
  
  console.group(`${styles.cyan}${styles.bold}🌍 Environment Setup Status${styles.reset}`);
  
  if (missingVariables.length === 0) {
    console.log(`${styles.green}✅ Environment is properly configured!${styles.reset}`);
  } else {
    console.log(`${styles.red}❌ Environment configuration issues detected${styles.reset}`);
    
    console.group(`${styles.red}Missing Environment Variables:${styles.reset}`);
    missingVariables.forEach(variable => {
      console.log(`🔴 ${variable}`);
    });
    console.groupEnd();
    
    console.log(`\n${styles.yellow}⚠️ Please run:${styles.reset} npm run setup:env`);
    console.log(`${styles.yellow}⚠️ Or manually copy .env.example to .env and fill in values${styles.reset}`);
  }
  
  console.groupEnd();
}

module.exports = {
  checkEnvVariable,
  checkEnvVariables,
  displayEnvironmentStatus
};
