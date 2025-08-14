#!/bin/bash

# Create Domain-Based Component Structure
# This script creates the suggested directory structure for components

COMPONENTS_DIR="src/components"

# Create domain directories and subdirectories
create_domain_structure() {
  echo "Creating domain directory structure..."
  
  # Define domains
  domains=(
    "ComplianceSafetyManagement"
    "CostManagement"
    "CustomerManagement"
    "DieselManagement"
    "DriverManagement"
    "InventoryManagement" 
    "InvoiceManagement"
    "TripManagement"
    "TyreManagement"
    "WorkshopManagement"
    "DashboardManagement"
  )
  
  # Create directories
  for domain in "${domains[@]}"; do
    mkdir -p "$COMPONENTS_DIR/$domain/forms"
    mkdir -p "$COMPONENTS_DIR/$domain/pages"
    
    # Add reports directory for DashboardManagement
    if [ "$domain" == "DashboardManagement" ]; then
      mkdir -p "$COMPONENTS_DIR/$domain/reports"
    fi
    
    echo "Created structure for $domain"
  done
}

# Main execution
echo "Setting up domain-based component structure..."
create_domain_structure
echo "Done! Directory structure has been created."
echo 
echo "Next steps:"
echo "1. Move components into appropriate directories"
echo "2. Update import paths throughout your codebase"
echo "3. See COMPONENT_MIGRATION_GUIDE.md for detailed instructions"
