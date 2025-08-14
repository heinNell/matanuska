import DefectItemModal from "@/components/Models/Workshop/DefectItemModal";
import PurchaseOrderModal, { PurchaseOrder } from "@/components/Models/Workshop/PurchaseOrderModal";
import JobCardHeader from "@/components/WorkshopManagement/JobCardHeader";
import TaskManager from "@/components/WorkshopManagement/TaskManager";
import { Button } from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import type { JobCardTask } from "@/types";
import type { DefectItem } from "@/utils/inspectionUtils";
import { format } from "date-fns";
import { Save, X } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// Minimal local type for page state
interface JobCardDetail {
  id: string;
  woNumber: string;
  vehicle: string;
  model: string;
  odometer: number;
  status: string;
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  dueDate: string;
  assigned: string[];
  memo: string;
  tasks: JobCardTask[];
}

const createEmptyJobCard = (userName: string): JobCardDetail => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    woNumber: `WO-${Date.now()}`,
    vehicle: "",
    model: "",
    odometer: 0,
    status: "initiated",
    priority: "low",
    createdAt: now,
    dueDate: "",
    assigned: [userName],
    memo: "",
    tasks: [],
  };
};

const NewJobCardPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = "John Doe"; // TODO: pull from auth

  const [jobCardData, setJobCardData] = useState<JobCardDetail>(createEmptyJobCard(userName));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");

  // Modals state
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [currentDefects, setCurrentDefects] = useState<DefectItem[]>([]);
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null);

  // Field updates
  const updateJobCardField = (field: keyof JobCardDetail, value: any) => {
    setJobCardData((prev) => ({ ...prev, [field]: value }));
  };

  // Task handlers
  const handleTaskUpdate = (taskId: string, updates: Partial<JobCardTask>) => {
    setJobCardData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    }));
  };

  const handleTaskAdd = (task: Omit<JobCardTask, "id">) => {
    const newTask: JobCardTask = { ...task, id: uuidv4() } as JobCardTask;
    setJobCardData((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const handleTaskDelete = (taskId: string) => {
    setJobCardData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  // Defects -> tasks
  const openDefectModal = (defects: DefectItem[], _inspectionId: string) => {
    setCurrentDefects(defects);
    setIsDefectModalOpen(true);
  };

  const handleDefectImport = (newDefectItems: DefectItem[]) => {
    const newTasks: JobCardTask[] = newDefectItems.map((item) => ({
      id: uuidv4(),
      title: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}: ${item.name}`,
      description: undefined,
      category: item.type === "repair" ? "Repair" : "Replace",
      estimatedHours: 1,
      status: "pending",
      isCritical: false,
      parts: [],
    }));
    setJobCardData((prev) => ({ ...prev, tasks: [...prev.tasks, ...newTasks] }));
    setIsDefectModalOpen(false);
  };

  // PO modal
  const openPOModal = (po: PurchaseOrder) => {
    setCurrentPO(po);
    setIsPOModalOpen(true);
  };

  const handlePOSave = (po: PurchaseOrder) => {
    console.log("Saving Purchase Order:", po);
    setIsPOModalOpen(false);
  };

  // Save/Cancel
  const handleSave = async () => {
    setIsSubmitting(true);
    // TODO: integrate with backend
    console.log("Saving new job card:", jobCardData);
    await new Promise((r) => setTimeout(r, 500));
    setIsSubmitting(false);
    navigate("/workshop/job-cards");
  };

  const handleCancel = () => navigate("/workshop/job-cards");

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <JobCardHeader
        jobCard={{
          id: jobCardData.id,
          workOrderNumber: jobCardData.woNumber,
          vehicleId: jobCardData.vehicle,
          customerName: "N/A",
          priority: jobCardData.priority,
          status: jobCardData.status,
          createdDate: jobCardData.createdAt,
          assignedTo: jobCardData.assigned.join(", "),
        }}
        onBack={handleCancel}
        onEdit={() => {}}
        onAssign={() => {}}
        onPrint={() => {}}
      />

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="labor">Labor</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle ID</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={jobCardData.vehicle}
                      onChange={(e) => updateJobCardField("vehicle", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Memo</label>
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      value={jobCardData.memo}
                      onChange={(e) => updateJobCardField("memo", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager
              tasks={jobCardData.tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskAdd={(task) => handleTaskAdd(task)}
              onTaskDelete={handleTaskDelete}
            />
          </TabsContent>

          <TabsContent value="parts">
            <div className="space-y-4">
              <Button onClick={() => openPOModal(createSamplePO())}>Create Purchase Order</Button>
              <Card>
                <CardContent>
                  <h3 className="font-medium text-lg mb-2">Parts Used</h3>
                  <p className="text-gray-500">No parts added yet.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="labor">
            <Card>
              <CardContent>
                <h3 className="font-medium text-lg mb-2">Labor Entries</h3>
                <p className="text-gray-500">No labor entries added yet.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs">
            <Card>
              <CardContent>
                <h3 className="font-medium text-lg mb-2">Additional Costs</h3>
                <p className="text-gray-500">No additional costs added yet.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments">
            <Card>
              <CardContent>
                <h3 className="font-medium text-lg mb-2">Attachments</h3>
                <p className="text-gray-500">No attachments uploaded yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button onClick={handleCancel} variant="outline" icon={<X className="w-4 h-4" />}>
          Cancel
        </Button>
        <Button onClick={handleSave} isLoading={isSubmitting} icon={<Save className="w-4 h-4" />}>
          Save Job Card
        </Button>
      </div>

      <DefectItemModal
        isOpen={isDefectModalOpen}
        onClose={() => setIsDefectModalOpen(false)}
        inspectionId="INSP-123"
        vehicleId={jobCardData.vehicle}
        faultCount={currentDefects.length}
        defectItems={currentDefects}
      />

      {currentPO && (
        <PurchaseOrderModal
          po={currentPO}
          onClose={() => setIsPOModalOpen(false)}
          onSave={handlePOSave}
          onDownloadPDF={() => console.log("Downloading PDF...")}
        />
      )}
    </div>
  );
};

// Helper to make a sample PO
const createSamplePO = (): PurchaseOrder => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    poNumber: `PO-${Date.now()}`,
    title: "Parts for Job Card",
    description: "",
    status: "OPEN",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    vendor: "Vendor Name",
    requester: "John Doe",
    site: "Main Workshop",
    address: "123 Main St, Anytown",
    recipient: "John Doe",
    priority: "MEDIUM",
    items: [],
    attachments: [],
    linkedWorkOrderId: "",
    createdAt: now,
    updatedAt: now,
    canEdit: true,
  };
};

export default NewJobCardPage;
