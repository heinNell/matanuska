import { Box, Clock, Download, FileText, Link, MapPin, ShoppingBag, User } from "lucide-react";
import React from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";

interface POItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  status: string;
}

interface PurchaseOrderDetailViewProps {
  poNumber: string;
  title: string;
  description?: string;
  dueDate: string;
  vendor: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
  requester: string;
  items: POItem[];
  shippingAddress: string;
  recipientName?: string;
  recipientAddress?: string;
  vehicleId?: string;
  workOrderId?: string;
  siteProject?: string;
  attachmentUrl?: string;
  status?: "pending" | "approved" | "received" | "cancelled";
  onEdit?: () => void;
  onApprove?: () => void;
  onCancel?: () => void;
  onPrint?: () => void;
}

const PurchaseOrderDetailView: React.FC<PurchaseOrderDetailViewProps> = ({
  poNumber,
  title,
  description,
  dueDate,
  vendor,
  requester,
  items,
  shippingAddress,
  recipientName,
  recipientAddress,
  vehicleId,
  workOrderId,
  siteProject,
  attachmentUrl,
  status = "pending",
  onEdit,
  onApprove,
  onCancel,
  onPrint,
}) => {
  // Calculate total cost
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = subtotal * 0.15; // Assuming 15% tax
  const shipping = 0; // Could be dynamic
  const total = subtotal + tax + shipping;

  // Format currency
  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`;
  };

  // Determine status badge color
  const getStatusBadgeClass = () => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "received":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                <FileText className="inline-block mr-2 h-5 w-5" />
                {poNumber}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass()}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <h3 className="text-lg font-medium mt-1">{title}</h3>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>

          <div className="flex gap-2">
            {onPrint && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
                icon={<Download className="h-4 w-4" />}
              >
                Print
              </Button>
            )}
            {onEdit && status === "pending" && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onApprove && status === "pending" && (
              <Button variant="primary" size="sm" onClick={onApprove}>
                Approve
              </Button>
            )}
            {onCancel && status === "pending" && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Vendor Information
            </h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium">{vendor.name}</p>
              {vendor.contactPerson && <p className="text-sm">{vendor.contactPerson}</p>}
              {vendor.email && <p className="text-sm">{vendor.email}</p>}
              {vendor.phone && <p className="text-sm">{vendor.phone}</p>}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              Shipping Information
            </h4>
            <div className="bg-gray-50 p-4 rounded-md">
              {recipientName && <p className="font-medium">{recipientName}</p>}
              <p className="whitespace-pre-line">{shippingAddress}</p>
              {recipientAddress && recipientAddress !== shippingAddress && (
                <p className="text-sm mt-2 text-gray-500">
                  <span className="font-medium">Recipient Address:</span>
                  <br />
                  {recipientAddress}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Due Date
            </h4>
            <p>
              {new Date(dueDate).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <User className="mr-2 h-4 w-4" />
              Requester
            </h4>
            <p>{requester}</p>
          </div>

          {(vehicleId || workOrderId || siteProject) && (
            <div className="md:col-span-2">
              <h4 className="font-medium mb-2 flex items-center">
                <Link className="mr-2 h-4 w-4" />
                References
              </h4>
              <div className="flex flex-wrap gap-3">
                {vehicleId && (
                  <div className="bg-blue-50 px-3 py-1 rounded-md text-sm flex items-center">
                    <Box className="mr-1 h-4 w-4 text-blue-500" />
                    Vehicle: {vehicleId}
                  </div>
                )}
                {workOrderId && (
                  <div className="bg-blue-50 px-3 py-1 rounded-md text-sm flex items-center">
                    <FileText className="mr-1 h-4 w-4 text-blue-500" />
                    Work Order: {workOrderId}
                  </div>
                )}
                {siteProject && (
                  <div className="bg-blue-50 px-3 py-1 rounded-md text-sm flex items-center">
                    <MapPin className="mr-1 h-4 w-4 text-blue-500" />
                    Site/Project: {siteProject}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-3">PO Items</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    SKU
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Item Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Qty
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === "received"
                            ? "bg-green-100 text-green-800"
                            : item.status === "partial"
                              ? "bg-yellow-100 text-yellow-800"
                              : item.status === "pending"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">VAT (15%):</span>
                <span className="text-sm font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Shipping:</span>
                <span className="text-sm font-medium">{formatCurrency(shipping)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {attachmentUrl && (
          <div className="mb-6">
            <h4 className="font-medium mb-3">Attachments</h4>
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition"
            >
              <Download className="h-5 w-5 mr-2 text-blue-500" />
              <span>Download Attachment</span>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseOrderDetailView;
