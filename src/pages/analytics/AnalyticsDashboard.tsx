import { FleetStatusDoughnut } from "../../components/ui/chart/FleetStatusDoughnut";
import { PerformanceLineChart } from "../../components/ui/chart/PerformanceLineChart";
import { RechartsLineChart } from "../../components/ui/chart/RechartsLineChart";
import { ROIBarChart } from "../../components/ui/chart/ROIBarChart";

const DashboardPage = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Fleet Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Fleet Status</h3>
          <FleetStatusDoughnut />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">ROI Analysis</h3>
          <ROIBarChart />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
          <PerformanceLineChart />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Cost Analysis</h3>
          <RechartsLineChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
