import AnalyticsControls from "@/components/AnalyticsControls";
import { Button } from "@/components/ui/Button";
import { FleetAnalyticsLineChart } from "@/components/ui/chart/FleetAnalyticsLineChart";
import { FleetCostAreaChart } from "@/components/ui/chart/FleetCostAreaChart";
import { FleetStatusDoughnut } from "@/components/ui/chart/FleetStatusDoughnut";
import { FleetUtilizationLine } from "@/components/ui/chart/FleetUtilizationLine";
import { PerformanceLineChart } from "@/components/ui/chart/PerformanceLineChart";
import { RechartsLineChart } from "@/components/ui/chart/RechartsLineChart";
import { ROIBarChart } from "@/components/ui/chart/ROIBarChart";
import { VehicleUtilizationChart } from "@/components/ui/chart/VehicleUtilizationChart";
import { FleetAnalyticsProvider, useFleetAnalytics } from "@/context/FleetAnalyticsContext";

const DashboardContent = () => {
  const { refreshData, isLoading } = useFleetAnalytics();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fleet Analytics Dashboard</h2>
        <Button onClick={() => refreshData()} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Analytics Controls */}
      <div className="mb-6">
        <AnalyticsControls />
      </div>

      {/* Top row with fleet status and ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Fleet Status</h3>
          <FleetStatusDoughnut />
        </div>

        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium mb-3">ROI Analysis</h3>
          <ROIBarChart />
        </div>
      </div>

      {/* Interactive charts row */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <VehicleUtilizationChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
          <PerformanceLineChart />
        </div>

        <FleetAnalyticsLineChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Cost Analysis</h3>
          <RechartsLineChart />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <FleetCostAreaChart />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-3">Fleet Utilization Trend</h3>
        <FleetUtilizationLine />
      </div>
    </div>
  );
};

// Wrap with Provider
const DashboardPage = () => {
  return (
    <FleetAnalyticsProvider>
      <DashboardContent />
    </FleetAnalyticsProvider>
  );
};

export default DashboardPage;
