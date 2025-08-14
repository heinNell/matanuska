import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface Trip {
  id: string;
  route: string;
  costs: any[];
  proofOfDelivery?: string;
}

interface ReportingPanelProps {
  trip: Trip;
}

const ReportingPanel: React.FC<ReportingPanelProps> = ({ trip }) => {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const availableReports = [
    {
      id: 'trip-summary',
      name: 'Trip Summary Report',
      description: 'Complete overview of trip details, costs, and timeline',
    },
    {
      id: 'cost-breakdown',
      name: 'Cost Breakdown Report',
      description: 'Detailed analysis of all trip costs and categories',
    },
    {
      id: 'profitability',
      name: 'Profitability Analysis',
      description: 'Revenue vs costs analysis with profit margins',
    },
    {
      id: 'performance-metrics',
      name: 'Performance Metrics',
      description: 'KPIs including fuel efficiency, time utilization, etc.',
    },
    {
      id: 'client-report',
      name: 'Client Report',
      description: 'Customer-facing summary of services provided',
    },
  ];

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleGenerateReports = () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report to generate');
      return;
    }
    
    // In a real app, this would generate and download the reports
    alert(`Generating ${selectedReports.length} report(s)...`);
  };

  const totalCosts = trip.costs.reduce((sum, cost) => sum + cost.amount, 0);
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Trip Reporting & Analytics</h3>
        
        {/* Trip Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Trip Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Route: {trip.route}</div>
            <div>Total Costs: R{totalCosts.toFixed(2)}</div>
            <div>Cost Items: {trip.costs.length}</div>
            <div>Completion: {trip.proofOfDelivery ? '✓ Complete' : 'Incomplete'}</div>
          </div>
        </div>

        {/* Report Selection */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Available Reports</h4>
          <div className="space-y-3">
            {availableReports.map((report) => (
              <label key={report.id} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedReports.includes(report.id)}
                  onChange={() => handleReportToggle(report.id)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium">{report.name}</div>
                  <div className="text-sm text-gray-600">{report.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Quick Statistics</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <div className="text-sm text-blue-600">Total Costs</div>
              <div className="text-lg font-semibold">R{totalCosts.toFixed(2)}</div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-sm text-green-600">Cost Categories</div>
              <div className="text-lg font-semibold">
                {new Set(trip.costs.map(c => c.category || 'other')).size}
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg text-center">
              <div className="text-sm text-yellow-600">Flagged Items</div>
              <div className="text-lg font-semibold">
                {trip.costs.filter(c => c.isFlagged).length}
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <div className="text-sm text-purple-600">System Costs</div>
              <div className="text-lg font-semibold">
                {trip.costs.filter(c => c.isSystemGenerated).length}
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Cost Breakdown</h4>
          <div className="space-y-2">
            {trip.costs.map((cost, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <span className="font-medium">{cost.description}</span>
                  {cost.category && (
                    <span className="text-sm text-gray-500 ml-2">({cost.category})</span>
                  )}
                  {cost.isFlagged && <span className="text-red-500 ml-1">🚩</span>}
                  {cost.isSystemGenerated && <span className="text-blue-500 ml-1">⚙️</span>}
                </div>
                <span className="font-semibold">R{cost.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-600">
            {selectedReports.length} report(s) selected
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setSelectedReports([])}>
              Clear Selection
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedReports(availableReports.map(r => r.id))}
            >
              Select All
            </Button>
            <Button onClick={handleGenerateReports}>
              Generate Reports
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportingPanel;
