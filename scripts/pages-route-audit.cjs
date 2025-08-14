const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const routesFile = path.join(__dirname, 'src', 'App.tsx'); // Of AppRoutes.tsx

// Kry al die page files in /pages/
function getAllPages(dir, prefix = '') {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const abs = path.join(dir, f);
    const rel = prefix ? `${prefix}/${f}` : f;
    if (fs.statSync(abs).isDirectory()) {
      files = files.concat(getAllPages(abs, rel));
    } else if (f.endsWith('.tsx')) {
      files.push(rel.replace(/\.tsx$/, '').replace(/\\/g, '/'));
    }
  }
  return files;
}

// Kry alle element={<Component />} entries uit jou router file
function getRoutesFromRouter() {
  const content = fs.readFileSync(routesFile, 'utf-8');
  const regex = /element={<([A-Za-z0-9_]+)/g;
  let match, comps = [];
  while ((match = regex.exec(content)) !== null) {
    comps.push(match[1]);
  }
  return comps;
}

// MAIN
const pages = getAllPages(pagesDir);
const routes = getRoutesFromRouter();

console.log('\n=== Pages NOT referenced in your router (orphans): ===');
let orphaned = false;
for (const page of pages) {
  // Page name without path
  const name = page.split('/').pop();
  // Assume page file: MyPage.tsx => Component: MyPage
  if (!routes.includes(name)) {
    console.log('  -', page);
    orphaned = true;
  }
}
if (!orphaned) console.log('  ✅ All pages are referenced in your router!');

console.log('\n=== Router components WITHOUT a matching page file: ===');
let broken = false;
for (const r of routes) {
  const hasPage = pages.some(p => p.endsWith(r));
  if (!hasPage) {
    console.log('  -', r);
    broken = true;
  }
}
if (!broken) console.log('  ✅ All routes map to an actual page file!');
