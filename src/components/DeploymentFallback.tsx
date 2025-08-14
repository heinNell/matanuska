// Simple fallback component for debugging deployment issues
import React from 'react';

const DeploymentFallback: React.FC = () => {
  const envVars = {
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    BASE_URL: import.meta.env.BASE_URL,
    hasFirebaseConfig: !!import.meta.env.VITE_FIREBASE_API_KEY,
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🚀 Deployment Status Check
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#666' }}>Environment Variables</h2>
        <pre style={{
          backgroundColor: '#f8f8f8',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#666' }}>Page Status</h2>
        <p>✅ React is working</p>
        <p>✅ Vite build successful</p>
        <p>✅ TypeScript compilation passed</p>
        <p>{envVars.hasFirebaseConfig ? '✅' : '❌'} Firebase config available</p>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#666' }}>Next Steps</h2>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Check browser console for JavaScript errors</li>
          <li>Verify all environment variables are set in production</li>
          <li>Check network tab for failed resource loading</li>
          <li>Verify routing configuration for production deployment</li>
        </ol>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        border: '1px solid #2196f3'
      }}>
        <strong>If you see this page, the basic React app is working!</strong>
        <br />
        The blank screen issue is likely due to routing, environment variables, or lazy loading.
      </div>
    </div>
  );
};

export default DeploymentFallback;
