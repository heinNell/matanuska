import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  Upload,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/FormElements";
import Modal from "../../components/ui/Modal";
import PageWrapper from "../../components/ui/PageWrapper";
import { Badge } from "../../components/ui/badge";
// Firebase will be dynamically imported when needed

// Import related forms
import DemandPartsForm, {
  DemandPartsFormData,
} from "../../components/forms/workshop/DemandPartsForm";
import PartsReceivingForm from "../../components/forms/workshop/PartsReceivingForm";

interface PartOrder {
  id: string;
  orderNumber: string;
  demandedBy: string;
  workOrderId?: string;
  vehicleId?: string;
  orderDate: string;
  expectedDelivery?: string;
  status: "PENDING" | "ORDERED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  urgency: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  supplier?: string;
  totalCost: number;
  notes?: string;
  parts: OrderPart[];
}

interface OrderPart {
  id: string;
  sku: string;
  description: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  status: "PENDING" | "ORDERED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
}

const PartsOrderingPage: React.FC = () => {
  const [orders, setOrders] = useState<PartOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PartOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");

  // Modal states
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isReceivePartsModalOpen, setIsReceivePartsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PartOrder | null>(null);
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false);

  // Initialize with mock data
  useEffect(() => {
    const mockOrders: PartOrder[] = [
      {
        id: "1",
        orderNumber: "PO-2024-001",
        demandedBy: "Workshop Manager",
        workOrderId: "WO-2024-0015",
        vehicleId: "TRK-001",
        orderDate: "2024-01-15",
        expectedDelivery: "2024-01-20",
        status: "ORDERED",
        urgency: "HIGH",
        supplier: "AutoParts Inc",
        totalCost: 1250.0,
        notes: "Urgent repair parts for fleet vehicle",
        parts: [
          {
            id: "1",
            sku: "BP-1234",
            description: "Brake Pads - Front Set",
            quantityOrdered: 2,
            quantityReceived: 0,
            unitPrice: 125.0,
            status: "ORDERED",
          },
          {
            id: "2",
            sku: "OF-5678",
            description: "Oil Filter - Heavy Duty",
            quantityOrdered: 4,
            quantityReceived: 0,
            unitPrice: 25.0,
            status: "ORDERED",
          },
        ],
      },
      {
        id: "2",
        orderNumber: "PO-2024-002",
        demandedBy: "Lead Mechanic",
        workOrderId: "WO-2024-0018",
        vehicleId: "TRK-005",
        orderDate: "2024-01-16",
        expectedDelivery: "2024-01-22",
        status: "PARTIALLY_RECEIVED",
        urgency: "MEDIUM",
        supplier: "FilterMaster",
        totalCost: 890.5,
        notes: "Maintenance parts for scheduled service",
        parts: [
          {
            id: "3",
            sku: "AF-9012",
            description: "Air Filter Assembly",
            quantityOrdered: 2,
            quantityReceived: 2,
            unitPrice: 45.25,
            status: "RECEIVED",
          },
          {
            id: "4",
            sku: "FF-3456",
            description: "Fuel Filter - Primary",
            quantityOrdered: 3,
            quantityReceived: 1,
            unitPrice: 35.0,
            status: "ORDERED",
          },
        ],
      },
    ];

    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.demandedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.workOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.vehicleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (urgencyFilter !== "ALL") {
      filtered = filtered.filter((order) => order.urgency === urgencyFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, urgencyFilter, orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ORDERED":
        return "bg-blue-100 text-blue-800";
      case "PARTIALLY_RECEIVED":
        return "bg-orange-100 text-orange-800";
      case "RECEIVED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "LOW":
        return "bg-gray-100 text-gray-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "EMERGENCY":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "ORDERED":
        return <ShoppingCart className="w-4 h-4" />;
      case "PARTIALLY_RECEIVED":
        return <Package className="w-4 h-4" />;
      case "RECEIVED":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleCreateOrder = async (formData: DemandPartsFormData) => {
    try {
      // Convert DemandPartsFormData to PartOrder
      const newOrder: PartOrder = {
        id: Date.now().toString(),
        orderNumber: `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, "0")}`,
        demandedBy: formData.demandBy,
        workOrderId: formData.workOrderId,
        vehicleId: formData.vehicleId,
        orderDate: formData.createdDate,
        status: "PENDING",
        urgency: formData.urgency,
        totalCost: 0, // Will be calculated when supplier prices are added
        notes: formData.notes,
        parts: formData.parts.map((part) => ({
          id: part.id,
          sku: part.sku,
          description: part.description,
          quantityOrdered: part.quantity,
          quantityReceived: 0,
          unitPrice: 0, // Will be set when ordering from supplier
          status: "PENDING",
        })),
      };

      // Dynamically import Firebase modules
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("../../firebase");

      // Save to Firestore
      const docRef = await addDoc(collection(db, "partOrders"), {
        ...newOrder,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });

      // Update with Firestore ID
      const orderWithId = { ...newOrder, id: docRef.id };

      // Update local state
      setOrders((prev) => [...prev, orderWithId]);
      setIsCreateOrderModalOpen(false);
      console.log("New parts order created:", orderWithId);
    } catch (error) {
      console.error("Error creating parts order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  const handleReceiveParts = async (receivedParts: any[]) => {
    // Update order status based on received parts
    if (selectedOrder) {
      try {
        const updatedOrder = { ...selectedOrder };

        // Update parts quantities and statuses
        updatedOrder.parts = updatedOrder.parts.map((part) => {
          const receivedPart = receivedParts.find((rp) => rp.id === part.id);
          if (receivedPart) {
            return {
              ...part,
              quantityReceived: receivedPart.receivingQuantity,
              status:
                receivedPart.receivingQuantity >= part.quantityOrdered
                  ? "RECEIVED"
                  : "PARTIALLY_RECEIVED",
            };
          }
          return part;
        });

        // Determine overall order status
        const allReceived = updatedOrder.parts.every((part) => part.status === "RECEIVED");
        const anyReceived = updatedOrder.parts.some(
          (part) => part.status === "RECEIVED" || part.status === "PARTIALLY_RECEIVED"
        );

        if (allReceived) {
          updatedOrder.status = "RECEIVED";
        } else if (anyReceived) {
          updatedOrder.status = "PARTIALLY_RECEIVED";
        }

        // Dynamically import Firebase modules
        const { doc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } =
          await import("firebase/firestore");
        const { db } = await import("../../firebase");

        // Update in Firestore
        await updateDoc(doc(db, "partOrders", updatedOrder.id), {
          parts: updatedOrder.parts,
          status: updatedOrder.status,
          updatedAt: new Date().toISOString(),
        });

        // Update parts inventory quantities
        for (const receivedPart of receivedParts) {
          // Query for existing part in inventory
          const partsQuery = query(collection(db, "parts"), where("sku", "==", receivedPart.sku));

          const partsSnapshot = await getDocs(partsQuery);

          if (!partsSnapshot.empty) {
            // Update existing part quantity
            const partDoc = partsSnapshot.docs[0];
            if (partDoc) { // Add null/undefined check
              const currentQuantity = partDoc.data().quantity || 0;
              await updateDoc(doc(db, "parts", partDoc.id), {
                quantity: parseInt(currentQuantity) + receivedPart.receivingQuantity,
                lastUpdated: serverTimestamp(),
              });
            }
          } else {
            // Add new part to inventory
            await addDoc(collection(db, "parts"), {
              sku: receivedPart.sku,
              description: receivedPart.description,
              quantity: receivedPart.receivingQuantity,
              cost: 0, // This would need to be determined
              itemType: "part",
              createdAt: serverTimestamp(),
              lastUpdated: serverTimestamp(),
            });
          }
        }

        // Update local state
        setOrders((prev) =>
          prev.map((order) => (order.id === selectedOrder.id ? updatedOrder : order))
        );

        setIsReceivePartsModalOpen(false);
        alert("Parts received successfully! Inventory has been updated.");
      } catch (error) {
        console.error("Error receiving parts:", error);
        alert("Failed to update inventory. Please try again.");
      }
    }
  };

  const handleViewOrder = (order: PartOrder) => {
    setSelectedOrder(order);
    setIsViewOrderModalOpen(true);
  };

  const handleEditOrder = (order: PartOrder) => {
    setSelectedOrder(order);
    // Would open edit modal here
    console.log("Edit order:", order);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "CANCELLED" as const } : order
      )
    );
  };

  const exportOrders = () => {
    // Export orders to CSV/Excel
    console.log("Exporting orders:", filteredOrders);
    // Implementation would go here
  };

  const importOrders = () => {
    // Import orders from file
    console.log("Import orders from file");
    // Implementation would go here
  };

  return (
    <PageWrapper title="Parts Ordering Management">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parts Ordering</h1>
            <p className="text-gray-600">
              Manage parts orders, track deliveries, and maintain inventory
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <Button
              onClick={() => setIsCreateOrderModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Order
            </Button>
            <Button
              variant="outline"
              onClick={exportOrders}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
            <Button variant="outline" onClick={importOrders} icon={<Upload className="w-4 h-4" />}>
              Import
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.status === "PENDING" || o.status === "ORDERED").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Package className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Partial</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.status === "PARTIALLY_RECEIVED").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.status === "RECEIVED").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  label={"Search"}
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                label=""
                value={statusFilter}
                onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value)}
                options={[
                  { label: "All Statuses", value: "ALL" },
                  { label: "Pending", value: "PENDING" },
                  { label: "Ordered", value: "ORDERED" },
                  { label: "Partially Received", value: "PARTIALLY_RECEIVED" },
                  { label: "Received", value: "RECEIVED" },
                  { label: "Cancelled", value: "CANCELLED" },
                ]}
              />

              <Select
                label=""
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter((e.target as HTMLSelectElement).value)}
                options={[
                  { label: "All Urgencies", value: "ALL" },
                  { label: "Low", value: "LOW" },
                  { label: "Medium", value: "MEDIUM" },
                  { label: "High", value: "HIGH" },
                  { label: "Emergency", value: "EMERGENCY" },
                ]}
              />

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  icon={<Filter className="w-4 h-4" />}
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setUrgencyFilter("ALL");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader title="Parts Orders" icon={<Package className="w-5 h-5" />} />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Order / Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Delivery
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">By: {order.demandedBy}</div>
                          <div className="text-xs text-gray-400">{order.orderDate}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status.replace("_", " ")}</span>
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(order.urgency)}`}
                        >
                          {order.urgency === "EMERGENCY" && (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {order.urgency}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {order.workOrderId && (
                            <div className="flex items-center text-gray-900">
                              <FileText className="w-4 h-4 mr-1" />
                              {order.workOrderId}
                            </div>
                          )}
                          {order.vehicleId && (
                            <div className="flex items-center text-gray-600">
                              <Truck className="w-4 h-4 mr-1" />
                              {order.vehicleId}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">{order.supplier || "-"}</td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${order.totalCost.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.expectedDelivery || "-"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewOrder(order)}
                            icon={<Eye className="w-4 h-4" />}
                          ></Button>

                          {(order.status === "ORDERED" ||
                            order.status === "PARTIALLY_RECEIVED") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Option 1: Modal approach
                                // setSelectedOrder(order);
                                // setIsReceivePartsModalOpen(true);

                                // Option 2: Navigate to dedicated receive page with PO information
                                window.location.href = `/receive-parts?poNumber=${order.orderNumber}`;
                              }}
                              icon={<Package className="w-4 h-4" />}
                            >
                              Receive
                            </Button>
                          )}

                          {order.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditOrder(order)}
                              icon={<Edit className="w-4 h-4" />}
                            ></Button>
                          )}

                          {order.status !== "CANCELLED" && order.status !== "RECEIVED" && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleCancelOrder(order.id)}
                              icon={<Trash2 className="w-4 h-4" />}
                            ></Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || statusFilter !== "ALL" || urgencyFilter !== "ALL"
                      ? "Try adjusting your search or filters."
                      : "Get started by creating your first parts order."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create Order Modal */}
        <Modal
          isOpen={isCreateOrderModalOpen}
          onClose={() => setIsCreateOrderModalOpen(false)}
          title="Create Parts Order"
        >
          <DemandPartsForm
            onSubmit={handleCreateOrder}
            onCancel={() => setIsCreateOrderModalOpen(false)}
            workOrderId=""
            vehicleId=""
          />
        </Modal>

        {/* Receive Parts Modal */}
        <Modal
          isOpen={isReceivePartsModalOpen}
          onClose={() => setIsReceivePartsModalOpen(false)}
          title="Receive Parts"
        >
          <PartsReceivingForm
            poNumber={selectedOrder?.orderNumber}
            onSubmit={handleReceiveParts}
            onCancel={() => setIsReceivePartsModalOpen(false)}
          />
        </Modal>

        {/* View Order Modal */}
        <Modal
          isOpen={isViewOrderModalOpen}
          onClose={() => setIsViewOrderModalOpen(false)}
          title="Order Details"
        >
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Number</label>
                  <p className="text-sm text-gray-900">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <Badge
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status.replace("_", " ")}</span>
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Demanded By</label>
                  <p className="text-sm text-gray-900">{selectedOrder.demandedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                  <p className="text-sm text-gray-900">${selectedOrder.totalCost.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parts</label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          SKU
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Description
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Ordered
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Received
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.parts.map((part) => (
                        <tr key={part.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{part.sku}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{part.description}</td>
                          <td className="px-4 py-2 text-sm text-center text-gray-900">
                            {part.quantityOrdered}
                          </td>
                          <td className="px-4 py-2 text-sm text-center text-gray-900">
                            {part.quantityReceived}
                          </td>
                          <td className="px-4 py-2 text-sm text-right text-gray-900">
                            ${part.unitPrice.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default PartsOrderingPage;
