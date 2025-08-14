import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

// Define TypeScript interfaces for our data
interface TripEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  status: "scheduled" | "active" | "completed" | "delayed";
  driver: string;
  vehicle: string;
}

interface Event {
  id: string;
  label: string;
  start: Date;
  end: Date;
  type: TripEvent["status"]; // Use TripEvent statuses as types
  color: string; // Tailwind color class
}

interface Vehicle {
  id: string;
  name: string;
  events: Event[];
}

// Helper function to get the number of days in a month
const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// Helper function to get days for a specific week (Thursday to Wednesday)
const getDaysInWeek = (currentDate: Date): Date[] => {
  const days: Date[] = [];
  const startOfWeek = new Date(currentDate);
  // Adjust to Thursday of the current week (or previous week if currentDate is before Thursday)
  startOfWeek.setDate(currentDate.getDate() - ((currentDate.getDay() + 3) % 7));

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  return days;
};

// Helper function to convert TripEvent status to a Tailwind color class
const getStatusColor = (status: TripEvent["status"]): string => {
  switch (status) {
    case "active":
      return "bg-indigo-300";
    case "completed":
      return "bg-emerald-300";
    case "delayed":
      return "bg-rose-300";
    case "scheduled":
    default:
      return "bg-neutral-300"; // Softer gray for scheduled
  }
};

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Current date for calendar navigation
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Sample trip events for the calendar (from your provided code)
  const tripEvents: TripEvent[] = useMemo(
    () => [
      {
        id: "TRP-2025001",
        title: "Windhoek to Walvis Bay",
        start: "2025-07-10T07:00:00",
        end: "2025-07-10T14:00:00",
        status: "scheduled",
        driver: "T. Nangolo",
        vehicle: "VEH-2001",
      },
      {
        id: "TRP-2025002",
        title: "Swakopmund to Ondangwa",
        start: "2025-07-12T08:30:00",
        end: "2025-07-12T17:30:00",
        status: "scheduled",
        driver: "M. Shapumba",
        vehicle: "VEH-2002",
      },
      {
        id: "TRP-2025003",
        title: "Windhoek to Keetmanshoop",
        start: "2025-07-15T06:00:00",
        end: "2025-07-15T16:00:00",
        status: "active", // Changed to active for visual diversity
        driver: "J. van Wyk",
        vehicle: "VEH-2003",
      },
      {
        id: "TRP-2025004",
        title: "Oshakati to Windhoek",
        start: "2025-07-18T05:30:00",
        end: "2025-07-18T15:30:00",
        status: "delayed", // Changed to delayed for visual diversity
        driver: "P. Amukoto",
        vehicle: "VEH-2004",
      },
      {
        id: "TRP-2025005",
        title: "Walvis Bay to Lüderitz",
        start: "2025-07-20T07:00:00",
        end: "2025-07-21T12:00:00", // Spans two days
        status: "completed", // Changed to completed for visual diversity
        driver: "L. Haikali",
        vehicle: "VEH-2005",
      },
      {
        id: "TRP-2025006",
        title: "Long Haul Trip",
        start: "2025-07-23T09:00:00",
        end: "2025-07-28T17:00:00", // Spans multiple days
        status: "active",
        driver: "K. Smith",
        vehicle: "VEH-2001", // Same vehicle as first trip
      },
    ],
    []
  );

  // Transform tripEvents into the Vehicle structure for timeline display
  const vehicles: Vehicle[] = useMemo(() => {
    const vehiclesMap = new Map<string, Vehicle>();

    tripEvents.forEach((trip) => {
      if (!vehiclesMap.has(trip.vehicle)) {
        vehiclesMap.set(trip.vehicle, { id: trip.vehicle, name: trip.vehicle, events: [] });
      }
      vehiclesMap.get(trip.vehicle)?.events.push({
        id: trip.id,
        label: `${trip.title} (${trip.driver})`,
        start: new Date(trip.start),
        end: new Date(trip.end),
        type: trip.status,
        color: getStatusColor(trip.status),
      });
    });

    // Sort vehicles by name for consistent display
    return Array.from(vehiclesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [tripEvents]);

  const daysOfWeek = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);

  const getVisibleDays = useCallback((): Date[] => {
    if (viewMode === "month") {
      return getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    } else if (viewMode === "week") {
      return getDaysInWeek(currentDate);
    }
    // For 'day' view, just return the current day
    return [currentDate];
  }, [currentDate, viewMode]);

  const visibleDays = getVisibleDays();

  const handlePrev = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (viewMode === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        // day
        newDate.setDate(newDate.getDate() - 1);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (viewMode === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        // day
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  // Vehicles currently unfiltered (search removed)
  const filteredVehicles = vehicles;

  return (
    <div className="min-h-screen bg-neutral-50 font-inter text-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg">
      {/* Top Section: Title and Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Calendar</h1>
          <p className="text-gray-600">Schedule and view upcoming trips</p>
        </div>
        <div className="flex space-x-2 items-center">
          {/* <SyncIndicator /> Removed as it's an external component */}
          {/* Search button removed with search feature */}
          <button
            className="flex items-center px-4 py-2 rounded-md bg-indigo-500 text-white font-semibold text-sm shadow-sm hover:bg-indigo-600 transition-colors"
            // disabled={isLoading?.trips} Removed as isLoading is from external context
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Add Trip
          </button>
        </div>
      </div>

      {/* Calendar Controls and View Modes */}
      <div className="bg-white rounded-lg shadow-md mb-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-md bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h3 className="text-lg font-medium">
              {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={handleNext}
              className="p-2 rounded-md bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex rounded-md shadow-sm">
            {["Month", "Week", "Day"].map((mode) => (
              <button
                key={mode}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === mode.toLowerCase()
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-neutral-100 text-gray-700 hover:bg-neutral-200"
                } ${mode === "Month" ? "rounded-r-none" : ""} ${mode === "Day" ? "rounded-l-none" : ""} ${mode === "Week" ? "rounded-none" : ""}`}
                onClick={() => setViewMode(mode.toLowerCase() as "day" | "week" | "month")}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid (Timeline View) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="text-center py-2 text-lg font-semibold text-gray-700 border-b border-gray-200">
          {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </div>

        <div className="flex">
          {/* Vehicle List Column */}
          <div className="w-40 flex-shrink-0 border-r border-gray-200 bg-neutral-50">
            <div className="h-12 flex items-center justify-center font-semibold text-sm text-gray-600 border-b border-gray-200">
              Vehicles
            </div>
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="h-12 flex items-center px-3 border-b border-gray-100 text-sm hover:bg-neutral-100 transition-colors"
              >
                {vehicle.name}
              </div>
            ))}
          </div>

          {/* Timeline Grid */}
          <div className="flex-grow overflow-x-auto">
            {/* Day Headers */}
            <div className="flex border-b border-gray-200">
              {visibleDays.map((day: Date, index: number) => (
                <div
                  key={index}
                  className={`flex-1 min-w-[120px] h-12 flex flex-col items-center justify-center p-2 border-l border-gray-200 ${
                    day.getDay() === 0 || day.getDay() === 6 ? "bg-indigo-50" : "bg-white" // Softer weekend styling
                  }`}
                >
                  <span className="text-xs font-semibold text-gray-600">
                    {daysOfWeek[day.getDay()]}
                  </span>
                  <span className="text-lg font-bold text-gray-800">{day.getDate()}</span>
                </div>
              ))}
            </div>

            {/* Event Rows */}
            <div className="relative">
              {filteredVehicles.map((vehicle: Vehicle) => (
                <div key={vehicle.id} className="flex h-12 border-b border-gray-100">
                  {visibleDays.map((day: Date, dayIndex: number) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return (
                      <div
                        key={dayIndex}
                        className={`flex-1 min-w-[120px] border-l border-gray-100 relative ${isWeekend ? "bg-indigo-50" : "bg-white"}`}
                      >
                        {/* Render events that fall on this day */}
                        {vehicle.events.map((event: Event) => {
                          // Check if event overlaps with the current day
                          const eventStartsOnDay =
                            event.start.toDateString() === day.toDateString();
                          const eventEndsOnDay = event.end.toDateString() === day.toDateString();
                          // Check if the event spans across the current day
                          const eventSpansDay =
                            event.start < day &&
                            event.end >
                              new Date(
                                day.getFullYear(),
                                day.getMonth(),
                                day.getDate(),
                                23,
                                59,
                                59
                              );

                          if (eventStartsOnDay || eventEndsOnDay || eventSpansDay) {
                            // Calculate position and width based on the visible days and event duration
                            const dayStart = new Date(
                              day.getFullYear(),
                              day.getMonth(),
                              day.getDate(),
                              0,
                              0,
                              0
                            );
                            const dayEnd = new Date(
                              day.getFullYear(),
                              day.getMonth(),
                              day.getDate(),
                              23,
                              59,
                              59
                            );

                            const eventVisibleStart = Math.max(
                              event.start.getTime(),
                              dayStart.getTime()
                            );
                            const eventVisibleEnd = Math.min(event.end.getTime(), dayEnd.getTime());

                            const totalDayDuration = dayEnd.getTime() - dayStart.getTime(); // Milliseconds in a day
                            const visibleEventDuration = eventVisibleEnd - eventVisibleStart;

                            if (visibleEventDuration <= 0) return null; // Event not visible on this day

                            const leftPercentage =
                              ((eventVisibleStart - dayStart.getTime()) / totalDayDuration) * 100;
                            const widthPercentage = (visibleEventDuration / totalDayDuration) * 100;

                            return (
                              <div
                                key={event.id}
                                className={`absolute h-8 rounded-md text-white text-[10px] p-1 flex items-center justify-center overflow-hidden whitespace-nowrap ${event.color} shadow-sm`}
                                style={{
                                  left: `${leftPercentage}%`,
                                  width: `${widthPercentage}%`,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  zIndex: 10,
                                }}
                                title={event.label} // Tooltip for full label
                              >
                                <span className="truncate">{event.label}</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Trips Table (retained from your original code) */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Trips</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>{" "}
                  {/* Added Status column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tripEvents.map((trip: TripEvent) => {
                  const startDate = new Date(trip.start);
                  const endDate = new Date(trip.end);

                  return (
                    <tr key={trip.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">{trip.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{trip.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {startDate.toLocaleDateString()}{" "}
                        {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {startDate.toDateString() !== endDate.toDateString() && (
                          <>
                            {" "}
                            - {endDate.toLocaleDateString()}{" "}
                            {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{trip.driver}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{trip.vehicle}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            trip.status === "active"
                              ? "bg-indigo-100 text-indigo-800"
                              : trip.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : trip.status === "delayed"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-neutral-100 text-neutral-800"
                          }`}
                        >
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="px-3 py-1 rounded-md bg-white text-gray-700 font-semibold text-xs shadow-sm hover:bg-neutral-100 transition-colors border border-gray-200">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
