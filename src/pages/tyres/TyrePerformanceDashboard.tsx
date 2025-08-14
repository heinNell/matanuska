import React from "react";
import TyrePerformanceReport from "../../components/Tyremanagement/TyrePerformanceReport";

const TyrePerformanceDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Tyre Performance Dashboard</h1>
        <p className="text-gray-600">High-level analytics and detailed performance report.</p>
      </div>
      <TyrePerformanceReport />
    </div>
  );
};

export default TyrePerformanceDashboard;
