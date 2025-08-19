import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { firestore } from "../../firebase";
import { useNavigate, useSearchParams } from "react-router-dom";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  ClipboardList,
  ArrowLeft,
  FileSearch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface InspectionItem {
  name: string;
  status: "passed" | "failed" | null;
  comments: string;
}

interface Inspection {
  id: string;
  driverName: string;
  fleetNumber: string;
  registration: string;
  make: string;
  model: string;
  inspectionItems: InspectionItem[];
  additionalComments: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
}

const InspectionHistory: React.FC = () => {
  const [searchParams] = useSearchParams();
  const fleetNumber = searchParams.get("fleet");
  const navigate = useNavigate();

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        setLoading(true);

        let inspectionsQuery;
        if (fleetNumber) {
          inspectionsQuery = query(
            collection(firestore, "inspections"),
            where("fleetNumber", "==", fleetNumber),
            orderBy("timestamp", "desc")
          );
        } else {
          inspectionsQuery = query(
            collection(firestore, "inspections"),
            orderBy("timestamp", "desc")
          );
        }

        const snapshot = await getDocs(inspectionsQuery);
        const inspectionData: Inspection[] = [];

        snapshot.forEach((doc) => {
          inspectionData.push({
            id: doc.id,
            ...(doc.data() as Omit<Inspection, 'id'>),
          } as Inspection);
        });

        setInspections(inspectionData);
      } catch (error) {
        console.error("Error fetching inspections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [fleetNumber]);

  const formatDate = (timestamp: { seconds: number }) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  const getStatusCounts = (items: InspectionItem[]) => {
    let passed = 0;
    let failed = 0;

    items.forEach((item) => {
      if (item.status === "passed") passed++;
      if (item.status === "failed") failed++;
    });

    return { passed, failed };
  };

  const getStatusIcon = (items: InspectionItem[]) => {
    const { failed } = getStatusCounts(items);

    if (failed > 0) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  };

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
    const buttonText = event.currentTarget.textContent?.trim();

    if (buttonText === "Back to Workshop") {
      navigate("/workshop");
    } else if (buttonText === "Back to List") {
      setSelectedInspection(null);
    } else if (buttonText === "View Details") {
      // Find the inspection associated with this button
      const row = event.currentTarget.closest("tr");
      if (row) {
        const index = Array.from(row.parentElement?.children || []).indexOf(row);
        if (index !== -1 && inspections[index]) {
          setSelectedInspection(inspections[index]);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Driver Inspection History">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              <h2 className="text-xl font-bold">
                {fleetNumber ? `Inspections for ${fleetNumber}` : "All Inspections"}
              </h2>
            </div>
            <Button variant="outline" className="flex items-center gap-1" onClick={onClick}>
              <ArrowLeft className="w-4 h-4" />
              Back to Workshop
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-8">
              <FileSearch className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No inspection records found</h3>
              <p className="text-gray-600 mt-1">
                {fleetNumber
                  ? `No inspections have been recorded for vehicle ${fleetNumber} yet.`
                  : "No driver inspections have been recorded yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedInspection ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Inspection Details</h3>
                    <Button variant="outline" onClick={onClick} className="text-sm">
                      Back to List
                    </Button>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold mb-2">Inspection Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Driver</p>
                        <p className="text-base">{selectedInspection.driverName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date & Time</p>
                        <p className="text-base">{formatDate(selectedInspection.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Fleet Number</p>
                        <p className="text-base">{selectedInspection.fleetNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Registration</p>
                        <p className="text-base">{selectedInspection.registration}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Make</p>
                        <p className="text-base">{selectedInspection.make}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Model</p>
                        <p className="text-base">{selectedInspection.model}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Inspection Items</h3>
                    <div className="space-y-4">
                      {selectedInspection.inspectionItems.map((item, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.name}</span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                item.status === "passed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.status === "passed" ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              {item.status === "passed" ? "Pass" : "Fail"}
                            </span>
                          </div>

                          {item.status === "failed" && item.comments && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700">Comments:</p>
                              <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                                {item.comments}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedInspection.additionalComments && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Additional Comments</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-gray-700">{selectedInspection.additionalComments}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Driver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fleet Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Results
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inspections.map((inspection) => {
                        const { passed, failed } = getStatusCounts(inspection.inspectionItems);
                        return (
                          <tr key={inspection.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusIcon(inspection.inspectionItems)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{inspection.driverName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{inspection.fleetNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {inspection.make} {inspection.model}
                              </div>
                              <div className="text-sm text-gray-500">{inspection.registration}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(inspection.timestamp)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {passed} Passed
                                </span>
                                {failed > 0 && (
                                  <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                    {failed} Failed
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="outline" size="sm" onClick={onClick}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InspectionHistory;
