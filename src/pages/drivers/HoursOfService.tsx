import { Button } from "@/components/ui/Button";
import { AlertTriangle, Calendar, ChevronDown, Download, Filter, Search } from "lucide-react";
import React, { useState } from "react";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";

// Mock hours of service data
const mockHoursData = [
  {
    id: "hos-001",
    driverId: "drv-001",
    driverName: "John Doe",
    date: "2023-10-15",
    drivingHours: 8.5,
    dutyHours: 11.0,
    restHours: 13.0,
    weeklyDrivingTotal: 42.5,
    weeklyDutyTotal: 55.0,
    status: "compliant",
  },
  {
    id: "hos-002",
    driverId: "drv-002",
    driverName: "Jane Smith",
    date: "2023-10-15",
    drivingHours: 9.2,
    dutyHours: 12.5,
    restHours: 11.5,
    weeklyDrivingTotal: 45.0,
    weeklyDutyTotal: 58.5,
    status: "approaching-limit",
  },
  {
    id: "hos-003",
    driverId: "drv-003",
    driverName: "Michael Johnson",
    date: "2023-10-15",
    drivingHours: 10.5,
    dutyHours: 13.0,
    restHours: 11.0,
    weeklyDrivingTotal: 50.0,
    weeklyDutyTotal: 64.5,
    status: "violation",
  },
  {
    id: "hos-004",
    driverId: "drv-004",
    driverName: "Sarah Williams",
    date: "2023-10-15",
    drivingHours: 7.5,
    dutyHours: 10.0,
    restHours: 14.0,
    weeklyDrivingTotal: 39.5,
    weeklyDutyTotal: 50.0,
    status: "compliant",
  },
  {
    id: "hos-005",
    driverId: "drv-005",
    driverName: "Robert Brown",
    date: "2023-10-15",
    drivingHours: 9.8,
    dutyHours: 12.0,
    restHours: 12.0,
    weeklyDrivingTotal: 48.5,
    weeklyDutyTotal: 61.0,
    status: "violation",
  },
];

// HOS limits for reference
const hosLimits = {
  dailyDriving: 10,
  dailyDuty: 14,
  weeklyDriving: 60,
  weeklyDuty: 70,
  restPeriod: 10,
};

