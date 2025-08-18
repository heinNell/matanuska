import { Button } from "@/components/ui/Button";
import { AlertTriangle, CheckCircle, Package, Save, X } from "lucide-react";
import React from "react";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import { Input, Select, TextArea } from "../../components/ui/FormElements";
import PageWrapper from "../../components/ui/PageWrapper";

interface ReceivedPart {
  id: string;
  partNumber: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  receivedDate: string;
  notes?: string;
}

const ReceivePartsPage: React.FC = () => {
  const [formData, setFormData] = React.useState<ReceivedPart>({
    id: "",
    partNumber: "",
    partName: "",
    quantity: 0,
    unitPrice: 0,
    supplier: "",
    receivedDate: new Date().toISOString().split("T")[0] || "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const suppliers = ["AutoParts Inc", "FilterMaster", "ElectroParts", "LubeExpress", "TireCo"];

  const handleChange = (field: keyof ReceivedPart, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange =
    (field: keyof ReceivedPart) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Basic validation
    if (
      !formData.partNumber ||
      !formData.partName ||
      formData.quantity <= 0 ||
      !formData.supplier
    ) {
      setErrorMessage(
        "Please fill in all required fields (Part Number, Part Name, Quantity, Supplier)."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call to record received parts
      console.log("Receiving parts:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

      setSuccessMessage("Parts received successfully! Inventory updated.");
      setFormData({
        // Reset form
        id: "",
        partNumber: "",
        partName: "",
        quantity: 0,
        unitPrice: 0,
        supplier: "",
        receivedDate: new Date().toISOString().split("T")[0] || "",
        notes: "",
      });
    } catch (error) {
      console.error("Error receiving parts:", error);
      setErrorMessage("Failed to receive parts. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper title="Receive Inventory Parts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receive Inventory Parts</h1>
            <p className="text-gray-600">Record incoming parts and update inventory levels</p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Card>
          <CardHeader title="Part Details" icon={<Package className="w-5 h-5" />} />
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Part Number *"
                value={formData.partNumber}
                onChange={handleInputChange("partNumber")}
                placeholder="e.g., BP-1234"
                required
              />
              <Input
                label="Part Name *"
                value={formData.partName}
                onChange={handleInputChange("partName")}
                placeholder="e.g., Brake Pads"
                required
              />
              <Input
                label="Quantity Received *"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
                min="1"
                required
              />
              <Input
                label="Unit Price (Optional)"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
              <Select
                label="Supplier *"
                value={formData.supplier}
                onChange={(value) => handleChange("supplier", value)}
                options={[
                  { label: "Select Supplier...", value: "" },
                  ...suppliers.map((s) => ({ label: s, value: s })),
                ]}
                required
              />
              <Input
                label="Received Date *"
                type="date"
                value={formData.receivedDate}
                onChange={handleInputChange("receivedDate")}
                required
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Notes (Optional)"
                  value={formData.notes || ""}
                  onChange={(value) => handleChange("notes", value)}
                  placeholder="Any additional notes about this delivery..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      id: "",
                      partNumber: "",
                      partName: "",
                      quantity: 0,
                      unitPrice: 0,
                      supplier: "",
                      receivedDate: new Date().toISOString().split("T")[0] || "",
                      notes: "",
                    });
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  icon={<X className="w-4 h-4" />}
                  disabled={isSubmitting}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  icon={<Save className="w-4 h-4" />}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Receiving..." : "Receive Parts"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-800 mb-4">About Receiving Parts</h2>
          <p className="text-blue-700 mb-4">
            This page allows you to record incoming inventory parts. Once submitted, the system
            would typically:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-blue-700">
            <li>Update the quantity of the received part in your inventory.</li>
            <li>Record the transaction history for auditing purposes.</li>
            <li>Potentially close out pending purchase orders related to these parts.</li>
            <li>Trigger alerts if received quantities differ from ordered quantities.</li>
          </ul>
          <p className="text-blue-700 mt-4">
            In a production environment, this data would be stored in Firestore and integrated with
            your overall inventory management system.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ReceivePartsPage;
