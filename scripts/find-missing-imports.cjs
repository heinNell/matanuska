/**
 * Route Component Importer
 * 
 * This script automatically identifies missing component imports in App.tsx
 * and suggests the necessary import statements.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// File paths
const appTsxPath = path.join(__dirname, 'src', 'App.tsx');

// Read App.tsx
const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');

// Extract component names from route elements
const routeRegex = /<Route\s+path="[^"]+"\s+element=\{<([A-Za-z0-9_]+)[^>]*>\}/g;
const componentNames = new Set();
let match;

while ((match = routeRegex.exec(appTsxContent)) !== null) {
  const componentName = match[1];
  if (componentName !== 'div' && componentName !== 'Navigate') {
    componentNames.add(componentName);
  }
}

// Extract currently imported components
const importRegex = /import\s+(?:{?\s*([^}]+)}?\s+from|([A-Za-z0-9_]+)\s+from)/g;
const importedComponents = new Set();

while ((match = importRegex.exec(appTsxContent)) !== null) {
  const namedImports = match[1];
  const defaultImport = match[2];
  
  if (namedImports) {
    namedImports.split(',')
      .map(imp => imp.trim().split(' ')[0])
      .forEach(comp => importedComponents.add(comp));
  }
  
  if (defaultImport) {
    importedComponents.add(defaultImport);
  }
}

// Also look for lazy loaded components
const lazyRegex = /const\s+([A-Za-z0-9_]+)\s*=\s*lazy\(/g;
while ((match = lazyRegex.exec(appTsxContent)) !== null) {
  importedComponents.add(match[1]);
}

// Find missing components
const missingComponents = [...componentNames].filter(component => 
  !importedComponents.has(component)
);

console.log(`🔍 Found ${missingComponents.length} components that need to be imported`);

if (missingComponents.length === 0) {
  console.log('✅ All components are properly imported!');
  process.exit(0);
}

console.log('\nSearching for component files...');

// Function to search for component files
function findComponentFiles() {
  return new Promise((resolve) => {
    // Create a search pattern for all component names
    const componentPattern = missingComponents.join('|');
    const cmd = `find ./src -type f -name "*.tsx" -exec grep -l -E "(export|function|class).*\\b(${componentPattern})\\b" {} \\;`;
    
    exec(cmd, (error, stdout) => {
      if (error) {
        console.error(`Error searching for components: ${error.message}`);
        resolve({});
        return;
      }
      
      const files = stdout.trim().split('\n').filter(Boolean);
      const componentPaths = {};
      
      files.forEach(file => {
        // Read the file to confirm it exports the component
        const content = fs.readFileSync(file, 'utf8');
        
        missingComponents.forEach(component => {
          const exportRegex = new RegExp(`export\\s+(default\\s+)?(function|class|const)\\s+${component}\\b|export\\s+\\{[^}]*\\b${component}\\b[^}]*\\}`);
          if (exportRegex.test(content) && !componentPaths[component]) {
            componentPaths[component] = file.replace('./src/', './');
          }
        });
      });
      
      resolve(componentPaths);
    });
  });
}

// Generate import statements
async function generateImportStatements() {
  const componentPaths = await findComponentFiles();
  const importStatements = [];
  const missingPathComponents = [];
  
  missingComponents.forEach(component => {
    if (componentPaths[component]) {
      // Remove file extension and adjust path
      const importPath = componentPaths[component].replace(/\.(tsx|ts|js|jsx)$/, '');
      importStatements.push(`import ${component} from "${importPath}";`);
    } else {
      missingPathComponents.push(component);
    }
  });
  
  console.log('\n==== Suggested Import Statements ====\n');
  if (importStatements.length > 0) {
    importStatements.forEach(statement => console.log(statement));
  }
  
  if (missingPathComponents.length > 0) {
    console.log('\n⚠️ Could not find file paths for these components:');
    missingPathComponents.forEach(component => console.log(`- ${component}`));
    console.log('\nYou\'ll need to manually locate these components or create them.');
  }
}

// Run the process
generateImportStatements();
