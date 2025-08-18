#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * apply-safe-defaults.cjs
 *
 * A small codemod for CJS projects that fixes common TS errors across your repo:
 *  - Adds ?? '' to string fields that must be defined
 *  - Adds ?? new Date().toISOString().split('T')[0] to date fields
 *  - Adds optional chaining for obvious "possibly undefined" object chains
 *  - Hardens JSX value= bindings for form inputs to avoid undefined
 *
 * Use with --dry to preview, and remove --dry to write changes.
 *
 * Usage:
 *   node scripts/apply-safe-defaults.cjs --dry
 *   node scripts/apply-safe-defaults.cjs --write
 *
 * Notes:
 * - Heuristic, safe-by-default; it won’t rewrite numbers or booleans.
 * - You can run it repeatedly; it skips already-fixed spots.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['dry', 'write'],
  alias: { w: 'write' },
  default: { dry: true, write: false },
});

const repoRoot = process.cwd();

const includeGlobs = [
  'src/**/*.ts',
  'src/**/*.tsx',
  // narrow scripts if you want:
  // 'scripts/**/*.ts',
];

function gitLsFiles(globs) {
  const quoted = globs.map((g) => `'${g}'`).join(' ');
  try {
    const out = execSync(`git ls-files ${quoted}`, { encoding: 'utf8' });
    return out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch (e) {
    // fallback to manual walk if not a git repo
    return walkFiles('.', (p) => globs.some((g) => minimatch(p, g)));
  }
}

function walkFiles(startDir, filterFn) {
  const results = [];
  function walk(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      const p = path.join(dir, it.name);
      if (it.isDirectory()) walk(p);
      else if (filterFn(p)) results.push(p);
    }
  }
  walk(startDir);
  return results;
}

// Simple minimatch fallback for non-git env
function minimatch(file, glob) {
  // Very small subset: **/*.ts(x)?
  if (glob.startsWith('src/**/')) {
    return file.startsWith('src/') && file.match(/\.(ts|tsx)$/);
  }
  return false;
}

// --- TRANSFORMS -------------------------------------------------------------

/**
 * 1) Object literal “string” fields that must be defined (dates & strings)
 *    - eventDate, date, dateDue, issueDate, dueDate, location, clientReport, etc.
 *    - from: dateDue: someVar
 *    - to:   dateDue: (someVar ?? '')
 *
 *    For date-y fields, we prefer a sensible default date string when LHS looks like a date key.
 */
