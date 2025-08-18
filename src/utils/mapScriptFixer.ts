/**
 * Utility to detect and fix duplicate Google Maps script tags
 *
 * This script runs automatically to detect and remove duplicate Google Maps API
 * script tags that could cause the "You have included the Google Maps JavaScript API
 * multiple times on this page" warning.
 */

/**
 * Detect and remove duplicate Google Maps script tags
 * Run this early to prevent duplicate loading
 */
export const detectAndFixDuplicateMapScripts = (): void => {
  // Wait for the DOM to be ready
  if (document.readyState !== 'loading') {
    checkForDuplicateMapScripts();
  } else {
    document.addEventListener('DOMContentLoaded', checkForDuplicateMapScripts);
  }

  // Also run on window load to catch scripts added later
  window.addEventListener('load', checkForDuplicateMapScripts);
};

/**
 * Check for duplicate Google Maps scripts and remove extras
 */
function checkForDuplicateMapScripts(): void {
  const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"], script[src*="maps/api/js"]');

  if (scripts.length <= 1) {
    return; // No duplicates
  }

  console.warn(`Found ${scripts.length} Google Maps script tags. Keeping only the first one.`);

  // Keep track of which one to keep (usually the first one)
  let keepScript = scripts[0];

  // Remove duplicates
  scripts.forEach((script, index) => {
    if (index > 0) {
      console.warn('Removing duplicate Google Maps script:', (script as HTMLScriptElement).src);
      script.parentNode?.removeChild(script);
    }
  });
}

// Run automatically
detectAndFixDuplicateMapScripts();
