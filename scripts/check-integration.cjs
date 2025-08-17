#!/usr/bin/env node
/**
 * check-integration.js - Component integration check for Matanuska Transport Platform
 * CommonJS version
 */

const fs = require("fs");
const path = require("path");

// Configuration
const rootDir = path.resolve(__dirname, ".."); // scripts in ./scripts/
const srcDir = path.join(rootDir, "src");
const componentsDir = path.join(srcDir, "components");
const pagesDir = path.join(srcDir, "pages");
const appFile = path.join(srcDir, "App.tsx");
const sidebarFile = path.join(componentsDir, "layout/Sidebar.tsx");

console.log("Matanuska Transport Platform - Component Integration Check");
console.log("=======================================================");

// 1. Find routes defined in App.tsx
console.log("\n🔍 Scanning routes in App.tsx...");
const appContent = fs.readFileSync(appFile, "utf8");

// Extract routes using regex
const routePattern = /<Route\s+path=["']([^"']+)["']/g;
const definedRoutes = [];
let match;

while ((match = routePattern.exec(appContent)) !== null) {
  definedRoutes.push(match[1].replace(/^\//, ""));
}

console.log(`Found ${definedRoutes.length} routes defined in App.tsx`);

// 2. Find navigation items in Sidebar.tsx
console.log("\n🔍 Scanning navigation items in Sidebar.tsx...");
const sidebarContent = fs.readFileSync(sidebarFile, "utf8");
const routePattern2 = /route:\s*["']([^"']+)["']/g;
const sidebarRoutes = [];

while ((match = routePattern2.exec(sidebarContent)) !== null) {
  sidebarRoutes.push(match[1].replace(/^\//, ""));
}

console.log(`Found ${sidebarRoutes.length} routes in Sidebar.tsx`);

// 3. Find component files
console.log("\n🔍 Scanning component files...");

function getAllFiles(directory, fileList = []) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);

    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (filePath.endsWith(".tsx") || filePath.endsWith(".jsx")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const componentFiles = getAllFiles(componentsDir);
const pageFiles = getAllFiles(pagesDir);

console.log(`Found ${componentFiles.length} component files`);
console.log(`Found ${pageFiles.length} page files`);

// 4. Cross-check routes with component files
console.log("\n🔄 Cross-checking routes with components...");

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function routeToFilePath(route) {
  const segments = route.split("/");

  if (segments.length > 1) {
    const pageName = segments[segments.length - 1];
    const dirPath = segments.slice(0, -1).join("/");
    return [
      path.join(pagesDir, `${dirPath}/${capitalize(pageName)}Page.tsx`),
      path.join(pagesDir, `${dirPath}/${capitalize(pageName)}.tsx`),
      path.join(pagesDir, `${capitalize(pageName)}Page.tsx`),
      path.join(pagesDir, `${capitalize(pageName)}.tsx`)
    ];
  }
  return [
    path.join(pagesDir, `${capitalize(route)}Page.tsx`),
    path.join(pagesDir, `${capitalize(route)}.tsx`)
  ];
}

const missingComponents = [];
const foundComponents = [];

sidebarRoutes.forEach((route) => {
  const possiblePaths = routeToFilePath(route);
  const found = possiblePaths.some((possible) => {
    const exists = fs.existsSync(possible);
    if (exists) foundComponents.push({ route, path: possible });
    return exists;
  });
  if (!found) missingComponents.push(route);
});

console.log(`✅ Found matching components for ${foundComponents.length} routes`);
console.log(`❌ Missing components for ${missingComponents.length} routes`);

// 5. Find duplicate components
console.log("\n🔍 Checking for duplicate components...");
const componentNames = pageFiles.map((file) => path.basename(file));
const duplicateCheck = {};
const duplicates = [];

componentNames.forEach((name) => {
  const baseName = name.replace(/Page\.tsx$/, "").replace(/\.tsx$/, "");
  if (duplicateCheck[baseName]) {
    duplicateCheck[baseName].push(name);
  } else {
    duplicateCheck[baseName] = [name];
  }
});

Object.entries(duplicateCheck).forEach(([baseName, files]) => {
  if (files.length > 1) {
    duplicates.push({ baseName, files });
  }
});

console.log(`Found ${duplicates.length} potential duplicate components`);

// 6. Generate a summary report
console.log("\n📊 Integration Summary Report");
console.log("=========================");
console.log(`Total Routes in App.tsx: ${definedRoutes.length}`);
console.log(`Total Routes in Sidebar: ${sidebarRoutes.length}`);
console.log(`Routes with matching components: ${foundComponents.length}`);
console.log(`Routes missing components: ${missingComponents.length}`);
console.log(`Potential duplicate components: ${duplicates.length}`);

// Calculate Sidebar-App.tsx route coverage
const sidebarRoutesSet = new Set(sidebarRoutes);
const appRoutesSet = new Set(definedRoutes);

const inSidebarButNotInApp = sidebarRoutes.filter((route) => !appRoutesSet.has(route));
const inAppButNotInSidebar = definedRoutes.filter((route) => !sidebarRoutesSet.has(route));

console.log(`\nRoutes in Sidebar but not in App.tsx: ${inSidebarButNotInApp.length}`);
console.log(`Routes in App.tsx but not in Sidebar: ${inAppButNotInSidebar.length}`);

if (missingComponents.length > 0) {
  console.log("\n❌ Routes missing component implementations:");
  missingComponents.forEach((route) => console.log(`  - ${route}`));
}

if (duplicates.length > 0) {
  console.log("\n⚠️ Potential duplicate components:");
  duplicates.forEach(({ baseName, files }) => {
    console.log(`  - ${baseName}:`);
    files.forEach((file) => console.log(`    * ${file}`));
  });
}

if (inSidebarButNotInApp.length > 0) {
  console.log("\n⚠️ Routes in Sidebar but missing in App.tsx:");
  inSidebarButNotInApp.forEach((route) => console.log(`  - ${route}`));
}

if (inAppButNotInSidebar.length > 0) {
  console.log("\n⚠️ Routes in App.tsx but missing in Sidebar:");
  inAppButNotInSidebar.forEach((route) => console.log(`  - ${route}`));
}

console.log("\n✅ Integration check completed");
