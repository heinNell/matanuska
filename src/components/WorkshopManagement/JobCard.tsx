import JobCardHeader from "../../components/WorkshopManagement/JobCardHeader";
import React, { useState } from "react";
import InventoryPanel from '../../components/WorkshopManagement/InventoryPanel'; // To be integrated in phase 2
import JobCardNotes from "../../components/WorkshopManagement/JobCardNotes";
import TaskHistoryList from "./TaskHistoryList";
import TaskManager from "./TaskManager"; // TaskManager component exists and is now imported
import QAReviewPanel from '../../components/WorkshopManagement/QAReviewPanel'; // Will be imported from the correct location
import CompletionPanel from '../../components/WorkshopManagement/CompletionPanel'; // Will be created in phase 2
import { Button } from "../../components/ui/Button";
import { doc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../firebase";
import { JobCardTask, TaskHistoryEntry } from "../../types";
import { logStatusChange, logTaskAssignment, logTaskEdit } from "../../utils/taskHistory";

// Mock data for a job card
const mockJobCard = {
  id: "jc123",
  workOrderNumber: "JC-2025-0042",
  vehicleId: "28H",
  customerName: "Internal Service",
  priority: "high" as const,
  status: "in_progress" as const,
  createdDate: "2025-06-28",
  scheduledDate: "2025-06-30",
  assignedTo: "John Smith - Senior Mechanic",
  estimatedCompletion: "4 hours",
  workDescription: "Replace brake pads and inspect rotors",
  estimatedHours: 4,
  laborRate: 250,
  partsCost: 1500,
  totalEstimate: 2500,
  notes: [],
  faultId: "f123", // Added faultId property
};

// Mock tasks for the job card
const mockTasks: JobCardTask[] = [
  {
    id: "t1",
    title: "Remove wheels",
    description: "Remove all wheels to access brake assemblies",
    category: "Brakes",
    estimatedHours: 0.5,
    status: "completed" as const,
    assignedTo: "John Smith - Senior Mechanic",
    isCritical: false,
  },
  {
    id: "t2",
    title: "Replace brake pads",
    description: "Install new brake pads on all wheels",
    category: "Brakes",
    estimatedHours: 2,
    status: "in_progress" as const,
    assignedTo: "John Smith - Senior Mechanic",
    isCritical: true,
    parts: [
      { partName: "Front Brake Pads", quantity: 1, isRequired: true },
      { partName: "Rear Brake Pads", quantity: 1, isRequired: true },
    ],
  },
  {
    id: "t3",
    title: "Inspect rotors",
    description: "Check rotors for wear or damage",
    category: "Brakes",
    estimatedHours: 0.5,
    status: "pending" as const,
    isCritical: true,
  },
  {
    id: "t4",
    title: "Reassemble",
    description: "Reinstall wheels and torque to spec",
    category: "Brakes",
    estimatedHours: 1,
    status: "pending" as const,
    isCritical: false,
  },
];

// Mock parts with full Part interface
const mockAssignedParts = [
  {
    id: "a1",
    partId: "p1",
    jobCardId: "jc123",
    quantity: 2,
    addedAt: "2025-06-28T10:30:00Z",
    addedBy: "John Smith - Senior Mechanic",
    partData: {
      id: "p1",
      name: "Front Brake Pads",
      partNumber: "BP-F-456",
      price: 89.99,
      inStock: 15,
      code: "BP-F-456",
      unitPrice: 89.99,
      category: "Brakes",
      sn: 1,
      itemName: "Front Brake Pads",
      totalCost: 179.98,
      quantity: 2
    },
    unitCost: 89.99,
    totalCost: 179.98,
    status: "assigned" as const
  },
  {
    id: "a2",
    partId: "p2",
    jobCardId: "jc123",
    quantity: 1,
    addedAt: "2025-06-28T10:35:00Z",
    addedBy: "John Smith - Senior Mechanic",
    partData: {
      id: "p2",
      name: "Engine Oil 5W-30",
      partNumber: "EO-5W30",
      price: 12.99,
      inStock: 50,
      code: "EO-5W30",
      unitPrice: 12.99,
      category: "Lubricants",
      sn: 2,
      itemName: "Engine Oil 5W-30",
      totalCost: 12.99,
      quantity: 1
    },
    unitCost: 12.99,
    totalCost: 12.99,
    status: "ordered" as const
  }
];

// Mock notes
const mockNotes = [
  {
    id: "n1",
    text: "Customer reports squeaking from front brakes during braking",
    createdBy: "Service Advisor",
    createdAt: "2025-06-28T09:15:00Z",
    type: "customer" as const,
  },
  {
    id: "n2",
    text: "Confirmed brake pads are worn beyond service limit. Recommend replacement of all pads and inspection of rotors.",
    createdBy: "John Smith - Senior Mechanic",
    createdAt: "2025-06-28T10:00:00Z",
    type: "technician" as const,
  },
];

const JobCard: React.FC = () => {
  const [jobCard, setJobCard] = useState(mockJobCard);
  const [tasks, setTasks] = useState(mockTasks);
  const [notes, setNotes] = useState(mockNotes);
  const [userRole, setUserRole] = useState<"technician" | "supervisor">("technician");
  const [isLoading, setIsLoading] = useState(false);

  // Define type for future components data
  type FutureComponentsData = {
    assignedParts: any[]; // Using any[] to avoid type conflicts with mock data
    handleTaskAdd?: (task: Omit<JobCardTask, "id">) => void;
    handleTaskDelete?: (taskId: string) => void;
    handleVerifyTask?: (taskId: string) => Promise<void>;
    handleVerifyAllTasks?: () => Promise<void>;
    handleAssignPart?: (partId: string, quantity: number) => Promise<void>;
    handleRemovePart?: (assignmentId: string) => Promise<void>;
    handleUpdatePartQuantity?: (assignmentId: string, newQuantity: number) => Promise<void>;
    handleCompleteJob?: () => Promise<void>;
    handleGenerateInvoice: () => Promise<void>; // Remove optional since it's always assigned
  };

  // Store components' data in a ref to avoid unused variable warnings
  // while keeping them ready for when components are implemented
  const futureComponentsData = React.useRef<FutureComponentsData>({
    assignedParts: mockAssignedParts,
    handleGenerateInvoice: async () => {} // Placeholder, will be properly assigned below
  });

  // Handler functions for tasks
  // These handlers will be used once the TaskManager component is implemented
  const handleTaskUpdate = async (taskId: string, updates: Partial<JobCardTask>) => {
    const currentTask = tasks.find((task) => task.id === taskId);

    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );

    // Log status changes to history
    if (currentTask && updates.status && updates.status !== currentTask.status) {
      try {
        await logStatusChange(
          jobCard.id, // Using jobCard.id as the main task ID
          currentTask.status,
          updates.status,
          jobCard.assignedTo || "Unknown User",
          `Task "${currentTask.title}" status updated`
        );
      } catch (error) {
        console.error("Failed to log status change:", error);
      }
    }

    // Log assignment changes
    if (currentTask && updates.assignedTo && updates.assignedTo !== currentTask.assignedTo) {
      try {
        await logTaskAssignment(
          jobCard.id,
          updates.assignedTo,
          jobCard.assignedTo || "Unknown User",
          `Task "${currentTask.title}" reassigned`
        );
      } catch (error) {
        console.error("Failed to log assignment change:", error);
      }
    }
  };

  // Initialize future handler functions - these will be used when components are implemented
  React.useEffect(() => {
    // Store handlers in the ref object to avoid unused variable warnings
    futureComponentsData.current.handleTaskAdd = (task: Omit<JobCardTask, "id">) => {
      const newTask = {
        ...task,
        id: uuidv4(),
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
    };

    futureComponentsData.current.handleTaskDelete = (taskId: string) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    };
  }, []);

  // Log task history entry - now uses Firestore
  const handleLogTaskHistory = async (entry: Omit<TaskHistoryEntry, "id">) => {
    try {
      await logTaskEdit(jobCard.id, entry.by, entry.notes);
    } catch (error) {
      console.error("Failed to log task history:", error);
    }
  };

  // Initialize the remaining handlers in the useEffect to avoid unused variable warnings
  React.useEffect(() => {
    // Handler for verifying a task (supervisor only)
    futureComponentsData.current.handleVerifyTask = async (taskId: string) => {
      if (userRole !== "supervisor") return;

      try {
        setIsLoading(true);

        const task = tasks.find((t) => t.id === taskId);
        if (!task) throw new Error("Task not found");

        // Update task in Firestore
        const taskRef = doc(db, "tasks", taskId);
        await updateDoc(taskRef, {
          status: "verified",
          verifiedBy: "Current Supervisor",
          verifiedAt: new Date().toISOString(),
        });

        handleTaskUpdate(taskId, {
          status: "verified",
          verifiedBy: "Current Supervisor",
          verifiedAt: new Date().toISOString(),
        });

        handleLogTaskHistory({
          taskId,
          event: "verified",
          by: "Current Supervisor",
          at: new Date().toISOString(),
          notes: "Task verified by supervisor",
        });
      } catch (error) {
        console.error("Error verifying task:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Handler for verifying all tasks at once (supervisor only)
    futureComponentsData.current.handleVerifyAllTasks = async () => {
      if (userRole !== "supervisor") return;

      try {
        setIsLoading(true);

        // Get all completed tasks that haven't been verified
        const tasksToVerify = tasks.filter((task) => task.status === "completed" && !task.verifiedBy);

        // Update each task
        for (const task of tasksToVerify) {
          const updates: Partial<JobCardTask> = {
            status: "verified",
            verifiedBy: "Current Supervisor",
            verifiedAt: new Date().toISOString(),
          };

          handleTaskUpdate(task.id, updates);

          // Log the verification action
          handleLogTaskHistory({
            taskId: task.id,
            event: "verified",
            by: "Current Supervisor",
            at: new Date().toISOString(),
            notes: "Task verified in batch by supervisor",
          });
        }

        return Promise.resolve();
      } catch (error) {
        console.error("Error verifying all tasks:", error);
        return Promise.reject(error);
      } finally {
        setIsLoading(false);
      }
    };

    // Handler functions for parts
    futureComponentsData.current.handleAssignPart = async (partId: string, quantity: number) => {
      try {
        setIsLoading(true);
        // Implementation will be used when component is ready
        console.log(`Assigning part ${partId} with quantity ${quantity}`);

        // In a real implementation, this would:
        // 1. Fetch part details from inventory
        // 2. Create assignment record in Firestore
        // 3. Update local state

        // Mock implementation for now
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TODO: Add actual part assignment logic here
      } catch (error) {
        console.error('Failed to assign part:', error);
      } finally {
        setIsLoading(false);
      }
    };

    futureComponentsData.current.handleRemovePart = async (assignmentId: string) => {
      try {
        setIsLoading(true);
        // Implementation will be used when component is ready
        console.log(`Removing part assignment ${assignmentId}`);

        // In a real implementation, this would:
        // 1. Remove assignment record from Firestore
        // 2. Update local state

        // Mock implementation for now
        await new Promise(resolve => setTimeout(resolve, 500));

        // TODO: Add actual part removal logic here
      } catch (error) {
        console.error('Failed to remove part:', error);
      } finally {
        setIsLoading(false);
      }
    };

    futureComponentsData.current.handleUpdatePartQuantity = async (
      assignmentId: string,
      newQuantity: number
    ) => {
      try {
        setIsLoading(true);
        // Implementation will be used when component is ready
        console.log(`Updating part assignment ${assignmentId} quantity to ${newQuantity}`);

        // In a real implementation, this would:
        // 1. Update assignment record in Firestore
        // 2. Update local state
        // 3. Recalculate costs

        // Mock implementation for now
        await new Promise(resolve => setTimeout(resolve, 500));

        // TODO: Add actual quantity update logic here
      } catch (error) {
        console.error('Failed to update part quantity:', error);
      } finally {
        setIsLoading(false);
      }
    };
  }, [userRole, tasks, handleTaskUpdate, handleLogTaskHistory]);

  // Handler functions for notes
  const handleAddNote = (
    text: string,
    type: "general" | "technician" | "customer" | "internal"
  ) => {
    const newNote = {
      id: `n${Date.now()}`,
      text,
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
      type: type as "technician" | "customer", // Ensure type compatibility
    };
    setNotes((prevNotes) => [...prevNotes, newNote]);
  };

  const handleEditNote = (id: string, text: string) => {
    setNotes((prevNotes) => prevNotes.map((note) => (note.id === id ? { ...note, text } : note)));
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  // Add completion and invoice handlers to the ref object
  React.useEffect(() => {
    // Handler for job completion
    futureComponentsData.current.handleCompleteJob = async () => {
      try {
        setIsLoading(true);

        // Update job card status in Firestore
        const jobCardRef = doc(db, "jobCards", jobCard.id);
        await updateDoc(jobCardRef, { status: "completed" });

        setJobCard((prev) => ({ ...prev, status: "completed" as "in_progress" }));

        // Log the job card completion
        if (jobCard.faultId) {
          console.log(`Fault ${jobCard.faultId} marked as resolved`);
        }
      } catch (error) {
        console.error("Error completing job card:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Handler for invoice generation
    futureComponentsData.current.handleGenerateInvoice = async () => {
      try {
        setIsLoading(true);

        // Create an invoice in Firestore
        const invoiceRef = doc(db, "invoices", jobCard.id);
        await updateDoc(invoiceRef, {
          jobCardId: jobCard.id,
          status: "generated",
          totalAmount: jobCard.totalEstimate,
          createdAt: new Date().toISOString(),
        });

        alert(`Invoice generated for job card: ${jobCard.id}`);

        setJobCard((prev) => ({ ...prev, status: "invoiced" as "in_progress" }));
      } catch (error) {
        console.error("Error generating invoice:", error);
      } finally {
        setIsLoading(false);
      }
    };
  }, [jobCard.id, jobCard.faultId, jobCard.totalEstimate]);

  // Toggle user role for demo purposes
  const toggleUserRole = () => {
    setUserRole((prev) => (prev === "technician" ? "supervisor" : "technician"));
  };

  return (
    <div className="space-y-6">
      {/* Role toggle for demo */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
        <span className="text-blue-700">
          Current Role: <strong>{userRole === "technician" ? "Technician" : "Supervisor"}</strong>
          {isLoading && <span className="ml-2 text-xs text-blue-500">(Processing...)</span>}
        </span>
        <Button
          size="sm"
          onClick={toggleUserRole}
          variant="outline"
          disabled={isLoading}
        >
          Switch to {userRole === "technician" ? "Supervisor" : "Technician"} View
        </Button>
      </div>

      <JobCardHeader
        jobCard={jobCard}
        onBack={() => {}} // No-op for demo
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* TaskManager component now integrated */}
          <TaskManager
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskAdd={futureComponentsData.current.handleTaskAdd!}
            onTaskDelete={futureComponentsData.current.handleTaskDelete!}
            taskHistory={[]} // We'll implement this in a future step
            onLogTaskHistory={handleLogTaskHistory}
            userRole={userRole}
          />

          <JobCardNotes
            notes={notes}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>

        <div className="space-y-6">
          {/* QA Review Panel for supervisors */}
          {userRole === 'supervisor' && (
            <QAReviewPanel
              jobCardId={jobCard.id}
              tasks={tasks}
              taskHistory={[]}
              onVerifyTask={futureComponentsData.current.handleVerifyTask}
              canVerifyAllTasks={tasks.some(task => task.status === 'completed' && !task.verifiedBy)}
              onVerifyAllTasks={futureComponentsData.current.handleVerifyAllTasks}
              isLoading={isLoading}
            />
          )}

          {/* Inventory Panel */}
          <InventoryPanel
            assignedParts={futureComponentsData.current.assignedParts}
            onAssignPart={futureComponentsData.current.handleAssignPart!}
            onRemovePart={futureComponentsData.current.handleRemovePart!}
            onUpdatePartQuantity={futureComponentsData.current.handleUpdatePartQuantity!}
            isLoading={isLoading}
          />

          {/* Completion Panel for supervisors */}
          {userRole === 'supervisor' && (
            <CompletionPanel
              status={jobCard.status}
              totalCost={jobCard.totalEstimate}
              canComplete={tasks.every(task => task.status === 'completed')}
              onMarkComplete={futureComponentsData.current.handleCompleteJob || (async () => {})}
              onGenerateInvoice={futureComponentsData.current.handleGenerateInvoice}
              onUpdateLaborHours={async (hours: number) => {
                console.log('Labor hours updated:', hours);
              }}
            />
          )}

          {/* Task History */}
          <TaskHistoryList taskId={jobCard.id} />
        </div>
      </div>
    </div>
  );
};

export default JobCard;
