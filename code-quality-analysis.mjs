#!/usr/bin/env node
/* eslint-env node */
/* global console, process */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
};

/**
 * Custom colorize function to replace chalk
 * @param {string} text - The text to colorize
 * @param {string} color - The color name
 * @returns {string} - The colorized text
 */
function colorize(text, color, bold = false) {
  if (!colors[color]) return text;
  return `${bold ? colors.bold : ""}${colors[color]}${text}${colors.reset}`;
}

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the src directory
const srcDir = path.join(__dirname, "..", "src");

// Define the file types to scan
const fileTypesToScan = [".ts", ".tsx", ".js", ".jsx"];

// Define patterns specific to Matanuska project
const MATANUSKA_PATTERNS = {
  // Special files that should never be marked as unused even if not imported
  ESSENTIAL_FILES: [
    /App\.\w+$/,
    /main\.\w+$/,
    /index\.\w+$/,
    /vite-env\.\w+$/,
    /firebase\.\w+$/,
    /firebaseConfig\.\w+$/,
    /AppRoutes\.\w+$/,
    /SidebarConfig\.\w+$/,
  ],
  // Common component pattern for the Matanuska project
  COMPONENT_PATTERN:
    /React\.FC|function\s+\w+\s*\([\w\s{}:]*\)|const\s+\w+\s*=\s*\([\w\s{}:]*\)\s*=>/,
  // Files that may be lazy loaded or dynamically imported
  LAZY_LOADED_PATTERN: /React\.lazy\(|import\(|lazy\(/,
};

// Store the import data
const imports = new Map();
const exports = new Map();
const files = new Map();
const unusedFiles = [];
const circularDependencies = [];

// Additional data for Matanuska specific patterns
const lazyLoadedComponents = new Set();

/**
 * Scans all files in the specified directory and its subdirectories
 * @param {string} dir - The directory to scan
 * @returns {Array<string>} - Array of file paths
 */
function scanFiles(dir) {
  const allFiles = [];

  function scan(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith("node_modules")) {
        scan(fullPath);
      } else if (entry.isFile() && fileTypesToScan.includes(path.extname(entry.name))) {
        allFiles.push(fullPath);
      }
    }
  }

  scan(dir);
  return allFiles;
}

/**
 * Analyzes a file for imports and exports
 * @param {string} filePath - Path to the file
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(srcDir, filePath);

  // Store file info
  files.set(filePath, {
    path: filePath,
    relativePath,
    content,
    size: fs.statSync(filePath).size,
    imports: [],
    exports: [],
    isImported: false,
  });

  // Extract imports
  const importRegex = /import\s+(?:{[\s\w,]*}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const fileInfo = files.get(filePath);

    // Add to file's imports
    fileInfo.imports.push(importPath);

    // Update global imports map
    if (!imports.has(importPath)) {
      imports.set(importPath, []);
    }

    imports.get(importPath).push(filePath);
  }

  // Extract exports
  const exportRegex =
    /export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g;
  while ((match = exportRegex.exec(content)) !== null) {
    const exportName = match[1];
    const fileInfo = files.get(filePath);

    // Add to file's exports
    fileInfo.exports.push(exportName);

    // Update global exports map
    if (!exports.has(exportName)) {
      exports.set(exportName, []);
    }

    exports.get(exportName).push(filePath);
  }
}

/**
 * Extract lazy loaded components
 */
function extractLazyLoadedComponents() {
  for (const [filePath, fileInfo] of files.entries()) {
    // Look for React.lazy or dynamic import patterns
    const lazyMatches =
      fileInfo.content.match(
        /const\s+(\w+)\s*=\s*(?:React\.)?lazy\s*\(\s*\(?.*?\)?\s*=>\s*import\(['"](.*?)['"]\)/g
      ) || [];

    for (const match of lazyMatches) {
      // Extract the component name and path
      const componentMatch = match.match(/const\s+(\w+)\s*=/);
      if (componentMatch && componentMatch[1]) {
        lazyLoadedComponents.add(componentMatch[1]);
      }

      // Extract the import path
      const importMatch = match.match(/import\(['"](.*?)['"]\)/);
      if (importMatch && importMatch[1]) {
        const importPath = importMatch[1];

        // Add this to our imports map to mark the file as imported
        if (!imports.has(importPath)) {
          imports.set(importPath, []);
        }
        imports.get(importPath).push(filePath);
      }
    }

    // Also check for direct dynamic imports
    const dynamicImports = fileInfo.content.match(/import\(['"](.*?)['"]\)/g) || [];
    for (const match of dynamicImports) {
      const importMatch = match.match(/import\(['"](.*?)['"]\)/);
      if (importMatch && importMatch[1]) {
        const importPath = importMatch[1];

        if (!imports.has(importPath)) {
          imports.set(importPath, []);
        }
        imports.get(importPath).push(filePath);
      }
    }
  }
}

/**
 * Checks for unused files
 */
function checkUnusedFiles() {
  // First extract all lazy loaded components
  extractLazyLoadedComponents();

  for (const [filePath, fileInfo] of files.entries()) {
    // Skip files imported by others
    let isUsed = false;

    // Check if file is imported
    for (const importPath of imports.keys()) {
      const normalizedImportPath = importPath.startsWith(".")
        ? path.normalize(path.join(path.dirname(filePath), importPath))
        : importPath;

      // If this file is imported by another file, it's used
      if (normalizedImportPath.includes(fileInfo.relativePath.replace(/\.\w+$/, ""))) {
        isUsed = true;
        fileInfo.isImported = true;
        break;
      }
    }

    // Check for Matanuska-specific patterns - components used in sidebar config
    if (!isUsed && fileInfo.content.includes("React.FC")) {
      const componentName = path.basename(filePath).replace(/\.\w+$/, "");

      // Check all files for references to this component in sidebar config
      for (const [_, otherFileInfo] of files.entries()) {
        if (
          otherFileInfo.content.includes(`component: "${componentName}"`) ||
          otherFileInfo.content.includes(`component: '${componentName}'`) ||
          otherFileInfo.content.includes(`component: ${componentName}`)
        ) {
          isUsed = true;
          break;
        }
      }
    }

    // Check if file is part of a barrel export (index.ts)
    if (
      !isUsed &&
      path.basename(path.dirname(filePath)) === path.basename(filePath, path.extname(filePath))
    ) {
      const dirPath = path.dirname(filePath);
      const indexPath = path.join(dirPath, "index.ts");

      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, "utf8");
        const componentName = path.basename(filePath, path.extname(filePath));

        if (indexContent.includes(`from './${componentName}'`)) {
          isUsed = true;
        }
      }
    }

    // Check if file exports something used elsewhere
    if (!isUsed && fileInfo.exports.length > 0) {
      for (const exportName of fileInfo.exports) {
        // If this export is used elsewhere, the file is used
        for (const [_, otherFileInfo] of files.entries()) {
          if (
            otherFileInfo.content.includes(`import { ${exportName} `) ||
            otherFileInfo.content.includes(`import {${exportName} `) ||
            otherFileInfo.content.includes(`import {${exportName},`) ||
            otherFileInfo.content.includes(`import { ${exportName},`)
          ) {
            isUsed = true;
            break;
          }
        }

        if (isUsed) break;
      }
    }

    // If file is not used, add to unused files
    if (!isUsed && !isEntryPoint(filePath)) {
      unusedFiles.push({
        path: fileInfo.relativePath,
        type: getFileType(filePath),
        reason: "Not imported or used by any other file",
        confidence: getUnusedConfidence(filePath),
      });
    }
  }
}

/**
 * Check for circular dependencies
 */
function checkCircularDependencies() {
  for (const [filePath, fileInfo] of files.entries()) {
    checkDependencyCycle(filePath, new Set(), []);
  }
}

/**
 * Recursively check for dependency cycles
 * @param {string} filePath - Current file path
 * @param {Set<string>} visited - Set of visited files
 * @param {Array<string>} path - Current dependency path
 */
function checkDependencyCycle(filePath, visited, depPath) {
  if (visited.has(filePath)) {
    if (depPath[0] === filePath) {
      // Found a cycle
      circularDependencies.push([...depPath, filePath]);
    }
    return;
  }

  visited.add(filePath);
  depPath.push(filePath);

  const fileInfo = files.get(filePath);
  if (!fileInfo) return;

  for (const importPath of fileInfo.imports) {
    if (importPath.startsWith(".")) {
      const resolvedPath = resolveImportPath(filePath, importPath);
      if (resolvedPath) {
        checkDependencyCycle(resolvedPath, new Set(visited), [...depPath]);
      }
    }
  }
}

/**
 * Resolve a relative import path to an absolute file path
 * @param {string} fromPath - Source file path
 * @param {string} importPath - Import path
 * @returns {string|null} - Resolved absolute path or null if not found
 */
function resolveImportPath(fromPath, importPath) {
  const baseDir = path.dirname(fromPath);
  const possibleExtensions = [".ts", ".tsx", ".js", ".jsx", ""];

  for (const ext of possibleExtensions) {
    const testPath = path.join(baseDir, importPath + ext);
    if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
      return testPath;
    }

    // Check for index files
    const indexPath = path.join(baseDir, importPath, `index${ext}`);
    if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
      return indexPath;
    }
  }

  return null;
}

/**
 * Check if file is likely an entry point or essential file for Matanuska project
 * @param {string} filePath - File path to check
 * @returns {boolean} - True if the file is likely an entry point or essential
 */
function isEntryPoint(filePath) {
  return MATANUSKA_PATTERNS.ESSENTIAL_FILES.some((pattern) => pattern.test(filePath));
}

/**
 * Get the confidence level for an unused file determination
 * @param {string} filePath - File path
 * @returns {number} - Confidence level (0-1)
 */
function getUnusedConfidence(filePath) {
  const fileName = path.basename(filePath);
  const fileInfo = files.get(filePath);
  const filePath_lower = filePath.toLowerCase();

  // Higher confidence if the file has no exports
  if (fileInfo.exports.length === 0) {
    return 0.9;
  }

  // Matanuska specific patterns - lower confidence for these file types
  if (/firebase|wialon|map|route|config|sidebar/.test(filePath_lower)) {
    return 0.4; // Low confidence - could be dynamically loaded
  }

  // Lower confidence for common shared utility files
  if (
    /util|helper|common|shared|hook|context|store|reducer|action|model|type|interface/.test(
      fileName
    )
  ) {
    return 0.6;
  }

  // Matanuska specific domains
  if (/trip|diesel|fuel|tyre|tire|driver|vehicle|workshop|invoice/.test(filePath_lower)) {
    // These are core domain files, so we're a bit more cautious
    return 0.7;
  }

  // Medium confidence for most other files
  return 0.8;
}

// The findCodeUsages function is used in our improved code logic
// This comment prevents the unused function warning

/**
 * Determine file type based on path and content
 * @param {string} filePath - Path to the file
 * @returns {string} - File type (component, model, type, etc.)
 */
function getFileType(filePath) {
  const fileName = path.basename(filePath);
  const content = files.get(filePath).content;

  if (/\.d\.ts$/.test(fileName)) {
    return "type";
  }

  if (/\.(tsx|jsx)$/.test(fileName)) {
    // Looks for Matanuska React component patterns
    if (MATANUSKA_PATTERNS.COMPONENT_PATTERN.test(content)) {
      return "component";
    }
  }

  // Check for domain-specific patterns in Matanuska project
  if (/trip/i.test(fileName) || /trip/i.test(filePath)) {
    return "trip-component";
  }

  if (/diesel|fuel/i.test(fileName) || /diesel|fuel/i.test(filePath)) {
    return "fuel-component";
  }

  if (/tyre|tire/i.test(fileName) || /tyre|tire/i.test(filePath)) {
    return "tyre-component";
  }

  if (/driver/i.test(fileName) || /driver/i.test(filePath)) {
    return "driver-component";
  }

  if (/model|interface|type|enum/.test(content.toLowerCase())) {
    return "model";
  }

  if (/context|provider/.test(fileName.toLowerCase())) {
    return "context";
  }

  if (/hook/i.test(fileName) || /use[A-Z]/i.test(fileName)) {
    return "hook";
  }

  return "file";
}

/**
 * Calculate total size of unused files
 * @param {Array} files - List of unused file objects
 * @returns {number} - Total size in bytes
 */
function calculateUnusedSize(files) {
  return files.reduce((total, file) => {
    const fullPath = path.join(srcDir, file.path);
    if (fs.existsSync(fullPath)) {
      return total + fs.statSync(fullPath).size;
    }
    return total;
  }, 0);
}

/**
 * Generate recommendations based on analysis
 * @returns {Array} - List of action recommendations
 */
function generateRecommendations() {
  const recommendations = [];

  if (unusedFiles.length > 0) {
    recommendations.push({
      title: "Remove unused files",
      description: `Found ${unusedFiles.length} files that appear to be unused`,
      priority: 1,
      effort: unusedFiles.length > 10 ? "high" : "medium",
      impact: {
        size: `Reduce bundle by ${formatBytes(calculateUnusedSize(unusedFiles))}`,
        maintenance: "Improve codebase clarity and maintainability",
      },
    });
  }

  if (circularDependencies.length > 0) {
    recommendations.push({
      title: "Resolve circular dependencies",
      description: `Found ${circularDependencies.length} circular dependency chains`,
      priority: 2,
      effort: "high",
      impact: {
        performance: "Improve initialization performance",
        maintenance: "Simplify dependency graph and make code more maintainable",
      },
    });
  }

  return recommendations;
}

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} - Formatted string (e.g., "4.2 KB")
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Generate and print the analysis report
 */
function generateReport() {
  const totalFiles = files.size;
  const totalBytes = Array.from(files.values()).reduce((total, file) => total + file.size, 0);

  console.log(colorize("\n========== Code Quality Analysis Report ==========\n", "cyan", true));

  console.log(colorize("Files Scanned:", "blue", true), totalFiles);
  console.log(colorize("Total Codebase Size:", "blue", true), formatBytes(totalBytes));
  console.log(
    colorize("Issues Found:", "yellow", true),
    unusedFiles.length + circularDependencies.length
  );
  console.log(
    colorize("Unused Code Size:", "red", true),
    formatBytes(calculateUnusedSize(unusedFiles))
  );

  // Print unused files
  if (unusedFiles.length > 0) {
    console.log("\n" + colorize("Unused Files:", "yellow", true));
    unusedFiles
      .sort((a, b) => b.confidence - a.confidence)
      .forEach((file) => {
        const confidenceColor =
          file.confidence >= 0.8 ? "red" : file.confidence >= 0.5 ? "yellow" : "blue";
        console.log(
          `  ${colorize(`[${Math.round(file.confidence * 100)}%]`, confidenceColor)} ${file.path} (${file.type})`
        );
      });
  }

  // Print circular dependencies
  if (circularDependencies.length > 0) {
    console.log("\n" + colorize("Circular Dependencies:", "red", true));
    circularDependencies.slice(0, 5).forEach((cycle, index) => {
      console.log(`  ${index + 1}. ${cycle.map((p) => path.relative(srcDir, p)).join(" → ")}`);
    });

    if (circularDependencies.length > 5) {
      console.log(`  ... and ${circularDependencies.length - 5} more`);
    }
  }

  // Print recommendations
  const recommendations = generateRecommendations();
  if (recommendations.length > 0) {
    console.log("\n" + colorize("Recommendations:", "green", true));
    recommendations.forEach((rec, index) => {
      console.log(
        `  ${index + 1}. ${colorize(rec.title, "green")} (Priority: ${rec.priority}, Effort: ${rec.effort})`
      );
      console.log(`     ${rec.description}`);
      if (rec.impact) {
        Object.entries(rec.impact).forEach(([key, value]) => {
          console.log(`     - ${colorize(key, "blue")}: ${value}`);
        });
      }
    });
  }

  // Print summary in JSON format
  const summary = {
    filesScanned: totalFiles,
    issuesFound: unusedFiles.length + circularDependencies.length,
    deadCodeBytes: calculateUnusedSize(unusedFiles),
    typesCoverage: "-- Not analyzed --",
    recommendations: recommendations.map((r) => r.title),
  };

  console.log("\n" + colorize("Summary:", "cyan", true));
  console.log(JSON.stringify(summary, null, 2));

  console.log("\n" + colorize("========== End of Analysis Report ==========\n", "cyan", true));
}

// Main execution
try {
  console.log(colorize("Starting code quality analysis for Matanuska...", "green"));

  // Scan all files in the src directory
  const allFiles = scanFiles(srcDir);
  console.log(`Found ${colorize(allFiles.length, "green")} files to analyze`);

  // Analyze each file
  allFiles.forEach((filePath) => {
    try {
      analyzeFile(filePath);
      // Use fileInfo in your analysis
      const fileInfo = getFileInfo(filePath);
      console.log(`Analyzing ${fileInfo.name} (${fileInfo.size} bytes)`);
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error.message);
    }
  });

  // Check for unused files and circular dependencies
  checkUnusedFiles();
  checkCircularDependencies();

  // Generate and print report
  generateReport();
} catch (error) {
  console.error(colorize("Error during analysis:", "red"), error);
  process.exit(1);
}
