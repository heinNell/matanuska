import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// Utility type for pattern objects
type FixPattern = {
  pattern: RegExp;
  replacement: string;
  description: string;
};

// Find all TypeScript and TypeScript React files in the src directory
const files: string[] = globSync('src/**/*.{ts,tsx}', { absolute: true });

console.log(`Found ${files.length} TypeScript files to check`);

// Patterns to fix with their replacements
const fixPatterns: FixPattern[] = [
  // Event handler patterns
  {
    pattern: /onClick={(\w+)\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/g,
    replacement: 'onClick={$1}',
    description: "onClick with fallback empty function"
  },
  {
    pattern: /onChange={(\w+)\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/g,
    replacement: 'onChange={$1}',
    description: "onChange with fallback empty function"
  },
  {
    pattern: /onSubmit={(\w+)\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/g,
    replacement: 'onSubmit={$1}',
    description: "onSubmit with fallback empty function"
  },
  {
    pattern: /onClose={(\w+)\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/g,
    replacement: 'onClose={$1}',
    description: "onClose with fallback empty function"
  },
  {
    pattern: /onCancel={(\w+)\s*\|\|\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)}/g,
    replacement: 'onCancel={$1}',
    description: "onCancel with fallback empty function"
  },
  // Remove unused handleClick functions that are defined but not used
  {
    pattern: /const\s+handleClick\s*=\s*\(.*?\)\s*=>\s*\{\s*if\s*\(\w+\)\s*\{\s*\w+\(.*?\);\s*\}\s*\};\s*\n*/g,
    replacement: '',
    description: "unused handleClick function"
  }
];

let fixedCount = 0;

files.forEach((file: string) => {
  let content = fs.readFileSync(file, 'utf8');
  let fileFixes = 0;

  fixPatterns.forEach(({ pattern, replacement, description }) => {
    const newContent = content.replace(pattern, replacement);

    if (newContent !== content) {
      content = newContent;
      fileFixes++;
    }
  });

  if (fileFixes > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${fileFixes} issues in ${path.relative(process.cwd(), file)}`);
    fixedCount += fileFixes;
  }
});

console.log(`Total fixes applied: ${fixedCount}`);
console.log('Done! The codebase should now be more consistent.');
