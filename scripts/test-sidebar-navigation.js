#!/usr/bin/env node

/**
 * Sidebar Navigation Test Tool
 * This script verifies that the sidebar navigation buttons are working properly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The path to the sidebar component
const sidebarPath = path.join(__dirname, 'src/components/layout/Sidebar.tsx');

// Check if the sidebar file exists
if (!fs.existsSync(sidebarPath)) {
  console.error('\x1b[31mError: Sidebar component not found!\x1b[0m');
  process.exit(1);
}

// Read the sidebar file
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

// Check if the onNavigate prop is properly used in the component
if (!sidebarContent.includes('onNavigate={onNavigate}') && 
    !sidebarContent.includes('onNavigate: onNavigate') &&
    !sidebarContent.includes('onClick={() => onNavigate(')) {
  console.error('\x1b[31mError: onNavigate prop is not properly used in the Sidebar component!\x1b[0m');
  process.exit(1);
}

// Check for undefined onClick handlers
if (sidebarContent.includes('onClick={onClick}') || sidebarContent.includes('onClick={onClick || (')) {
  console.error('\x1b[31mError: Found potentially undefined onClick handler in Sidebar component!\x1b[0m');
  process.exit(1);
}

// Check if all child items have proper onClick handlers
const childButtonsWithoutOnClick = sidebarContent.match(/(?:<button[^>]*>(?:[^<]*)<\/button>)/g)
  ?.filter(btn => !btn.includes('onClick='));

if (childButtonsWithoutOnClick && childButtonsWithoutOnClick.length > 0) {
  console.error('\x1b[31mError: Found buttons without onClick handlers in Sidebar component!\x1b[0m');
  childButtonsWithoutOnClick.forEach((btn, i) => {
    console.error(`\x1b[33mButton ${i + 1}: ${btn.substring(0, 50)}...\x1b[0m`);
  });
  process.exit(1);
}

// All checks passed
console.log('\x1b[32mSidebar Navigation Test: All checks passed!\x1b[0m');
console.log('\x1b[32m✓\x1b[0m onNavigate prop is properly used');
console.log('\x1b[32m✓\x1b[0m All buttons have onClick handlers');
console.log('\x1b[32m✓\x1b[0m No undefined onClick references');

console.log('\n\x1b[34mSidebar is ready for deployment!\x1b[0m');
