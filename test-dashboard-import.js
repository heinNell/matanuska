// Test file to verify Dashboard component import
import('./src/pages/Dashboard.tsx')
  .then((module) => {
    console.log('Successfully imported Dashboard component!', module);
    document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif; color: green; font-size: 24px;">Dashboard component imported successfully!</div>';
  })
  .catch((error) => {
    console.error('Failed to import Dashboard component:', error);
    document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif; color: red; font-size: 24px;">Error importing Dashboard component: ' + error.message + '</div>';
  });
