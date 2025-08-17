#!/bin/bash

# This script fixes TypeScript ESM module imports by adding file extensions

echo "Scanning for missing file extensions in import statements..."

# Find all TypeScript files
FILES=$(find ./src ./scripts ./tools -type f -name "*.ts" -o -name "*.tsx" -o -name "*.mts" -o -name "*.mjs" | grep -v "node_modules" | grep -v "dist" | grep -v "build")

# Count of files fixed
FIXED_COUNT=0
SCANNED_COUNT=0

for file in $FILES; do
  SCANNED_COUNT=$((SCANNED_COUNT + 1))

  # Find import statements without extensions that point to local files
  # This regex matches imports like: import X from './path/to/file'
  # But not: import X from 'package-name'
  NEEDS_FIXING=$(grep -E "import .* from ['\"](\./|\.\./|/)[^'\"]*['\"]" "$file" | grep -v -E "['\"](\./|\.\./|/)[^'\"]*\.(js|jsx|ts|tsx|json)['\"]")

  if [ -n "$NEEDS_FIXING" ]; then
    echo "Fixing imports in $file"
    FIXED_COUNT=$((FIXED_COUNT + 1))

    # For each import statement that needs fixing
    while IFS= read -r line; do
      # Extract the import path
      IMPORT_PATH=$(echo "$line" | grep -oE "['\"](\./|\.\./|/)[^'\"]*['\"]" | tr -d "'\"")

      # Determine if the file exists with different extensions
      if [ -f "${IMPORT_PATH}.ts" ]; then
        EXT=".ts"
      elif [ -f "${IMPORT_PATH}.tsx" ]; then
        EXT=".tsx"
      elif [ -f "${IMPORT_PATH}.js" ]; then
        EXT=".js"
      elif [ -f "${IMPORT_PATH}.jsx" ]; then
        EXT=".jsx"
      elif [ -f "${IMPORT_PATH}/index.ts" ]; then
        EXT="/index.ts"
      elif [ -f "${IMPORT_PATH}/index.tsx" ]; then
        EXT="/index.tsx"
      elif [ -f "${IMPORT_PATH}/index.js" ]; then
        EXT="/index.js"
      elif [ -f "${IMPORT_PATH}/index.jsx" ]; then
        EXT="/index.jsx"
      else
        echo "  Could not determine file extension for: $IMPORT_PATH"
        continue
      fi

      # Replace the import statement
      ORIGINAL=$(echo "$line" | sed 's/\//\\\//g')
      REPLACEMENT=$(echo "$line" | sed "s/['\"]\(.*\)['\"]/'\\1$EXT'/g" | sed 's/\//\\\//g')
      sed -i "s/$ORIGINAL/$REPLACEMENT/g" "$file"
      echo "  Fixed: $IMPORT_PATH → ${IMPORT_PATH}${EXT}"
    done <<< "$NEEDS_FIXING"
  fi
done

echo "Scan complete!"
echo "Scanned $SCANNED_COUNT files"
echo "Fixed $FIXED_COUNT files with missing extensions"

if [ $FIXED_COUNT -gt 0 ]; then
  echo "Files were fixed. Please run TypeScript check again."
else
  echo "No files needed fixing."
fi
