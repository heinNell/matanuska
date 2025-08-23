import { Button } from "../../../components/ui/Button";
import { AlertTriangle, Plus, RefreshCw, Wrench } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../../ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/Tabs";

const MaintenanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState("workorders");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Management</h2>
          <p className="text-gray-600">
            Manage maintenance activities, work orders, and service schedules
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button icon={<Plus className="w-4 h-4" />}>New Work Order</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="requests">Maintenance Requests</TabsTrigger>
          <TabsTrigger value="schedule">Service Schedule</TabsTrigger>
          <TabsTrigger value="inventory">Parts Inventory</TabsTrigger>
          <TabsTrigger value="labor">Labor Codes</TabsTrigger>
          <TabsTrigger value="tasks">Task Master</TabsTrigger>
        </TabsList>

        <TabsContent value="workorders" className="mt-6">
          <Card>
            <CardHeader title="Work Orders" />
            <CardContent>
              <div className="text-center py-8">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No work orders available</h3>
                <p className="mt-1 text-sm text-gray-500">Create a new work order to get started</p>
                <div className="mt-6">
                  <Button icon={<Plus className="w-4 h-4" />}>Create Work Order</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader title="Maintenance Requests" />
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance requests</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Pending maintenance requests will appear here
                </p>
                <div className="mt-6">
                  <Button icon={<Plus className="w-4 h-4" />}>Submit Request</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader title="Service Schedule" />
            <CardContent>
              <div className="text-center py-8">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Service schedule module is under development
                </h3>
                <p className="mt-1 text-sm text-gray-500">This feature will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader title="Parts Inventory" />
            <CardContent>
              <div className="text-center py-8">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Parts inventory module is under development
                </h3>
                <p className="mt-1 text-sm text-gray-500">This feature will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labor" className="mt-6">
          <Card>
            <CardHeader title="Labor Codes" />
            <CardContent>
              <div className="text-center py-8">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Labor codes module is under development
                </h3>
                <p className="mt-1 text-sm text-gray-500">This feature will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader title="Task Master" />
            <CardContent>
              <div className="text-center py-8">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Task master module is under development
                </h3>
                <p className="mt-1 text-sm text-gray-500">This feature will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceModule;
