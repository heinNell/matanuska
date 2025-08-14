import React from "react";
import DriverManagementPage from "./DriverManagementPageIntegrated";

const DriverManagementWrapper: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <DriverManagementPage />
    </div>
  );
};

export default DriverManagementWrapper;
