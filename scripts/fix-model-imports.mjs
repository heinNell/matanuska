#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Map of incorrect import paths to correct ones for components in Models/Workshop
const importFixes = {
  // From components/Models/Workshop to components/ui
  'from \'../ui/Card\'': 'from \'../../ui/Card\'',
  'from "../ui/Card"': 'from "../../ui/Card"',
  'from \'../ui/Button\'': 'from \'../../ui/Button\'',
  'from "../ui/Button"': 'from "../../ui/Button"',
  'from \'../ui/Input\'': 'from \'../../ui/Input\'',
  'from "../ui/Input"': 'from "../../ui/Input"',
  'from \'../ui/Modal\'': 'from \'../../ui/Modal\'',
  'from "../ui/Modal"': 'from "../../ui/Modal"',
  'from \'../ui/Select\'': 'from \'../../ui/Select\'',
  'from "../ui/Select"': 'from "../../ui/Select"',
  'from \'../ui/Badge\'': 'from \'../../ui/Badge\'',
  'from "../ui/Badge"': 'from "../../ui/Badge"',
  'from \'../ui/Table\'': 'from \'../../ui/Table\'',
  'from "../ui/Table"': 'from "../../ui/Table"',
  'from \'../ui/Form\'': 'from \'../../ui/Form\'',
  'from "../ui/Form"': 'from "../../ui/Form"',
  'from \'../ui/Tabs\'': 'from \'../../ui/Tabs\'',
  'from "../ui/Tabs"': 'from "../../ui/Tabs"',
  'from \'../ui/Calendar\'': 'from \'../../ui/Calendar\'',
  'from "../ui/Calendar"': 'from "../../ui/Calendar"',
  'from \'../ui/Tooltip\'': 'from \'../../ui/Tooltip\'',
  'from "../ui/Tooltip"': 'from "../../ui/Tooltip"',
  'from \'../ui/FormElements\'': 'from \'../../ui/FormElements\'',
  'from "../ui/FormElements"': 'from "../../ui/FormElements"',
  'from \'../ui/LoadingIndicator\'': 'from \'../../ui/LoadingIndicator\'',
  'from "../ui/LoadingIndicator"': 'from "../../ui/LoadingIndicator"',
  
  // Firebase imports
  'from \'../../firebase\'': 'from \'../../../firebase\'',
  'from "../../firebase"': 'from "../../../firebase"',
  
  // Context imports
  'from \'../../context/': 'from \'../../../context/',
  'from "../../context/': 'from "../../../context/',
  
  // Utils imports  
  'from \'../../utils/': 'from \'../../../utils/',
  'from "../../utils/': 'from "../../../utils/',
  
  // Common component imports
  'from \'../common/': 'from \'../../common/',
  'from "../common/': 'from "../../common/',
  
  // Types imports for Models/Workshop
  'from \'../../types\'': 'from \'../../../types\'',
  'from "../../types"': 'from "../../../types"',
};

// Fix imports in Models/Trips
const tripsImportFixes = {
  // From components/Models/Trips to components/ui
  'from \'../ui/': 'from \'../../ui/',
  'from "../ui/': 'from "../../ui/',
  
  // Firebase imports
  'from \'../../firebase\'': 'from \'../../../firebase\'',
  'from "../../firebase"': 'from "../../../firebase"',
};

function fixImportsInFile(filePath, fixes) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const [incorrect, correct] of Object.entries(fixes)) {
      if (content.includes(incorrect)) {
        content = content.replaceAll(incorrect, correct);
        changed = true;
      }
    }
    
    if (changed) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath, fixes) {
  try {
    const items = readdirSync(dirPath);
    let totalFixed = 0;
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        totalFixed += processDirectory(fullPath, fixes);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        if (fixImportsInFile(fullPath, fixes)) {
          totalFixed++;
        }
      }
    }
    
    return totalFixed;
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
    return 0;
  }
}

// Main execution
const srcPath = process.cwd() + '/src';

console.log('Fixing import paths in Workshop Models...');
const workshopFixed = processDirectory(srcPath + '/components/Models/Workshop', importFixes);

console.log('Fixing import paths in Trip Models...');
const tripsFixed = processDirectory(srcPath + '/components/Models/Trips', tripsImportFixes);

console.log('Fixing import paths in all Models...');
const allModelsFixed = processDirectory(srcPath + '/components/Models', importFixes);

console.log(`\nSummary:
- Workshop Models: ${workshopFixed} files fixed
- Trip Models: ${tripsFixed} files fixed  
- All Models: ${allModelsFixed} files fixed
Total: ${workshopFixed + tripsFixed + allModelsFixed} files updated`);
