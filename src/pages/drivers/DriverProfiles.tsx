import { AlertCircle, Download, Filter, Search, UserPlus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui";
import { useFirestoreQuery } from "../../hooks/useFirestoreQuery";
import { Driver } from "../../types/driver";

/**
 * Driver Profiles Page
 * Shows a list of all drivers from Firestore with filtering and search capabilities.
 */
const DriverProfiles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch drivers from Firestore using the custom hook
  const { data: drivers, loading, error } = useFirestoreQuery<Driver>("drivers");

  // Small util for flexible date parsing (supports ISO and DD/MM/YYYY)
  const parseDate = (dateLike: any): Date | null => {
    if (!dateLike) return null;
    if (typeof dateLike === "object" && typeof dateLike.toDate === "function") {
      try {
        return dateLike.toDate();
      } catch {}
    }
    if (typeof dateLike === "string") {
      const iso = new Date(dateLike);
      if (!Number.isNaN(iso.getTime())) return iso;
      const m = dateLike.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m) {
        const [, dd, mm, yyyy] = m;
        const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        if (!Number.isNaN(d.getTime())) return d;
      }
    }
    return null;
  };

  // Normalize name and filter list
  const filteredDrivers = useMemo(() => {
    const list = (drivers || []).map((d: any) => {
      const nameFromFirstLast = [d.firstName, d.lastName].filter(Boolean).join(" ");
      const nameFromNameSurname = [d.name, d.surname].filter(Boolean).join(" ");
      const displayName = nameFromFirstLast || nameFromNameSurname || d.id;
      return { ...d, displayName };
    });

    return list.filter((driver: any) => {
      const search = searchTerm.toLowerCase();
      const id = (driver.id || "").toLowerCase();
      const status = (driver.status || "").toLowerCase();
      const display = (driver.displayName || "").toLowerCase();

      const matchesSearch = display.includes(search) || id.includes(search);
      const matchesStatus = filterStatus === "all" || status === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, filterStatus]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-3">
            <div
              className="h-12 w-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"
              aria-label="Loading drivers"
            />
            <p className="text-sm text-gray-500">Loading drivers...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load driver profiles. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    if (filteredDrivers.length === 0) {
      return (
        <div className="text-center text-gray-500 p-4">
          <p>No drivers found matching your criteria.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto mt-4">
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
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                License Expiry
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Safety Score
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Location
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
            {filteredDrivers.map((driver: any) => {
              const today = new Date();
              const expiryDate = parseDate(driver.licenseExpiry);
              const daysUntilExpiry = expiryDate
                ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {driver.displayName}
                        </div>
                        <div className="text-sm text-gray-500">{driver.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : driver.status === "Inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {expiryDate ? expiryDate.toLocaleDateString() : "—"}
                    </div>
                    {daysUntilExpiry !== null && (
                      <div
                        className={`text-xs ${
                          daysUntilExpiry < 30
                            ? "text-red-600 font-medium"
                            : daysUntilExpiry < 60
                              ? "text-amber-600"
                              : "text-gray-500"
                        }`}
                      >
                        {daysUntilExpiry < 0
                          ? "Expired"
                          : daysUntilExpiry === 0
                            ? "Expires today"
                            : `${daysUntilExpiry} days left`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            driver.safetyScore >= 90
                              ? "bg-green-500"
                              : driver.safetyScore >= 80
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${driver.safetyScore}%` }}
                         />
                      </div>
                      <span className="ml-2 text-sm text-gray-700">{driver.safetyScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/drivers/profiles/${driver.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </Link>
                    <Link
                      to={`/drivers/edit/${driver.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Driver Profiles</h2>
        <Link
          to="/drivers/add"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Driver
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on leave">On Leave</option>
              </select>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50">
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>
          </div>
        </div>

        {renderContent()}

        {/* Pagination (static for now, can be enhanced later) */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredDrivers.length}</span> of{" "}
                <span className="font-medium">{filteredDrivers.length}</span> results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfiles;
