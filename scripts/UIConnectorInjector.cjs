// UIConnectorInjector.js - Helps integrate UIConnector into App.tsx for testing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App file path
const APP_FILE = path.join(__dirname, 'src', 'App.tsx');

// Import statement to add
const IMPORT_STATEMENT = `import UIConnector from './components/UIConnector';`;

// JSX to inject
const UI_CONNECTOR_JSX = `{process.env.NODE_ENV !== 'production' && <UIConnector />}`;

function injectUIConnector() {
  try {
    console.log('Reading App.tsx...');
    let appContent = fs.readFileSync(APP_FILE, 'utf8');
    
    // Check if UIConnector is already imported
    if (appContent.includes('import UIConnector')) {
      console.log('UIConnector already imported in App.tsx');
    } else {
      // Add import statement after the last import
      const lastImportIndex = appContent.lastIndexOf('import');
      const lastImportEndIndex = appContent.indexOf('\n', lastImportIndex);
      
      if (lastImportIndex !== -1) {
        appContent = 
          appContent.slice(0, lastImportEndIndex + 1) + 
          IMPORT_STATEMENT + '\n' + 
          appContent.slice(lastImportEndIndex + 1);
        
        console.log('Added UIConnector import statement');
      } else {
        console.log('Could not find import statements in App.tsx');
        return;
      }
    }
    
    // Check if UIConnector component is already added
    if (appContent.includes('<UIConnector')) {
      console.log('UIConnector component already added to App.tsx');
      return;
    }
    
    // Find the main return statement to inject the UIConnector
    const returnRegex = /return\s*\(\s*(<.*>)/;
    const match = appContent.match(returnRegex);
    
    if (match) {
      // Determine if there's a fragment or direct component
      const firstTag = match[1];
      
      if (firstTag.includes('<>') || firstTag.includes('<React.Fragment')) {
        // Insert before the closing fragment tag
        const closingFragmentIndex = appContent.lastIndexOf('</>');
        if (closingFragmentIndex !== -1) {
          appContent = 
            appContent.slice(0, closingFragmentIndex) + 
            '      ' + UI_CONNECTOR_JSX + '\n      ' + 
            appContent.slice(closingFragmentIndex);
          
          console.log('Added UIConnector inside fragment');
        } else {
          console.log('Could not find closing fragment tag');
          return;
        }
      } else {
        // Wrap existing component in a fragment and add UIConnector
        const returnStartIndex = appContent.indexOf('return (');
        const returnContentStart = appContent.indexOf('<', returnStartIndex);
        const depth = 1;
        let returnContentEnd = -1;
        
        // Find the matching closing bracket for the return statement
        for (let i = returnContentStart + 1; i < appContent.length; i++) {
          if (appContent[i] === '<' && appContent[i+1] === '/') {
            returnContentEnd = appContent.indexOf('>', i) + 1;
            break;
          }
        }
        
        if (returnContentEnd !== -1) {
          const beforeReturn = appContent.slice(0, returnStartIndex + 8);
          const returnContent = appContent.slice(returnContentStart, returnContentEnd);
          const afterReturn = appContent.slice(returnContentEnd);
          
          appContent = 
            beforeReturn + 
            '<>\n      ' + 
            returnContent + '\n      ' + 
            UI_CONNECTOR_JSX + '\n    ' + 
            '</>' + 
            afterReturn;
          
          console.log('Wrapped component in fragment and added UIConnector');
        } else {
          console.log('Could not find end of return statement');
          return;
        }
      }
    } else {
      console.log('Could not find return statement in App.tsx');
      return;
    }
    
    // Write the modified content back to App.tsx
    fs.writeFileSync(APP_FILE, appContent);
    console.log('Successfully injected UIConnector into App.tsx');
    console.log('\nNow you can run your app and the UIConnector will be active.');
    console.log('Look for the UI Connector controls in the bottom right corner of your app.');
  } catch (error) {
    console.error('Error injecting UIConnector:', error);
  }
}

function removeUIConnector() {
  try {
    console.log('Reading App.tsx...');
    let appContent = fs.readFileSync(APP_FILE, 'utf8');
    
    // Remove import statement
    const importRegex = new RegExp(`${IMPORT_STATEMENT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`);
    appContent = appContent.replace(importRegex, '');
    
    // Remove UIConnector component
    const uiConnectorRegex = new RegExp(`\\s*${UI_CONNECTOR_JSX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n?`);
    appContent = appContent.replace(uiConnectorRegex, '');
    
    // Write the modified content back to App.tsx
    fs.writeFileSync(APP_FILE, appContent);
    console.log('Successfully removed UIConnector from App.tsx');
  } catch (error) {
    console.error('Error removing UIConnector:', error);
  }
}

// Process command line arguments
const command = process.argv[2];

if (command === 'inject') {
  injectUIConnector();
} else if (command === 'remove') {
  removeUIConnector();
} else {
  console.log(`
Usage: node UIConnectorInjector.js [command]

Commands:
  inject  - Add UIConnector to App.tsx for interactive testing
  remove  - Remove UIConnector from App.tsx

Example:
  node UIConnectorInjector.js inject
  `);
}
