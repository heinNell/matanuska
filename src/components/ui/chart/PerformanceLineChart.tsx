import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Fuel Efficiency",
      data: [65, 59, 80, 81, 56, 55, 60],
      fill: false,
      borderColor: "#8884d8",
      tension: 0.1,
    },
    {
      label: "Maintenance Cost",
      data: [28, 48, 40, 19, 36, 27, 20],
      fill: false,
      borderColor: "#82ca9d",
      tension: 0.1,
    },
  ],
};

export function PerformanceLineChart() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top" as const,
            },
            title: {
              display: true,
              text: "Fleet Performance Metrics",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}

export default PerformanceLineChart;
