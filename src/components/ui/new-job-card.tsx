import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import JobCardHeader from "../../components/WorkshopManagement/JobCardHeader";
import TaskManager from "../../components/WorkshopManagement/TaskManager";
import { db } from "../../firebase"; // Your Firestore instance
import type { JobCardTask } from "../../types";
import { format } from "date-fns";
import { doc, setDoc } from "firebase/firestore"; // Firestore functions
import { Save, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../../components/ui/Button";
import Card, { CardContent } from "../ui/Card";

// Local state shape aligned with central JobCardTask
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
  parts: any[];
  labor: any[];
  costs: any[];
  attachments: any[];
  remarks: any[];
  timeLog: any[];
  auditLog: any[];
  canEdit: boolean;
  rcaRequired: boolean;
}

// Helper function to create an empty job card
const createEmptyJobCard = (userName: string): JobCardDetail => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    woNumber: `WO-${Date.now()}`,
    vehicle: "",
    model: "",
    odometer: 0,
    status: "created",
    priority: "medium",
    createdAt: now,
    dueDate: format(new Date(), "yyyy-MM-dd"),
    assigned: [userName],
    memo: "",
    tasks: [],
    parts: [],
    labor: [],
    costs: [],
    attachments: [],
    remarks: [],
    timeLog: [],
    auditLog: [
      {
        id: uuidv4(),
        action: "Job card created",
        field: "status",
        oldValue: "N/A",
        newValue: "created",
        date: now,
        by: userName,
      },
    ],
    canEdit: true,
    rcaRequired: false,
  };
};

const NewJobCardPage = () => {
  const navigate = useNavigate();
  const userName = "John Doe"; // Get from Auth Context in a real app

  const [jobCardData, setJobCardData] = useState<JobCardDetail>(createEmptyJobCard(userName));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [error, setError] = useState<string | null>(null);

  const updateJobCardField = (field: keyof JobCardDetail, value: any) => {
    setJobCardData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTaskAdd = (task: Omit<JobCardTask, "id">) => {
    const newTask: JobCardTask = {
      ...task,
      id: uuidv4(),
      // Map optional fields to expected shape
      title: task.title ?? "",
      category: task.category ?? "General",
      estimatedHours: task.estimatedHours ?? 1,
      isCritical: task.isCritical ?? false,
      parts: task.parts ?? [],
      status: task.status ?? "pending",
    };
    setJobCardData((prev) => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<JobCardTask>) => {
    setJobCardData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    }));
  };

  const handleTaskDelete = (taskId: string) => {
    setJobCardData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!jobCardData.vehicle) {
      setError("Vehicle ID is required.");
      setActiveTab("general"); // Navigate to the tab with the error
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create a document reference and save the job card to Firestore
      const jobCardRef = doc(db, "jobCards", jobCardData.id);
      await setDoc(jobCardRef, jobCardData);

      console.log("Job card successfully written with ID: ", jobCardData.id);
      navigate("/workshop/job-cards");
    } catch (e) {
      console.error("Error adding document: ", e);
      setError("Failed to save job card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/workshop/job-cards");
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <JobCardHeader
        jobCard={{
          id: jobCardData.id,
          workOrderNumber: jobCardData.woNumber,
          vehicleId: jobCardData.vehicle,
          customerName: "N/A",
          priority: jobCardData.priority as any,
          status: jobCardData.status,
          createdDate: jobCardData.createdAt,
          assignedTo: jobCardData.assigned.join(", "),
        }}
        onBack={handleCancel}
      />

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
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
              onTaskAdd={handleTaskAdd}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onLogTaskHistory={() => {}} // Placeholder, could be implemented with Firestore
              readonly={false}
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
    </div>
  );
};

export default NewJobCardPage;
