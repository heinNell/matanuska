import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useFleetAnalytics } from "../../../context/FleetAnalyticsContext";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export function FleetStatusDoughnut() {
  const { fleetStatus, isLoading } = useFleetAnalytics();

  const data = {
    labels: ["Operational", "Under Maintenance"],
    datasets: [
      {
        label: "Vehicles",
        data: [fleetStatus.operational, fleetStatus.maintenance],
        backgroundColor: ["#2563eb", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return <div className="w-full h-48 flex items-center justify-center">Loading...</div>;
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
          },
          cutout: "70%",
        }}
      />
      <div className="text-center mt-2 text-lg font-semibold">
        {fleetStatus.percentOperational}% Operational
      </div>
      <div className="text-xs text-gray-500">
        {fleetStatus.operational} vehicles, {fleetStatus.maintenance} under maintenance
      </div>
    </div>
  );
}

export default FleetStatusDoughnut;
