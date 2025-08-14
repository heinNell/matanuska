import { Button } from "@/components/ui/Button";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { CalendarClock, MapPin, PlusCircle } from "lucide-react";
import React from "react";
import { TripForm } from "../../components/forms/trips/TripForm";

interface Trip {
  id: string;
  tripName: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

// Mock trips data
const mockTrips: Trip[] = [
  {
    id: "1",
    tripName: "Delivery to Cape Town Harbor",
    origin: "Johannesburg",
    destination: "Cape Town",
    startDate: "2023-10-15",
    endDate: "2023-10-16",
    tripType: "Delivery",
    status: "in-progress",
  },
  {
    id: "2",
    tripName: "Equipment Transfer",
    origin: "Durban",
    destination: "Pretoria",
    startDate: "2023-10-18",
    endDate: "2023-10-19",
    tripType: "Transfer",
    status: "scheduled",
  },
];

const TripDashboardPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [trips] = React.useState<Trip[]>(mockTrips);

  const handleTripSubmit = (tripData: any) => {
    console.log("Trip submitted:", tripData);
    // Here we would add the trip to Firestore
    setIsModalOpen(false);
  };
  // Get status badge color
  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trip Dashboard</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <PlusCircle size={16} />
          Add New Trip
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-3xl font-bold text-blue-600">
              {trips.filter((t) => t.status === "in-progress").length}
            </div>
            <div className="text-sm font-medium text-gray-500">Trips In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {trips.filter((t) => t.status === "scheduled").length}
            </div>
            <div className="text-sm font-medium text-gray-500">Scheduled Trips</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-3xl font-bold text-green-600">
              {trips.filter((t) => t.status === "completed").length}
            </div>
            <div className="text-sm font-medium text-gray-500">Completed This Week</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Active Trips</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{trip.tripName}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="mr-1" />
                      {trip.origin} to {trip.destination}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <CalendarClock size={14} className="mr-1" />
                      {trip.startDate} - {trip.endDate}
                    </div>
                  </div>
                  <div className={`${getStatusColor(trip.status)} text-xs px-2 py-1 rounded`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Trip">
        <TripForm onSubmit={handleTripSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default TripDashboardPage;
