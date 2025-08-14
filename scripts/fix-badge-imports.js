import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify fs functions
const readFile = (path) => fs.promises.readFile(path, 'utf8');
const writeFile = (path, content) => fs.promises.writeFile(path, content, 'utf8');
const readdir = (path) => fs.promises.readdir(path);
const stat = (path) => fs.promises.stat(path);

// Patterns to match for Badge imports
const patterns = [
  /import\s+{.*Badge.*}\s+from\s+['"](.*)\/Badge['"]/g,
  /import\s+Badge\s+from\s+['"](.*)\/Badge['"]/g
];

// Recursive function to process files
async function processDirectory(directory) {
  const files = await readdir(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        await processDirectory(fullPath);
      }
    } else if (stats.isFile() && /\.(tsx|jsx|ts|js)$/.test(file)) {
      await processFile(fullPath);
    }
  }
}

async function processFile(filePath) {
  try {
    const content = await readFile(filePath);
    let newContent = content;
    let modified = false;
    
    // Check for each pattern and replace if found
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        newContent = newContent.replace(pattern, (match, p1) => {
          return match.replace(`${p1}/Badge`, `${p1}/badge`);
        });
        modified = true;
      }
    }
    
    // Special case for @/components/ui/Badge (alias imports)
    if (newContent.includes('@/components/ui/Badge')) {
      newContent = newContent.replace(/@\/components\/ui\/Badge/g, '@/components/ui/badge');
      modified = true;
    }
    
    // Write back if modified
    if (modified) {
      console.log(`Fixed imports in: ${filePath}`);
      await writeFile(filePath, newContent);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Start processing from src directory
processDirectory('./src')
  .then(() => console.log('All Badge imports fixed'))
  .catch(err => console.error('Error:', err));