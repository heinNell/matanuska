import { Button } from "../../components/ui/Button";
import { Filter, PlusCircle, Search, User } from "lucide-react";
import React, { useState } from "react";
import DriverForm from "../../components/forms/driver/DriverForm";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { DriverData } from "../../hooks/useDriverFormData";

// Mock data for drivers
const mockDrivers = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    idNumber: "8212155062089",
    employeeNumber: "DR001",
    phone: "082-555-1234",
    dateHired: "2020-05-01",
    licenseInfo: {
      number: "DL12345",
      expiry: "2025-06-15",
      categories: ["B", "C"],
      status: "valid",
      country: "South Africa",
    },
    status: "active",
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Wife",
      phone: "082-555-5678",
    },
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Smith",
    idNumber: "9005060012083",
    employeeNumber: "DR002",
    phone: "083-555-5678",
    dateHired: "2021-03-15",
    licenseInfo: {
      number: "DL67890",
      expiry: "2023-08-01",
      categories: ["A", "B"],
      status: "expired",
      country: "South Africa",
    },
    status: "inactive",
    emergencyContact: {
      name: "Mike Smith",
      relationship: "Husband",
      phone: "083-555-1234",
    },
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Johnson",
    idNumber: "8707125062089",
    employeeNumber: "DR003",
    phone: "084-555-9012",
    dateHired: "2019-11-01",
    licenseInfo: {
      number: "DL24680",
      expiry: "2024-11-30",
      categories: ["B", "C", "D"],
      status: "valid",
      country: "South Africa",
    },
    status: "on-leave",
  },
];

const DriverManagementPage: React.FC = () => {
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drivers, setDrivers] = useState(mockDrivers);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverData | null>(null);

  // Filter drivers based on search query and status filter
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddDriver = async (driverData: DriverData): Promise<void> => {
    setErrorMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      if (selectedDriver) {
        // Edit existing driver
        setDrivers((prevDrivers) =>
          prevDrivers.map((d) => (d.id === selectedDriver.id ? { ...d, ...driverData } : d))
        );
      } else {
        // Add new driver
        const newDriver = { ...driverData, id: String(drivers.length + 1) }; // Simple ID generation
        setDrivers((prevDrivers) => [...prevDrivers, newDriver]);
      }

      setSubmitSuccess(true);
      setShowDriverForm(false);

      setTimeout(() => {
        setSubmitSuccess(null);
      }, 5000);
    } catch (error) {
      console.error("Error adding/editing driver:", error);
      setErrorMessage("Failed to save driver. Please try again.");
      setSubmitSuccess(false);
    }
  };
  const handleEditDriver = (driver: any) => {
    setSelectedDriver(driver);
    setShowDriverForm(true);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "on-leave":
        return "bg-blue-100 text-blue-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get license status badge color
  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6" /> Driver Management
        </h1>

        <Button
          onClick={() => {
            setSelectedDriver(null);
            setShowDriverForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-1"
        >
          <PlusCircle size={16} />
          Add New Driver
        </Button>
      </div>

      {/* Success message */}
      {submitSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-green-700">
                Driver was {selectedDriver ? "updated" : "added"} successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and filter section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or employee number"
                className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="md:w-1/4 flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers list */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Drivers</h2>
        </CardHeader>
        <CardContent>
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No drivers found</p>
              <p className="text-sm mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try changing your search or filter criteria"
                  : "Start by adding a new driver"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="py-4 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => handleEditDriver(driver)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">
                        {driver.firstName} {driver.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Employee #{driver.employeeNumber} • {driver.phone}
                      </p>
                      <div className="flex mt-2 gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${getStatusColor(driver.status)}`}
                        >
                          {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getLicenseStatusColor(driver.licenseInfo.status)}`}
                        >
                          License:{" "}
                          {driver.licenseInfo.status.charAt(0).toUpperCase() +
                            driver.licenseInfo.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="text-right">
                        <span className="font-medium">License #{driver.licenseInfo.number}</span>
                      </div>
                      <div className="text-gray-500">
                        Expires: {new Date(driver.licenseInfo.expiry).toLocaleDateString()}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1 justify-end">
                        {driver.licenseInfo.categories.map((category, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Driver form modal */}
      <Modal
        isOpen={showDriverForm}
        onClose={() => setShowDriverForm(false)}
        title={selectedDriver ? "Edit Driver" : "Add New Driver"}
        maxWidth="2xl"
      >
        <DriverForm
          onSubmit={handleAddDriver}
          onCancel={() => setShowDriverForm(false)}
          initialData={selectedDriver || undefined}
          driverId={selectedDriver?.id}
          isModal
        />
      </Modal>
    </div>
  );
};

export default DriverManagementPage;
