#!/bin/bash

# UI Connection Verification Script
# Analyzes React components to verify UI elements are properly connected to handlers

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting UI Connection Verification...${NC}"

# Navigate to project directory
cd "$(dirname "$0")"

# Verify node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed. Please install Node.js first."
    exit 1
fi

# Run the script
node ./scripts/verify-ui-connections.cjs "$@"

# Check if report was generated
if [ $? -eq 0 ]; then
    echo -e "${BLUE}You can view the full report in UI_CONNECTION_REPORT.md${NC}"
    echo -e "${GREEN}Verification complete!${NC}"
else
    echo -e "\033[0;31mVerification failed. Check errors above.${NC}"
    exit 1
fi
