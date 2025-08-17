import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import React from "react";
import { Link, Outlet } from "react-router-dom";

/**
 * This is a test wrapper for all of our form components and pages
 * It provides navigation links to the different form types we've implemented
 */
const FormsTestWrapper: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <h1 className="text-2xl font-bold">Forms Integration Test Suite</h1>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Use this page to test all form components that have been refactored with the new
            architecture. Select from the links below to test different form components.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/forms-test/drivers"
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold p-4 rounded flex flex-col items-center justify-center text-center"
            >
              <span className="text-xl mb-2">👤</span>
              Driver Form
            </Link>

            <Link
              to="/forms-test/clients"
              className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold p-4 rounded flex flex-col items-center justify-center text-center"
            >
              <span className="text-xl mb-2">🏢</span>
              Client Form
            </Link>

            <Link
              to="/forms-test/vehicles"
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold p-4 rounded flex flex-col items-center justify-center text-center"
            >
              <span className="text-xl mb-2">🚚</span>
              Vehicle Form
            </Link>

            <Link
              to="/forms-test/trips"
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold p-4 rounded flex flex-col items-center justify-center text-center"
            >
              <span className="text-xl mb-2">🛣️</span>
              Trip Form
            </Link>

            <Link
              to="/forms-test/invoices"
              className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold p-4 rounded flex flex-col items-center justify-center text-center"
            >
              <span className="text-xl mb-2">📄</span>
              Invoice Form
            </Link>

            <Link
              to="/forms-test/diesel"
              className="bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold p-4 rounded flex flex-col items-center justify-center text-center"
            >
              <span className="text-xl mb-2">⛽</span>
              Diesel Entry Form
            </Link>
          </div>
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Development Notes:</h3>
            <ul className="text-sm text-gray-600 list-disc pl-5">
              <li>All forms implement offline support using useOfflineForm hook</li>
              <li>Forms handle both creation and editing scenarios</li>
              <li>Validation is implemented for all required fields</li>
              <li>These forms are designed to be used in both modal and standalone contexts</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* This will render the child route component */}
      <Outlet />
    </div>
  );
};

export default FormsTestWrapper;
