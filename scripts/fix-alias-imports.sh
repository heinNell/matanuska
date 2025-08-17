#!/bin/bash

# This script fixes path alias imports (@/) by updating them to relative paths
# The script is based on the project structure and maps @/ to src/

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Fixing Path Alias Imports (@/) ===${NC}"
echo "Converting @/ imports to relative paths..."

# Find all TypeScript files
FILES=$(find ./src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v "node_modules" | grep -v "dist" | grep -v "build")

# Count of files fixed
FIXED_COUNT=0
FIXED_IMPORTS=0

for file in $FILES; do
  # Get the directory of the current file relative to src
  file_dir=$(dirname "$file" | sed 's/\.\/src\///')

  # Check if the file has @/ imports
  if grep -q "@/" "$file"; then
    echo "Checking file: $file"
    FIXED_COUNT=$((FIXED_COUNT + 1))

    # Find all @/ imports and convert them to relative paths
    while read -r line; do
      # Extract the import path
      import_path=$(echo "$line" | sed -n 's/.*@\/\([^"'\'']*\).*/\1/p')

      if [ -n "$import_path" ]; then
        # Calculate the relative path from the current file to the imported file
        # First, count the number of directories to go up
        dirs_up=$(echo "$file_dir" | tr '/' '\n' | wc -l)

        # Construct the relative path prefix
        rel_prefix=""
        for ((i=1; i<=$dirs_up; i++)); do
          rel_prefix="../$rel_prefix"
        done

        # Replace the @/ with the relative path
        sed_pattern="s|@/$import_path|$rel_prefix$import_path|g"
        sed -i "$sed_pattern" "$file"
        echo "  Fixed: @/$import_path → $rel_prefix$import_path"
        FIXED_IMPORTS=$((FIXED_IMPORTS + 1))
      fi
    done < <(grep -E "from ['\"]@/" "$file")
  fi
done

echo -e "${GREEN}✓ Fixed $FIXED_IMPORTS alias imports in $FIXED_COUNT files${NC}"

if [ $FIXED_COUNT -gt 0 ]; then
  echo "Files were fixed. Please run TypeScript check again."
else
  echo "No files needed fixing."
fi
