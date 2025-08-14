import { Button } from "@/components/ui/Button";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Clipboard, ClipboardCheck, FileText, Plus, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import InspectionList from "../../components/lists/InspectionList";

interface InspectionManagementProps {
  status?: "active" | "completed" | "templates";
}

const InspectionManagement: React.FC<InspectionManagementProps> = ({ status = "active" }) => {
  const [activeTab, setActiveTab] = useState(status);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000); // Clear error after 5 seconds
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inspection Management</h2>
          <p className="text-gray-600">Create, track and manage vehicle inspections</p>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search inspections..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded px-2 py-1"
          />
          <Button
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => {
              try {
                // Refresh logic here
                console.log("Refreshing inspections");
              } catch (err) {
                handleError(
                  `Failed to refresh inspections: ${err instanceof Error ? err.message : "Unknown error"}`
                );
              }
            }}
          >
            Refresh
          </Button>
          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              try {
                // New inspection logic here
                console.log("Creating new inspection");
              } catch (err) {
                handleError(
                  `Failed to create new inspection: ${err instanceof Error ? err.message : "Unknown error"}`
                );
              }
            }}
          >
            New Inspection
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "active" | "completed" | "templates")}
      >
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            <span>Active Inspections</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            <span>Completed Inspections</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Inspection Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <InspectionList status="active" />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <InspectionList status="completed" />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader title="Inspection Templates" />
            <CardContent>
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No templates available yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">Templates will be displayed here</p>
                <div className="mt-6">
                  <Button
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      try {
                        // Create template logic here
                        console.log("Creating new template");
                      } catch (err) {
                        handleError(
                          `Failed to create template: ${err instanceof Error ? err.message : "Unknown error"}`
                        );
                      }
                    }}
                  >
                    Create Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InspectionManagement;
