import React from "react";
import { useRealtimeTrips, Trip } from "../../hooks/useRealtimeTrips";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Calendar, Clock, MapPin } from "lucide-react";

// This is an example component showing how to use the real-time trips 
// data for timeline/Gantt chart integration
const TripTimelineLive: React.FC = () => {
  // Get only active trips from Web Book for timeline display
  const { trips, loading, error } = useRealtimeTrips({ 
    onlyWebBook: true, 
    status: "active" 
  });

  // Transform trips data for timeline/Gantt usage
  const timelineEvents = trips.map((trip: Trip) => ({
    id: trip.id,
    title: `${trip.customer} - ${trip.loadRef}`,
    start_time: trip.startTime ? new Date(trip.startTime) : new Date(),
    end_time: trip.endTime ? new Date(trip.endTime) : null,
    description: `${trip.origin} → ${trip.destination}`,
    status: trip.deliveredStatus ? 'delivered' : trip.shippedStatus ? 'shipped' : 'active',
    resource: trip.customer,
    duration: trip.tripDurationHours || 0,
    // Additional fields for Gantt charts
    progress: trip.deliveredStatus ? 100 : trip.shippedStatus ? 50 : 25,
    color: trip.deliveredStatus ? '#10B981' : trip.shippedStatus ? '#3B82F6' : '#F59E0B'
  }));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2">Loading timeline data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Error loading timeline: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trips.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active trips</h3>
            <p className="mt-1 text-sm text-gray-500">
              No web book trips are currently active.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">
            Live Trip Timeline (Web Book)
          </h2>
          <p className="text-sm text-gray-600">
            Real-time active trips ready for Gantt/Timeline integration
          </p>
        </CardHeader>
        <CardContent>
          {/* Timeline Events Data Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Timeline Events Ready for Integration:
            </h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(timelineEvents.slice(0, 2), null, 2)}
            </pre>
            {timelineEvents.length > 2 && (
              <p className="text-xs text-gray-500 mt-2">
                ... and {timelineEvents.length - 2} more events
              </p>
            )}
          </div>

          {/* Visual Timeline Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Active Trips Timeline</h3>
            {trips.map((trip: Trip) => (
              <div key={trip.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{trip.loadRef}</span>
                    <span className="text-sm text-gray-500">- {trip.customer}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trip.deliveredStatus 
                        ? 'bg-green-100 text-green-800' 
                        : trip.shippedStatus 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trip.deliveredStatus ? 'Delivered' : trip.shippedStatus ? 'Shipped' : 'Active'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{trip.origin}</span>
                  <span>→</span>
                  <span>{trip.destination}</span>
                </div>
                
                {trip.startTime && (
                  <div className="mt-2 text-xs text-gray-500">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Started: {new Date(trip.startTime).toLocaleString()}
                    {trip.endTime && (
                      <span className="ml-4">
                        Ended: {new Date(trip.endTime).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        trip.deliveredStatus 
                          ? 'bg-green-500' 
                          : trip.shippedStatus 
                          ? 'bg-blue-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${trip.deliveredStatus ? 100 : trip.shippedStatus ? 50 : 25}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">
            Timeline/Gantt Integration Guide
          </h3>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm text-gray-600">
            <p>
              The <code>timelineEvents</code> array above contains the data formatted 
              for popular timeline/Gantt libraries:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>id:</strong> Unique identifier for the event</li>
              <li><strong>title:</strong> Display name for the timeline</li>
              <li><strong>start_time & end_time:</strong> Date objects for scheduling</li>
              <li><strong>progress:</strong> Completion percentage (0-100)</li>
              <li><strong>color:</strong> Hex color based on status</li>
              <li><strong>resource:</strong> Grouping field (customer)</li>
            </ul>
            <p className="mt-3 text-xs">
              This data updates in real-time via Firestore onSnapshot listeners.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripTimelineLive;
