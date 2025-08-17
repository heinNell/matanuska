import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import { ClipboardList, Map, Truck, User } from "lucide-react";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import MapsView from "../../components/Map/MapsView";
import MissedLoadsTracker from "../../components/TripManagement/MissedLoadsTracker";
import { useAppContext } from "../../context/AppContext";
import DieselDashboard from "../diesel/DieselDashboard";
import DriverBehaviorPage from "../drivers/DriverBehaviorPage";

const FleetManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Get missed loads data and functions from context
  const { missedLoads, addMissedLoad, updateMissedLoad, deleteMissedLoad } = useAppContext();

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams(value === "overview" ? {} : { tab: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Fleet Management</h1>
          <p className="text-gray-600">Manage your fleet vehicles, drivers, and resources</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Fleet Overview</span>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Driver Management</span>
          </TabsTrigger>
          <TabsTrigger value="diesel" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Diesel Management</span>
          </TabsTrigger>
          <TabsTrigger value="missed-loads" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span>Missed Loads</span>
          </TabsTrigger>
          <TabsTrigger value="maps" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span>Maps</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Fleet Overview</h2>
            <p className="text-gray-600">Fleet overview dashboard will be displayed here.</p>
            {/* This would be replaced with a proper Fleet Overview component */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-2 text-blue-700">Active Vehicles</h3>
                <p className="text-3xl font-bold text-blue-800">32</p>
                <p className="text-sm text-blue-600 mt-1">4 in maintenance</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-2 text-green-700">Total Distance</h3>
                <p className="text-3xl font-bold text-green-800">24,561 km</p>
                <p className="text-sm text-green-600 mt-1">Last 30 days</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-2 text-purple-700">Fuel Efficiency</h3>
                <p className="text-3xl font-bold text-purple-800">3.2 km/L</p>
                <p className="text-sm text-purple-600 mt-1">Fleet average</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="mt-6">
          <DriverBehaviorPage />
        </TabsContent>

        <TabsContent value="diesel" className="mt-6">
          <DieselDashboard />
        </TabsContent>

        <TabsContent value="missed-loads" className="mt-6">
          <MissedLoadsTracker
            missedLoads={missedLoads}
            onAddMissedLoad={addMissedLoad}
            onUpdateMissedLoad={updateMissedLoad}
            onDeleteMissedLoad={deleteMissedLoad}
          />
        </TabsContent>

        <TabsContent value="maps" className="mt-6">
          <MapsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FleetManagementPage;
