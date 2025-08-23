import { Button } from "../../../components/ui/Button";
import { AlertTriangle, ArrowLeft, Save, Trash2, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../../../components/ui/Card";

// Mock driver data - same as used in DriverDetails.tsx
const mockDrivers = [
  {
    id: "drv-001",
    name: "John Doe",
    email: "john.doe@matanuska.com",
    phone: "+233 20 123 4567",
    address: "123 Accra Road, Tema, Ghana",
    dateOfBirth: "1985-05-15",
    dateJoined: "2020-03-10",
    licenseNumber: "GH-DL-123456",
    licenseExpiry: "2026-03-14",
    licenseClass: "Commercial",
    status: "active",
    emergencyContact: {
      name: "Sarah Doe",
      relationship: "Spouse",
      phone: "+233 20 123 9876",
    },
    nationality: "Ghanaian",
    nationalId: "GHA-98765432",
    bankDetails: {
      bankName: "Ghana Commercial Bank",
      accountNumber: "1234567890",
      branch: "Accra Main",
    },
  },
  {
    id: "drv-002",
    name: "Jane Smith",
    email: "jane.smith@matanuska.com",
    phone: "+233 20 987 6543",
    address: "456 Kumasi Road, Accra, Ghana",
    dateOfBirth: "1990-08-22",
    dateJoined: "2021-02-15",
    licenseNumber: "GH-DL-789012",
    licenseExpiry: "2025-05-19",
    licenseClass: "Commercial",
    status: "active",
    emergencyContact: {
      name: "Robert Smith",
      relationship: "Father",
      phone: "+233 20 876 5432",
    },
    nationality: "Ghanaian",
    nationalId: "GHA-12345678",
    bankDetails: {
      bankName: "Ecobank Ghana",
      accountNumber: "0987654321",
      branch: "Kumasi Branch",
    },
  },
];

const EditDriver: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  interface DriverFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    licenseNumber: string;
    licenseExpiry: string;
    licenseClass: string;
    status: string;
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactPhone: string;
    nationality: string;
    nationalId: string;
    bankName: string;
    accountNumber: string;
    branch: string;
  }

  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    licenseNumber: "",
    licenseExpiry: "",
    licenseClass: "",
    status: "active",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    nationality: "",
    nationalId: "",
    bankName: "",
    accountNumber: "",
    branch: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const driver = mockDrivers.find((d) => d.id === id);
      if (driver) {
        setFormData({
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          address: driver.address,
          dateOfBirth: driver.dateOfBirth,
          licenseNumber: driver.licenseNumber,
          licenseExpiry: driver.licenseExpiry,
          licenseClass: driver.licenseClass,
          status: driver.status,
          emergencyContactName: driver.emergencyContact.name,
          emergencyContactRelationship: driver.emergencyContact.relationship,
          emergencyContactPhone: driver.emergencyContact.phone,
          nationality: driver.nationality,
          nationalId: driver.nationalId,
          bankName: driver.bankDetails.bankName,
          accountNumber: driver.bankDetails.accountNumber,
          branch: driver.bankDetails.branch,
        });
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      navigate(`/drivers/profiles/${id}`);
    }, 800);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!formData.name) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Driver not found. The ID "{id}" doesn't match any driver in our records.
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/drivers/profiles")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Drivers
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => navigate(`/drivers/profiles/${id}`)}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Driver Profile</h1>
            <p className="text-gray-600">
              {formData.name} (ID: {id})
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader title="Personal Information" />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    National ID
                  </label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* License & Emergency Contact */}
          <Card>
            <CardHeader title="License & Emergency Contact" />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Class
                  </label>
                  <input
                    type="text"
                    name="licenseClass"
                    value={formData.licenseClass}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload License Document
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="license-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="license-upload"
                          name="license-upload"
                          type="file"
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Contact</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Banking Details */}
        <div className="mt-6">
          <Card>
            <CardHeader title="Banking Details" />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/drivers/profiles/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button type="submit" className="flex items-center gap-2" disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditDriver;
