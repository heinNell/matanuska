import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Target,
  Layers,
  DollarSign,
  FileBarChart
} from 'lucide-react';

/**
 * Fleet Analytics Management Page
 * Container for all analytics and reporting functionality
 */
const FleetAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

  const analyticsFeatures = [
    { name: 'Dashboard', icon: <BarChart3 className="h-6 w-6" />, path: '/analytics/dashboard' },
    { name: 'KPI Overview', icon: <Target className="h-6 w-6" />, path: '/analytics/kpi' },
    { name: 'Predictive Analytics', icon: <TrendingUp className="h-6 w-6" />, path: '/analytics/predictive' },
    { name: 'Cost Analysis', icon: <DollarSign className="h-6 w-6" />, path: '/analytics/costs' },
    { name: 'ROI Reports', icon: <LineChart className="h-6 w-6" />, path: '/analytics/roi' },
    { name: 'Performance Benchmarks', icon: <PieChart className="h-6 w-6" />, path: '/analytics/benchmarks' },
    { name: 'Custom Reports', icon: <FileBarChart className="h-6 w-6" />, path: '/analytics/custom-reports' }
  ];

  // When the component mounts, navigate to the dashboard if we're on the base analytics path
  React.useEffect(() => {
    if (window.location.pathname === '/analytics') {
      navigate('/analytics/dashboard');
    }
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fleet Analytics</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/analytics/custom-reports/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Custom Report
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Export Reports
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 p-4">
          {analyticsFeatures.map((feature, index) => (
            <button
              key={index}
              className="flex flex-col items-center justify-center p-4 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => navigate(feature.path)}
            >
              <div className="p-2 bg-blue-100 rounded-full text-blue-600 mb-2">
                {feature.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{feature.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Outlet for nested routes */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default FleetAnalyticsPage;
