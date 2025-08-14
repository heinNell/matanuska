import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileWarning, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Truck 
} from 'lucide-react';

/**
 * Compliance Dashboard Component
 * Main dashboard for compliance and safety showing key metrics and alerts
 */
const ComplianceDashboard: React.FC = () => {
  // Mock data for compliance metrics
  const metrics = {
    dotComplianceRate: 97.8,
    safetyScore: 92.5,
    openIncidents: 3,
    pendingInspections: 8,
    upcomingDeadlines: 5,
    activeViolations: 2,
    totalVehicles: 45,
    compliantVehicles: 42,
    upcomingAudits: 1,
    expiringDocuments: 4
  };

  // Mock data for recent incidents
  const recentIncidents = [
    { id: 'INC-1001', date: '2023-07-05', type: 'Vehicle Damage', status: 'Open', severity: 'Medium', location: 'Route 66, Mile 124' },
    { id: 'INC-1002', date: '2023-07-03', type: 'Near Miss', status: 'Under Investigation', severity: 'Low', location: 'Chicago Depot' },
    { id: 'INC-1003', date: '2023-06-28', type: 'Driver Injury', status: 'Closed', severity: 'High', location: 'Dallas Warehouse' },
    { id: 'INC-1004', date: '2023-06-25', type: 'Traffic Violation', status: 'Resolved', severity: 'Low', location: 'Interstate 80' },
    { id: 'INC-1005', date: '2023-06-20', type: 'Cargo Damage', status: 'Closed', severity: 'Medium', location: 'Client Site' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Compliance Dashboard</h1>
        <div className="flex space-x-2">
          <Link to="/compliance/incidents/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Report Incident
          </Link>
          <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200" onClick={() => {}}>
            Schedule Inspection
          </button>
        </div>
      </div>

      {/* Compliance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">DOT Compliance</h3>
            <ShieldCheck className={`h-8 w-8 ${metrics.dotComplianceRate > 95 ? 'text-green-500' : 'text-amber-500'}`} />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">{metrics.dotComplianceRate}%</span>
            <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${metrics.dotComplianceRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{metrics.compliantVehicles} of {metrics.totalVehicles} vehicles compliant</span>
              <Link to="/compliance/dot" className="text-blue-600 hover:underline">View Details</Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">Safety Score</h3>
            <Shield className={`h-8 w-8 ${metrics.safetyScore > 90 ? 'text-green-500' : 'text-amber-500'}`} />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900">{metrics.safetyScore}</span>
            <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
              <div 
                className={`h-2.5 rounded-full ${
                  metrics.safetyScore > 90 ? 'bg-green-600' : 
                  metrics.safetyScore > 80 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.safetyScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {metrics.safetyScore > 90 ? 'Excellent' : 
                 metrics.safetyScore > 80 ? 'Good' : 'Needs Improvement'}
              </span>
              <Link to="/compliance/safety-inspections" className="text-blue-600 hover:underline">View Inspections</Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">Alerts & Actions</h3>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShieldAlert className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-sm">{metrics.openIncidents} Open Incidents</span>
              </div>
              <Link to="/compliance/incidents" className="text-blue-600 text-sm hover:underline">View</Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm">{metrics.pendingInspections} Pending Inspections</span>
              </div>
              <Link to="/compliance/safety-inspections" className="text-blue-600 text-sm hover:underline">View</Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm">{metrics.expiringDocuments} Expiring Documents</span>
              </div>
              <Link to="/compliance/dot" className="text-blue-600 text-sm hover:underline">View</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-medium">Recent Incidents</h2>
          <Link to="/compliance/incidents" className="text-blue-600 hover:underline text-sm">View All Incidents</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentIncidents.map(incident => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{incident.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(incident.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incident.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      incident.severity === 'High' ? 'bg-red-100 text-red-800' : 
                      incident.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      incident.status === 'Open' || incident.status === 'Under Investigation' ? 'bg-amber-100 text-amber-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/compliance/incidents/${incident.id}`} className="text-blue-600 hover:text-blue-900 mr-4">View</Link>
                    {(incident.status === 'Open' || incident.status === 'Under Investigation') && (
                      <Link to={`/compliance/incidents/${incident.id}/edit`} className="text-blue-600 hover:text-blue-900">Update</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Compliance Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming Deadlines & Audits
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">DOT Audit Preparation</p>
                <p className="text-xs text-gray-500">Due in 14 days</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">High Priority</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">Driver Qualification Files Review</p>
                <p className="text-xs text-gray-500">Due in 7 days</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Medium Priority</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">ELD Compliance Check</p>
                <p className="text-xs text-gray-500">Due in 3 days</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Medium Priority</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Safety Meeting</p>
                <p className="text-xs text-gray-500">Tomorrow at 09:00</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Scheduled</span>
            </div>
            <Link to="/compliance/audits" className="text-blue-600 text-sm hover:underline inline-block mt-2">View All Deadlines →</Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Truck className="h-5 w-5 mr-2 text-blue-500" />
            Vehicle Compliance Status
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Total Vehicles</p>
                <p className="text-2xl font-bold">{metrics.totalVehicles}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{metrics.compliantVehicles}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-700">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">{metrics.totalVehicles - metrics.compliantVehicles}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-sm text-amber-700">Inspections Due</p>
                <p className="text-2xl font-bold text-amber-600">{metrics.pendingInspections}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Non-Compliant Vehicles</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-sm">TRK-104 (2019 Freightliner)</span>
                  <span className="text-xs font-medium text-red-700">Inspection Overdue</span>
                </div>
                <div className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-sm">TRK-117 (2020 Peterbilt)</span>
                  <span className="text-xs font-medium text-red-700">Registration Expired</span>
                </div>
                <div className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-sm">TRK-122 (2021 Volvo)</span>
                  <span className="text-xs font-medium text-red-700">Maintenance Required</span>
                </div>
              </div>
              <Link to="/compliance/dot" className="text-blue-600 text-sm hover:underline inline-block mt-2">View Vehicle Compliance →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
