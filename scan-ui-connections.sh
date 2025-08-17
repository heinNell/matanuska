#!/bin/bash

# UI Connection Scanner Script
# Scans for UI elements and their corresponding handlers

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting UI Connection Scanner...${NC}"

# Navigate to project directory
cd "$(dirname "$0")"

# Run the script
node ./scripts/ui-connection-scanner.mjs "$@"

# Check if scan completed successfully
if [ $? -eq 0 ]; then
    echo -e "${BLUE}Scan complete. You can view the full report in ui-connection-report.json${NC}"
    echo -e "${GREEN}Done!${NC}"
else
    echo -e "\033[0;31mScan failed. Check errors above.${NC}"
    exit 1
fi
