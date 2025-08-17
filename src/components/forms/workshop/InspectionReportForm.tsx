import { Button } from "../../../components/ui/Button";
import { format } from "date-fns";
import { Camera, Check, Download, Trash2, Upload, X } from "lucide-react";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { generateInspectionPDF } from "../../../utils/pdfGenerators";
import Card, { CardContent } from "../../ui/Card";

export interface InspectionItem {
  id: string;
  name: string;
  status: "Pass" | "Fail" | "NA";
  comments?: string;
  images?: string[];
}

export interface InspectionReport {
  id: string;
  reportNumber: string;
  vehicleId: string;
  inspectionDate: string;
  inspector: string;
  items: InspectionItem[];
  overallCondition: "Pass" | "Fail";
  notes?: string;
  attachments?: string[];
  signatureUrl?: string;
}

interface InspectionReportFormProps {
  initialData?: InspectionReport;
  onSave: (data: InspectionReport) => void;
  onCancel: () => void;
  onGeneratePDF: (id: string) => void;
}

const defaultInspectionItems = [
  { id: "item-1", name: "Headlights", status: "Pass" as const },
  { id: "item-2", name: "Brake Lights", status: "Pass" as const },
  { id: "item-3", name: "Indicators", status: "Pass" as const },
  { id: "item-4", name: "Wipers", status: "Pass" as const },
  { id: "item-5", name: "Horn", status: "Pass" as const },
  { id: "item-6", name: "Tires", status: "Pass" as const },
  { id: "item-7", name: "Brakes", status: "Pass" as const },
  { id: "item-8", name: "Suspension", status: "Pass" as const },
  { id: "item-9", name: "Oil Level", status: "Pass" as const },
  { id: "item-10", name: "Coolant Level", status: "Pass" as const },
  { id: "item-11", name: "Washer Fluid", status: "Pass" as const },
  { id: "item-12", name: "Battery", status: "Pass" as const },
  { id: "item-13", name: "Seat Belts", status: "Pass" as const },
  { id: "item-14", name: "Mirrors", status: "Pass" as const },
  { id: "item-15", name: "First Aid Kit", status: "Pass" as const },
  { id: "item-16", name: "Fire Extinguisher", status: "Pass" as const },
  { id: "item-17", name: "Warning Triangle", status: "Pass" as const },
  { id: "item-18", name: "Jack & Tools", status: "Pass" as const },
];

