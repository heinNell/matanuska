import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  AlertTriangle,
  CheckCircle,
  CircleDot,
  ClipboardList,
  FileText,
  Package,
  ShoppingCart,
} from "lucide-react";
import React, { useState } from "react";

// Import all workshop components
import FaultTracking from "../../components/WorkshopManagement/FaultTracking";
import InventoryDashboard from "../Inventory/InventoryDashboard";
import PurchaseOrderTracker from "../Inventory/PurchaseOrderTracker";
import TyreManagement from "../tyres/TyreManagementPage";
import InspectionManagement from "./InspectionManagement";
import JobCardManagement from "./JobCardManagement";

const WorkOrderManagement = () => <div>Work Order Management Component</div>;

const WorkshopOperations: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Workshop Operations</h1>
        <p className="text-gray-600">Comprehensive workshop management system</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="job-cards">Job Cards</TabsTrigger>
          <TabsTrigger value="tyres">Tyres</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="faults">Faults</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-2">Work Orders</h3>
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Active work orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <ClipboardList className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">Job Cards</h3>
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-600">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <CircleDot className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-2">Tyres</h3>
                <p className="text-2xl font-bold text-purple-600">156</p>
                <p className="text-sm text-gray-600">Total in fleet</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                <h3 className="font-semibold mb-2">Purchase Orders</h3>
                <p className="text-2xl font-bold text-orange-600">5</p>
                <p className="text-sm text-gray-600">Pending approval</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Critical Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <div>
                      <p className="font-medium">Vehicle 14L - Brake System</p>
                      <p className="text-sm text-gray-600">RCA Required</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <div>
                      <p className="font-medium">Tyre Replacement Due</p>
                      <p className="text-sm text-gray-600">3 tyres below minimum tread</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <div>
                      <p className="font-medium">Parts Shortage</p>
                      <p className="text-sm text-gray-600">5 critical parts below minimum stock</p>
                    </div>
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Recent Completions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div>
                      <p className="font-medium">WO-2024-005</p>
                      <p className="text-sm text-gray-600">Vehicle 22H - Service complete</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div>
                      <p className="font-medium">JC-2024-012</p>
                      <p className="text-sm text-gray-600">Tyre rotation - 23H</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div>
                      <p className="font-medium">INS-2024-008</p>
                      <p className="text-sm text-gray-600">Pre-trip inspection - 26H</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="work-orders">
          <WorkOrderManagement />
        </TabsContent>

        <TabsContent value="job-cards">
          <JobCardManagement />
        </TabsContent>

        <TabsContent value="tyres">
          <TyreManagement />
        </TabsContent>

        <TabsContent value="purchase-orders">
          <PurchaseOrderTracker />
        </TabsContent>

        <TabsContent value="inspections">
          <InspectionManagement />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryDashboard />
        </TabsContent>

        <TabsContent value="faults">
          <FaultTracking />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkshopOperations;
