#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BOLD}=== UI Verification Script ===${NC}"
echo -e "${BLUE}Starting UI verification process...${NC}"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Execute the simplified UI test
echo -e "${YELLOW}Running UI Connection Test...${NC}"
node ui-simple-test.js
UI_TEST_RESULT=$?

if [ $UI_TEST_RESULT -ne 0 ]; then
    echo -e "${RED}UI test failed with error code $UI_TEST_RESULT${NC}"
    exit $UI_TEST_RESULT
fi

echo -e "${GREEN}UI verification completed successfully!${NC}"
echo -e "${YELLOW}For interactive testing, add UIConnector to your App.tsx${NC}"
exit 0
