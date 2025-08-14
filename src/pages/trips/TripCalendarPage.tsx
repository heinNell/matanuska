import { Button } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CardContent from "@/components/ui/CardContent";
import { db } from "@/firebase";
import { addWeeks, endOfWeek, format, isValid, parseISO, startOfWeek, subWeeks } from "date-fns";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  Flag,
  Search,
  Truck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Timeline, {
  DateHeader,
  SidebarHeader,
  TimelineHeaders,
  TimelineMarkers,
} from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";

interface Vehicle {
  id: string;
  title: string;
  fleetNumber?: string;
  registration?: string;
  group?: string;
}

interface Trip {
  id: string;
  group: string;
  title: string;
  start_time: number;
  end_time: number;
  color?: string;
  type?: string;
  status?: string;
  fleetNumber?: string;
  clientName?: string;
  route?: string;
  driverName?: string;
  background?: string;
  fromFirestore?: boolean;
  origin?: string;
  destination?: string;
  driver?: string;
  itemProps?: {
    className?: string;
    style?: Record<string, string | number>;
  };
}

const TYPE_COLORS: Record<string, string> = {
  Retail: "#f59e42",
  Vendor: "#22c55e",
  Maintenance: "#f87171",
  Empty: "#a3a3a3",
  Lime: "#84cc16",
  active: "#3b82f6",
  in_progress: "#3b82f6",
  completed: "#10b981",
  invoiced: "#f59e0b",
  paid: "#6366f1",
  delayed: "#f59e0b",
  cancelled: "#ef4444",
};

function getTripColor(type: string) {
  return TYPE_COLORS[type] || "#64748b";
}

