#!/usr/bin/env node
/**
 * check-integration.ts - Component integration check for Matanuska Transport Platform
 * TypeScript version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define interfaces for our data structures
interface RouteComponent {
  route: string;
  path: string;
}

interface DuplicateComponent {
  baseName: string;
  files: string[];
}

// Simple colorize function for output
function colorize(text: string, color: 'blue' | 'green' | 'yellow' | 'red' | 'cyan'): string {
  const colors = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
  };
  return colors[color] + text + colors.reset;
}

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const rootDir = path.resolve(__dirname, ".."); // scripts in ./scripts/
const srcDir = path.join(rootDir, "src");
const componentsDir = path.join(srcDir, "components");
const pagesDir = path.join(srcDir, "pages");
const appFile = path.join(srcDir, "App.tsx");
const sidebarFile = path.join(componentsDir, "layout/Sidebar.tsx");

console.log(colorize("Matanuska Transport Platform - Component Integration Check", 'green'));
console.log(colorize("=======================================================", 'green'));

// 1. Find routes defined in App.tsx
console.log(colorize("\n🔍 Scanning routes in App.tsx...", 'blue'));
const appContent = fs.readFileSync(appFile, "utf8");

// Extract routes using regex
const routePattern = /<Route\s+path=["']([^"']+)["']/g;
const definedRoutes: string[] = [];
let match: RegExpExecArray | null;

while ((match = routePattern.exec(appContent)) !== null) {
  definedRoutes.push(match[1].replace(/^\//, ""));
}

console.log(`Found ${definedRoutes.length} routes defined in App.tsx`);

// 2. Find navigation items in Sidebar.tsx
console.log(colorize("\n🔍 Scanning navigation items in Sidebar.tsx...", 'blue'));
const sidebarContent = fs.readFileSync(sidebarFile, "utf8");
const routePattern2 = /route:\s*["']([^"']+)["']/g;
const sidebarRoutes: string[] = [];

while ((match = routePattern2.exec(sidebarContent)) !== null) {
  sidebarRoutes.push(match[1].replace(/^\//, ""));
}

console.log(`Found ${sidebarRoutes.length} routes in Sidebar.tsx`);

// 3. Find component files
console.log(colorize("\n🔍 Scanning component files...", 'blue'));

function getAllFiles(directory: string, fileList: string[] = []): string[] {
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
console.log(colorize("\n🔄 Cross-checking routes with components...", 'blue'));

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function routeToFilePath(route: string): string[] {
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

const missingComponents: string[] = [];
const foundComponents: RouteComponent[] = [];

sidebarRoutes.forEach((route) => {
  const possiblePaths = routeToFilePath(route);
  const found = possiblePaths.some((possible) => {
    const exists = fs.existsSync(possible);
    if (exists) foundComponents.push({ route, path: possible });
    return exists;
  });
  if (!found) missingComponents.push(route);
});

console.log(colorize(`✅ Found matching components for ${foundComponents.length} routes`, 'green'));
console.log(colorize(`❌ Missing components for ${missingComponents.length} routes`, 'red'));

// 5. Find duplicate components
console.log(colorize("\n🔍 Checking for duplicate components...", 'blue'));
const componentNames = pageFiles.map((file) => path.basename(file));
const duplicateCheck: Record<string, string[]> = {};
const duplicates: DuplicateComponent[] = [];

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
console.log(colorize("\n📊 Integration Summary Report", 'cyan'));
console.log(colorize("=========================", 'cyan'));
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
  console.log(colorize("\n❌ Routes missing component implementations:", 'red'));
  missingComponents.forEach((route) => console.log(`  - ${route}`));
}

if (duplicates.length > 0) {
  console.log(colorize("\n⚠️ Potential duplicate components:", 'yellow'));
  duplicates.forEach(({ baseName, files }) => {
    console.log(`  - ${baseName}:`);
    files.forEach((file) => console.log(`    * ${file}`));
  });
}

if (inSidebarButNotInApp.length > 0) {
  console.log(colorize("\n⚠️ Routes in Sidebar but missing in App.tsx:", 'yellow'));
  inSidebarButNotInApp.forEach((route) => console.log(`  - ${route}`));
}

if (inAppButNotInSidebar.length > 0) {
  console.log(colorize("\n⚠️ Routes in App.tsx but missing in Sidebar:", 'yellow'));
  inAppButNotInSidebar.forEach((route) => console.log(`  - ${route}`));
}

console.log(colorize("\n✅ Integration check completed", 'green'));
