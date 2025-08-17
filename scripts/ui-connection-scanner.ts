// ui-connection-scanner.ts
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Simple colorize function for output (replacing chalk)
function colorize(text: string, color: 'blue' | 'green' | 'yellow' | 'red' | 'cyan' | 'bold-blue'): string {
  const colors = {
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    'bold-blue': '\x1b[1;34m',
    reset: '\x1b[0m',
  };

  const colorCode = colors[color] || '';
  return colorCode + text + colors.reset;
}

// Get current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types for our data structures
interface FileAnalysis {
  filePath: string;
  buttons: number;
  forms: number;
  inputs: number;
  links: number;
  handlers: number;
  uiElements: number;
  hasHandlers: boolean;
  hasElements: boolean;
  potentialIssue: boolean;
}

interface SummaryTotals {
  buttons: number;
  forms: number;
  inputs: number;
  links: number;
  handlers: number;
  uiElements: number;
}

interface ReportData {
  scanDate: string;
  summary: {
    totalFiles: number;
    buttons: number;
    forms: number;
    inputs: number;
    links: number;
    handlers: number;
    uiElements: number;
    ratio: number;
    potentialIssuesCount: number;
  };
  potentialIssues: Array<{
    file: string;
    buttons: number;
    forms: number;
    inputs: number;
    links: number;
  }>;
}

// Function to find files recursively (replacement for glob)
function findFiles(
  dir: string,
  pattern: RegExp,
  ignorePatterns: string[] = [],
  results: string[] = []
): string[] {
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
const SRC_DIR = path.join(__dirname, '..', 'src');
const COMPONENT_PATTERNS = {
  button: [/<Button/, /<button/, /Button\./, /MaterialButton/, /IconButton/],
  form: [/<Form/, /<form/, /useForm/, /FormControl/, /FormGroup/],
  input: [/<Input/, /<input/, /<TextField/, /<Select/, /<Checkbox/, /<Radio/],
  link: [/<Link/, /<a /, /Link\(/],
  handler: [/function handle/, /const handle/, /const on[A-Z]/, /useCallback\(\s*\(\)/, /\(\)\s*=>\s*\{/]
};

// Colors for terminal output
const colors = {
  heading: (text: string) => colorize(text, 'bold-blue'),
  file: (text: string) => colorize(text, 'green'),
  count: (text: string | number) => colorize(String(text), 'yellow'),
  good: (text: string) => colorize(text, 'green'),
  bad: (text: string) => colorize(text, 'red'),
  info: (text: string) => colorize(text, 'cyan'),
  warning: (text: string) => colorize(text, 'yellow'),
  error: (text: string) => colorize(text, 'red')
};

// Function to count patterns in file content
function countPatterns(content: string, patterns: RegExp[]): number {
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
function analyzeFile(filePath: string): FileAnalysis | null {
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
    console.error(`Error analyzing ${filePath}:`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

// Main scan function
function scanForUIConnections(): void {
  console.log(colors.heading('\n=== UI Connection Scanner ===\n'));

  // Find all component files using our custom finder
  const filePattern = /\.(js|jsx|ts|tsx)$/;
  const ignorePatterns = ['node_modules', '.test.', '.spec.', 'dist/'];
  const files = findFiles(SRC_DIR, filePattern, ignorePatterns);

  console.log(colors.info(`Scanning ${files.length} files for UI components and handlers...\n`));

  // Analyze each file
  const results = files.map(analyzeFile).filter((r): r is FileAnalysis => r !== null);

  // Calculate totals
  const totals: SummaryTotals = {
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
  const ratio = totals.uiElements > 0 ? totals.handlers / totals.uiElements : 1;
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
  const report: ReportData = {
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
    path.join(__dirname, '..', 'ui-connection-report.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(colors.info(`\nReport written to ui-connection-report.json`));
}

// Execute the scanner
scanForUIConnections();