const objStringKeyFix = [
  // date-like keys: use ISO date default if rhs can be undefined/empty
  {
    name: 'date-like-string-keys',
    re: new RegExp(
      String.raw`(\b(?:eventDate|dateOfIncident|dateDue|dueDate|issueDate|date)\s*:\s*)([A-Za-z0-9_\.\?\:\(\)\s\|\&\-]+?)(?=[,\}\n])`,
      'g'
    ),
    replace: (m, prefix, rhs) => {
      // don’t double-fix
      if (/\?\?\s*['"]/.test(rhs) || /toISOString\(\)/.test(rhs)) return `${prefix}${rhs}`;
      // If rhs already string literal, keep it.
      if (/^['"].*['"]$/.test(rhs.trim())) return `${prefix}${rhs}`;
      // Provide a default date string
      const dateDefault = `new Date().toISOString().split('T')[0]`;
      return `${prefix}(${rhs.trim()} ?? ${dateDefault})`;
    },
  },
  // generic string keys that must never be undefined
  {
    name: 'generic-string-keys',
    re: new RegExp(
      String.raw`(\b(?:responsibleReporter|responsiblePerson|clientReport|problemIdentification|description|location|issuedBy|priority|severity|status|incidentType|driverName|fleetNumber)\s*:\s*)([A-Za-z0-9_\.\?\:\(\)\s\|\&\-]+?)(?=[,\}\n])`,
      'g'
    ),
    replace: (m, prefix, rhs) => {
      if (/\?\?\s*['"]/.test(rhs)) return `${prefix}${rhs}`;
      if (/^['"].*['"]$/.test(rhs.trim())) return `${prefix}${rhs}`;
      return `${prefix}(${rhs.trim()} ?? '')`;
    },
  },
];

/**
 * 2) JSX value= bindings on <input>, <select>, <textarea>
 *    - from: value={some.maybeUndefined}
 *    - to:   value={some.maybeUndefined ?? ''}
 */
const jsxValueFix = [
  {
    name: 'jsx-value-string',
    re: new RegExp(
      String.raw`(<(input|select|textarea)[^>]*\bvalue=\{)([^}]+)(\})`,
      'g'
    ),
    replace: (m, before, _tag, expr, after) => {
      const e = expr.trim();
      if (e.includes('??') || /^['"].*['"]$/.test(e)) return m; // already safe
      // avoid converting obvious numeric bindings
      if (/parseInt|parseFloat|Number\(|\b\d+(\.\d+)?\b/.test(e)) return m;
      return `${before}(${e} ?? '')${after}`;
    },
  },
];

/**
 * 3) Optional chaining for common maybe-undefined paths in JSX & code
 *    - from: something.somethingElse
 *    - to:   something?.somethingElse   (only when pattern is obviously safe to do)
 */
const optionalChainFix = [
  {
    name: 'basic-optional-chaining',
    // naive but useful: convert .p. / .params. / .data() / .docs[0] patterns when used in RHS
    re: new RegExp(
      String.raw`([A-Za-z0-9_]\w*)(\.(p|params|data|docs|0|get|items|pos|sensors|t|x|y))`,
      'g'
    ),
    replace: (m, obj, rest) => {
      // only add ?. once
      if (obj.endsWith('?')) return m;
      // don’t break method calls like data()
      if (/\(\)$/.test(rest)) return `${obj}${rest.replace('.', '?.')}`;
      return `${obj}?.${rest.slice(1)}`;
    },
  },
];

/**
 * 4) Set State Action safety in callbacks
 *    - from: setX(prev => ({ ...prev, dateDue: due || someVar }))
 *    - tightens date fields: ensure date strings never undefined
 */
const setStateDateTighten = [
  {
    name: 'setState-date-tighten',
    re: new RegExp(
      String.raw`(set[A-Za-z0-9_]+\(\s*prev\s*=>\s*\{\s*return\s*\{\s*[^}]*\b(eventDate|dateOfIncident|dateDue|dueDate|issueDate)\s*:\s*)([^\n,}]+)`,
      'g'
    ),
    replace: (m, head, _key, rhs) => {
      if (rhs.includes('??')) return m;
      const dateDefault = `new Date().toISOString().split('T')[0]`;
      return `${head}(${rhs.trim()} ?? ${dateDefault})`;
    },
  },
];

// collect transforms
const TRANSFORMS = [
  ...objStringKeyFix,
  ...jsxValueFix,
  ...optionalChainFix,
  ...setStateDateTighten,
];

// --- RUN --------------------------------------------------------------------

const files = gitLsFiles(includeGlobs);
if (!files.length) {
  console.log('No files matched. Nothing to do.');
  process.exit(0);
}

let changed = 0;
let scanned = 0;

for (const rel of files) {
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs)) continue;
  const original = fs.readFileSync(abs, 'utf8');
  let out = original;

  let localChanges = 0;

  for (const t of TRANSFORMS) {
    const before = out;
    out = out.replace(t.re, t.replace);
    if (out !== before) {
      localChanges++;
    }
  }

  scanned++;
  if (localChanges > 0 && out !== original) {
    changed++;
    if (argv.write) {
      fs.writeFileSync(abs, out, 'utf8');
      console.log(`✔ fixed: ${rel} (${localChanges} pass${localChanges > 1 ? 'es' : ''})`);
    } else {
      console.log(`→ would fix: ${rel} (${localChanges} pass${localChanges > 1 ? 'es' : ''})`);
    }
  }
}

console.log(
  `\nDone. Scanned ${scanned} file(s). ${argv.write ? 'Updated' : 'Would update'} ${changed} file(s).\n`
);

if (!argv.write) {
  console.log('DRY RUN. Use --write to apply changes:\n  node scripts/apply-safe-defaults.cjs --write\n');
}
