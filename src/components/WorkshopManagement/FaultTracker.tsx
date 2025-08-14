import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  Truck,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Search,
  Filter,
  Plus,
} from "lucide-react";
import FleetSelector from "../common/FleetSelector";

interface Fault {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "reported" | "diagnosed" | "in_progress" | "waiting_parts" | "completed";
  reportedBy: string;
  reportedAt: Timestamp;
  assignedTo?: string;
  completedAt?: Timestamp;
  notes?: string[];
}

const FaultTracker: React.FC = () => {
  const [faults, setFaults] = useState<Fault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingFault, setIsAddingFault] = useState(false);
  const [newFault, setNewFault] = useState({
    vehicleId: "",
    vehicleReg: "",
    description: "",
    priority: "medium" as Fault["priority"],
    status: "reported" as Fault["status"],
    reportedBy: "",
    notes: [],
  });

  // Fetch faults from Firestore
  useEffect(() => {
    const fetchFaults = async () => {
      try {
        setLoading(true);
        const faultsRef = collection(db, "faults");
        const q = query(faultsRef, orderBy("reportedAt", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedFaults = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Fault[];

        setFaults(fetchedFaults);
        setError(null);
      } catch (err) {
        console.error("Error fetching faults:", err);
        setError("Failed to load fault data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFaults();
  }, []);

  // Filter faults based on status, priority, and search query
  const filteredFaults = faults.filter((fault) => {
    const matchesStatus = filterStatus === "all" || fault.status === filterStatus;
    const matchesPriority = filterPriority === "all" || fault.priority === filterPriority;
    const matchesSearch =
      searchQuery === "" ||
      fault.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fault.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Add new fault to Firestore
  const handleAddFault = async () => {
    if (!newFault.vehicleReg || !newFault.description || !newFault.reportedBy) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const faultData = {
        ...newFault,
        reportedAt: Timestamp.now(),
      };

      const faultsRef = collection(db, "faults");
      await addDoc(faultsRef, faultData);

      setIsAddingFault(false);
      setNewFault({
        vehicleId: "",
        vehicleReg: "",
        description: "",
        priority: "medium",
        status: "reported",
        reportedBy: "",
        notes: [],
      });

      // Refetch faults to update the list
      const q = query(collection(db, "faults"), orderBy("reportedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const updatedFaults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Fault[];

      setFaults(updatedFaults);
    } catch (err) {
      console.error("Error adding fault:", err);
      setError("Failed to add new fault. Please try again.");
    }
  };

  // Update fault status
  const updateFaultStatus = async (faultId: string, newStatus: Fault["status"]) => {
    try {
      const faultRef = doc(db, "faults", faultId);

      const updates: {
        status: Fault["status"];
        completedAt?: Timestamp;
      } = { status: newStatus };

      // If marking as completed, add completedAt timestamp
      if (newStatus === "completed") {
        updates.completedAt = Timestamp.now();
      }

      await updateDoc(faultRef, updates);

      // Update local state
      setFaults(
        faults.map((fault) =>
          fault.id === faultId
            ? {
                ...fault,
                status: newStatus,
                ...(newStatus === "completed" ? { completedAt: Timestamp.now() } : {}),
              }
            : fault
        )
      );
    } catch (err) {
      console.error("Error updating fault status:", err);
      setError("Failed to update fault status. Please try again.");
    }
  };

  const getPriorityColor = (priority: Fault["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: Fault["status"]) => {
    switch (status) {
      case "reported":
        return "bg-red-100 text-red-800";
      case "diagnosed":
        return "bg-purple-100 text-purple-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "waiting_parts":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Fault["status"]) => {
    switch (status) {
      case "reported":
        return "Reported";
      case "diagnosed":
        return "Diagnosed";
      case "in_progress":
        return "In Progress";
      case "waiting_parts":
        return "Waiting Parts";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "N/A";
    return timestamp.toDate().toLocaleString();
  };

  function onClick(event: React.MouseEvent<HTMLButtonElement>): void {
    const buttonText = event.currentTarget.textContent?.trim();

    if (buttonText === "Report New Fault") {
      setIsAddingFault(true);
    } else if (buttonText === "Cancel") {
      setIsAddingFault(false);
      // Reset the form state
      setNewFault({
        vehicleId: "",
        vehicleReg: "",
        description: "",
        priority: "medium" as Fault["priority"],
        status: "reported" as Fault["status"],
        reportedBy: "",
        notes: [],
      });
      setError(null);
    } else if (buttonText === "Submit Fault") {
      handleAddFault();
    } else {
      // This is likely the "More" button with the MoreHorizontal icon
      // You could implement additional actions here, like viewing fault details
      console.log("More actions for fault clicked");
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <AlertTriangle className="mr-2 text-amber-500" size={24} />
          Fault Tracker
        </h1>

        <button
          onClick={onClick}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={20} className="mr-1" />
          {isAddingFault ? "Cancel" : "Report New Fault"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isAddingFault && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Report New Fault</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle*</label>
              <FleetSelector
                value={newFault.vehicleReg}
                onChange={(value) =>
                  setNewFault({ ...newFault, vehicleReg: value, vehicleId: value })
                }
                placeholder="Select vehicle"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reported By*</label>
              <input
                type="text"
                value={newFault.reportedBy}
                onChange={(e) => setNewFault({ ...newFault, reportedBy: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newFault.priority}
                onChange={(e) =>
                  setNewFault({ ...newFault, priority: e.target.value as Fault["priority"] })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newFault.status}
                onChange={(e) =>
                  setNewFault({ ...newFault, status: e.target.value as Fault["status"] })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="reported">Reported</option>
                <option value="diagnosed">Diagnosed</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_parts">Waiting Parts</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
              <textarea
                value={newFault.description}
                onChange={(e) => setNewFault({ ...newFault, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Describe the fault in detail..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClick}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onClick}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Submit Fault
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Filter and Search controls */}
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vehicle or description..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="diagnosed">Diagnosed</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_parts">Waiting Parts</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Faults Table */}
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredFaults.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="mx-auto mb-2" size={24} />
            <p>No faults found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicle
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reported
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFaults.map((fault) => (
                  <tr key={fault.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Truck className="mr-2 text-gray-500" size={16} />
                        <div className="font-medium text-gray-900">{fault.vehicleReg}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{fault.description}</div>
                      <div className="text-xs text-gray-500">Reported by: {fault.reportedBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(fault.priority)}`}
                      >
                        {fault.priority.charAt(0).toUpperCase() + fault.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fault.status)}`}
                      >
                        {getStatusLabel(fault.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(fault.reportedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <select
                          onChange={(e) =>
                            updateFaultStatus(fault.id, e.target.value as Fault["status"])
                          }
                          value={fault.status}
                          className="border border-gray-300 rounded-md text-sm px-2 py-1"
                        >
                          <option value="reported">Reported</option>
                          <option value="diagnosed">Diagnosed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="waiting_parts">Waiting Parts</option>
                          <option value="completed">Completed</option>
                        </select>

                        <button className="text-gray-500 hover:text-gray-700" onClick={onClick}>
                          <MoreHorizontal size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Tip: Add detailed notes when reporting faults to help mechanics diagnose issues more
              quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaultTracker;
