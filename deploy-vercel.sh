#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Vercel deployment process..."

# Build the application
echo "📦 Building the application..."
npm run build

# Ensure Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚙️ Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel deploy --prod

echo "✅ Deployment complete!"
