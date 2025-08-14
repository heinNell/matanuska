// sidebar-validator.js
const fs = require('fs');
const path = require('path');

const sidebarFile = path.join(__dirname, 'src', 'components', 'layout', 'Sidebar.tsx');
const pagesDir = path.join(__dirname, 'src', 'pages');

// Helper: Kry alle .tsx files in pages en subfolders
function getAllPageFiles(dir, prefix = '') {
    let files = [];
    for (const f of fs.readdirSync(dir)) {
        const abs = path.join(dir, f);
        const rel = prefix ? `${prefix}/${f}` : f;
        if (fs.statSync(abs).isDirectory()) {
            files = files.concat(getAllPageFiles(abs, rel));
        } else if (f.endsWith('.tsx')) {
            files.push(rel.replace(/\.tsx$/, ''));
        }
    }
    return files;
}

// Helper: Kry alle paths uit Sidebar.tsx
function getPathsFromSidebar() {
    const content = fs.readFileSync(sidebarFile, 'utf-8');
    // Match alle path: '...' in die navCategories
    const pathRegex = /path:\s*['"`]([^'"`]+)['"`]/g;
    let match, paths = [];
    while ((match = pathRegex.exec(content)) !== null) {
        paths.push(match[1]);
    }
    return paths;
}

// MAIN
const sidebarPaths = getPathsFromSidebar();
const pageFiles = getAllPageFiles(pagesDir);

const missingPages = sidebarPaths.filter(
    sp => !pageFiles.includes(sp)
);

const orphanPages = pageFiles.filter(
    pf => !sidebarPaths.includes(pf)
);

console.log('\n=== Sidebar Paths WITHOUT matching .tsx Page ===');
missingPages.forEach(p => console.log('  -', p));
if (missingPages.length === 0) console.log('  ✅ Alles in Sidebar het ' + '.tsx pages!');

console.log('\n=== .tsx Pages NOT in Sidebar ===');
orphanPages.forEach(p => console.log('  -', p));
if (orphanPages.length === 0) console.log('  ✅ Al jou pages is in die Sidebar!');
