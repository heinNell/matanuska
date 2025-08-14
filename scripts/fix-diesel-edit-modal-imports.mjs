#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix the import paths in DieselEditModal
const fixDieselEditModal = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(process.cwd(), 'src/components/Models/Diesel/DieselEditModal.tsx');
  
  try {
    console.log(`Reading file ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the import paths
    content = content.replace(
      "import { DieselRecord } from '../../types';", 
      "import { DieselRecord } from '../../../types';"
    );
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated import paths in DieselEditModal.tsx');
    
    return true;
  } catch (error) {
    console.error(`Error fixing import paths in ${filePath}:`, error.message);
    return false;
  }
};

// Run the function
const success = fixDieselEditModal();
if (success) {
  console.log('All import paths fixed successfully!');
} else {
  console.error('Failed to fix some import paths.');
  process.exit(1);
}
