#!/usr/bin/env node

/**
 * This is a wrapper script to run the verify-ui-connections.ts script
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the project root directory
const projectRoot = path.resolve(__dirname);

// Execute the script using ts-node
console.log('Running UI Connection Verification...');

const tsconfigPath = path.join(projectRoot, 'scripts', 'tsconfig.script.json');
const scriptPath = path.join(projectRoot, 'scripts', 'verify-ui-connections.ts');
const tsNodeBin = path.join(projectRoot, 'node_modules', '.bin', 'ts-node');

// Check that files exist
if (!fs.existsSync(scriptPath)) {
  console.error(`Error: Script not found at ${scriptPath}`);
  process.exit(1);
}

if (!fs.existsSync(tsNodeBin)) {
  console.error(`Error: ts-node not found at ${tsNodeBin}`);
  console.log('Installing ts-node...');

  const npmResult = spawnSync('npm', ['install', '--save-dev', 'ts-node'], {
    stdio: 'inherit',
    cwd: projectRoot
  });

  if (npmResult.error || npmResult.status !== 0) {
    console.error('Failed to install ts-node. Please install it manually with: npm install --save-dev ts-node');
    process.exit(1);
  }
}

// Run ts-node with the script
const result = spawnSync(tsNodeBin, [
  '--project', tsconfigPath,
  scriptPath,
  ...process.argv.slice(2)
], {
  stdio: 'inherit',
  cwd: projectRoot
});

if (result.error) {
  console.error(`Error executing script: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status);
