import React from "react";
import TyreReferenceManager from "../../components/Tyremanagement/TyreReferenceManager";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

/**
 * Page component for managing tyre reference data
 * This page provides an interface to add, edit, and delete tyre brands, sizes, patterns,
 * and vehicle positions used throughout the application
 */
const TyreReferenceManagerPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tyre Reference Data Management</h1>

      <div className="mb-6">
        <p className="text-gray-600">
          Use this page to manage reference data for the tyre management system, including tyre
          brands, sizes, patterns, and vehicle positions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tyre Reference Data</CardTitle>
        </CardHeader>
        <CardContent>
          <TyreReferenceManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default TyreReferenceManagerPage;
