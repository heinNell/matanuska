import React from "react";
import { ScanQRButton } from "../ScanQRButton";
import TyreInspectionPDFGenerator from "../Tyremanagement/TyreInspectionPDFGenerator";
import InspectionFormPDS from "../ui/InspectionFormPDS";
import { JobCardTable } from "../ui/JobCardTable";
import { VendorTable } from "../ui/VendorTable";

/**
 * This component serves as an integration point for all workshop-related components.
 * It's designed to ensure that all workshop components are properly connected and available
 * for use in the application.
 *
 * For actual implementation, you should use the specific components directly in your pages,
 * rather than using this integration component.
 */
const WorkshopIntegration: React.FC = () => {
  // Sample data for components
  const sampleInspectionData = {
    fleetNumber: "FL-123",
    position: "Front Left",
    tyreBrand: "Michelin",
    tyreSize: "315/80R22.5",
    treadDepth: "8.5",
    pressure: "110",
    condition: "Good",
    notes: "Regular wear pattern",
    inspectorName: "John Smith",
    odometer: "45000",
    inspectionDate: new Date().toISOString(),
  };

  const sampleVendors = [
    {
      id: "1",
      name: "Auto Parts Supply",
      contactPerson: "John Doe",
      email: "john@autoparts.com",
      phone: "123-456-7890",
    },
    {
      id: "2",
      name: "Truck Parts Inc",
      contactPerson: "Jane Smith",
      email: "jane@truckparts.com",
      phone: "098-765-4321",
    },
  ];

  const sampleJobCards = [
    {
      id: "1",
      vehicle: "FL-123",
      description: "Tyre Replacement",
      status: "Completed",
      date: "2023-10-15",
    },
    {
      id: "2",
      vehicle: "FL-456",
      description: "Oil Change",
      status: "In Progress",
      date: "2023-10-16",
    },
  ];

  return (
    <div className="workshop-integration">
      <h1>Workshop Component Integration</h1>

      {/* This is a demonstration of all workshop components.
          In a real application, you would use these components
          directly in your pages as needed. */}

      <div style={{ display: "none" }}>
        {/* These components are rendered hidden just to ensure they're properly imported */}
        <ScanQRButton />
        <TyreInspectionPDFGenerator
          inspectionData={sampleInspectionData}
          companyName="Matanuska Transport"
        />
        {/* VendorTable doesn't accept props - it uses internal data */}
        <VendorTable />
        <InspectionFormPDS />
        {/* JobCardTable requires specific props */}
        <JobCardTable
          data={[
            {
              id: "1",
              woNumber: "WO-001",
              createdAt: "2023-10-15",
              vehicle: "FL-123",
              dueDate: "2023-10-20",
              status: "COMPLETED",
              priority: "MEDIUM",
              assigned: ["John Doe"],
              memo: "Tyre Replacement",
            },
            {
              id: "2",
              woNumber: "WO-002",
              createdAt: "2023-10-16",
              vehicle: "FL-456",
              dueDate: "2023-10-25",
              status: "INITIATED",
              priority: "LOW",
              assigned: ["Jane Smith"],
              memo: "Oil Change",
            },
          ]}
          onAction={(id, action) => console.log(`Action ${action} on job card ${id}`)}
          onView={(id) => console.log(`View job card ${id}`)}
        />
      </div>

      <p>This component serves as an integration point for all workshop-related components.</p>
      <p>
        In a production environment, you should use the specific components directly in your pages.
      </p>

      {/* Display sample data for demonstration */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Sample Vendors ({sampleVendors.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {sampleVendors.map((vendor) => (
            <div key={vendor.id} className="border p-3 rounded">
              <h4 className="font-medium">{vendor.name}</h4>
              <p className="text-sm text-gray-600">Contact: {vendor.contactPerson}</p>
              <p className="text-sm text-gray-600">Email: {vendor.email}</p>
              <p className="text-sm text-gray-600">Phone: {vendor.phone}</p>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-2">Sample Job Cards ({sampleJobCards.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleJobCards.map((jobCard) => (
            <div key={jobCard.id} className="border p-3 rounded">
              <h4 className="font-medium">Vehicle: {jobCard.vehicle}</h4>
              <p className="text-sm text-gray-600">Description: {jobCard.description}</p>
              <p className="text-sm text-gray-600">Status: {jobCard.status}</p>
              <p className="text-sm text-gray-600">Date: {jobCard.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopIntegration;
