#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all .tsx and .ts files in src directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

// Extract import statements from file content
function extractImports(content) {
  const importRegex = /^import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"];?$/gm;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1].startsWith('.')) { // Only relative imports
      imports.push({
        fullMatch: match[0],
        path: match[1]
      });
    }
  }
  
  return imports;
}

// Check if file exists
function checkFileExists(basePath, importPath) {
  const fullPath = path.resolve(path.dirname(basePath), importPath);
  
  // Check various file extensions
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
  
  for (const ext of extensions) {
    const pathWithExt = fullPath + ext;
    if (fs.existsSync(pathWithExt)) {
      return { exists: true, resolvedPath: pathWithExt };
    }
  }
  
  // Check if it's a directory with index file
  for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
    const indexPath = path.join(fullPath, 'index' + ext);
    if (fs.existsSync(indexPath)) {
      return { exists: true, resolvedPath: indexPath };
    }
  }
  
  return { exists: false, resolvedPath: null };
}

// Main function
function analyzeImports() {
  const srcPath = './src';
  const allFiles = getAllFiles(srcPath);
  const issues = [];
  
  console.log(`Analyzing ${allFiles.length} files...`);
  
  allFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = extractImports(content);
    
    imports.forEach(importObj => {
      const check = checkFileExists(filePath, importObj.path);
      if (!check.exists) {
        issues.push({
          file: filePath,
          import: importObj.path,
          fullImportStatement: importObj.fullMatch
        });
      }
    });
  });
  
  console.log(`\nFound ${issues.length} import issues:`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. File: ${issue.file}`);
    console.log(`   Import: ${issue.import}`);
    console.log(`   Statement: ${issue.fullImportStatement}`);
    console.log('');
  });
  
  return issues;
}

// Run the analysis
analyzeImports();
