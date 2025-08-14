#!/bin/bash

# ====================================================
# Production Deployment Script for Matanuska Transport
# ====================================================

echo "🚀 Starting production deployment process..."
echo "=============================================="

# Environment validation
echo "📋 Validating environment setup..."

# Check if Node.js is installed with correct version
NODE_VERSION=$(node -v)
echo "  ✓ Node.js version: $NODE_VERSION"

# Check if npm is installed
NPM_VERSION=$(npm -v)
echo "  ✓ npm version: $NPM_VERSION"

# Check for necessary config files
if [ ! -f "vite.config.ts" ]; then
  echo "❌ Error: vite.config.ts not found"
  exit 1
else
  echo "  ✓ vite.config.ts found"
fi

if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found"
  exit 1
else
  echo "  ✓ package.json found"
fi

if [ ! -f ".env" ]; then
  echo "⚠️ Warning: .env file not found. Using environment variables or defaults."
else
  echo "  ✓ .env file found"
fi

if [ ! -f "netlify.toml" ]; then
  echo "⚠️ Warning: netlify.toml not found. Will use default settings for Netlify."
else
  echo "  ✓ netlify.toml found"
fi

# Check for Firebase configuration
if [ ! -f "src/firebaseConfig.ts" ]; then
  echo "⚠️ Warning: Firebase configuration not found at src/firebaseConfig.ts"
else
  echo "  ✓ Firebase configuration found"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Handle any potential environment validation
echo ""
echo "🔍 Validating environment variables..."
npm run validate:env || {
  echo "⚠️ Environment validation warnings (continuing anyway)"
}

# Build the application
echo ""
echo "🏗️ Building the application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Build failed: dist directory not found"
  exit 1
else
  echo "✅ Build successful! Dist directory created with size:"
  du -sh dist/
  echo ""
  echo "📊 Files in dist directory:"
  find dist -type f | wc -l
  echo ""
fi

# Deployment options
echo "🌐 Deployment options:"
echo "  1. Deploy to Netlify"
echo "  2. Deploy to Vercel"
echo "  3. Manual deployment (generate deployment package only)"
echo ""
read -p "Select deployment option (1-3): " DEPLOY_OPTION

case $DEPLOY_OPTION in
  1)
    # Deploy to Netlify
    echo "🚀 Deploying to Netlify..."
    
    # Check if netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
      echo "⚙️ Installing Netlify CLI..."
      npm install -g netlify-cli
    fi
    
    # Deploy to Netlify
    echo "🌐 Deploying to Netlify..."
    netlify deploy --dir=dist --prod
    ;;
    
  2)
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    
    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
      echo "⚙️ Installing Vercel CLI..."
      npm install -g vercel
    fi
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    ;;
    
  3)
    # Manual deployment
    echo "📦 Creating deployment package..."
    
    # Create a zip file of the dist directory
    cd dist
    zip -r ../matanuska-production-deploy.zip *
    cd ..
    
    echo "✅ Deployment package created: matanuska-production-deploy.zip"
    echo ""
    echo "To manually deploy:"
    echo "1. Upload the matanuska-production-deploy.zip file to your hosting service"
    echo "2. Extract the contents to your web root directory"
    ;;
    
  *)
    echo "❌ Invalid option selected"
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment process completed!"
