import { Card, CardContent } from "../../components/ui";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PurchaseOrderModule from "../../components/Models/Workshop/PurchaseOrderModule";
import PurchaseOrderForm, {
  PurchaseOrder,
} from "../../components/WorkshopManagement/PurchaseOrderForm";

/**
 * Purchase Order Page for creating and managing purchase orders
 */
const PurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState<"list" | "create">("list");

  // Sample initial data (in real app, this might come from a PO draft or context)
  const initialData: PurchaseOrder = {
    id: `po-${Date.now()}`,
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    title: "",
    description: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    vendor: "",
    requester: "Fleet Manager",
    priority: "Medium",
    status: "Draft",
    terms: "Net 30",
    poType: "Standard",
    shippingAddress: "Main Workshop, 123 Transport Drive, Johannesburg",
    items: [],
    subTotal: 0,
    tax: 0,
    shipping: 0,
    grandTotal: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "Fleet Manager",
    attachments: [],
  };

  const handleSave = async (data: PurchaseOrder) => {
    console.log("Saving purchase order:", data);

    try {
      // In a real app, this would save to Firestore
      // const db = getFirestore();
      // await addDoc(collection(db, 'purchaseOrders'), data);

      // For demo purposes, we'll just show a success message
      setSubmitted(true);

      // And redirect after a delay
      setTimeout(() => {
        navigate("/workshop");
      }, 2000);
    } catch (error) {
      console.error("Error saving purchase order:", error);
      alert("Failed to save purchase order. Please try again.");
    }
  };

  const handleGeneratePDF = (id: string) => {
    console.log("Generating PDF for purchase order:", id);
    // In a real app, this would generate a PDF and either show it or download it
    alert(
      `Generating PDF for purchase order ${id}. In a production environment, this would create and download a PDF.`
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {mode === "list" ? (
        <PurchaseOrderModule onCreatePO={() => setMode("create")} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMode("list")}
              >
                Back to Purchase Orders
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Create Purchase Order</h1>
            </div>

            {submitted && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md flex items-center">
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
                Purchase order saved successfully!
              </div>
            )}
          </div>

          <Card>
            <CardContent>
              <p className="mb-6 text-gray-600">
                Create a purchase order for parts, services, or equipment. Fill out the form below
                with all relevant details.
              </p>

              <PurchaseOrderForm
                initialData={initialData}
                onSave={(data) => {
                  handleSave(data);
                  setMode("list");
                }}
                onCancel={() => setMode("list")}
                onGeneratePDF={handleGeneratePDF}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PurchaseOrderPage;
