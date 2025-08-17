import { Button } from "../../../components/ui/Button";
import { format } from "date-fns";
import { doc, setDoc } from "firebase/firestore"; // Import doc and setDoc
import { Check, Download, Edit2, FileText, Printer, X } from "lucide-react";
import React, { useState } from "react";
import { db } from "../../../firebase"; // Import Firestore
import Card, { CardContent } from "../../ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/Tabs";
import { RCAEntry, RCAModal } from "./RCAModal";

export interface JobCardDetail {
  id: string;
  woNumber: string;
  vehicle: string;
  model: string;
  odometer: number;
  status: string;
  priority: string;
  createdAt: string;
  dueDate: string;
  completedDate?: string;
  assigned: string[];
  memo: string;
  tasks: JobCardTask[];
  parts: PartItem[];
  labor: LaborItem[];
  costs: CostItem[];
  attachments: AttachmentItem[];
  remarks: RemarkItem[];
  timeLog: TimeLogEntry[];
  auditLog: AuditLogEntry[];
  canEdit: boolean;
  rcaRequired?: boolean;
  rcaEntry?: RCAEntry;
}

interface JobCardTask {
  id: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  type: string;
  assigned: string;
  notes: string;
  addedDate: string;
  addedBy: string;
}

interface PartItem {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  total: number;
  notes: string;
  date: string;
  addedBy: string;
}

interface LaborItem {
  id: string;
  worker: string;
  code: string;
  rate: number;
  hours: number;
  cost: number;
  notes: string;
  date: string;
  addedBy: string;
}

interface CostItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  addedBy: string;
}

