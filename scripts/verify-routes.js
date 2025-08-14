#!/usr/bin/env node
// Route verification script
// Run with: node verify-routes.js

const fs = require('fs');
const path = require('path');

// Read the source files
const sidebarPath = path.join(__dirname, 'src', 'components', 'layout', 'Sidebar.tsx');
const appPath = path.join(__dirname, 'src', 'App.tsx');

const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
const appContent = fs.readFileSync(appPath, 'utf8');

// Extract routes from sidebar
const sidebarRoutes = [];
const routeRegex = /route:\s*['"]([^'"]+)['"]/g;
let match;

while ((match = routeRegex.exec(sidebarContent)) !== null) {
  sidebarRoutes.push(match[1]);
}

// Extract routes from App.tsx
const appRoutes = [];
const appRouteRegex = /path=["']\/([^"']+)["']/g;

while ((match = appRouteRegex.exec(appContent)) !== null) {
  appRoutes.push(match[1]);
}

// Compare routes
console.log(`Found ${sidebarRoutes.length} routes in Sidebar.tsx`);
console.log(`Found ${appRoutes.length} routes in App.tsx`);

const missingRoutes = sidebarRoutes.filter(route => !appRoutes.includes(route));
console.log(`\nRoutes in Sidebar but missing in App.tsx (${missingRoutes.length}):`);
missingRoutes.forEach(route => console.log(`- ${route}`));

// Find duplicated routes in App.tsx
const duplicates = appRoutes.filter((route, index) => appRoutes.indexOf(route) !== index);
console.log(`\nDuplicated routes in App.tsx (${duplicates.length}):`);
duplicates.forEach(route => console.log(`- ${route}`));

// Output all sidebar routes for reference
console.log('\nAll sidebar routes:');
console.log(sidebarRoutes.join('\n'));
