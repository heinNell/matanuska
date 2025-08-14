// ui-simple-test.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define colors for console output
const colors = {
  blue: text => `\x1b[34m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`,
  magenta: text => `\x1b[35m${text}\x1b[0m`,
  bold: text => `\x1b[1m${text}\x1b[0m`
};

// Configuration
const SRC_DIR = path.join(__dirname, 'src');
const COMPONENT_PATTERNS = {
  button: [/<Button/, /<button/, /Button\./, /MaterialButton/, /IconButton/],
  form: [/<Form/, /<form/, /useForm/, /FormControl/, /FormGroup/],
  input: [/<Input/, /<input/, /<TextField/, /<Select/, /<Checkbox/, /<Radio/],
  link: [/<Link/, /<a /, /Link\(/],
  handler: [/function handle/, /const handle/, /const on[A-Z]/, /useCallback\(\s*\(\)/, /\(\)\s*=>\s*\{/]
};

// Find files recursively
function findFiles(dir, extensions) {
  const result = [];
  
  function scan(directory) {
    try {
      const files = fs.readdirSync(directory);
      
      for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
          scan(fullPath);
        } else if (extensions.some(ext => file.endsWith(ext))) {
          result.push(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error scanning directory ${directory}:`, err);
    }
  }
  
  scan(dir);
  return result;
}

// Count pattern occurrences in content
function countPatterns(content, patterns) {
  let count = 0;
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

// Analyze a single file
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const buttons = countPatterns(content, COMPONENT_PATTERNS.button);
    const forms = countPatterns(content, COMPONENT_PATTERNS.form);
    const inputs = countPatterns(content, COMPONENT_PATTERNS.input);
    const links = countPatterns(content, COMPONENT_PATTERNS.link);
    const handlers = countPatterns(content, COMPONENT_PATTERNS.handler);
    
    const uiElements = buttons + forms;
    const hasIssue = uiElements > 0 && handlers === 0 && 
                     !filePath.includes('test') &&
                     !filePath.includes('mock') &&
                     !filePath.includes('stories');
    
    return {
      path: filePath.replace(__dirname, ''),
      buttons,
      forms, 
      inputs,
      links,
      handlers,
      hasIssue
    };
  } catch (err) {
    console.error(`Error analyzing file ${filePath}:`, err);
    return null;
  }
}

// Main function to scan UI connections
function scanUIConnections() {
  console.log(colors.bold(`\n=== UI Connection Test (${new Date().toISOString()}) ===\n`));
  
  // Find component files
  console.log(colors.cyan('Finding React component files...'));
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  const files = findFiles(SRC_DIR, extensions);
  console.log(colors.green(`Found ${files.length} files to analyze\n`));
  
  // Analyze files
  console.log(colors.cyan('Analyzing UI components and their handlers...'));
  const results = files.map(analyzeFile).filter(Boolean);
  
  // Calculate totals
  const totals = results.reduce((acc, file) => {
    acc.buttons += file.buttons;
    acc.forms += file.forms;
    acc.inputs += file.inputs;
    acc.links += file.links;
    acc.handlers += file.handlers;
    return acc;
  }, { buttons: 0, forms: 0, inputs: 0, links: 0, handlers: 0 });
  
  // Find potential issues
  const issues = results.filter(file => file.hasIssue);
  
  // Display summary
  console.log(colors.bold('\n=== Results Summary ==='));
  console.log(`UI Components: ${colors.yellow(totals.buttons + totals.forms)}`);
  console.log(`  - Buttons: ${colors.yellow(totals.buttons)}`);
  console.log(`  - Forms: ${colors.yellow(totals.forms)}`);
  console.log(`  - Inputs: ${colors.yellow(totals.inputs)}`);
  console.log(`  - Links: ${colors.yellow(totals.links)}`);
  console.log(`Handlers: ${colors.yellow(totals.handlers)}`);
  
  const ratio = totals.handlers / (totals.buttons + totals.forms) || 0;
  const formattedRatio = (ratio * 100).toFixed(1);
  
  if (ratio >= 0.8) {
    console.log(`\nHandler-to-Component Ratio: ${colors.green(formattedRatio + '%')}`);
    console.log(colors.green('✅ Good handler coverage (>= 80%)'));
  } else if (ratio >= 0.5) {
    console.log(`\nHandler-to-Component Ratio: ${colors.yellow(formattedRatio + '%')}`);
    console.log(colors.yellow('⚠️ Moderate handler coverage (>= 50%)'));
  } else {
    console.log(`\nHandler-to-Component Ratio: ${colors.red(formattedRatio + '%')}`);
    console.log(colors.red('❌ Poor handler coverage (< 50%)'));
  }
  
  // Display potential issues
  if (issues.length > 0) {
    console.log(colors.bold('\n=== Potential Issues ==='));
    console.log(`Found ${issues.length} files with UI components but no handlers:\n`);
    
    issues.forEach(issue => {
      console.log(colors.yellow(issue.path));
      console.log(`  Buttons: ${issue.buttons}, Forms: ${issue.forms}, Handlers: 0\n`);
    });
    
    console.log(colors.cyan('Recommendation: Check the above files for disconnected UI elements'));
  } else {
    console.log(colors.green('\n✅ No files with potential UI connection issues found!'));
  }
  
  // Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: results.length,
      ...totals,
      ratio,
      issueCount: issues.length
    },
    issues: issues.map(issue => ({
      file: issue.path,
      buttons: issue.buttons,
      forms: issue.forms,
      inputs: issue.inputs,
      links: issue.links
    }))
  };
  
  const reportPath = path.join(__dirname, 'ui-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(colors.cyan(`\nDetailed report saved to: ${reportPath}`));
  
  return {
    issues: issues.length,
    ratio: ratio
  };
}

// Run the test
try {
  const result = scanUIConnections();
  
  // Add recommendations based on test results
  console.log(colors.bold('\n=== Next Steps ==='));
  
  if (result.issues > 0) {
    console.log('1. Fix the identified disconnected UI elements by adding proper event handlers');
    console.log('2. Use the UIConnector component for visual identification of disconnected elements');
    console.log('3. Run this test again after making changes to verify improvements');
    console.log('\nTo inject the UI Connector for visual testing:');
    console.log('   npm run test:ui:interactive');
  } else if (result.ratio < 0.9) {
    console.log('1. Your UI connections look good, but there\'s still room for improvement');
    console.log('2. Consider adding more handlers to reach a 90%+ connection ratio');
    console.log('3. Use the UIConnector component to visually verify all connections');
  } else {
    console.log(colors.green('✅ Your UI connections look great! Ready for deployment.'));
    console.log('To prepare for deployment:');
    console.log('1. Run comprehensive tests: npm run test:all');
    console.log('2. Build for production: npm run build');
    console.log('3. Deploy using: npm run deploy');
  }
} catch (error) {
  console.error(colors.red('Error running UI connection test:'), error);
  process.exit(1);
}
