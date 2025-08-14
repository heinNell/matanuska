import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
  Truck,
} from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import useOfflineQuery from "../../hooks/useOfflineQuery";

// Driver document interface (trimmed to fields we display)
interface DriverDoc {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  dateJoined?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseClass?: string;
  status?: string;
  vehicles?: string[];
  performance?: {
    rating?: number;
    tripsCompleted?: number;
    kmDriven?: number;
    fuelEfficiency?: number;
    incidents?: number;
    safetyScore?: number;
    avgTripTime?: number;
  };
  certifications?: { name?: string; issueDate?: string; expiry?: string; status?: string }[];
  recentTrips?: {
    id: string;
    date?: string;
    route?: string;
    distance?: number;
    duration?: string;
  }[];
  documents?: { id: string; name?: string; type?: string; uploadDate?: string }[];
}

const DriverDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: drivers, loading, error } = useOfflineQuery<DriverDoc>("drivers");
  const driver: DriverDoc | undefined = useMemo(
    () => (drivers || []).find((d) => d.id === id),
    [drivers, id]
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Failed to load driver: {error.message}</p>
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

  if (!driver) {
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
          <Button variant="outline" onClick={() => navigate("/drivers/profiles")} className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{driver.name || driver.id}</h1>
            <p className="text-gray-600">Driver ID: {driver.id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Export Profile
          </Button>
          <Button
            onClick={() => navigate(`/drivers/profiles/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Info */}
        <Card>
          <CardHeader title="Driver Information" />
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {(driver.name || driver.id || "?")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">{driver.name}</h3>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {driver.status === "active" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {(driver.status || "unknown").charAt(0).toUpperCase() +
                      (driver.status || "unknown").slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center py-2">
                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm">{driver.phone || "—"}</span>
              </div>
              <div className="flex items-center py-2">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm">{driver.email || "—"}</span>
              </div>
              <div className="flex items-center py-2">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm">{driver.address || "—"}</span>
              </div>
              <div className="flex items-center py-2">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm">Birth Date: {driver.dateOfBirth || "—"}</span>
              </div>
              <div className="flex items-center py-2">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm">Joined: {driver.dateJoined || "—"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Vehicles</h4>
              <div className="flex flex-wrap gap-2">
                {(driver.vehicles || []).map((vehicle: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    <Truck className="w-3 h-3 mr-1" />
                    {vehicle}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* License Info */}
        <Card>
          <CardHeader title="License Information" />
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-blue-800">License Number</span>
                <span className="text-sm font-bold">{driver.licenseNumber || "—"}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-blue-800">Class</span>
                <span className="text-sm">{driver.licenseClass || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-blue-800">Expires</span>
                <span className="text-sm">{driver.licenseExpiry || "—"}</span>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Certifications</h4>
              <ul className="space-y-3">
                {(driver.certifications || []).map((cert: any, index: number) => (
                  <li key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{cert.name}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          cert.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {cert.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Issued: {cert.issueDate} • Expires: {cert.expiry}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Documents</h4>
              <ul className="space-y-2">
                {(driver.documents || []).map((doc: any) => (
                  <li key={doc.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      {doc.name}
                    </span>
                    <span className="text-blue-600 hover:underline cursor-pointer">View</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader title="Performance & Safety" />
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-blue-700">
                  {driver.performance?.safetyScore ?? "—"}
                </span>
                <span className="text-xs text-blue-500">Safety Score</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Rating</div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="font-semibold">{driver.performance?.rating ?? "—"}/5</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Trips</div>
                <div className="flex items-center">
                  <Truck className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="font-semibold">{driver.performance?.tripsCompleted ?? "—"}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Distance</div>
                <div className="flex items-center">
                  <span className="font-semibold">
                    {driver.performance?.kmDriven?.toLocaleString() ?? "—"} km
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Fuel Efficiency</div>
                <div className="flex items-center">
                  <span className="font-semibold">
                    {driver.performance?.fuelEfficiency ?? "—"} L/100km
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Incidents</div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="font-semibold">{driver.performance?.incidents ?? "—"}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Avg Trip Time</div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="font-semibold">
                    {driver.performance?.avgTripTime ?? "—"} hrs
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Trips</h4>
              <ul className="space-y-2">
                {(driver.recentTrips || []).map((trip: any) => (
                  <li key={trip.id} className="border-l-2 border-blue-500 pl-3 py-1">
                    <div className="text-sm font-medium">{trip.route}</div>
                    <div className="text-xs text-gray-500">
                      {trip.date} • {trip.distance} km • {trip.duration}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-center">
                <Button variant="outline" size="sm" className="w-full">
                  View All Trips
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader title="Activity Timeline" />
          <CardContent>
            <div className="flow-root">
              <ul className="-mb-8">
                <li className="relative pb-8">
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  ></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <Truck className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-800">
                          Completed trip <span className="font-medium">Accra to Kumasi</span>
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Jul 15, 2025</time>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="relative pb-8">
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  ></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <FileText className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-800">Updated driver documentation</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Jul 10, 2025</time>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="relative">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                        <Shield className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-800">Completed safety training</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Jul 5, 2025</time>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" size="sm">
                View Full History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverDetails;
