import { Button } from "../../components/ui/Button";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  MoreHorizontal,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import SyncIndicator from "../../components/ui/SyncIndicator";
import { useAppContext } from "../../context/AppContext";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  orderDate: string;
  expectedDelivery: string;
  status:
    | "draft"
    | "pending"
    | "approved"
    | "ordered"
    | "partially_received"
    | "received"
    | "cancelled";
  totalAmount: number;
  paymentStatus: "unpaid" | "partially_paid" | "paid";
  items: POItem[];
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
}

interface POItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
}

interface FilterState {
  status: string;
  vendor: string;
  dateRange: string;
  paymentStatus: string;
}

const PurchaseOrderTracker: React.FC = () => {
  const { isLoading } = useAppContext();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    vendor: "",
    dateRange: "",
    paymentStatus: "",
  });
  const [vendors, setVendors] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [notification] = useState({ show: false, message: "", type: "" });

  // Fetch purchase orders from Firestore (mock)
  useEffect(() => {
    setSyncing(true);

    // Mock data - in a real app this would be from Firestore
    setTimeout(() => {
      const mockData: PurchaseOrder[] = [
        {
          id: "1",
          poNumber: "PO-2023-001",
          vendor: "AutoParts Inc",
          orderDate: "2023-09-15",
          expectedDelivery: "2023-09-22",
          status: "received",
          totalAmount: 1245.75,
          paymentStatus: "paid",
          items: [
            {
              id: "1-1",
              name: "Brake Pads",
              sku: "BP-1001",
              quantity: 10,
              unitPrice: 45.99,
              totalPrice: 459.9,
              receivedQuantity: 10,
            },
            {
              id: "1-2",
              name: "Brake Discs",
              sku: "BD-2002",
              quantity: 5,
              unitPrice: 89.99,
              totalPrice: 449.95,
              receivedQuantity: 5,
            },
            {
              id: "1-3",
              name: "Brake Fluid",
              sku: "BF-3003",
              quantity: 8,
              unitPrice: 12.99,
              totalPrice: 103.92,
              receivedQuantity: 8,
            },
          ],
        },
        {
          id: "2",
          poNumber: "PO-2023-002",
          vendor: "FilterMaster",
          orderDate: "2023-09-20",
          expectedDelivery: "2023-09-28",
          status: "partially_received",
          totalAmount: 876.25,
          paymentStatus: "partially_paid",
          items: [
            {
              id: "2-1",
              name: "Air Filter",
              sku: "AF-5005",
              quantity: 20,
              unitPrice: 18.25,
              totalPrice: 365.0,
              receivedQuantity: 15,
            },
            {
              id: "2-2",
              name: "Fuel Filter",
              sku: "FF-5006",
              quantity: 15,
              unitPrice: 22.5,
              totalPrice: 337.5,
              receivedQuantity: 10,
            },
            {
              id: "2-3",
              name: "Oil Filter",
              sku: "OF-5007",
              quantity: 12,
              unitPrice: 14.5,
              totalPrice: 174.0,
              receivedQuantity: 8,
            },
          ],
        },
        {
          id: "3",
          poNumber: "PO-2023-003",
          vendor: "ElectroParts",
          orderDate: "2023-10-01",
          expectedDelivery: "2023-10-10",
          status: "ordered",
          totalAmount: 1560.0,
          paymentStatus: "unpaid",
          items: [
            {
              id: "3-1",
              name: "Alternator",
              sku: "ALT-7001",
              quantity: 3,
              unitPrice: 210.0,
              totalPrice: 630.0,
              receivedQuantity: 0,
            },
            {
              id: "3-2",
              name: "Starter Motor",
              sku: "STM-7002",
              quantity: 2,
              unitPrice: 185.0,
              totalPrice: 370.0,
              receivedQuantity: 0,
            },
            {
              id: "3-3",
              name: "Battery",
              sku: "BAT-7003",
              quantity: 4,
              unitPrice: 140.0,
              totalPrice: 560.0,
              receivedQuantity: 0,
            },
          ],
        },
        {
          id: "4",
          poNumber: "PO-2023-004",
          vendor: "LubeExpress",
          orderDate: "2023-10-05",
          expectedDelivery: "2023-10-12",
          status: "approved",
          totalAmount: 925.5,
          paymentStatus: "unpaid",
          items: [
            {
              id: "4-1",
              name: "Engine Oil 5W-30",
              sku: "EO-9001",
              quantity: 25,
              unitPrice: 28.99,
              totalPrice: 724.75,
              receivedQuantity: 0,
            },
            {
              id: "4-2",
              name: "Transmission Fluid",
              sku: "TF-9002",
              quantity: 10,
              unitPrice: 19.99,
              totalPrice: 199.9,
              receivedQuantity: 0,
            },
          ],
          approvedBy: "John Manager",
          approvedDate: "2023-10-06",
        },
        {
          id: "5",
          poNumber: "PO-2023-005",
          vendor: "TireCo",
          orderDate: "2023-10-08",
          expectedDelivery: "2023-10-20",
          status: "draft",
          totalAmount: 3200.0,
          paymentStatus: "unpaid",
          items: [
            {
              id: "5-1",
              name: "All Season Tires 225/65R17",
              sku: "AST-1122",
              quantity: 16,
              unitPrice: 120.0,
              totalPrice: 1920.0,
              receivedQuantity: 0,
            },
            {
              id: "5-2",
              name: "Winter Tires 225/65R17",
              sku: "WT-1122",
              quantity: 8,
              unitPrice: 160.0,
              totalPrice: 1280.0,
              receivedQuantity: 0,
            },
          ],
        },
      ];

      setPurchaseOrders(mockData);
      setFilteredOrders(mockData);

      // Extract unique vendors
      const uniqueVendors = [...new Set(mockData.map((po) => po.vendor))];
      setVendors(uniqueVendors);

      setSyncing(false);
    }, 1000);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let results = [...purchaseOrders];

    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(query) ||
          po.vendor.toLowerCase().includes(query) ||
          po.items.some(
            (item) =>
              item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query)
          )
      );
    }

    // Apply filters
    if (filters.status) {
      results = results.filter((po) => po.status === filters.status);
    }

    if (filters.vendor) {
      results = results.filter((po) => po.vendor === filters.vendor);
    }

    if (filters.paymentStatus) {
      results = results.filter((po) => po.paymentStatus === filters.paymentStatus);
    }

    if (filters.dateRange) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);

      switch (filters.dateRange) {
        case "last30":
          results = results.filter((po) => new Date(po.orderDate) >= thirtyDaysAgo);
          break;
        case "last90":
          results = results.filter((po) => new Date(po.orderDate) >= ninetyDaysAgo);
          break;
        case "older":
          results = results.filter((po) => new Date(po.orderDate) < ninetyDaysAgo);
          break;
      }
    }

    setFilteredOrders(results);
  }, [searchQuery, filters, purchaseOrders]);

  // Handle filter changes
  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle expanded order view - used in JSX
  const handleExpandOrder = (id: string) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // Get status badge styling
  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-purple-100 text-purple-800";
      case "ordered":
        return "bg-indigo-100 text-indigo-800";
      case "partially_received":
        return "bg-amber-100 text-amber-800";
      case "received":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get payment status badge styling
  const getPaymentBadge = (status: PurchaseOrder["paymentStatus"]) => {
    switch (status) {
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "partially_paid":
        return "bg-amber-100 text-amber-800";
      case "paid":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Get status icon
  const getStatusIcon = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "draft":
        return <FileText size={16} />;
      case "pending":
        return <Clock size={16} />;
      case "approved":
        return <CheckCircle size={16} />;
      case "ordered":
        return <Package size={16} />;
      case "partially_received":
        return <Truck size={16} />;
      case "received":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  // Calculate the delivery status based on expected delivery date
  const getDeliveryStatus = (po: PurchaseOrder) => {
    if (po.status === "received") return null;
    if (po.status === "cancelled") return null;

    const today = new Date();
    const expectedDate = new Date(po.expectedDelivery);
    // Order date might be used for future features

    const daysDifference = Math.ceil(
      (expectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference < 0) {
      return { text: `Overdue by ${Math.abs(daysDifference)} days`, color: "text-red-600" };
    } else if (daysDifference === 0) {
      return { text: "Due today", color: "text-amber-600" };
    } else if (daysDifference <= 3) {
      return { text: `Due in ${daysDifference} days`, color: "text-amber-600" };
    } else {
      return { text: `Due in ${daysDifference} days`, color: "text-green-600" };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Purchase Order Tracker</h2>
        <div className="flex items-center space-x-2">
          {syncing ? <SyncIndicator /> : null}
          <Button variant="primary">Create New PO</Button>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div
          className={`p-3 rounded-md ${notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {notification.message}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by PO number, vendor, item name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="ordered">Ordered</option>
                  <option value="partially_received">Partially Received</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <select
                  value={filters.vendor}
                  onChange={(e) => handleFilterChange("vendor", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange("dateRange", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Dates</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="last90">Last 90 Days</option>
                  <option value="older">Older than 90 Days</option>
                </select>
              </div>

              <div>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Payments</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      No purchase orders found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((po) => (
                    <React.Fragment key={po.id}>
                      <tr
                        className={`hover:bg-gray-50 ${expandedOrder === po.id ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          <button
                            onClick={() => handleExpandOrder(po.id)}
                            className="flex items-center text-indigo-600 hover:text-indigo-900"
                          >
                            {expandedOrder === po.id ? (
                              <ChevronUp className="mr-1" size={16} />
                            ) : (
                              <ChevronDown className="mr-1" size={16} />
                            )}
                            {po.poNumber}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{po.vendor}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusBadge(po.status)}`}
                          >
                            <span className="mr-1">{getStatusIcon(po.status)}</span>
                            {po.status.charAt(0).toUpperCase() +
                              po.status.slice(1).replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getDeliveryStatus(po) ? (
                            <span className={getDeliveryStatus(po)?.color}>
                              {getDeliveryStatus(po)?.text}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {formatCurrency(po.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadge(po.paymentStatus)}`}
                          >
                            {po.paymentStatus.charAt(0).toUpperCase() +
                              po.paymentStatus.slice(1).replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-3">
                            <button
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => {}}
                            >
                              Edit
                            </button>
                            <div className="relative inline-block text-left">
                              <button
                                className="text-gray-600 hover:text-gray-900"
                                onClick={() => {}}
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {expandedOrder === po.id && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium">Order Details</h4>
                                  <ul className="mt-2 text-sm space-y-1">
                                    <li>
                                      Expected Delivery:{" "}
                                      {new Date(po.expectedDelivery).toLocaleDateString()}
                                    </li>
                                    {po.approvedBy && (
                                      <li>
                                        Approved By: {po.approvedBy} on{" "}
                                        {po.approvedDate
                                          ? new Date(po.approvedDate).toLocaleDateString()
                                          : "Unknown"}
                                      </li>
                                    )}
                                    <li>
                                      Created On: {new Date(po.orderDate).toLocaleDateString()}
                                    </li>
                                    {po.notes && <li>Notes: {po.notes}</li>}
                                  </ul>
                                </div>

                                <div className="col-span-2">
                                  <h4 className="text-sm font-medium">Order Items</h4>
                                  <div className="mt-2 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                                            Item
                                          </th>
                                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                                            SKU
                                          </th>
                                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                                            Qty
                                          </th>
                                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                                            Received
                                          </th>
                                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                                            Unit Price
                                          </th>
                                          <th className="px-4 py-2 text-left font-medium text-gray-500">
                                            Total
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {po.items.map((item) => (
                                          <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2">{item.name}</td>
                                            <td className="px-4 py-2 text-gray-500">{item.sku}</td>
                                            <td className="px-4 py-2">{item.quantity}</td>
                                            <td className="px-4 py-2">
                                              <span
                                                className={
                                                  item.receivedQuantity === 0
                                                    ? "text-red-600"
                                                    : item.receivedQuantity < item.quantity
                                                      ? "text-amber-600"
                                                      : "text-green-600"
                                                }
                                              >
                                                {item.receivedQuantity} / {item.quantity}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2">
                                              {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className="px-4 py-2 font-medium">
                                              {formatCurrency(item.totalPrice)}
                                            </td>
                                          </tr>
                                        ))}
                                        <tr className="bg-gray-50">
                                          <td colSpan={4} className="px-4 py-2"></td>
                                          <td className="px-4 py-2 font-medium text-right">
                                            Order Total:
                                          </td>
                                          <td className="px-4 py-2 font-bold">
                                            {formatCurrency(po.totalAmount)}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>

                              <div className="flex space-x-2 justify-end">
                                {(po.status === "draft" || po.status === "pending") && (
                                  <Button variant="secondary" size="sm">
                                    Edit Order
                                  </Button>
                                )}
                                {po.status === "draft" && (
                                  <Button variant="primary" size="sm">
                                    Submit for Approval
                                  </Button>
                                )}
                                {po.status === "pending" && (
                                  <Button variant="primary" size="sm">
                                    Approve
                                  </Button>
                                )}
                                {po.status === "approved" && (
                                  <Button variant="primary" size="sm">
                                    Place Order
                                  </Button>
                                )}
                                {(po.status === "ordered" ||
                                  po.status === "partially_received") && (
                                  <Button variant="primary" size="sm">
                                    Receive Items
                                  </Button>
                                )}
                                {po.status !== "cancelled" && po.status !== "received" && (
                                  <Button variant="danger" size="sm">
                                    Cancel
                                  </Button>
                                )}
                                <Button variant="secondary" size="sm">
                                  Print PO
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total POs</p>
                <p className="text-xl font-semibold">{purchaseOrders.length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Receipt</p>
                <p className="text-xl font-semibold">
                  {
                    purchaseOrders.filter(
                      (po) => po.status === "ordered" || po.status === "partially_received"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Awaiting Approval</p>
                <p className="text-xl font-semibold">
                  {purchaseOrders.filter((po) => po.status === "pending").length}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0))}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseOrderTracker;
