import React from "react";
import { Route, Routes } from "react-router-dom";
import ActiveTrips from "../../pages/trips/ActiveTripsPageEnhanced";
import CompletedTrips from "../../pages/trips/CompletedTrips";
import TripManagement from "../../pages/trips/TripManagementPage";
import WialonMapComponent from "../../pages/wialon/WialonMapComponent";
import TripForm from "../forms/trips/TripForm";
// import CompletedTripEditModal from "../../components/Models/Trips/CompletedTripEditModal"; // Unused, removed

const TripRouter: React.FC = () => {
  // const defaultCurrency: SupportedCurrency = "USD"; // Unused, removed

  const onClick = () => {
    console.log("Button clicked");
  };

  return (
    <Routes>
      <Route path="/" element={<TripManagement />} />
      <Route path="/active" element={<ActiveTrips />} />
      <Route
        path="/completed"
        element={
          <CompletedTrips
            trips={[]}
            onView={(tripId) => console.log(`View trip with ID: ${tripId}`)}
          />
        }
      />
      <Route
        path="/new"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Add New Trip</h1>
            <TripForm
              onSubmit={async (data: any) => {
                console.log("Trip data submitted:", data);
                // TODO: Connect to Firebase backend
              }}
              onCancel={() => window.history.back()}
            />
          </div>
        }
      />
      <Route
        path="/calendar"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Trip Calendar</h1>
            <div className="text-center py-16">
              <p className="text-gray-600">Trip calendar view coming soon</p>
            </div>
          </div>
        }
      />
      <Route
        path="/routes"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Route Planning</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">Quick Route Builder</h3>
                <p className="text-gray-600 mb-4">Create optimized routes for your fleet</p>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={onClick}
                >
                  Start Planning
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">Route Templates</h3>
                <p className="text-gray-600 mb-4">Use pre-built route templates</p>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={onClick}
                >
                  View Templates
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">Route Analytics</h3>
                <p className="text-gray-600 mb-4">Analyze route performance and efficiency</p>
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  onClick={onClick}
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        }
      />
      <Route
        path="/driver-performance"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Driver Performance</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-green-600">Top Performers</h3>
                <p className="text-3xl font-bold">12</p>
                <p className="text-gray-600">Drivers with 95%+ scores</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-blue-600">Average Score</h3>
                <p className="text-3xl font-bold">87.3</p>
                <p className="text-gray-600">Fleet performance average</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-orange-600">Needs Training</h3>
                <p className="text-3xl font-bold">3</p>
                <p className="text-gray-600">Drivers below 80%</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-purple-600">Safety Incidents</h3>
                <p className="text-3xl font-bold">2</p>
                <p className="text-gray-600">This month</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Recent Driver Events</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">John Smith - Excellent Fuel Efficiency</p>
                    <p className="text-sm text-gray-600">+5 points • Fleet #101 • 2 hours ago</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <p className="font-medium">Mike Johnson - Late Delivery</p>
                    <p className="text-sm text-gray-600">-2 points • Fleet #205 • 4 hours ago</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">Sarah Wilson - Customer Compliment</p>
                    <p className="text-sm text-gray-600">+3 points • Fleet #312 • 6 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Fuel Efficiency</span>
                      <span className="text-sm">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">On-Time Delivery</span>
                      <span className="text-sm">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "89%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Safety Score</span>
                      <span className="text-sm">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      />
      <Route
        path="/optimization"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Route Optimization</h1>
            <div className="text-center py-16">
              <p className="text-gray-600">Route optimization coming soon</p>
            </div>
          </div>
        }
      />
      <Route
        path="/load-planning"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Load Planning</h1>
            <div className="text-center py-16">
              <p className="text-gray-600">Load planning functionality coming soon</p>
            </div>
          </div>
        }
      />
      <Route
        path="/reports"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Trip Reports</h1>
            <div className="text-center py-16">
              <p className="text-gray-600">Trip reports coming soon</p>
            </div>
          </div>
        }
      />
      <Route
        path="/cost-analysis"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Trip Cost Analysis</h1>
            <div className="text-center py-16">
              <p className="text-gray-600">Cost analysis functionality coming soon</p>
            </div>
          </div>
        }
      />
      <Route
        path="/utilization"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Fleet Utilization</h1>
            <div className="text-center py-16">
              <p className="text-gray-600">Fleet utilization reports coming soon</p>
            </div>
          </div>
        }
      />
      <Route
        path="/confirmations"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Delivery Confirmations</h1>
            <div className="text-center py-16">
              <p className="text-gray-600">Delivery confirmation system coming soon</p>
            </div>
          </div>
        }
      />
      <Route
        path="/templates"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Trip Templates</h1>
            <div className="text-center py-16">
              <p className="text-gray-600">Trip templates functionality coming soon</p>
            </div>
          </div>
        }
      />
      <Route path="/maps" element={<WialonMapComponent />} />
      <Route
        path="/missed-loads"
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Missed Loads</h1>
            <div className="text-center py-16">
              <p className="text-gray-600">Missed loads tracking coming soon</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default TripRouter;
