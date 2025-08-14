import React, { useState } from "react";
import DemandPartsForm from "../../components/forms/workshop/DemandPartsForm";

/**
 * Request Parts Page
 * Used for workshop personnel to request parts for repairs
 */
const RequestPartsPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock data for initial form values
  const initialData = {
    id: "",
    action: "Request",
    parts: [],
    createdDate: new Date().toISOString().split("T")[0],
    createdTime: new Date().toTimeString().split(" ")[0].slice(0, 5),
    demandBy: "Workshop Manager",
    workOrderId: "WO-2023-0714",
    vehicleId: "TRK-001",
    status: "OPEN" as const,
    urgency: "MEDIUM" as const,
  };

  const handleSubmit = (data: any) => {
    console.log("Parts request submitted:", data);
    setIsSubmitted(true);

    // In a real app, this would save to Firestore
    setTimeout(() => {
      setIsSubmitted(false);
      window.location.href = "/workshop/parts-ordering"; // Redirect to parts ordering page
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Request Workshop Parts</h1>
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
              Parts request submitted successfully!
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          Use this form to request parts for vehicle maintenance and repairs. Specify the parts
          needed, quantities, and priority level.
        </p>

        <DemandPartsForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => window.history.back()}
          workOrderId="WO-2023-0714"
          vehicleId="TRK-001"
        />
      </div>
    </div>
  );
};

export default RequestPartsPage;
