#!/usr/bin/env node

/**
 * Transform Inventory Data Script
 *
 * This script takes data from seedStockInventory.mjs and transforms it to match
 * the format expected by the WorkshopContext in the application.
 *
 * Usage: node transform-inventory-data.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const inputFilePath = path.join(__dirname, 'seedStockInventory.mjs');
const outputFilePath = path.join(__dirname, 'transformed-inventory.js');

// Category mappings based on item descriptions
const categoryMappings = {
  'TYRE': 'TYRES',
  'OIL': 'FLUIDS',
  'FILTER': 'FILTERS',
  'BULB': 'ELECTRICAL',
  'LAMP': 'ELECTRICAL',
  'BATTERY': 'ELECTRICAL',
  'PUMP': 'ENGINE PARTS',
  'GASKET': 'ENGINE PARTS',
  'SEAL': 'ENGINE PARTS',
  'BELT': 'ENGINE PARTS',
  'BRAKE': 'BRAKING SYSTEM',
  'BROOM': 'CLEANING',
  'EXTINGUISHER': 'SAFETY',
  'JACK': 'TOOLS',
  'WASHER': 'FASTENERS',
  'NUT': 'FASTENERS',
  'BOLT': 'FASTENERS',
  'SCREW': 'FASTENERS',
  'GEAR': 'TRANSMISSION',
  'CLUTCH': 'TRANSMISSION',
  'AIR': 'FILTERS',
};

// Vendor mappings
const vendorMappings = {
  'TYRE': 'tyre_supplier',
  'OIL': 'fluids_supplier',
  'FILTER': 'filter_supplier',
  'BATTERY': 'electrical_parts_supplier',
  'BULB': 'electrical_parts_supplier',
  'LAMP': 'electrical_parts_supplier',
  'PUMP': 'engine_parts_supplier',
  'GASKET': 'engine_parts_supplier',
  'SEAL': 'engine_parts_supplier',
  'BELT': 'engine_parts_supplier',
  'BRAKE': 'braking_system_supplier',
  'CLUTCH': 'transmission_supplier',
  'GEAR': 'transmission_supplier',
  'EXTINGUISHER': 'safety_equipment_supplier',
  'WASHER': 'hardware_supplier',
  'NUT': 'hardware_supplier',
  'BOLT': 'hardware_supplier',
  'SCREW': 'hardware_supplier',
};

// Default values
const defaultVendor = 'general_supplier';
const defaultVendorName = 'General Supplier';

// Read the input file
async function readInputFile() {
  try {
    // Read as text since it's a module file
    const content = fs.readFileSync(inputFilePath, 'utf8');

    // Extract the array using regex
    const arrayMatch = content.match(/const\s+stockInventory\s*=\s*\[([\s\S]*?)\];/);
    if (!arrayMatch) {
      throw new Error('Could not find stockInventory array in the input file');
    }

    // Use eval to parse the array (be careful with this in production!)
    const arrayContent = `[${arrayMatch[1]}]`;
    // Add proper quotes to property names to make it valid JSON
    const validJsonString = arrayContent
      .replace(/(\w+):/g, '"$1":')
      .replace(/'/g, '"');

    return JSON.parse(validJsonString);
  } catch (error) {
    console.error('Error reading or parsing input file:', error);
    throw error;
  }
}

// Determine category based on item description
function determineCategory(item) {
  const description = (item.StockDescription || '').toUpperCase();

  for (const [keyword, category] of Object.entries(categoryMappings)) {
    if (description.includes(keyword)) {
      return category;
    }
  }

  return 'OTHER';
}

// Determine sub-category based on item description
function determineSubCategory(item, category) {
  const description = (item.StockDescription || '').toUpperCase();

  // Define some sub-categories based on main category
  const subCategoryMap = {
    'TYRES': ['STEER', 'DRIVE', 'TRAILER', 'RETREAD', 'TUBE'],
    'FILTERS': ['AIR', 'OIL', 'FUEL', 'HYDRAULIC'],
    'ELECTRICAL': ['LIGHTING', 'BATTERIES', 'ALTERNATOR', 'STARTER'],
    'ENGINE PARTS': ['COOLING', 'LUBRICATING', 'FUEL SYSTEM', 'BELTS'],
    'BRAKING SYSTEM': ['PADS', 'DRUMS', 'DISCS', 'HYDRAULIC'],
    'FASTENERS': ['BOLTS', 'NUTS', 'WASHERS', 'SCREWS'],
  };

  // Check if we have defined sub-categories for this category
  const possibleSubCategories = subCategoryMap[category] || [];

  for (const subCategory of possibleSubCategories) {
    if (description.includes(subCategory)) {
      return subCategory;
    }
  }

  return '';
}

// Determine vendor based on item description
function determineVendor(item) {
  const description = (item.StockDescription || '').toUpperCase();

  for (const [keyword, vendorId] of Object.entries(vendorMappings)) {
    if (description.includes(keyword)) {
      return {
        vendorId,
        vendorName: vendorId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      };
    }
  }

  return { vendorId: defaultVendor, vendorName: defaultVendorName };
}

// Determine unit based on item description
function determineUnit(item) {
  const description = (item.StockDescription || '').toUpperCase();

  if (description.includes('OIL') || description.includes('FLUID')) {
    return 'lt';
  }

  return 'ea';
}

// Transform the data
function transformData(data) {
  return data.map(item => {
    const category = determineCategory(item);
    const { vendorId, vendorName } = determineVendor(item);

    return {
      itemCode: item.StockCde,
      itemName: item.StockDescription,
      category,
      subCategory: determineSubCategory(item, category),
      description: item.StockDescription,
      unit: determineUnit(item),
      quantity: parseFloat(item.StockQty) || 0,
      reorderLevel: parseInt(item.ReorderLevel) || 0,
      cost: parseFloat(item.StockCostPrice) || 0,
      vendor: vendorName,
      vendorId,
      location: item.StoreName,
      lastRestocked: new Date().toISOString().split('T')[0],
      serialNumber: item.SupplierPartNo || '',
    };
  });
}

// Write the output file
function writeOutputFile(transformedData) {
  const outputContent = `/**
 * Transformed Inventory Data
 *
 * This file was generated by transform-inventory-data.js
 * It contains inventory data transformed to match the WorkshopContext format
 */

const transformedInventory = ${JSON.stringify(transformedData, null, 2)};

module.exports = transformedInventory;
`;

  fs.writeFileSync(outputFilePath, outputContent, 'utf8');
  console.log(`✅ Successfully transformed ${transformedData.length} inventory items`);
  console.log(`✅ Output written to ${outputFilePath}`);
}

// Main function
async function main() {
  try {
    console.log('🔄 Starting inventory data transformation...');

    // Read input data
    console.log(`📂 Reading data from ${inputFilePath}...`);
    const inputData = await readInputFile();
    console.log(`✅ Found ${inputData.length} inventory items`);

    // Transform data
    console.log('🔄 Transforming data...');
    const transformedData = transformData(inputData);

    // Write output
    console.log(`📂 Writing transformed data to ${outputFilePath}...`);
    writeOutputFile(transformedData);

    console.log('✅ Transformation complete!');
  } catch (error) {
    console.error('❌ Error during transformation:', error);
    process.exit(1);
  }
}

// Run the script
main();
