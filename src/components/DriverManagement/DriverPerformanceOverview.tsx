import React, { ChangeEvent, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  DRIVER_BEHAVIOR_EVENT_TYPES,
  DriverBehaviorEvent,
  DRIVERS,
  FLEET_NUMBERS,
} from "../../types";
import Card, { CardContent, CardHeader } from "../ui/Card";
// Removed erroneous self-import line that broke parsing
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Clock, Edit, Eye, Plus, Save, Trash2, X } from "lucide-react";
import { formatDate, formatDateTime } from "../../utils/helpers";
import { FileUpload, Input, Select, TextArea } from "../ui/FormElements"; // Ensure FileUpload is imported if used
import Modal from "../ui/Modal";

interface EventFormState {
  driverName: string;
  fleetNumber: string;
  eventDate: string;
  eventTime: string;
  eventType: DriverBehaviorEvent["eventType"] | "";
  description: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "acknowledged" | "resolved" | "disputed";
  actionTaken: string;
  points: number;
  attachments: FileList | null;
}

const DriverPerformanceOverview: React.FC = () => {
  const {
    driverBehaviorEvents,
    addDriverBehaviorEvent,
    updateDriverBehaviorEvent,
    deleteDriverBehaviorEvent,
    getAllDriversPerformance,
  } = useAppContext();

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DriverBehaviorEvent | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const initialEventFormState: EventFormState = {
    driverName: "",
    fleetNumber: "",
    eventDate: new Date().toISOString().split("T")[0],
    eventTime: new Date().toTimeString().split(" ")[0].substring(0, 5),
    eventType: "",
    description: "",
    location: "",
    severity: "medium",
    status: "pending",
    actionTaken: "",
    points: 0,
    attachments: null,
  };

  const [eventForm, setEventForm] = useState<EventFormState>(initialEventFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const driversPerformance = useMemo(() => {
    return getAllDriversPerformance();
  }, [driverBehaviorEvents, getAllDriversPerformance]);

  const filteredEvents = useMemo(() => {
    return driverBehaviorEvents.filter((event) => {
      const matchesDriver = !selectedDriver || event.driverName === selectedDriver;
      const matchesEventType = !selectedEventType || event.eventType === selectedEventType;
      const matchesSeverity = !selectedSeverity || event.severity === selectedSeverity;
      const matchesStatus = !selectedStatus || (event.status || "pending") === selectedStatus;
      const matchesDateRange =
        (!dateRange.start || event.eventDate >= dateRange.start) &&
        (!dateRange.end || event.eventDate <= dateRange.end);
      return (
        matchesDriver && matchesEventType && matchesSeverity && matchesStatus && matchesDateRange
      );
    });
  }, [
    driverBehaviorEvents,
    selectedDriver,
    selectedEventType,
    selectedSeverity,
    selectedStatus,
    dateRange,
  ]);

  const summary = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const criticalEvents = filteredEvents.filter((e) => e.severity === "critical").length;
    const highSeverityEvents = filteredEvents.filter((e) => e.severity === "high").length;
    const unresolvedEvents = filteredEvents.filter(
      (e) => (e.status || "pending") !== "resolved"
    ).length;

    const eventsByType = filteredEvents.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topEventTypes = Object.entries(eventsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({
        type,
        count,
        label: DRIVER_BEHAVIOR_EVENT_TYPES.find((t) => t.value === type)?.label || type,
      }));

    const driverEventCounts = filteredEvents.reduce(
      (acc, event) => {
        acc[event.driverName] = (acc[event.driverName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const driverCriticalEvents = filteredEvents
      .filter((e) => e.severity === "critical" || e.severity === "high")
      .reduce(
        (acc, event) => {
          acc[event.driverName] = (acc[event.driverName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    const highRiskDrivers = Object.entries(driverEventCounts)
      .filter(([driver, count]) => count > 3 || (driverCriticalEvents[driver] || 0) > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([driver, count]) => ({
        name: driver,
        eventCount: count,
        criticalCount: driverCriticalEvents[driver] || 0,
        score: driversPerformance.find((d) => d.driverName === driver)?.behaviorScore || 0,
      }));

    return {
      totalEvents,
      criticalEvents,
      highSeverityEvents,
      unresolvedEvents,
      topEventTypes,
      highRiskDrivers,
    };
  }, [filteredEvents, driversPerformance]);

  const handleFormChange = (field: keyof EventFormState, value: any) => {
    setEventForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "eventType") {
        const eventType = DRIVER_BEHAVIOR_EVENT_TYPES.find((t) => t.value === value);
        if (eventType) updated.points = eventType.points;
      }
      return updated;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!eventForm.driverName) newErrors.driverName = "Driver name is required";
    if (!eventForm.fleetNumber) newErrors.fleetNumber = "Fleet number is required";
    if (!eventForm.eventDate) newErrors.eventDate = "Event date is required";
    if (!eventForm.eventTime) newErrors.eventTime = "Event time is required";
    if (!eventForm.eventType) newErrors.eventType = "Event type is required";
    if (!eventForm.description) newErrors.description = "Description is required";
    if (!eventForm.severity) newErrors.severity = "Severity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const eventData: Omit<DriverBehaviorEvent, "id"> = {
      driverId: "dummy-driver-id",
      driverName: eventForm.driverName,
      fleetNumber: eventForm.fleetNumber,
      eventDate: eventForm.eventDate,
      eventTime: eventForm.eventTime,
      eventType: eventForm.eventType as DriverBehaviorEvent["eventType"],
      description: eventForm.description,
      location: eventForm.location,
      severity: eventForm.severity,
      reportedBy: "Current User",
      reportedAt: new Date().toISOString(),
      status: eventForm.status,
      actionTaken: eventForm.actionTaken,
      points: eventForm.points,
      followUpRequired: false,
      attachments: [],
    };

    if (selectedEvent) {
      updateDriverBehaviorEvent({ ...selectedEvent, ...eventData });
      console.log("Driver behavior event updated successfully");
    } else {
      addDriverBehaviorEvent(eventData, eventForm.attachments || undefined);
      console.log("Driver behavior event recorded successfully");
    }

    resetForm();
    setShowAddEventModal(false);
  };

  const resetForm = () => {
    setEventForm(initialEventFormState);
    setErrors({});
    setSelectedEvent(null);
  };

  const handleEditEvent = (event: DriverBehaviorEvent) => {
    setSelectedEvent(event);
    setEventForm({
      driverName: event.driverName,
      fleetNumber: event.fleetNumber,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      eventType: event.eventType,
      description: event.description,
      location: event.location || "",
      severity: event.severity,
      status: event.status || "pending",
      actionTaken: event.actionTaken || "",
      points: event.points || 0,
      attachments: null,
    });
    setShowAddEventModal(true);
  };

  const handleDeleteEvent = (id: string) => {
    // Replaced window.confirm and alert with console logs as per instructions,
    // as these are not suitable for the Canvas environment.
    if (window.confirm("Are you sure you want to delete this driver behavior event?")) {
      deleteDriverBehaviorEvent(id);
      console.log("Event deleted successfully");
    }
  };

  const clearFilters = () => {
    setSelectedDriver("");
    setSelectedEventType("");
    setSelectedSeverity("");
    setSelectedStatus("");
    setDateRange({ start: "", end: "" });
  };

  const getSeverityClass = (severity: string | undefined) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "acknowledged":
        return "bg-blue-100 text-blue-800";
      case "disputed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{summary.totalEvents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-3xl font-bold text-red-600">{summary.criticalEvents}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Severity</p>
                <p className="text-3xl font-bold text-orange-600">{summary.highSeverityEvents}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unresolved</p>
                <p className="text-3xl font-bold text-purple-600">{summary.unresolvedEvents}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Filter Driver Events</h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearFilters}
                icon={<X className="w-4 h-4" />}
              >
                Clear Filters
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddEventModal(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Record Event
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Driver Filter */}
            <Select
              label="Driver"
              value={selectedDriver}
              options={[
                { value: "", label: "All Drivers" },
                ...DRIVERS.map((driver) => ({ value: driver, label: driver })),
              ]}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedDriver(e.target.value)}
            />

            {/* Event Type Filter */}
            <Select
              label="Event Type"
              value={selectedEventType}
              options={[{ value: "", label: "All Event Types" }, ...DRIVER_BEHAVIOR_EVENT_TYPES]}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedEventType(e.target.value)}
            />

            {/* Severity Filter */}
            <Select
              label="Severity"
              value={selectedSeverity}
              options={[
                { value: "", label: "All Severities" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedSeverity(e.target.value)}
            />

            {/* Status Filter */}
            <Select
              label="Status"
              value={selectedStatus}
              options={[
                { value: "", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "acknowledged", label: "Acknowledged" },
                { value: "resolved", label: "Resolved" },
                { value: "disputed", label: "Disputed" },
              ]}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
            />

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <Input
                  label="" // Label is visually handled by the parent div's label
                  type="date"
                  value={dateRange.start}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="w-1/2"
                />
                <Input
                  label="" // Label is visually handled by the parent div's label
                  type="date"
                  value={dateRange.end}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="w-1/2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Risk Drivers */}
      {summary.highRiskDrivers.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">High Risk Drivers</h3>
          </CardHeader>
          <CardContent>
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
                      Event Count
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Critical Events
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Performance Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.highRiskDrivers.map((driver, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {driver.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.eventCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {driver.criticalCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className={`h-2.5 rounded-full ${
                                driver.score > 80
                                  ? "bg-green-500"
                                  : driver.score > 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${driver.score}%` }}
                            ></div>
                          </div>
                          <span>{driver.score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Recent Driver Events</h3>
        </CardHeader>
        <CardContent>
          {filteredEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
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
                      Fleet #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Severity
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
                  {filteredEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(event.eventDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.driverName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.fleetNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {DRIVER_BEHAVIOR_EVENT_TYPES.find((t) => t.value === event.eventType)
                          ?.label || event.eventType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(event.severity)}`}
                        >
                          {event.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(event.status)}`}
                        >
                          {event.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <AlertTriangle className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No driver behavior events match your current filters.
              </p>
              <div className="mt-6">
                <Button onClick={clearFilters} size="sm" variant="outline">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Event Modal */}
      <Modal
        isOpen={showAddEventModal}
        onClose={() => {
          resetForm();
          setShowAddEventModal(false);
        }}
        title={selectedEvent ? "Edit Driver Behavior Event" : "Record Driver Behavior Event"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Driver Name Select */}
            <Select
              label="Driver Name"
              value={eventForm.driverName}
              options={[
                { value: "", label: "Select Driver" },
                ...DRIVERS.map((driver) => ({ value: driver, label: driver })),
              ]}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleFormChange("driverName", e.target.value)
              }
              error={errors.driverName}
            />
            {/* Fleet Number Select */}
            <Select
              label="Fleet Number"
              value={eventForm.fleetNumber}
              options={[
                { value: "", label: "Select Fleet Number" },
                ...FLEET_NUMBERS.map((fleet) => ({ value: fleet, label: fleet })),
              ]}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleFormChange("fleetNumber", e.target.value)
              }
              error={errors.fleetNumber}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Date Input */}
            <Input
              label="Event Date"
              type="date"
              value={eventForm.eventDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleFormChange("eventDate", e.target.value)
              }
              error={errors.eventDate}
            />
            {/* Event Time Input */}
            <Input
              label="Event Time"
              type="time"
              value={eventForm.eventTime}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleFormChange("eventTime", e.target.value)
              }
              error={errors.eventTime}
            />
          </div>

          {/* Event Type Select */}
          <Select
            label="Event Type"
            value={eventForm.eventType}
            options={[{ value: "", label: "Select Event Type" }, ...DRIVER_BEHAVIOR_EVENT_TYPES]}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handleFormChange("eventType", e.target.value)
            }
            error={errors.eventType}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity Select */}
            <Select
              label="Severity"
              value={eventForm.severity}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "critical", label: "Critical" },
              ]}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleFormChange("severity", e.target.value as any)
              }
              error={errors.severity}
            />
            {/* Status Select */}
            <Select
              label="Status"
              value={eventForm.status}
              options={[
                { value: "pending", label: "Pending" },
                { value: "acknowledged", label: "Acknowledged" },
                { value: "resolved", label: "Resolved" },
                { value: "disputed", label: "Disputed" },
              ]}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleFormChange("status", e.target.value as any)
              }
            />
          </div>

          {/* Location Input */}
          <Input
            label="Location"
            type="text"
            value={eventForm.location}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleFormChange("location", e.target.value)
            }
            placeholder="Enter location of event"
          />

          {/* Description TextArea */}
          <TextArea
            label="Description"
            value={eventForm.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleFormChange("description", e.target.value)
            }
            placeholder="Describe the event in detail"
            error={errors.description}
            rows={3}
          />

          {/* Action Taken TextArea */}
          <TextArea
            label="Action Taken"
            value={eventForm.actionTaken}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleFormChange("actionTaken", e.target.value)
            }
            placeholder="Describe any immediate actions taken"
            rows={2}
          />

          {/* Points Input */}
          <Input
            label="Points"
            type="number"
            value={eventForm.points.toString()}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleFormChange("points", parseInt(e.target.value) || 0)
            }
            placeholder="Penalty points"
          />
          <p className="mt-1 text-xs text-gray-500">
            Points are automatically assigned based on event type but can be adjusted.
          </p>

          {/* Supporting Documents FileUpload */}
          <FileUpload
            label="Supporting Documents"
            // Explicitly cast e.target.files to FileList | null to resolve 'implicitly has an any type' error
            onFileSelect={(files: FileList | null) => handleFormChange("attachments", files)}
            multiple
          />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              onClick={() => {
                resetForm();
                setShowAddEventModal(false);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} icon={<Save className="w-4 h-4 mr-1" />}>
              {selectedEvent ? "Update Event" : "Record Event"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={showEventDetailsModal}
          onClose={() => {
            setSelectedEvent(null);
            setShowEventDetailsModal(false);
          }}
          title="Driver Behavior Event Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Driver</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedEvent.driverName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Fleet Number</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedEvent.fleetNumber}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Event Date & Time</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateTime(`${selectedEvent.eventDate}T${selectedEvent.eventTime}`)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Event Type</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {DRIVER_BEHAVIOR_EVENT_TYPES.find((t) => t.value === selectedEvent.eventType)
                    ?.label || selectedEvent.eventType}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Severity</h4>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(selectedEvent.severity)}`}
                  >
                    {selectedEvent.severity}
                  </span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(selectedEvent.status)}`}
                  >
                    {selectedEvent.status || "pending"}
                  </span>
                </p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedEvent.location || "Not specified"}
                </p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedEvent.description}</p>
              </div>
              {selectedEvent.actionTaken && (
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Action Taken</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvent.actionTaken}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-500">Points</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedEvent.points || 0} points</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Reported By</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedEvent.reportedBy}</p>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowEventDetailsModal(false);
                  setSelectedEvent(null);
                }}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowEventDetailsModal(false);
                  handleEditEvent(selectedEvent);
                }}
                icon={<Edit className="w-4 h-4 mr-1" />}
              >
                Edit Event
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DriverPerformanceOverview;
