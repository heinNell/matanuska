import React from "react";
import { useFleetAnalytics } from "../../../context/FleetAnalyticsContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ROIBarChart() {
  const { monthlyROI, isLoading } = useFleetAnalytics();

  const data = {
    labels: monthlyROI.map((item) => item.month),
    datasets: [
      {
        label: "ROI %",
        data: monthlyROI.map((item) => item.roi),
        backgroundColor: "#2563eb",
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  };

  if (isLoading) {
    return <div className="w-full h-48 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `ROI: ${context.raw}%`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value) => `${value}%`,
              },
            },
          },
        }}
      />
    </div>
  );
}

export default ROIBarChart;
