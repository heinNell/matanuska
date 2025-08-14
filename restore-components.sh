#!/bin/bash

# Root van jou projek
DEST_ROOT="src/components"

# Bron waarheen jy per ongeluk geskuif het
SRC_DIR="$HOME/Music"

# Lys van oorspronklike paaie (relatief tot projek root)
paths=(
"admin/WialonConfigDisplay.tsx"
"maps/RouteDrawer.tsx"
"maps/WialonMapDashboard.tsx"
"maps/WialonMapComponent.tsx"
"maps/MapsView.tsx"
"maps/EnhancedMapComponent.tsx"
"maps/LocationDetailPanel.tsx"
"maps/GoogleMapsTest.tsx"
"Inventory Management/StockManager.tsx"
"Inventory Management/PartsReceivingForm.tsx"
"Inventory Management/VendorScorecard.tsx"
"DieselManagement/FuelTheftDetection.tsx"
"DieselManagement/DieselDashboard.tsx"
"DieselManagement/DieselEditModal.tsx"
"DieselManagement/DieselImportModal.tsx"
"DieselManagement/DieselDebriefModal.tsx"
"DieselManagement/DieselTabbedDashboard.tsx"
"DieselManagement/DriverFuelBehavior.tsx"
"TyreManagement/TyreInventoryFilters.tsx"
"TyreManagement/TyreInventoryStats.tsx"
"TyreManagement/TyrePerformanceReport.tsx"
"Workshop Management/InspectionForm.tsx"
"Workshop Management/JobCard.tsx"
"Workshop Management/TaskManager.tsx"
"TripManagement/TripForm.tsx"
"TripManagement/TripManagement.tsx"
"DriverManagement/DriverBehaviorEvents.tsx"
"DriverManagement/DriverBehaviorEventForm.tsx"
"UIConnector.tsx"
"WialonLoginModal.tsx"
"MapPanel.tsx"
)

echo "⏳ Begin herstelproses..."

for relpath in "${paths[@]}"; do
  filename=$(basename "$relpath")
  dest_folder="$DEST_ROOT/$(dirname "$relpath")"
  src_path="$SRC_DIR/$filename"
  dest_path="$DEST_ROOT/$relpath"

  if [ -f "$src_path" ]; then
    echo "✅ Skuif: $filename → $dest_path"
    mkdir -p "$dest_folder"
    mv "$src_path" "$dest_path"
  else
    echo "⚠️  Oorgeslaan: $filename nie gevind in $SRC_DIR nie."
  fi
done

echo "🎯 Klaar. Kyk onder $DEST_ROOT vir teruggeskuifde lêers."
