import React, { useState } from "react";
import DemandPartsForm from "../../components/forms/workshop/DemandPartsForm";
import { useWorkshop } from "../../context/WorkshopContext";
import { addDoc, collection, serverTimestamp, db } from "../../firebase";
import { useSearchParams } from "react-router-dom";

/**
 * Request Parts Page
 * Used for workshop personnel to request parts for repairs
 */
const RequestPartsPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workOrderId = searchParams.get("workOrderId") || undefined;
  const vehicleId = searchParams.get("vehicleId") || undefined;
  const { addPurchaseOrder } = useWorkshop(); // Assuming addPurchaseOrder exists in context

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Use the provided workOrderId and vehicleId
      const partsDemand = {
        ...data,
        workOrderId,
        vehicleId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "partsDemands"), partsDemand);

      console.log("Parts demand submitted successfully!");
      setIsSubmitted(false);
      window.location.href = "/workshop/parts-ordering";
    } catch (error) {
      console.error("Error submitting parts demand:", error);
      setIsSubmitted(false);
    }
  };

  const initialData = {
    id: "",
    action: "",
    parts: [],
    createdDate: new Date().toISOString().split("T")[0],
    createdTime: new Date().toTimeString().split(" ")[0].slice(0, 5),
    demandBy: "",
    workOrderId: workOrderId,
    vehicleId: vehicleId,
    status: "OPEN" as const,
    urgency: "MEDIUM" as const,
    notes: "",
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
        />
      </div>
    </div>
  );
};

export default RequestPartsPage;
