import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useFleetAnalytics } from "../../../context/FleetAnalyticsContext";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function FleetUtilizationLine() {
  const { fleetUtilization, isLoading } = useFleetAnalytics();

  const data = {
    labels: fleetUtilization.map((item) => item.month),
    datasets: [
      {
        label: "Utilization %",
        data: fleetUtilization.map((item) => item.utilization),
        fill: false,
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  if (isLoading) {
    return <div className="w-full h-48 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Fleet Utilization Trend",
            },
            tooltip: {
              callbacks: {
                label: (context) => `Utilization: ${context.raw}%`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function (value) {
                  return value + "%";
                },
              },
            },
          },
        }}
      />
    </div>
  );
}

export default FleetUtilizationLine;
