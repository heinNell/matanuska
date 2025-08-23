import {
  BarChart,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Flag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useMemo } from "react";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Trip } from "../../types";
import { Client } from "../../types/client";
import { formatCurrency, formatDate } from "../../utils/helpers";

interface ClientAnalyticsProps {
  clients: Client[];
  trips: Trip[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
}

interface ClientMetrics {
  totalRevenue: number;
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  flaggedTrips: number;
  averageTripValue: number;
  lastTripDate: string | null;
  firstTripDate: string | null;
  relationshipLength: number; // in days
  revenueTrend: "increasing" | "decreasing" | "stable";
  tripFrequency: number; // average days between trips
  onTimeDeliveryRate: number; // percentage
  mostRecentTrip?: Trip;
}

const ClientAnalytics: React.FC<ClientAnalyticsProps> = ({
  clients,
  trips,
  selectedClientId,
  onSelectClient,
}) => {
  // Get the selected client
  const selectedClient = clients.find((client) => client.id === selectedClientId);

  // Calculate metrics for the selected client
  const clientMetrics: ClientMetrics | null = useMemo(() => {
    if (!selectedClient) return null;

    // Filter trips for this client
    const clientTrips = trips.filter((trip) => trip.clientName === selectedClient.name);

    if (clientTrips.length === 0) {
      return {
        totalRevenue: 0,
        totalTrips: 0,
        activeTrips: 0,
        completedTrips: 0,
        flaggedTrips: 0,
        averageTripValue: 0,
        lastTripDate: null,
        firstTripDate: null,
        relationshipLength: 0,
        revenueTrend: "stable" as const,
        tripFrequency: 0,
        onTimeDeliveryRate: 0,
      };
    }

    // Sort trips by date (oldest to newest by start date)
    const sortedByStartDate = [...clientTrips].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Find the first trip (oldest) and most recent trip
    const firstTrip = sortedByStartDate[0];
    const mostRecentTrip = [...clientTrips].sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    )[0];

    // Guard against undefined trips
    if (!firstTrip || !mostRecentTrip) {
      return {
        totalRevenue: 0,
        totalTrips: 0,
        activeTrips: 0,
        completedTrips: 0,
        flaggedTrips: 0,
        averageTripValue: 0,
        lastTripDate: null,
        firstTripDate: null,
        relationshipLength: 0,
        revenueTrend: "stable" as const,
        tripFrequency: 0,
        onTimeDeliveryRate: 0,
      };
    }

    // Calculate metrics
    const totalRevenue = clientTrips.reduce((sum, trip) => sum + trip.baseRevenue, 0);
    const activeTrips = clientTrips.filter((trip) => trip.status === "active").length;
    const completedTrips = clientTrips.filter(
      (trip) => trip.status === "completed" || trip.status === "invoiced" || trip.status === "paid"
    ).length;

    const flaggedTrips = clientTrips.filter(
      (trip) => trip.costs && trip.costs.some((cost) => cost.isFlagged)
    ).length;

    const averageTripValue = clientTrips.length > 0 ? totalRevenue / clientTrips.length : 0;

    // Calculate relationship length
    const firstTripDate = new Date(firstTrip.startDate);
    const lastTripDate = new Date(mostRecentTrip.endDate);
    const relationshipLength = Math.floor(
      (Date.now() - firstTripDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine revenue trend
    let revenueTrend: "increasing" | "decreasing" | "stable" = "stable";

    if (clientTrips.length >= 3) {
      const recentTrips = [...clientTrips]
        .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
        .slice(0, 3);

      const oldestRecentTrip = recentTrips[2];
      const middleRecentTrip = recentTrips[1];
      const newestRecentTrip = recentTrips[0];

      // Ensure all trips exist before comparing
      if (
        newestRecentTrip &&
        middleRecentTrip &&
        oldestRecentTrip &&
        newestRecentTrip.baseRevenue > middleRecentTrip.baseRevenue &&
        middleRecentTrip.baseRevenue > oldestRecentTrip.baseRevenue
      ) {
        revenueTrend = "increasing";
      } else if (
        newestRecentTrip &&
        middleRecentTrip &&
        oldestRecentTrip &&
        newestRecentTrip.baseRevenue < middleRecentTrip.baseRevenue &&
        middleRecentTrip.baseRevenue < oldestRecentTrip.baseRevenue
      ) {
        revenueTrend = "decreasing";
      }
    }

    // Calculate average days between trips
    if (clientTrips.length >= 2) {
      const totalDays = (lastTripDate.getTime() - firstTripDate.getTime()) / (1000 * 60 * 60 * 24);
      const tripFrequency = totalDays / (clientTrips.length - 1);

      return {
        totalRevenue,
        totalTrips: clientTrips.length,
        activeTrips,
        completedTrips,
        flaggedTrips,
        averageTripValue,
        lastTripDate: mostRecentTrip.endDate,
        firstTripDate: firstTrip.startDate,
        relationshipLength,
        revenueTrend,
        tripFrequency,
        onTimeDeliveryRate: 0.95, // Placeholder - would be calculated in a real implementation
        mostRecentTrip: mostRecentTrip,
      };
    }

    return {
      totalRevenue,
      totalTrips: clientTrips.length,
      activeTrips,
      completedTrips,
      flaggedTrips,
      averageTripValue,
      lastTripDate: mostRecentTrip.endDate,
      firstTripDate: firstTrip.startDate,
      relationshipLength,
      revenueTrend,
      tripFrequency: 0,
      onTimeDeliveryRate: 0, // Placeholder
      mostRecentTrip: mostRecentTrip,
    };
  }, [selectedClient, trips]);

  // Get top clients by revenue
  const topClientsByRevenue = useMemo(() => {
    // Group trips by client name
    const clientRevenues: Record<string, { revenue: number; client?: Client }> = {};

    trips.forEach((trip) => {
      if (!clientRevenues[trip.clientName]) {
        clientRevenues[trip.clientName] = {
          revenue: 0,
          client: clients.find((client) => client.name === trip.clientName),
        };
      }

      // Safely add revenue - we know it exists because we just created it if it didn't
      clientRevenues[trip.clientName]!.revenue += trip.baseRevenue;
    });

    // Convert to array and sort
    return Object.entries(clientRevenues)
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        client: data.client,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [trips, clients]);

  // Determine the retention status
  const getRetentionStatus = (lastTripDate: string | null) => {
    if (!lastTripDate) return { status: "inactive", class: "bg-red-100 text-red-800" };

    const lastTripTime = new Date(lastTripDate).getTime();
    const now = Date.now();
    const daysSinceLastTrip = Math.floor((now - lastTripTime) / (1000 * 60 * 60 * 24));

    if (daysSinceLastTrip <= 30) {
      return { status: "active", class: "bg-green-100 text-green-800" };
    } else if (daysSinceLastTrip <= 90) {
      return { status: "at risk", class: "bg-yellow-100 text-yellow-800" };
    } else {
      return { status: "inactive", class: "bg-red-100 text-red-800" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <BarChart className="w-6 h-6 mr-2 text-blue-500" />
          Client Analytics & Insights
        </h2>
      </div>

      {selectedClient && clientMetrics ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(clientMetrics.totalRevenue, selectedClient.currency)}
                    </p>
                    <div className="flex items-center mt-1">
                      {clientMetrics.revenueTrend === "increasing" ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : clientMetrics.revenueTrend === "decreasing" ? (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                      )}
                      <p
                        className={`text-xs ${
                          clientMetrics.revenueTrend === "increasing"
                            ? "text-green-500"
                            : clientMetrics.revenueTrend === "decreasing"
                              ? "text-red-500"
                              : "text-gray-500"
                        }`}
                      >
                        {clientMetrics.revenueTrend === "increasing"
                          ? "Increasing"
                          : clientMetrics.revenueTrend === "decreasing"
                            ? "Decreasing"
                            : "Stable"}
                      </p>
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Total Trips</p>
                    <p className="text-2xl font-bold text-gray-900">{clientMetrics.totalTrips}</p>
                    <p className="text-xs text-gray-500">
                      {clientMetrics.activeTrips} active • {clientMetrics.completedTrips} completed
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Relationship</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {clientMetrics.relationshipLength} days
                    </p>
                    <p className="text-xs text-gray-500">
                      Since{" "}
                      {clientMetrics.firstTripDate
                        ? formatDate(clientMetrics.firstTripDate)
                        : "N/A"}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Retention Status</p>
                    <div className="flex items-center mt-1">
                      {clientMetrics.lastTripDate && (
                        <Badge className={getRetentionStatus(clientMetrics.lastTripDate).class}>
                          {getRetentionStatus(clientMetrics.lastTripDate).status.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Last trip:{" "}
                      {clientMetrics.lastTripDate
                        ? formatDate(clientMetrics.lastTripDate)
                        : "Never"}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Performance Insights */}
          <Card>
            <CardHeader title="Performance Insights" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Trip Metrics */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Trip Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Average Trip Value</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(clientMetrics.averageTripValue, selectedClient.currency)}
                      </p>
                    </div>

                    {clientMetrics.tripFrequency > 0 && (
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">Average Trip Frequency</p>
                        <p className="text-sm font-medium text-gray-900">
                          Every {Math.round(clientMetrics.tripFrequency)} days
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Flag className="w-4 h-4 text-amber-500 mr-1" />
                        <p className="text-sm font-medium text-gray-900">
                          {clientMetrics.flaggedTrips} trips with flags
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">On-Time Delivery Rate</p>
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(clientMetrics.onTimeDeliveryRate * 100)}%
                      </p>
                    </div>
                  </div>

                  {/* Most Recent Trip */}
                  {clientMetrics.mostRecentTrip && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Most Recent Trip</h4>
                      <div className="space-y-2 text-sm text-blue-700">
                        <p>
                          <strong>Fleet:</strong> {clientMetrics.mostRecentTrip.fleetNumber}
                        </p>

                        <p>
                          <strong>Route:</strong> {clientMetrics.mostRecentTrip.route}
                        </p>
                        <p>
                          <strong>Date:</strong> {formatDate(clientMetrics.mostRecentTrip.endDate)}
                        </p>
                        <p>
                          <strong>Revenue:</strong>{" "}
                          {formatCurrency(
                            clientMetrics.mostRecentTrip.baseRevenue,
                            selectedClient.currency
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                  <div className="space-y-4">
                    {getRetentionStatus(clientMetrics.lastTripDate).status === "active" ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Active Client</h4>
                        <p className="text-sm text-green-700">
                          This client is active with recent trips. Consider these actions:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-green-700">
                          <li>Schedule a quarterly business review</li>
                          <li>Explore opportunities for additional routes</li>
                          <li>Consider offering volume discounts for increased business</li>
                        </ul>
                      </div>
                    ) : getRetentionStatus(clientMetrics.lastTripDate).status === "at risk" ? (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">At-Risk Client</h4>
                        <p className="text-sm text-yellow-700">
                          This client's activity is declining. Consider these actions:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-yellow-700">
                          <li>Reach out to schedule a meeting to discuss needs</li>
                          <li>Send a satisfaction survey to identify concerns</li>
                          <li>Offer incentives for a return booking</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <h4 className="text-sm font-medium text-red-800 mb-2">Inactive Client</h4>
                        <p className="text-sm text-red-700">
                          This client hasn't booked in over 90 days. Consider these actions:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-red-700">
                          <li>Implement a win-back campaign</li>
                          <li>Review previous issues to identify barriers</li>
                          <li>Consider a special offer or discount</li>
                          <li>Evaluate client profitability before intensive re-engagement</li>
                        </ul>
                      </div>
                    )}

                    {/* Revenue Trend Recommendation */}
                    {clientMetrics.revenueTrend === "increasing" ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="text-sm font-medium text-green-800 mb-2">
                          Increasing Revenue
                        </h4>
                        <p className="text-sm text-green-700">
                          This client's spending is increasing. Consider these actions:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-green-700">
                          <li>Recognize and acknowledge their increased business</li>
                          <li>Review for potential loyalty program tier upgrade</li>
                          <li>Explore additional service offerings</li>
                        </ul>
                      </div>
                    ) : clientMetrics.revenueTrend === "decreasing" ? (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">
                          Decreasing Revenue
                        </h4>
                        <p className="text-sm text-yellow-700">
                          This client's spending is decreasing. Consider these actions:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-yellow-700">
                          <li>Schedule a call to discuss their changing needs</li>
                          <li>Review pricing and service offerings</li>
                          <li>Identify and address any service issues</li>
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          {/* Top Clients Overview when no client is selected */}
          <Card>
            <CardHeader title="Top Clients by Revenue" />
            <CardContent>
              <div className="space-y-6">
                {topClientsByRevenue.map((clientData) => (
                  <div
                    key={clientData.name}
                    className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => clientData.client && onSelectClient(clientData.client.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <Building className="w-6 h-6 text-gray-400 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{clientData.name}</h3>
                          <p className="text-sm text-gray-500">
                            {clientData.client?.type === "internal"
                              ? "Internal Client"
                              : "External Client"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(clientData.revenue, clientData.client?.currency || "ZAR")}
                        </p>
                        <p className="text-xs text-gray-500">Total Revenue</p>
                      </div>
                    </div>

                    {clientData.client && (
                      <button
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClient(clientData.client!.id);
                        }}
                      >
                        View Analysis →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-4">Client Analytics Dashboard</h3>
            <p className="text-blue-700">
              Select a client from the client list or the top clients above to view detailed
              analytics and insights. The analytics dashboard provides:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-blue-700">
              <li>Revenue tracking and trend analysis</li>
              <li>Trip history and frequency analysis</li>
              <li>Retention status and recommendations</li>
              <li>Performance insights and improvement suggestions</li>
              <li>Client relationship visualizations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAnalytics;
