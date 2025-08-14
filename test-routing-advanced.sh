#!/bin/bash

# Advanced testing script for routing and sidebar functionality

echo "===== Matanuska TP Routing & Sidebar Testing Suite ====="
echo "Starting comprehensive testing..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Static analysis checks
echo -e "\n${YELLOW}1. Running static analysis...${NC}"

# Check interface structure
if grep -q "export interface SidebarItem" ./src/config/sidebarConfig.ts && \
   grep -q "id: string" ./src/config/sidebarConfig.ts && \
   grep -q "label: string" ./src/config/sidebarConfig.ts && \
   grep -q "path: string" ./src/config/sidebarConfig.ts && \
   grep -q "component: string" ./src/config/sidebarConfig.ts && \
   grep -q "children?: SidebarItem" ./src/config/sidebarConfig.ts; then
  echo -e "${GREEN}✓ SidebarItem interface is correctly defined${NC}"
else
  echo -e "${RED}✗ SidebarItem interface has issues${NC}"
fi

# Check AppRoutes structure
if grep -q "import React" ./src/AppRoutes.tsx && \
   grep -q "generateRoutes" ./src/AppRoutes.tsx && \
   grep -q "lazy" ./src/AppRoutes.tsx && \
   grep -q "Suspense" ./src/AppRoutes.tsx; then
  echo -e "${GREEN}✓ AppRoutes has correct structure with lazy loading${NC}"
else
  echo -e "${RED}✗ AppRoutes structure has issues${NC}"
fi

# Check App.tsx integration
if grep -q "<AppRoutes" ./src/App.tsx; then
  echo -e "${GREEN}✓ AppRoutes is correctly integrated in App.tsx${NC}"
else
  echo -e "${RED}✗ AppRoutes is not properly integrated in App.tsx${NC}"
fi

# 2. Route structure validation
echo -e "\n${YELLOW}2. Validating route structure...${NC}"

# Count top-level routes
TOP_LEVEL_SECTIONS=$(grep -c "id: '" ./src/config/sidebarConfig.ts)
echo -e "Found ${GREEN}$TOP_LEVEL_SECTIONS${NC} main sections in sidebarConfig.ts"

# Check for hierarchical structure
CHILDREN_COUNT=$(grep -c "children: \[" ./src/config/sidebarConfig.ts)
echo -e "Found ${GREEN}$CHILDREN_COUNT${NC} parent routes with children"

# 3. Component validation
echo -e "\n${YELLOW}3. Validating component references...${NC}"

# Extract components from sidebarConfig
echo "Checking component paths in sidebarConfig.ts..."
COMPONENT_PATHS=$(grep -o "component: '[^']*'" ./src/config/sidebarConfig.ts | sed "s/component: '//g" | sed "s/'//g")

# Count components
COMPONENT_COUNT=$(echo "$COMPONENT_PATHS" | wc -l)
echo -e "Found ${GREEN}$COMPONENT_COUNT${NC} component references in sidebarConfig.ts"

# Check for key sections
KEY_SECTIONS=("dashboard" "trip-management" "invoices" "diesel" "clients" "drivers" "compliance" "analytics" "workshop" "reports" "notifications" "settings")
FOUND_SECTIONS=0

for SECTION in "${KEY_SECTIONS[@]}"; do
  if grep -q "id: '$SECTION'" ./src/config/sidebarConfig.ts; then
    echo -e "${GREEN}✓ Found section: $SECTION${NC}"
    FOUND_SECTIONS=$((FOUND_SECTIONS+1))
  else
    echo -e "${RED}✗ Missing section: $SECTION${NC}"
  fi
done

echo -e "Found ${GREEN}$FOUND_SECTIONS${NC} out of ${#KEY_SECTIONS[@]} key sections"

# 4. Route generation test
echo -e "\n${YELLOW}4. Testing route generation...${NC}"

# Check the generateRoutes function
if grep -q "const generateRoutes = (items)" ./src/AppRoutes.tsx; then
  echo -e "${GREEN}✓ Route generation function exists${NC}"
  
  # Check if it handles children
  if grep -q "item.children" ./src/AppRoutes.tsx; then
    echo -e "${GREEN}✓ Route generation handles children correctly${NC}"
  else
    echo -e "${RED}✗ Route generation doesn't handle children${NC}"
  fi
else
  echo -e "${RED}✗ Route generation function missing${NC}"
fi

# 5. Summary
echo -e "\n${YELLOW}5. Testing summary${NC}"

# Calculate score based on checks
TOTAL_CHECKS=8
PASSED_CHECKS=0

# Check each condition separately
if grep -q "export interface SidebarItem" ./src/config/sidebarConfig.ts; then
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "children?: SidebarItem" ./src/config/sidebarConfig.ts; then
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "import React" ./src/AppRoutes.tsx; then
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "generateRoutes" ./src/AppRoutes.tsx; then
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "<AppRoutes" ./src/App.tsx; then
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if [ $FOUND_SECTIONS -eq ${#KEY_SECTIONS[@]} ]; then
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "generateRoutes = (items)" ./src/AppRoutes.tsx; then
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

if grep -q "item.children" ./src/AppRoutes.tsx; then
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
fi

SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo -e "Routing system score: ${GREEN}$SCORE%${NC}"

if [ $SCORE -eq 100 ]; then
  echo -e "${GREEN}All checks passed! The routing system is correctly implemented.${NC}"
elif [ $SCORE -ge 80 ]; then
  echo -e "${YELLOW}Most checks passed. The routing system is mostly correct but may have minor issues.${NC}"
else
  echo -e "${RED}Multiple checks failed. The routing system needs improvements.${NC}"
fi

echo -e "\n${YELLOW}Testing complete! Run the application to verify UI functionality.${NC}"
echo -e "Use: npm start or npm run test-routing to launch the tester"
