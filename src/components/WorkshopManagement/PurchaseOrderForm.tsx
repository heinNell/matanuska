import { Button } from "../../components/ui/Button";
import { format } from "date-fns";
import { Check, Download, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";

import type { PurchaseOrder, POItem } from "../../types/inventory";

// Extend POItem for form usage
type PurchaseOrderFormItem = POItem & {
  description?: string;
  total?: number; // for legacy compatibility, but use totalPrice
};

// Extend PurchaseOrder for form usage
type PurchaseOrderFormState = PurchaseOrder & {
  title: string;
  description?: string;
  dueDate: string;
  requester: string;
  priority: string;
  poType: string;
  terms: string;
  shippingAddress: string;
  subTotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  linkedWorkorder?: string;
  linkedVehicle?: string;
  attachments: string[];
  notes?: string;
  items: PurchaseOrderFormItem[];
};

// PurchaseOrderItem is imported from types/workshop-job-card

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder;
  onSave: (data: PurchaseOrder) => void;
  onCancel: () => void;
  onGeneratePDF: (id: string) => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  initialData,
  onSave,
  onCancel,
  onGeneratePDF,
}) => {
  const [data, setData] = useState<PurchaseOrderFormState>(
    (initialData as PurchaseOrderFormState) || {
      id: `po-${Date.now()}`,
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      title: "",
      description: "",
      dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      vendor: "",
      requester: "",
      priority: "Medium",
      status: "draft",
      terms: "Net 30",
      poType: "Standard",
      shippingAddress: "",
      items: [],
      subTotal: 0,
      tax: 0,
      shipping: 0,
      grandTotal: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "",
      attachments: [],
      notes: "",
      orderDate: format(new Date(), "yyyy-MM-dd"),
      totalAmount: 0,
      paymentStatus: "unpaid",
    }
  );

  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    calculateTotals();
  }, [data.items, data.tax, data.shipping]);

  const handleChange = (field: keyof PurchaseOrderFormState, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const handleItemChange = (itemId: string, field: keyof PurchaseOrderFormItem, value: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    }));

    // Auto-calculate item total
    if (field === "quantity" || field === "unitPrice") {
      setData((prev) => {
        const items = prev.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              totalPrice: item.quantity * item.unitPrice,
            };
          }
          return item;
        });
        return { ...prev, items };
      });
    }
  };

  const handleAddItem = () => {
    const newItem: PurchaseOrderFormItem = {
      id: `item-${Date.now()}`,
      sku: "",
      name: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: "",
    };
    setData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const calculateTotals = () => {
    const subTotal = data.items.reduce((sum: number, item: PurchaseOrderFormItem) => sum + (item.totalPrice || 0), 0);
    const tax = subTotal * (data.tax / 100);
    const grandTotal = subTotal + tax + data.shipping;

    setData((prev) => ({
      ...prev,
      subTotal,
      grandTotal,
    }));
  };

  const handleAddAttachment = (file: File) => {
    // In a real implementation, you'd upload the file to storage
    const mockUrl = URL.createObjectURL(file);
    setData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), mockUrl],
    }));
  };

  const handleSave = () => {
    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedData);
  };

  const handleGeneratePDF = () => {
    onGeneratePDF(data.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Ordered":
        return "bg-blue-100 text-blue-800";
      case "Received":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-gray-100 text-gray-800";
      case "Medium":
        return "bg-blue-100 text-blue-800";
      case "High":
        return "bg-yellow-100 text-yellow-800";
      case "Urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isPreview) {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <div>
            <h2 className="text-xl font-bold">Purchase Order Preview</h2>
            <p className="text-gray-500">{data.poNumber}</p>
          </div>
          <div className="space-x-2">
            <Button onClick={handleGeneratePDF} variant="secondary" icon={<Download size={16} />}>
              Download PDF
            </Button>
            <Button onClick={() => setIsPreview(false)} variant="outline">
              Back to Edit
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-lg mb-3">Purchase Order Details</h3>
              <table className="min-w-full">
                <tbody>
                  <tr>
                    <td className="py-2 pr-4 font-medium">PO Number:</td>
                    <td>{data.poNumber}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Title:</td>
                    <td>{data.title}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Vendor:</td>
                    <td>{data.vendor}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Due Date:</td>
                    <td>{data.dueDate ? format(new Date(data.dueDate), "dd-MMM-yyyy") : ""}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Status:</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}
                      >
                        {data.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Priority:</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(data.priority)}`}
                      >
                        {data.priority}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Requester:</td>
                    <td>{data.requester}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-3">Shipping Information</h3>
              <table className="min-w-full">
                <tbody>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Shipping Address:</td>
                    <td>{data.shippingAddress || "Not specified"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">PO Type:</td>
                    <td>{data.poType}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Payment Terms:</td>
                    <td>{data.terms}</td>
                  </tr>
                  {data.linkedWorkorder && (
                    <tr>
                      <td className="py-2 pr-4 font-medium">Linked Work Order:</td>
                      <td>{data.linkedWorkorder}</td>
                    </tr>
                  )}
                  {data.linkedVehicle && (
                    <tr>
                      <td className="py-2 pr-4 font-medium">Linked Vehicle:</td>
                      <td>{data.linkedVehicle}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {data.description && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Description</h4>
                  <div className="bg-gray-50 p-3 rounded-md">{data.description}</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-medium text-lg mb-3">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 border-b text-left">SKU</th>
                    <th className="py-2 px-4 border-b text-left">Item Name</th>
                    <th className="py-2 px-4 border-b text-left">Description</th>
                    <th className="py-2 px-4 border-b text-right">Quantity</th>
                    <th className="py-2 px-4 border-b text-right">Unit Price</th>
                    <th className="py-2 px-4 border-b text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item: PurchaseOrderFormItem) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3 px-4">{item.sku || "—"}</td>
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.description || "—"}</td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">${(typeof item.total === 'number' ? item.total : (typeof item.totalPrice === 'number' ? item.totalPrice : 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                        No items added to this purchase order.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} rowSpan={4} className="py-2 px-4 border-b" />
                    <td className="py-2 px-4 border-b text-right font-medium">Subtotal:</td>
                    <td className="py-2 px-4 border-b text-right">${data.subTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b text-right font-medium">
                      Tax ({data.tax}%):
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      ${(data.subTotal * (data.tax / 100)).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b text-right font-medium">Shipping:</td>
                    <td className="py-2 px-4 border-b text-right">${data.shipping.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b text-right font-medium">Grand Total:</td>
                    <td className="py-2 px-4 border-b text-right font-bold">
                      ${data.grandTotal.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {data.notes && (
            <div className="mt-6">
              <h3 className="font-medium text-lg mb-3">Notes</h3>
              <div className="bg-gray-50 p-3 rounded-md">{data.notes}</div>
            </div>
          )}

          {data.attachments && data.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-lg mb-3">Attachments</h3>
              <div className="flex flex-wrap gap-4">
                {data.attachments.map((attachment: string, idx: number) => (
                  <div key={idx} className="border rounded-md p-2 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                      <img
                        src={attachment}
                        alt={`Attachment ${idx + 1}`}
                        className="max-w-full max-h-full"
                      />
                    </div>
                    <span className="text-sm mt-2">Attachment {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">Terms and Conditions</h4>
                <p className="text-sm text-gray-600 mt-2">
                  All items in this purchase order are subject to the terms and conditions specified
                  by the vendor. Payment will be processed according to the terms specified in this
                  document.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Created on {data.createdAt ? format(new Date(data.createdAt), "dd-MMM-yyyy") : ""}
                </p>
                <p className="text-sm text-gray-500">
                  Updated on {data.updatedAt ? format(new Date(data.updatedAt), "dd-MMM-yyyy") : ""}
                </p>
                <p className="text-sm text-gray-500">Created by {data.createdBy || "System"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {initialData ? `Edit Purchase Order: ${data.poNumber}` : "Create Purchase Order"}
          </h2>
          <div className="space-x-2">
            <Button onClick={() => setIsPreview(true)} variant="outline">
              Preview
            </Button>
            <Button onClick={handleSave} variant="primary" icon={<Check size={16} />}>
              {initialData ? "Update" : "Create"} Purchase Order
            </Button>
            <Button onClick={onCancel} variant="secondary" icon={<X size={16} />}>
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-lg mb-3">PO Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <input
                  type="text"
                  className="form-input rounded-md w-full border-gray-300"
                  value={data.poNumber}
                  onChange={(e) => handleChange("poNumber", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="form-input rounded-md w-full border-gray-300"
                  value={data.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Brief title for this purchase order"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  className="form-input rounded-md w-full border-gray-300"
                  value={data.vendor}
                  onChange={(e) => handleChange("vendor", e.target.value)}
                  placeholder="Supplier or vendor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="form-input rounded-md w-full border-gray-300"
                  value={data.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                <input
                  type="text"
                  className="form-input rounded-md w-full border-gray-300"
                  value={data.requester}
                  onChange={(e) => handleChange("requester", e.target.value)}
                  placeholder="Person requesting this purchase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="form-select rounded-md w-full border-gray-300"
                    value={data.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Ordered">Ordered</option>
                    <option value="Received">Received</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="form-select rounded-md w-full border-gray-300"
                    value={data.priority}
                    onChange={(e) => handleChange("priority", e.target.value as any)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-3">Additional Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="form-textarea rounded-md w-full border-gray-300"
                  rows={2}
                  value={data.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Detailed description or purpose of this purchase order..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address
                </label>
                <textarea
                  className="form-textarea rounded-md w-full border-gray-300"
                  rows={2}
                  value={data.shippingAddress || ""}
                  onChange={(e) => handleChange("shippingAddress", e.target.value)}
                  placeholder="Delivery address for this purchase..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PO Type</label>
                  <select
                    className="form-select rounded-md w-full border-gray-300"
                    value={data.poType}
                    onChange={(e) => handleChange("poType", e.target.value)}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Blanket">Blanket</option>
                    <option value="Contract">Contract</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    className="form-select rounded-md w-full border-gray-300"
                    value={data.terms}
                    onChange={(e) => handleChange("terms", e.target.value)}
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Cash in Advance">Cash in Advance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Linked Work Order (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-input rounded-md w-full border-gray-300"
                    value={data.linkedWorkorder || ""}
                    onChange={(e) => handleChange("linkedWorkorder", e.target.value)}
                    placeholder="Related job/work order"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Linked Vehicle (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-input rounded-md w-full border-gray-300"
                    value={data.linkedVehicle || ""}
                    onChange={(e) => handleChange("linkedVehicle", e.target.value)}
                    placeholder="Related vehicle ID"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="form-textarea rounded-md w-full border-gray-300"
                  rows={2}
                  value={data.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Additional notes or special instructions..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                <label className="cursor-pointer">
                  <div className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium inline-flex items-center">
                    <Plus size={16} className="mr-1" />
                    Add Attachment
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAddAttachment(e.target.files[0]);
                      }
                    }}
                    multiple
                  />
                </label>
                {data.attachments && data.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.attachments.map((url: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative group border rounded-md overflow-hidden w-16 h-16"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            setData((prev) => ({
                              ...prev,
                              attachments: (prev.attachments || []).filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Purchase Items</h3>
            <Button onClick={handleAddItem} variant="secondary" icon={<Plus size={16} />} size="sm">
              Add Item
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-3 border-b text-left">SKU</th>
                  <th className="py-2 px-3 border-b text-left">Item Name</th>
                  <th className="py-2 px-3 border-b text-left">Description</th>
                  <th className="py-2 px-3 border-b text-left">Quantity</th>
                  <th className="py-2 px-3 border-b text-left">Unit Price ($)</th>
                  <th className="py-2 px-3 border-b text-left">Total ($)</th>
                  <th className="py-2 px-3 border-b text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        className="form-input rounded-md w-full border-gray-300"
                        value={item.sku}
                        onChange={(e) => handleItemChange(item.id, "sku", e.target.value)}
                        placeholder="SKU"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        className="form-input rounded-md w-full border-gray-300"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                        placeholder="Item name"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        className="form-input rounded-md w-full border-gray-300"
                        value={(item as PurchaseOrderFormItem).description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        placeholder="Description"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        className="form-input rounded-md w-24 border-gray-300"
                        value={item.quantity}
                        min="1"
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", parseInt(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-input rounded-md w-28 border-gray-300"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                      />
                    </td>
                    <td className="py-2 px-3">
                      <div className="form-input rounded-md w-28 border-gray-300 bg-gray-50">
                        {(item.totalPrice ?? 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 px-3 text-center text-gray-500">
                      No items added. Click "Add Item" to add items to this purchase order.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} rowSpan={4} className="py-2 px-3 border-b" />
                  <td className="py-2 px-3 border-b text-right font-medium">Subtotal:</td>
                  <td colSpan={2} className="py-2 px-3 border-b">
                    ${data.subTotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-b text-right font-medium">Tax (%):</td>
                  <td colSpan={2} className="py-2 px-3 border-b">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input rounded-md w-28 border-gray-300"
                      value={data.tax}
                      onChange={(e) => handleChange("tax", parseFloat(e.target.value) || 0)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-b text-right font-medium">Shipping ($):</td>
                  <td colSpan={2} className="py-2 px-3 border-b">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input rounded-md w-28 border-gray-300"
                      value={data.shipping}
                      onChange={(e) => handleChange("shipping", parseFloat(e.target.value) || 0)}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-b text-right font-medium">Grand Total:</td>
                  <td colSpan={2} className="py-2 px-3 border-b font-bold">
                    ${data.grandTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseOrderForm;

