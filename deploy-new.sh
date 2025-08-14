#!/bin/bash

# ====================================================
# Production Deployment Script for Matanuska Transport
# ====================================================

echo "🚀 Starting production deployment process..."
echo "=============================================="

# Environment validation
echo "📋 Validating environment setup..."

# Check if needed files exist
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

if [ ! -f "vite.config.ts" ]; then
    echo "❌ Error: vite.config.ts not found"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🏗️ Building for production..."
npm run build:prod

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
npx netlify deploy --prod --dir=dist

echo "✅ Deployment complete!"
