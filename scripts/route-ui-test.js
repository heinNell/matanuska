// route-ui-test.js
/**
 * This script helps generate a test plan for UI interactions
 * Rather than using Puppeteer, which might be difficult to install,
 * it provides guidance on what to manually test
 */
// @ts-check

// Simple color functions
const log = {
  blue: (text) => console.log(`\x1b[34m${text}\x1b[0m`),
  green: (text) => console.log(`\x1b[32m${text}\x1b[0m`),
  yellow: (text) => console.log(`\x1b[33m${text}\x1b[0m`),
  red: (text) => console.log(`\x1b[31m${text}\x1b[0m`),
  cyan: (text) => console.log(`\x1b[36m${text}\x1b[0m`),
  magenta: (text) => console.log(`\x1b[35m${text}\x1b[0m`),
  highlight: (text) => console.log(`\x1b[1;36m${text}\x1b[0m`),
};

// Configuration
const APP_URL = process.env.APP_URL || 'http://localhost:5173'; // Default Vite dev server
const ROUTES_TO_TEST = [
  '/',
  '/fleets',
  '/vehicles',
  '/drivers',
  '/trips',
  '/reports',
  '/settings'
];

// Log colors
const colors = {
  info: chalk.blue,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red.bold,
  highlight: chalk.cyan,
  route: chalk.magenta
};

// UI Element selectors 
const selectors = {
  buttons: 'button, input[type="submit"], input[type="button"], .btn, [role="button"]',
  forms: 'form',
  inputs: 'input:not([type="submit"]):not([type="button"]), select, textarea',
  links: 'a:not(.btn)'
};

