/**
 * Environment Variable Setup and Validation Utility
 * 
 * This utility provides comprehensive validation of environment variables
 * and displays helpful messages to help developers set up their environment.
 */
import { checkEnvVariables, verifyGoogleMapsConfig } from './envChecker';

// Re-export the checkEnvVariables function for use by other modules
export { checkEnvVariables };

// Define interface for environment status
interface EnvStatus {
  isValid: boolean;
  missingVars: string[];
  criticalIssues: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Validates environment variables and provides detailed feedback
 * @returns Environment status object with validation results
 */
export function validateEnvironment(): EnvStatus {
  const { variables, missingVariables } = checkEnvVariables();
  const googleMapsConfigValid = verifyGoogleMapsConfig();
  
  const status: EnvStatus = {
    isValid: missingVariables.length === 0,
    missingVars: missingVariables,
    criticalIssues: [],
    warnings: [],
    suggestions: [],
  };

  // Check Firebase configuration
  const firebaseVars = variables.filter(v => v.name.includes('FIREBASE_'));
  const missingFirebaseVars = firebaseVars.filter(v => !v.exists);
  
  if (missingFirebaseVars.length > 0) {
    status.criticalIssues.push(`Missing Firebase configuration: ${missingFirebaseVars.map(v => v.name).join(', ')}`);
    status.suggestions.push('Add Firebase configuration to your .env file. See .env.example for reference.');
  }

  // Check Google Maps configuration
  if (!googleMapsConfigValid) {
    status.criticalIssues.push('Google Maps configuration is invalid or incomplete.');
    status.suggestions.push('Ensure VITE_GOOGLE_MAPS_API_KEY and VITE_GOOGLE_MAPS_IFRAME_URL are properly set in your .env file.');
  }

  // Add specific warnings for common issues
  if (!status.missingVars.includes('VITE_ENV_MODE')) {
    status.warnings.push('VITE_ENV_MODE not set. Defaulting to "development".');
  }

  return status;
}

/**
 * Displays environment status in the console in a developer-friendly way
 */
export function displayEnvironmentStatus(): void {
  const status = validateEnvironment();
  
  // Use fancy console styling for better visibility
  console.group('%c🌍 Environment Setup Status', 'font-weight: bold; font-size: 14px; color: #3498db;');
  
  if (status.isValid && status.criticalIssues.length === 0) {
    console.log('%c✅ Environment is properly configured!', 'color: green; font-weight: bold;');
  } else {
    console.log('%c❌ Environment configuration issues detected', 'color: red; font-weight: bold;');
  }
  
  // Display missing variables
  if (status.missingVars.length > 0) {
    console.group('%c Missing Environment Variables:', 'color: #e74c3c;');
    status.missingVars.forEach(variable => {
      console.log(`🔴 ${variable}`);
    });
    console.groupEnd();
  }
  
  // Display critical issues
  if (status.criticalIssues.length > 0) {
    console.group('%c Critical Issues:', 'color: #e74c3c;');
    status.criticalIssues.forEach(issue => {
      console.log(`⚠️ ${issue}`);
    });
    console.groupEnd();
  }
  
  // Display warnings
  if (status.warnings.length > 0) {
    console.group('%c Warnings:', 'color: #f39c12;');
    status.warnings.forEach(warning => {
      console.log(`⚠️ ${warning}`);
    });
    console.groupEnd();
  }
  
  // Display suggestions
  if (status.suggestions.length > 0) {
    console.group('%c Suggestions:', 'color: #2980b9;');
    status.suggestions.forEach(suggestion => {
      console.log(`💡 ${suggestion}`);
    });
    console.groupEnd();
  }
  
  console.log('%c📝 Check the .env.example file for all required variables.', 'color: #7f8c8d;');
  console.groupEnd();
}

/**
 * Creates a React-friendly version of the environment status 
 * for display in UI components
 * @returns Object with formatted status information for React components
 */
export function getEnvironmentStatusForUI(): {
  valid: boolean;
  summary: string;
  missingVars: string[];
  criticalIssues: string[];
  suggestions: string[];
} {
  const status = validateEnvironment();
  
  return {
    valid: status.isValid && status.criticalIssues.length === 0,
    summary: status.isValid && status.criticalIssues.length === 0
      ? 'Environment is properly configured'
      : `${status.missingVars.length} missing variables, ${status.criticalIssues.length} critical issues`,
    missingVars: status.missingVars,
    criticalIssues: status.criticalIssues,
    suggestions: status.suggestions,
  };
}

/**
 * Validates environment and throws error if critical configuration is missing
 * Use this in components that absolutely require certain environment variables
 * @param requiredVars - Array of environment variable names that are required
 * @throws Error if any required variables are missing
 */
export function requireEnvironmentVariables(requiredVars: string[]): void {
  const { variables } = checkEnvVariables();
  const missingRequired = requiredVars.filter(name => {
    const variable = variables.find(v => v.name === name);
    return !variable || !variable.exists;
  });
  
  if (missingRequired.length > 0) {
    throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
  }
}