const HoursOfService: React.FC = () => {
  // We currently don't mutate hoursData; keep setter placeholder underscored for future use while silencing lint
  const [hoursData] = useState(mockHoursData);

  // Calculate HOS compliance stats
  const compliantCount = hoursData.filter((h) => h.status === "compliant").length;
  const approachingLimitCount = hoursData.filter((h) => h.status === "approaching-limit").length;
  const violationCount = hoursData.filter((h) => h.status === "violation").length;

  // Function to get status indicator color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500";
      case "approaching-limit":
        return "bg-yellow-500";
      case "violation":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to calculate percentage of time used
  const calculatePercentage = (used: number, limit: number) => {
    return Math.min(100, (used / limit) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hours of Service (HOS)</h1>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
            </select>
          </div>

          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliant Drivers</p>
                <p className="text-3xl font-bold text-green-600">{compliantCount}</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xl font-bold text-green-600">
                  {Math.round((compliantCount / hoursData.length) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600">Approaching Limits</p>
                <p className="text-3xl font-bold text-yellow-600">{approachingLimitCount}</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-xl font-bold text-yellow-600">
                  {Math.round((approachingLimitCount / hoursData.length) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600">HOS Violations</p>
                <p className="text-3xl font-bold text-red-600">{violationCount}</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xl font-bold text-red-600">
                  {Math.round((violationCount / hoursData.length) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HOS Records */}
      <Card>
        <CardHeader title="Driver HOS Records" />
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="relative w-full md:w-64 mb-4 md:mb-0">
              <input
                type="text"
                placeholder="Search drivers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="all">All Statuses</option>
                  <option value="compliant">Compliant</option>
                  <option value="approaching-limit">Approaching Limit</option>
                  <option value="violation">Violation</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daily Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weekly Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rest Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hoursData.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.driverName}</div>
                      <div className="text-xs text-gray-500">ID: {record.driverId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${getStatusColor(record.status)} mr-2`}
                        ></div>
                        <span className="text-sm text-gray-900 capitalize">
                          {record.status.replace("-", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 mb-1">
                        Driving: {record.drivingHours}h / {hosLimits.dailyDriving}h
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            calculatePercentage(record.drivingHours, hosLimits.dailyDriving) > 90
                              ? "bg-red-500"
                              : calculatePercentage(record.drivingHours, hosLimits.dailyDriving) >
                                  75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${calculatePercentage(record.drivingHours, hosLimits.dailyDriving)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-900 mt-2 mb-1">
                        On Duty: {record.dutyHours}h / {hosLimits.dailyDuty}h
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            calculatePercentage(record.dutyHours, hosLimits.dailyDuty) > 90
                              ? "bg-red-500"
                              : calculatePercentage(record.dutyHours, hosLimits.dailyDuty) > 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${calculatePercentage(record.dutyHours, hosLimits.dailyDuty)}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 mb-1">
                        Driving: {record.weeklyDrivingTotal}h / {hosLimits.weeklyDriving}h
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            calculatePercentage(
                              record.weeklyDrivingTotal,
                              hosLimits.weeklyDriving
                            ) > 90
                              ? "bg-red-500"
                              : calculatePercentage(
                                    record.weeklyDrivingTotal,
                                    hosLimits.weeklyDriving
                                  ) > 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${calculatePercentage(record.weeklyDrivingTotal, hosLimits.weeklyDriving)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-900 mt-2 mb-1">
                        On Duty: {record.weeklyDutyTotal}h / {hosLimits.weeklyDuty}h
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            calculatePercentage(record.weeklyDutyTotal, hosLimits.weeklyDuty) > 90
                              ? "bg-red-500"
                              : calculatePercentage(record.weeklyDutyTotal, hosLimits.weeklyDuty) >
                                  75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${calculatePercentage(record.weeklyDutyTotal, hosLimits.weeklyDuty)}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.restHours}h / {hosLimits.restPeriod}h
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            record.restHours < hosLimits.restPeriod ? "bg-red-500" : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(100, (record.restHours / hosLimits.restPeriod) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`View detailed HOS for ${record.driverName}`)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Violation Alerts */}
      {violationCount > 0 && (
        <Card>
          <CardHeader title="HOS Violations" className="text-red-600" />
          <CardContent>
            <div className="space-y-4">
              {hoursData
                .filter((record) => record.status === "violation")
                .map((violation) => (
                  <div
                    key={`violation-${violation.id}`}
                    className="p-4 border border-red-200 rounded-md bg-red-50 flex items-start space-x-3"
                  >
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        HOS Violation: {violation.driverName}
                      </h3>
                      <p className="text-sm text-gray-700 mt-1">
                        Driver has exceeded regulated hours of service limits.
                        {violation.weeklyDrivingTotal > hosLimits.weeklyDriving && (
                          <span>
                            {" "}
                            Weekly driving hours exceed limit by{" "}
                            {Math.round(
                              violation.weeklyDrivingTotal - hosLimits.weeklyDriving
                            )}{" "}
                            hours.
                          </span>
                        )}
                        {violation.weeklyDutyTotal > hosLimits.weeklyDuty && (
                          <span>
                            {" "}
                            Weekly duty hours exceed limit by{" "}
                            {Math.round(violation.weeklyDutyTotal - hosLimits.weeklyDuty)} hours.
                          </span>
                        )}
                        {violation.drivingHours > hosLimits.dailyDriving && (
                          <span>
                            {" "}
                            Daily driving hours exceed limit by{" "}
                            {(violation.drivingHours - hosLimits.dailyDriving).toFixed(1)} hours.
                          </span>
                        )}
                      </p>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 mr-2"
                          onClick={() =>
                            alert(`View violation details for ${violation.driverName}`)
                          }
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => alert(`Log regulatory action for ${violation.driverName}`)}
                        >
                          Log Action
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* HOS Regulations Reference */}
      <Card>
        <CardHeader title="Hours of Service Regulations" />
        <CardContent>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                <span>Daily Driving Limits</span>
                <span className="transition group-open:rotate-180">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <div className="text-sm text-gray-700 mt-3 group-open:animate-fadeIn">
                Drivers may drive a maximum of 10 hours after 8 consecutive hours off duty.
              </div>
            </details>

            <hr className="border-gray-200" />

            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                <span>On-Duty Time Limits</span>
                <span className="transition group-open:rotate-180">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <div className="text-sm text-gray-700 mt-3 group-open:animate-fadeIn">
                Drivers may not drive after having been on duty for 14 consecutive hours, following
                8 consecutive hours off duty. Off-duty time does not extend the 14-hour period.
              </div>
            </details>

            <hr className="border-gray-200" />

            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                <span>Weekly Limits</span>
                <span className="transition group-open:rotate-180">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <div className="text-sm text-gray-700 mt-3 group-open:animate-fadeIn">
                <p>Drivers may not drive after:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>60 hours on duty in 7 consecutive days</li>
                  <li>70 hours on duty in 8 consecutive days</li>
                </ul>
              </div>
            </details>

            <hr className="border-gray-200" />

            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                <span>Rest Break Requirements</span>
                <span className="transition group-open:rotate-180">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <div className="text-sm text-gray-700 mt-3 group-open:animate-fadeIn">
                Drivers must take a 30-minute break when they have driven for a period of 8
                cumulative hours without at least a 30-minute interruption.
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HoursOfService;
