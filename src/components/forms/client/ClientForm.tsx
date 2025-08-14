import { Button } from "@/components/ui/Button";
import { Building, Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { Client, CLIENT_INDUSTRIES, CLIENT_STATUSES, CLIENT_TYPES } from "../../../types/client";
import { Input, Select, TextArea } from "../../ui/FormElements";
import Modal from "../../ui/Modal";

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: Partial<Client>;
  isEditing?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  isOpen,
  onClose,
  initialValues,
  isEditing = false,
}) => {
  const { addClient, updateClient } = useAppContext();

  const [client, setClient] = useState<any>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameAsBusiness, setSameAsBusiness] = useState(!initialValues.billingAddress);

  useEffect(() => {
    // Initialize the form when it opens
    setClient(initialValues);
    setSameAsBusiness(!initialValues.billingAddress);
    setErrors({});
  }, [initialValues, isOpen]);

  // Handle text input change
  const handleChange = (field: string, value: any) => {
    // Handle nested address fields
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setClient({
        ...client,
        [parent]: {
          ...client[parent],
          [child]: value,
        },
      });
    } else {
      setClient({ ...client, [field]: value });
    }

    // Clear any error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle tag changes
  const handleTagChange = (tagString: string) => {
    // Split the string by commas and filter out empty tags
    const tagArray = tagString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    setClient({ ...client, tags: tagArray });
  };

  // Handle same as business address checkbox
  const handleSameAddressChange = (checked: boolean) => {
    setSameAsBusiness(checked);

    if (checked) {
      // Copy business address to billing address
      setClient({
        ...client,
        billingAddress: { ...client.address },
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!client.name) newErrors.name = "Client name is required";
    if (!client.type) newErrors.type = "Client type is required";
    if (!client.contactPerson) newErrors.contactPerson = "Contact person is required";
    if (!client.email) newErrors.email = "Email is required";
    if (!client.phone) newErrors.phone = "Phone is required";

    // Address validation
    if (!client.address?.street) newErrors["address.street"] = "Street is required";
    if (!client.address?.city) newErrors["address.city"] = "City is required";
    if (!client.address?.country) newErrors["address.country"] = "Country is required";

    // Email format validation
    if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone format validation - simple check for now
    if (client.phone && client.phone.length < 7) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Prepare client data for saving
      const clientData: Client = {
        ...client,
        updatedAt: new Date().toISOString(),
      };

      // If not editing (creating new), set createdAt
      if (!isEditing) {
        clientData.createdAt = new Date().toISOString();
      }

      // If same as business address is checked, copy the address
      if (sameAsBusiness) {
        clientData.billingAddress = { ...client.address };
      }

      // Handle empty arrays or objects that should be undefined
      if (clientData.tags && clientData.tags.length === 0) {
        delete clientData.tags;
      }

      if (
        !clientData.billingAddress ||
        (!clientData.billingAddress.street &&
          !clientData.billingAddress.city &&
          !clientData.billingAddress.country)
      ) {
        delete clientData.billingAddress;
      }

      // Save the client
      if (isEditing) {
        await updateClient(clientData as Client);
      } else {
        await addClient(clientData as any);
      }

      // Close the modal on success
      onClose();
    } catch (error) {
      console.error("Error saving client:", error);
      setErrors({
        submit: `Failed to ${isEditing ? "update" : "create"} client. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Client: ${initialValues.name}` : "Add New Client"}
      maxWidth="xl"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <Building className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                {isEditing ? "Update Client Information" : "Add a New Client to Your System"}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {isEditing
                  ? "Update the client details below to keep your client information up-to-date."
                  : "Fill in the details below to add a new client to your system."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Input
                label="Client Name *"
                value={client.name || ""}
                onChange={(value) => handleChange("name", value)}
                placeholder="Enter client name"
                error={errors.name}
              />

              <Select
                label="Client Type *"
                value={client.type || ""}
                onChange={(value) => handleChange("type", value)}
                options={[
                  { label: "Select client type...", value: "" },
                  ...CLIENT_TYPES.map((type) => ({ label: type.label, value: type.value })),
                ]}
                error={errors.type}
              />

              <Select
                label="Status *"
                value={client.status || ""}
                onChange={(value) => handleChange("status", value)}
                options={[
                  { label: "Select status...", value: "" },
                  ...CLIENT_STATUSES.map((status) => ({
                    label: status.label,
                    value: status.value,
                  })),
                ]}
                error={errors.status}
              />

              <Select
                label="Industry"
                value={client.industry || ""}
                onChange={(value) => handleChange("industry", value)}
                options={[
                  { label: "Select industry...", value: "" },
                  ...CLIENT_INDUSTRIES.map((industry) => ({ label: industry, value: industry })),
                ]}
              />

              <Input
                label="Tags (comma separated)"
                value={client.tags ? client.tags.join(", ") : ""}
                onChange={(e) => handleTagChange(e.target.value)}
                placeholder="e.g., VIP, Long-term, Contract"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <Input
                label="Contact Person *"
                value={client.contactPerson || ""}
                onChange={(value) => handleChange("contactPerson", value)}
                placeholder="Full name of primary contact"
                error={errors.contactPerson}
              />

              <Input
                label="Email Address *"
                value={client.email || ""}
                onChange={(value) => handleChange("email", value)}
                placeholder="Email address"
                error={errors.email}
                type="email"
              />

              <Input
                label="Phone Number *"
                value={client.phone || ""}
                onChange={(value) => handleChange("phone", value)}
                placeholder="Phone number"
                error={errors.phone}
              />

              <Input
                label="Website"
                value={client.website || ""}
                onChange={(value) => handleChange("website", value)}
                placeholder="Website URL (e.g., https://example.com)"
              />
            </div>
          </div>
        </div>

        {/* Business Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Business Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Street Address *"
              value={client.address?.street || ""}
              onChange={(value) => handleChange("address.street", value)}
              placeholder="Street address"
              error={errors["address.street"]}
            />

            <Input
              label="City *"
              value={client.address?.city || ""}
              onChange={(value) => handleChange("address.city", value)}
              placeholder="City"
              error={errors["address.city"]}
            />

            <Input
              label="State/Province"
              value={client.address?.state || ""}
              onChange={(value) => handleChange("address.state", value)}
              placeholder="State or province"
            />

            <Input
              label="Postal Code"
              value={client.address?.postalCode || ""}
              onChange={(value) => handleChange("address.postalCode", value)}
              placeholder="Postal code"
            />

            <Input
              label="Country *"
              value={client.address?.country || ""}
              onChange={(value) => handleChange("address.country", value)}
              placeholder="Country"
              error={errors["address.country"]}
            />
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sameAsBusiness"
                checked={sameAsBusiness}
                onChange={(e) => handleSameAddressChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="sameAsBusiness" className="ml-2 text-sm text-gray-700">
                Same as business address
              </label>
            </div>
          </div>

          {!sameAsBusiness && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Street Address"
                value={client.billingAddress?.street || ""}
                onChange={(value) => handleChange("billingAddress.street", value)}
                placeholder="Billing street address"
                disabled={sameAsBusiness}
              />

              <Input
                label="City"
                value={client.billingAddress?.city || ""}
                onChange={(value) => handleChange("billingAddress.city", value)}
                placeholder="Billing city"
                disabled={sameAsBusiness}
              />

              <Input
                label="State/Province"
                value={client.billingAddress?.state || ""}
                onChange={(value) => handleChange("billingAddress.state", value)}
                placeholder="Billing state or province"
                disabled={sameAsBusiness}
              />

              <Input
                label="Postal Code"
                value={client.billingAddress?.postalCode || ""}
                onChange={(value) => handleChange("billingAddress.postalCode", value)}
                placeholder="Billing postal code"
                disabled={sameAsBusiness}
              />

              <Input
                label="Country"
                value={client.billingAddress?.country || ""}
                onChange={(value) => handleChange("billingAddress.country", value)}
                placeholder="Billing country"
                disabled={sameAsBusiness}
              />
            </div>
          )}
        </div>

        {/* Financial Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Currency *"
              value={client.currency || "ZAR"}
              onChange={(value) => handleChange("currency", value)}
              options={[
                { label: "South African Rand (ZAR)", value: "ZAR" },
                { label: "US Dollar (USD)", value: "USD" },
              ]}
            />

            <Input
              label="VAT Number"
              value={client.vatNumber || ""}
              onChange={(value) => handleChange("vatNumber", value)}
              placeholder="VAT or tax identification number"
            />

            <Input
              label="Registration Number"
              value={client.registrationNumber || ""}
              onChange={(value) => handleChange("registrationNumber", value)}
              placeholder="Business registration number"
            />

            <Input
              label="Payment Terms (Days)"
              type="number"
              min="0"
              value={client.paymentTerms?.toString() || ""}
              onChange={(e) => handleChange("paymentTerms", parseInt(e.target.value) || undefined)}
              placeholder="e.g., 30, 45, 60"
            />

            <Input
              label="Credit Limit"
              type="number"
              min="0"
              step="0.01"
              value={client.creditLimit?.toString() || ""}
              onChange={(e) => handleChange("creditLimit", parseFloat(e.target.value) || undefined)}
              placeholder="Maximum credit amount"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
          <TextArea
            label="Additional Notes"
            value={client.notes || ""}
            onChange={(value) => handleChange("notes", value)}
            placeholder="Enter any additional notes or information about this client..."
            rows={4}
          />
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            icon={<X className="w-4 h-4" />}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            icon={<Save className="w-4 h-4" />}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? "Update Client" : "Create Client"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ClientForm;
