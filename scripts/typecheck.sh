#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print header
echo -e "${YELLOW}=== Running TypeScript Type Check ===${NC}"
echo "Using tsconfig.typecheck.json configuration"

# Run TypeScript compiler in check mode only (no emit)
npx tsc --project tsconfig.typecheck.json

# Check if TypeScript found errors
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ No TypeScript errors found!${NC}"
  exit 0
else
  echo -e "${RED}✗ TypeScript errors found.${NC}"
  echo -e "${YELLOW}Tip: Run 'scripts/fix-esm-imports.sh' to fix missing file extensions in import statements.${NC}"
  exit 1
fi
