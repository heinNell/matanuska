#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix the ESLint errors in TyreManagementPage.tsx
const fixTyreManagementPage = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(process.cwd(), 'src/pages/TyreManagementPage.tsx');
  
  try {
    console.log(`Reading file ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: Remove unused import TyreDashboard
    content = content.replace(
      "import React, { useState, useEffect } from 'react';\nimport TyreDashboard from '../components/TyreManagement/TyreDashboard';",
      "import React, { useState, useEffect } from 'react';"
    );
    
    // Fix 2: Change 'let value' to 'const value' on line 251
    content = content.replace(
      "              let value = values[index]?.trim();",
      "              const value = values[index]?.trim();"
    );
    
    // Fix 3: Connect the onClick handlers to their respective functions
    // Replace onClick with handleSetActiveTab('inventory')
    content = content.replace(
      "            onClick={onClick}",
      "            onClick={() => setActiveTab('inventory')}"
    );
    
    // Replace onClick with handleSetActiveTab('analytics')
    content = content.replace(
      "            onClick={onClick}",
      "            onClick={() => setActiveTab('analytics')}"
    );
    
    // Replace onClick with handleExport
    content = content.replace(
      "          <Button variant=\"outline\" size=\"sm\" icon={<Download size={16} />} onClick={onClick}>",
      "          <Button variant=\"outline\" size=\"sm\" icon={<Download size={16} />} onClick={handleExport}>"
    );
    
    // Replace onClick with handleAddTyre
    content = content.replace(
      "                <Button variant=\"outline\" size=\"sm\" onClick={onClick}>Add Tyre</Button>",
      "                <Button variant=\"outline\" size=\"sm\" onClick={handleAddTyre}>Add Tyre</Button>"
    );
    
    // Replace edit button onClick with handleEditTyre
    content = content.replace(
      "                          onClick={onClick}",
      "                          onClick={() => handleEditTyre(tyre.tyreNumber)}"
    );
    
    // Replace delete button onClick with handleDeleteTyre
    content = content.replace(
      "                          onClick={onClick}",
      "                          onClick={() => handleDeleteTyre(tyre.tyreNumber)}"
    );
    
    // Replace Analytics buttons with correct onClick handlers
    content = content.replace(
      "                <Button variant=\"primary\" fullWidth onClick={onClick}>",
      "                <Button variant=\"primary\" fullWidth onClick={handleAddTyre}>"
    );
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, content);
    console.log('Successfully fixed ESLint issues in TyreManagementPage.tsx');
    
    return true;
  } catch (error) {
    console.error(`Error fixing ESLint issues in ${filePath}:`, error.message);
    return false;
  }
};

// Run the function
const success = fixTyreManagementPage();
if (success) {
  console.log('All ESLint issues fixed successfully!');
} else {
  console.error('Failed to fix ESLint issues.');
  process.exit(1);
}
