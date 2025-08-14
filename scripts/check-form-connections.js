#!/usr/bin/env node

/**
 * Form Handler Connection Checker
 * Specifically identifies forms and their handlers in React components
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
const OUTPUT_FILE = path.join(__dirname, 'FORM_CONNECTION_REPORT.md');

// Track results
const results = {
  forms: [],
  stats: {
    totalForms: 0,
    connectedForms: 0,
    disconnectedForms: 0,
    validatedForms: 0,
    unvalidatedForms: 0
  }
};

/**
 * Analyze a component file for form-to-handler connections
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
    
    console.log(chalk.blue(`Checking ${componentName} for forms...`));
  
  // Check for forms
  const hasForm = /<Form|<form|useForm|handleSubmit/.test(content);
  
  if (!hasForm) {
    return;
  }
  
  // Extract form data
  const formInfo = {
    component: componentName,
    path: relativePath,
    connected: false,
    validated: false,
    handlers: [],
    issues: []
  };
  
  // Find form submission handlers
  const submitHandlerRegex = /(?:function|const)\s+(\w+Submit|\w+FormSubmit|handle\w+Submit|on\w+Submit|submit\w+)[\s\=]/g;
  const formHandlers = [];
  let match;
  
  while ((match = submitHandlerRegex.exec(content)) !== null) {
    formHandlers.push(match[1]);
  }
  
  formInfo.handlers = formHandlers;
  formInfo.connected = formHandlers.length > 0;
  
  // Check for validation
  formInfo.validated = /isValid|errors|touched|register|Joi|yup|validate|schema|required|pattern/.test(content);
  
  // Update stats
  results.stats.totalForms++;
  
  if (formInfo.connected) {
    results.stats.connectedForms++;
  } else {
    results.stats.disconnectedForms++;
    formInfo.issues.push("No form submission handler found");
  }
  
  if (formInfo.validated) {
    results.stats.validatedForms++;
  } else {
    results.stats.unvalidatedForms++;
    formInfo.issues.push("No form validation found");
  }
  
  // Add to results
  results.forms.push(formInfo);
  } catch (err) {
    console.log(chalk.red(`Error analyzing file ${filePath}: ${err.message}`));
  }
}

/**
 * Generate markdown report
 */
function generateReport() {
  let report = '# Form Handler Connection Report\n\n';
  report += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
  
  // Add summary
  report += '## Summary\n\n';
  report += `- Total Forms Found: ${results.stats.totalForms}\n`;
  report += `- Connected Forms: ${results.stats.connectedForms}\n`;
  report += `- Disconnected Forms: ${results.stats.disconnectedForms}\n`;
  report += `- Validated Forms: ${results.stats.validatedForms}\n`;
  report += `- Unvalidated Forms: ${results.stats.unvalidatedForms}\n\n`;
  
  // Add form details
  report += '## Form Details\n\n';

  report += '| Component | Connected | Validated | Handlers | Issues |\n';
  report += '|-----------|-----------|-----------|----------|--------|\n';
  
  results.forms.forEach(form => {
    const handlers = form.handlers.length > 0 ? form.handlers.join(", ") : "None";
    const issues = form.issues.length > 0 ? form.issues.join(", ") : "None";
    const connected = form.connected ? "✅" : "❌";
    const validated = form.validated ? "✅" : "❌";
    
    report += `| ${form.component} | ${connected} | ${validated} | ${handlers} | ${issues} |\n`;
  });
  
  report += '\n';
  
  // Add recommendations
  report += '## Recommendations\n\n';
  
  if (results.stats.disconnectedForms > 0) {
    report += '### Disconnected Forms\n\n';
    report += 'The following forms need submission handlers:\n\n';
    
    results.forms
      .filter(form => !form.connected)
      .forEach(form => {
        report += `- ${form.component} (${form.path})\n`;
      });
      
    report += '\n';
  }
  
  if (results.stats.unvalidatedForms > 0) {
    report += '### Unvalidated Forms\n\n';
    report += 'The following forms need validation logic:\n\n';
    
    results.forms
      .filter(form => !form.validated)
      .forEach(form => {
        report += `- ${form.component} (${form.path})\n`;
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
  console.log(chalk.green('Starting Form Handler Connection Check...'));
  
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
  
  console.log(chalk.green('Form Handler Connection Check complete!'));
  console.log(chalk.yellow(`Connected forms: ${results.stats.connectedForms}, Disconnected: ${results.stats.disconnectedForms}`));
  console.log(chalk.yellow(`Validated forms: ${results.stats.validatedForms}, Unvalidated: ${results.stats.unvalidatedForms}`));
}

main().catch(console.error);
