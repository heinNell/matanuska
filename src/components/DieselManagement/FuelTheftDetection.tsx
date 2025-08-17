import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import SyncIndicator from "../../components/ui/SyncIndicator";
import { AlertCircle, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

interface AnomalyReport {
  id: string;
  fleetNumber: string;
  date: string;
  type: "tank_volume" | "consumption_rate" | "refill_frequency";
  severity: "high" | "medium" | "low";
  description: string;
  evidence: string[];
  status: "open" | "investigating" | "resolved" | "dismissed";
}

const FuelTheftDetection: React.FC = () => {
  // State for expansion of anomaly details
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock data for demonstration purposes
  const anomalyReports: AnomalyReport[] = [
    {
      id: "anomaly-001",
      fleetNumber: "MT-1008",
      date: "2025-07-07",
      type: "tank_volume",
      severity: "high",
      description: "Unexpected tank volume decrease of 38L during overnight parking",
      evidence: [
        "Tank level was 78% at 18:30",
        "Tank level was 53% at 06:15",
        "Vehicle was not in operation during this period",
        "GPS shows vehicle remained at depot",
      ],
      status: "open",
    },
    {
      id: "anomaly-002",
      fleetNumber: "MT-1015",
      date: "2025-07-05",
      type: "consumption_rate",
      severity: "medium",
      description: "Abnormal fuel consumption rate detected on highway route",
      evidence: [
        "Average consumption: 2.1 km/L (Expected: 3.2 km/L)",
        "No heavy load reported for this trip",
        "Weather conditions were optimal",
        "Similar route two weeks ago showed normal consumption",
      ],
      status: "investigating",
    },
    {
      id: "anomaly-003",
      fleetNumber: "MT-1003",
      date: "2025-07-02",
      type: "refill_frequency",
      severity: "low",
      description: "Unusual refill pattern detected",
      evidence: [
        "Three refills within 24 hours",
        "Tank was never below 40% between refills",
        "Total refill volume exceeds tank capacity",
        "Different fuel stations used for each refill",
      ],
      status: "resolved",
    },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> High Risk
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Medium Risk
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Low Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {severity}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Open
          </span>
        );
      case "investigating":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Investigating
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Resolved
          </span>
        );
      case "dismissed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Dismissed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Toggle anomaly details expansion
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Fuel Theft Detection</h2>
        <SyncIndicator />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">Active Anomalies</h3>
            <div className="text-3xl font-bold">2</div>
            <p className="text-sm text-gray-500">Require investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">Resolved Issues</h3>
            <div className="text-3xl font-bold">1</div>
            <p className="text-sm text-gray-500">In the last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">Estimated Savings</h3>
            <div className="text-3xl font-bold">$1,250</div>
            <p className="text-sm text-gray-500">This month from anomaly detection</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Detected Anomalies</h3>

          {anomalyReports.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No anomalies detected</h3>
              <p className="mt-1 text-sm text-gray-500">
                The system is monitoring for unusual fuel patterns.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {anomalyReports.map((anomaly) => (
                <div key={anomaly.id} className="py-3">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(anomaly.id)}
                  >
                    <div className="flex items-center">
                      {expandedId === anomaly.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                      )}
                      <div>
                        <h4 className="text-md font-medium">{anomaly.fleetNumber}</h4>
                        <p className="text-sm text-gray-500">{formatDate(anomaly.date)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {getSeverityBadge(anomaly.severity)}
                      {getStatusBadge(anomaly.status)}
                    </div>
                  </div>

                  {expandedId === anomaly.id && (
                    <div className="mt-3 ml-7 bg-gray-50 p-3 rounded-md">
                      <p className="font-medium mb-2">{anomaly.description}</p>
                      <div className="mt-2">
                        <h5 className="text-sm font-medium mb-1">Evidence:</h5>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          {anomaly.evidence.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant={anomaly.status === "open" ? "primary" : "outline"}
                          disabled={anomaly.status !== "open"}
                        >
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-600"
                          disabled={anomaly.status === "resolved" || anomaly.status === "dismissed"}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Detection Methods</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium">1. Tank Volume Monitoring</h4>
              <p className="text-sm text-gray-600">
                Detects unexpected decreases in fuel tank levels during periods of vehicle
                inactivity. This method uses IoT sensors to track fuel levels in real-time.
              </p>
            </div>

            <div>
              <h4 className="text-md font-medium">2. Consumption Pattern Analysis</h4>
              <p className="text-sm text-gray-600">
                Identifies abnormal fuel consumption rates by comparing actual consumption with
                expected rates based on historical data, vehicle specifications, load, route, and
                weather conditions.
              </p>
            </div>

            <div>
              <h4 className="text-md font-medium">3. Refill Frequency Analysis</h4>
              <p className="text-sm text-gray-600">
                Monitors refill patterns to detect unusual behavior such as frequent small refills,
                refilling when the tank is already relatively full, or inconsistent volumes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelTheftDetection;
