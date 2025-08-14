import { Button } from "@/components/ui/Button";
import { ChevronRight, Layers, Package, Plus, RefreshCw } from "lucide-react";
import React from "react";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import { useAppContext } from "../../context/AppContext";

const LoadPlanningPage: React.FC = () => {
  const { isLoading } = useAppContext();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Load Planning</h1>
          <p className="text-gray-600">Optimize cargo loading for maximum efficiency</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} disabled={isLoading.trips}>
            New Load Plan
          </Button>
        </div>
      </div>

      {/* Pending Loads */}
      <Card>
        <CardHeader title="Pending Loads" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Load #{1000 + index}</h3>
                      <p className="text-sm text-gray-500">Scheduled: 2025-07-{10 + index}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Origin:</span>
                    <span className="font-medium">Windhoek</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-medium">Walvis Bay</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{10 + index * 3}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{1000 + index * 250} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Vehicles */}
      <Card>
        <CardHeader title="Available Vehicles for Loading" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4].map((index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      VH-{2000 + index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {["Semi-Trailer", "Box Truck", "Flatbed", "Container Truck"][index - 1]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {[15000, 8000, 12000, 20000][index - 1]} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {["Windhoek", "Walvis Bay", "Windhoek", "Swakopmund"][index - 1]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Available
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button size="sm" variant="outline">
                        Assign Load
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Load Templates */}
      <Card>
        <CardHeader title="Load Templates" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Layers className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {["Standard Container", "Mixed Cargo"][index - 1]}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {["40ft Container", "Semi-Trailer"][index - 1]}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items per Load:</span>
                    <span className="font-medium">{[24, 18][index - 1]}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Optimal Weight:</span>
                    <span className="font-medium">{[22000, 15000][index - 1]} kg</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Loading Time:</span>
                    <span className="font-medium">{[60, 90][index - 1]} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadPlanningPage;
