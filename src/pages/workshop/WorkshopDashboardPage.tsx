import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/Tabs";
import {
  Wrench,
  Clipboard,
  FileText,
  Truck,
  ShoppingCart,
  ClipboardCheck
} from "lucide-react";
import FleetTable from "../../components/WorkshopManagement/FleetTable";
import JobCardManagement from "../../components/WorkshopManagement/JobCardManagement";
import InspectionManagement from "../../components/WorkshopManagement/InspectionManagement";
import WorkOrderManagement from "../../components/WorkshopManagement/WorkOrderManagement";
import { useWorkshop } from "../../context/WorkshopContext";

const WorkshopDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("fleet");
  const { jobCards, workOrders, inspections, isLoading } = useWorkshop();

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Workshop Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 border-b">
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Fleet
          </TabsTrigger>
          <TabsTrigger value="job-cards" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Job Cards
          </TabsTrigger>
          <TabsTrigger value="inspections" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Inspections
          </TabsTrigger>
          <TabsTrigger value="work-orders" className="flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            Work Orders
          </TabsTrigger>
          <TabsTrigger value="parts" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Parts
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="mt-0">
          <FleetTable />
        </TabsContent>

        <TabsContent value="job-cards" className="mt-0">
          <JobCardManagement
            jobCards={jobCards}
            isLoading={isLoading.jobCards}
            onRefresh={async () => {
              // In a real app, this would refresh the job cards data
              console.log("Refreshing job cards");
              return Promise.resolve();
            }}
            onStatusUpdate={async (jobCardId, newStatus) => {
              // In a real app, this would update the status via API
              console.log(`Updating job card ${jobCardId} status to ${newStatus}`);
              return Promise.resolve();
            }}
          />
        </TabsContent>

        <TabsContent value="inspections" className="mt-0">
          <InspectionManagement
            inspections={inspections}
            isLoading={isLoading.inspections}
            onRefresh={async () => {
              // In a real app, this would refresh the inspections data
              console.log("Refreshing inspections");
              return Promise.resolve();
            }}
            onCreateJobCard={async (inspectionId) => {
              // In a real app, this would create a job card from an inspection
              console.log(`Creating job card from inspection ${inspectionId}`);
              return Promise.resolve();
            }}
          />
        </TabsContent>

        <TabsContent value="work-orders" className="mt-0">
          <WorkOrderManagement
            workOrders={workOrders}
            isLoading={isLoading.workOrders}
            onRefresh={async () => {
              // In a real app, this would refresh the work orders data
              console.log("Refreshing work orders");
              return Promise.resolve();
            }}
            onStatusUpdate={async (workOrderId, newStatus) => {
              // In a real app, this would update the status via API
              console.log(`Updating work order ${workOrderId} status to ${newStatus}`);
              return Promise.resolve();
            }}
          />
        </TabsContent>

        <TabsContent value="parts" className="mt-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Parts Inventory</h2>
            <p>Parts inventory management functionality will be implemented here.</p>
            <p className="text-gray-500 mt-2">This section will include:</p>
            <ul className="list-disc list-inside ml-4 text-gray-500">
              <li>Parts inventory listing</li>
              <li>Stock levels and reordering</li>
              <li>Purchase order management</li>
              <li>Vendor management</li>
              <li>Cost tracking</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="mt-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Workshop Operations</h2>
            <p>Workshop operations management functionality will be implemented here.</p>
            <p className="text-gray-500 mt-2">This section will include:</p>
            <ul className="list-disc list-inside ml-4 text-gray-500">
              <li>Technician scheduling</li>
              <li>Bay management</li>
              <li>Shift planning</li>
              <li>Workload distribution</li>
              <li>Operational metrics</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkshopDashboardPage;
