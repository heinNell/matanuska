const fs = require('fs');

// Fix onClick syntax errors in PaidInvoices.tsx
const filePath = '/workspaces/matanuskatp/src/pages/PaidInvoices.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all instances of onClick={onClick}} with onClick={() => {}}
  const fixedContent = content.replace(/onClick=\{onClick\}\}>/g, 'onClick={() => {}}>');
  
  fs.writeFileSync(filePath, fixedContent);
  console.log(`Fixed onClick syntax errors in ${filePath}`);
  console.log(`Replacements made: ${(content.match(/onClick=\{onClick\}\}>/g) || []).length}`);
} catch (error) {
  console.error('Error fixing onClick syntax:', error);
}
