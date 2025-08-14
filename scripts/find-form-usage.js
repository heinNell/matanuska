import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup vir __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const formsDir = path.join(__dirname, 'src', 'components');
const pagesDir = path.join(__dirname, 'src', 'pages');

// Soek .tsx files wat eindig op "Form.tsx"
function findFormFiles(dir, prefix = '') {
  let forms = [];
  for (const f of fs.readdirSync(dir)) {
    const abs = path.join(dir, f);
    const rel = prefix ? `${prefix}/${f}` : f;
    if (fs.statSync(abs).isDirectory()) {
      forms = forms.concat(findFormFiles(abs, rel));
    } else if (f.endsWith('Form.tsx')) {
      forms.push(rel.replace(/\\/g, '/'));
    }
  }
  return forms;
}

// Vind usage van elke form file in pages/components
function findFormUsages(formFiles, searchDirs) {
  let usage = {};
  for (const form of formFiles) {
    const formName = path.basename(form, '.tsx');
    usage[form] = [];
    for (const dir of searchDirs) {
      // loop deur alle .tsx files in die dir
      const files = getAllFiles(dir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        if (
          content.includes(`import ${formName}`) ||
          content.includes(`import { ${formName}`) ||
          content.includes(formName + '(') ||
          content.includes('<' + formName)
        ) {
          usage[form].push(file.replace(__dirname + '/src/', ''));
        }
      }
    }
  }
  return usage;
}

function getAllFiles(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const abs = path.join(dir, f);
    if (fs.statSync(abs).isDirectory()) {
      files = files.concat(getAllFiles(abs));
    } else if (f.endsWith('.tsx')) {
      files.push(abs);
    }
  }
  return files;
}

// MAIN
const formFiles = findFormFiles(formsDir);
const usage = findFormUsages(formFiles, [pagesDir, formsDir]);

console.log('\n=== Form Usage Map ===');
let unusedFound = false;
for (const [form, usedIn] of Object.entries(usage)) {
  // Filter uit self-references (bv. die form self)
  const filtered = usedIn.filter(u => !u.endsWith(form));
  if (filtered.length === 0) {
    console.log(`  [UNUSED] ${form}`);
    unusedFound = true;
  } else {
    console.log(`  ${form} ➔`);
    filtered.forEach(u => console.log(`    - ${u}`));
  }
}
if (!unusedFound) {
  console.log('\n✅ All forms are used somewhere in your codebase!');
}
