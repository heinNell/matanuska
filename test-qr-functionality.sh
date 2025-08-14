#!/bin/bash

# QR Code Functionality Test Script
# Tests the QR code generation and scanning functionality

echo "🧪 Testing QR Code Functionality"
echo "==============================="

# Check if required dependencies are installed
echo "📋 Checking dependencies..."

# Check for qrcode.react
if ! npm list qrcode.react > /dev/null 2>&1; then
  echo "⚠️ qrcode.react not found, installing..."
  npm install qrcode.react --save
else
  echo "✅ qrcode.react found"
fi

# Check for html5-qrcode
if ! npm list html5-qrcode > /dev/null 2>&1; then
  echo "⚠️ html5-qrcode not found, installing..."
  npm install html5-qrcode --save
else
  echo "✅ html5-qrcode found"
fi

# Verify QR code component files exist
echo "📋 Checking QR code component files..."

# Check QRGenerator component
if [ -f "src/pages/workshop/QRGenerator.tsx" ]; then
  echo "✅ QRGenerator component found"
else
  echo "❌ QRGenerator component not found at src/pages/workshop/QRGenerator.tsx"
  exit 1
fi

# Check QRScanner component
if [ -f "src/components/WorkshopManagement/QRScanner.tsx" ]; then
  echo "✅ QRScanner component found"
else
  echo "❌ QRScanner component not found at src/components/WorkshopManagement/QRScanner.tsx"
  exit 1
fi

# Check QRScannerPage component
if [ -f "src/pages/workshop/QRScannerPage.tsx" ]; then
  echo "✅ QRScannerPage component found"
else
  echo "❌ QRScannerPage component not found at src/pages/workshop/QRScannerPage.tsx"
  exit 1
fi

# Check QR code utility functions
if [ -f "src/utils/qrCodeUtils.ts" ]; then
  echo "✅ QR code utilities found"
else
  echo "❌ QR code utilities not found at src/utils/qrCodeUtils.ts"
  exit 1
fi

# Verify routes are set up correctly
echo "📋 Checking QR code routes..."

# Check App.tsx for QR code routes
if grep -q "QRGenerator" "src/App.tsx" && grep -q "QRScannerPage" "src/App.tsx"; then
  echo "✅ QR code routes found in App.tsx"
else
  echo "❌ QR code routes not found in App.tsx"
  exit 1
fi

# Check sidebar config for QR code entries
if grep -q "qr-generator" "src/config/sidebarConfig.ts" && grep -q "qr-scanner" "src/config/sidebarConfig.ts"; then
  echo "✅ QR code entries found in sidebar config"
else
  echo "❌ QR code entries not found in sidebar config"
  exit 1
fi

# Test TypeScript compilation
echo "📋 Testing TypeScript compilation..."
npx tsc --noEmit src/pages/workshop/QRGenerator.tsx src/pages/workshop/QRScannerPage.tsx src/utils/qrCodeUtils.ts

# If we get here, all checks passed
echo "==============================="
echo "✅ All QR code functionality checks passed!"
