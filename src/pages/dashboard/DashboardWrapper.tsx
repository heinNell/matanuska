import React from "react";
import ConsolidatedDashboard from "./ConsolidatedDashboard";

const DashboardWrapper: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <ConsolidatedDashboard />
    </div>
  );
};

export default DashboardWrapper;
