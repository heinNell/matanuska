import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import React, { useState } from "react";

interface TripInvoicingPanelProps {
  onSubmit: (invoice: any) => void;
  onCancel: () => void;
}

const TripInvoicingPanel: React.FC<TripInvoicingPanelProps> = ({ onSubmit, onCancel }) => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [clientReference, setClientReference] = useState("");
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState("");

  // Auto-generate invoice number if empty
  React.useEffect(() => {
    if (!invoiceNumber) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      setInvoiceNumber(`INV-${year}${month}-${random}`);
    }
  }, []);

  // Auto-set due date to 30 days from invoice date
  React.useEffect(() => {
    if (invoiceDate) {
      const invoice = new Date(invoiceDate);
      const due = new Date(invoice);
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split("T")[0]);
    }
  }, [invoiceDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceNumber || !invoiceDate || !dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    const invoice = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      clientReference,
      additionalCharges,
      discount,
      notes,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    onSubmit(invoice);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Generate Invoice</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Number *</label>
              <Input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2025XX-XXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Client Reference</label>
              <Input
                type="text"
                value={clientReference}
                onChange={(e) => setClientReference(e.target.value)}
                placeholder="Client PO number or reference"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Invoice Date *</label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date *</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Additional Charges (R)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Extra charges not included in trip costs</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount (R)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Discount amount to apply</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Invoice Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, special instructions, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Invoice Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Invoice Preview</h4>
            <div className="text-sm space-y-1">
              <div>Invoice: {invoiceNumber}</div>
              <div>Date: {invoiceDate}</div>
              <div>Due: {dueDate}</div>
              {clientReference && <div>Reference: {clientReference}</div>}
              {additionalCharges > 0 && (
                <div>Additional Charges: R{additionalCharges.toFixed(2)}</div>
              )}
              {discount > 0 && (
                <div className="text-green-600">Discount: -R{discount.toFixed(2)}</div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Back
            </Button>
            <div className="space-x-2">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button type="submit">Generate & Submit Invoice</Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TripInvoicingPanel;
