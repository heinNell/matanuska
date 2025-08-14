import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Edit,
  FileText,
  Filter,
  Plus,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import useOfflineQuery from "../../hooks/useOfflineQuery";
import Card, { CardContent, CardHeader } from "../ui/Card";

// Firestore license document shape (keep in sync with page version)
interface DriverLicenseDoc {
  id: string;
  driverId: string;
  driverName?: string;
  licenseNumber?: string;
  type?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: string;
  restrictions?: string[];
  documents?: string[];
}

const LicenseManagement: React.FC = () => {
  const { data: licenseData, loading, error } = useOfflineQuery<DriverLicenseDoc>("driverLicenses");
  const [filterStatus, setFilterStatus] = useState("all");

  const licenses: DriverLicenseDoc[] = useMemo(() => licenseData || [], [licenseData]);

  const filteredLicenses = useMemo(
    () => (filterStatus === "all" ? licenses : licenses.filter((l) => l.status === filterStatus)),
    [filterStatus, licenses]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </span>
        );
      case "expiring-soon":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Expiring Soon
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage driver licenses, renewals, and compliance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add License
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader title="License Database" />
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700 mr-2">Filter by status:</span>
              <select
                className="border border-gray-300 rounded-md text-sm py-1 px-3"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="expiring-soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search licenses..."
                className="border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Driver
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    License Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Issue Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Expiry Date
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-sm text-gray-500">
                      Loading licenses...
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-sm text-red-600">
                      Failed to load licenses: {error.message}
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  filteredLicenses.map((license) => (
                    <tr key={license.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {license.driverName || license.driverId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {license.licenseNumber || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {license.type || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {license.issueDate || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {license.expiryDate || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(license.status || "unknown")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FileText className="w-4 h-4 inline" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 ml-2">
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 ml-2">
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && !error && filteredLicenses.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No licenses found matching the current filter.</p>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{filteredLicenses.length}</span> of{" "}
              <span className="font-medium">{filteredLicenses.length}</span> licenses
            </p>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="License Statistics" />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total Licenses</span>
                <span className="text-lg font-bold">{licenses.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Active</span>
                <span className="text-lg font-bold text-green-600">
                  {licenses.filter((l) => l.status === "active").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Expiring Soon</span>
                <span className="text-lg font-bold text-yellow-600">
                  {licenses.filter((l) => l.status === "expiring-soon").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Expired</span>
                <span className="text-lg font-bold text-red-600">
                  {licenses.filter((l) => l.status === "expired").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Upcoming Renewals" />
          <CardContent>
            <ul className="space-y-3">
              {licenses
                .filter((license) => license.status === "expiring-soon")
                .map((license) => (
                  <li
                    key={license.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{license.driverName}</p>
                      <p className="text-sm text-gray-500">Expires: {license.expiryDate}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Renew
                    </Button>
                  </li>
                ))}
              {licenses.filter((license) => license.status === "expiring-soon").length === 0 && (
                <p className="text-gray-500 text-center py-4">No upcoming renewals</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="License Compliance" />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Compliance Rate</span>
                <span className="text-lg font-bold text-blue-600">
                  {licenses.length > 0
                    ? Math.round(
                        (licenses.filter((l) => l.status === "active").length / licenses.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">Active Licenses</span>
                  <span className="text-xs font-medium text-gray-500">
                    {licenses.filter((l) => l.status === "active").length}/{licenses.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${licenses.length > 0 ? (licenses.filter((l) => l.status === "active").length / licenses.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Compliance Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LicenseManagement;
