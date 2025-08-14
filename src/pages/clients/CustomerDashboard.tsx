import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Customer Dashboard Component
 * Main dashboard for customer management showing key metrics and recent customers
 */
const CustomerDashboard: React.FC = () => {
  // Mock data for customer metrics
  const metrics = {
    totalCustomers: 128,
    activeCustomers: 98,
    inactiveCustomers: 30,
    newThisMonth: 7,
    retentionRate: 94.5,
    averageRevenue: 8500,
    topClient: 'Logistics Pro Ltd.',
    pendingInvoices: 14
  };

  // Mock data for recent customers
  const recentCustomers = [
    { id: 'CL-1001', name: 'Logistics Pro Ltd.', status: 'Active', revenue: 125000, lastOrder: '2023-07-01', contacts: 3, rating: 5 },
    { id: 'CL-1002', name: 'Fast Transport Inc.', status: 'Active', revenue: 98500, lastOrder: '2023-06-28', contacts: 2, rating: 4 },
    { id: 'CL-1003', name: 'Global Shipping Co.', status: 'Active', revenue: 156000, lastOrder: '2023-06-25', contacts: 4, rating: 5 },
    { id: 'CL-1004', name: 'Local Movers LLC', status: 'Inactive', revenue: 45000, lastOrder: '2023-05-15', contacts: 1, rating: 3 },
    { id: 'CL-1005', name: 'Premium Freight Services', status: 'Active', revenue: 210000, lastOrder: '2023-07-03', contacts: 5, rating: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Dashboard</h1>
        <div className="flex space-x-2">
          <Link to="/clients?action=new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add New Customer
          </Link>
          <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200" onClick={() => {}}>
            Export Customer List
          </button>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="text-2xl font-bold text-blue-600">{metrics.totalCustomers}</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+{metrics.newThisMonth} new</span>
            <span className="ml-1 text-gray-500">this month</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Customers</h3>
          <p className="text-2xl font-bold text-green-600">{metrics.activeCustomers}</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-500">{Math.round((metrics.activeCustomers / metrics.totalCustomers) * 100)}% of total</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Retention Rate</h3>
          <p className="text-2xl font-bold text-blue-600">{metrics.retentionRate}%</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+2.3%</span>
            <span className="ml-1 text-gray-500">vs last quarter</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Average Revenue</h3>
          <p className="text-2xl font-bold text-green-600">${metrics.averageRevenue.toLocaleString()}</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="ml-1 text-gray-500">vs last year</span>
          </div>
        </div>
      </div>

      {/* Customer Overview and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Customer Breakdown</h2>
          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Customer Segments Chart</p>
              <p className="text-gray-400 text-sm">Distribution by industry, size, and region</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800">Logistics</h3>
              <p className="text-xl font-bold text-blue-600">48</p>
              <p className="text-xs text-blue-500">38% of customers</p>
            </div>
            <div className="bg-green-50 p-3 rounded border border-green-100">
              <h3 className="text-sm font-medium text-green-800">Manufacturing</h3>
              <p className="text-xl font-bold text-green-600">35</p>
              <p className="text-xs text-green-500">27% of customers</p>
            </div>
            <div className="bg-purple-50 p-3 rounded border border-purple-100">
              <h3 className="text-sm font-medium text-purple-800">Retail</h3>
              <p className="text-xl font-bold text-purple-600">29</p>
              <p className="text-xs text-purple-500">23% of customers</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/clients?action=new" className="block bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700">
              Add New Customer
            </Link>
            <Link to="/clients?status=active" className="block bg-gray-100 text-gray-800 py-2 px-4 rounded text-center hover:bg-gray-200">
              View Active Customers
            </Link>
            <Link to="/clients?tab=analytics" className="block bg-gray-100 text-gray-800 py-2 px-4 rounded text-center hover:bg-gray-200">
              Customer Reports
            </Link>
            <Link to="/invoices/pending" className="block bg-gray-100 text-gray-800 py-2 px-4 rounded text-center hover:bg-gray-200">
              Manage Invoices
            </Link>
            <Link to="/clients?tab=relationships" className="block bg-gray-100 text-gray-800 py-2 px-4 rounded text-center hover:bg-gray-200">
              Client Relationships
            </Link>
          </div>
          
          <h2 className="text-lg font-medium mb-2 mt-6">Alerts</h2>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-100 rounded">
              <p className="text-sm text-red-800 font-medium">3 customers at risk</p>
              <p className="text-xs text-red-600">No orders in 60+ days</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded">
              <p className="text-sm text-yellow-800 font-medium">{metrics.pendingInvoices} pending invoices</p>
              <p className="text-xs text-yellow-600">Total: $24,500</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-100 rounded">
              <p className="text-sm text-green-800 font-medium">5 new leads</p>
              <p className="text-xs text-green-600">Awaiting follow-up</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Recent Customers</h2>
          <Link to="/clients?status=active" className="text-blue-600 hover:text-blue-800">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Revenue</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{customer.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">${customer.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{customer.lastOrder}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{customer.contacts}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-${i < customer.rating ? 'yellow' : 'gray'}-400`}>★</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <Link to={`/clients/${customer.id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                      <Link to={`/clients/${customer.id}/edit`} className="text-gray-600 hover:text-gray-800">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Customer Retention and Satisfaction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Customer Retention</h2>
          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Retention Trend Chart</p>
              <p className="text-gray-400 text-sm">Monthly retention rate visualization</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Customer Satisfaction</h2>
          {/* Chart placeholder */}
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Satisfaction Scores Chart</p>
              <p className="text-gray-400 text-sm">Average satisfaction by service type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
