import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useAppContext } from "../../context/AppContext";
import SyncIndicator from "../../components/ui/SyncIndicator";

interface TripEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  status: "scheduled" | "active" | "completed" | "delayed";
  driver: string;
  vehicle: string;
}

const Calendar: React.FC = () => {
  const { isLoading } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  // Sample trip events for the calendar
  const tripEvents: TripEvent[] = [
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
      status: "scheduled",
      driver: "J. van Wyk",
      vehicle: "VEH-2003",
    },
    {
      id: "TRP-2025004",
      title: "Oshakati to Windhoek",
      start: "2025-07-18T05:30:00",
      end: "2025-07-18T15:30:00",
      status: "scheduled",
      driver: "P. Amukoto",
      vehicle: "VEH-2004",
    },
    {
      id: "TRP-2025005",
      title: "Walvis Bay to Lüderitz",
      start: "2025-07-20T07:00:00",
      end: "2025-07-21T12:00:00",
      status: "scheduled",
      driver: "L. Haikali",
      vehicle: "VEH-2005",
    },
  ];

  // Move to previous month
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  // Move to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // (Removed unused helper getDayOfMonth)

  // Helper to check if a trip event is on a specific day
  const hasTripOnDay = (day: number): TripEvent[] => {
    const currentMonthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
    const dayStr = String(day).padStart(2, "0");
    const dateToCheck = `${currentMonthStr}-${dayStr}`;

    return tripEvents.filter((event) => {
      const eventStartDay = event.start.substring(0, 10); // YYYY-MM-DD
      return eventStartDay === dateToCheck;
    });
  };

  // Get month name
  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  const handleButtonClick = (action: "previous" | "next" | "month" | "week" | "day") => {
    switch (action) {
      case "previous":
        previousMonth();
        break;
      case "next":
        nextMonth();
        break;
      case "month":
      case "week":
      case "day":
        setView(action);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Calendar</h1>
          <p className="text-gray-600">Schedule and view upcoming trips</p>
        </div>
        <div className="flex space-x-2 items-center">
          <SyncIndicator />
          <Button variant="outline" icon={<Search className="w-4 h-4" />}>
            Search Trips
          </Button>
          <Button icon={<CalendarIcon className="w-4 h-4" />} disabled={isLoading?.trips}>
            Add Trip
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handleButtonClick("previous")}
                variant="outline"
                size="sm"
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <h3 className="text-lg font-medium">
                {monthName} {currentMonth.getFullYear()}
              </h3>
              <Button
                onClick={() => handleButtonClick("next")}
                variant="outline"
                size="sm"
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant={view === "month" ? "primary" : "outline"}
                onClick={() => handleButtonClick("month")}
              >
                Month
              </Button>
              <Button
                size="sm"
                variant={view === "week" ? "primary" : "outline"}
                onClick={() => handleButtonClick("week")}
              >
                Week
              </Button>
              <Button
                size="sm"
                variant={view === "day" ? "primary" : "outline"}
                onClick={() => handleButtonClick("day")}
              >
                Day
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
              <div key={index} className="p-2 text-center font-medium text-gray-700">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2 min-h-[120px] bg-gray-50"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const tripsOnDay = hasTripOnDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === currentMonth.getMonth() &&
                new Date().getFullYear() === currentMonth.getFullYear();

              return (
                <div
                  key={`day-${day}`}
                  className={`p-2 min-h-[120px] border border-gray-200 ${isToday ? "bg-blue-50 border-blue-300" : "bg-white"}`}
                >
                  <div className={`text-right ${isToday ? "font-bold text-blue-600" : ""}`}>
                    {day}
                  </div>

                  {/* Trips for this day */}
                  <div className="mt-1">
                    {tripsOnDay.map((trip) => (
                      <div
                        key={trip.id}
                        className={`text-xs p-1 mb-1 rounded overflow-hidden whitespace-nowrap overflow-ellipsis
                          ${
                            trip.status === "active"
                              ? "bg-blue-100 text-blue-800"
                              : trip.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : trip.status === "delayed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {trip.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Trips */}
      <Card>
        <CardHeader title="Upcoming Trips" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tripEvents.map((trip) => {
                  const startDate = new Date(trip.start);

                  return (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{trip.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{trip.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {startDate.toLocaleDateString()}{" "}
                        {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{trip.driver}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{trip.vehicle}</td>
                      <td className="px-6 py-4 text-sm">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
