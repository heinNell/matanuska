#!/bin/bash

# Comprehensive build check script
# This script performs a series of checks on the codebase and builds the project

echo "🔍 Running comprehensive build check"
echo "==================================="

# Check for required QR code components
echo "Checking QR code components..."
if [ -f "src/pages/workshop/QRGenerator.tsx" ] && [ -f "src/pages/workshop/QRScannerPage.tsx" ] && [ -f "src/components/WorkshopManagement/QRScanner.tsx" ]; then
  echo "✅ QR code components found"
else
  echo "❌ QR code components missing. Please check your implementation."
  exit 1
fi

# Check for required QR code dependencies
echo "Checking QR code dependencies..."
npm list qrcode.react html5-qrcode || (
  echo "Installing missing QR code dependencies..."
  npm install qrcode.react html5-qrcode --save
)

# Check for PDF generation dependency
echo "Checking PDF generation dependency..."
npm list jspdf || (
  echo "Installing missing PDF generation dependency..."
  npm install jspdf --save
)

# Run TypeScript type check
echo "Cleaning dist to avoid stale type artifacts..."
rm -rf dist 2>/dev/null || true

echo "Running TypeScript type check (typecheck config)..."
npx tsc -p tsconfig.typecheck.json --noEmit

# Run ESLint
echo "Running ESLint..."
npm run lint || echo "⚠️ Linting issues found. Please fix them before deployment."

# Run the build
echo "Building the project..."
npm run build

# Check if build was successful
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo "✅ Build successful!"

  # Additional deployment checks
  echo "Checking for environment configuration..."
  if [ -f ".env" ]; then
    echo "✅ Environment configuration found."
  else
    echo "⚠️ No .env file found. Using default environment variables."
  fi

  echo "==================================="
  echo "✅ Project is ready for deployment!"
  echo "Run one of the deployment scripts to deploy:"
  echo "  - npm run deploy-netlify"
  echo "  - npm run deploy-vercel"
  echo "  - npm run deploy-production"
else
  echo "❌ Build failed. Please check the error messages."
  exit 1
fi