// Helper function to log with timestamp
function logWithTime(color, message) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${colors.highlight(`[${timestamp}]`)} ${color(message)}`);
}

// Function to count UI elements on a page
async function countUIElements(page) {
  const counts = await page.evaluate((sel) => {
    return {
      buttons: document.querySelectorAll(sel.buttons).length,
      forms: document.querySelectorAll(sel.forms).length, 
      inputs: document.querySelectorAll(sel.inputs).length,
      links: document.querySelectorAll(sel.links).length
    };
  }, selectors);
  
  return counts;
}

// Function to detect console errors
async function setupConsoleErrorDetection(page) {
  const errors = [];
  
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });
  
  return errors;
}

// Function to test interaction with UI element
async function testUIInteraction(page, route) {
  // Find all clickable elements
  const clickableElements = await page.evaluate((sel) => {
    const buttons = Array.from(document.querySelectorAll(sel.buttons));
    const links = Array.from(document.querySelectorAll(sel.links))
      .filter(a => a.getAttribute('href') && !a.getAttribute('href').startsWith('http'));
    
    return [...buttons, ...links].map((el, index) => {
      const rect = el.getBoundingClientRect();
      return {
        index,
        type: el.tagName.toLowerCase(),
        text: el.innerText || el.textContent || el.value || `[${el.tagName}]`,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        visible: rect.width > 0 && rect.height > 0 && 
                rect.top >= 0 && rect.left >= 0 &&
                rect.bottom <= window.innerHeight && 
                rect.right <= window.innerWidth
      };
    }).filter(el => el.visible);
  }, selectors);
  
  // Test up to 3 UI elements
  const elementsToTest = clickableElements.slice(0, 3);
  const results = [];
  
  for (const element of elementsToTest) {
    try {
      logWithTime(colors.info, `Testing ${element.type}: "${element.text.trim()}"`);
      
      // Record current URL
      const startUrl = page.url();
      
      // Click the element
      await page.mouse.click(element.x, element.y);
      
      // Wait for any potential navigation or DOM changes
      await page.waitForTimeout(1000);
      
      // Record new URL
      const newUrl = page.url();
      
      // Check if URL changed (navigation occurred)
      const didNavigate = startUrl !== newUrl;
      
      // Check for UI changes
      const uiChanges = await page.evaluate(() => {
        const changes = [];
        
        // Check for modal dialogs
        const modals = document.querySelectorAll('.modal, [role="dialog"]');
        if (modals.length > 0) changes.push('modal opened');
        
        // Check for alert/notification elements
        const alerts = document.querySelectorAll('.alert, .notification, .toast');
        if (alerts.length > 0) changes.push('alert/notification displayed');
        
        // Check for form submission feedback
        const feedback = document.querySelectorAll('.form-feedback, .success-message, .error-message');
        if (feedback.length > 0) changes.push('form feedback displayed');
        
        return changes;
      });
      
      results.push({
        element: `${element.type}: "${element.text.trim()}"`,
        didNavigate,
        newUrl: didNavigate ? newUrl : null,
        uiChanges: uiChanges.length > 0 ? uiChanges : null,
        success: didNavigate || uiChanges.length > 0
      });
      
      // Go back if navigation occurred
      if (didNavigate) {
        await page.goBack();
        await page.waitForTimeout(500);
      }
    } catch (error) {
      results.push({
        element: `${element.type}: "${element.text.trim()}"`,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
}

// Generate manual test plan
function generateTestPlan() {
  const timestamp = new Date().toISOString().split('T')[0];
  log.highlight(`\n=== UI TESTING PLAN (${timestamp}) ===\n`);
  
  log.blue('This script generates a manual UI testing plan instead of running automated tests.');
  log.blue('Follow these steps to manually verify UI connections across routes:\n');
  
  log.highlight('TESTING INSTRUCTIONS:');
  console.log('1. Start your development server with: npm run dev');
  console.log('2. Install the UI Connector with: npm run test:ui:interactive');
  console.log('3. Open your browser and navigate to your app\n');
  
  log.highlight('ROUTES TO TEST:');
  ROUTES_TO_TEST.forEach((route, index) => {
    console.log(`${index + 1}. \x1b[35m${route}\x1b[0m`);
  });
  
  log.highlight('\nFOR EACH ROUTE:');
  console.log('1. Navigate to the route');
  console.log('2. Use the UI Connector panel (bottom right) to:');
  console.log('   - Check for disconnected buttons (will highlight in red)');
  console.log('   - Check for disconnected forms');
  console.log('   - Note any UI elements that should respond but don\'t');
  console.log('3. Test at least 3 main interactions:');
  console.log('   - Click primary action buttons');
  console.log('   - Submit forms if available');
  console.log('   - Test navigation links');
  console.log('4. Watch for:');
  console.log('   - Console errors (open browser dev tools)');
  console.log('   - Visual feedback when actions are performed');
  console.log('   - Proper navigation between routes');
  
  log.highlight('\nCOMMON ISSUES TO CHECK:');
  console.log('- Buttons that don\'t respond to clicks');
  console.log('- Forms that don\'t submit or validate');
  console.log('- Error messages not displayed properly');
  console.log('- Navigation not working as expected');
  console.log('- Missing visual feedback for user actions');
  
  log.highlight('\nRECORD YOUR FINDINGS:');
  console.log('Create a ui-test-results.md file with the following format:');
  console.log('```');
  console.log('# UI Testing Results');
  console.log('');
  console.log('## Route: /example');
  console.log('- ✅ All buttons connected and functional');
  console.log('- ❌ Form submission not working (describe issue)');
  console.log('- ⚠️ Navigation partially working (describe issue)');
  console.log('');
  console.log('## Route: /another-example');
  console.log('// Continue for each route');
  console.log('```');
  
  // Create test report template file
  const fs = require('fs');
  const templatePath = './ui-test-template.md';
  
  let template = '# UI Testing Results\n\n';
  template += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
  
  ROUTES_TO_TEST.forEach(route => {
    template += `## Route: ${route}\n`;
    template += '- [ ] Buttons respond to clicks\n';
    template += '- [ ] Forms submit properly\n';
    template += '- [ ] Navigation works as expected\n';
    template += '- [ ] No console errors\n';
    template += '\nNotes:\n\n';
    template += '---\n\n';
  });
  
  fs.writeFileSync(templatePath, template);
  log.green(`\nTest plan template created at: ${templatePath}\n`);
}

// Run the generator
generateTestPlan();
