import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import React, { useState } from "react";

interface PaymentTrackingPanelProps {
  invoice: any;
  paymentStatus: "unpaid" | "paid";
  onUpdateStatus: (status: "unpaid" | "paid") => void;
}

const PaymentTrackingPanel: React.FC<PaymentTrackingPanelProps> = ({
  invoice,
  paymentStatus,
  onUpdateStatus,
}) => {
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const daysSinceInvoice = invoice
    ? Math.floor(
        (new Date().getTime() - new Date(invoice.invoiceDate).getTime()) / (1000 * 3600 * 24)
      )
    : 0;

  const daysTillDue = invoice
    ? Math.floor((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : 0;

  const isOverdue = daysTillDue < 0;

  const handleMarkAsPaid = () => {
    if (!paymentDate || !paymentMethod) {
      alert("Please provide payment date and method");
      return;
    }
    onUpdateStatus("paid");
  };

  const handleSendReminder = () => {
    // In a real app, this would send an email/SMS reminder
    alert("Payment reminder sent to client");
  };

  const handleEscalate = () => {
    // In a real app, this would escalate to collections
    alert("Payment escalated to collections department");
  };

  if (!invoice) {
    return (
      <Card className="p-6">
        <p>No invoice data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Payment Tracking</h3>

        {/* Payment Status Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600">Invoice Status</div>
            <div className="text-lg font-semibold">
              {paymentStatus === "paid" ? "✓ Paid" : "Pending"}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-yellow-600">Days Since Invoice</div>
            <div className="text-lg font-semibold">{daysSinceInvoice}</div>
          </div>

          <div className={`p-4 rounded-lg ${isOverdue ? "bg-red-50" : "bg-green-50"}`}>
            <div className={`text-sm ${isOverdue ? "text-red-600" : "text-green-600"}`}>
              {isOverdue ? "Days Overdue" : "Days Till Due"}
            </div>
            <div className="text-lg font-semibold">{Math.abs(daysTillDue)}</div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-6 p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Invoice Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Invoice Number: {invoice.invoiceNumber}</div>
            <div>Invoice Date: {invoice.invoiceDate}</div>
            <div>Due Date: {invoice.dueDate}</div>
            <div>Status: {paymentStatus}</div>
          </div>
        </div>

        {paymentStatus === "unpaid" ? (
          <div className="space-y-4">
            {/* Mark as Paid Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Record Payment</h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select method</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="eft">EFT</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="credit-card">Credit Card</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Payment Reference</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction ID, check number, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button onClick={handleMarkAsPaid}>Mark as Paid</Button>
            </div>

            {/* Follow-up Actions */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Follow-up Actions</h4>
              <div className="space-y-3">
                <div>
                  <textarea
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="Add follow-up notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleSendReminder}>
                    Send Reminder
                  </Button>

                  {isOverdue && (
                    <Button variant="outline" onClick={handleEscalate}>
                      Escalate to Collections
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✓ Payment Received</h4>
            <div className="text-sm text-green-700">
              {paymentDate && <div>Date: {paymentDate}</div>}
              {paymentMethod && <div>Method: {paymentMethod}</div>}
              {paymentReference && <div>Reference: {paymentReference}</div>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentTrackingPanel;
