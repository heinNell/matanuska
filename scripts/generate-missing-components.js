// generate-missing-components.js
const fs = require('fs');
const path = require('path');

// Replace this with your actual component list from the route map
const components = [
  'DashboardPage',
  'TripManagementPage',
  'ActiveTrips',
  'CompletedTrips',
  'TripDashboard',
  'InvoiceDashboard',
  'InvoiceBuilder',
  'FuelLogs',
  'DriverBehaviorEvents',
  'VendorScorecard',
  'PurchaseOrderTracker',
  'RequestPartsPage',
  'InspectionHistoryPage',
  'FleetAnalyticsPage',
  // Add the rest...
];

// Where to place the components
const baseDir = './src/components';

components.forEach(component => {
  const folderPath = path.join(baseDir);
  const filePath = path.join(folderPath, `${component}.tsx`);

  if (!fs.existsSync(filePath)) {
    const contents = `
import React from 'react';

const ${component} = () => {
  return <div>${component} (Placeholder)</div>;
};

export default ${component};
`.trim();

    fs.writeFileSync(filePath, contents, 'utf8');
    console.log(`✅ Created: ${filePath}`);
  } else {
    console.log(`⚠️ Already exists: ${filePath}`);
  }
});