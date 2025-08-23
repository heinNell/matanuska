// scripts/audit-sidebar-routes.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// -- PAS HIER AAN VIR JOU STRUCTUUR --
const PAGES_DIR = path.join(__dirname, '../src/pages');
const SIDEBAR_FILE = path.join(__dirname, '../src/components/Sidebar.tsx');
const ROUTES_FILE = path.join(__dirname, '../src/AppRoutes.tsx');
const APP_FILE = path.join(__dirname, '../src/App.tsx');

// 🔎 Kry al .tsx/.ts files recursive in src/pages
function listFilesRecursive(dir, exts = ['.tsx', '.ts']) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(listFilesRecursive(full, exts));
    } else if (exts.some(e => file.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

// Lees file inhoud
function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf-8');
  } catch { return ''; }
}

// MAIN
function auditUsage() {
  // Normaliseer na relative path (sonder ext)
  const pageFiles = listFilesRecursive(PAGES_DIR)
    .map(f => path.relative(PAGES_DIR, f).replace(/\\/g, '/').replace(/\.tsx?$/, ''))
    .filter(f => !f.startsWith('forms/') && !f.includes('/forms/'));

  const sidebarSrc = readFileSafe(SIDEBAR_FILE);
  const routesSrc = readFileSafe(ROUTES_FILE);
  const appSrc = readFileSafe(APP_FILE);
  const allSrc = sidebarSrc + '\n' + routesSrc + '\n' + appSrc;

  // Pages wat NERENS in jou imports/routing/menu gebruik word nie
  const unusedPages = pageFiles.filter(
    file =>
      !allSrc.includes(file) &&
      !allSrc.includes(file.replace('/index', '')) &&
      !allSrc.includes('./' + file)
  );

  // Soek string-literals ("/MyPage", "./MyPage", ens)
  const matchStrings = src =>
    Array.from(src.matchAll(/['"`]([^'"`]+)['"`]/g)).map(m => m[1]);
  const sidebarRoutes = matchStrings(sidebarSrc);
  const definedRoutes = matchStrings(routesSrc);
  const routeCandidates = sidebarRoutes.concat(definedRoutes);

  // Route/menu entries wat NIE files het nie
  const missingFiles = routeCandidates.filter(r => {
    if (r.startsWith('/') || r.startsWith('#') || r.startsWith('http')) return false;
    const candidate = path.join(PAGES_DIR, r + '.tsx');
    const candidate2 = path.join(PAGES_DIR, r, 'index.tsx');
    return !fs.existsSync(candidate) && !fs.existsSync(candidate2);
  });

  // Output
  console.log('\n--- Unused Pages in /pages ---');
  unusedPages.length
    ? unusedPages.forEach(p => console.log(' -', p))
    : console.log('✅ Geen unused pages!');

  console.log('\n--- Sidebar/Route entries sonder file ---');
  missingFiles.length
    ? missingFiles.forEach(r => console.log(' -', r))
    : console.log('✅ Al jou sidebar/routes verwys na regte files!');

  console.log('\n✔️  Klaar.');
}

auditUsage();
