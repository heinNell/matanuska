#!/usr/bin/env node

/**
 * Button Action Verification
 * Specifically checks edit and view buttons and their handler connections
 * For Matanuska Transport Platform
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use built-in glob pattern matching for Node.js
const globSync = (pattern, options) => {
  const matches = [];
  const root = options.cwd || process.cwd();
  
  function traverseDir(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const relPath = path.join(relativePath, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        traverseDir(fullPath, relPath);
      } else if (minimatch(relPath, pattern)) {
        matches.push(path.join(options.cwd || '', relPath));
      }
    }
  }
  
  traverseDir(root);
  return matches;
};

// Simple minimatch implementation for our specific needs
function minimatch(filePath, pattern) {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

// Simple chalk alternative
const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
};

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const COMPONENTS_DIR = path.join(__dirname, 'src/components');
const PAGES_DIR = path.join(__dirname, 'src/pages');
const OUTPUT_FILE = path.join(__dirname, 'BUTTON_CONNECTION_REPORT.md');

// Track results
const results = {
  editButtons: [],
  viewButtons: [],
  deleteButtons: [],
  stats: {
    totalEditButtons: 0,
    connectedEditButtons: 0,
    totalViewButtons: 0,
    connectedViewButtons: 0,
    totalDeleteButtons: 0,
    connectedDeleteButtons: 0
  }
};

/**
 * Analyze a component file for button connections
 */
function analyzeFile(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(chalk.red(`File not found: ${filePath}`));
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = path.basename(filePath, path.extname(filePath));
    const relativePath = path.relative(__dirname, filePath);
    
    console.log(chalk.blue(`Checking ${componentName} for button connections...`));
  
  // Check for edit buttons
  const editButtonRegex = /<[^>]*(?:edit|update)(?:\s|\w)*button[^>]*>|(?:edit|update)(?:\w*)(?:Button|Btn)/gi;
  let editMatches = content.match(editButtonRegex) || [];
  
  // Check for view buttons
  const viewButtonRegex = /<[^>]*(?:view|show|detail)(?:\s|\w)*button[^>]*>|(?:view|show|detail)(?:\w*)(?:Button|Btn)/gi;
  let viewMatches = content.match(viewButtonRegex) || [];
  
  // Check for delete buttons
  const deleteButtonRegex = /<[^>]*(?:delete|remove)(?:\s|\w)*button[^>]*>|(?:delete|remove)(?:\w*)(?:Button|Btn)/gi;
  let deleteMatches = content.match(deleteButtonRegex) || [];
  
  // Check for edit handlers
  const editHandlerRegex = /(?:handle|on)(?:Edit|Update|Modify)/g;
  const hasEditHandler = editHandlerRegex.test(content);
  
  // Check for view handlers
  const viewHandlerRegex = /(?:handle|on)(?:View|Show|Details|Detail)/g;
  const hasViewModel = /(?:view|detail)(?:State|Mode|Open)/g.test(content);
  const hasViewHandler = viewHandlerRegex.test(content) || hasViewModel;
  
  // Check for delete handlers
  const deleteHandlerRegex = /(?:handle|on)(?:Delete|Remove)/g;
  const hasDeleteHandler = deleteHandlerRegex.test(content);
  
  // Save results
  if (editMatches.length > 0) {
    results.stats.totalEditButtons++;
    
    const buttonInfo = {
      component: componentName,
      path: relativePath,
      buttonCount: editMatches.length,
      hasHandler: hasEditHandler,
      examples: editMatches.slice(0, 2).map(m => m.substring(0, 50) + (m.length > 50 ? '...' : ''))
    };
    
    if (hasEditHandler) {
      results.stats.connectedEditButtons++;
    }
    
    results.editButtons.push(buttonInfo);
  }
  
  if (viewMatches.length > 0) {
    results.stats.totalViewButtons++;
    
    const buttonInfo = {
      component: componentName,
      path: relativePath,
      buttonCount: viewMatches.length,
      hasHandler: hasViewHandler,
      examples: viewMatches.slice(0, 2).map(m => m.substring(0, 50) + (m.length > 50 ? '...' : ''))
    };
    
    if (hasViewHandler) {
      results.stats.connectedViewButtons++;
    }
    
    results.viewButtons.push(buttonInfo);
  }
  
  if (deleteMatches.length > 0) {
    results.stats.totalDeleteButtons++;
    
    const buttonInfo = {
      component: componentName,
      path: relativePath,
      buttonCount: deleteMatches.length,
      hasHandler: hasDeleteHandler,
      examples: deleteMatches.slice(0, 2).map(m => m.substring(0, 50) + (m.length > 50 ? '...' : ''))
    };
    
    if (hasDeleteHandler) {
      results.stats.connectedDeleteButtons++;
    }
    
    results.deleteButtons.push(buttonInfo);
  }
  } catch (err) {
    console.log(chalk.red(`Error analyzing file ${filePath}: ${err.message}`));
  }
}

