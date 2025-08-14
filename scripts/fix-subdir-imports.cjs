#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files in subdirectories of src/pages
const files = glob.sync('src/pages/**/*.{ts,tsx}', { absolute: true });

files.forEach(filePath => {
  try {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Skip if not in a subdirectory of pages
    const pathParts = relativePath.split(path.sep);
    if (pathParts.length <= 3) return; // src/pages/file.tsx would be length 3
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix import paths from ../components to ../../components
    content = content.replace(/from ['"]\.\.\/components/g, (match) => {
      modified = true;
      return match.replace('../components', '../../components');
    });

    // Fix import paths from ../context to ../../context
    content = content.replace(/from ['"]\.\.\/context/g, (match) => {
      modified = true;
      return match.replace('../context', '../../context');
    });

    // Fix import paths from ../hooks to ../../hooks
    content = content.replace(/from ['"]\.\.\/hooks/g, (match) => {
      modified = true;
      return match.replace('../hooks', '../../hooks');
    });

    // Fix import paths from ../utils to ../../utils
    content = content.replace(/from ['"]\.\.\/utils/g, (match) => {
      modified = true;
      return match.replace('../utils', '../../utils');
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed subdirectory imports in: ${relativePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Subdirectory import fixing complete!');
