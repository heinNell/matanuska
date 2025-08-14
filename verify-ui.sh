#!/bin/bash

# verify-ui.sh
# This script runs all UI verification tools to ensure UI components are properly connected

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check for node and npm
check_environment() {
  echo -e "${BLUE}Checking environment...${NC}"
  
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js to continue.${NC}"
    exit 1
  fi
  
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm to continue.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Environment check passed!${NC}"
}

# Step 1: Static analysis of UI connections
run_static_analysis() {
  echo -e "\n${MAGENTA}=== STEP 1: Running static UI connection analysis ===${NC}"
  node ui-connection-scanner.js
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Static analysis failed!${NC}"
    exit 1
  fi
}

# Step 2: Verify routes and sidebar links
verify_routes() {
  echo -e "\n${MAGENTA}=== STEP 2: Verifying routes and navigation ===${NC}"
  
  if [ -f "sidebar-audit.cjs" ]; then
    node sidebar-audit.cjs
    if [ $? -ne 0 ]; then
      echo -e "${YELLOW}Sidebar audit reported issues${NC}"
    fi
  else
    echo -e "${YELLOW}Sidebar audit script not found, skipping${NC}"
  fi
  
  if [ -f "route-audit.cjs" ]; then
    node route-audit.cjs
    if [ $? -ne 0 ]; then
      echo -e "${YELLOW}Route audit reported issues${NC}"
    fi
  else
    echo -e "${YELLOW}Route audit script not found, skipping${NC}"
  fi
}

# Step 3: Install UIConnector for interactive testing
setup_ui_connector() {
  echo -e "\n${MAGENTA}=== STEP 3: Setting up UI interactive tester ===${NC}"
  node ui-tester-setup.js inject
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to set up UI interactive tester!${NC}"
  else
    echo -e "${GREEN}UI interactive tester is now set up${NC}"
    echo -e "${CYAN}Start your development server and navigate to your app to use the UI Connector${NC}"
    echo -e "${CYAN}When finished testing, run: node ui-tester-setup.js restore${NC}"
  fi
}

# Step 4: Run automated UI interaction tests (optional)
run_automated_tests() {
  echo -e "\n${MAGENTA}=== STEP 4: Running automated UI interaction tests ===${NC}"
  
  # Check if development server is running
  if ! curl -s http://localhost:5173 > /dev/null; then
    echo -e "${YELLOW}Development server does not appear to be running on port 5173${NC}"
    echo -e "${YELLOW}Please start your development server in another terminal and then press Enter to continue${NC}"
    read -p "Press Enter to continue once the server is running (or Ctrl+C to cancel)..."
  fi
  
  # Run the tests
  node route-ui-test.js
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Automated UI tests failed!${NC}"
  else
    echo -e "${GREEN}Automated UI tests completed!${NC}"
    echo -e "${CYAN}Check ui-interaction-test-report.json for detailed results${NC}"
  fi
}

# Show summary and recommendations
show_summary() {
  echo -e "\n${MAGENTA}=== UI VERIFICATION COMPLETE ===${NC}"
  
  if [ -f "ui-connection-report.json" ]; then
    ISSUE_COUNT=$(grep -o '"potentialIssuesCount":' ui-connection-report.json | wc -l)
    
    if [ "$ISSUE_COUNT" -gt 0 ]; then
      echo -e "${YELLOW}Static analysis found potential UI connection issues${NC}"
      echo -e "${CYAN}Review ui-connection-report.json for details${NC}"
    else
      echo -e "${GREEN}No potential UI connection issues found in static analysis${NC}"
    fi
  fi
  
  if [ -f "ui-interaction-test-report.json" ]; then
    SUCCESS_RATE=$(grep -o '"success":true' ui-interaction-test-report.json | wc -l)
    FAILURE_RATE=$(grep -o '"success":false' ui-interaction-test-report.json | wc -l)
    TOTAL=$((SUCCESS_RATE + FAILURE_RATE))
    
    if [ "$TOTAL" -gt 0 ]; then
      PERCENT=$((SUCCESS_RATE * 100 / TOTAL))
      
      if [ "$PERCENT" -ge 80 ]; then
        echo -e "${GREEN}UI interaction tests: ${PERCENT}% successful (${SUCCESS_RATE}/${TOTAL})${NC}"
      elif [ "$PERCENT" -ge 50 ]; then
        echo -e "${YELLOW}UI interaction tests: ${PERCENT}% successful (${SUCCESS_RATE}/${TOTAL})${NC}"
      else
        echo -e "${RED}UI interaction tests: ${PERCENT}% successful (${SUCCESS_RATE}/${TOTAL})${NC}"
      fi
    fi
  fi
  
  echo -e "\n${CYAN}Recommendations:${NC}"
  echo -e "1. Review any potential issues in the reports"
  echo -e "2. Test interactive UI elements using the UI Connector in the browser"
  echo -e "3. Fix disconnected UI elements by adding proper event handlers"
  echo -e "4. Run this script again after making changes to verify improvements"
}

# Main script execution
main() {
  echo -e "${BLUE}===============================================${NC}"
  echo -e "${BLUE}       UI Connection Verification Tool         ${NC}"
  echo -e "${BLUE}===============================================${NC}"
  
  # Check environment
  check_environment
  
  # Run the verification steps
  run_static_analysis
  verify_routes
  setup_ui_connector
  
  # Ask if user wants to run automated tests
  echo -e "\n${CYAN}Do you want to run automated UI interaction tests?${NC}"
  echo -e "${CYAN}This requires your development server to be running.${NC}"
  read -p "Run automated tests? (y/n): " run_tests
  
  if [[ $run_tests =~ ^[Yy]$ ]]; then
    run_automated_tests
  fi
  
  # Show summary
  show_summary
}

# Run the main function
main