const InspectionReportForm: React.FC<InspectionReportFormProps> = ({
  initialData,
  onSave,
  onCancel,
  onGeneratePDF,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState<InspectionReport>(
    initialData || {
      id: `insp-${Date.now()}`,
      reportNumber: `INSP-${Date.now().toString().slice(-6)}`,
      vehicleId: "",
      inspectionDate: new Date().toISOString(),
      inspector: "",
      items: [...defaultInspectionItems],
      overallCondition: "Pass",
      notes: "",
      attachments: [],
    }
  );

  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (field: keyof InspectionReport, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (itemId: string, field: keyof InspectionItem, value: any) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    }));

    // Auto-update overall condition if any item fails
    if (field === "status" && value === "Fail") {
      setData((prev) => ({ ...prev, overallCondition: "Fail" }));
    }
  };

  const handleAddImage = (itemId: string, imageUrl: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, images: [...(item.images || []), imageUrl] } : item
      ),
    }));
  };

  const handleRemoveImage = (itemId: string, imageIndex: number) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              images: (item.images || []).filter((_, idx) => idx !== imageIndex),
            }
          : item
      ),
    }));
  };

  const handleAddAttachment = (file: File) => {
    // In a real implementation, you'd upload the file to storage
    // For now, we'll just use the file name
    const mockUrl = URL.createObjectURL(file);
    setData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), mockUrl],
    }));
  };

  const handleSave = () => {
    onSave(data);
    enqueueSnackbar("Inspection report saved", { variant: "success" });
  };

  const handleGeneratePDF = () => {
    // Use our custom PDF generator for professional output with photos
    generateInspectionPDF(data);
    // Also call the provided callback if needed
    onGeneratePDF?.(data.id);
    enqueueSnackbar("PDF generated", { variant: "info" });
  };

  const renderStatusClass = (status: string) => {
    switch (status) {
      case "Pass":
        return "bg-green-100 text-green-800";
      case "Fail":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isPreview) {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <div>
            <h2 className="text-xl font-bold">Inspection Report Preview</h2>
            <p className="text-gray-500">{data.reportNumber}</p>
          </div>
          <div className="space-x-2">
            <Button onClick={handleGeneratePDF} variant="secondary" icon={<Download size={16} />}>
              Download PDF
            </Button>
            <Button onClick={() => setIsPreview(false)} variant="outline">
              Back to Edit
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-lg mb-3">Inspection Details</h3>
              <table className="min-w-full">
                <tbody>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Report Number:</td>
                    <td>{data.reportNumber}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Vehicle ID:</td>
                    <td>{data.vehicleId}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Date:</td>
                    <td>{format(new Date(data.inspectionDate), "dd-MMM-yyyy")}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Inspector:</td>
                    <td>{data.inspector}</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">Overall Condition:</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${renderStatusClass(data.overallCondition)}`}
                      >
                        {data.overallCondition}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-3">Notes</h3>
              <div className="bg-gray-50 p-3 rounded-md min-h-[100px]">
                {data.notes || "No additional notes."}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-medium text-lg mb-3">Inspection Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 border-b text-left">Item</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                    <th className="py-2 px-4 border-b text-left">Comments</th>
                    <th className="py-2 px-4 border-b text-left">Images</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${renderStatusClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.comments || "No comments"}</td>
                      <td className="py-3 px-4">
                        {item.images && item.images.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {item.images.map((img, idx) => (
                              <div
                                key={idx}
                                className="w-12 h-12 bg-gray-200 rounded overflow-hidden"
                              >
                                <img
                                  src={img}
                                  alt={`${item.name} image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          "No images"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.attachments && data.attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="font-medium text-lg mb-3">Attachments</h3>
              <div className="flex flex-wrap gap-4">
                {data.attachments.map((attachment, idx) => (
                  <div key={idx} className="border rounded-md p-2 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                      <img
                        src={attachment}
                        alt={`Attachment ${idx + 1}`}
                        className="max-w-full max-h-full"
                      />
                    </div>
                    <span className="text-sm mt-2">Attachment {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">Signature</h4>
                {data.signatureUrl ? (
                  <div className="mt-2 border rounded-md p-2 w-64 h-20">
                    <img src={data.signatureUrl} alt="Signature" className="max-h-full" />
                  </div>
                ) : (
                  <div className="mt-2 border rounded-md p-2 w-64 h-20 flex items-center justify-center text-gray-400">
                    No signature
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Generated on {format(new Date(), "dd-MMM-yyyy HH:mm")}
                </p>
                <p className="text-sm text-gray-500">Report ID: {data.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Inspection Report</h2>
          <div className="space-x-2">
            <Button onClick={() => setIsPreview(true)} variant="outline">
              Preview
            </Button>
            <Button onClick={handleSave} variant="primary" icon={<Check size={16} />}>
              Save Report
            </Button>
            <Button onClick={onCancel} variant="secondary" icon={<X size={16} />}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-lg mb-3">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Number
                </label>
                <input
                  type="text"
                  className="form-input rounded-md w-full border-gray-300"
                  value={data.reportNumber}
                  onChange={(e) => handleChange("reportNumber", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
                <input
                  type="text"
                  className="form-input rounded-md w-full border-gray-300"
                  value={data.vehicleId}
                  placeholder="e.g. 28H"
                  onChange={(e) => handleChange("vehicleId", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspection Date
                </label>
                <input
                  type="date"
                  className="form-input rounded-md w-full border-gray-300"
                  value={format(new Date(data.inspectionDate), "yyyy-MM-dd")}
                  onChange={(e) =>
                    handleChange("inspectionDate", new Date(e.target.value).toISOString())
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspector Name
                </label>
                <input
                  type="text"
                  className="form-input rounded-md w-full border-gray-300"
                  value={data.inspector}
                  onChange={(e) => handleChange("inspector", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-3">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="form-textarea rounded-md w-full border-gray-300"
                  rows={5}
                  value={data.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Enter any additional notes or observations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Vehicle Condition
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      checked={data.overallCondition === "Pass"}
                      onChange={() => handleChange("overallCondition", "Pass")}
                    />
                    <span className="ml-2">Pass</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      checked={data.overallCondition === "Fail"}
                      onChange={() => handleChange("overallCondition", "Fail")}
                    />
                    <span className="ml-2">Fail</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                <div className="mt-1 flex items-center">
                  <label className="cursor-pointer">
                    <div className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium flex items-center">
                      <Upload size={16} className="mr-1" />
                      Add Attachment
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleAddAttachment(e.target.files[0]);
                        }
                      }}
                      multiple
                    />
                  </label>
                  <span className="ml-2 text-sm text-gray-500">
                    {data.attachments?.length || 0} file(s) attached
                  </span>
                </div>
                {data.attachments && data.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.attachments.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group border rounded-md overflow-hidden w-16 h-16"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            setData((prev) => ({
                              ...prev,
                              attachments: (prev.attachments || []).filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-4">Inspection Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-2 px-4 border-b text-left">Item</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Comments</th>
                  <th className="py-2 px-4 border-b text-left">Images</th>
                  <th className="py-2 px-4 border-b text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">
                      <select
                        className="form-select rounded-md border-gray-300"
                        value={item.status}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "status",
                            e.target.value as "Pass" | "Fail" | "NA"
                          )
                        }
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="NA">N/A</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        className="form-input rounded-md w-full border-gray-300"
                        placeholder="Add comments"
                        value={item.comments || ""}
                        onChange={(e) => handleItemChange(item.id, "comments", e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="flex flex-wrap gap-2">
                          {item.images?.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative group border rounded-md overflow-hidden w-12 h-12"
                            >
                              <img
                                src={img}
                                alt={`${item.name} image ${idx}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveImage(item.id, idx)}
                              >
                                <Trash2 size={16} className="text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setActiveItem(item.id)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium flex items-center"
                      >
                        <Camera size={16} className="mr-1" />
                        Add Image
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {activeItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="font-medium text-lg mb-4">Add Images</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Images
                </label>
                <label className="cursor-pointer">
                  <div className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium flex items-center">
                    <Upload size={16} className="mr-1" />
                    Select Images
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const url = URL.createObjectURL(file);
                        handleAddImage(activeItem, url);
                      }
                    }}
                    multiple
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setActiveItem(null)} variant="secondary">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InspectionReportForm;
