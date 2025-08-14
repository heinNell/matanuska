import FuelEntryForm, { FuelEntryData } from "@/components/forms/diesel/FuelEntryForm";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BarChart2, Droplet, Plus, Truck } from "lucide-react";
import React, { useState } from "react";

const DieselPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddFuelEntry = async (data: FuelEntryData) => {
    console.log("Form data:", data);
    // Here you would submit to Firebase/Firestore
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowAddForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Diesel Management</h1>
        <Button className="flex items-center gap-2" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4" />
          Add Fuel Entry
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add New Fuel Entry</h2>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FuelEntryForm onSubmit={handleAddFuelEntry} onCancel={() => setShowAddForm(false)} />
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">
            <Droplet className="mr-1 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            <Truck className="mr-1 h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="mr-1 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Diesel Dashboard</h3>
            </CardHeader>
            <CardContent>
              <p>Dashboard content will be displayed here.</p>
              {/* Dashboard content */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Vehicle Consumption</h3>
            </CardHeader>
            <CardContent>
              <p>Vehicle consumption data will be displayed here.</p>
              {/* Vehicle content */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Diesel Analytics</h3>
            </CardHeader>
            <CardContent>
              <p>Analytics data will be displayed here.</p>
              {/* Analytics content */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DieselPage;
