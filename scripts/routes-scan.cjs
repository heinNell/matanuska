const fs = require('fs');
const path = require('path');

// Find all .tsx and .ts files under /src recursively
function findRouteFiles(dir, found = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findRouteFiles(entryPath, found);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      found.push(entryPath);
    }
  }
  return found;
}

// Extract routes from file content using a robust regex
function extractRoutes(fileContent) {
  const routeRegex = /<Route\s+[^>]*path=["'`]([^"'`]+)["'`][^>]*element=\{\s*<([A-Za-z0-9_]+)[^>]*/gms;
  let match;
  const result = [];
  while ((match = routeRegex.exec(fileContent)) !== null) {
    result.push({ path: match[1], component: match[2] });
  }
  return result;
}

async function main() {
  // Use process.cwd() to always use project root as base
  const SRC_DIR = path.join(process.cwd(), 'src');
  if (!fs.existsSync(SRC_DIR)) {
    console.error('ERROR: src directory not found. Check your project structure.');
    process.exit(1);
  }

  const files = findRouteFiles(SRC_DIR);
  let totalFound = 0;

  console.log('\n=== ROUTE TO COMPONENT MAP (across all src/) ===');
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const routes = extractRoutes(content);
    if (routes.length) {
      console.log(`\nFile: ${file.replace(process.cwd() + '/', '')}`);
      for (const { path: routePath, component } of routes) {
        console.log(`  /${routePath}  ➔  ${component}`);
        totalFound++;
      }
    }
  }
  if (!totalFound) {
    console.log('  (No <Route path=... element={<... />} /> entries found in src/!)');
  }
  console.log('\nScan complete.');
}

main();
