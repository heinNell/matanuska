const fs = require('fs');
const path = require('path');

const routesFile = path.join(__dirname, 'src', 'App.tsx'); // Of AppRoutes.tsx
const content = fs.readFileSync(routesFile, 'utf-8');

// Verbeterde regex om <Route ... element={<Component />} /> selfs oor meerdere lyne te kry
const routeRegex = /<Route\s+[^>]*path=["'`]([^"'`]+)["''][^>]*element=\{<([A-Za-z0-9_]+)[^>]*>\}/gms;
let match;
console.log('\n=== ROUTE to COMPONENT MAP ===');
let found = false;
while ((match = routeRegex.exec(content)) !== null) {
  console.log(`  /${match[1]}  ➔  ${match[2]}`);
  found = true;
}
if (!found) {
  console.log('  (Geen <Route path=... element={<... />} /> entries gevind nie!)');
}