// NOTE: This file is the TripCalendarPage; rename component accordingly to avoid confusion with TripTimelinePage
const TripCalendarPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfWeek(addWeeks(new Date(), 1)));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineMode, setTimelineMode] = useState<"week" | "month">("week");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const visibleTimeStart = startDate.getTime();
  const visibleTimeEnd = endDate.getTime();

  useEffect(() => {
    async function fetchTrips() {
      try {
        setLoading(true);

        const tripsQuery = query(collection(db, "trips"), orderBy("startDate", "desc"), limit(100));

        const snap = await getDocs(tripsQuery);

        const tripDocs = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

        const vehicleMap: Record<string, Vehicle> = {};

        const tripItems: Trip[] = tripDocs.map((trip) => {
          const groupId = trip.fleetNumber || trip.vehicleId || "unknown";

          if (!vehicleMap[groupId]) {
            vehicleMap[groupId] = {
              id: groupId,
              title: trip.fleetNumber || trip.vehicleName || groupId,
              fleetNumber: trip.fleetNumber,
              registration: trip.registration,
            };
          }

          let startTime: number, endTime: number;
          if (trip.startDate && isValid(parseISO(trip.startDate))) {
            startTime = parseISO(trip.startDate).getTime();
          } else if (trip.startTime && isValid(parseISO(trip.startTime))) {
            startTime = parseISO(trip.startTime).getTime();
          } else {
            startTime = Date.now();
          }

          if (trip.endDate && isValid(parseISO(trip.endDate))) {
            endTime = parseISO(trip.endDate).getTime();
          } else if (trip.endTime && isValid(parseISO(trip.endTime))) {
            endTime = parseISO(trip.endTime).getTime();
          } else {
            endTime = startTime + 24 * 60 * 60 * 1000;
          }

          const title =
            trip.route ||
            (trip.clientName ? `Trip to ${trip.clientName}` : trip.label || "Untitled Trip");

          return {
            id: trip.id,
            group: groupId,
            title: title,
            start_time: startTime,
            end_time: endTime,
            color: getTripColor(trip.status || trip.type || "active"),
            type: trip.type,
            status: trip.status,
            fleetNumber: trip.fleetNumber,
            clientName: trip.clientName,
            route: trip.route,
            driverName: trip.driverName || trip.driver,
            background:
              trip.status === "completed"
                ? "#dcfce7"
                : trip.status === "invoiced"
                  ? "#fef3c7"
                  : trip.status === "paid"
                    ? "#e0e7ff"
                    : "#dbeafe",
            fromFirestore: true,
            origin: trip.origin,
            destination: trip.destination,
            driver: trip.driver || trip.driverName,
          };
        });

        const vehiclesArray = Object.values(vehicleMap);

        setTrips(tripItems);
        setVehicles(vehiclesArray);
        setError(null);
      } catch (error: unknown) {
        console.error("Error loading timeline data:", error);
        setError("Failed to load timeline data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [timelineMode]);

  const goToNextPeriod = () => {
    if (timelineMode === "week") {
      setStartDate(addWeeks(startDate, 1));
      setEndDate(addWeeks(endDate, 1));
    } else {
      setStartDate(addWeeks(startDate, 4));
      setEndDate(addWeeks(endDate, 4));
    }
  };

  const goToPreviousPeriod = () => {
    if (timelineMode === "week") {
      setStartDate(subWeeks(startDate, 1));
      setEndDate(subWeeks(endDate, 1));
    } else {
      setStartDate(subWeeks(startDate, 4));
      setEndDate(subWeeks(endDate, 4));
    }
  };

  const goToToday = () => {
    if (timelineMode === "week") {
      setStartDate(startOfWeek(new Date()));
      setEndDate(endOfWeek(addWeeks(new Date(), 1)));
    } else {
      setStartDate(startOfWeek(new Date()));
      setEndDate(endOfWeek(addWeeks(new Date(), 4)));
    }
  };

  const toggleTimelineMode = () => {
    if (timelineMode === "week") {
      setTimelineMode("month");
      setEndDate(endOfWeek(addWeeks(startDate, 3)));
    } else {
      setTimelineMode("week");
      setEndDate(endOfWeek(addWeeks(startDate, 1)));
    }
  };

  const handleItemSelect = (itemId: number) => {
    const selectedItem = trips.find((item) => item.id === itemId.toString());
    setSelectedTrip(selectedItem || null);
  };

  const handleTimeChange = (visibleTimeStart: number, visibleTimeEnd: number) => {
    setStartDate(new Date(visibleTimeStart));
    setEndDate(new Date(visibleTimeEnd));
  };

  const filteredTrips = trips.filter((trip) => {
    if (filterType === "all") return true;
    return trip.status === filterType || trip.type === filterType;
  });

  const vehiclesWithTrips = new Set(filteredTrips.map((t) => t.group));
  const filteredVehicles = vehicles
    .filter((v) => vehiclesWithTrips.has(v.id))
    .filter((v) => (search ? v.title.toLowerCase().includes(search.toLowerCase()) : true));

  const itemRenderer = ({ item, getItemProps }: any) => {
    const backgroundColor = item.background || "#dbeafe";
    const baseStyle = {
      ...getItemProps({}),
      background: backgroundColor,
      border: `1px solid ${item.color || "#3b82f6"}`,
      borderLeft: `4px solid ${item.color || "#3b82f6"}`,
      borderRadius: "4px",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    };

    return (
      <div {...baseStyle}>
        <div
          style={{
            height: "100%",
            paddingLeft: "8px",
            paddingRight: "8px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          {item.status === "completed" && <CheckCircle size={12} className="mr-1 text-green-600" />}
          {item.status === "invoiced" && <Flag size={12} className="mr-1 text-amber-600" />}
          {item.status === "paid" && <DollarSign size={12} className="mr-1 text-indigo-600" />}
          <div className="whitespace-nowrap overflow-hidden overflow-ellipsis text-xs">
            {item.title}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 bg-white rounded-lg shadow-card overflow-hidden border border-gray-200">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Trip Timeline</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => console.log("Export feature to be implemented")}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="rounded-none border-0 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={goToPreviousPeriod}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextPeriod}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2">
                {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
              </span>
              <Button variant="outline" size="sm" onClick={toggleTimelineMode}>
                {timelineMode === "week" ? "Month View" : "Week View"}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Trips</option>
                <option value="active">Active Trips</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed Trips</option>
                <option value="invoiced">Invoiced Trips</option>
                <option value="paid">Paid Trips</option>
                <option value="delayed">Delayed Trips</option>
                <option value="cancelled">Cancelled Trips</option>
                <option value="Retail">Retail</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>
          </div>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded flex items-center mb-4">
              <AlertTriangle size={20} className="mr-2" />
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-700">Loading timeline data...</span>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border">
              <Truck className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
              <p className="text-gray-500 mt-2">
                {search
                  ? "Try adjusting your search criteria."
                  : "No trips available for the selected period."}
              </p>
            </div>
          ) : (
            <div className="h-[600px]">
              <Timeline
                groups={filteredVehicles}
                items={filteredTrips}
                defaultTimeStart={startDate}
                defaultTimeEnd={endDate}
                visibleTimeStart={visibleTimeStart}
                visibleTimeEnd={visibleTimeEnd}
                onTimeChange={handleTimeChange}
                onItemSelect={handleItemSelect}
                canMove={false}
                canResize={false}
                stackItems
                itemRenderer={itemRenderer}
                lineHeight={50}
                itemHeightRatio={0.65}
                sidebarWidth={200}
              >
                <TimelineHeaders>
                  <SidebarHeader>
                    {(props: { getRootProps: () => React.HTMLAttributes<HTMLDivElement> }) => (
                      <div
                        {...props.getRootProps()}
                        className="bg-gray-100 p-2 text-sm font-medium text-gray-700 border-b"
                      >
                        <div className="flex items-center">
                          <Truck size={16} className="mr-1" />
                          Fleet Vehicles
                        </div>
                      </div>
                    )}
                  </SidebarHeader>
                  <DateHeader unit="day" />
                  <DateHeader unit="hour" height={15} labelFormat="HH:00" />
                </TimelineHeaders>
                <TimelineMarkers>
                  <div
                    className="current-time-marker"
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `calc(((${Date.now()} - ${visibleTimeStart}) / (${visibleTimeEnd} - ${visibleTimeStart})) * 100%)`,
                      width: "2px",
                      backgroundColor: "red",
                      zIndex: 999,
                    }}
                  />
                </TimelineMarkers>
              </Timeline>
            </div>
          )}
          {selectedTrip && (
            <div className="mt-4 p-3 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">{selectedTrip.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">From:</span>{" "}
                  {selectedTrip.origin || "Not specified"}
                </div>
                <div>
                  <span className="text-gray-500">To:</span>{" "}
                  {selectedTrip.destination || "Not specified"}
                </div>
                <div>
                  <span className="text-gray-500">Driver:</span>{" "}
                  {selectedTrip.driver || selectedTrip.driverName || "Not assigned"}
                </div>
                <div>
                  <span className="text-gray-500">Start:</span>{" "}
                  {format(new Date(selectedTrip.start_time), "PPpp")}
                </div>
                <div>
                  <span className="text-gray-500">End:</span>{" "}
                  {format(new Date(selectedTrip.end_time), "PPpp")}
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${
                      selectedTrip.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : selectedTrip.status === "in_progress" || selectedTrip.status === "active"
                          ? "bg-blue-100 text-blue-800"
                          : selectedTrip.status === "delayed"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedTrip.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : selectedTrip.status === "invoiced"
                                ? "bg-amber-100 text-amber-800"
                                : selectedTrip.status === "paid"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {selectedTrip.status || "Planned"}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedTrip(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            <div className="text-sm font-medium">Trip Status Legend:</div>
            <div className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ background: TYPE_COLORS["active"] || "#3b82f6" }}
              ></span>
              <span className="ml-1 text-sm">Active</span>
            </div>
            <div className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ background: TYPE_COLORS["completed"] || "#10b981" }}
              ></span>
              <span className="ml-1 text-sm">Completed</span>
            </div>
            <div className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ background: TYPE_COLORS["invoiced"] || "#f59e0b" }}
              ></span>
              <span className="ml-1 text-sm">Invoiced</span>
            </div>
            <div className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ background: TYPE_COLORS["paid"] || "#6366f1" }}
              ></span>
              <span className="ml-1 text-sm">Paid</span>
            </div>
            <div className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ background: TYPE_COLORS["delayed"] || "#f59e0b" }}
              ></span>
              <span className="ml-1 text-sm">Delayed</span>
            </div>
            <div className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ background: TYPE_COLORS["cancelled"] || "#ef4444" }}
              ></span>
              <span className="ml-1 text-sm">Cancelled</span>
            </div>
            {Object.entries(TYPE_COLORS)
              .filter(
                ([type]) =>
                  ![
                    "active",
                    "in_progress",
                    "completed",
                    "invoiced",
                    "paid",
                    "delayed",
                    "cancelled",
                  ].includes(type)
              )
              .map(([type, color]) => (
                <div key={type} className="flex items-center">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ background: color }}
                  ></span>
                  <span className="ml-1 text-sm">{type}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripCalendarPage;
