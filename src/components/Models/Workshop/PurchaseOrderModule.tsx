import { Button } from "@/components/ui/Button";
import { Check, FileText, Package, Plus, RefreshCw, ShoppingCart, Store } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card, { CardContent, CardHeader } from "../../ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/Tabs";

interface PurchaseOrderModuleProps {
  onCreatePO?: () => void;
}

const PurchaseOrderModule: React.FC<PurchaseOrderModuleProps> = ({ onCreatePO }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");

  const handleCreatePO = () => {
    if (onCreatePO) {
      onCreatePO();
    } else {
      navigate("/workshop/purchase-orders/new");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Order Management</h2>
          <p className="text-gray-600">Create and manage purchase orders for parts and supplies</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleCreatePO}>
            New Purchase Order
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Purchase Orders</span>
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>PO Approvals</span>
          </TabsTrigger>
          <TabsTrigger value="demand" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>Demand Parts</span>
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span>Vendors</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader title="Purchase Orders" />
            <CardContent>
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No purchase orders</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create a new purchase order to get started
                </p>
                <div className="mt-6">
                  <Button icon={<Plus className="w-4 h-4" />} onClick={handleCreatePO}>
                    Create Purchase Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <Card>
            <CardHeader title="PO Approvals" />
            <CardContent>
              <div className="text-center py-8">
                <Check className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Purchase orders pending approval will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="mt-6">
          <Card>
            <CardHeader title="Demand Parts" />
            <CardContent>
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No demand parts</h3>
                <p className="mt-1 text-sm text-gray-500">Parts on demand will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <Card>
            <CardHeader title="Vendors" />
            <CardContent>
              <div className="text-center py-8">
                <Store className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors</h3>
                <p className="mt-1 text-sm text-gray-500">Add vendors to manage your suppliers</p>
                <div className="mt-6">
                  <Button icon={<Plus className="w-4 h-4" />}>Add Vendor</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseOrderModule;
