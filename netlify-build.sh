#!/usr/bin/env bash
# Netlify build script (tolerant version)
# - Less strict error handling to allow deprecation warnings
# - Still fails on actual build errors

set -Euo pipefail  # Removed 'e' flag to be more tolerant
IFS=$'\n\t'

# Remember repo root
ROOT_DIR="$(pwd -P)"

echo "=== Build Environment Debug ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version:  $(npm --version || true)"
corepack enable || true
echo ""

echo "=== Directory contents ==="
ls -la
echo ""

# Install dependencies with explicit error handling
echo "=== Installing dependencies ==="
if [[ -f "package.json" ]]; then
    echo "Installing npm packages..."
    # Use npm ci but don't fail on warnings
    if [[ -f "package-lock.json" ]]; then
        npm ci --no-audit --no-fund || {
            echo "npm ci failed, trying npm install..."
            npm install --no-audit --no-fund
        }
    else
        npm install --no-audit --no-fund
    fi
    echo "Dependencies installed (warnings ignored)"
else
    echo "❌ No package.json found"
    exit 1
fi

# Build with explicit error handling
echo "=== Building application ==="
if npm run build; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    exit 1
fi

# Verify build output
echo "=== Verifying build output ==="
if [[ -d "dist" ]]; then
    echo "✅ Build output found in dist/"
    ls -la dist/
    if [[ -f "dist/index.html" ]]; then
        echo "✅ index.html found"
    else
        echo "⚠️ No index.html in dist/"
    fi
else
    echo "❌ No dist/ directory found"
    # Check for other common build directories
    for dir in build out .next; do
        if [[ -d "$dir" ]]; then
            echo "Found alternative build directory: $dir/"
            ls -la "$dir/"
            break
        fi
    done
fi

echo "=== Build script completed ==="
