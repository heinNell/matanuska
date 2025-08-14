import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// Find all TypeScript and TypeScript React files in the src directory
const files = globSync('src/**/*.{ts,tsx}', { absolute: true });

console.log(`Found ${files.length} TypeScript files to check`);

// Common patterns to check
const patterns = [
  { pattern: /onClick={onClick\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/, description: "onClick with fallback empty function" },
  { pattern: /onChange={onChange\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/, description: "onChange with fallback empty function" },
  { pattern: /onSubmit={onSubmit\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/, description: "onSubmit with fallback empty function" },
  { pattern: /onClose={onClose\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/, description: "onClose with fallback empty function" },
  { pattern: /onCancel={onCancel\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/, description: "onCancel with fallback empty function" },
  { pattern: /const handleClick\s*=.*?\{\s*if\s*\(onClick\)\s*\{\s*onClick\(.*?\)\s*\}\s*\}/, description: "unused handleClick function" }
];

let issuesFound = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  patterns.forEach(({ pattern, description }) => {
    if (pattern.test(content)) {
      console.log(`Issue found in ${file}: ${description}`);
      issuesFound++;
    }
  });
});

console.log(`Total issues found: ${issuesFound}`);
console.log('Done! These issues might need manual inspection.');
