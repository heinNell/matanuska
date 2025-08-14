#!/usr/bin/env node

/**
 * UI Connection Verification Tool
 * This script analyzes components to verify UI elements are properly connected to handlers
 * For Matanuska Transport Platform
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob';
import chalk from 'chalk';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const COMPONENTS_DIR = path.join(__dirname, 'src/components');
const PAGES_DIR = path.join(__dirname, 'src/pages');
const OUTPUT_FILE = path.join(__dirname, 'UI_CONNECTION_REPORT.md');

// UI element patterns to check
const UI_PATTERNS = {
  buttons: {
    edit: /(?:edit|update|modify)(?:\w*button|\w*btn)/i,
    view: /(?:view|show|display|details)(?:\w*button|\w*btn)/i,
    delete: /(?:delete|remove|destroy)(?:\w*button|\w*btn)/i,
    save: /(?:save|submit|confirm|create)(?:\w*button|\w*btn)/i,
    cancel: /(?:cancel|abort|back)(?:\w*button|\w*btn)/i
  },
  forms: {
    form: /<form|useForm|<Form|handleSubmit/i,
    validation: /validate|isValid|errors|register|required|pattern/i,
    submission: /onSubmit|handleSubmit|submitForm|formSubmit/i,
  },
  modals: {
    modal: /<Modal|<Dialog|isOpen|showModal|openModal|modal\(/i,
    dialog: /confirm|alert|dialog|prompt/i
  }
};

// Function handler patterns
const HANDLER_PATTERNS = {
  edit: /(?:handle|on)(?:Edit|Update|Modify)/i,
  view: /(?:handle|on)(?:View|Show|Display|Details)/i,
  delete: /(?:handle|on)(?:Delete|Remove)/i,
  save: /(?:handle|on)(?:Save|Submit|Create|Confirm)/i,
  cancel: /(?:handle|on)(?:Cancel|Abort|Back)/i,
  form: /(?:handle|on)(?:Submit|FormSubmit|SaveForm)/i,
  modal: /(?:handle|on)(?:Modal|Dialog|Close|Open)/i
};

// Tracking results
const results = {
  components: {},
  stats: {
    totalComponents: 0,
    connectedButtons: 0,
    disconnectedButtons: 0,
    connectedForms: 0,
    disconnectedForms: 0,
    connectedModals: 0,
    disconnectedModals: 0
  },
  issues: []
};

/**
 * Analyze a single component file
 */
