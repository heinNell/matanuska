import React from "react";
import {
  Button,
  Card,
  CardContent,
  // If you aren’t using these, don’t import them from your barrel:
  // Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui";
import {
  FileWarning,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  ArrowRight,
  Wrench,
} from "lucide-react";

interface InspectionStatus {
  inspection: string;
  workOrder: string | null;
  completion: string | null;
}

interface InspectionDefects {
  repair: string[];
  replace: string[];
}

interface InspectionDetails {
  report: string;
  date: string;
  vehicle: string;
  vehicleName?: string;
  vin?: string;
  meterReading?: string;
  location: string;
  inspector: string;
  form: string;
  notes: string;
  faultCount: number;
  correctiveAction: "TAKEN" | "PENDING" | string;
  workOrder: string;
  defects?: InspectionDefects;
  status?: InspectionStatus;
}

interface InspectionDetailsModalProps {
  inspection: InspectionDetails;
  onClose: () => void;
  onViewWorkOrder?: (workOrderId: string) => void;
}

export default function InspectionDetailsModal({
  inspection,
  onClose,
  onViewWorkOrder,
}: InspectionDetailsModalProps) {
  const repairList = inspection.defects?.repair ?? [];
  const replaceList = inspection.defects?.replace ?? [];

  const handleViewWorkOrder = () => {
    if (inspection.status?.workOrder) {
      onViewWorkOrder?.(inspection.status.workOrder);
    } else if (inspection.workOrder) {
      onViewWorkOrder?.(inspection.workOrder);
    } else {
      // If you prefer, show a toast here
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Inspection Details: {inspection.report}</h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-6">
          {/* Top summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <FileText className="mr-2 h-5 w-5" /> Basic Information
                </h3>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Inspection Date" value={inspection.date} />
                  <InfoRow label="Vehicle" value={inspection.vehicle} />
                  {inspection.vehicleName && (
                    <InfoRow label="Vehicle Name" value={inspection.vehicleName} />
                  )}
                  {inspection.vin && <InfoRow label="VIN" value={inspection.vin} />}
                  {inspection.meterReading && (
                    <InfoRow label="Meter Reading" value={inspection.meterReading} />
                  )}
                  <InfoRow label="Location" value={inspection.location} />
                  <InfoRow label="Inspector" value={inspection.inspector} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" /> Status Information
                </h3>
                <div className="space-y-2 text-sm">
                  <InfoRow label="Form Type" value={inspection.form} />
                  <InfoRow
                    label="Fault Count"
                    value={
                      <span className="font-semibold text-red-600">{inspection.faultCount}</span>
                    }
                  />
                  <InfoRow
                    label="Work Order"
                    value={
                      <span className="text-blue-600 font-semibold">
                        {inspection.workOrder || "—"}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Corrective Action"
                    value={
                      <span
                        className={`font-semibold ${
                          inspection.correctiveAction === "TAKEN"
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {inspection.correctiveAction}
                      </span>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow */}
          {inspection.status && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3">Workflow Status</h3>
                <div className="flex items-center justify-between px-2 py-4 overflow-x-auto">
                  <Step
                    icon={<FileWarning className="h-6 w-6" />}
                    label="Inspection"
                    done={inspection.status.inspection === "COMPLETED"}
                    doneText="COMPLETED"
                  />
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  <Step
                    icon={<FileText className="h-6 w-6" />}
                    label="Work Order"
                    done={Boolean(inspection.status.workOrder)}
                    doneText={inspection.status.workOrder ?? "PENDING"}
                    color="blue"
                  />
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  <Step
                    icon={<Wrench className="h-6 w-6" />}
                    label="Repair"
                    done={inspection.correctiveAction === "TAKEN"}
                    doneText={inspection.correctiveAction === "TAKEN" ? "COMPLETED" : "PENDING"}
                  />
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                  <Step
                    icon={<CheckCircle className="h-6 w-6" />}
                    label="Closed"
                    done={Boolean(inspection.status.completion)}
                    doneText={inspection.status.completion ?? "PENDING"}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Inspector Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{inspection.notes}</p>
            </CardContent>
          </Card>

          {/* Defects */}
          {(repairList.length > 0 || replaceList.length > 0) && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                  Defect Items ({inspection.faultCount})
                </h3>

                {repairList.length > 0 && <ListBlock title="Repair Required" items={repairList} />}

                {replaceList.length > 0 && (
                  <ListBlock title="Replacements Required" items={replaceList} />
                )}

                {repairList.length === 0 && replaceList.length === 0 && (
                  <p className="text-gray-500 italic">No detailed defect information available</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Footer actions */}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleViewWorkOrder}>View Work Order</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small helpers to keep JSX clean ---------- */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      <span className="font-medium">{label}:</span>
      <span className="col-span-2">{value}</span>
    </div>
  );
}

function Step({
  icon,
  label,
  done,
  doneText,
  color = "green",
}: {
  icon: React.ReactNode;
  label: string;
  done: boolean;
  doneText: string;
  color?: "green" | "blue";
}) {
  const onCls = color === "blue" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600";
  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-full p-2 ${done ? onCls : "bg-gray-100 text-gray-400"}`}>{icon}</div>
      <span className="text-sm mt-1">{label}</span>
      <span className="text-xs text-gray-500">{doneText}</span>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-4">
      <h4 className="font-medium text-gray-800 mb-2">{title}:</h4>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, i) => (
          <li key={`${title}-${i}`} className="text-gray-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