interface AttachmentItem {
  id: string;
  name: string;
  type: string;
  description: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface RemarkItem {
  id: string;
  remark: string;
  date: string;
  by: string;
}

interface TimeLogEntry {
  id: string;
  duration: number;
  type: string;
  date: string;
  by: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
  date: string;
  by: string;
}

interface Props {
  jobCard: JobCardDetail;
  onClose: () => void;
  onSave: (data: JobCardDetail) => void;
  onPDF: (id: string) => void;
  onPrint: (id: string) => void;
  userName: string;
}

export const JobCardDetailModal: React.FC<Props> = ({
  jobCard,
  onClose,
  onSave,
  onPDF,
  onPrint,
  userName,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [data, setData] = useState(jobCard);
  const [activeTab, setActiveTab] = useState("general");
  const [rcaModalOpen, setRcaModalOpen] = useState(false);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setData(jobCard);
    setEditMode(false);
  };
  const handleChange = (field: keyof JobCardDetail, value: any) =>
    setData((d) => ({ ...d, [field]: value }));

  const handleTaskChange = (taskId: string, field: keyof JobCardTask, value: any) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, [field]: value } : t)),
    }));
  };

  const handlePartChange = (partId: string, field: keyof PartItem, value: any) => {
    setData((d) => ({
      ...d,
      parts: d.parts.map((p) => (p.id === partId ? { ...p, [field]: value } : p)),
    }));
  };

  const handleLaborChange = (laborId: string, field: keyof LaborItem, value: any) => {
    setData((d) => ({
      ...d,
      labor: d.labor.map((l) => (l.id === laborId ? { ...l, [field]: value } : l)),
    }));
  };

  const handleAddTask = () => {
    const newTask: JobCardTask = {
      id: `task-${Date.now()}`,
      description: "",
      status: "pending",
      type: "repair",
      assigned: "",
      notes: "",
      addedDate: new Date().toISOString(),
      addedBy: userName,
    };
    setData((d) => ({ ...d, tasks: [...d.tasks, newTask] }));
  };

  const handleAddPart = () => {
    const newPart: PartItem = {
      id: `part-${Date.now()}`,
      name: "",
      partNumber: "",
      quantity: 1,
      unitCost: 0,
      total: 0,
      notes: "",
      date: new Date().toISOString(),
      addedBy: userName,
    };
    setData((d) => ({ ...d, parts: [...d.parts, newPart] }));
  };

  const handleAddLabor = () => {
    const newLabor: LaborItem = {
      id: `labor-${Date.now()}`,
      worker: userName,
      code: "",
      rate: 0,
      hours: 0,
      cost: 0,
      notes: "",
      date: new Date().toISOString(),
      addedBy: userName,
    };
    setData((d) => ({ ...d, labor: [...d.labor, newLabor] }));
  };

  const handleSave = async () => {
    const updatedData = {
      ...data,
      auditLog: [
        ...data.auditLog,
        {
          id: `audit-${Date.now()}`,
          action: "Updated job card",
          field: "multiple",
          oldValue: "",
          newValue: "",
          date: new Date().toISOString(),
          by: userName,
        },
      ],
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, "jobCards", updatedData.id), updatedData);
      onSave(updatedData); // Call parent save handler
    } catch (error) {
      console.error("Error saving document: ", error);
      // Handle error, e.g., show a toast notification
    }

    setEditMode(false);
  };

  const handleRCASave = (entry: RCAEntry) => {
    setData((d) => ({ ...d, rcaEntry: entry }));
    setRcaModalOpen(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd-MMM-yyyy HH:mm");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "initiated":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-purple-100 text-purple-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-yellow-100 text-yellow-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTotals = () => {
    const partTotal = data.parts.reduce((sum, p) => sum + (p.total || p.quantity * p.unitCost), 0);
    const laborTotal = data.labor.reduce((sum, l) => sum + l.cost, 0);
    const additionalTotal = data.costs.reduce((sum, c) => sum + c.amount, 0);
    return {
      partTotal,
      laborTotal,
      additionalTotal,
      grandTotal: partTotal + laborTotal + additionalTotal,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-6xl w-full shadow-lg overflow-auto max-h-[95vh]">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div>
            <span className="font-bold text-lg mr-3">{data.woNumber}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}
            >
              {data.status}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getPriorityColor(data.priority)}`}
            >
              {data.priority}
            </span>
            <span className="ml-4 text-gray-500">{data.vehicle}</span>
            <span className="ml-2 text-gray-400">ODO: {data.odometer} km</span>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => onPrint(data.id)} size="sm" variant="outline">
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            <Button onClick={() => onPDF(data.id)} size="sm" variant="outline">
              <Download size={16} className="mr-2" />
              PDF
            </Button>
            {editMode ? (
              <>
                <Button onClick={handleSave} size="sm" variant="primary">
                  <Check size={16} className="mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} size="sm" variant="secondary">
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              data.canEdit && (
                <Button onClick={handleEdit} size="sm" variant="primary">
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
              )
            )}
            <Button onClick={onClose} size="sm" variant="secondary">
              Close
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="labor">Labor</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="remarks">Remarks</TabsTrigger>
            <TabsTrigger value="timelog">Time Log</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {/* General Tab */}
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Vehicle Details</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-32">Vehicle:</span>
                        {editMode ? (
                          <input
                            type="text"
                            className="form-input rounded border px-2 py-1"
                            value={data.vehicle}
                            onChange={(e) => handleChange("vehicle", e.target.value)}
                          />
                        ) : (
                          <span>{data.vehicle}</span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-32">Model:</span>
                        {editMode ? (
                          <input
                            type="text"
                            className="form-input rounded border px-2 py-1"
                            value={data.model}
                            onChange={(e) => handleChange("model", e.target.value)}
                          />
                        ) : (
                          <span>{data.model}</span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-32">Odometer:</span>
                        {editMode ? (
                          <input
                            type="number"
                            className="form-input rounded border px-2 py-1"
                            value={data.odometer}
                            onChange={(e) =>
                              handleChange("odometer", parseInt(e.target.value) || 0)
                            }
                          />
                        ) : (
                          <span>{data.odometer} km</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Job Details</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-32">Status:</span>
                        {editMode ? (
                          <select
                            className="form-select rounded border px-2 py-1"
                            value={data.status}
                            onChange={(e) => handleChange("status", e.target.value)}
                          >
                            <option value="initiated">Initiated</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="closed">Closed</option>
                            <option value="overdue">Overdue</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}
                          >
                            {data.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-32">Priority:</span>
                        {editMode ? (
                          <select
                            className="form-select rounded border px-2 py-1"
                            value={data.priority}
                            onChange={(e) => handleChange("priority", e.target.value)}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="emergency">Emergency</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(data.priority)}`}
                          >
                            {data.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-32">Created:</span>
                        <span>{formatDate(data.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-32">Due:</span>
                        {editMode ? (
                          <input
                            type="datetime-local"
                            className="form-input rounded border px-2 py-1"
                            value={
                              data.dueDate ? new Date(data.dueDate).toISOString().slice(0, 16) : ""
                            }
                            onChange={(e) => handleChange("dueDate", e.target.value)}
                          />
                        ) : (
                          <span>{formatDate(data.dueDate)}</span>
                        )}
                      </div>
                      {data.completedDate && (
                        <div className="flex items-center">
                          <span className="text-gray-500 w-32">Completed:</span>
                          <span>{formatDate(data.completedDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium text-gray-700">Memo</h3>
                  {editMode ? (
                    <textarea
                      className="form-textarea mt-1 w-full rounded border px-2 py-1"
                      value={data.memo}
                      onChange={(e) => handleChange("memo", e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap">{data.memo}</p>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-medium text-gray-700">Assigned To</h3>
                  <div className="mt-1">
                    {editMode ? (
                      <select
                        multiple
                        className="form-multiselect mt-1 w-full rounded border px-2 py-1"
                        value={data.assigned}
                        onChange={(e) => {
                          const values = Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          );
                          handleChange("assigned", values);
                        }}
                      >
                        <option value="John Smith">John Smith</option>
                        <option value="Jane Doe">Jane Doe</option>
                        <option value="Bob Johnson">Bob Johnson</option>
                        <option value="Alice Williams">Alice Williams</option>
                      </select>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {data.assigned.map((person) => (
                          <span
                            key={person}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            {person}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {data.rcaRequired && (
                  <div className="mt-4 bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Root Cause Analysis Required
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>This job card requires a Root Cause Analysis before closure.</p>
                        </div>
                        {data.rcaEntry ? (
                          <div className="mt-2 p-2 bg-white rounded border border-red-200">
                            <p>
                              <strong>Root Cause:</strong> {data.rcaEntry.rootCause}
                            </p>
                            <p>
                              <strong>Conducted By:</strong> {data.rcaEntry.rcaConductedBy}
                            </p>
                            <p>
                              <strong>Completed:</strong> {formatDate(data.rcaEntry.completedAt)}
                            </p>
                            {data.rcaEntry.note && (
                              <p>
                                <strong>Notes:</strong> {data.rcaEntry.note}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-4">
                            <Button
                              onClick={() => setRcaModalOpen(true)}
                              size="sm"
                              variant="secondary"
                            >
                              Complete RCA
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t pt-4">
                  <h3 className="font-medium text-gray-700">Cost Summary</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Parts:</span>
                      <span>${totals.partTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor:</span>
                      <span>${totals.laborTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional:</span>
                      <span>${totals.additionalTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            {/* Tasks Tab */}
            <Card>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">Tasks</h3>
                  {editMode && (
                    <Button onClick={handleAddTask} size="sm" variant="secondary">
                      Add Task
                    </Button>
                  )}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="text"
                              className="form-input w-full rounded border px-2 py-1 text-sm"
                              value={task.description}
                              onChange={(e) =>
                                handleTaskChange(task.id, "description", e.target.value)
                              }
                            />
                          ) : (
                            <span className="text-sm">{task.description}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <select
                              className="form-select rounded border px-2 py-1 text-sm"
                              value={task.status}
                              onChange={(e) =>
                                handleTaskChange(task.id, "status", e.target.value as any)
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="failed">Failed</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                task.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : task.status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : task.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {task.status === "in_progress"
                                ? "In Progress"
                                : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <select
                              className="form-select rounded border px-2 py-1 text-sm"
                              value={task.type}
                              onChange={(e) => handleTaskChange(task.id, "type", e.target.value)}
                            >
                              <option value="repair">Repair</option>
                              <option value="inspection">Inspection</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <span className="text-sm">
                              {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="text"
                              className="form-input w-full rounded border px-2 py-1 text-sm"
                              value={task.assigned}
                              onChange={(e) =>
                                handleTaskChange(task.id, "assigned", e.target.value)
                              }
                            />
                          ) : (
                            <span className="text-sm">{task.assigned}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="text"
                              className="form-input w-full rounded border px-2 py-1 text-sm"
                              value={task.notes}
                              onChange={(e) => handleTaskChange(task.id, "notes", e.target.value)}
                            />
                          ) : (
                            <span className="text-sm">{task.notes}</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-sm">{formatDate(task.addedDate)}</td>
                        <td className="px-2 py-2 text-sm">{task.addedBy}</td>
                      </tr>
                    ))}
                    {data.tasks.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-2 py-4 text-center text-sm text-gray-500">
                          No tasks added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parts">
            {/* Parts Tab */}
            <Card>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">Parts Used</h3>
                  {editMode && (
                    <Button onClick={handleAddPart} size="sm" variant="secondary">
                      Add Part
                    </Button>
                  )}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part Name
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part #
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Cost
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.parts.map((part) => (
                      <tr key={part.id}>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="text"
                              className="form-input w-full rounded border px-2 py-1 text-sm"
                              value={part.name}
                              onChange={(e) => handlePartChange(part.id, "name", e.target.value)}
                            />
                          ) : (
                            <span className="text-sm">{part.name}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="text"
                              className="form-input w-full rounded border px-2 py-1 text-sm"
                              value={part.partNumber}
                              onChange={(e) =>
                                handlePartChange(part.id, "partNumber", e.target.value)
                              }
                            />
                          ) : (
                            <span className="text-sm">{part.partNumber}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="number"
                              className="form-input w-20 rounded border px-2 py-1 text-sm"
                              value={part.quantity}
                              min="1"
                              onChange={(e) => {
                                const qty = parseInt(e.target.value) || 0;
                                handlePartChange(part.id, "quantity", qty);
                                handlePartChange(part.id, "total", qty * part.unitCost);
                              }}
                            />
                          ) : (
                            <span className="text-sm">{part.quantity}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="number"
                              className="form-input w-24 rounded border px-2 py-1 text-sm"
                              value={part.unitCost}
                              min="0"
                              step="0.01"
                              onChange={(e) => {
                                const cost = parseFloat(e.target.value) || 0;
                                handlePartChange(part.id, "unitCost", cost);
                                handlePartChange(part.id, "total", part.quantity * cost);
                              }}
                            />
                          ) : (
                            <span className="text-sm">${part.unitCost.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-sm">${part.total.toFixed(2)}</td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="text"
                              className="form-input w-full rounded border px-2 py-1 text-sm"
                              value={part.notes}
                              onChange={(e) => handlePartChange(part.id, "notes", e.target.value)}
                            />
                          ) : (
                            <span className="text-sm">{part.notes}</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-sm">{formatDate(part.date)}</td>
                        <td className="px-2 py-2 text-sm">{part.addedBy}</td>
                      </tr>
                    ))}
                    {data.parts.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-2 py-4 text-center text-sm text-gray-500">
                          No parts added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="px-2 py-2 text-right font-medium">
                        Total:
                      </td>
                      <td colSpan={4} className="px-2 py-2 font-medium">
                        ${totals.partTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labor">
            {/* Labor Tab */}
            <Card>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">Labor</h3>
                  {editMode && (
                    <Button onClick={handleAddLabor} size="sm" variant="secondary">
                      Add Labor
                    </Button>
                  )}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Worker
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.labor.map((labor) => (
                      <tr key={labor.id}>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="text"
                              className="form-input w-full rounded border px-2 py-1 text-sm"
                              value={labor.worker}
                              onChange={(e) =>
                                handleLaborChange(labor.id, "worker", e.target.value)
                              }
                            />
                          ) : (
                            <span className="text-sm">{labor.worker}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="text"
                              className="form-input w-full rounded border px-2 py-1 text-sm"
                              value={labor.code}
                              onChange={(e) => handleLaborChange(labor.id, "code", e.target.value)}
                            />
                          ) : (
                            <span className="text-sm">{labor.code}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="number"
                              className="form-input w-24 rounded border px-2 py-1 text-sm"
                              value={labor.rate}
                              min="0"
                              step="0.01"
                              onChange={(e) => {
                                const rate = parseFloat(e.target.value) || 0;
                                handleLaborChange(labor.id, "rate", rate);
                                handleLaborChange(labor.id, "cost", rate * labor.hours);
                              }}
                            />
                          ) : (
                            <span className="text-sm">${labor.rate.toFixed(2)}/hr</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="number"
                              className="form-input w-20 rounded border px-2 py-1 text-sm"
                              value={labor.hours}
                              min="0"
                              step="0.25"
                              onChange={(e) => {
                                const hours = parseFloat(e.target.value) || 0;
                                handleLaborChange(labor.id, "hours", hours);
                                handleLaborChange(labor.id, "cost", labor.rate * hours);
                              }}
                            />
                          ) : (
                            <span className="text-sm">{labor.hours}</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-sm">${labor.cost.toFixed(2)}</td>
                        <td className="px-2 py-2">
                          {editMode ? (
                            <input
                              type="text"
                              className="form-input w-full rounded border px-2 py-1 text-sm"
                              value={labor.notes}
                              onChange={(e) => handleLaborChange(labor.id, "notes", e.target.value)}
                            />
                          ) : (
                            <span className="text-sm">{labor.notes}</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-sm">{formatDate(labor.date)}</td>
                        <td className="px-2 py-2 text-sm">{labor.addedBy}</td>
                      </tr>
                    ))}
                    {data.labor.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-2 py-4 text-center text-sm text-gray-500">
                          No labor entries added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="px-2 py-2 text-right font-medium">
                        Total:
                      </td>
                      <td colSpan={4} className="px-2 py-2 font-medium">
                        ${totals.laborTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs">
            {/* Additional Costs Tab */}
            <div>Additional costs section</div>
          </TabsContent>

          <TabsContent value="attachments">
            {/* Attachments Tab */}
            <div>Attachments section</div>
          </TabsContent>

          <TabsContent value="remarks">
            {/* Remarks Tab */}
            <div>Remarks section</div>
          </TabsContent>

          <TabsContent value="timelog">
            {/* Time Log Tab */}
            <div>Time log section</div>
          </TabsContent>

          <TabsContent value="audit">
            {/* Audit Log Tab */}
            <div>Audit log section</div>
          </TabsContent>
        </Tabs>
      </div>

      {/* RCA Modal */}
      <RCAModal
        open={rcaModalOpen}
        onClose={() => setRcaModalOpen(false)}
        onSubmit={handleRCASave}
        userName={userName}
        initial={data.rcaEntry}
      />
    </div>
  );
};

export default JobCardDetailModal;
