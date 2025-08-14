import { Button } from "@/components/ui/Button";
import { AlertTriangle, ArrowLeft, CheckCircle, Clipboard, FileText, Save } from "lucide-react";
import React, { useState } from "react";
import { inspectionTemplates } from "../../../data/inspectionTemplates";
import { DRIVERS } from "../../../types";
import FleetSelector from "../../common/FleetSelector";
import Card, { CardContent, CardHeader } from "../../ui/Card";
import { Select } from "../../ui/FormElements";
import { InspectionItemCard } from "../../ui/InspectionItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/Tabs";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

// Mock user roles for the inspector dropdown
const INSPECTORS = [
  "Workshop Manager",
  "Senior Mechanic",
  "Safety Officer",
  "Driver Supervisor",
  "Quality Assurance",
];

interface InspectionFormProps {
  onBack: () => void;
  onSave?: (inspection: any) => void;
  onComplete?: (inspection: any) => void;
  template?: any;
  existingInspection?: any;
}

const InspectionForm: React.FC<InspectionFormProps> = ({
  onBack,
  onSave,
  onComplete,
  template = inspectionTemplates[0], // Default to first template
  existingInspection,
}) => {
  const [formState, setFormState] = useState({
    fleetNumber: existingInspection?.fleetNumber || "",
    driverName: existingInspection?.driverName || "",
    inspector: existingInspection?.inspector || "",
    date: existingInspection?.date || new Date().toISOString().split("T")[0],
    status: existingInspection?.status || "draft",
    notes: existingInspection?.notes || "",
    items:
      existingInspection?.items ||
      template.items.map((item: any) => ({
        ...item,
        status: "pending",
        notes: "",
      })),
  });

  const [activeCategory, setActiveCategory] = useState(template.categories[0]);
  const [showJobCardModal, setShowJobCardModal] = useState(false);
  const [jobCardItem, setJobCardItem] = useState<any>(null);

  // Calculate item counts for stats
  const itemStats = {
    total: formState.items.length,
    passed: formState.items.filter((item: any) => item.status === "pass").length,
    failed: formState.items.filter((item: any) => item.status === "fail").length,
    pending: formState.items.filter((item: any) => item.status === "pending").length,
  };

  // Calculate completion percentage
  const completionPercentage = ((itemStats.passed + itemStats.failed) / itemStats.total) * 100;

  // Calculate if form can be completed
  const canComplete = itemStats.pending === 0;

  // Filter items by category
  const categoryItems = formState.items.filter((item: any) => item.category === activeCategory);

  // Handle item status change
  const handleItemStatusChange = (
    itemId: string,
    status: "pass" | "fail" | "pending",
    notes: string
  ) => {
    const updatedItems = formState.items.map((item: any) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, status, notes };

        // If critical item fails, trigger job card creation
        if (status === "fail" && item.isCritical && !showJobCardModal) {
          setJobCardItem(updatedItem);
          setShowJobCardModal(true);
        }

        return updatedItem;
      }
      return item;
    });

    setFormState((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Handle save draft
  const handleSaveDraft = () => {
    if (onSave) {
      onSave({
        ...formState,
        status: "draft",
        savedAt: new Date().toISOString(),
      });
    }
    alert("Inspection saved as draft.");
  };

  // Handle complete inspection
  const handleCompleteInspection = () => {
    if (!canComplete) {
      alert("Please complete all pending items before submitting.");
      return;
    }

    const failedItems = formState.items.filter((item: any) => item.status === "fail");
    const criticalFaults = failedItems.filter((item: any) => item.isCritical);

    if (criticalFaults.length > 0) {
      if (
        window.confirm(
          `${criticalFaults.length} critical faults found. Would you like to create a job card?`
        )
      ) {
        setJobCardItem(criticalFaults);
        setShowJobCardModal(true);
      }
    }

    if (onComplete) {
      onComplete({
        ...formState,
        status: "completed",
        completedAt: new Date().toISOString(),
      });
    }
  };

  // Create mock job card from failed item
  const handleCreateJobCard = () => {
    if (!jobCardItem) return;

    alert(`Job card created for: ${jobCardItem.title}`);
    setShowJobCardModal(false);
  };

  // Render job card modal if needed
  const renderJobCardModal = () => {
    if (!showJobCardModal || !jobCardItem) return null;

    return (
      <div className="modal">
        <h2>Create Job Card</h2>
        <p>Critical fault detected: {jobCardItem.description}</p>
        <button onClick={() => setShowJobCardModal(false)}>Cancel</button>
        <button
          onClick={() => {
            console.log("Job card created for:", jobCardItem);
            setShowJobCardModal(false);
          }}
        >
          Create Job Card
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Button
              variant="outline"
              className="mr-2"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={onBack}
            />
            {existingInspection ? "Edit Inspection" : "New Inspection"}
          </h2>
          <p className="text-gray-600">
            {template.name} • {template.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<Save className="w-4 h-4" />} onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button
            icon={<CheckCircle className="w-4 h-4" />}
            onClick={handleCompleteInspection}
            disabled={!canComplete}
          >
            Complete Inspection
          </Button>
        </div>
      </div>

      {/* Form Header */}
      <Card>
        <CardHeader title="Inspection Details" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FleetSelector
              label="Fleet Number"
              value={formState.fleetNumber}
              onChange={(value: string) =>
                setFormState((prev) => ({ ...prev, fleetNumber: value }))
              }
              required
              filterType={["Truck", "Trailer", "Reefer"]} // Allow all vehicle types
              className="w-full px-3 py-2 border rounded-md"
            />

            <Select
              label="Driver *"
              value={formState.driverName}
              onChange={(value) => setFormState((prev) => ({ ...prev, driverName: value }))}
              options={[
                { label: "Select driver...", value: "" },
                ...DRIVERS.map((d) => ({ label: d, value: d })),
              ]}
            />

            <Select
              label="Inspector *"
              value={formState.inspector}
              onChange={(value) => setFormState((prev) => ({ ...prev, inspector: value }))}
              options={[
                { label: "Select inspector...", value: "" },
                ...INSPECTORS.map((i) => ({ label: i, value: i })),
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={formState.date}
                onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Completion Status</h3>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-blue-600 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${completionPercentage}%` }}
                >
                  {completionPercentage.toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{itemStats.total}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{itemStats.passed}</div>
              <div className="text-sm text-gray-500">Passed</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{itemStats.failed}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Categories Tabs and Items */}
      <Card>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="px-4 pt-4 bg-transparent border-b w-full flex overflow-x-auto">
            {template.categories.map((category: string) => (
              <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                <Clipboard className="w-4 h-4" />
                <span>{category}</span>
                {itemStats.failed > 0 &&
                  formState.items.some(
                    (item: any) => item.category === category && item.status === "fail"
                  ) && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
              </TabsTrigger>
            ))}
          </TabsList>

          {template.categories.map((category: string) => (
            <TabsContent key={category} value={category} className="p-4">
              <div className="space-y-4">
                {categoryItems.map((item: any) => (
                  <InspectionItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    isCritical={item.isCritical}
                    onStatusChange={handleItemStatusChange}
                    currentStatus={item.status}
                    currentNotes={item.notes}
                    disabled={formState.status === "completed"}
                  />
                ))}

                {categoryItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No inspection items in this category.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader title="Additional Notes" />
        <CardContent>
          <textarea
            className="w-full border rounded-md px-3 py-2 h-32"
            placeholder="Enter any additional notes about this inspection..."
            value={formState.notes}
            onChange={(e) => setFormState((prev) => ({ ...prev, notes: e.target.value }))}
          />
        </CardContent>
      </Card>

      {/* Job Card Creation Modal */}
      {showJobCardModal && jobCardItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              Create Job Card
            </h3>

            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium">Critical failure detected:</p>
              <p className="text-sm text-red-700 mt-2">{jobCardItem.title}</p>
              <p className="text-sm text-red-700 mt-1">{jobCardItem.description}</p>
              <p className="text-sm text-red-700 mt-2">
                <strong>Notes:</strong> {jobCardItem.notes}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select className="w-full border rounded-md px-3 py-2">
                <option value="">Select assignee...</option>
                <option value="workshop_manager">Workshop Manager</option>
                <option value="senior_mechanic">Senior Mechanic</option>
                <option value="junior_mechanic">Junior Mechanic</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="w-full border rounded-md px-3 py-2">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Instructions
              </label>
              <textarea
                className="w-full border rounded-md px-3 py-2 h-24"
                placeholder="Enter any additional instructions for this job..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowJobCardModal(false)}>
                Cancel
              </Button>
              <Button icon={<FileText className="w-4 h-4" />} onClick={handleCreateJobCard}>
                Create Job Card
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Render Job Card Modal */}
      {renderJobCardModal()}
    </div>
  );
};
export default InspectionForm;
