import React from "react";
import { Card, CardContent } from "../../components/ui/Card";

const InventoryReportsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Inventory Reports</h1>

      <Card className="mb-6">
        <CardContent>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Inventory Reports Dashboard</h2>
            <p className="text-gray-600 mb-4">
              View and generate reports about inventory status, movements, and valuations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">Inventory Valuation</h3>
                <p className="text-sm text-gray-500">Current stock value and cost analysis</p>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">Stock Movement</h3>
                <p className="text-sm text-gray-500">Track item receipts and issues over time</p>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">Aging Analysis</h3>
                <p className="text-sm text-gray-500">Identify slow-moving and obsolete inventory</p>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">Reorder Report</h3>
                <p className="text-sm text-gray-500">Items at or below reorder level</p>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">Usage Statistics</h3>
                <p className="text-sm text-gray-500">Consumption patterns and demand forecasting</p>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">Location Audit</h3>
                <p className="text-sm text-gray-500">Items by storage location and warehouse</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This page is under development. Additional reporting features will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReportsPage;
