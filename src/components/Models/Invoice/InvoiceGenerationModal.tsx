import { Button } from "@/components/ui/Button";
import { FileText, Send, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatCurrency } from "../../../utils/helpers";
import Modal from "../../ui/Modal";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemType: "part" | "labor" | "service" | "other";
}

interface InvoiceGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobCardId: string;
  fleetNumber: string;
  customerName: string;
  parts: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  tasks: {
    title: string;
    estimatedHours: number;
    actualHours?: number;
  }[];
  laborRate: number;
  onGenerateInvoice: (invoiceData: {
    jobCardId: string;
    customerName: string;
    items: InvoiceItem[];
    laborCost: number;
    partsCost: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    notes?: string;
  }) => Promise<void>;
}

const InvoiceGenerationModal: React.FC<InvoiceGenerationModalProps> = ({
  isOpen,
  onClose,
  jobCardId,
  fleetNumber,
  customerName,
  parts,
  tasks,
  laborRate,
  onGenerateInvoice,
}) => {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [taxRate, setTaxRate] = useState(15); // Default tax rate (%)
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate totals
  const calculateTotals = () => {
    const partsCost = invoiceItems
      .filter((item) => item.itemType === "part")
      .reduce((sum, item) => sum + item.total, 0);

    const laborCost = invoiceItems
      .filter((item) => item.itemType === "labor")
      .reduce((sum, item) => sum + item.total, 0);

    const otherCost = invoiceItems
      .filter((item) => item.itemType !== "part" && item.itemType !== "labor")
      .reduce((sum, item) => sum + item.total, 0);

    const subtotal = partsCost + laborCost + otherCost;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return {
      partsCost,
      laborCost,
      otherCost,
      subtotal,
      taxAmount,
      total,
    };
  };

  const totals = calculateTotals();

  // Initialize invoice items when modal opens
  useEffect(() => {
    if (isOpen) {
      const newItems: InvoiceItem[] = [];

      // Add parts as invoice items
      parts.forEach((part, index) => {
        newItems.push({
          id: `part-${index}`,
          description: part.name,
          quantity: part.quantity,
          unitPrice: part.unitPrice,
          total: part.quantity * part.unitPrice,
          itemType: "part",
        });
      });

      // Add labor as invoice items
      tasks.forEach((task, index) => {
        const hours = task.actualHours || task.estimatedHours;
        newItems.push({
          id: `labor-${index}`,
          description: `Labor: ${task.title}`,
          quantity: hours,
          unitPrice: laborRate,
          total: hours * laborRate,
          itemType: "labor",
        });
      });

      setInvoiceItems(newItems);
    }
  }, [isOpen, parts, tasks, laborRate]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const { partsCost, laborCost, taxAmount, total } = totals;

      await onGenerateInvoice({
        jobCardId,
        customerName,
        items: invoiceItems,
        laborCost,
        partsCost,
        taxRate,
        taxAmount,
        totalAmount: total,
        notes: notes.trim() || undefined,
      });

      onClose();
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update tax rate
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setTaxRate(value);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Invoice" maxWidth="lg">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Generate Invoice for Job Card</h4>
              <p className="text-sm text-blue-700 mt-1">
                Review the invoice details below. The system has automatically added parts used and
                labor time based on the job card.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vehicle</p>
              <p className="font-medium">{fleetNumber}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceItems.map((item) => (
                  <tr key={item.id} className={item.itemType === "labor" ? "bg-blue-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                      <span className="text-xs text-gray-500 ml-2">
                        ({item.itemType === "labor" ? "Labor" : "Part"})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {item.quantity} {item.itemType === "labor" ? "hours" : "units"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.unitPrice, "USD")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.total, "USD")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900"
                    colSpan={3}
                  >
                    Subtotal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(totals.subtotal, "USD")}
                  </td>
                </tr>
                <tr>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900"
                    colSpan={2}
                  >
                    Tax Rate
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={taxRate}
                      onChange={handleTaxRateChange}
                      min="0"
                      step="0.1"
                      className="border rounded w-20 px-2 py-1 text-right"
                    />
                    <span className="ml-1">%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(totals.taxAmount, "USD")}
                  </td>
                </tr>
                <tr className="bg-blue-50">
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900"
                    colSpan={3}
                  >
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-gray-900">
                    {formatCurrency(totals.total, "USD")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invoice Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Add any notes to be displayed on the invoice..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            icon={<X className="w-4 h-4" />}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} icon={<Send className="w-4 h-4" />} isLoading={isLoading}>
            Generate Invoice
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceGenerationModal;
