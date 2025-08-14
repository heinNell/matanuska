#!/usr/bin/env node

/**
 * File Reorganization Script
 * 
 * This script helps reorganize files into the new structure:
 * components/
 * ├── DomainManagement/
 * │   ├── forms/
 * │   └── pages/
 * │   └── (other component types)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_DIR = path.resolve(__dirname, 'src');
const COMPONENT_DIR = path.resolve(SOURCE_DIR, 'components');

// Domains to organize
const domains = [
  'ComplianceSafetyManagement',
  'CostManagement',
  'CustomerManagement',
  'DashboardManagement',
  'DieselManagement', 
  'DriverManagement',
  'FleetManagement',
  'InventoryManagement',
  'InvoiceManagement',
  'MapManagement',
  'TripManagement',
  'TyreManagement',
  'WorkshopManagement',
];

// Domain name mapping is now defined in the suggestPlacements function

// Create domain directory structure if it doesn't exist
const createDomainStructure = () => {
  console.log('=== Creating Domain Directory Structure ===');
  
  domains.forEach(domain => {
    const domainDir = path.join(COMPONENT_DIR, domain);
    
    // Create domain directory
    if (!fs.existsSync(domainDir)) {
      fs.mkdirSync(domainDir, { recursive: true });
      console.log(`Created domain directory: ${domainDir}`);
    }
    
    // Create subdirectories
    const subdirs = ['forms', 'pages', 'modals', 'components'];
    
    // Add special subdirectories for certain domains
    if (domain === 'DashboardManagement' || domain === 'TripManagement' || 
        domain === 'DriverManagement' || domain === 'CustomerManagement') {
      subdirs.push('reports');
    }
    
    if (domain === 'TyreManagement' || domain === 'WorkshopManagement' ||
        domain === 'InventoryManagement' || domain === 'FleetManagement') {
      subdirs.push('analytics');
    }
    
    subdirs.forEach(subdir => {
      const subdirPath = path.join(domainDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
        console.log(`Created subdirectory: ${subdirPath}`);
      }
    });
  });
};

// Analyze files to determine their type (form, page, etc.)
const analyzeFile = (filePath) => {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Simple heuristics to determine file type
    const fileName = path.basename(filePath);
    
    // Modals - check first as they're most distinctive
    if (fileName.includes('Modal') || content.includes('isOpen={') || content.includes('onClose={')) {
      return 'modals';
    }
    
    // Forms
    if (fileName.includes('Form') || 
        content.includes('onSubmit=') || 
        content.includes('<form') || 
        content.includes('handleSubmit') ||
        content.includes('setValue(') ||
        content.includes('register(')) {
      return 'forms';
    }
    
    // Reports and Analytics
    if (fileName.includes('Report') || 
        fileName.includes('Analytics') || 
        fileName.includes('Dashboard') ||
        content.includes('Chart') || 
        content.includes('analytics') ||
        content.includes('<BarChart') ||
        content.includes('<LineChart') ||
        content.includes('<PieChart')) {
      
      if (fileName.includes('Dashboard')) {
        return 'pages'; // Dashboards are often full pages
      }
      return 'reports';
    }
    
    // Pages
    if (fileName.includes('Page') || 
        content.includes('useParams') || 
        content.includes('useNavigate') ||
        content.includes('useLocation') ||
        content.includes('useRouteMatch')) {
      return 'pages';
    }
    
    // Check for specialized components
    if (fileName.includes('Table') || 
        fileName.includes('List') || 
        fileName.includes('Card') ||
        fileName.includes('Panel')) {
      return 'components';
    }
    
    // Default to components
    return 'components';
  } catch (error) {
    console.error(`Error analyzing file ${filePath}: ${error.message}`);
    return 'components';
  }
};

// Check existing files and suggest placement in new structure
const suggestPlacements = () => {
  console.log('\n=== Suggested File Placements ===');
  
  // Map from old domain names to standardized names
  const domainNameMap = {
    // Component directory mappings
    'Tripmanagement': 'TripManagement',
    'TripManagement': 'TripManagement',
    'DriverManagement': 'DriverManagement',
    'CustomerManagement': 'CustomerManagement',
    'DieselManagement': 'DieselManagement',
    'ComplianceSafety': 'ComplianceSafetyManagement',
    'ComplianceSafetymanagement': 'ComplianceSafetyManagement',
    'Cost Management': 'CostManagement',
    'CostManagement': 'CostManagement',
    'Inventory Management': 'InventoryManagement',
    'InventoryManagement': 'InventoryManagement',
    'Workshop Management': 'WorkshopManagement',
    'WorkshopManagement': 'WorkshopManagement',
    'InvoiceManagement': 'InvoiceManagement',
    'Tyremanagement': 'TyreManagement',
    'TyreManagement': 'TyreManagement',
    'FleetAnalytics': 'FleetManagement',
    'Performance': 'DashboardManagement',
    'Map': 'MapManagement',
    'wialon': 'MapManagement',
    
    // Page directory mappings
    'Tripmanagementpages': 'TripManagement',
    'Drivermanagementpages': 'DriverManagement',
    'Customermanagementpages': 'CustomerManagement',
    'Dieselmanagementpages': 'DieselManagement',
    'Compliancemanagementpages': 'ComplianceSafetyManagement',
    'Inventorymanagementpages': 'InventoryManagement',
    'Workshopmanagementpages': 'WorkshopManagement',
    'Invoicesmanagementpages': 'InvoiceManagement',
    'Tyremanagementpages': 'TyreManagement',
    'maps': 'MapManagement',
    'integration': 'IntegrationManagement'
  };
  
  // List of keywords to help determine the domain
  const domainKeywords = {
    'TripManagement': ['Trip', 'Route', 'Load', 'Waypoint', 'Journey'],
    'DriverManagement': ['Driver', 'License', 'Training', 'Performance', 'Hours', 'Violation', 'Safety'],
    'CustomerManagement': ['Customer', 'Client', 'Retention', 'Account'],
    'DieselManagement': ['Diesel', 'Fuel', 'Carbon', 'Consumption'],
    'ComplianceSafetyManagement': ['Compliance', 'Safety', 'Regulation', 'Incident', 'Accident'],
    'CostManagement': ['Cost', 'Expense', 'Finance', 'Budget'],
    'InventoryManagement': ['Inventory', 'Stock', 'Parts', 'Supply'],
    'WorkshopManagement': ['Workshop', 'Repair', 'Maintenance', 'Job Card', 'Inspection'],
    'InvoiceManagement': ['Invoice', 'Payment', 'Billing', 'Tax'],
    'TyreManagement': ['Tyre', 'Tire', 'Wheel'],
    'FleetManagement': ['Fleet', 'Vehicle', 'Asset', 'Truck'],
    'DashboardManagement': ['Dashboard', 'KPI', 'Analytics', 'Overview'],
    'MapManagement': ['Map', 'Location', 'GPS', 'Geofence', 'Wialon']
  };
  
  // Process directories in components folder
  fs.readdirSync(COMPONENT_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .forEach(dirent => {
      const oldDomainName = dirent.name;
      const oldDomainPath = path.join(COMPONENT_DIR, oldDomainName);
      
      // Skip if it's a UI or utility directory
      if (['ui', 'common', 'layout', 'auth'].includes(oldDomainName)) {
        return;
      }
      
      // Map to new domain name
      const newDomainName = domainNameMap[oldDomainName] || oldDomainName;
      
      // Process files in the domain directory
      fs.readdirSync(oldDomainPath, { withFileTypes: true })
        .filter(file => file.isFile() && file.name.endsWith('.tsx'))
        .forEach(file => {
          const filePath = path.join(oldDomainPath, file.name);
          const fileName = file.name;
          
          // Determine file type (form, page, etc.)
          const fileType = analyzeFile(filePath);
          
          // Determine domain based on filename if not already mapped
          let targetDomain = newDomainName;
          
          // Only try to detect domain if we're in a catch-all directory like 'misc'
          if (oldDomainName === 'misc') {
            // Check filename against domain keywords
            for (const [domain, keywords] of Object.entries(domainKeywords)) {
              if (keywords.some(keyword => fileName.includes(keyword))) {
                targetDomain = domain;
                break;
              }
            }
          }
          
          // Suggest new location
          console.log(`${filePath} → components/${targetDomain}/${fileType}/${file.name}`);
        });
      
      // Process subdirectories
      fs.readdirSync(oldDomainPath, { withFileTypes: true })
        .filter(subdir => subdir.isDirectory())
        .forEach(subdir => {
          const subdirPath = path.join(oldDomainPath, subdir.name);
          
          fs.readdirSync(subdirPath, { withFileTypes: true })
            .filter(file => file.isFile() && file.name.endsWith('.tsx'))
            .forEach(file => {
              const filePath = path.join(subdirPath, file.name);
              const fileName = file.name;
              let fileType = subdir.name; // Assume existing subdirectory name is meaningful
              
              if (!['forms', 'pages', 'reports', 'modals', 'components', 'analytics'].includes(fileType)) {
                fileType = analyzeFile(filePath);
              }
              
              // Determine domain based on filename if in a misc/common directory
              let targetDomain = newDomainName;
              
              // Only try to detect domain if we're in a generic directory
              if (oldDomainName === 'misc' || oldDomainName === 'common') {
                // Check filename against domain keywords
                for (const [domain, keywords] of Object.entries(domainKeywords)) {
                  if (keywords.some(keyword => fileName.includes(keyword))) {
                    targetDomain = domain;
                    break;
                  }
                }
              }
              
              // Suggest new location
              console.log(`${filePath} → components/${targetDomain}/${fileType}/${file.name}`);
            });
        });
    });
};

// Main function
const main = () => {
  console.log('File Reorganization Analysis\n');
  
  createDomainStructure();
  suggestPlacements();
  
  console.log('\nTo implement these changes, run this script with the "--execute" flag (implementation pending)');
  console.log('Note: Before executing, make sure to back up your codebase or commit current changes');
};

main();
