import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from "../../components/ui/Button";
import { Truck, Search, Plus, Edit, Trash2, Filter, RefreshCw, Download, Loader } from "lucide-react";
import FleetFormModal from "../../components/Models/Trips/FleetFormModal";
import type { Fleet as FleetVehicle } from "../../components/Models/Trips/FleetFormModal";
import { useFleetData, Vehicle } from "../../hooks/useFleetData";

// Helper function to convert Vehicle type to FleetVehicle type
const convertVehicleToFleetVehicle = (vehicle: Vehicle): FleetVehicle => {
  return {
    fleetNumber: vehicle.fleetNumber,
    registration: vehicle.registration,
    make: vehicle.make,
    model: vehicle.model,
    chassisNo: vehicle.id, // Using id as chassisNo since it's required
    engineNo: vehicle.id, // Using id as engineNo since it's required
    vehicleType: vehicle.type || "Truck",
    status: vehicle.status || "Active",
    odometer: typeof vehicle.year === 'number' ? vehicle.year : 0, // Using year as odometer if available
  };
};

const FleetTable: React.FC = () => {
  // Fetch real fleet data from Firestore using the hook
  const { vehicles, loading, error } = useFleetData();

  // Convert Vehicle data to FleetVehicle format
  const fleetData = vehicles.map(convertVehicleToFleetVehicle);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    vehicleType: "",
    status: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFleet, setEditingFleet] = useState<FleetVehicle | null>(null);

  // Filter the fleet data
  const filteredFleet = fleetData.filter((vehicle) => {
    const matchesSearch = searchTerm
      ? vehicle.fleetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesVehicleType = filters.vehicleType
      ? vehicle.vehicleType === filters.vehicleType
      : true;

    const matchesStatus = filters.status ? vehicle.status === filters.status : true;

    return matchesSearch && matchesVehicleType && matchesStatus;
  });

  // Get unique values for filter dropdowns
  const vehicleTypes = Array.from(new Set(fleetData.map((v) => v.vehicleType)));
  const statuses = Array.from(new Set(fleetData.map((v) => v.status)));

  // Handle editing a fleet vehicle
  const handleEditVehicle = (fleet: FleetVehicle) => {
    setEditingFleet(fleet);
    setShowAddModal(true);
  };

  // Handle deleting a fleet vehicle
  const handleDeleteVehicle = (fleetNumber: string) => {
    if (confirm(`Are you sure you want to delete ${fleetNumber}? This action cannot be undone.`)) {
      // In a real implementation, we would call the Firestore delete API
      // For now, we just show an alert since we're using the read-only hook
      alert(`Vehicle ${fleetNumber} would be deleted (not implemented in this demo)`);
      // We would need to refresh the data after deletion
    }
  };

  // Handle saving a fleet vehicle
  const handleSaveVehicle = async (fleet: FleetVehicle) => {
    // In a real app, this would save to Firestore
    if (editingFleet) {
      // Update existing fleet
      setFleetData((prev) => prev.map((v) => (v.fleetNumber === fleet.fleetNumber ? fleet : v)));
    } else {
      // Add new fleet
      setFleetData((prev) => [...prev, fleet]);
    }

    // Return a resolved promise for the interface
    return Promise.resolve();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      vehicleType: "",
      status: "",
    });
  };

  // Export fleet data to CSV
  const exportFleetData = () => {
    // Create CSV content
    let csv =
      "Fleet Number,Registration,Make,Model,Chassis Number,Engine Number,Vehicle Type,Status,Odometer\n";

    filteredFleet.forEach((vehicle) => {
      csv += `${vehicle.fleetNumber},${vehicle.registration},${vehicle.make},${vehicle.model},${vehicle.chassisNo},${vehicle.engineNo || ""},${vehicle.vehicleType},${vehicle.status},${vehicle.odometer || ""}\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fleet_data_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Clean up
    document.body.removeChild(link);
  };

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mb-2" />
          <p className="text-gray-600">Loading fleet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <h3 className="text-lg font-medium">Error loading fleet data</h3>
        <p>{error}</p>
        <Button className="mt-2" variant="danger" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Truck className="w-6 h-6 mr-2 text-blue-600" />
          Fleet Management
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={exportFleetData}
          >
            Export
          </Button>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingFleet(null);
              setShowAddModal(true);
            }}
          >
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader title="Filter Fleet" />
        <CardContent>
          <CardTitle>Filter Fleet</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search fleet by number, registration, make or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={filters.vehicleType}
              onChange={(e) => setFilters((prev) => ({ ...prev, vehicleType: e.target.value }))}
            >
              <option value="">All Vehicle Types</option>
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              icon={<Filter className="w-3 h-3" />}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Table */}
      <Card>
        <CardHeader
          title={`Fleet Vehicles (${filteredFleet.length})`}
          action={
            <Button size="sm" variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
          }
        />
        <CardContent>
          <CardTitle>Fleet Vehicles</CardTitle>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fleet No.
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Registration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Make / Model
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Odometer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFleet.map((vehicle) => (
                  <tr key={vehicle.fleetNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicle.fleetNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.registration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.make} {vehicle.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.vehicleType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          vehicle.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : vehicle.status === "Maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {vehicle.odometer?.toLocaleString() || "N/A"} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="xs"
                          variant="outline"
                          icon={<Edit className="w-3 h-3" />}
                          onClick={() => handleEditVehicle(vehicle)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          icon={<Trash2 className="w-3 h-3" />}
                          onClick={() => handleDeleteVehicle(vehicle.fleetNumber)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredFleet.length === 0 && (
              <div className="text-center py-8">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No fleet vehicles</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filters.vehicleType || filters.status
                    ? "No vehicles match your filter criteria."
                    : "Get started by adding your first fleet vehicle."}
                </p>
                {!searchTerm && !filters.vehicleType && !filters.status && (
                  <div className="mt-6">
                    <Button
                      onClick={() => {
                        setEditingFleet(null);
                        setShowAddModal(true);
                      }}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add Vehicle
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fleet Form Modal */}
      <FleetFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingFleet(null);
        }}
        fleet={editingFleet}
        onSave={handleSaveVehicle}
      />
    </div>
  );
};

export default FleetTable;
