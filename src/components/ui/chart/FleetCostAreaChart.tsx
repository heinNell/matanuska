import React from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { date: "2025-01", operations: 6800, maintenance: 2400 },
  { date: "2025-02", operations: 7300, maintenance: 1800 },
  { date: "2025-03", operations: 8200, maintenance: 2900 },
  { date: "2025-04", operations: 8700, maintenance: 3100 },
  { date: "2025-05", operations: 9000, maintenance: 2200 },
  { date: "2025-06", operations: 8500, maintenance: 2500 },
  { date: "2025-07", operations: 7900, maintenance: 2800 },
];

export function FleetCostAreaChart() {
  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-medium mb-3">Fleet Cost Analysis</h3>
      <ResponsiveContainer width="100%" height="90%" minWidth={300} minHeight={250}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorOperations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
              });
            }}
          />
          <YAxis tickFormatter={(value: number) => `$${value}`} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            formatter={(value: number) => [`$${value}`, undefined]}
            labelFormatter={(label: string) => {
              const date = new Date(label);
              return date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              });
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="operations"
            name="Operational Costs"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorOperations)"
          />
          <Area
            type="monotone"
            dataKey="maintenance"
            name="Maintenance Costs"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorMaintenance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FleetCostAreaChart;
