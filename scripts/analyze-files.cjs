#!/usr/bin/env node

/**
 * File Classification Script
 * 
 * This script analyzes TypeScript/React files in the src directory
 * and classifies them as either "Page" or "Component" based on various
 * heuristics. It creates a detailed report of its findings.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.resolve(__dirname, 'src');
const OUTPUT_FILE = path.resolve(__dirname, 'FILE_CLASSIFICATION_REPORT.md');

// Rules for classification
const pageSignatures = [
  /import.*useParams|useNavigate|useLocation|useRouteMatch/,
  /<Outlet\s*\/?>/,
  /\bPage\b.*=.*=>/,  // Matches "const SomethingPage = () => {"
  /\bPage\b.*:.*React\.FC/,  // Matches "const SomethingPage: React.FC = () => {"
  /\bwindow\.location\b/,  // Direct manipulation of window.location often indicates a page
  /\brouter\.push\(/,  // Next.js router usage
  /\buseRouter\(/,     // Next.js router hook
];

const componentSignatures = [
  /interface.*Props|type.*Props/,  // Props interface/type definition
  /\bModal\b|\bDialog\b|\bDrawer\b|\bSidebar\b|\bPopover\b|\bTooltip\b/,  // UI components
  /\bButton\b|\bCard\b|\bTable\b|\bForm\b|\bInput\b|\bSelect\b|\bCheckbox\b|\bRadio\b/,  // UI elements
  /\b(on[A-Z][a-zA-Z]+)=/,  // Event handlers like onClick, onChange
  /\.module\.css/,  // CSS modules
];

const fileTypeMappings = {
  // Files that should definitely be pages
  pagePatterns: [
    /(Page|page)\.tsx$/,  // Files ending with Page.tsx or page.tsx
    /pages\/[^/]+\.tsx$/,  // Files directly in a pages folder
  ],
  
  // Files that should definitely be components
  componentPatterns: [
    /(Button|Card|Modal|Dialog|Sidebar|Navbar|Menu|List|Table|Form|Input)\.tsx$/,
    /components\/[^/]+\.tsx$/,  // Files directly in a components folder
  ],
};

// Helper function to read a file and determine its type
function classifyFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);
    const relativePath = path.relative(SOURCE_DIR, filePath);
    const dirPath = path.dirname(relativePath);
    
    // First, check filename patterns for definitive classification
    for (const pattern of fileTypeMappings.pagePatterns) {
      if (pattern.test(filePath)) {
        return {
          type: 'Page',
          confidence: 'High',
          path: relativePath,
          reasons: ['Filename matches page pattern'],
        };
      }
    }
    
    for (const pattern of fileTypeMappings.componentPatterns) {
      if (pattern.test(filePath)) {
        return {
          type: 'Component',
          confidence: 'High',
          path: relativePath,
          reasons: ['Filename matches component pattern'],
        };
      }
    }
    
    // If no definitive pattern, analyze the content
    const pageSignatureMatches = [];
    const componentSignatureMatches = [];
    
    // Check for page signatures
    pageSignatures.forEach(regex => {
      if (regex.test(content)) {
        pageSignatureMatches.push(regex.toString().replace(/^\/|\/$/g, ''));
      }
    });
    
    // Check for component signatures
    componentSignatures.forEach(regex => {
      if (regex.test(content)) {
        componentSignatureMatches.push(regex.toString().replace(/^\/|\/$/g, ''));
      }
    });
    
    // Check comment docblock for clues
    const docCommentMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    let docblockClassification = null;
    
    if (docCommentMatch) {
      const docComment = docCommentMatch[0];
      if (docComment.includes('Page') && !docComment.includes('Component')) {
        docblockClassification = 'Page';
      } else if (docComment.includes('Component') && !docComment.includes('Page')) {
        docblockClassification = 'Component';
      }
    }
    
    // Determine classification based on collected evidence
    let type, confidence, reasons;
    
    if (pageSignatureMatches.length > componentSignatureMatches.length) {
      type = 'Page';
      confidence = pageSignatureMatches.length > componentSignatureMatches.length + 2 ? 'High' : 'Medium';
      reasons = pageSignatureMatches.map(sig => `Matches page pattern: ${sig}`);
    } else if (componentSignatureMatches.length > pageSignatureMatches.length) {
      type = 'Component';
      confidence = componentSignatureMatches.length > pageSignatureMatches.length + 2 ? 'High' : 'Medium';
      reasons = componentSignatureMatches.map(sig => `Matches component pattern: ${sig}`);
    } else {
      // Equal number of signatures or none
      if (docblockClassification) {
        type = docblockClassification;
        confidence = 'Medium';
        reasons = [`Doc comment indicates ${docblockClassification}`];
      } else {
        // Check the directory path for clues
        if (dirPath.includes('pages')) {
          type = 'Page';
          confidence = 'Low';
          reasons = ['Located in pages directory'];
        } else if (dirPath.includes('components')) {
          type = 'Component';
          confidence = 'Low';
          reasons = ['Located in components directory'];
        } else {
          type = 'Unknown';
          confidence = 'None';
          reasons = ['Unable to determine'];
        }
      }
    }
    
    return {
      type,
      confidence,
      path: relativePath,
      reasons,
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
    return {
      type: 'Error',
      confidence: 'None',
      path: path.relative(SOURCE_DIR, filePath),
      reasons: [`Error: ${error.message}`],
    };
  }
}

// Recursively scan directories for .tsx files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Generate the report
function generateReport(classifications) {
  // Sort classifications by type and path
  const sortedClassifications = [...classifications].sort((a, b) => {
    if (a.type === b.type) {
      return a.path.localeCompare(b.path);
    }
    return a.type.localeCompare(b.type);
  });
  
  const pages = sortedClassifications.filter(c => c.type === 'Page');
  const components = sortedClassifications.filter(c => c.type === 'Component');
  const unknown = sortedClassifications.filter(c => c.type === 'Unknown');
  const errors = sortedClassifications.filter(c => c.type === 'Error');
  
  // Generate the report markdown
  let report = `# File Classification Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- Total Files Analyzed: ${classifications.length}\n`;
  report += `- Pages: ${pages.length}\n`;
  report += `- Components: ${components.length}\n`;
  report += `- Unknown: ${unknown.length}\n`;
  report += `- Errors: ${errors.length}\n\n`;
  
  // Pages section
  report += `## Pages\n\n`;
  
  // Group pages by directory
  const pagesByDir = pages.reduce((acc, page) => {
    const dir = path.dirname(page.path);
    if (!acc[dir]) acc[dir] = [];
    acc[dir].push(page);
    return acc;
  }, {});
  
  Object.keys(pagesByDir).sort().forEach(dir => {
    report += `### ${dir}\n\n`;
    report += `| File | Confidence | Reasons |\n`;
    report += `| ---- | ---------- | ------- |\n`;
    
    pagesByDir[dir].forEach(page => {
      const filename = path.basename(page.path);
      report += `| ${filename} | ${page.confidence} | ${page.reasons.join(', ')} |\n`;
    });
    
    report += `\n`;
  });
  
  // Components section
  report += `## Components\n\n`;
  
  // Group components by directory
  const componentsByDir = components.reduce((acc, component) => {
    const dir = path.dirname(component.path);
    if (!acc[dir]) acc[dir] = [];
    acc[dir].push(component);
    return acc;
  }, {});
  
  Object.keys(componentsByDir).sort().forEach(dir => {
    report += `### ${dir}\n\n`;
    report += `| File | Confidence | Reasons |\n`;
    report += `| ---- | ---------- | ------- |\n`;
    
    componentsByDir[dir].forEach(component => {
      const filename = path.basename(component.path);
      report += `| ${filename} | ${component.confidence} | ${component.reasons.join(', ')} |\n`;
    });
    
    report += `\n`;
  });
  
  // Unknown section
  if (unknown.length > 0) {
    report += `## Unknown\n\n`;
    report += `| File | Path | Reasons |\n`;
    report += `| ---- | ---- | ------- |\n`;
    
    unknown.forEach(item => {
      const filename = path.basename(item.path);
      report += `| ${filename} | ${item.path} | ${item.reasons.join(', ')} |\n`;
    });
    
    report += `\n`;
  }
  
  // Errors section
  if (errors.length > 0) {
    report += `## Errors\n\n`;
    report += `| File | Path | Error |\n`;
    report += `| ---- | ---- | ----- |\n`;
    
    errors.forEach(item => {
      const filename = path.basename(item.path);
      report += `| ${filename} | ${item.path} | ${item.reasons.join(', ')} |\n`;
    });
  }
  
  return report;
}

// Main execution
function main() {
  console.log('Starting file analysis...');
  
  // Find all .tsx files
  const files = findTsxFiles(SOURCE_DIR);
  console.log(`Found ${files.length} .tsx files`);
  
  // Classify each file
  const classifications = [];
  let counter = 0;
  
  files.forEach(filePath => {
    counter++;
    if (counter % 20 === 0) {
      console.log(`Processed ${counter}/${files.length} files...`);
    }
    
    const classification = classifyFile(filePath);
    classifications.push(classification);
  });
  
  // Generate and write the report
  const report = generateReport(classifications);
  fs.writeFileSync(OUTPUT_FILE, report, 'utf8');
  
  console.log(`Analysis complete! Report saved to ${OUTPUT_FILE}`);
}

// Run the script
main();
