import { AlertTriangle, Upload } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../../ui/Button";
import Modal from "../../ui/Modal";

interface CostEntry {
  id?: string;
  category: string;
  subType: string;
  currency: string;
  amount: number;
  referenceNumber: string;
  date: string;
  notes?: string;
  attachments?: { name: string; url: string }[];
  missingDocReason?: string;
  isFlagged?: boolean;
  manuallyFlagged?: boolean;
}

interface TripCostEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CostEntry, "id" | "attachments">, files?: FileList) => void;
  initialData?: CostEntry;
}

const TripCostEntryModal: React.FC<TripCostEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<CostEntry, "id" | "attachments">>({
    category: initialData?.category || "",
    subType: initialData?.subType || "",
    currency: initialData?.currency || "ZAR (R)",
    amount: initialData?.amount || 0,
    referenceNumber: initialData?.referenceNumber || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    notes: initialData?.notes || "",
    missingDocReason: initialData?.missingDocReason || "",
    isFlagged: initialData?.isFlagged || false,
    manuallyFlagged: initialData?.manuallyFlagged || false,
  });

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Available cost categories
  const costCategories = [
    "Fuel",
    "Maintenance",
    "Tolls",
    "Driver Expenses",
    "Parking",
    "Accommodation",
    "Food",
    "Communications",
    "Repairs",
    "Fines",
    "Insurance",
    "Other",
  ];

  // Sub-types will depend on the selected category
  const getSubTypes = (category: string) => {
    switch (category) {
      case "Fuel":
        return ["Diesel", "Petrol", "AdBlue", "Gas"];
      case "Maintenance":
        return ["Scheduled Service", "Repairs", "Tires", "Oil", "Parts"];
      case "Driver Expenses":
        return ["Per Diem", "Bonus", "Advance", "Reimbursement"];
      default:
        return ["General", "Emergency", "Scheduled", "Unscheduled"];
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "amount") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear any error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
      // Clear missing doc reason if files are provided
      setFormData((prev) => ({
        ...prev,
        missingDocReason: "",
      }));

      if (errors.document) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.document;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.category) {
      newErrors.category = "Cost category is required";
    }

    if (!formData.subType && formData.category) {
      newErrors.subType = "Sub-cost type is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Valid amount is required";
    }

    if (!formData.referenceNumber) {
      newErrors.referenceNumber = "Reference number is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    // Document requirements
    if (!selectedFiles && !formData.missingDocReason) {
      newErrors.document = "Either upload a document or provide a reason for missing documentation";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData, selectedFiles || undefined);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Cost Entry" maxWidth="2xl">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Cost Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Cost Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.category ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            >
              <option value="">Select cost category</option>
              {costCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          {/* Sub-Cost Type */}
          <div>
            <label htmlFor="subType" className="block text-sm font-medium text-gray-700">
              Sub-Cost Type <span className="text-red-500">*</span>
            </label>
            <select
              id="subType"
              name="subType"
              value={formData.subType}
              onChange={handleChange}
              disabled={!formData.category}
              className={`mt-1 block w-full rounded-md border ${
                errors.subType ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            >
              <option value="">Select category first</option>
              {formData.category &&
                getSubTypes(formData.category).map((subType) => (
                  <option key={subType} value={subType}>
                    {subType}
                  </option>
                ))}
            </select>
            {errors.subType && <p className="mt-1 text-sm text-red-600">{errors.subType}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="ZAR (R)">ZAR (R)</option>
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (R) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.amount ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
              placeholder="0.00"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Reference Number */}
          <div>
            <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">
              Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="referenceNumber"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.referenceNumber ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
              placeholder="e.g., INV-123456, RECEIPT-001"
            />
            {errors.referenceNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.referenceNumber}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.date ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Additional notes about this cost entry..."
          />
        </div>

        {/* Document Attachment */}
        <div>
          <div className="flex items-center mb-2">
            <Upload className="h-5 w-5 text-blue-600 mr-2" />
            <label className="block text-sm font-medium text-gray-700">
              Document Attachment (Required)
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Documentation Requirement</h3>
                <p className="text-sm text-blue-700">
                  Every cost entry must include either a receipt/document upload OR a valid
                  explanation for missing documentation. Items without proper documentation will be
                  automatically flagged for investigation.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attach Receipt/Document
            </label>
            <input
              type="file"
              id="documentAttachment"
              name="documentAttachment"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {/* Missing Documentation Reason */}
          <div className="mt-4">
            <label htmlFor="missingDocReason" className="block text-sm font-medium text-gray-700">
              Reason for Missing Documentation{" "}
              {!selectedFiles && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id="missingDocReason"
              name="missingDocReason"
              rows={2}
              value={formData.missingDocReason}
              onChange={handleChange}
              disabled={!!selectedFiles}
              className={`mt-1 block w-full rounded-md border ${
                errors.document ? "border-red-300" : "border-gray-300"
              } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                selectedFiles ? "bg-gray-100" : ""
              }`}
              placeholder="Explain why no receipt/document is available (e.g., 'Receipt lost during trip', 'Digital payment - no physical receipt'...)"
            />
            {!selectedFiles && (
              <p className="mt-1 text-xs text-amber-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                This entry will be automatically flagged for investigation due to missing
                documentation.
              </p>
            )}
          </div>

          {errors.document && <p className="mt-1 text-sm text-red-600">{errors.document}</p>}

          {/* Manual Flag */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="manuallyFlagged"
                checked={formData.manuallyFlagged}
                onChange={(e) => setFormData({ ...formData, manuallyFlagged: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Manually flag this cost entry for investigation
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button onClick={onClose} variant="outline" type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="primary" type="button">
            Save Cost Entry
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TripCostEntryModal;
