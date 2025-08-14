const fs = require('fs');
const path = require('path');

// Read the list of all files
const allFiles = fs.readFileSync('all_files.txt', 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(file => file.replace(/^src\//, ''));

// Create a map to track file usage
const fileUsageMap = {};
allFiles.forEach(file => {
  fileUsageMap[file] = false;
});

// Mark entry points as used
['main.tsx', 'App.tsx', 'index.tsx'].forEach(entryPoint => {
  const file = allFiles.find(f => f.endsWith(entryPoint));
  if (file) fileUsageMap[file] = true;
});

// Check each file for imports of other files
allFiles.forEach(file => {
  try {
    const content = fs.readFileSync(path.join('src', file), 'utf8');
    
    // Check for imports from the src directory
    allFiles.forEach(potentialImport => {
      // Skip checking the file against itself
      if (file === potentialImport) return;
      
      const fileName = path.basename(potentialImport);
      const baseName = path.basename(potentialImport, path.extname(potentialImport));
      
      // Different ways a file might be imported
      const patterns = [
        `import .* from ['"].*${baseName}['"]`,
        `import ['"].*${baseName}['"]`,
        `require\\(['"].*${baseName}['"]\\)`,
        `React.lazy\\(\\s*\\(\\)\\s*=>\\s*import\\(['"].*${baseName}['"]\\)\\s*\\)`
      ];
      
      for (const pattern of patterns) {
        if (new RegExp(pattern).test(content)) {
          fileUsageMap[potentialImport] = true;
          break;
        }
      }
    });
  } catch (err) {
    console.error(`Error reading file ${file}:`, err.message);
  }
});

// Recursively mark dependencies as used
let changed = true;
while (changed) {
  changed = false;
  for (const file of allFiles) {
    // Skip already marked files
    if (fileUsageMap[file]) continue;
    
    try {
      const content = fs.readFileSync(path.join('src', file), 'utf8');
      
      // Check if this file imports any used files
      for (const usedFile of allFiles.filter(f => fileUsageMap[f])) {
        const baseName = path.basename(usedFile, path.extname(usedFile));
        
        const patterns = [
          `import .* from ['"].*${baseName}['"]`,
          `import ['"].*${baseName}['"]`,
          `require\\(['"].*${baseName}['"]\\)`,
        ];
        
        for (const pattern of patterns) {
          if (new RegExp(pattern).test(content)) {
            fileUsageMap[file] = true;
            changed = true;
            break;
          }
        }
        
        if (fileUsageMap[file]) break;
      }
    } catch (err) {
      console.error(`Error reading file ${file}:`, err.message);
    }
  }
}

// List unused files
const unusedFiles = allFiles.filter(file => !fileUsageMap[file]);
console.log(`Found ${unusedFiles.length} potentially unused files out of ${allFiles.length} total files:`);
unusedFiles.forEach(file => {
  console.log(`src/${file}`);
});
