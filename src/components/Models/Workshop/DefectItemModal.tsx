import React from "react";
import Modal from "@/components/ui/Modal";
import { DefectItem } from "@/utils/inspectionUtils";

interface DefectItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: string;
  vehicleId: string;
  faultCount: number;
  defectItems: DefectItem[];
}

export function DefectItemModal({
  isOpen,
  onClose,
  inspectionId,
  vehicleId,
  faultCount,
  defectItems,
}: DefectItemModalProps) {
  const repairItems = defectItems.filter((item) => item.type === "repair");
  const replaceItems = defectItems.filter((item) => item.type === "replace");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Defect Items (${faultCount})`} maxWidth="lg">
      <div className="space-y-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm">
            <span className="font-medium">Inspection:</span> {inspectionId}
          </div>
          <div className="text-sm">
            <span className="font-medium">Vehicle:</span> {vehicleId}
          </div>
        </div>

        {repairItems.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Repairs Required:</h3>
            <ul className="space-y-1 pl-5 list-disc">
              {repairItems.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {replaceItems.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Replacements Required:</h3>
            <ul className="space-y-1 pl-5 list-disc">
              {replaceItems.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default DefectItemModal;
