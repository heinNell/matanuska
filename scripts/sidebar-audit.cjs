/**
 * Utility script to audit sidebar links against available routes in App.tsx
 * 
 * This script validates that:
 * 1. All paths in the sidebar correspond to actual routes in App.tsx
 * 2. All components referenced in routes actually exist
 */

const fs = require('fs');
const path = require('path');

try {
  // Read the App.tsx file
  const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
  const sidebarPath = path.join(__dirname, 'src', 'components', 'layout', 'Sidebar.tsx');

  if (!fs.existsSync(appTsxPath)) {
    console.error('❌ App.tsx not found at:', appTsxPath);
    process.exit(1);
  }

  if (!fs.existsSync(sidebarPath)) {
    console.error('❌ Sidebar.tsx not found at:', sidebarPath);
    process.exit(1);
  }

  const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  
  console.log('✅ Successfully read App.tsx and Sidebar.tsx files');

// Extract routes from App.tsx
function extractRoutes(content) {
  const routes = [];
  const routeRegex = /<Route\s+path="([^"]+)"\s+element={(.+?)}/g;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({
      path: match[1],
      element: match[2].trim()
    });
  }

  return routes;
}

// Extract sidebar paths - looking for route: property
function extractSidebarPaths(content) {
  const paths = [];
  // Pattern for route property in Sidebar.tsx
  const routeRegex = /route:\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    paths.push(match[1]);
  }

  return paths;
}

// Extract components from App.tsx imports
function extractComponents(content) {
  const components = [];
  const importRegex = /import\s+(\w+)(?:\s*,\s*\{\s*([^}]+)\})?\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    // Default import
    if (match[1] && match[1] !== '{') {
      components.push(match[1]);
    }
    
    // Named imports
    if (match[2]) {
      const namedImports = match[2].split(',').map(imp => imp.trim());
      components.push(...namedImports);
    }
  }

  // Also extract lazy loaded components
  const lazyRegex = /const\s+(\w+)\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g;
  while ((match = lazyRegex.exec(content)) !== null) {
    components.push(match[1]);
  }

  return components;
}

const routes = extractRoutes(appTsxContent);
const sidebarPaths = extractSidebarPaths(sidebarContent);
const components = extractComponents(appTsxContent);

console.log('📊 Sidebar Link Audit Results:');
console.log('===============================\n');

console.log(`🔍 Found ${routes.length} routes in App.tsx`);
console.log(`🔍 Found ${sidebarPaths.length} paths in Sidebar.tsx`);
console.log(`🔍 Found ${components.length} components imported in App.tsx\n`);

// Check sidebar paths against routes - simplified approach
const missingRoutes = [];

sidebarPaths.forEach(sidebarPath => {
  // Normalize path for comparison (remove query parameters)
  const normalizedPath = sidebarPath.split('?')[0];
  let found = false;
  
  // Check for exact match
  for (const route of routes) {
    // Direct match
    if (route.path === normalizedPath) {
      found = true;
      break;
    }
    
    // Check if this is a nested route under a parent route
    if (normalizedPath.includes('/')) {
      const segments = normalizedPath.split('/');
      const parentPath = segments[0];
      
      // Check if parent route exists
      if (route.path === parentPath) {
        found = true;
        break;
      }
      
      // Check for wildcard routes
      if (route.path.includes('*')) {
        const wildcardBase = route.path.replace('/*', '');
        if (normalizedPath.startsWith(wildcardBase)) {
          found = true;
          break;
        }
      }
    }
  }
  
  if (!found) {
    missingRoutes.push(sidebarPath);
  }
});

// Check for components referenced in routes that don't exist
const missingComponents = [];
routes.forEach(route => {
  // Extract component name from element
  const componentMatch = /<(\w+)/.exec(route.element);
  if (componentMatch && componentMatch[1] !== 'div' && componentMatch[1] !== 'Navigate') {
    const componentName = componentMatch[1];
    if (!components.includes(componentName)) {
      missingComponents.push({
        path: route.path,
        component: componentName
      });
    }
  }
});

// Report findings
if (missingRoutes.length > 0) {
  console.log('⚠️ Sidebar paths without corresponding routes:');
  missingRoutes.forEach(path => {
    console.log(`   - ${path}`);
  });
  console.log();
}

if (missingComponents.length > 0) {
  console.log('❌ Missing components referenced in routes:');
  missingComponents.forEach(item => {
    console.log(`   - Path: ${item.path} | Component: ${item.component}`);
  });
  console.log();
}

if (missingRoutes.length === 0 && missingComponents.length === 0) {
  console.log('✅ All sidebar links are properly connected to routes!');
  console.log('✅ All route components are properly imported!');
}

console.log('\nDone!');
} catch (error) {
  console.error('❌ Error running audit:', error);
}
