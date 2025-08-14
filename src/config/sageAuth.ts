/**
 * Sage Authentication Configuration
 * 
 * This file contains the configuration for authenticating with the Sage API.
 * The actual values should be stored in environment variables.
 */

export const sageAuthConfig = {
  // Sage API key from environment variables
  apiKey: import.meta.env.VITE_SAGE_API_KEY || '',
  
  // Sage API endpoint from environment variables
  endpoint: import.meta.env.VITE_SAGE_API_ENDPOINT || '',
  
  // Sage company ID from environment variables
  companyId: import.meta.env.VITE_SAGE_COMPANY_ID || '',
  
  // Default environment mode
  environment: import.meta.env.VITE_SAGE_ENVIRONMENT || 'production',
  
  // OAuth2 config (if using token-based auth instead of API key)
  oauth: {
    clientId: import.meta.env.VITE_SAGE_OAUTH_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_SAGE_OAUTH_CLIENT_SECRET || '',
    redirectUri: import.meta.env.VITE_SAGE_OAUTH_REDIRECT_URI || '',
    authorizationUrl: import.meta.env.VITE_SAGE_OAUTH_AUTH_URL || '',
    tokenUrl: import.meta.env.VITE_SAGE_OAUTH_TOKEN_URL || ''
  }
};