function analyzeComponent(filePath) {
  const relativePath = path.relative(__dirname, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const componentName = path.basename(filePath, path.extname(filePath));
  
  console.log(chalk.blue(`Analyzing ${componentName}...`));
  
  const componentResult = {
    name: componentName,
    path: relativePath,
    ui: {
      buttons: {
        edit: { found: false, connected: false },
        view: { found: false, connected: false },
        delete: { found: false, connected: false },
        save: { found: false, connected: false },
        cancel: { found: false, connected: false }
      },
      forms: { found: false, connected: false, validated: false },
      modals: { found: false, connected: false }
    },
    issues: []
  };
  
  // Check buttons
  Object.keys(UI_PATTERNS.buttons).forEach(buttonType => {
    if (UI_PATTERNS.buttons[buttonType].test(content)) {
      componentResult.ui.buttons[buttonType].found = true;
      results.stats.totalComponents++;
      
      // Check for corresponding handler
      const connected = HANDLER_PATTERNS[buttonType].test(content);
      componentResult.ui.buttons[buttonType].connected = connected;
      
      if (connected) {
        results.stats.connectedButtons++;
      } else {
        results.stats.disconnectedButtons++;
        componentResult.issues.push(`${buttonType} button may not be connected to a handler`);
        results.issues.push({
          component: componentName,
          issue: `${buttonType} button has no matching handler`,
          path: relativePath
        });
      }
    }
  });
  
  // Check forms
  if (UI_PATTERNS.forms.form.test(content)) {
    componentResult.ui.forms.found = true;
    
    // Check for form submission handler
    componentResult.ui.forms.connected = HANDLER_PATTERNS.form.test(content);
    
    // Check for form validation
    componentResult.ui.forms.validated = UI_PATTERNS.forms.validation.test(content);
    
    if (componentResult.ui.forms.connected) {
      results.stats.connectedForms++;
    } else {
      results.stats.disconnectedForms++;
      componentResult.issues.push('Form may not have a submission handler');
      results.issues.push({
        component: componentName,
        issue: 'Form has no matching submission handler',
        path: relativePath
      });
    }
    
    if (!componentResult.ui.forms.validated) {
      componentResult.issues.push('Form may not have validation');
      results.issues.push({
        component: componentName,
        issue: 'Form has no visible validation logic',
        path: relativePath
      });
    }
  }
  
  // Check modals
  if (UI_PATTERNS.modals.modal.test(content) || UI_PATTERNS.modals.dialog.test(content)) {
    componentResult.ui.modals.found = true;
    
    // Check for modal handlers
    componentResult.ui.modals.connected = HANDLER_PATTERNS.modal.test(content);
    
    if (componentResult.ui.modals.connected) {
      results.stats.connectedModals++;
    } else {
      results.stats.disconnectedModals++;
      componentResult.issues.push('Modal/Dialog may not have open/close handlers');
      results.issues.push({
        component: componentName,
        issue: 'Modal/Dialog has no matching open/close handlers',
        path: relativePath
      });
    }
  }
  
  results.components[componentName] = componentResult;
  return componentResult;
}

/**
 * Generate a markdown report from results
 */
function generateReport() {
  let report = '# UI Connection Verification Report\n\n';
  report += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
  
  // Add summary
  report += '## Summary\n\n';
  report += `- Total Components Analyzed: ${Object.keys(results.components).length}\n`;
  report += `- Connected Buttons: ${results.stats.connectedButtons}\n`;
  report += `- Disconnected Buttons: ${results.stats.disconnectedButtons}\n`;
  report += `- Connected Forms: ${results.stats.connectedForms}\n`;
  report += `- Disconnected Forms: ${results.stats.disconnectedForms}\n`;
  report += `- Connected Modals: ${results.stats.connectedModals}\n`;
  report += `- Disconnected Modals: ${results.stats.disconnectedModals}\n\n`;
  
  // Add issue list
  report += '## Potential Issues\n\n';
  
  if (results.issues.length === 0) {
    report += 'No issues detected! All UI elements appear to be properly connected.\n\n';
  } else {
    report += 'The following issues were detected and should be investigated:\n\n';
    report += '| Component | Issue | Path |\n';
    report += '|-----------|-------|------|\n';
    
    results.issues.forEach(issue => {
      report += `| ${issue.component} | ${issue.issue} | ${issue.path} |\n`;
    });
    
    report += '\n';
  }
  
  // Add component details
  report += '## Component Details\n\n';
  
  Object.values(results.components).forEach(component => {
    if (component.issues.length > 0) {
      report += `### ${component.name}\n\n`;
      report += `Path: \`${component.path}\`\n\n`;
      
      // UI elements found
      report += '**UI Elements:**\n\n';
      
      // Buttons
      const foundButtons = Object.entries(component.ui.buttons)
        .filter(([_, value]) => value.found)
        .map(([type, value]) => `${type} button (${value.connected ? '✅ connected' : '❌ disconnected'})`);
      
      if (foundButtons.length > 0) {
        report += '- Buttons: ' + foundButtons.join(', ') + '\n';
      }
      
      // Forms
      if (component.ui.forms.found) {
        report += `- Form: ${component.ui.forms.connected ? '✅ connected' : '❌ disconnected'}`;
        report += `, Validation: ${component.ui.forms.validated ? '✅ present' : '❌ missing'}\n`;
      }
      
      // Modals
      if (component.ui.modals.found) {
        report += `- Modal/Dialog: ${component.ui.modals.connected ? '✅ connected' : '❌ disconnected'}\n`;
      }
      
      // Issues
      report += '\n**Issues:**\n\n';
      component.issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      
      report += '\n';
    }
  });
  
  // Add recommendations
  report += '## Recommendations\n\n';
  report += '1. **Fix Disconnected Buttons**: Ensure all buttons have corresponding handler functions\n';
  report += '2. **Verify Form Submissions**: Check that forms correctly submit data and provide feedback\n';
  report += '3. **Add Form Validation**: Implement validation for all forms to improve user experience\n';
  report += '4. **Check Modal Behavior**: Verify modals can be opened and closed properly\n';
  report += '5. **Test UI Workflows**: Conduct end-to-end testing of common UI workflows\n';
  
  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(chalk.green(`Report generated at ${OUTPUT_FILE}`));
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.green('Starting UI Connection Verification...'));
  
  // Get component files
  const componentFiles = glob.sync([
    `${COMPONENTS_DIR}/**/*.tsx`, 
    `${COMPONENTS_DIR}/**/*.jsx`,
    `${PAGES_DIR}/**/*.tsx`,
    `${PAGES_DIR}/**/*.jsx`
  ]);
  
  console.log(chalk.blue(`Found ${componentFiles.length} component files`));
  
  // Analyze each component
  componentFiles.forEach(file => {
    analyzeComponent(file);
  });
  
  // Generate the report
  generateReport();
  
  console.log(chalk.green('UI Connection Verification complete!'));
  console.log(chalk.yellow(`Connected buttons: ${results.stats.connectedButtons}, Disconnected: ${results.stats.disconnectedButtons}`));
  console.log(chalk.yellow(`Connected forms: ${results.stats.connectedForms}, Disconnected: ${results.stats.disconnectedForms}`));
  console.log(chalk.yellow(`Connected modals: ${results.stats.connectedModals}, Disconnected: ${results.stats.disconnectedModals}`));
}

main().catch(console.error);
