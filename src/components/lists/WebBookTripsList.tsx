import { Button } from "../../components/ui/Button";
import { Calendar, CheckCircle, Clock, DollarSign, Edit, MapPin, Truck, User } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { useWebBookTrips, WebBookTrip } from "../../hooks/useWebBookTrips";
import { Trip } from "../../types";
import { formatDateTime } from "../../utils/helpers";
import CompletedTripEditModal from "../Models/Trips/CompletedTripEditModal";
import Card, { CardContent, CardHeader } from "../ui/Card";
import ErrorMessage from "../ui/ErrorMessage";
import LoadingIndicator from "../ui/LoadingIndicator";

export default function WebBookTripsList() {
  const { trips, loading, error, activeTrips, deliveredTrips } = useWebBookTrips();
  const { updateTrip } = useAppContext();
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  // Convert WebBookTrip to Trip format expected by CompletedTripEditModal
  const convertToTripFormat = (webTrip: WebBookTrip): Trip => {
    const today: string = new Date().toISOString().split("T")[0] ?? new Date().toISOString();
    const startDate: string = webTrip.shippedDate ?? webTrip.startTime ?? today;
    const endDate: string = webTrip.deliveredDate ?? webTrip.endTime ?? today;
    return {
      id: webTrip.id,
      // Base trip details
      fleetNumber: webTrip.loadRef || `WB-${webTrip.id.substring(0, 6)}`,
      driverName: "Unknown", // Default value as WebBookTrip doesn't have driverName
      clientName: webTrip.customer,
      clientType: "external", // Default value
      route: `${webTrip.origin} to ${webTrip.destination}`,
      startDate,
      endDate,

      // Required fields with default values
      baseRevenue: 0, // Default value
      revenueCurrency: "ZAR", // Default value
      status: webTrip.deliveredStatus ? "completed" : "active",
      costs: [], // Empty array as default
      additionalCosts: [], // Empty array as default

      // Optional fields we can set
      distanceKm: webTrip.tripDurationHours ? webTrip.tripDurationHours * 60 : 0, // Rough estimate

      // Keep original web book data
      loadRef: webTrip.loadRef,
      customer: webTrip.customer,
      importSource: webTrip.importSource,
      importedAt: webTrip.importedAt,

      // Payment fields (required by type but can be defaulted)
      paymentStatus: "unpaid",
      followUpHistory: [],

      // Metadata
      createdAt: webTrip.updatedAt, // Use updateAt as fallback
      shippedAt: webTrip.shippedAt,
      deliveredAt: webTrip.deliveredAt,

      // Empty arrays for references that might be used
      editHistory: [],
    };
  };
  const handleSaveTrip = async (updatedTrip: any) => {
    try {
      await updateTrip(updatedTrip);
      // Refresh trips would happen automatically if real-time listeners are used
      setEditingTrip(null);
    } catch (error) {
      console.error("Error updating trip:", error);
      alert("Failed to update trip. Please try again.");
    }
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={`Error loading trips: ${error}`} />;
  if (trips.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No web book trips found in the system.</p>
        </CardContent>
      </Card>
    );
  }

  const StatusBadge = ({
    status,
    shipped,
    delivered,
  }: {
    status: string;
    shipped: boolean;
    delivered: boolean;
  }) => {
    if (delivered || status === "delivered") {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Delivered
        </span>
      );
    }
    if (shipped || status === "shipped") {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
          <Truck className="w-3 h-3" />
          In Transit
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Web Book Trips</p>
                <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active/In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{activeTrips.length}</p>
              </div>
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{deliveredTrips.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center">
        <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
        <div>
          <h3 className="text-sm font-medium text-blue-800">Add Costs to Web Book Trips</h3>
          <p className="text-sm text-blue-700">
            You can now edit web book trips to add additional costs. Click the Edit button on any
            trip to add or update costs.
          </p>
        </div>
      </div>

      {/* Trips Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Web Book Trips</h2>
          <p className="text-sm text-gray-600">Trips imported from the web booking system</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Load Ref
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipped
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trip.loadRef}</div>
                      <div className="text-xs text-gray-500">ID: {trip.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{trip.customer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{trip.origin}</div>
                        <div className="text-xs text-gray-500">↓ to</div>
                        <div>{trip.destination}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={trip.status}
                        shipped={trip.shippedStatus}
                        delivered={trip.deliveredStatus}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.shippedStatus ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {trip.shippedDate && (
                            <span>{formatDateTime(trip.shippedDate).split(" ")[0]}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not shipped</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.deliveredStatus ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {trip.deliveredDate && (
                            <span>{formatDateTime(trip.deliveredDate).split(" ")[0]}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not delivered</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.tripDurationHours ? (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {trip.tripDurationHours} hrs
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => setEditingTrip(convertToTripFormat(trip))}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingTrip && (
        <CompletedTripEditModal
          isOpen={!!editingTrip}
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
          onSave={handleSaveTrip}
        />
      )}
    </div>
  );
}
