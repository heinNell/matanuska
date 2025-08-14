/**
 * This script tests the navigation to the vehicle inspection page
 */
const path = require('path');
const fs = require('fs');

// Paths to the relevant files
const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
const sidebarTsxPath = path.join(__dirname, 'src', 'components', 'layout', 'Sidebar.tsx');
const vehicleInspectionPath = path.join(__dirname, 'src', 'pages', 'workshop', 'vehicle-inspection.tsx');
const inspectionReportFormPath = path.join(__dirname, 'src', 'components', 'Workshop Management', 'InspectionReportForm.tsx');

console.log('Testing navigation to the vehicle inspection page...');

// Check if the files exist
console.log('Checking if the required files exist...');
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch {
    // Error ignored, just return false if file can't be accessed
    return false;
  }
};

const appExists = fileExists(appTsxPath);
const sidebarExists = fileExists(sidebarTsxPath);
const vehicleInspectionExists = fileExists(vehicleInspectionPath);
const inspectionReportFormExists = fileExists(inspectionReportFormPath);

console.log(`App.tsx exists: ${appExists}`);
console.log(`Sidebar.tsx exists: ${sidebarExists}`);
console.log(`vehicle-inspection.tsx exists: ${vehicleInspectionExists}`);
console.log(`InspectionReportForm.tsx exists: ${inspectionReportFormExists}`);

// Check if the route is defined in App.tsx
console.log('\nChecking if the route is defined in App.tsx...');
const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
const appRouteRegex = /path="\/workshop\/vehicle-inspection"/;
const appRouteExists = appRouteRegex.test(appTsxContent);
console.log(`Route defined in App.tsx: ${appRouteExists}`);

// Check if the component is imported in App.tsx
const appImportRegex = /import VehicleInspectionPage from ".\/pages\/workshop\/vehicle-inspection"/;
const appImportExists = appImportRegex.test(appTsxContent);
console.log(`Component imported in App.tsx: ${appImportExists}`);

// Check if the route is defined in Sidebar.tsx
console.log('\nChecking if the route is defined in Sidebar.tsx...');
const sidebarContent = fs.readFileSync(sidebarTsxPath, 'utf8');
const sidebarRouteRegex = /route: ['"]workshop\/vehicle-inspection['"]/;
const sidebarRouteExists = sidebarRouteRegex.test(sidebarContent);
console.log(`Route defined in Sidebar.tsx: ${sidebarRouteExists}`);

// Summary
console.log('\nSummary:');
if (appExists && sidebarExists && vehicleInspectionExists && inspectionReportFormExists && 
    appRouteExists && appImportExists && sidebarRouteExists) {
  console.log('✅ All components and routes are properly defined!');
  console.log('The vehicle inspection page should work correctly.');
} else {
  console.log('❌ There are issues with the navigation to the vehicle inspection page:');
  if (!appExists) console.log('- App.tsx does not exist');
  if (!sidebarExists) console.log('- Sidebar.tsx does not exist');
  if (!vehicleInspectionExists) console.log('- vehicle-inspection.tsx does not exist');
  if (!inspectionReportFormExists) console.log('- InspectionReportForm.tsx does not exist');
  if (!appRouteExists) console.log('- Route is not defined in App.tsx');
  if (!appImportExists) console.log('- Component is not imported in App.tsx');
  if (!sidebarRouteExists) console.log('- Route is not defined in Sidebar.tsx');
}
