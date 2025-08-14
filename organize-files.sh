#!/usr/bin/env bash

# File Migration Script for React Application
# This script helps automate the reorganization of files between components and pages

# Make sure we stop on errors
set -e

# Base directories
SRC_DIR="./src"
COMPONENTS_DIR="${SRC_DIR}/components"
PAGES_DIR="${SRC_DIR}/pages"

# Create required directories if they don't exist
create_directories() {
  echo "Creating directory structure..."
  
  # Pages directories
  mkdir -p "${PAGES_DIR}/dashboard"
  mkdir -p "${PAGES_DIR}/drivers"
  mkdir -p "${PAGES_DIR}/trips"
  mkdir -p "${PAGES_DIR}/fleet"
  mkdir -p "${PAGES_DIR}/tyres"
  mkdir -p "${PAGES_DIR}/invoices"
  mkdir -p "${PAGES_DIR}/workshop"
  mkdir -p "${PAGES_DIR}/customers"
  mkdir -p "${PAGES_DIR}/compliance"
  mkdir -p "${PAGES_DIR}/admin"
  mkdir -p "${PAGES_DIR}/auth"
  
  # Components directories
  mkdir -p "${COMPONENTS_DIR}/drivers"
  mkdir -p "${COMPONENTS_DIR}/trips"
  mkdir -p "${COMPONENTS_DIR}/fleet"
  mkdir -p "${COMPONENTS_DIR}/tyres"
  mkdir -p "${COMPONENTS_DIR}/invoices"
  mkdir -p "${COMPONENTS_DIR}/workshop"
  mkdir -p "${COMPONENTS_DIR}/customers"
  mkdir -p "${COMPONENTS_DIR}/compliance"
  mkdir -p "${COMPONENTS_DIR}/admin"
  mkdir -p "${COMPONENTS_DIR}/auth"
  
  echo "Directory structure created successfully."
}

# Rename inconsistent directories
rename_directories() {
  echo "Renaming directories for consistency..."
  
  # Create new directories and move files
  if [ -d "${COMPONENTS_DIR}/Tripmanagement" ]; then
    mkdir -p "${COMPONENTS_DIR}/trips"
    echo "Moving files from ${COMPONENTS_DIR}/Tripmanagement to ${COMPONENTS_DIR}/trips"
    cp -r "${COMPONENTS_DIR}/Tripmanagement/"* "${COMPONENTS_DIR}/trips/"
    echo "Files moved. You may delete the old directory after verifying."
  fi
  
  if [ -d "${COMPONENTS_DIR}/DriverManagement" ]; then
    mkdir -p "${COMPONENTS_DIR}/drivers"
    echo "Moving files from ${COMPONENTS_DIR}/DriverManagement to ${COMPONENTS_DIR}/drivers"
    cp -r "${COMPONENTS_DIR}/DriverManagement/"* "${COMPONENTS_DIR}/drivers/"
    echo "Files moved. You may delete the old directory after verifying."
  fi
  
  if [ -d "${COMPONENTS_DIR}/Tyremanagement" ]; then
    mkdir -p "${COMPONENTS_DIR}/tyres"
    echo "Moving files from ${COMPONENTS_DIR}/Tyremanagement to ${COMPONENTS_DIR}/tyres"
    cp -r "${COMPONENTS_DIR}/Tyremanagement/"* "${COMPONENTS_DIR}/tyres/"
    echo "Files moved. You may delete the old directory after verifying."
  fi
  
  if [ -d "${PAGES_DIR}/Drivermanagementpages" ]; then
    mkdir -p "${PAGES_DIR}/drivers"
    echo "Moving files from ${PAGES_DIR}/Drivermanagementpages to ${PAGES_DIR}/drivers"
    cp -r "${PAGES_DIR}/Drivermanagementpages/"* "${PAGES_DIR}/drivers/"
    echo "Files moved. You may delete the old directory after verifying."
  fi
  
  if [ -d "${PAGES_DIR}/Tyremanagementpages" ]; then
    mkdir -p "${PAGES_DIR}/tyres"
    echo "Moving files from ${PAGES_DIR}/Tyremanagementpages to ${PAGES_DIR}/tyres"
    cp -r "${PAGES_DIR}/Tyremanagementpages/"* "${PAGES_DIR}/tyres/"
    echo "Files moved. You may delete the old directory after verifying."
  fi
  
  echo "Directory renaming complete."
}

