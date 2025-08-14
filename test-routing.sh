#!/bin/bash

# Test script for verifying routing and navigation
echo "Starting routing and navigation testing..."

# 1. Check if App.tsx is using AppRoutes properly
echo "Checking App.tsx integration..."
if grep -q "import { AppRoutes } from './AppRoutes';" ./src/App.tsx; then
  echo "✅ AppRoutes is properly imported in App.tsx"
else
  echo "❌ AppRoutes import not found in App.tsx"
fi

if grep -q "<AppRoutes />" ./src/App.tsx; then
  echo "✅ AppRoutes component is properly rendered in App.tsx"
else
  echo "❌ AppRoutes component not found in App.tsx"
fi

# 2. Validate sidebarConfig.ts structure
echo ""
echo "Checking sidebarConfig.ts structure..."
if grep -q "export interface SidebarItem" ./src/config/sidebarConfig.ts; then
  echo "✅ SidebarItem interface exists"
else
  echo "❌ SidebarItem interface missing"
fi

if grep -q "children?: SidebarItem\[\]" ./src/config/sidebarConfig.ts; then
  echo "✅ Hierarchical structure support exists"
else
  echo "❌ Hierarchical structure support missing"
fi

# 3. Validate AppRoutes.tsx functionality
echo ""
echo "Checking AppRoutes.tsx functionality..."
if grep -q "generateRoutes(" ./src/AppRoutes.tsx; then
  echo "✅ Route generation function exists"
else
  echo "❌ Route generation function missing"
fi

if grep -q "React.lazy" ./src/AppRoutes.tsx || grep -q "lazy" ./src/AppRoutes.tsx; then
  echo "✅ Lazy loading is implemented"
else
  echo "❌ Lazy loading not implemented"
fi

# 4. Count routes in sidebarConfig
echo ""
echo "Counting routes in sidebarConfig..."
MAIN_SECTIONS=$(grep -c "id: '" ./src/config/sidebarConfig.ts)
echo "Found approximately $MAIN_SECTIONS route entries in sidebarConfig.ts"

# 5. Check for common components
echo ""
echo "Checking for essential components..."
COMPONENTS=("DashboardPage" "TripManagementPage" "InvoiceDashboard" "DieselDashboard" "DriverDashboard" "ComplianceDashboard")

for COMPONENT in "${COMPONENTS[@]}"; do
  if grep -q "$COMPONENT" ./src/config/sidebarConfig.ts; then
    echo "✅ $COMPONENT is configured in routes"
  else
    echo "❌ $COMPONENT missing from routes"
  fi
done

echo ""
echo "Testing completed. Run 'npm start' and navigate to the SidebarTester component to visually verify navigation."