/**
 * Generate markdown report
 */
function generateReport() {
  let report = '# Button Action Connection Report\n\n';
  report += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
  
  // Add summary
  report += '## Summary\n\n';
  report += `- Edit Buttons Found: ${results.stats.totalEditButtons} (${results.stats.connectedEditButtons} connected, ${results.stats.totalEditButtons - results.stats.connectedEditButtons} disconnected)\n`;
  report += `- View Buttons Found: ${results.stats.totalViewButtons} (${results.stats.connectedViewButtons} connected, ${results.stats.totalViewButtons - results.stats.connectedViewButtons} disconnected)\n`;
  report += `- Delete Buttons Found: ${results.stats.totalDeleteButtons} (${results.stats.connectedDeleteButtons} connected, ${results.stats.totalDeleteButtons - results.stats.connectedDeleteButtons} disconnected)\n\n`;
  
  // Add edit buttons
  report += '## Edit Buttons\n\n';
  report += '| Component | Connected | Button Count | Example |\n';
  report += '|-----------|-----------|--------------|--------|\n';
  
  results.editButtons.forEach(button => {
    const connected = button.hasHandler ? "✅" : "❌";
    const example = button.examples.length > 0 ? button.examples[0] : "N/A";
    
    report += `| ${button.component} | ${connected} | ${button.buttonCount} | \`${example}\` |\n`;
  });
  
  // Add view buttons
  report += '\n## View Buttons\n\n';
  report += '| Component | Connected | Button Count | Example |\n';
  report += '|-----------|-----------|--------------|--------|\n';
  
  results.viewButtons.forEach(button => {
    const connected = button.hasHandler ? "✅" : "❌";
    const example = button.examples.length > 0 ? button.examples[0] : "N/A";
    
    report += `| ${button.component} | ${connected} | ${button.buttonCount} | \`${example}\` |\n`;
  });
  
  // Add delete buttons
  report += '\n## Delete Buttons\n\n';
  report += '| Component | Connected | Button Count | Example |\n';
  report += '|-----------|-----------|--------------|--------|\n';
  
  results.deleteButtons.forEach(button => {
    const connected = button.hasHandler ? "✅" : "❌";
    const example = button.examples.length > 0 ? button.examples[0] : "N/A";
    
    report += `| ${button.component} | ${connected} | ${button.buttonCount} | \`${example}\` |\n`;
  });
  
  // Add recommendations
  report += '\n## Recommendations\n\n';
  
  // Edit button recommendations
  const disconnectedEditButtons = results.editButtons.filter(b => !b.hasHandler);
  if (disconnectedEditButtons.length > 0) {
    report += '### Edit Buttons Needing Handlers\n\n';
    disconnectedEditButtons.forEach(button => {
      report += `- ${button.component} (${button.path})\n`;
    });
    report += '\n';
  }
  
  // View button recommendations
  const disconnectedViewButtons = results.viewButtons.filter(b => !b.hasHandler);
  if (disconnectedViewButtons.length > 0) {
    report += '### View Buttons Needing Handlers\n\n';
    disconnectedViewButtons.forEach(button => {
      report += `- ${button.component} (${button.path})\n`;
    });
    report += '\n';
  }
  
  // Delete button recommendations
  const disconnectedDeleteButtons = results.deleteButtons.filter(b => !b.hasHandler);
  if (disconnectedDeleteButtons.length > 0) {
    report += '### Delete Buttons Needing Handlers\n\n';
    disconnectedDeleteButtons.forEach(button => {
      report += `- ${button.component} (${button.path})\n`;
    });
    report += '\n';
  }
  
  // Write report
  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(chalk.green(`Report generated at ${OUTPUT_FILE}`));
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.green('Starting Button Connection Check...'));
  
  // Get files using simple fs.readdir recursively
  function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }
  
  const componentFiles = getAllFiles(COMPONENTS_DIR);
  const pageFiles = getAllFiles(PAGES_DIR);
    
  const files = [
    ...componentFiles, 
    ...pageFiles
  ];
  
  console.log(chalk.blue(`Found ${files.length} files to check`));
  
  // Analyze each file
  files.forEach(file => {
    analyzeFile(file);
  });
  
  // Generate report
  generateReport();
  
  console.log(chalk.green('Button Connection Check complete!'));
  console.log(chalk.yellow(`Edit buttons: ${results.stats.connectedEditButtons}/${results.stats.totalEditButtons} connected`));
  console.log(chalk.yellow(`View buttons: ${results.stats.connectedViewButtons}/${results.stats.totalViewButtons} connected`));
  console.log(chalk.yellow(`Delete buttons: ${results.stats.connectedDeleteButtons}/${results.stats.totalDeleteButtons} connected`));
}

main().catch(console.error);
