const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../src');
const EXTENSIONS = ['.tsx', '.ts'];

function findAllSourceFiles(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir)) {
    const entryPath = path.join(dir, entry);
    if (fs.statSync(entryPath).isDirectory()) {
      files = files.concat(findAllSourceFiles(entryPath));
    } else if (EXTENSIONS.includes(path.extname(entry))) {
      files.push(entryPath);
    }
  }
  return files;
}

async function dynamicImportCheck(file) {
  try {
    await import('file://' + file);
    return { file, status: 'PASS' };
  } catch (err) {
    return { file, status: 'FAIL', error: JSON.stringify(err, Object.getOwnPropertyNames(err)) };
  }
}

async function runValidation() {
  const sourceFiles = findAllSourceFiles(SRC_DIR);
  const results = [];
  for (const file of sourceFiles) {
    if (!file.endsWith('.d.ts')) {
      const absPath = 'file://' + file;
      const result = await dynamicImportCheck(absPath);
      results.push(result);
      if (result.status === 'FAIL') {
        console.error(`[FAIL] ${file} — ${result.error}`);
      } else {
        console.log(`[PASS] ${file}`);
      }
    }
  }
  const failed = results.filter(r => r.status === 'FAIL');
  const passed = results.filter(r => r.status === 'PASS');
  console.log(`\nValidation complete. Passed: ${passed.length}, Failed: ${failed.length}`);
  if (failed.length > 0) {
    process.exit(1);
  }
}
runValidation();
