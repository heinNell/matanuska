import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { execSync } from 'child_process';

// Find all TypeScript and TypeScript React files in the src directory
const files = globSync('src/**/*.{ts,tsx}', { absolute: true });

console.log(`Found ${files.length} TypeScript files to check`);

const pattern = /onClick={onClick\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/g;

let fixedFiles = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(pattern, 'onClick={onClick}');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Fixed onClick handler in ${file}`);
    fixedFiles++;
  }
});

console.log(`Fixed onClick handlers in ${fixedFiles} files`);
console.log('Done! You may need to fix some files manually if they have more complex patterns.');
