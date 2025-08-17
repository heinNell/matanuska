import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/consolidated/Card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart/recharts/chart-container";

const chartData = [
  { date: "2025-01-01", idleTime: 222, activeTime: 150 },
  { date: "2025-01-02", idleTime: 97, activeTime: 180 },
  { date: "2025-01-03", idleTime: 167, activeTime: 120 },
  { date: "2025-01-04", idleTime: 242, activeTime: 260 },
  { date: "2025-01-05", idleTime: 373, activeTime: 290 },
  { date: "2025-01-06", idleTime: 301, activeTime: 340 },
  { date: "2025-01-07", idleTime: 245, activeTime: 180 },
  { date: "2025-01-08", idleTime: 409, activeTime: 320 },
  { date: "2025-01-09", idleTime: 59, activeTime: 110 },
  { date: "2025-01-10", idleTime: 261, activeTime: 190 },
  { date: "2025-01-11", idleTime: 327, activeTime: 350 },
  { date: "2025-01-12", idleTime: 292, activeTime: 210 },
  { date: "2025-01-13", idleTime: 342, activeTime: 380 },
  { date: "2025-01-14", idleTime: 137, activeTime: 220 },
  { date: "2025-01-15", idleTime: 120, activeTime: 170 },
  { date: "2025-01-16", idleTime: 138, activeTime: 190 },
  { date: "2025-01-17", idleTime: 446, activeTime: 360 },
  { date: "2025-01-18", idleTime: 364, activeTime: 410 },
  { date: "2025-01-19", idleTime: 243, activeTime: 180 },
  { date: "2025-01-20", idleTime: 89, activeTime: 150 },
  { date: "2025-01-21", idleTime: 137, activeTime: 200 },
  { date: "2025-01-22", idleTime: 224, activeTime: 170 },
  { date: "2025-01-23", idleTime: 138, activeTime: 230 },
  { date: "2025-01-24", idleTime: 387, activeTime: 290 },
  { date: "2025-01-25", idleTime: 215, activeTime: 250 },
  { date: "2025-01-26", idleTime: 75, activeTime: 130 },
  { date: "2025-01-27", idleTime: 383, activeTime: 420 },
  { date: "2025-01-28", idleTime: 122, activeTime: 180 },
  { date: "2025-01-29", idleTime: 315, activeTime: 240 },
  { date: "2025-01-30", idleTime: 454, activeTime: 380 },
];

// Chart configuration with colors
const chartConfig = {
  utilization: {
    label: "Vehicle Utilization",
    color: "#1a5a9d", // Further darkened for better contrast
  },
  idleTime: {
    label: "Idle Time (hours)",
    color: "#4030a0", // Further darkened for better contrast
  },
  activeTime: {
    label: "Active Time (hours)",
    color: "#157540", // Further darkened for better contrast
  },
} satisfies ChartConfig;

// Background colors for styling (separate from chart config)
const bgColors = {
  utilization: "#e6f0fa",
  idleTime: "#eceafe",
  activeTime: "#e6f5ee",
};

export function VehicleUtilizationChart() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("idleTime");

  const total = React.useMemo(
    () => ({
      idleTime: chartData.reduce((acc, curr) => acc + curr.idleTime, 0),
      activeTime: chartData.reduce((acc, curr) => acc + curr.activeTime, 0),
    }),
    []
  );

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Vehicle Utilization Chart</CardTitle>
          <CardDescription>Showing idle vs. active time for the last 30 days</CardDescription>
        </div>
        <div className="flex">
          {["idleTime", "activeTime"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-blue-50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
                aria-pressed={activeChart === chart}
                aria-label={`Show ${chartConfig[chart].label}`}
              >
                <span className="text-gray-700 text-xs font-medium">
                  {chartConfig[chart].label}
                </span>
                <span
                  className="text-lg leading-none font-bold sm:text-3xl px-2 py-1 rounded-md"
                  style={{
                    color: chartConfig[chart].color,
                    backgroundColor: bgColors[chart as keyof typeof bgColors],
                  }}
                >
                  {total[key as keyof typeof total].toLocaleString()} hrs
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string | number) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip>
              <ChartTooltipContent nameKey="utilization" />
            </ChartTooltip>
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={chartConfig[activeChart].color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default VehicleUtilizationChart;
