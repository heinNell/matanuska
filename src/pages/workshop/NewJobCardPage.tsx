import DefectItemModal from "../../components/Models/Workshop/DefectItemModal.js";
import PurchaseOrderModal, { PurchaseOrder } from "../../components/Models/Workshop/PurchaseOrderModal.js";
import CompletionPanel from "../../components/WorkshopManagement/CompletionPanel.js";
import InventoryPanel from "../../components/WorkshopManagement/InventoryPanel.js";
import JobCardHeader from "../../components/WorkshopManagement/JobCardHeader.js";
import JobCardNotes from "../../components/WorkshopManagement/JobCardNotes.js";
import QAReviewPanel from "../../components/WorkshopManagement/QAReviewPanel.js";
import TaskManager from "../../components/WorkshopManagement/TaskManager.js";
import { Button } from "../../components/ui/Button.js";
import Card, { CardContent } from "../../components/ui/Card.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs.js";
import type { JobCardTask } from "../../types/index.js";
import type { DefectItem } from "../../utils/inspectionUtils.js";
import { format } from "date-fns";
import { Save, X } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { JobCard as JobCardType, JobCardStatus, Priority, TaskEntry } from "../../types/workshop-tyre-inventory.js";

// Full JobCard type implementation with real-time data

// Allow tasks to be TaskEntry[] (preferred) but provide conversion for JobCardTask[]
interface JobCardNote {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  type: "general" | "technician" | "customer" | "internal";
}

interface JobCardDetail extends Omit<JobCardType, 'tasks' | 'notes'> {
  woNumber: string; // Alias for workOrderNumber
  vehicle: string;  // Alias for vehicleId
  dueDate: string;  // Alias for scheduledDate
  assigned: string[]; // For backward compatibility
  tasks: TaskEntry[]; // Use TaskEntry as the primary type
  notes: JobCardNote[];
}

// Conversion functions between TaskEntry and JobCardTask
const taskEntryToJobCardTask = (task: TaskEntry): JobCardTask => ({
  id: task.taskId,
  title: task.description,
  description: task.notes,
  category: task.linkedFaultId ? "Fault" : "General",
  estimatedHours: task.estimatedHours,
  actualHours: task.actualHours,
  status: (task.status as any) ?? "pending",
  assignedTo: task.assignedTo,
  notes: task.notes,
  isCritical: false,
});

const jobCardTaskToTaskEntry = (task: JobCardTask): TaskEntry => ({
  taskId: task.id,
  description: task.title,
  status: (task.status as any) ?? "pending",
  assignedTo: task.assignedTo,
  estimatedHours: task.estimatedHours,
  actualHours: task.actualHours,
  notes: task.notes,
  linkedFaultId: undefined,
});

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
    notes: [],
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
    setJobCardData((prev) => {
      if (field === "notes") {
        // If value is a string, convert to JobCardNote[]
        if (typeof value === "string") {
          return {
            ...prev,
            notes: value
              ? [{
                  id: `${prev.id}-note-1`,
                  text: value,
                  createdBy: prev.createdBy || "system",
                  createdAt: prev.createdAt,
                  type: "general"
                }]
              : [],
          };
        }
        // If value is array, ensure all are JobCardNote by filtering out non-objects
        if (Array.isArray(value)) {
          return {
            ...prev,
            notes: value.filter((n): n is JobCardNote => 
              typeof n === 'object' && n !== null && 'id' in n && 'text' in n
            ),
          };
        }
      }
      return { ...prev, [field]: value };
    });
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

  // TaskEntry-based handlers
  const handleTaskUpdate = (taskId: string, updates: Partial<TaskEntry>) => {
                        setJobCardData(prev => ({
                          ...prev,
                          notes: [
                            ...prev.notes.map(n =>
                              typeof n === 'object' && n !== null
                                ? n
                                : {
                                    id: `${prev.id}-note-legacy`,
                                    text: String(n),
                                    createdBy: prev.createdBy || "system",
                                    createdAt: prev.createdAt,
                                    type: "general"
                                  }
                            ),
                            note
                          ],
                        }));
    const newTask: TaskEntry = { ...task, taskId: uuidv4() } as TaskEntry;
    setJobCardData((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const handleTaskDelete = (taskId: string) => {
    setJobCardData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.taskId !== taskId),
    }));
  };

  // Defects -> tasks (open/close handled locally where needed)
  const openDefectModal = (defects: DefectItem[], _inspectionId: string) => {
    setCurrentDefects(defects);
    setIsDefectModalOpen(true);
  };

  const handleDefectImport = (newDefectItems: DefectItem[]) => {
    // Convert defects to TaskEntry
    const tasks = newDefectItems.map((defect): TaskEntry => ({
      taskId: uuidv4(),
      description: defect.name,
      status: "pending",
      assignedTo: userName,
      estimatedHours: defect.type === "replace" ? 2 : 1,
      actualHours: undefined,
      notes: `Auto-generated from defect inspection`,
      linkedFaultId: undefined,
    }));

    setJobCardData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ...tasks],
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
                  <div>
                    <JobCardNotes
                      notes={jobCardData.notes}
                      onAddNote={note => {
                        setJobCardData(prev => ({
                          ...prev,
                          notes: [
                            ...prev.notes,
                            note
                          ],
                        }));
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager
              // Convert TaskEntry[] to JobCardTask[] for legacy TaskManager
              tasks={jobCardData.tasks.map(taskEntryToJobCardTask)}
              onTaskUpdate={(taskId, updates) => {
                // Convert updates to TaskEntry shape
                handleTaskUpdate(taskId, updates as Partial<TaskEntry>);
              }}
              onTaskAdd={(task) => {
                // Convert JobCardTask to TaskEntry
                handleTaskAdd(jobCardTaskToTaskEntry(task as JobCardTask));
              }}
              onTaskDelete={(taskId) => handleTaskDelete(taskId)}
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
              // Convert TaskEntry[] to JobCardTask[] for legacy QAReviewPanel
              tasks={jobCardData.tasks.map(taskEntryToJobCardTask)}
              onVerifyTask={async (taskId) => {
                handleTaskUpdate(taskId, { status: "verified" });
                return Promise.resolve();
              }}
              canVerifyAllTasks={jobCardData.tasks.map(taskEntryToJobCardTask).some(t => t.status === "completed")}
              onVerifyAllTasks={async () => {
                jobCardData.tasks.forEach(task => {
                  if (taskEntryToJobCardTask(task).status === "completed") {
                    handleTaskUpdate(task.taskId, { status: "verified" });
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