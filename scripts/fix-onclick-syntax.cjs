#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript/TSX files
const files = glob.sync('src/**/*.{ts,tsx}', { absolute: true });

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix malformed onClick handlers
    const beforeCount = (content.match(/onClick\{onClick\}\}/g) || []).length;
    content = content.replace(/onClick\{onClick\}\}/g, 'onClick={() => {}}');
    if (beforeCount > 0) {
      modified = true;
      console.log(`Fixed ${beforeCount} onClick{onClick}} errors in: ${path.relative(process.cwd(), filePath)}`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('onClick syntax fixing complete!');
