// Moved to scripts/legacy/validate-env.js. See scripts/legacy/README.md for details.
throw new Error('This file has been moved to scripts/legacy/validate-env.js. See scripts/legacy/README.md for details.');

// Detect deployment platform
const isVercel = !!process.env.VERCEL;
const isNetlify = !!process.env.NETLIFY;
const platform = isVercel ? 'Vercel' : isNetlify ? 'Netlify' : 'local';

console.log(`Running environment validation for ${process.env.NODE_ENV || 'current'} environment on ${platform}...`);

const { variables, missingVariables } = checkEnvVariables();

// Format output
console.log('\nEnvironment Variables:');
console.log('---------------------');
variables.forEach(v => {
  const status = v.exists 
    ? `${styles.green}✓${styles.reset}` 
    : `${styles.red}✗${styles.reset}`;
  console.log(`${status} ${v.name}: ${v.preview}`);
});

// Status summary
console.log('\nStatus Summary:');
console.log('---------------');
if (missingVariables.length === 0) {
  console.log(`${styles.green}✓ All required environment variables are set${styles.reset}`);
  console.log(`${styles.green}✓ Environment is properly configured${styles.reset}`);
  process.exit(0);
} else {
  console.log(`${styles.red}✗ Missing ${missingVariables.length} required environment variables${styles.reset}`);
  console.log(`${styles.red}✗ Environment is not properly configured${styles.reset}`);
  
  console.log('\nMissing Variables:');
  console.log('-----------------');
  missingVariables.forEach(v => {
    console.log(`${styles.red}✗ ${v}${styles.reset}`);
  });
  
  console.log('\nNext Steps:');
  console.log('-----------');
  console.log('1. Add missing variables to your environment');
  console.log('2. For local development, copy .env.example to .env and fill in values');
  
  // Platform-specific instructions
  if (process.env.VERCEL) {
    console.log('3. For Vercel deployment, add environment variables in the Vercel dashboard');
    console.log('   See VERCEL_DEPLOYMENT.md for details');
  } else if (process.env.NETLIFY) {
    console.log('3. For Netlify deployment, add environment variables in the Netlify dashboard');
  } else {
    console.log('3. For CI/CD, set environment variables in your pipeline configuration');
  }
  
  // Exit with error code to fail builds/deployments with missing vars
  process.exit(1);
}

/**
 * Validate environment variables specifically for Vercel deployment
 * This function can be called from the vercel-deploy.js script
 */
function validateVercelEnvironment() {
  const { variables, missingVariables } = checkEnvVariables();
  
  // Display platform-specific message
  console.log(`${styles.blue}${styles.bold}Vercel Environment Validation${styles.reset}`);
  
  if (missingVariables.length === 0) {
    console.log(`${styles.green}✓ All required environment variables for Vercel deployment are set${styles.reset}`);
    return true;
  } else {
    console.log(`${styles.red}✗ Missing ${missingVariables.length} required environment variables for Vercel${styles.reset}`);
    
    missingVariables.forEach(v => {
      console.log(`${styles.red}✗ ${v}${styles.reset}`);
    });
    
    console.log('\nPlease set these variables in the Vercel dashboard');
    console.log('See VERCEL_DEPLOYMENT.md for instructions');
    return false;
  }
}

// Export functions for use in other scripts
export { validateVercelEnvironment };
