/**
 * Cloud Run Endpoints Configuration
 * 
 * This file provides access to Cloud Run endpoints for the frontend.
 * It makes the endpoints available throughout the application in a centralized way.
 */

// Primary Cloud Run endpoint
export const MAPS_SERVICE_URL = import.meta.env.VITE_MAPS_SERVICE_URL || 'https://maps-250085264089.africa-south1.run.app';

// Alternative Cloud Run endpoints
export const CLOUD_RUN_ENDPOINTS = {
  primary: import.meta.env.VITE_CLOUD_RUN_URL || 'https://maps-250085264089.africa-south1.run.app',
  alternative: import.meta.env.VITE_CLOUD_RUN_URL_ALTERNATIVE || 'https://maps-3ongv2xd5a-bq.a.run.app'
};

// Helper function to get the best available endpoint
export const getBestCloudRunEndpoint = () => {
  return CLOUD_RUN_ENDPOINTS.primary || CLOUD_RUN_ENDPOINTS.alternative;
};

// Export all endpoints for visibility in the UI if needed
export const getAllCloudRunEndpoints = () => {
  return Object.values(CLOUD_RUN_ENDPOINTS).filter(Boolean);
};
