#!/bin/bash

# Test script for form implementation rule
# This script validates that the ESLint rule works correctly

echo "🔍 Testing Form Implementation ESLint Rule"
echo "======================================="

# List of test files to check
TEST_FILES=(
    "src/components/forms/FleetSelectionForm.tsx"
    "src/components/forms/TripForm.tsx"
    "src/pages/diesel/AddFuelEntryPage.tsx"
    "src/components/ui/chart/ChartFilterForm.tsx"
    "src/pages/workshop/StockInventoryPage.tsx"
)

echo "📋 Files to be tested:"
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (not found)"
    fi
done

echo ""
echo "🚀 Running ESLint with form rule..."

# Test the rule on specific files
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Testing: $file"
        npx eslint --config .eslintrc.form-rules.json "$file" --no-eslintrc || true
        echo ""
    fi
done

echo "✨ Form implementation rule test complete!"

# Additional checks
echo "🔬 Additional Analysis:"
echo "Form components found:"
find src -name "*.tsx" -path "*/forms/*" | wc -l
echo "Page components found:"
find src -name "*.tsx" -path "*/pages/*" | wc -l
echo "Wialon components found:"
find src -name "*.tsx" -path "*/wialon/*" | wc -l

echo ""
echo "📊 Form Hook Usage Analysis:"
echo "useForm occurrences:"
grep -r "useForm" src --include="*.tsx" | wc -l
echo "Form.useForm occurrences:"
grep -r "Form.useForm" src --include="*.tsx" | wc -l
echo "useFormSubmit occurrences:"
grep -r "useFormSubmit" src --include="*.tsx" | wc -l

echo ""
echo "📈 Form Element Analysis:"
echo "<form> elements:"
grep -r "<form" src --include="*.tsx" | wc -l
echo "onSubmit handlers:"
grep -r "onSubmit" src --include="*.tsx" | wc -l
