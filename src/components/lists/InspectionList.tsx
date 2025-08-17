import { Button } from "../../components/ui/Button";
import { collection, getDocs } from "firebase/firestore";
import { AlertTriangle, CheckCircle, Clock, Edit, Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import Card, { CardContent, CardHeader } from "../ui/Card";
import { Select } from "../ui/FormElements";
import Input from "../ui/Input";

interface Inspection {
  id: string;
  vehicleId: string;
  inspectorName: string;
  inspectionType: "daily" | "weekly" | "monthly" | "annual" | "pre_trip" | "post_trip";
  status: "pending" | "in_progress" | "completed" | "failed" | "requires_action";
  scheduledDate: string;
  completedDate?: string;
  durationMinutes?: number;
  defectsFound: number;
  criticalIssues: number;
  notes: string;
}

interface InspectionListProps {
  status?: string;
}

const InspectionList: React.FC<InspectionListProps> = ({ status }) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspections = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "inspections"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Inspection[];
        setInspections(data);
      } catch (error) {
        console.error("Error fetching inspections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, []);

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      inspection.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspectionType.toLowerCase().includes(searchTerm.toLowerCase());

    // Use status prop if provided, otherwise use filterStatus from local state
    const statusToFilter = status || filterStatus;
    const matchesStatus =
      statusToFilter === "all" || statusToFilter === "active"
        ? inspection.status === "pending" || inspection.status === "in_progress"
        : statusToFilter === "completed"
          ? inspection.status === "completed"
          : inspection.status === statusToFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <>
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> Completed
          </>
        );
      case "failed":
        return (
          <>
            <AlertTriangle className="w-4 h-4 text-red-500 mr-1" /> Failed
          </>
        );
      case "in_progress":
        return (
          <>
            <Clock className="w-4 h-4 text-yellow-500 mr-1" /> In Progress
          </>
        );
      case "pending":
        return (
          <>
            <Clock className="w-4 h-4 text-gray-500 mr-1" /> Pending
          </>
        );
      case "requires_action":
        return (
          <>
            <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" /> Requires Action
          </>
        );
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader
        title="Inspection List"
        action={
          <div className="flex items-center space-x-2 w-full">
            <Input
              placeholder="Search inspections..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
            <Select
              label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { label: "All Status", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "In Progress", value: "in_progress" },
                { label: "Completed", value: "completed" },
                { label: "Failed", value: "failed" },
                { label: "Requires Action", value: "requires_action" },
              ]}
            />
          </div>
        }
      />
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading inspections...</div>
        ) : filteredInspections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No inspections found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInspections.map((inspection) => (
              <div
                key={inspection.id}
                className={`p-4 rounded-lg border ${
                  inspection.status === "completed"
                    ? "bg-green-50 border-green-200"
                    : inspection.status === "failed"
                      ? "bg-red-50 border-red-200"
                      : inspection.status === "requires_action"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {inspection.inspectionType.replace("_", " ")} - Fleet {inspection.vehicleId}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="text-sm text-gray-500">Inspector</p>
                          <p className="font-medium">{inspection.inspectorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="text-sm text-gray-500">Scheduled Date</p>
                          <p className="font-medium">{inspection.scheduledDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium flex items-center">
                            {getStatusDisplay(inspection.status)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {(inspection.defectsFound > 0 || inspection.criticalIssues > 0) && (
                      <div className="mt-3 flex items-center space-x-4">
                        {inspection.defectsFound > 0 && (
                          <span className="text-sm text-red-600 font-medium">
                            {inspection.defectsFound} issues found
                          </span>
                        )}
                        {inspection.criticalIssues > 0 && (
                          <span className="text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
                            {inspection.criticalIssues} critical
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 md:mt-0 mt-4">
                    <Button size="sm" variant="outline" icon={<Eye className="w-4 h-4" />}>
                      View
                    </Button>
                    {inspection.status !== "completed" && (
                      <Button size="sm" variant="outline" icon={<Edit className="w-4 h-4" />}>
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InspectionList;
