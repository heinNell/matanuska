import React from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"; // FIX: Correct path is 'chart.js'
import { Doughnut } from "react-chartjs-2";
import { useFleetAnalytics } from "../../../context/FleetAnalyticsContext";

// Register Chart.js components globally
ChartJS.register(ArcElement, Tooltip, Legend);

export function FleetStatusDoughnut() {
  const { fleetStatus, isLoading } = useFleetAnalytics();

  // Safe fallback in case fleetStatus is undefined
  const operational = fleetStatus?.operational ?? 0;
  const maintenance = fleetStatus?.maintenance ?? 0;
  const percentOperational = fleetStatus?.percentOperational ?? 0;

  const data = {
    labels: ["Operational", "Under Maintenance"],
    datasets: [
      {
        label: "Vehicles",
        data: [operational, maintenance],
        backgroundColor: ["#2563eb", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto" style={{ height: "250px" }}>
      <Doughnut
        data={data}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "bottom" as const,
            },
            tooltip: {
              callbacks: {
                label: (context) =>
                  `${context.label}: ${context.raw} vehicles`,
              },
            },
          },
          cutout: "70%",
        }}
      />
      <div className="text-center mt-2 text-lg font-semibold">
        {percentOperational}% Operational
      </div>
      <div className="text-xs text-gray-500">
        {operational} vehicles, {maintenance} under maintenance
      </div>
    </div>
  );
}

export default FleetStatusDoughnut;
