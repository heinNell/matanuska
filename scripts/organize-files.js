#!/usr/bin/env node

/**
 * File Organization Script
 * 
 * This script helps organize files between components and pages directories.
 * It standardizes directory names and identifies files that might be in the wrong place.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.resolve(__dirname, 'src');
const COMPONENT_DIR = path.resolve(SOURCE_DIR, 'components');
const PAGES_DIR = path.resolve(SOURCE_DIR, 'pages');

// Directory name standardization map
const directoryNameMap = {
  'Tripmanagement': 'trips',
  'DriverManagement': 'drivers',
  'Drivermanagementpages': 'drivers',
  'CustomerManagement': 'customers',
  'DieselManagement': 'diesel',
  'Workshop Management': 'workshop',
  'Inventory Management': 'inventory',
  'Tyremanagement': 'tyres',
  'ComplianceSafety': 'compliance',
  'FleetAnalytics': 'fleet',
  'Cost Management': 'costs',
  'InvoiceManagement': 'invoices'
};

// File classification rules
const isPageFile = (filename) => {
  // Files with 'Page' in the name are likely pages
  if (filename.includes('Page') || filename.endsWith('Page.tsx')) return true;
  
  // Check content for page-specific patterns
  const content = fs.readFileSync(filename, 'utf8');
  const hasRouteImport = /import.*Router|useParams|useNavigate|useLocation/.test(content);
  const hasOutletComponent = /<Outlet\s*\/>/.test(content);
  
  // If the file has route imports and an Outlet, it's likely a page
  return hasRouteImport && hasOutletComponent;
};

// Standardize directory names
const standardizeDirectories = () => {
  console.log('=== Standardizing Directory Names ===');
  
  // Components directory
  Object.entries(directoryNameMap).forEach(([oldName, newName]) => {
    const oldDir = path.join(COMPONENT_DIR, oldName);
    const newDir = path.join(COMPONENT_DIR, newName);
    
    if (fs.existsSync(oldDir)) {
      console.log(`${oldDir} → ${newDir}`);
      
      // Create the new directory if it doesn't exist
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      // TODO: Move files (requires user confirmation)
    }
  });
  
  // Pages directory
  Object.entries(directoryNameMap).forEach(([oldName, newName]) => {
    const oldDir = path.join(PAGES_DIR, oldName);
    const newDir = path.join(PAGES_DIR, newName);
    
    if (fs.existsSync(oldDir)) {
      console.log(`${oldDir} → ${newDir}`);
      
      // Create the new directory if it doesn't exist
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      // TODO: Move files (requires user confirmation)
    }
  });
};

// Find files that might be in the wrong place
const findMisplacedFiles = () => {
  console.log('\n=== Potentially Misplaced Files ===');
  
  // Check components directory for files that should be pages
  const checkComponentsDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        checkComponentsDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx') && isPageFile(fullPath)) {
        console.log(`- ${fullPath} might be a page component`);
      }
    });
  };
  
  // Check pages directory for files that should be components
  const checkPagesDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        checkPagesDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx') && !isPageFile(fullPath)) {
        console.log(`- ${fullPath} might be a reusable component`);
      }
    });
  };
  
  checkComponentsDir(COMPONENT_DIR);
  checkPagesDir(PAGES_DIR);
};

// Find duplicate files
const findDuplicateFiles = () => {
  console.log('\n=== Potential Duplicates ===');
  
  const componentFiles = new Map();
  const pageFiles = new Map();
  
  // Collect all component files
  const collectComponentFiles = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        collectComponentFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        componentFiles.set(entry.name, fullPath);
      }
    });
  };
  
  // Collect all page files
  const collectPageFiles = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        collectPageFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        pageFiles.set(entry.name, fullPath);
      }
    });
  };
  
  collectComponentFiles(COMPONENT_DIR);
  collectPageFiles(PAGES_DIR);
  
  // Find overlaps
  for (const [name, componentPath] of componentFiles.entries()) {
    if (pageFiles.has(name)) {
      console.log(`- ${name} exists in both:\n  Component: ${componentPath}\n  Page: ${pageFiles.get(name)}`);
    }
  }
};

// Main function
const main = () => {
  console.log('File Organization Analysis\n');
  
  standardizeDirectories();
  findMisplacedFiles();
  findDuplicateFiles();
  
  console.log('\nAnalysis complete. Please check the FILE_SORTING_GUIDE.md for instructions on how to proceed.');
};

main();
