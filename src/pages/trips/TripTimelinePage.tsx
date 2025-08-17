import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import {
  addDays,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from "date-fns";
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Timeline, {
  DateHeader,
  SidebarHeader,
  TimelineHeaders,
  TimelineMarkers,
} from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import { firestore as db } from "../../utils/firebaseConnectionHandler"; // Using firestore from connection handler

interface Vehicle {
  id: string;
  title: string;
  fleetNumber?: string;
  registration?: string;
  group?: string;
}

interface Trip {
  id: string;
  group: string; // vehicleId or fleetNo
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

const TripTimelinePage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfWeek(addWeeks(new Date(), 1)));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineMode, setTimelineMode] = useState<"week" | "month" | "calendar">("week");
  const [filterType, setFilterType] = useState<string>("all");
  const [statusFilters, setStatusFilters] = useState<string[]>([]); // multi-select
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [hoverTrip, setHoverTrip] = useState<Trip | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Computed time values for the timeline
  const visibleTimeStart = startDate.getTime();
  const visibleTimeEnd = endDate.getTime();

  // Fetch data from Firestore
  useEffect(() => {
    async function fetchTrips() {
      try {
        setLoading(true);

        // Get trips from Firestore, with proper filtering and ordering
        const tripsQuery = query(
          collection(db, "trips"),
          orderBy("startDate", "desc"),
          limit(100) // Limit for performance
        );

        const snap = await getDocs(tripsQuery);
        console.log(`Found ${snap.size} trips in Firestore`);

        // Process trip documents
        const tripDocs = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

        // Extract unique vehicles from trips
        const vehicleMap: Record<string, Vehicle> = {};

        // Create timeline items from trips
        const tripItems: Trip[] = tripDocs.map((trip) => {
          // Use fleetNumber as the group identifier
          const groupId = trip.fleetNumber || trip.vehicleId || "unknown";

          // Store vehicle info
          if (!vehicleMap[groupId]) {
            vehicleMap[groupId] = {
              id: groupId,
              title: trip.fleetNumber || trip.vehicleName || groupId,
              fleetNumber: trip.fleetNumber,
              registration: trip.registration,
            };
          }

          // Parse dates, checking if they're valid
          let startTime: number, endTime: number;

          // Try to parse startDate or startTime
          if (trip.startDate && isValid(parseISO(trip.startDate))) {
            startTime = parseISO(trip.startDate).getTime();
          } else if (trip.startTime && isValid(parseISO(trip.startTime))) {
            startTime = parseISO(trip.startTime).getTime();
          } else {
            startTime = Date.now(); // Fallback
          }

          // Try to parse endDate or endTime
          if (trip.endDate && isValid(parseISO(trip.endDate))) {
            endTime = parseISO(trip.endDate).getTime();
          } else if (trip.endTime && isValid(parseISO(trip.endTime))) {
            endTime = parseISO(trip.endTime).getTime();
          } else {
            endTime = startTime + 24 * 60 * 60 * 1000; // Default to 1 day duration
          }

          // Format title based on available data
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

        // Convert vehicle map to array
        const vehiclesArray = Object.values(vehicleMap);

        console.log(`Processed ${tripItems.length} trips for timeline`);
        console.log(`Found ${vehiclesArray.length} unique vehicles`);

        setTrips(tripItems);
        setVehicles(vehiclesArray);
        setError(null);
      } catch (error) {
        console.error("Error fetching trips for timeline:", error);
        setError("Failed to load timeline data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [timelineMode]);

  // Navigation functions
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
    } else if (timelineMode === "month") {
      setTimelineMode("calendar");
      // Adjust to full current month
      const now = new Date();
      setStartDate(startOfWeek(startOfMonth(now)));
      setEndDate(endOfWeek(endOfMonth(now)));
    } else {
      setTimelineMode("week");
      setStartDate(startOfWeek(new Date()));
      setEndDate(endOfWeek(addWeeks(new Date(), 1)));
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId: number) => {
    const selectedItem = trips.find((item) => item.id === itemId.toString());
    setSelectedTrip(selectedItem || null);
  };

  // Handle time change in timeline
  const handleTimeChange = (visibleTimeStart: number, visibleTimeEnd: number) => {
    setStartDate(new Date(visibleTimeStart));
    setEndDate(new Date(visibleTimeEnd));
  };

  // Filter trips by type/status
  const filteredTrips = trips.filter((trip) => {
    const singleMatch =
      filterType === "all" || trip.status === filterType || trip.type === filterType;
    const multiMatch = statusFilters.length === 0 || statusFilters.includes(trip.status || "");
    return singleMatch && multiMatch;
  });

  // Filter vehicles for search and only show vehicles with trips
  const vehiclesWithTrips = new Set(filteredTrips.map((t) => t.group));
  const filteredVehicles = vehicles
    .filter((v) => vehiclesWithTrips.has(v.id))
    .filter((v) => (search ? v.title.toLowerCase().includes(search.toLowerCase()) : true));

  // Stats summary
  const stats = useMemo(() => {
    const total = filteredTrips.length;
    const byStatus: Record<string, number> = {};
    filteredTrips.forEach((t) => {
      const key = t.status || "unknown";
      byStatus[key] = (byStatus[key] || 0) + 1;
    });
    return { total, byStatus };
  }, [filteredTrips]);

  // Derived list of statuses in filtered trips for dynamic chips
  const statusList = useMemo(() => Object.keys(stats.byStatus).sort(), [stats.byStatus]);

  // Calendar (month grid) data
  const calendarDays = useMemo(() => {
    if (timelineMode !== "calendar") return [] as Date[];
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    const days: Date[] = [];
    for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);
    return days;
  }, [timelineMode]);

  const tripsByDay = useMemo(() => {
    if (timelineMode !== "calendar") return {} as Record<string, Trip[]>;
    const map: Record<string, Trip[]> = {};
    filteredTrips.forEach((t) => {
      const dateKey = format(startOfDay(new Date(t.start_time)), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(t);
    });
    return map;
  }, [filteredTrips, timelineMode]);

  // Custom item renderer for trip bars
  const itemRenderer = ({ item, getItemProps }: any) => {
    // Background style for different trip statuses
    const backgroundColor = item.background || "#dbeafe";

    // Base style with background color
    const baseStyle = {
      ...getItemProps({}),
      background: backgroundColor,
      border: `1px solid ${item.color || "#3b82f6"}`,
      borderLeft: `4px solid ${item.color || "#3b82f6"}`,
      borderRadius: "4px",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    };

    return (
      <div
        {...baseStyle}
        onMouseEnter={(e) => {
          setHoverTrip(item);
          setHoverPosition({ x: e.clientX, y: e.clientY });
        }}
        onMouseLeave={() => {
          setHoverTrip(null);
          setHoverPosition(null);
        }}
      >
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

  // Helper for toggling single status filter from legend or chip
  const toggleStatus = useCallback((st: string) => {
    setStatusFilters((prev) => (prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]));
  }, []);

  const clearAllStatus = useCallback(() => setStatusFilters([]), []);

  // Calendar specific helpers for multi‑day visualization (simple proportional bar)
  const getDurationDays = (trip: Trip) =>
    Math.max(1, Math.round((trip.end_time - trip.start_time) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-4 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Trip Timeline</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => console.log("Export feature to be implemented")}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats + Status Chips */}
      <div className="grid gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded bg-blue-50 border border-blue-100 text-blue-800">
            <div className="text-[10px] uppercase tracking-wide">Total Trips</div>
            <div className="text-lg font-semibold">{stats.total}</div>
          </div>
          {statusList.slice(0, 5).map((status) => (
            <div
              key={status}
              className={`p-3 rounded border cursor-pointer transition ${statusFilters.includes(status) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
              onClick={() => toggleStatus(status)}
            >
              <div className="text-[10px] uppercase tracking-wide">{status.replace("_", " ")}</div>
              <div className="text-lg font-semibold">{stats.byStatus[status]}</div>
            </div>
          ))}
        </div>
        {statusList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Statuses:</span>
            {statusList.map((st) => {
              const active = statusFilters.includes(st);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => toggleStatus(st)}
                  className={`px-2 py-1 rounded text-[11px] border flex items-center gap-1 ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: TYPE_COLORS[st] || "#64748b" }}
                  ></span>
                  {st.replace("_", " ")}
                  <span className="text-[10px] opacity-70">{stats.byStatus[st]}</span>
                </button>
              );
            })}
            {statusFilters.length > 0 && (
              <button
                onClick={clearAllStatus}
                className="px-2 py-1 rounded text-[11px] border bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            {/* Left side: Timeline controls */}
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

              <Button
                variant="outline"
                size="sm"
                onClick={toggleTimelineMode}
                title="Toggle view: Week → Month Span → Calendar Grid"
              >
                {timelineMode === "week" && "Month Span"}
                {timelineMode === "month" && "Calendar"}
                {timelineMode === "calendar" && "Week View"}
              </Button>
            </div>

            {/* Right side: Search and filter */}
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
                <option value="all">(Primary Filter) All</option>
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="invoiced">Invoiced</option>
                <option value="paid">Paid</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
                <option value="Retail">Retail</option>
                <option value="Vendor">Vendor</option>
              </select>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {[
                  "active",
                  "in_progress",
                  "completed",
                  "invoiced",
                  "paid",
                  "delayed",
                  "cancelled",
                ].map((st) => {
                  const active = statusFilters.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() =>
                        setStatusFilters((prev) =>
                          active ? prev.filter((x) => x !== st) : [...prev, st]
                        )
                      }
                      className={`px-2 py-1 rounded text-xs border ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"} transition`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  );
                })}
                {statusFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStatusFilters([])}
                    className="px-2 py-1 rounded text-xs border bg-gray-100 text-gray-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded flex items-center mb-4">
              <AlertTriangle size={20} className="mr-2" />
              {error}
            </div>
          )}

          {/* Timeline Component */}
          {timelineMode === "calendar" ? (
            <div className="border rounded overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-100 text-xs font-medium text-gray-600">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="p-2 text-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-[120px]">
                {calendarDays.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayTrips = (tripsByDay as any)[key] || [];
                  const outside = !isSameMonth(day, new Date());
                  return (
                    <div
                      key={key}
                      className={`relative border p-1 flex flex-col overflow-hidden ${outside ? "bg-gray-50 text-gray-400" : "bg-white"} ${isSameDay(day, new Date()) ? "ring-2 ring-blue-500" : ""}`}
                    >
                      <div className="text-[10px] font-medium mb-1 flex justify-between">
                        <span>{format(day, "d")}</span>
                        {dayTrips.length > 0 && (
                          <span className="text-[9px] px-1 rounded bg-blue-100 text-blue-700">
                            {dayTrips.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 overflow-auto scrollbar-thin">
                        {dayTrips.slice(0, 4).map((t: Trip) => {
                          const days = getDurationDays(t);
                          return (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTrip(t)}
                              className="relative text-[10px] px-1 py-0.5 rounded cursor-pointer truncate group"
                              style={{
                                background: t.background,
                                borderLeft: `3px solid ${t.color}`,
                              }}
                              title={t.title}
                            >
                              <span>{t.title}</span>
                              {days > 1 && (
                                <span
                                  className="absolute bottom-0 left-0 h-0.5 bg-blue-600/60"
                                  style={{ width: `${Math.min(days, 5) * 18}%` }}
                                />
                              )}
                            </div>
                          );
                        })}
                        {dayTrips.length > 4 && (
                          <div className="text-[10px] text-gray-500">
                            +{dayTrips.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : loading ? (
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
                  {timelineMode === "week" && (
                    <DateHeader unit="hour" height={15} labelFormat="HH:00" />
                  )}
                </TimelineHeaders>
                <TimelineMarkers>
                  {/* Current time marker */}
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

          {/* Selected Trip Details */}
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

          {/* Hover Tooltip */}
          {hoverTrip && hoverPosition && (
            <div
              className="pointer-events-none fixed z-50 bg-white border shadow-lg rounded p-2 text-xs w-56"
              style={{ top: hoverPosition.y + 12, left: hoverPosition.x + 12 }}
            >
              <div className="font-medium text-gray-800 truncate">{hoverTrip.title}</div>
              <div className="text-gray-500 mb-1">{hoverTrip.clientName || "No client"}</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <span className="text-gray-400">Start</span>
                <span>{format(new Date(hoverTrip.start_time), "MMM d HH:mm")}</span>
                <span className="text-gray-400">End</span>
                <span>{format(new Date(hoverTrip.end_time), "MMM d HH:mm")}</span>
                <span className="text-gray-400">Driver</span>
                <span>{hoverTrip.driverName || "-"}</span>
                <span className="text-gray-400">Status</span>
                <span>{hoverTrip.status}</span>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            <div className="text-sm font-medium w-full">Legend (click to toggle):</div>
            {["active", "in_progress", "completed", "invoiced", "paid", "delayed", "cancelled"].map(
              (st) => {
                const active = statusFilters.includes(st) || statusFilters.length === 0; // show as active if not filtered out
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleStatus(st)}
                    className={`flex items-center px-2 py-1 rounded border text-xs transition ${statusFilters.includes(st) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                  >
                    <span
                      className="inline-block w-3 h-3 rounded mr-1"
                      style={{
                        background: TYPE_COLORS[st] || "#64748b",
                        opacity: active ? 1 : 0.3,
                      }}
                    ></span>
                    {st.replace("_", " ")}
                  </button>
                );
              }
            )}
            <div className="flex items-center gap-2 ml-auto">
              {statusFilters.length > 0 && (
                <button onClick={clearAllStatus} className="text-xs underline text-gray-500">
                  Reset
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripTimelinePage;
