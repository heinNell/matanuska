/**
 * Form Validation Security Test Script
 *
 * This script tests the form validation security mechanisms to ensure that
 * invalid or malicious data is properly rejected.
 */

import { validateFormData, sanitizeCollectionPath, validateId } from '../src/utils/validation';

console.log('Starting form validation security tests...');

// Test vehicle form validation
console.log('\n🔍 Testing vehicle form validation:');
try {
  // Valid data should pass
  const validVehicle = {
    registrationNumber: 'ABC123',
    vehicleType: 'truck',
    manufacturer: 'Volvo',
    model: 'FH16',
    year: 2023
  };

  const result = validateFormData(validVehicle, 'vehicle');
  if (result && typeof result === 'object' && 'registrationNumber' in result) {
    console.log('✅ Valid vehicle data passed validation:', result.registrationNumber);
  } else {
    console.log('✅ Valid vehicle data passed validation');
  }

  // Test with missing required field
  try {
    validateFormData({
      vehicleType: 'truck',
      manufacturer: 'Volvo',
      model: 'FH16',
      year: 2023
    }, 'vehicle');
    console.log('❌ Failed: Accepted vehicle without registration number');
  } catch (error) {
    console.log('✅ Correctly rejected vehicle without registration number');
  }

  // Test with invalid enum value
  try {
    validateFormData({
      registrationNumber: 'ABC123',
      vehicleType: 'rocket', // Invalid type
      manufacturer: 'Volvo',
      model: 'FH16',
      year: 2023
    }, 'vehicle');
    console.log('❌ Failed: Accepted vehicle with invalid type');
  } catch (error) {
    console.log('✅ Correctly rejected vehicle with invalid type');
  }

  // Test with invalid year
  try {
    validateFormData({
      registrationNumber: 'ABC123',
      vehicleType: 'truck',
      manufacturer: 'Volvo',
      model: 'FH16',
      year: 1800 // Too old
    }, 'vehicle');
    console.log('❌ Failed: Accepted vehicle with invalid year');
  } catch (error) {
    console.log('✅ Correctly rejected vehicle with invalid year');
  }

} catch (error) {
  console.error('❌ Vehicle validation test failed:', error.message);
}

// Test trip form validation
console.log('\n🔍 Testing trip form validation:');
try {
  // Valid data should pass
  const validTrip = {
    vehicleId: 'v123',
    driverId: 'd456',
    startTime: new Date(),
    startOdometer: 12500,
    startLocation: {
      lat: 34.0522,
      lng: -118.2437
    },
    status: 'planned'
  };

  const result = validateFormData(validTrip, 'trip');
  console.log('✅ Valid trip data passed validation');

  // Test with invalid coordinates
  try {
    validateFormData({
      ...validTrip,
      startLocation: {
        lat: 100, // Invalid latitude (> 90)
        lng: -118.2437
      }
    }, 'trip');
    console.log('❌ Failed: Accepted trip with invalid coordinates');
  } catch (error) {
    console.log('✅ Correctly rejected trip with invalid coordinates');
  }

} catch (error) {
  console.error('❌ Trip validation test failed:', error.message);
}

// Test collection path sanitization
console.log('\n🔍 Testing collection path sanitization:');
try {
  // Valid path should pass
  const validPath = 'vehicles/truck-fleet';
  const sanitized = sanitizeCollectionPath(validPath);
  console.log(`✅ Valid path "${validPath}" was accepted`);

  // Test path traversal attempt
  try {
    sanitizeCollectionPath('../etc/passwd');
    console.log('❌ Failed: Accepted path traversal attempt');
  } catch (error) {
    console.log('✅ Correctly rejected path traversal attempt');
  }

  // Test invalid characters
  try {
    sanitizeCollectionPath('vehicles; DROP TABLE users;');
    console.log('❌ Failed: Accepted path with invalid characters');
  } catch (error) {
    console.log('✅ Correctly rejected path with invalid characters');
  }

} catch (error) {
  console.error('❌ Path sanitization test failed:', error.message);
}

// Test ID validation
console.log('\n🔍 Testing ID validation:');
try {
  // Valid ID should pass
  const validId = 'abc123';
  const validatedId = validateId(validId);
  console.log(`✅ Valid ID "${validId}" was accepted`);

  // Test empty ID
  try {
    validateId('');
    console.log('❌ Failed: Accepted empty ID');
  } catch (error) {
    console.log('✅ Correctly rejected empty ID');
  }

  // Test non-string ID
  try {
    validateId(12345);
    console.log('❌ Failed: Accepted non-string ID');
  } catch (error) {
    console.log('✅ Correctly rejected non-string ID');
  }

} catch (error) {
  console.error('❌ ID validation test failed:', error.message);
}

console.log('\n✨ Form validation security tests completed');
