#!/bin/bash

# 🚀 Netlify Deployment Script
# Triggers a build via webhook and optionally runs a local build

echo "🚀 Matanuska Fleet Management - Netlify Deployment"
echo "================================================="

# Netlify site information
SITE_NAME="matanuskatransportt"
SITE_ID="58378633-127a-44c4-878e-61f92936861d"
# TODO: Update the build hook URL after creating it in the Netlify dashboard
BUILD_HOOK_URL="https://api.netlify.com/build_hooks/YOUR_NEW_BUILD_HOOK_ID"
SITE_URL="https://matanuskatransportt.netlify.app/"

echo "📋 Site Information:"
echo "   Name: $SITE_NAME"
echo "   ID: $SITE_ID"
echo "   URL: $SITE_URL"
echo ""

# Function to trigger build via webhook
trigger_build() {
    echo "🔄 Triggering Netlify build via webhook..."

    # Use curl to trigger the build hook
    response=$(curl -X POST "$BUILD_HOOK_URL" \
        -H "Content-Type: application/json" \
        -w "%{http_code}" \
        -s -o /dev/null)

    if [ "$response" = "200" ]; then
        echo "✅ Build triggered successfully!"
        echo "🌐 Monitor deployment at: https://app.netlify.com/sites/$SITE_NAME/deploys"
        echo "📱 Site will be available at: $SITE_URL"
    else
        echo "❌ Failed to trigger build. HTTP status: $response"
        exit 1
    fi
}

# Function to run local build test
local_build() {
    echo "🏗️ Running local build test..."

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi

    # Ensure QR code dependencies are installed
    echo "📦 Installing QR code dependencies..."
    npm install qrcode.react html5-qrcode --save

    # Run the build
    echo "🔨 Building project..."
    npm run build

    if [ $? -eq 0 ]; then
        echo "✅ Local build successful!"
        echo "📁 Build output in ./dist directory"
    else
        echo "❌ Local build failed!"
        exit 1
    fi
}

# Main script logic
case "${1:-trigger}" in
    "local")
        local_build
        ;;
    "trigger")
        trigger_build
        ;;
    "both")
        local_build
        echo ""
        trigger_build
        ;;
    "help")
        echo "Usage: $0 [local|trigger|both|help]"
        echo ""
        echo "Options:"
        echo "  local    - Run local build test only"
        echo "  trigger  - Trigger Netlify build via webhook (default)"
        echo "  both     - Run local build test then trigger Netlify build"
        echo "  help     - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                # Trigger Netlify build"
        echo "  $0 local          # Test build locally"
        echo "  $0 both           # Test locally then deploy"
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment script completed!"
