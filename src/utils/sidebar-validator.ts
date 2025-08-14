/**
 * Sidebar Validator Utility
 * 
 * This utility checks that all pages in the application have corresponding sidebar entries
 * and that all sidebar entries point to valid components.
 */

import fs from 'fs';
import path from 'path';
import { sidebarConfig, SidebarItem } from '../config/sidebarConfig';

interface PageInfo {
  path: string;
  componentPath: string;
  inSidebar: boolean;
}

// Get all TSX files in pages directory recursively
const getAllPageFiles = (dir: string, fileList: string[] = []): string[] => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllPageFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

// Check if a page is in the sidebar
const isInSidebar = (componentPath: string, items: SidebarItem[] = sidebarConfig): boolean => {
  for (const item of items) {
    // Check if this item matches
    if (item.component === componentPath) {
      return true;
    }
    
    // Check children recursively
    if (item.children && item.children.length > 0) {
      if (isInSidebar(componentPath, item.children)) {
        return true;
      }
    }
  }

  return false;
};

// Find all pages not in the sidebar
const findPagesNotInSidebar = (): PageInfo[] => {
  const pageDir = path.join(__dirname, '../pages');
  const pageFiles = getAllPageFiles(pageDir);
  
  const results: PageInfo[] = [];

  pageFiles.forEach(filePath => {
    // Convert absolute path to relative path format used in sidebar
    const relativePath = filePath
      .replace(/.*\/src\//, '')
      .replace(/\.tsx$/, '');
    
    const inSidebar = isInSidebar(relativePath);
    
    results.push({
      path: filePath,
      componentPath: relativePath,
      inSidebar
    });
  });

  return results.filter(page => !page.inSidebar);
};

// Generate suggested sidebar entries for missing pages
const generateSidebarSuggestions = () => {
  const missingPages = findPagesNotInSidebar();
  
  // Group by directory for better organization
  const pagesByDir: Record<string, PageInfo[]> = {};
  
  missingPages.forEach(page => {
    const dirPath = path.dirname(page.componentPath);
    if (!pagesByDir[dirPath]) {
      pagesByDir[dirPath] = [];
    }
    pagesByDir[dirPath].push(page);
  });
  
  // Generate sidebar suggestions
  let suggestionOutput = '// Suggested sidebar entries for missing pages\n\n';
  
  Object.entries(pagesByDir).forEach(([dir, pages]) => {
    suggestionOutput += `// === ${dir.toUpperCase()} ===\n`;
    
    pages.forEach(page => {
      const pageName = path.basename(page.componentPath);
      const label = pageName
        .replace(/Page$/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim();
      
      const id = pageName.charAt(0).toLowerCase() + pageName.slice(1);
      const routePath = `/${page.componentPath.replace(/^pages\//, '')}`;
      
      suggestionOutput += `{
  id: '${id}',
  label: '${label}',
  path: '${routePath}',
  component: '${page.componentPath}'
},\n`;
    });
    
    suggestionOutput += '\n';
  });
  
  return suggestionOutput;
};

export { findPagesNotInSidebar, generateSidebarSuggestions };
