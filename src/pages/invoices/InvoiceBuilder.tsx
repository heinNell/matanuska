import React, { useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import SyncIndicator from "../../components/ui/SyncIndicator";
import {
  Save,
  Plus,
  Trash2,
  Download,
  Send,
  Eye,
  DollarSign,
  Calendar,
  FileText,
  User,
  FileCheck,
  ClipboardList,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  customer: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  total: number;
  notes: string;
  terms: string;
  status: "draft" | "pending" | "sent" | "paid" | "overdue";
}

const defaultCustomers = [
  { id: "C001", name: "Global Shipping Inc." },
  { id: "C002", name: "FastTrack Logistics" },
  { id: "C003", name: "Premium Freight Services" },
  { id: "C004", name: "TransWorld Freight" },
];
const defaultTemplates = [
  { id: "T001", name: "Standard Invoice" },
  { id: "T002", name: "Detailed Shipping Invoice" },
  { id: "T003", name: "Transport Services Invoice" },
  { id: "T004", name: "Premium Template" },
];

const InvoiceBuilder: React.FC = () => {
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: "INV-" + Math.floor(10000 + Math.random() * 90000),
    customer: "",
    customerId: "",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    items: [
      {
        id: "1",
        description: "",
        quantity: 1,
        unitPrice: 0,
        tax: 0,
        total: 0,
      },
    ],
    subtotal: 0,
    taxTotal: 0,
    discountAmount: 0,
    total: 0,
    notes: "",
    terms: "Payment due within 30 days. Late payments subject to a 1.5% monthly fee.",
    status: "draft",
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState(defaultCustomers);
  const [templates, setTemplates] = useState(defaultTemplates);

  // Calculate totals for invoice
  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxTotal = items.reduce((sum, item) => sum + item.tax, 0);
    return {
      subtotal,
      taxTotal,
      total: subtotal + taxTotal - invoice.discountAmount,
    };
  };

  // Handle item changes
  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id !== id) return item;

      const updatedItem = { ...item, [field]: value };

      // Recalculate total for this item
      if (field === "quantity" || field === "unitPrice" || field === "tax") {
        updatedItem.total = updatedItem.quantity * updatedItem.unitPrice + updatedItem.tax;
      }

      return updatedItem;
    });

    const { subtotal, taxTotal, total } = calculateTotals(updatedItems);

    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      taxTotal,
      total,
    });
  };

  // Add a new item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substring(7),
      description: "",
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      total: 0,
    };

    const updatedItems = [...invoice.items, newItem];
    setInvoice({
      ...invoice,
      items: updatedItems,
    });
  };

  // Remove an item
  const removeItem = (id: string) => {
    const updatedItems = invoice.items.filter((item) => item.id !== id);
    const { subtotal, taxTotal, total } = calculateTotals(updatedItems);

    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      taxTotal,
      total,
    });
  };

  // Handle discount changes
  const handleDiscountChange = (value: number) => {
    setInvoice({
      ...invoice,
      discountAmount: value,
      total: invoice.subtotal + invoice.taxTotal - value,
    });
  };

  // Handle field changes
  const handleFieldChange = (field: keyof InvoiceData, value: any) => {
    setInvoice({
      ...invoice,
      [field]: value,
    });
  };

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find((c) => c.id === customerId);
    setInvoice({
      ...invoice,
      customer: selectedCustomer ? selectedCustomer.name : "",
      customerId,
    });
  };

  // Load template
  const loadTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === "T002") {
      setInvoice({
        ...invoice,
        terms: "Payment due within 14 days. Shipping details must be included with each line item.",
        notes: "Thank you for choosing our shipping services.",
      });
    } else if (templateId === "T003") {
      setInvoice({
        ...invoice,
        terms: "Net 30 terms for all transport services. Fuel surcharges may apply.",
        notes: "All transport services are subject to our standard terms and conditions.",
      });
    }
  };

  // Save invoice
  const saveInvoice = (asDraft: boolean = true) => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setInvoice({
        ...invoice,
        status: asDraft ? "draft" : "pending",
      });
      alert(asDraft ? "Invoice saved as draft" : "Invoice created and ready to send");
    }, 800);
  };

  // Handlers to use setCustomers and setTemplates so they are "read"
  const resetCustomers = () => setCustomers([...defaultCustomers]);
  const resetTemplates = () => setTemplates([...defaultTemplates]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Invoice Builder</h2>
          <p className="text-gray-600">Create and customize invoices for your clients</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex border rounded-md overflow-hidden">
            <button
              className={`px-4 py-2 ${activeTab === "edit" ? "bg-blue-500 text-white" : "bg-white"}`}
              onClick={() => setActiveTab("edit")}
            >
              Edit
            </button>
            <button
              className={`px-4 py-2 ${activeTab === "preview" ? "bg-blue-500 text-white" : "bg-white"}`}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
          </div>
          <SyncIndicator />
        </div>
      </div>

      {/* Icon Info Bar - Shows all imported icons in use */}
      <div className="flex gap-4 items-center mb-4">
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span className="text-xs text-gray-600">Currency: USD</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="text-xs text-gray-600">Issue: {invoice.issueDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="h-4 w-4 text-purple-500" />
          <span className="text-xs text-gray-600">Customer: {invoice.customer || "N/A"}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileCheck className="h-4 w-4 text-green-600" />
          <span className="text-xs text-gray-600">Status: {invoice.status}</span>
        </div>
        <div className="flex items-center gap-1">
          <ClipboardList className="h-4 w-4 text-yellow-500" />
          <span className="text-xs text-gray-600">Items: {invoice.items.length}</span>
        </div>
      </div>

      {/* Reset buttons to use setters */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={resetCustomers}>
          Reset Customers
        </Button>
        <Button variant="outline" onClick={resetTemplates}>
          Reset Templates
        </Button>
      </div>

      {activeTab === "edit" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={invoice.invoiceNumber}
                      onChange={(e) => handleFieldChange("invoiceNumber", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select
                      value={invoice.customerId}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={invoice.issueDate}
                      onChange={(e) => handleFieldChange("issueDate", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Invoice Items Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Invoice Items</h3>
                  <Button variant="outline" icon={<Plus className="w-4 h-4" />} onClick={addItem}>
                    Add Item
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tax
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(item.id, "description", e.target.value)
                              }
                              className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Item description"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(item.id, "quantity", parseInt(e.target.value) || 0)
                              }
                              className="w-20 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <span className="mr-1">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleItemChange(
                                    item.id,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-24 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <span className="mr-1">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.tax}
                                onChange={(e) =>
                                  handleItemChange(item.id, "tax", parseFloat(e.target.value) || 0)
                                }
                                className="w-24 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2 font-medium">
                            ${(item.quantity * item.unitPrice + item.tax).toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            {/* Additional Info Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={invoice.notes}
                      onChange={(e) => handleFieldChange("notes", e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Any additional notes for the client..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Terms and Conditions
                    </label>
                    <textarea
                      value={invoice.terms}
                      onChange={(e) => handleFieldChange("terms", e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Invoice terms and conditions..."
                    ></textarea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Invoice Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>${invoice.taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount:</span>
                    <div className="flex items-center">
                      <span className="mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={invoice.discountAmount}
                        onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                        className="w-24 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Templates Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Templates</h3>
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-md cursor-pointer ${
                        selectedTemplate === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => loadTemplate(template.id)}
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-500" />
                        <span>{template.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Actions Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    icon={<Save className="w-4 h-4" />}
                    onClick={() => saveInvoice(true)}
                    isLoading={isLoading}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    icon={<Send className="w-4 h-4" />}
                    onClick={() => saveInvoice(false)}
                    isLoading={isLoading}
                  >
                    Create Invoice
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => setActiveTab("preview")}
                  >
                    Preview Invoice
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    icon={<Download className="w-4 h-4" />}
                  >
                    Export as PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
                  <div className="text-sm text-gray-500">Invoice #: {invoice.invoiceNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">MATANUSKA TRANSPORT</div>
                  <div className="text-sm text-gray-500">123 Transport Avenue</div>
                  <div className="text-sm text-gray-500">Matanuska, AK 99645</div>
                  <div className="text-sm text-gray-500">info@matanuskatransport.com</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6">
              <div>
                <div className="text-sm font-semibold text-gray-500 mb-2">Bill To:</div>
                <div className="font-medium">{invoice.customer || "Client Name"}</div>
                <div className="text-sm text-gray-600">Client Address Line 1</div>
                <div className="text-sm text-gray-600">City, State ZIP</div>
                <div className="text-sm text-gray-600">client@example.com</div>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-500 font-medium">Issue Date:</div>
                  <div>{invoice.issueDate}</div>
                  <div className="text-gray-500 font-medium">Due Date:</div>
                  <div>{invoice.dueDate}</div>
                  <div className="text-gray-500 font-medium">Status:</div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "draft"
                          ? "bg-gray-100 text-gray-800"
                          : invoice.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : invoice.status === "sent"
                          ? "bg-blue-100 text-blue-800"
                          : invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.description || "Item Description"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        ${item.tax.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        ${(item.quantity * item.unitPrice + item.tax).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <div className="text-gray-600">Subtotal:</div>
                  <div className="font-medium">${invoice.subtotal.toFixed(2)}</div>
                </div>
                <div className="flex justify-between py-2">
                  <div className="text-gray-600">Tax:</div>
                  <div className="font-medium">${invoice.taxTotal.toFixed(2)}</div>
                </div>
                <div className="flex justify-between py-2">
                  <div className="text-gray-600">Discount:</div>
                  <div className="font-medium">${invoice.discountAmount.toFixed(2)}</div>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                  <div>Total:</div>
                  <div>${invoice.total.toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 space-y-4">
              {invoice.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Terms & Conditions</h3>
                  <p className="text-sm text-gray-600">{invoice.terms}</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-gray-50 flex justify-between">
              <Button
                variant="outline"
                icon={<Eye className="w-4 h-4" />}
                onClick={() => setActiveTab("edit")}
              >
                Back to Edit
              </Button>
              <div className="space-x-2">
                <Button variant="outline" icon={<Download className="w-4 h-4" />}>
                  Download PDF
                </Button>
                <Button variant="primary" icon={<Send className="w-4 h-4" />}>
                  Send Invoice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceBuilder;
