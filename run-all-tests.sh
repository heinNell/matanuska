#!/bin/bash

# Master Testing Script for Matanuska TP
# This script runs all verification tools and provides guidance for deployment readiness

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}= Matanuska TP Pre-Deployment Tests =${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Create results directory
RESULTS_DIR="test-results"
mkdir -p $RESULTS_DIR
TEST_DATE=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="$RESULTS_DIR/test-report-$TEST_DATE.md"

# Initialize report
echo "# Matanuska TP Pre-Deployment Test Report" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Date: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## Test Results Summary" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# 1. Routing System Tests
echo -e "${YELLOW}[1/6] Running routing system tests...${NC}"
echo "### 1. Routing System Tests" >> $REPORT_FILE

if bash test-routing-advanced.sh > "$RESULTS_DIR/routing-test-output.txt" 2>&1; then
  echo -e "${GREEN}✓ Routing tests completed successfully${NC}"
  echo "✅ Routing tests passed" >> $REPORT_FILE
else
  echo -e "${RED}✗ Routing tests failed${NC}"
  echo "❌ Routing tests failed - see $RESULTS_DIR/routing-test-output.txt for details" >> $REPORT_FILE
fi

# 2. Button Connection Tests
echo -e "\n${YELLOW}[2/6] Running button connection tests...${NC}"
echo "" >> $REPORT_FILE
echo "### 2. Button Connection Tests" >> $REPORT_FILE

if node check-button-connections.js; then
  echo -e "${GREEN}✓ Button connection tests completed${NC}"
  echo "✅ Button connection tests generated report at BUTTON_CONNECTION_REPORT.md" >> $REPORT_FILE
else
  echo -e "${RED}✗ Button connection tests failed${NC}"
  echo "❌ Button connection tests failed" >> $REPORT_FILE
fi

# 3. Form Connection Tests
echo -e "\n${YELLOW}[3/6] Running form connection tests...${NC}"
echo "" >> $REPORT_FILE
echo "### 3. Form Connection Tests" >> $REPORT_FILE

if node check-form-connections.js; then
  echo -e "${GREEN}✓ Form connection tests completed${NC}"
  echo "✅ Form connection tests generated report at FORM_CONNECTION_REPORT.md" >> $REPORT_FILE
else
  echo -e "${RED}✗ Form connection tests failed${NC}"
  echo "❌ Form connection tests failed" >> $REPORT_FILE
fi

# 4. Build check
echo -e "\n${YELLOW}[4/6] Testing build process...${NC}"
echo "" >> $REPORT_FILE
echo "### 4. Build Process Test" >> $REPORT_FILE

if npm run build > "$RESULTS_DIR/build-output.txt" 2>&1; then
  echo -e "${GREEN}✓ Build successful${NC}"
  echo "✅ Build process completed successfully" >> $REPORT_FILE
else
  echo -e "${RED}✗ Build failed${NC}"
  echo "❌ Build process failed - see $RESULTS_DIR/build-output.txt for details" >> $REPORT_FILE
fi

# 5. Resilience Tests
echo -e "\n${YELLOW}[5/6] Running resilience tests...${NC}"
echo "" >> $REPORT_FILE
echo "### 5. Resilience Tests" >> $REPORT_FILE

if bash test-resilience.sh > "$RESULTS_DIR/resilience-test-output.txt" 2>&1; then
  echo -e "${GREEN}✓ Resilience tests completed successfully${NC}"
  echo "✅ Resilience tests passed - see detailed report in $RESULTS_DIR/resilience-test-output.txt" >> $REPORT_FILE
else
  echo -e "${RED}✗ Resilience tests failed${NC}"
  echo "❌ Resilience tests encountered issues - see $RESULTS_DIR/resilience-test-output.txt for details" >> $REPORT_FILE
fi

# 6. Display next steps for visual testing
echo -e "\n${YELLOW}[6/6] Setting up for visual tests...${NC}"
echo "" >> $REPORT_FILE
echo "### 5. Visual Testing Instructions" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "1. Run \`npm run test:sidebar\` to launch the visual sidebar tester" >> $REPORT_FILE
echo "2. Follow the test scenarios in UI_TESTING_WORKFLOW.md" >> $REPORT_FILE
echo "3. Complete the test checklist for each component" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Final summary
echo -e "\n${GREEN}============= TESTING COMPLETE ==============${NC}"
echo -e "Test report available at: ${BLUE}$REPORT_FILE${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review test reports in the test-results directory"
echo "2. Check BUTTON_CONNECTION_REPORT.md and FORM_CONNECTION_REPORT.md for issues"
echo "3. Review resilience test results in $RESULTS_DIR/resilience-test-output.txt"
echo "4. Run 'npm run test:sidebar' to launch the visual sidebar tester"
echo "5. Follow the test scenarios in UI_TESTING_WORKFLOW.md"
echo "6. Fix any issues found during testing"
echo "7. When all tests pass, proceed with deployment"
echo ""
echo -e "${BLUE}Thank you for ensuring quality through thorough testing!${NC}"
