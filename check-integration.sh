#!/bin/bash

# Route and Component Integration Check Script
# Verifies proper integration between routes and components

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Component Integration Check...${NC}"

# Navigate to project directory
cd "$(dirname "$0")"

# Run the script
node ./scripts/check-integration.cjs "$@"

# Check if check completed successfully
if [ $? -eq 0 ]; then
    echo -e "${BLUE}Integration check complete. Review the results above.${NC}"
    echo -e "${GREEN}Done!${NC}"
else
    echo -e "\033[0;31mCheck failed. Review errors above.${NC}"
    exit 1
fi
