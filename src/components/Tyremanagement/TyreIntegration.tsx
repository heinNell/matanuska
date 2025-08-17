// @ts-nocheck
// src/components/Tyres/TyreIntegration.tsx
import { Button } from "../../components/ui";
import { useTyreAssignment } from "../../hooks/useTyreAssignments";
import { useTyreStock } from "../../hooks/useTyreStock";
import React, { useState } from "react";
import { TyreInspection, useTyreInspections } from "../../hooks/useTyreInspections";
import { useTyres } from "../../hooks/useTyres";
import TyreDashboard from "../../pages/tyres/TyreDashboard";
import TyreInventoryDashboard from "../../pages/tyres/TyreInventoryDashboard";
import TyreManagementView from "../../pages/tyres/TyreManagementView";
import TyreInspectionModal from "../Models/Tyre/TyreInspectionModal"; // existing modal
const TyreIntegration: React.FC = () => {
  const { tyres } = useTyres();
  const { stock } = useTyreStock();
  const { assignments } = useTyreAssignment();
  const [selectedTyreId, setSelectedTyreId] = useState<string | undefined>();
  const [showInspection, setShowInspection] = useState(false);
  const { inspections } = useTyreInspections(selectedTyreId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tyre Integration (Live)</h1>

      <div className="flex gap-2">
        <Button onClick={() => setShowInspection(true)} disabled={!selectedTyreId}>
          Open Inspection Modal
        </Button>
      </div>

      {/* 1) Full dashboard */}
      <TyreDashboard tyres={tyres} stock={stock} assignments={assignments} />

      {/* 2) Voorraad dashboard */}
      <TyreInventoryDashboard
        onAddTyre={() => console.log("Add from integration")}
        onEditTyre={(id: string) => {
          console.log("Edit", id);
          setSelectedTyreId(id);
        }}
        onViewTyreDetail={(id: string) => setSelectedTyreId(id)}
      />

      {/* 3) Management View */}
      <TyreManagementView />

      {/* 4) Inspection modal – real data */}
      {showInspection && selectedTyreId && (
        <TyreInspectionModal
          open={showInspection}
          tyrePosition={"N/A"} // supply from DB if you want
          fleetNumber={"N/A"}
          onClose={() => setShowInspection(false)}
          onSubmit={(data: TyreInspection) => {
            console.log("inspection submit", data);
            // call addInspection here or pass down from props
          }}
        />
      )}

      {/* Optional: show current inspections list */}
      {selectedTyreId && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Inspections for {selectedTyreId}</h2>
          {inspections.map((i: TyreInspection) => (
            <div key={i.id} className="border-b py-2">
              {i.date} – {i.treadDepth}mm – {i.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TyreIntegration;
