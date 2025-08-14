import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import React, { useState } from "react";

interface WorkOrder {
  workOrderId: string;
  vehicleId: string;
  status: "initiated" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  tasks: TaskEntry[];
  partsUsed: PartEntry[];
  laborEntries: LaborEntry[];
  attachments: Attachment[];
  remarks: Remark[];
  timeLog: TimeLogEntry[];
  linkedInspectionId?: string;
  linkedPOIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  rcaRequired?: boolean;
  rcaCompleted?: boolean;
}

interface TaskEntry {
  taskId: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "not_applicable";
  assignedTo?: string;
  estimatedHours: number;
  actualHours?: number;
  notes?: string;
  linkedFaultId?: string;
}

interface PartEntry {
  partId: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  status: "requested" | "ordered" | "received" | "installed";
}

interface LaborEntry {
  laborId: string;
  technicianId: string;
  technicianName: string;
  laborCode: string;
  hoursWorked: number;
  hourlyRate: number;
  totalCost: number;
  date: string;
}

interface Attachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

interface Remark {
  remarkId: string;
  text: string;
  addedBy: string;
  addedAt: string;
  type: "general" | "technical" | "safety" | "customer";
}

interface TimeLogEntry {
  logId: string;
  status: string;
  timestamp: string;
  userId: string;
  notes?: string;
}

