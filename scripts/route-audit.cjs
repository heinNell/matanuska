/**
 * Utility script to audit sidebar routes against App.tsx routes
 */

const fs = require('fs');
const path = require('path');

try {
  console.log('🔍 Starting sidebar links audit...');
  
  // Read file paths
  const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
  const sidebarPath = path.join(__dirname, 'src', 'components', 'layout', 'Sidebar.tsx');

  // Verify files exist
  if (!fs.existsSync(appTsxPath)) {
    throw new Error(`App.tsx not found at: ${appTsxPath}`);
  }
  if (!fs.existsSync(sidebarPath)) {
    throw new Error(`Sidebar.tsx not found at: ${sidebarPath}`);
  }

  // Read file contents
  console.log('📖 Reading App.tsx and Sidebar.tsx...');
  const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

  // Extract routes from App.tsx
  console.log('🔍 Extracting routes from App.tsx...');
  const routePaths = [];
  const routeComponentMap = {};
  const routeRegex = /<Route\s+path="([^"]+)"\s+element=\{(<[^>]+>|<.*?\/\s*>)\s*\}/g;
  let match;

  while ((match = routeRegex.exec(appTsxContent)) !== null) {
    const path = match[1];
    const element = match[2];
    routePaths.push(path);
    
    // Extract component name
    const componentMatch = /<([A-Za-z0-9_]+)/.exec(element);
    if (componentMatch && componentMatch[1]) {
      routeComponentMap[path] = componentMatch[1];
    }
  }

  // Extract imported components from App.tsx
  console.log('🔍 Extracting components from App.tsx...');
  const importedComponents = new Set();
  const importRegex = /import\s+{?\s*([^}]+)}?\s+from\s+['"]/g;
  
  while ((match = importRegex.exec(appTsxContent)) !== null) {
    const imports = match[1].split(',').map(i => i.trim().split(' ')[0]);
    imports.forEach(component => importedComponents.add(component));
  }

  // Also look for lazy loaded components
  const lazyRegex = /const\s+([A-Za-z0-9_]+)\s*=\s*lazy\(/g;
  while ((match = lazyRegex.exec(appTsxContent)) !== null) {
    importedComponents.add(match[1]);
  }

  // Extract sidebar routes
  console.log('🔍 Extracting routes from Sidebar.tsx...');
  const sidebarRoutes = new Set();
  const sidebarRouteRegex = /route:\s*['"]([^'"]+)['"]/g;
  
  while ((match = sidebarRouteRegex.exec(sidebarContent)) !== null) {
    sidebarRoutes.add(match[1]);
  }

  console.log('\n📊 Audit Results:');
  console.log('==================');
  console.log(`🔹 Found ${routePaths.length} routes in App.tsx`);
  console.log(`🔹 Found ${importedComponents.size} components imported in App.tsx`);
  console.log(`🔹 Found ${sidebarRoutes.size} routes in Sidebar.tsx\n`);

  // Check for missing routes
  const missingRoutes = [];
  for (const sidebarRoute of sidebarRoutes) {
    let found = false;
    
    // Check for direct match
    if (routePaths.includes(sidebarRoute)) {
      found = true;
      continue;
    }
    
    // Check if it's a nested route
    const parts = sidebarRoute.split('/');
    if (parts.length > 1) {
      const parent = parts[0];
      if (routePaths.includes(parent)) {
        found = true;
        continue;
      }
    }
    
    if (!found) {
      missingRoutes.push(sidebarRoute);
    }
  }

  // Check for missing components
  const missingComponents = [];
  for (const [path, component] of Object.entries(routeComponentMap)) {
    if (!importedComponents.has(component) && component !== 'div' && component !== 'Navigate') {
      missingComponents.push({ path, component });
    }
  }

  // Report findings
  if (missingRoutes.length > 0) {
    console.log('⚠️ Sidebar routes without corresponding routes in App.tsx:');
    missingRoutes.forEach(route => {
      console.log(`   - ${route}`);
    });
    console.log();
  }

  if (missingComponents.length > 0) {
    console.log('❌ Components referenced in routes but not imported:');
    missingComponents.forEach(item => {
      console.log(`   - Path: ${item.path} | Component: ${item.component}`);
    });
    console.log();
  }

  if (missingRoutes.length === 0 && missingComponents.length === 0) {
    console.log('✅ All sidebar routes are properly connected!');
    console.log('✅ All route components are properly imported!');
  }

  console.log('\nDone!');
} catch (error) {
  console.error('❌ Error:', error.message);
}