# Move page files from components to pages
move_pages_from_components() {
  echo "Moving page files from components directory to pages directory..."
  
  # Find potential page files in components directory
  find "${COMPONENTS_DIR}" -name "*Page.tsx" | while read file; do
    filename=$(basename "$file")
    domain=$(echo "$file" | grep -o '/[^/]*/[^/]*$' | cut -d'/' -f2 | tr '[:upper:]' '[:lower:]')
    
    # Determine target directory based on domain
    target_dir=""
    case "$domain" in
      "drivermanagement"|"driver")
        target_dir="${PAGES_DIR}/drivers"
        ;;
      "tripmanagement"|"trip")
        target_dir="${PAGES_DIR}/trips"
        ;;
      "tyremanagement"|"tyre")
        target_dir="${PAGES_DIR}/tyres"
        ;;
      "invoicemanagement"|"invoice")
        target_dir="${PAGES_DIR}/invoices"
        ;;
      "workshop")
        target_dir="${PAGES_DIR}/workshop"
        ;;
      "compliance"|"compliancesafety")
        target_dir="${PAGES_DIR}/compliance"
        ;;
      "dashboard")
        target_dir="${PAGES_DIR}/dashboard"
        ;;
      *)
        # For other domains, check the filename for clues
        if [[ "$filename" == *"Driver"* ]]; then
          target_dir="${PAGES_DIR}/drivers"
        elif [[ "$filename" == *"Trip"* ]]; then
          target_dir="${PAGES_DIR}/trips"
        elif [[ "$filename" == *"Tyre"* || "$filename" == *"Tire"* ]]; then
          target_dir="${PAGES_DIR}/tyres"
        elif [[ "$filename" == *"Invoice"* ]]; then
          target_dir="${PAGES_DIR}/invoices"
        elif [[ "$filename" == *"Workshop"* ]]; then
          target_dir="${PAGES_DIR}/workshop"
        elif [[ "$filename" == *"Compliance"* ]]; then
          target_dir="${PAGES_DIR}/compliance"
        elif [[ "$filename" == *"Dashboard"* ]]; then
          target_dir="${PAGES_DIR}/dashboard"
        else
          # Default to misc
          target_dir="${PAGES_DIR}/misc"
          mkdir -p "$target_dir"
        fi
        ;;
    esac
    
    # Create target directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Copy the file
    echo "Copying $file to $target_dir/$filename"
    cp "$file" "$target_dir/$filename"
  done
  
  echo "Page files moved successfully."
}

# Generate report of files that need import updates
generate_import_report() {
  echo "Generating import update report..."
  
  # Create report file
  report_file="IMPORT_UPDATES_NEEDED.md"
  echo "# Import Path Updates Needed" > "$report_file"
  echo "" >> "$report_file"
  echo "The following files have imports that need to be updated:" >> "$report_file"
  echo "" >> "$report_file"
  
  # Check for old import paths
  echo "## Components to Update" >> "$report_file"
  echo "" >> "$report_file"
  echo "| File | Old Import | New Import |" >> "$report_file"
  echo "|------|------------|------------|" >> "$report_file"
  
  # Check for Tripmanagement imports
  grep -r "from '.*Tripmanagement/" --include="*.tsx" --include="*.ts" "$SRC_DIR" | while read -r line; do
    file=$(echo "$line" | cut -d':' -f1)
    import=$(echo "$line" | cut -d':' -f2- | sed 's/^[ \t]*//')
    component=$(echo "$import" | grep -o "Tripmanagement/[^'\"]*" | cut -d'/' -f2)
    new_import=$(echo "$import" | sed 's/Tripmanagement/trips/')
    
    echo "| $file | $import | $new_import |" >> "$report_file"
  done
  
  # Check for DriverManagement imports
  grep -r "from '.*DriverManagement/" --include="*.tsx" --include="*.ts" "$SRC_DIR" | while read -r line; do
    file=$(echo "$line" | cut -d':' -f1)
    import=$(echo "$line" | cut -d':' -f2- | sed 's/^[ \t]*//')
    component=$(echo "$import" | grep -o "DriverManagement/[^'\"]*" | cut -d'/' -f2)
    new_import=$(echo "$import" | sed 's/DriverManagement/drivers/')
    
    echo "| $file | $import | $new_import |" >> "$report_file"
  done
  
  # Check for Tyremanagement imports
  grep -r "from '.*Tyremanagement/" --include="*.tsx" --include="*.ts" "$SRC_DIR" | while read -r line; do
    file=$(echo "$line" | cut -d':' -f1)
    import=$(echo "$line" | cut -d':' -f2- | sed 's/^[ \t]*//')
    component=$(echo "$import" | grep -o "Tyremanagement/[^'\"]*" | cut -d'/' -f2)
    new_import=$(echo "$import" | sed 's/Tyremanagement/tyres/')
    
    echo "| $file | $import | $new_import |" >> "$report_file"
  done
  
  # Check for moved page imports
  echo "" >> "$report_file"
  echo "## Pages to Update" >> "$report_file"
  echo "" >> "$report_file"
  echo "| File | Old Import | New Import |" >> "$report_file"
  echo "|------|------------|------------|" >> "$report_file"
  
  echo "Import report generated: $report_file"
}

# Main execution
echo "Starting file organization..."
echo "This script will help reorganize your React files between components and pages."
echo "IMPORTANT: This script makes copies of files and doesn't delete the originals."
echo "You should review the changes and manually delete the old files when ready."
echo ""

# Ask for confirmation
read -p "Do you want to proceed? (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Operation canceled."
  exit 0
fi

# Execute the functions
create_directories
rename_directories
move_pages_from_components
generate_import_report

echo ""
echo "Organization process completed!"
echo "Please check the IMPORT_UPDATES_NEEDED.md file for a list of import paths that need to be updated."
echo "After reviewing the changes and ensuring everything works correctly,"
echo "you can manually delete the original files that were moved."
