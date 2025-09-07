import { Button } from "../../components/ui/Button";
import React, { useEffect, useState } from "react";
import { syncPurchaseOrderToSage } from "../../api/sageIntegration";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { POItem, PurchaseOrder } from "../../types/inventory";

const PurchaseOrderSync: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Mock data for demo
  useEffect(() => {
    // In a real implementation, this would fetch from Firestore
    setTimeout(() => {
      const mockPOs: PurchaseOrder[] = [
        {
          id: "po1",
          poNumber: "PO-2023-001",
          vendor: "AutoParts Inc",
          vendorId: "vendor1",
          orderDate: "2023-06-15",
          expectedDelivery: "2023-06-22",
          status: "approved",
          totalAmount: 1245.75,
          paymentStatus: "unpaid",
          items: [
            {
              id: "item1",
              name: "Brake Pads",
              sku: "BP-1001",
              quantity: 10,
              unitPrice: 45.99,
              totalPrice: 459.9,
            },
          ],
        },
        {
          id: "po2",
          poNumber: "PO-2023-002",
          vendor: "FilterMaster",
          vendorId: "vendor2",
          orderDate: "2023-06-20",
          expectedDelivery: "2023-06-28",
          status: "ordered",
          totalAmount: 876.25,
          paymentStatus: "unpaid",
          items: [
            {
              id: "item2",
              name: "Air Filter",
              sku: "AF-5005",
              quantity: 20,
              unitPrice: 18.25,
              totalPrice: 365.0,
            },
          ],
        },
        {
          id: "po3",
          poNumber: "PO-2023-003",
          vendor: "ElectroParts",
          vendorId: "vendor3",
          orderDate: "2023-07-01",
          expectedDelivery: "2023-07-10",
          status: "draft",
          totalAmount: 1560.0,
          paymentStatus: "unpaid",
          items: [
            {
              id: "item3",
              name: "Alternator",
              sku: "ALT-7001",
              quantity: 3,
              unitPrice: 210.0,
              totalPrice: 630.0,
            },
          ],
        },
      ];

      setPurchaseOrders(mockPOs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setSyncResult(null);
  };

  const handleSyncPO = async () => {
    if (!selectedPO) return;

    setSyncing(true);
    setSyncResult(null);

    try {
      const success = await syncPurchaseOrderToSage(selectedPO);

      if (success) {
        setSyncResult({
          success: true,
          message: `Successfully synced purchase order ${selectedPO.poNumber} to Sage`,
        });

        // Update the local PO list with sync status if needed
        setPurchaseOrders((prevPOs) =>
          prevPOs.map((po) =>
            po.id === selectedPO.id ? { ...po, sageId: po.sageId || `sage-${Date.now()}` } : po
          )
        );
      } else {
        setSyncResult({
          success: false,
          message: `Failed to sync purchase order ${selectedPO.poNumber} to Sage`,
        });
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: `Error syncing to Sage: ${(error as Error).message}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadgeClass = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "ordered":
        return "bg-purple-100 text-purple-800";
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handlePOClick = (po: PurchaseOrder) => {
    handleSelectPO(po);
  };

  const handleSyncClick = () => {
    handleSyncPO();
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Purchase Order Synchronization</h1>
          <p className="text-gray-600">Sync purchase orders with Sage accounting system</p>
        </div>
        <Button disabled={!selectedPO || syncing} isLoading={syncing} onClick={handleSyncClick}>
          Sync Selected PO to Sage
        </Button>
      </div>

      {/* Sync Result Alert */}
      {syncResult && (
        <div
          className={`p-4 rounded-md ${
            syncResult.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex">
            <div
              className={`flex-shrink-0 ${syncResult.success ? "text-green-400" : "text-red-400"}`}
            >
              {syncResult.success ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  syncResult.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {syncResult.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Purchase Order List */}
        <Card className="md:col-span-5">
          <CardHeader title="Purchase Orders" />
          <CardContent className="p-0 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto" />
                <p className="mt-2 text-gray-500">Loading purchase orders...</p>
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500">No purchase orders found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {purchaseOrders.map((po) => (
                  <li
                    key={po.id}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedPO?.id === po.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handlePOClick(po)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">{po.poNumber}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(po.status)}`}
                        >
                          {po.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>Vendor: {po.vendor}</p>
                        <p>Order Date: {new Date(po.orderDate).toLocaleDateString()}</p>
                        <p>Total: {formatCurrency(po.totalAmount)}</p>
                      </div>
                      {po.sageId && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Synced with Sage
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Selected PO Details */}
        <Card className="md:col-span-7">
          <CardHeader title="Purchase Order Details" />
          <CardContent className="p-4">
            {!selectedPO ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a purchase order to view details</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">PO Number</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedPO.poNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1 text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(selectedPO.status)}`}
                      >
                        {selectedPO.status.replace("_", " ")}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Vendor</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedPO.vendor}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedPO.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Expected Delivery</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedPO.expectedDelivery
                        ? new Date(selectedPO.expectedDelivery).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatCurrency(selectedPO.totalAmount)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Items</h3>
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPO.items.map((item: POItem) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{item.sku}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-4 py-3 text-sm font-medium text-right">
                            Total
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-right">
                            {formatCurrency(selectedPO.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Sage Integration Status
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900">
                          {selectedPO.sageId
                            ? `This purchase order is synced with Sage (ID: ${selectedPO.sageId})`
                            : "This purchase order has not been synced with Sage"}
                        </p>
                        {selectedPO.sageId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last synced:{" "}
                            {selectedPO.updatedAt
                              ? new Date(selectedPO.updatedAt).toLocaleString()
                              : "Unknown"}
                          </p>
                        )}
                      </div>
                      <div>
                        {selectedPO.sageId ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Synced
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Not Synced
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PurchaseOrderSync;
