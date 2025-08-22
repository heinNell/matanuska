import DefectItemModal from "../../components/Models/Workshop/DefectItemModal";
import PurchaseOrderModal, { PurchaseOrder } from "../../components/Models/Workshop/PurchaseOrderModal";
import CompletionPanel from "../../components/WorkshopManagement/CompletionPanel";
import InventoryPanel from "../../components/WorkshopManagement/InventoryPanel";
import JobCardHeader from "../../components/WorkshopManagement/JobCardHeader";
import JobCardNotes from "../../components/WorkshopManagement/JobCardNotes";
import QAReviewPanel from "../../components/WorkshopManagement/QAReviewPanel";
import TaskManager from "../../components/WorkshopManagement/TaskManager";
import { Button } from "../../components/ui/Button";
import Card, { CardContent } from "../../components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import type { JobCardTask } from "../../types";
import type { DefectItem } from "../../utils/inspectionUtils";
import { format } from "date-fns";
import { Save, X } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { JobCard as JobCardType, JobCardStatus, Priority, TaskEntry } from "../../types/workshop-tyre-inventory";

// Full JobCard type implementation with real-time data
interface JobCardDetail extends Omit<JobCardType, 'tasks'> {
  woNumber: string; // Alias for workOrderNumber
  vehicle: string;  // Alias for vehicleId
  dueDate: string;  // Alias for scheduledDate
  assigned: string[]; // For backward compatibility
  tasks: JobCardTask[]; // Using JobCardTask for compatibility with TaskManager
}

const createEmptyJobCard = (userName: string): JobCardDetail => {
  const now = new Date().toISOString();
  const workOrderNumber = `WO-${Date.now()}`;

  return {
    // Basic identification
    id: uuidv4(),
    workOrderNumber: workOrderNumber,
    woNumber: workOrderNumber,
    inspectionId: undefined,

    // Vehicle information
    vehicleId: "",
    vehicle: "",
    model: "",
    odometer: 0,
    tyrePositions: [],

    // Status and customer info
    customerName: "",
    status: "initiated" as JobCardStatus,
    priority: "low" as Priority,

    // Dates
    createdAt: now,
    createdDate: now,
    updatedAt: now,
    dueDate: "",
    scheduledDate: "",
    completedDate: "",
    estimatedCompletion: "",

    // Assignment
    assigned: [userName],
    assignedTechnician: userName,
    createdBy: userName,

    // Tasks and work details
    tasks: [],
    workDescription: "",
    estimatedHours: 0,
    laborRate: 75,
    totalLaborHours: 0,

    // Costs
    partsCost: 0,
    totalEstimate: 0,
    totalPartsValue: 0,
    additionalCosts: 0,

    // Notes and meta
    notes: "",
    memo: "",
    faultIds: [],

    // Related items
    attachments: [],
    remarks: [],
    timeLog: [],
    linkedPOIds: [],

    // RCA
    rcaRequired: false,
    rcaCompleted: false,

    // Optional fields
    templateId: undefined,
    checklistProgress: {},
    qualityCheckProgress: {},
    safetyCheckProgress: {}
  };
};

const NewJobCardPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = "John Doe"; // TODO: pull from auth

  const [jobCardData, setJobCardData] = useState<JobCardDetail>(createEmptyJobCard(userName));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [assignedParts, setAssignedParts] = useState<any[]>([]);
  const [isPartOperationLoading, setIsPartOperationLoading] = useState(false);

  // Modals state
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [currentDefects, setCurrentDefects] = useState<DefectItem[]>([]);
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null);

  // Field updates
  const updateJobCardField = (field: keyof JobCardDetail, value: any) => {
    setJobCardData((prev) => ({ ...prev, [field]: value }));
  };

  // Parts handlers
  const handleAssignPart = async (partId: string, quantity: number) => {
    setIsPartOperationLoading(true);
    try {
      // In a real app, this would be an API call
      const newPart = {
        id: uuidv4(),
        partId: partId,
        jobCardId: jobCardData.id,
        quantity: quantity,
        addedAt: new Date().toISOString(),
        addedBy: userName,
        partData: {
          id: partId,
          name: `Part ${partId.substring(0, 4)}`,
          partNumber: `P-${partId.substring(0, 6)}`,
          price: Math.floor(Math.random() * 100) + 10,
          quantity: quantity,
          inStock: Math.floor(Math.random() * 50) + 5
        }
      };

      setAssignedParts(prev => [...prev, newPart]);
      return Promise.resolve();
    } catch (error) {
      console.error("Error assigning part:", error);
      return Promise.reject(error);
    } finally {
      setIsPartOperationLoading(false);
    }
  };

  const handleRemovePart = async (assignmentId: string) => {
    setIsPartOperationLoading(true);
    try {
      setAssignedParts(prev => prev.filter(p => p.id !== assignmentId));
      return Promise.resolve();
    } catch (error) {
      console.error("Error removing part:", error);
      return Promise.reject(error);
    } finally {
      setIsPartOperationLoading(false);
    }
  };

  const handleUpdatePartQuantity = async (assignmentId: string, newQuantity: number) => {
    setIsPartOperationLoading(true);
    try {
      setAssignedParts(prev => prev.map(p =>
        p.id === assignmentId ? { ...p, quantity: newQuantity } : p
      ));
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating part quantity:", error);
      return Promise.reject(error);
    } finally {
      setIsPartOperationLoading(false);
    }
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

  // Defects -> tasks (open/close handled locally where needed)
  const openDefectModal = (defects: DefectItem[], _inspectionId: string) => {
    setCurrentDefects(defects);
    setIsDefectModalOpen(true);
  };

  const handleDefectImport = (newDefectItems: DefectItem[]) => {
    // Convert defects to tasks
    const tasks = newDefectItems.map((defect): JobCardTask => ({
      id: uuidv4(),
      title: defect.name,
      description: `Auto-generated from defect inspection`,
      category: defect.type === 'replace' ? 'Parts Replacement' : 'Repair',
      estimatedHours: defect.type === 'replace' ? 2 : 1,
      status: 'pending',
      assignedTo: userName,
      isCritical: false,
    }));

    setJobCardData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ...tasks]
    }));

    setIsDefectModalOpen(false);
    setCurrentDefects([]);
  };

  // PO modal
  const openPOModal = (po: PurchaseOrder) => {
    setCurrentPO(po);
  };

  const handlePOSave = (po: PurchaseOrder) => {
    console.log("Saving Purchase Order:", po);
    setCurrentPO(null);
  };

  // Save/Cancel
  const handleSave = async () => {
    setIsSubmitting(true);
    // TODO: integrate with backend
    console.log("Saving new job card:", jobCardData);
    console.log("Assigned parts:", assignedParts);

    // In a real application, this would save both jobCardData and assignedParts to the database
    // For example: await saveJobCardWithParts(jobCardData, assignedParts);

    await new Promise((r) => setTimeout(r, 500));
    setIsSubmitting(false);
    navigate("/workshop/job-cards");
  };

  const handleCancel = () => navigate("/workshop/job-cards");

  // Calculate the total cost of parts and labor
  const calculateTotalCost = () => {
    // Sum the cost of all assigned parts
    const partsCost = assignedParts.reduce((total, part) => {
      return total + (part.quantity * part.partData.price);
    }, 0);

    // Add labor costs (using a mock value of 10 hours at $75/hour)
    const laborCost = 10 * 75;

    return partsCost + laborCost;
  };

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
            <TabsTrigger value="qa-review">QA Review</TabsTrigger>
            <TabsTrigger value="completion">Completion</TabsTrigger>
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
              <div className="flex space-x-2">
                <Button onClick={() => openPOModal(createSamplePO())}>Create Purchase Order</Button>
                <Button
                  onClick={() => openDefectModal([
                    { type: 'repair', name: 'Brake Inspection' },
                    { type: 'replace', name: 'Oil Filter' }
                  ], 'INSP-123')}
                  variant="outline"
                >
                  Import Defects
                </Button>
                <Button
                  onClick={() => handleDefectImport([
                    { type: 'repair', name: 'Tire Pressure Check' },
                    { type: 'replace', name: 'Air Filter' }
                  ])}
                  variant="outline"
                >
                  Add Sample Tasks
                </Button>
              </div>

              <InventoryPanel
                jobCardId={jobCardData.id}
                assignedParts={assignedParts}
                onAssignPart={handleAssignPart}
                onRemovePart={handleRemovePart}
                onUpdatePartQuantity={handleUpdatePartQuantity}
                isLoading={isPartOperationLoading}
              />
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

          <TabsContent value="qa-review">
            <QAReviewPanel
              jobCardId={jobCardData.id}
              tasks={jobCardData.tasks}
              onVerifyTask={async (taskId) => {
                // In a real app, this would call an API
                handleTaskUpdate(taskId, { status: "verified" });
                return Promise.resolve();
              }}
              canVerifyAllTasks={jobCardData.tasks.some(t => t.status === "completed")}
              onVerifyAllTasks={async () => {
                // Update all completed tasks to verified
                jobCardData.tasks.forEach(task => {
                  if (task.status === "completed") {
                    handleTaskUpdate(task.id, { status: "verified" });
                  }
                });
                return Promise.resolve();
              }}
              isLoading={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="attachments">
            <Card>
              <CardContent>
                <h3 className="font-medium text-lg mb-2">Attachments</h3>
                <p className="text-gray-500">No attachments uploaded yet.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completion">
            <CompletionPanel
              jobCardId={jobCardData.id}
              status={jobCardData.status}
              totalCost={calculateTotalCost()}
              laborHours={10} // Mock value, would come from state in real app
              laborRate={75}
              onGenerateInvoice={async () => {
                console.log("Generating invoice for job card:", jobCardData.id);
                return new Promise(resolve => setTimeout(resolve, 500));
              }}
              onMarkComplete={async () => {
                updateJobCardField("status", "completed" as JobCardStatus);
                return Promise.resolve();
              }}
              onUpdateLaborHours={async (hours) => {
                console.log("Updating labor hours to:", hours);
                return Promise.resolve();
              }}
              canComplete={jobCardData.tasks.every(task =>
                task.status === "completed" || task.status === "verified"
              )}
              isLoading={isSubmitting}
            />
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
          onClose={() => setCurrentPO(null)}
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
