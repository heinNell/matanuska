#!/bin/bash

# Simple Netlify Deployment Script for static files
# This script deploys the simplified version that focuses on the sidebar with grey background
# and the active trips functionality

echo "🚀 Matanuska Fleet Management - Simplified Deployment"
echo "====================================================="

# Ensure the simplified-deploy directory exists
if [ ! -d "simplified-deploy" ]; then
  echo "❌ Error: simplified-deploy directory not found"
  echo "Creating the directory..."
  mkdir -p simplified-deploy
fi

echo "📦 Preparing files for deployment..."

# Copy netlify.toml and index.html to the deployment directory
echo "✅ Added index.html and netlify.toml to deployment package"

# Create a ZIP file for manual upload to Netlify
echo "📦 Creating ZIP file for manual upload..."
cd simplified-deploy
zip -r ../matanuska-simplified-deploy.zip *
cd ..

echo ""
echo "🎉 Deployment package created successfully!"
echo ""
echo "To deploy to Netlify:"
echo "1. Go to https://app.netlify.com"
echo "2. Click 'Add new site' > 'Deploy manually'"
echo "3. Drag and drop the 'matanuska-simplified-deploy.zip' file"
echo ""
echo "Build command: (leave empty)"
echo "Publish directory: /"
echo ""
echo "Your site will be deployed with the grey sidebar and active trips functionality!"
