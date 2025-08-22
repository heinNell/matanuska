import { Button } from "../../components/ui/Button";
import { Calendar, CheckCircle, Clock, Filter, Plus, Search, User } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";

// Mock training data
const mockTrainings = [
  {
    id: "tr-001",
    driverId: "drv-001",
    driverName: "John Doe",
    title: "Defensive Driving",
    type: "Safety",
    provider: "Road Safety Ghana",
    completedDate: "2023-02-15",
    expiryDate: "2025-02-15",
    score: 92,
    certificateId: "DD-GH-1234",
    status: "completed",
    required: true,
  },
  {
    id: "tr-002",
    driverId: "drv-002",
    driverName: "Jane Smith",
    title: "Hazardous Material Handling",
    type: "Compliance",
    provider: "Ghana Transportation Authority",
    completedDate: "2023-04-20",
    expiryDate: "2025-04-20",
    score: 88,
    certificateId: "HMH-GH-5678",
    status: "completed",
    required: true,
  },
  {
    id: "tr-003",
    driverId: "drv-003",
    driverName: "Michael Johnson",
    title: "Fuel Efficiency Techniques",
    type: "Operation",
    provider: "Matanuska Training Dept.",
    completedDate: "2023-06-10",
    expiryDate: null,
    score: 95,
    certificateId: "FE-MT-9101",
    status: "completed",
    required: false,
  },
  {
    id: "tr-004",
    driverId: "drv-001",
    driverName: "John Doe",
    title: "First Aid and Emergency Response",
    type: "Safety",
    provider: "Ghana Red Cross",
    completedDate: "2022-11-05",
    expiryDate: "2024-11-05",
    score: 90,
    certificateId: "FA-RC-1122",
    status: "completed",
    required: true,
  },
  {
    id: "tr-005",
    driverId: "drv-004",
    driverName: "Sarah Williams",
    title: "Customer Service Excellence",
    type: "Soft Skills",
    provider: "Matanuska Training Dept.",
    completedDate: null,
    expiryDate: null,
    score: null,
    certificateId: null,
    status: "scheduled",
    scheduledDate: "2023-09-15",
    required: false,
  },
  {
    id: "tr-006",
    driverId: "drv-002",
    driverName: "Jane Smith",
    title: "Advanced Navigation Systems",
    type: "Technical",
    provider: "Tech Solutions Ghana",
    completedDate: "2023-01-30",
    expiryDate: null,
    score: 85,
    certificateId: "ANS-TS-3344",
    status: "completed",
    required: false,
  },
  {
    id: "tr-007",
    driverId: "drv-005",
    driverName: "Robert Brown",
    title: "Defensive Driving",
    type: "Safety",
    provider: "Road Safety Ghana",
    completedDate: null,
    expiryDate: null,
    score: null,
    certificateId: null,
    status: "expired",
    required: true,
  },
];

const TrainingRecords: React.FC = () => {
  const [trainings] = useState(mockTrainings);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Filter trainings based on status filter
  const filteredTrainings =
    selectedStatus === "all"
      ? trainings
      : trainings.filter((training) => training.status === selectedStatus);

  // Get counts for dashboard
  const completedCount = trainings.filter((t) => t.status === "completed").length;
  const scheduledCount = trainings.filter((t) => t.status === "scheduled").length;
  const expiredCount = trainings.filter((t) => t.status === "expired").length;
  const requiredCount = trainings.filter((t) => t.required).length;

  // Function to determine status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </span>
        );
      case "scheduled":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
            <Calendar className="h-3 w-3 mr-1" /> Scheduled
          </span>
        );
      case "in-progress":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </span>
        );
      case "expired":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Expired</span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Driver Training Records</h1>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600">Completed Trainings</p>
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600">Scheduled Trainings</p>
              <p className="text-3xl font-bold text-blue-600">{scheduledCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600">Expired Certifications</p>
              <p className="text-3xl font-bold text-red-600">{expiredCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600">Required Trainings</p>
              <p className="text-3xl font-bold text-gray-900">{requiredCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Records Table */}
      <Card>
        <CardHeader title="Training Records" />
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="relative w-full md:w-96 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Search trainings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Add Training
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Training
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrainings.map((training) => (
                  <tr key={training.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {training.driverName}
                          </div>
                          <div className="text-xs text-gray-500">ID: {training.driverId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{training.title}</div>
                      <div className="text-xs text-gray-500">Provider: {training.provider}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {training.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(training.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {training.status === "completed" ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {training.completedDate
                              ? new Date(training.completedDate).toLocaleDateString()
                              : "-"}
                          </div>
                          {training.expiryDate && (
                            <div className="text-xs text-gray-500">
                              Expires:{" "}
                              {training.expiryDate
                                ? new Date(training.expiryDate).toLocaleDateString()
                                : "-"}
                            </div>
                          )}
                        </div>
                      ) : training.status === "scheduled" ? (
                        <div className="text-sm text-gray-900">
                          {training.scheduledDate
                            ? new Date(training.scheduledDate).toLocaleDateString()
                            : "-"}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {training.score !== null ? (
                        <div className="text-sm font-medium">{training.score}%</div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`View details for ${training.title}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Trainings */}
      <Card>
        <CardHeader title="Upcoming Trainings" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTrainings
              .filter((training) => training.status === "scheduled")
              .map((training) => (
                <div key={`upcoming-${training.id}`} className="border rounded-lg p-4">
                  <div className="text-lg font-medium text-gray-900 mb-1">{training.title}</div>
                  <div className="text-sm text-gray-600 mb-2">For: {training.driverName}</div>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {training.scheduledDate
                        ? new Date(training.scheduledDate).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs ${training.required ? "text-red-600" : "text-gray-500"}`}
                    >
                      {training.required ? "Required" : "Optional"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`View details for ${training.title}`)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}

            {!mockTrainings.some((training) => training.status === "scheduled") && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No upcoming trainings scheduled
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingRecords;
