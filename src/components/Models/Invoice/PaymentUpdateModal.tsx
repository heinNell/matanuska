// ─── React ───────────────────────────────────────────────────────
import React, { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────
import { FollowUpRecord, Trip } from "../../../types";

// ─── UI Components ───────────────────────────────────────────────
import { Button } from "../../../components/ui/Button";
import { Input, Select, Textarea } from "../../ui/FormElements";
import Modal from "../../ui/Modal";

// ─── Icons ───────────────────────────────────────────────────────
import { AlertTriangle, CheckCircle, Save, X } from "lucide-react";

// ─── Utils ───────────────────────────────────────────────────────
import { formatCurrency, formatDate } from "../../../utils/helpers";

type PaymentStatus = "unpaid" | "partial" | "paid";

interface PaymentUpdateModalProps {
  isOpen: boolean;
  trip: Trip;
  onClose: () => void;
  onUpdatePayment: (
    tripId: string,
    paymentData: {
      paymentStatus: PaymentStatus;
      paymentAmount?: number;
      paymentReceivedDate?: string;
      paymentNotes?: string;
      paymentMethod?: string;
      bankReference?: string;
    }
  ) => void;
}

const PaymentUpdateModal: React.FC<PaymentUpdateModalProps> = ({
  isOpen,
  trip,
  onClose,
  onUpdatePayment,
}) => {
  const [formData, setFormData] = useState<{
    paymentStatus: PaymentStatus;
    paymentAmount: string;
    paymentReceivedDate: string;
    paymentNotes: string;
    paymentMethod: string;
    bankReference: string;
  }>({
    paymentStatus: (trip.paymentStatus as PaymentStatus) || "unpaid",
    paymentAmount: trip.paymentAmount?.toString() || "",
    paymentReceivedDate: trip.paymentReceivedDate || new Date().toISOString().split("T")[0],
    paymentNotes: "",
    paymentMethod: "bank_transfer",
    bankReference: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.paymentStatus !== "unpaid") {
      if (!formData.paymentAmount || Number(formData.paymentAmount) <= 0) {
        newErrors.paymentAmount = "Payment amount is required and must be greater than 0";
      }

      if (Number(formData.paymentAmount) > trip.baseRevenue) {
        newErrors.paymentAmount = "Payment amount cannot exceed invoice amount";
      }

      if (!formData.paymentReceivedDate) {
        newErrors.paymentReceivedDate = "Payment received date is required";
      }

      if (!formData.paymentMethod) {
        newErrors.paymentMethod = "Payment method is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const paymentData = {
      paymentStatus: formData.paymentStatus,
      paymentAmount:
        formData.paymentStatus !== "unpaid" ? Number(formData.paymentAmount) : undefined,
      paymentReceivedDate:
        formData.paymentStatus !== "unpaid" ? formData.paymentReceivedDate : undefined,
      paymentNotes: formData.paymentNotes.trim() || undefined,
      paymentMethod: formData.paymentStatus !== "unpaid" ? formData.paymentMethod : undefined,
      bankReference: formData.bankReference.trim() || undefined,
    };

    onUpdatePayment(trip.id, paymentData);
    onClose();
  };

  const calculateOutstandingAmount = () => {
    const invoiceAmount = trip.baseRevenue;
    const paidAmount = Number(formData.paymentAmount) || 0;
    return invoiceAmount - paidAmount;
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50 border-green-200";
      case "partial":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const agingDays = trip.invoiceDueDate
    ? Math.floor(
        (new Date().getTime() - new Date(trip.invoiceDueDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Payment Status" maxWidth="lg">
      <div className="space-y-6">
        {/* Invoice Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Invoice Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <p>
                <strong>Invoice #:</strong> {trip.invoiceNumber}
              </p>
              <p>
                <strong>Customer:</strong> {trip.clientName}
              </p>
              <p>
                <strong>Invoice Amount:</strong>{" "}
                {formatCurrency(trip.baseRevenue, trip.revenueCurrency)}
              </p>
            </div>
            <div>
              <p>
                <strong>Invoice Date:</strong> {formatDate(trip.invoiceDate!)}
              </p>
              <p>
                <strong>Due Date:</strong> {formatDate(trip.invoiceDueDate!)}
              </p>
              <p>
                <strong>Aging:</strong>
                <span
                  className={`ml-1 font-bold ${agingDays > 30 ? "text-red-600" : agingDays > 0 ? "text-orange-600" : "text-green-600"}`}
                >
                  {agingDays} days
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Current Payment Status */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Current Payment Status</h4>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(trip.paymentStatus as PaymentStatus)}`}
            >
              {(trip.paymentStatus as string).toUpperCase()}
            </span>
            {trip.paymentAmount && (
              <span className="text-sm text-gray-600">
                Paid: {formatCurrency(trip.paymentAmount, trip.revenueCurrency)}
              </span>
            )}
            {trip.paymentReceivedDate && (
              <span className="text-sm text-gray-600">
                on {formatDate(trip.paymentReceivedDate)}
              </span>
            )}
          </div>
        </div>

        {/* Payment Update Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Update Payment Information</h3>

          <Select
            label="Payment Status *"
            value={formData.paymentStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleChange("paymentStatus", e.target.value)
            }
            options={[
              { label: "Unpaid", value: "unpaid" },
              { label: "Partial Payment", value: "partial" },
              { label: "Paid in Full", value: "paid" },
            ]}
          />

          {formData.paymentStatus !== "unpaid" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={`Payment Amount (${trip.revenueCurrency}) *`}
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.paymentAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("paymentAmount", e.target.value)
                  }
                  placeholder="0.00"
                  error={errors.paymentAmount}
                />
                <Input
                  label="Payment Received Date *"
                  type="date"
                  value={formData.paymentReceivedDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("paymentReceivedDate", e.target.value)
                  }
                  error={errors.paymentReceivedDate}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Payment Method *"
                  value={formData.paymentMethod}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleChange("paymentMethod", e.target.value)
                  }
                  options={[
                    { label: "Bank Transfer", value: "bank_transfer" },
                    { label: "Cash", value: "cash" },
                    { label: "Cheque", value: "cheque" },
                    { label: "Credit Card", value: "credit_card" },
                    { label: "Other", value: "other" },
                  ]}
                  error={errors.paymentMethod}
                />
                <Input
                  label="Bank Reference / Transaction ID"
                  value={formData.bankReference}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("bankReference", e.target.value)
                  }
                  placeholder="e.g., TXN123456789"
                />
              </div>

              {/* Payment Summary */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Payment Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-green-600">Invoice Amount</p>
                    <p className="font-bold text-green-800">
                      {formatCurrency(trip.baseRevenue, trip.revenueCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-600">Payment Amount</p>
                    <p className="font-bold text-green-800">
                      {formatCurrency(Number(formData.paymentAmount) || 0, trip.revenueCurrency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-600">Outstanding</p>
                    <p
                      className={`font-bold ${calculateOutstandingAmount() === 0 ? "text-green-800" : "text-orange-800"}`}
                    >
                      {formatCurrency(calculateOutstandingAmount(), trip.revenueCurrency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              {Number(formData.paymentAmount) === trip.baseRevenue && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Payment in Full - Invoice will be marked as PAID
                    </span>
                  </div>
                </div>
              )}

              {Number(formData.paymentAmount) > 0 &&
                Number(formData.paymentAmount) < trip.baseRevenue && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Partial Payment - Outstanding amount:{" "}
                        {formatCurrency(calculateOutstandingAmount(), trip.revenueCurrency)}
                      </span>
                    </div>
                  </div>
                )}
            </>
          )}

          <Textarea
            label="Payment Notes"
            value={formData.paymentNotes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("paymentNotes", e.target.value)
            }
            placeholder="Add any notes about this payment (e.g., late payment reason, payment terms, etc.)..."
            rows={3}
          />
        </div>

        {/* Follow-up History Preview */}
        {trip.followUpHistory && trip.followUpHistory.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Recent Follow-ups ({trip.followUpHistory.length})
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {trip.followUpHistory.slice(-3).map((followUp: FollowUpRecord, index: number) => (
                <div key={index} className="text-xs bg-white p-2 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p>
                        <strong>{formatDate(followUp.followUpDate)}</strong> -{" "}
                        {followUp.contactMethod.toUpperCase()}
                      </p>
                      <p className="text-gray-600">{followUp.responseSummary}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        followUp.outcome === "payment_received"
                          ? "bg-green-100 text-green-800"
                          : followUp.outcome === "promised_payment"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {followUp.outcome.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} icon={<X className="w-4 h-4" />}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} icon={<Save className="w-4 h-4" />}>
            Update Payment Status
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentUpdateModal;
