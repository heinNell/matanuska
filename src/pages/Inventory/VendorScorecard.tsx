import { Button } from "../../components/ui/Button";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import SyncIndicator from "../../components/ui/SyncIndicator";
import { useAppContext } from "../../context/AppContext";

interface VendorScore {
  id: string;
  name: string;
  reliabilityScore: number;
  qualityScore: number;
  costScore: number;
  deliveryScore: number;
  overallScore: number;
  lastOrderDate: string;
  activeOrders: number;
}

const VendorScorecard: React.FC = () => {
  const { isLoading } = useAppContext();
  const [vendors, setVendors] = useState<VendorScore[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<VendorScore[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreThreshold, setScoreThreshold] = useState(70);
  const [sortField, setSortField] = useState<keyof VendorScore>("overallScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedVendor, setSelectedVendor] = useState<VendorScore | null>(null);

  // Mock data - in real app, this would come from Firestore
  useEffect(() => {
    // Simulate API call/Firestore fetch
    setTimeout(() => {
      const mockData: VendorScore[] = [
        {
          id: "v1",
          name: "Premium Parts Ltd",
          reliabilityScore: 92,
          qualityScore: 88,
          costScore: 78,
          deliveryScore: 94,
          overallScore: 88,
          lastOrderDate: "2023-10-15",
          activeOrders: 3,
        },
        {
          id: "v2",
          name: "AutoZone Supplies",
          reliabilityScore: 85,
          qualityScore: 90,
          costScore: 95,
          deliveryScore: 82,
          overallScore: 88,
          lastOrderDate: "2023-10-22",
          activeOrders: 1,
        },
        {
          id: "v3",
          name: "Truck Parts Express",
          reliabilityScore: 65,
          qualityScore: 72,
          costScore: 91,
          deliveryScore: 70,
          overallScore: 74,
          lastOrderDate: "2023-09-30",
          activeOrders: 0,
        },
        {
          id: "v4",
          name: "Fleet Maintenance Supplies",
          reliabilityScore: 78,
          qualityScore: 80,
          costScore: 83,
          deliveryScore: 76,
          overallScore: 79,
          lastOrderDate: "2023-10-18",
          activeOrders: 2,
        },
        {
          id: "v5",
          name: "Diesel Components Inc",
          reliabilityScore: 94,
          qualityScore: 96,
          costScore: 79,
          deliveryScore: 91,
          overallScore: 90,
          lastOrderDate: "2023-10-25",
          activeOrders: 4,
        },
      ];
      setVendors(mockData);
      setFilteredVendors(mockData);
    }, 1000);
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...vendors];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((v) => v.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Apply score threshold
    result = result.filter((v) => v.overallScore >= scoreThreshold);

    // Apply sorting
    result.sort((a, b) => {
      if (sortDirection === "asc") {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

    setFilteredVendors(result);
  }, [vendors, searchTerm, scoreThreshold, sortField, sortDirection]);

  const handleSort = (field: keyof VendorScore) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vendor Scorecard</h2>
        <SyncIndicator />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search vendors..."
                className="w-full p-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span>Minimum Score:</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(Number(e.target.value))}
                className="w-32"
              />
              <span className="w-10 text-center">{scoreThreshold}</span>
            </div>
            <Button>Export Report</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th
                      className="px-4 py-2 text-left cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Vendor Name
                    </th>
                    <th
                      className="px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleSort("reliabilityScore")}
                    >
                      Reliability
                    </th>
                    <th
                      className="px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleSort("qualityScore")}
                    >
                      Quality
                    </th>
                    <th
                      className="px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleSort("costScore")}
                    >
                      Cost
                    </th>
                    <th
                      className="px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleSort("deliveryScore")}
                    >
                      Delivery
                    </th>
                    <th
                      className="px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleSort("overallScore")}
                    >
                      Overall Score
                    </th>
                    <th
                      className="px-4 py-2 text-center cursor-pointer"
                      onClick={() => handleSort("activeOrders")}
                    >
                      Active Orders
                    </th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{vendor.name}</td>
                      <td
                        className={`px-4 py-2 text-center ${getScoreColor(vendor.reliabilityScore)}`}
                      >
                        {vendor.reliabilityScore}%
                      </td>
                      <td className={`px-4 py-2 text-center ${getScoreColor(vendor.qualityScore)}`}>
                        {vendor.qualityScore}%
                      </td>
                      <td className={`px-4 py-2 text-center ${getScoreColor(vendor.costScore)}`}>
                        {vendor.costScore}%
                      </td>
                      <td
                        className={`px-4 py-2 text-center ${getScoreColor(vendor.deliveryScore)}`}
                      >
                        {vendor.deliveryScore}%
                      </td>
                      <td
                        className={`px-4 py-2 text-center font-bold ${getScoreColor(vendor.overallScore)}`}
                      >
                        {vendor.overallScore}%
                      </td>
                      <td className="px-4 py-2 text-center">{vendor.activeOrders}</td>
                      <td className="px-4 py-2 text-center">
                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredVendors.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No vendors match your current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {selectedVendor && (
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <h3 className="text-lg font-medium">{selectedVendor.name} - Performance Details</h3>
              <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="mb-4 font-medium">Score History</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        category: "Reliability",
                        score: selectedVendor.reliabilityScore,
                        fill: "#10B981",
                      },
                      {
                        category: "Quality",
                        score: selectedVendor.qualityScore,
                        fill: "#3B82F6",
                      },
                      {
                        category: "Cost",
                        score: selectedVendor.costScore,
                        fill: "#8B5CF6",
                      },
                      {
                        category: "Delivery",
                        score: selectedVendor.deliveryScore,
                        fill: "#EC4899",
                      },
                      {
                        category: "Overall",
                        score: selectedVendor.overallScore,
                        fill: "#F59E0B",
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" name="Score (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="mb-4 font-medium">Vendor Information</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Last Order Date</p>
                      <p className="font-medium">{selectedVendor.lastOrderDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Orders</p>
                      <p className="font-medium">{selectedVendor.activeOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Overall Rating</p>
                      <p className={`font-medium ${getScoreColor(selectedVendor.overallScore)}`}>
                        {selectedVendor.overallScore}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p
                        className={`font-medium ${selectedVendor.overallScore >= 80 ? "text-green-500" : "text-yellow-500"}`}
                      >
                        {selectedVendor.overallScore >= 80 ? "Preferred Vendor" : "Standard Vendor"}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <h5 className="font-medium mb-2">Recommended Actions:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedVendor.reliabilityScore < 75 && (
                        <li className="text-sm">Schedule reliability improvement meeting</li>
                      )}
                      {selectedVendor.qualityScore < 75 && (
                        <li className="text-sm">Request quality improvement plan</li>
                      )}
                      {selectedVendor.costScore < 75 && (
                        <li className="text-sm">Negotiate better pricing structure</li>
                      )}
                      {selectedVendor.deliveryScore < 75 && (
                        <li className="text-sm">Discuss delivery performance issues</li>
                      )}
                      {Object.values(selectedVendor).every((val) =>
                        typeof val === "number" ? val >= 75 : true
                      ) && <li className="text-sm text-green-500">No immediate actions needed</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorScorecard;