export const WorkOrderManagement: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      workOrderId: "WO-2024-001",
      vehicleId: "14L",
      status: "in_progress",
      priority: "high",
      title: "Brake System Inspection & Repair",
      description: "Complete brake system overhaul required",
      tasks: [
        {
          taskId: "T001",
          description: "Replace brake pads - front axle",
          status: "completed",
          assignedTo: "Workshop",
          estimatedHours: 2,
          actualHours: 1.5,
          linkedFaultId: "F001",
        },
        {
          taskId: "T002",
          description: "Check brake fluid levels",
          status: "in_progress",
          assignedTo: "Workshop",
          estimatedHours: 0.5,
          linkedFaultId: "F002",
        },
      ],
      partsUsed: [
        {
          partId: "P001",
          partNumber: "BP-FL-001",
          description: "Front Brake Pads",
          quantity: 2,
          unitCost: 450,
          totalCost: 900,
          status: "installed",
        },
      ],
      laborEntries: [
        {
          laborId: "L001",
          technicianId: "W",
          technicianName: "Workshop",
          laborCode: "BRAKE",
          hoursWorked: 1.5,
          hourlyRate: 350,
          totalCost: 525,
          date: "2024-01-15",
        },
      ],
      attachments: [],
      remarks: [],
      timeLog: [
        {
          logId: "TL001",
          status: "initiated",
          timestamp: "2024-01-15T08:00:00Z",
          userId: "W",
        },
        {
          logId: "TL002",
          status: "in_progress",
          timestamp: "2024-01-15T09:00:00Z",
          userId: "W",
        },
      ],
      linkedInspectionId: "INS-001",
      linkedPOIds: ["PO-001"],
      createdBy: "W",
      createdAt: "2024-01-15T08:00:00Z",
      updatedAt: "2024-01-15T12:00:00Z",
      startedAt: "2024-01-15T09:00:00Z",
      rcaRequired: true,
      rcaCompleted: false,
    },
  ]);

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "initiated":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartWorkOrder = (workOrderId: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.workOrderId === workOrderId
          ? {
              ...wo,
              status: "in_progress",
              startedAt: new Date().toISOString(),
              timeLog: [
                ...wo.timeLog,
                {
                  logId: `TL${Date.now()}`,
                  status: "in_progress",
                  timestamp: new Date().toISOString(),
                  userId: "W",
                },
              ],
            }
          : wo
      )
    );
  };

  const handleCompleteWorkOrder = (workOrderId: string) => {
    const workOrder = workOrders.find((wo) => wo.workOrderId === workOrderId);
    if (!workOrder) return;

    // Check if RCA is required
    if (workOrder.rcaRequired && !workOrder.rcaCompleted) {
      return;
    }

    // Check if all tasks are completed
    const incompleteTasks = workOrder.tasks.filter(
      (task) => task.status !== "completed" && task.status !== "not_applicable"
    );

    if (incompleteTasks.length > 0) {
      return;
    }

    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.workOrderId === workOrderId
          ? {
              ...wo,
              status: "completed",
              completedAt: new Date().toISOString(),
              timeLog: [
                ...wo.timeLog,
                {
                  logId: `TL${Date.now()}`,
                  status: "completed",
                  timestamp: new Date().toISOString(),
                  userId: "W",
                },
              ],
            }
          : wo
      )
    );
  };

  const filteredWorkOrders = workOrders.filter((wo) => {
    const statusMatch = filterStatus === "all" || wo.status === filterStatus;
    const priorityMatch = filterPriority === "all" || wo.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const calculateTotalCost = (workOrder: WorkOrder) => {
    const partsCost = workOrder.partsUsed.reduce((sum, part) => sum + part.totalCost, 0);
    const laborCost = workOrder.laborEntries.reduce((sum, labor) => sum + labor.totalCost, 0);
    return partsCost + laborCost;
  };

  const getTaskCompletionPercentage = (tasks: TaskEntry[]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed" || task.status === "not_applicable"
    ).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Order Management</h1>
          <p className="text-gray-600">Manage work orders from initiation to completion</p>
        </div>
        <Button>Create Work Order</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Work Orders</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                  >
                    <option value="all">All Status</option>
                    <option value="initiated">Initiated</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Priority</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-opacity-50"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Orders List */}
          <div className="space-y-4">
            {filteredWorkOrders.map((workOrder) => (
              <Card key={workOrder.workOrderId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{workOrder.workOrderId}</h3>
                        <Badge className={getStatusColor(workOrder.status)}>
                          {workOrder.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(workOrder.priority)}>
                          {workOrder.priority.toUpperCase()}
                        </Badge>
                        {workOrder.rcaRequired && !workOrder.rcaCompleted && (
                          <Badge className="bg-red-100 text-red-800 flex items-center space-x-1">
                            <span>RCA Required</span>
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Vehicle</p>
                          <p className="font-medium">{workOrder.vehicleId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Title</p>
                          <p className="font-medium">{workOrder.title}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Tasks Progress</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${getTaskCompletionPercentage(workOrder.tasks)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs">
                              {getTaskCompletionPercentage(workOrder.tasks)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Cost</p>
                          <p className="font-medium">
                            R {calculateTotalCost(workOrder).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Created</p>
                          <p>{new Date(workOrder.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Updated</p>
                          <p>{new Date(workOrder.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWorkOrder(workOrder)}
                      >
                        View
                      </Button>

                      {workOrder.status === "initiated" && (
                        <Button
                          size="sm"
                          onClick={() => handleStartWorkOrder(workOrder.workOrderId)}
                        >
                          Start
                        </Button>
                      )}

                      {workOrder.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteWorkOrder(workOrder.workOrderId)}
                          className={
                            workOrder.rcaRequired && !workOrder.rcaCompleted
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : ""
                          }
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-sm font-medium">Total Work Orders</p>
                    <p className="text-2xl font-bold">{workOrders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-sm font-medium">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {workOrders.filter((wo) => wo.status === "in_progress").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {workOrders.filter((wo) => wo.status === "completed").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-sm font-medium">RCA Required</p>
                    <p className="text-2xl font-bold text-red-600">
                      {workOrders.filter((wo) => wo.rcaRequired && !wo.rcaCompleted).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Work Order Detail Modal would go here */}
      {selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Work Order Details - {selectedWorkOrder.workOrderId}
              </h2>
              <Button variant="outline" onClick={() => setSelectedWorkOrder(null)}>
                Close
              </Button>
            </div>

            {/* Work Order detail tabs would go here */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-medium">{selectedWorkOrder.vehicleId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedWorkOrder.status)}>
                    {selectedWorkOrder.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p>{selectedWorkOrder.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tasks ({selectedWorkOrder.tasks.length})</h3>
                <div className="space-y-2">
                  {selectedWorkOrder.tasks.map((task) => (
                    <div key={task.taskId} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{task.description}</p>
                          <p className="text-sm text-gray-600">
                            Assigned to: {task.assignedTo || "Unassigned"}
                          </p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderManagement;
