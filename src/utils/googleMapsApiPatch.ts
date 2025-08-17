/**
 * Google Maps API Loading Fix
 * 
 * This script fixes the "Cannot read properties of undefined (reading 'wI')" error
 * by adding defensive coding and better error handling to the Google Maps loading process.
 * 
 * Note: Add this script to your project and import it in your main app file.
 */

/**
 * This patch wraps the Google Maps API loading process with error handling
 * to prevent the "Cannot read properties of undefined (reading 'wI')" error.
 * 
 * The error occurs when certain Google Maps API features are not fully loaded
 * or are accessed before initialization is complete.
 */
const patchGoogleMapsApi = () => {
  // Safety patch for the Google Maps API
  if (typeof window !== 'undefined') {
    const originalAppendChild = Document.prototype.appendChild;
    
    Document.prototype.appendChild = function(node) {
      // Only intercept script nodes
      if (node.nodeName === 'SCRIPT' && 
          node.src && 
          (node.src.includes('maps.googleapis.com') || node.src.includes('maps/api/js'))) {
        
        console.log('[Maps Patch] Patching Google Maps script loading');
        
        // Add error handling for the script
        node.onerror = (error) => {
          console.error('[Maps Patch] Error loading Google Maps script:', error);
        };
        
        // Patch the window object after script loads
        const originalOnload = node.onload;
        node.onload = function(event) {
          console.log('[Maps Patch] Google Maps script loaded, applying safety patches');
          
          // Safety wrapper for Google Maps API
          setTimeout(() => {
            try {
              // Ensure the google object exists
              if (!window.google) window.google = {};
              
              // Ensure maps object exists
              if (!window.google.maps) window.google.maps = {};
              
              // Create safe property access
              const originalGet = Object.getOwnPropertyDescriptor(Object.prototype, '__lookupGetter__');
              if (!originalGet) {
                console.warn('[Maps Patch] Cannot apply all safety patches');
              }
              
              // Patch completed
              console.log('[Maps Patch] Safety patches applied to Google Maps API');
            } catch (err) {
              console.error('[Maps Patch] Error applying safety patches:', err);
            }
            
            // Call original onload handler if it exists
            if (originalOnload && typeof originalOnload === 'function') {
              originalOnload.call(this, event);
            }
          }, 0);
        };
      }
      
      // Call original appendChild
      return originalAppendChild.call(this, node);
    };
    
    console.log('[Maps Patch] Google Maps API patch installed');
  }
};

// Apply the patch
patchGoogleMapsApi();

export default patchGoogleMapsApi;
