// ui-connection-scanner.js
// @ts-check
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find files recursively (replacement for glob)
function findFiles(dir, pattern, ignorePatterns = [], results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    // Check if the path should be ignored
    const shouldIgnore = ignorePatterns.some(pattern => 
      filePath.includes(pattern)
    );
    
    if (shouldIgnore) {
      continue;
    }
    
    if (stats.isDirectory()) {
      findFiles(filePath, pattern, ignorePatterns, results);
    } else {
      if (pattern.test(filePath)) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

// Configuration
const SRC_DIR = path.join(__dirname, 'src');
const COMPONENT_PATTERNS = {
  button: [/<Button/, /<button/, /Button\./, /MaterialButton/, /IconButton/],
  form: [/<Form/, /<form/, /useForm/, /FormControl/, /FormGroup/],
  input: [/<Input/, /<input/, /<TextField/, /<Select/, /<Checkbox/, /<Radio/],
  link: [/<Link/, /<a /, /Link\(/],
  handler: [/function handle/, /const handle/, /const on[A-Z]/, /useCallback\(\s*\(\)/, /\(\)\s*=>\s*\{/]
};

// Colors for terminal output
const colors = {
  heading: chalk.bold.blue,
  file: chalk.green,
  count: chalk.yellow,
  good: chalk.green,
  bad: chalk.red,
  info: chalk.cyan,
  warning: chalk.yellow,
  error: chalk.red.bold
};

// Function to count patterns in file content
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

// Function to analyze a single file
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Count UI elements and handlers
    const buttons = countPatterns(content, COMPONENT_PATTERNS.button);
    const forms = countPatterns(content, COMPONENT_PATTERNS.form);
    const inputs = countPatterns(content, COMPONENT_PATTERNS.input);
    const links = countPatterns(content, COMPONENT_PATTERNS.link);
    const handlers = countPatterns(content, COMPONENT_PATTERNS.handler);
    
    // Calculate ratio of UI elements to handlers
    const uiElements = buttons + forms;
    const hasElements = uiElements > 0;
    const hasHandlers = handlers > 0;
    
    // Detect potential UI connection issues
    const potentialIssue = hasElements && !hasHandlers && 
                           !filePath.includes('stories') && 
                           !filePath.includes('test') &&
                           !filePath.includes('mock');
    
    return {
      filePath: filePath.replace(__dirname, ''),
      buttons,
      forms,
      inputs,
      links,
      handlers,
      uiElements,
      hasHandlers,
      hasElements,
      potentialIssue
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

// Main scan function
function scanForUIConnections() {
  console.log(colors.heading('\n=== UI Connection Scanner ===\n'));
  
  // Find all component files using our custom finder
  const filePattern = /\.(js|jsx|ts|tsx)$/;
  const ignorePatterns = ['node_modules', '.test.', '.spec.', 'dist/'];
  const files = findFiles(SRC_DIR, filePattern, ignorePatterns);
  
  console.log(colors.info(`Scanning ${files.length} files for UI components and handlers...\n`));
  
  // Analyze each file
  const results = files.map(analyzeFile).filter(Boolean);
  
  // Calculate totals
  const totals = {
    buttons: results.reduce((sum, r) => sum + r.buttons, 0),
    forms: results.reduce((sum, r) => sum + r.forms, 0),
    inputs: results.reduce((sum, r) => sum + r.inputs, 0),
    links: results.reduce((sum, r) => sum + r.links, 0),
    handlers: results.reduce((sum, r) => sum + r.handlers, 0),
    uiElements: results.reduce((sum, r) => sum + r.uiElements, 0)
  };
  
  // Filter files with potential issues
  const potentialIssues = results.filter(r => r.potentialIssue);
  
  // Display summary
  console.log(colors.heading('=== SUMMARY ==='));
  console.log(`Total UI Elements: ${colors.count(totals.uiElements)}`);
  console.log(`  - Buttons: ${colors.count(totals.buttons)}`);
  console.log(`  - Forms: ${colors.count(totals.forms)}`);
  console.log(`  - Inputs: ${colors.count(totals.inputs)}`);
  console.log(`  - Links: ${colors.count(totals.links)}`);
  console.log(`Total Handlers: ${colors.count(totals.handlers)}`);
  
  // Display handler to UI element ratio
  const ratio = totals.handlers / totals.uiElements;
  console.log(`\nHandler to UI Element Ratio: ${colors.count(ratio.toFixed(2))}`);
  
  if (ratio >= 0.8) {
    console.log(colors.good('✅ Good handler coverage (>= 0.8)'));
  } else if (ratio >= 0.5) {
    console.log(colors.warning('⚠️ Moderate handler coverage (>= 0.5)'));
  } else {
    console.log(colors.bad('❌ Poor handler coverage (< 0.5)'));
  }
  
  // Display files with potential issues
  if (potentialIssues.length > 0) {
    console.log(colors.heading('\n=== POTENTIAL ISSUES ==='));
    console.log(colors.warning(`Found ${potentialIssues.length} files with UI elements but no handlers:`));
    
    potentialIssues.forEach(issue => {
      console.log(`\n${colors.file(issue.filePath)}`);
      console.log(`  Buttons: ${issue.buttons}, Forms: ${issue.forms}, Inputs: ${issue.inputs}, Links: ${issue.links}`);
      console.log(`  Handlers: ${colors.bad('0')}`);
    });
    
    console.log(colors.info('\nRecommendation: Check these files for disconnected UI elements'));
  } else {
    console.log(colors.good('\n✅ No files with potential UI connection issues found!'));
  }
  
  // Generate report file
  const report = {
    scanDate: new Date().toISOString(),
    summary: {
      totalFiles: results.length,
      ...totals,
      ratio,
      potentialIssuesCount: potentialIssues.length
    },
    potentialIssues: potentialIssues.map(i => ({
      file: i.filePath,
      buttons: i.buttons,
      forms: i.forms,
      inputs: i.inputs,
      links: i.links
    }))
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'ui-connection-report.json'), 
    JSON.stringify(report, null, 2)
  );
  
  console.log(colors.info('\nDetailed report saved to ui-connection-report.json'));
}

// Run the scanner
try {
  scanForUIConnections();
} catch (err) {
  console.error(colors.error('Error scanning UI connections:'), err);
}
