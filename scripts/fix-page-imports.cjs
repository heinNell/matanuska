#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files in src/pages directory
const files = glob.sync('src/pages/**/*.{ts,tsx}', { absolute: true });

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix import paths from ../../components to ../components
    content = content.replace(/from ['"]\.\.\/\.\.\/components/g, (match) => {
      modified = true;
      return match.replace('../../components', '../components');
    });

    // Fix import paths from ../../context to ../context
    content = content.replace(/from ['"]\.\.\/\.\.\/context/g, (match) => {
      modified = true;
      return match.replace('../../context', '../context');
    });

    // Fix import paths from ../../hooks to ../hooks
    content = content.replace(/from ['"]\.\.\/\.\.\/hooks/g, (match) => {
      modified = true;
      return match.replace('../../hooks', '../hooks');
    });

    // Fix import paths from ../../utils to ../utils
    content = content.replace(/from ['"]\.\.\/\.\.\/utils/g, (match) => {
      modified = true;
      return match.replace('../../utils', '../utils');
    });

    // Fix import paths from ../ui/ to ../components/ui/
    content = content.replace(/from ['"]\.\.\/ui\//g, (match) => {
      modified = true;
      return match.replace('../ui/', '../components/ui/');
    });

    // Fix import paths from ../components to ../components for root pages
    // and ../../components for subdirectory pages
    const relativePath = path.relative(process.cwd(), filePath);
    const pathParts = relativePath.split(path.sep);
    const isInSubdirectory = pathParts.length > 3; // src/pages/file.tsx would be length 3

    if (isInSubdirectory) {
      // For subdirectory files, use ../../components
      content = content.replace(/from ['"]\.\.\/components/g, (match) => {
        modified = true;
        return match.replace('../components', '../../components');
      });

      content = content.replace(/from ['"]\.\.\/context/g, (match) => {
        modified = true;
        return match.replace('../context', '../../context');
      });

      content = content.replace(/from ['"]\.\.\/hooks/g, (match) => {
        modified = true;
        return match.replace('../hooks', '../../hooks');
      });

      content = content.replace(/from ['"]\.\.\/utils/g, (match) => {
        modified = true;
        return match.replace('../utils', '../../utils');
      });

      content = content.replace(/from ['"]\.\.\/types/g, (match) => {
        modified = true;
        return match.replace('../types', '../../types');
      });
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Import path fixing complete!');
