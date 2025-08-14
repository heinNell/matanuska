#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Common fixes for known import path issues
const fixes = [
  // Fix App.tsx issues - pages that don't exist in the directories specified
  {
    from: './pages/compliance/',
    to: './pages/',
    patterns: ['ComplianceManagementPage', 'AuditManagement', 'ViolationTracking', 'InsuranceManagement', 'ComplianceDashboard']
  },
  {
    from: './pages/analytics/',
    to: './pages/',
    patterns: ['FleetAnalyticsPage', 'CreateCustomReport', 'AnalyticsInsights', 'VehiclePerformance', 'AnalyticsDashboard']
  },
  {
    from: './pages/workshop/',
    to: './pages/',
    patterns: ['DriverInspectionForm', 'InspectionHistory', 'InspectionTemplatesPage', 'JobCardTemplatesPage', 'IndirectCostBreakdown', 'WorkshopAnalytics', 'WorkshopReportsPage', 'WorkshopCostReportsPage']
  },
  {
    from: './components/workshop/',
    to: './components/WorkshopManagement/',
    patterns: ['InspectionForm', 'InspectionManagement', 'JobCardKanbanBoard', 'StockManager']
  },
  {
    from: './pages/tyres/',
    to: './pages/',
    patterns: ['TyreStoresPage', 'TyreFleetMap', 'TyreHistoryPage', 'TyrePerformanceDashboard']
  },
  {
    from: './pages/tyres/AddNewTyre',
    to: './pages/tyres/AddNewTyrePage',
    patterns: ['']
  },
  {
    from: './pages/inventory/',
    to: './pages/',
    patterns: ['StockAlertsPage', 'PartsOrderingPage', 'PurchaseOrderTracker', 'VendorScorecard', 'InventoryDashboard', 'InventoryPage', 'PartsInventoryPage', 'ReceivePartsPage', 'InventoryReportsPage']
  },
  {
    from: './pages/wialon/',
    to: './pages/',
    patterns: ['WialonDashboard', 'WialonUnitsPage', 'WialonConfigPage']
  },
  {
    from: './pages/reports/',
    to: './pages/',
    patterns: ['ActionLog', 'CurrencyFleetReport', 'InvoiceAgingDashboard']
  },
  {
    from: './pages/Performance/',
    to: './pages/',
    patterns: ['CustomerRetentionDashboard']
  },
  {
    from: './pages/Map/',
    to: './pages/',
    patterns: ['MapTestPage', 'MapsView']
  },
  {
    from: './pages/NotificationsPage',
    to: './components/ui/GenericPlaceholderPage',
    patterns: ['']
  },
  {
    from: './pages/SettingsPage',
    to: './components/ui/GenericPlaceholderPage',
    patterns: ['']
  },
  // Fix tyre pages that don't exist
  {
    from: './pages/tyres/inspection',
    to: './components/Tyremanagement/TyreInspection',
    patterns: ['']
  },
  {
    from: './pages/tyres/inventory',
    to: './components/Tyremanagement/TyreInventory',
    patterns: ['']
  },
  {
    from: './pages/tyres/reports',
    to: './components/Tyremanagement/TyreReports',
    patterns: ['']
  },
  {
    from: './pages/tyres/add-new-tyre',
    to: './pages/tyres/AddNewTyrePage',
    patterns: ['']
  },
  // Fix vehicle inspection
  {
    from: './pages/workshop/vehicle-inspection',
    to: './components/WorkshopManagement/vehicle-inspection',
    patterns: ['']
  }
];

function applyFix(filePath, content, fix) {
  let updated = content;
  
  if (fix.patterns && fix.patterns.length > 0 && fix.patterns[0] !== '') {
    // Apply fix to specific patterns
    fix.patterns.forEach(pattern => {
      const oldImport = `from '${fix.from}${pattern}'`;
      const newImport = `from '${fix.to}${pattern}'`;
      updated = updated.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
    });
  } else {
    // Apply fix to exact path
    const oldImport = `from '${fix.from}'`;
    const newImport = `from '${fix.to}'`;
    updated = updated.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
  }
  
  return updated;
}

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Apply all fixes
    fixes.forEach(fix => {
      content = applyFix(filePath, content, fix);
    });
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Fix App.tsx first
console.log('Fixing imports in App.tsx...');
fixImportsInFile('./src/App.tsx');

console.log('Import fixes applied!');
