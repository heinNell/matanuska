// ui-tester-setup.js
/**
 * This script will automatically inject the UIConnector component into your app's development build
 * by creating a temporary wrapper around your main App component.
 */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const APP_FILE_PATH = path.join(__dirname, 'src', 'App.tsx');
const BACKUP_FILE_PATH = path.join(__dirname, 'src', 'App.tsx.backup');
const UI_CONNECTOR_IMPORT = "import UIConnector from './components/testing/UIConnector';\n";
const UI_CONNECTOR_ELEMENT = '<UIConnector />';

// Helper functions
function colorLog(color, message) {
  console.log(chalk[color](message));
}

// Check if backup already exists
function backupExists() {
  return fs.existsSync(BACKUP_FILE_PATH);
}

// Create backup of App.tsx
function createBackup() {
  try {
    if (!backupExists()) {
      fs.copyFileSync(APP_FILE_PATH, BACKUP_FILE_PATH);
      colorLog('green', '✅ Created backup of App.tsx');
    } else {
      colorLog('yellow', '⚠️ Backup already exists, skipping backup creation');
    }
  } catch (error) {
    colorLog('red', `❌ Error creating backup: ${error.message}`);
    process.exit(1);
  }
}

// Restore App.tsx from backup
function restoreFromBackup() {
  try {
    if (backupExists()) {
      fs.copyFileSync(BACKUP_FILE_PATH, APP_FILE_PATH);
      fs.unlinkSync(BACKUP_FILE_PATH);
      colorLog('green', '✅ Restored App.tsx from backup');
    } else {
      colorLog('yellow', '⚠️ No backup found to restore from');
    }
  } catch (error) {
    colorLog('red', `❌ Error restoring from backup: ${error.message}`);
    process.exit(1);
  }
}

// Inject UIConnector component
function injectUIConnector() {
  try {
    // Read the App component file
    let appContent = fs.readFileSync(APP_FILE_PATH, 'utf8');
    
    // Check if UIConnector is already injected
    if (appContent.includes('UIConnector')) {
      colorLog('yellow', '⚠️ UIConnector already injected, skipping');
      return;
    }
    
    // Add import statement for UIConnector
    const importStatements = appContent.match(/import.*from.*;/g) || [];
    const lastImport = importStatements[importStatements.length - 1];
    
    appContent = appContent.replace(
      lastImport,
      `${lastImport}\n${UI_CONNECTOR_IMPORT}`
    );
    
    // Find the return statement in the App component
    const returnPattern = /return\s*\(\s*</;
    const returnMatch = appContent.match(returnPattern);
    
    if (!returnMatch) {
      throw new Error('Could not find return statement in App component');
    }
    
    // Find the closing tag of the main component
    const closingPattern = />\s*\)\s*;?\s*$/;
    const closingMatch = appContent.match(closingPattern);
    
    if (!closingMatch) {
      throw new Error('Could not find closing tag in App component');
    }
    
    // Insert UIConnector component before the closing tag
    const insertPosition = appContent.lastIndexOf(closingMatch[0]);
    const modifiedContent = 
      appContent.slice(0, insertPosition) + 
      `\n      ${UI_CONNECTOR_ELEMENT}` + 
      appContent.slice(insertPosition);
    
    // Write the modified content back to the file
    fs.writeFileSync(APP_FILE_PATH, modifiedContent);
    
    colorLog('green', '✅ Successfully injected UIConnector into App component');
  } catch (error) {
    colorLog('red', `❌ Error injecting UIConnector: ${error.message}`);
    process.exit(1);
  }
}

// Main function
function main() {
  const action = process.argv[2];
  
  if (!action || !['inject', 'restore', 'status'].includes(action)) {
    colorLog('cyan', 'Usage: node ui-tester-setup.js [inject|restore|status]');
    colorLog('cyan', '  - inject: Inject UIConnector for interactive testing');
    colorLog('cyan', '  - restore: Remove UIConnector and restore original App');
    colorLog('cyan', '  - status: Check if UIConnector is currently injected');
    return;
  }
  
  if (action === 'status') {
    const hasBackup = backupExists();
    const appContent = fs.readFileSync(APP_FILE_PATH, 'utf8');
    const hasConnector = appContent.includes('UIConnector');
    
    colorLog('blue', '\n=== UI Tester Status ===');
    colorLog(hasConnector ? 'green' : 'yellow', 
      `UIConnector: ${hasConnector ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
    colorLog(hasBackup ? 'green' : 'yellow', 
      `Backup: ${hasBackup ? 'EXISTS ✅' : 'NONE ❌'}`);
    
    return;
  }
  
  if (action === 'inject') {
    colorLog('blue', 'Injecting UIConnector component for testing...');
    createBackup();
    injectUIConnector();
    colorLog('green', '\nDone! Restart your development server to see changes.');
    colorLog('cyan', 'When finished testing, run: node ui-tester-setup.js restore');
  } else if (action === 'restore') {
    colorLog('blue', 'Restoring App component from backup...');
    restoreFromBackup();
    colorLog('green', '\nDone! Restart your development server to see changes.');
  }
}

main();
