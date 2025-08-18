import React, { useState } from "react";
import InspectionReportForm, {
  InspectionReport,
  InspectionItem,
} from "../forms/workshop/InspectionReportForm";

const VehicleInspectionPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock data for initial form values
  const initialData: InspectionReport = {
    id: `insp-${Date.now()}`,
    reportNumber: "INS-" + new Date().getTime().toString().substring(6),
    vehicleId: "TRK-001",
    inspectionDate: new Date().toISOString(),
    inspector: "John Mechanic",
    items: [
      { id: "item-1", name: "Headlights", status: "Pass" },
      { id: "item-2", name: "Brake Lights", status: "Pass" },
      { id: "item-3", name: "Indicators", status: "Pass" },
      { id: "item-4", name: "Wipers", status: "Pass" },
      { id: "item-5", name: "Horn", status: "Pass" },
      { id: "item-6", name: "Tires", status: "Pass" },
      { id: "item-7", name: "Brakes", status: "Pass" },
      { id: "item-8", name: "Suspension", status: "Pass" },
      { id: "item-9", name: "Oil Level", status: "Pass" },
      { id: "item-10", name: "Coolant Level", status: "Pass" },
      { id: "item-11", name: "Washer Fluid", status: "Pass" },
      { id: "item-12", name: "Battery", status: "Pass" },
    ] as InspectionItem[],
    overallCondition: "Pass",
    notes: "",
    attachments: [] as string[],
  };

  const handleSubmit = (data: InspectionReport) => {
    console.log("Inspection report submitted:", data);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      window.location.href = "/workshop/inspections";
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Vehicle Inspection Report</h1>
          {isSubmitted && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-6">
          Complete this form to document the inspection of a vehicle. Check all systems and note any
          issues or maintenance needs.
        </p>
        <InspectionReportForm
          initialData={initialData}
          onSave={handleSubmit}
          onCancel={() => window.history.back()}
          onGeneratePDF={(id) => console.log("Generating PDF for inspection report:", id)}
        />
      </div>
    </div>
  );
};

export default VehicleInspectionPage;
