import { Button } from "@/components/ui/Button";
import { Copy, Edit, Plus, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import Card, { CardContent, CardHeader } from "../ui/Card";
import SyncIndicator from "../ui/SyncIndicator";

interface TripTemplate {
  id: string;
  name: string;
  origin: string;
  destination: string;
  vehicleType: string;
  loadType: string;
  estimatedDistance: number;
  estimatedDuration: string;
  defaultDriver?: string;
  created: string;
  lastUsed?: string;
  useCount: number;
}

const TripTemplateManager: React.FC = () => {
  const { isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  // Event handlers
  const handleTemplateAction = (actionType: string, templateId: string) => {
    // In a real implementation, these would perform the actual operations
    console.log(`${actionType} template with ID: ${templateId}`);
  };

  // Mock data - would be fetched from Firestore in real implementation
  const tripTemplates: TripTemplate[] = [
    {
      id: "TPL-001",
      name: "Windhoek to Walvis Bay Standard Freight",
      origin: "Windhoek Central Depot",
      destination: "Walvis Bay Port Terminal",
      vehicleType: "Heavy Duty Truck",
      loadType: "General Container",
      estimatedDistance: 360,
      estimatedDuration: "5 hours",
      defaultDriver: "T. Nangolo",
      created: "2025-04-12",
      lastUsed: "2025-07-01",
      useCount: 28,
    },
    {
      id: "TPL-002",
      name: "Perishable Goods Northern Route",
      origin: "Windhoek Distribution Center",
      destination: "Oshakati Central Market",
      vehicleType: "Refrigerated Truck",
      loadType: "Perishable Foods",
      estimatedDistance: 715,
      estimatedDuration: "8 hours",
      defaultDriver: "M. Shapumba",
      created: "2025-03-18",
      lastUsed: "2025-06-28",
      useCount: 16,
    },
    {
      id: "TPL-003",
      name: "Mining Supplies to Rosh Pinah",
      origin: "Windhoek Industrial Zone",
      destination: "Rosh Pinah Mine Site",
      vehicleType: "Heavy Hauler",
      loadType: "Mining Equipment",
      estimatedDistance: 640,
      estimatedDuration: "7.5 hours",
      created: "2025-05-22",
      lastUsed: "2025-06-30",
      useCount: 6,
    },
    {
      id: "TPL-004",
      name: "Fuel Delivery Southern Route",
      origin: "Walvis Bay Fuel Depot",
      destination: "Keetmanshoop Distribution",
      vehicleType: "Fuel Tanker",
      loadType: "Diesel Fuel",
      estimatedDistance: 825,
      estimatedDuration: "9 hours",
      defaultDriver: "J. van Wyk",
      created: "2025-01-15",
      lastUsed: "2025-06-25",
      useCount: 42,
    },
    {
      id: "TPL-005",
      name: "Cross-Border Freight to Gaborone",
      origin: "Windhoek Logistics Hub",
      destination: "Gaborone Distribution Center",
      vehicleType: "Long Haul Truck",
      loadType: "Mixed Freight",
      estimatedDistance: 950,
      estimatedDuration: "12 hours",
      created: "2025-06-10",
      useCount: 2,
    },
  ];

  const filteredTemplates = searchTerm
    ? tripTemplates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.destination.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tripTemplates;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Templates</h1>
          <p className="text-gray-600">Create and manage reusable trip configurations</p>
        </div>
        <div className="flex space-x-2 items-center">
          <SyncIndicator />
          <Button variant="outline" icon={<Search className="w-4 h-4" />}>
            Import Templates
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} disabled={isLoading?.trips}>
            New Template
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template List */}
      <Card>
        <CardHeader title="Trip Templates" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Load Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{template.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {template.origin} → {template.destination}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{template.vehicleType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{template.loadType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {template.estimatedDistance} km
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{template.useCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleTemplateAction("copy", template.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800"
                          onClick={() => handleTemplateAction("edit", template.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleTemplateAction("delete", template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Template Details Preview */}
      <Card>
        <CardHeader title="Template Usage Statistics" />
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 italic">
              Template usage statistics visualization would be displayed here. Charts showing
              frequently used templates and trends.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripTemplateManager;
