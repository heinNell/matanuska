#!/usr/bin/env node
// sidebar-component-mapper.js
// This script validates and generates a mapping between sidebar entries and actual component files

const fs = require("fs");
const path = require("path");
const { parse } = require("@typescript-eslint/typescript-estree");

const rootDir = path.resolve(__dirname);
const sidebarPath = path.join(rootDir, "src/components/layout/Sidebar.tsx");
const appPath = path.join(rootDir, "src/App.tsx");
const pagesDir = path.join(rootDir, "src/pages");

console.log("Matanuska Transport Platform - Sidebar Component Mapper");
console.log("====================================================");

// Read sidebar content
const sidebarContent = fs.readFileSync(sidebarPath, "utf8");
const appContent = fs.readFileSync(appPath, "utf8");

// Extract route information from sidebar
function extractSidebarRoutes() {
  const routes = [];
  // Simple regex approach - for production use an AST parser
  const routeRegex =
    /id:\s*["']([^"']+)["'],\s*label:\s*["']([^"']+)["'],(?:(?!route).)*route:\s*["']([^"']+)["']/gs;

  let match;
  while ((match = routeRegex.exec(sidebarContent)) !== null) {
    routes.push({
      id: match[1],
      label: match[2],
      route: match[3],
    });
  }

  return routes;
}

// Extract route information from App.tsx
function extractAppRoutes() {
  const routes = [];
  // Simple regex approach - for production use an AST parser
  const routeRegex =
    /<Route\s+path=["']([^"']+)["']\s+element={(?:<React\.Suspense[^>]*>)?<([^>\/]+)/g;

  let match;
  while ((match = routeRegex.exec(appContent)) !== null) {
    routes.push({
      path: match[1],
      component: match[2].trim(),
    });
  }

  return routes;
}

// Find potential component files for a given route
function findComponentsForRoute(route) {
  // Convert route to potential file paths
  const routeParts = route.split("/");
  const routeName = routeParts[routeParts.length - 1];

  const possibleNames = [
    // CamelCase with Page suffix
    `${routeName.charAt(0).toUpperCase()}${routeName.slice(1)}Page`,
    // CamelCase without Page suffix
    `${routeName.charAt(0).toUpperCase()}${routeName.slice(1)}`,
    // Full path conversion
    routeParts.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(""),
  ];

  const extensions = [".tsx", ".jsx", ".js"];
  const results = [];

  // Check for files directly in pages dir
  possibleNames.forEach((name) => {
    extensions.forEach((ext) => {
      const filePath = path.join(pagesDir, `${name}${ext}`);
      if (fs.existsSync(filePath)) {
        results.push({
          route,
          component: name,
          path: filePath,
          relative: path.relative(rootDir, filePath),
        });
      }
    });
  });

  // Check for files in subdirectories
  if (routeParts.length > 1) {
    const subDir = routeParts[0];
    const subDirPath = path.join(pagesDir, subDir);

    if (fs.existsSync(subDirPath) && fs.statSync(subDirPath).isDirectory()) {
      possibleNames.forEach((name) => {
        extensions.forEach((ext) => {
          const filePath = path.join(subDirPath, `${name}${ext}`);
          if (fs.existsSync(filePath)) {
            results.push({
              route,
              component: name,
              path: filePath,
              relative: path.relative(rootDir, filePath),
            });
          }
        });
      });
    }
  }

  return results;
}

// Generate a mapping report
function generateMappingReport() {
  console.log("\n🔍 Extracting routes from Sidebar.tsx...");
  const sidebarRoutes = extractSidebarRoutes();
  console.log(`Found ${sidebarRoutes.length} routes in sidebar`);

  console.log("\n🔍 Extracting routes from App.tsx...");
  const appRoutes = extractAppRoutes();
  console.log(`Found ${appRoutes.length} routes in App.tsx`);

  console.log("\n🔍 Finding component files for routes...");
  const mappingResults = {
    mapped: [],
    unmapped: [],
  };

  sidebarRoutes.forEach((sidebarRoute) => {
    const components = findComponentsForRoute(sidebarRoute.route);

    if (components.length > 0) {
      mappingResults.mapped.push({
        sidebarRoute,
        components,
      });
    } else {
      mappingResults.unmapped.push(sidebarRoute);
    }
  });

  console.log(`✅ Found components for ${mappingResults.mapped.length} sidebar routes`);
  console.log(`❌ Missing components for ${mappingResults.unmapped.length} sidebar routes`);

  console.log("\n📊 Route Mapping Analysis:");
  console.log("========================");

  // Check for sidebar routes not in App.tsx
  const appRoutePaths = new Set(appRoutes.map((r) => r.path.replace(/^\//, "")));
  const sidebarNotInApp = sidebarRoutes.filter((sr) => !appRoutePaths.has(sr.route));

  console.log(`Routes in sidebar but not in App.tsx: ${sidebarNotInApp.length}`);

  // Detailed reports
  if (mappingResults.unmapped.length > 0) {
    console.log("\n❌ Unmapped Routes (no component files found):");
    mappingResults.unmapped.forEach((route) => {
      console.log(`  - ${route.id} (${route.route}): "${route.label}"`);
    });
  }

  if (sidebarNotInApp.length > 0) {
    console.log("\n⚠️ Routes in sidebar but missing from App.tsx:");
    sidebarNotInApp.forEach((route) => {
      console.log(`  - ${route.id} (${route.route}): "${route.label}"`);
    });
  }

  // Generate JSON report file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSidebarRoutes: sidebarRoutes.length,
      totalAppRoutes: appRoutes.length,
      mappedRoutes: mappingResults.mapped.length,
      unmappedRoutes: mappingResults.unmapped.length,
      sidebarRoutesNotInApp: sidebarNotInApp.length,
    },
    mappedRoutes: mappingResults.mapped.map((item) => ({
      id: item.sidebarRoute.id,
      label: item.sidebarRoute.label,
      route: item.sidebarRoute.route,
      components: item.components.map((c) => c.relative),
    })),
    unmappedRoutes: mappingResults.unmapped,
    sidebarRoutesNotInApp: sidebarNotInApp,
  };

  fs.writeFileSync("sidebar-component-mapping.json", JSON.stringify(report, null, 2));
  console.log("\n✅ Report saved to sidebar-component-mapping.json");
}

// Run the report generator
generateMappingReport();
