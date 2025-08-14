import React from 'react';

const InvoiceDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Invoice Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Outstanding Invoices</h2>
          <p className="text-3xl font-bold mt-2">$124,567.89</p>
          <p className="text-sm text-gray-500 mt-1">42 invoices pending</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Paid This Month</h2>
          <p className="text-3xl font-bold mt-2">$87,432.10</p>
          <p className="text-sm text-gray-500 mt-1">28 invoices paid</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Overdue</h2>
          <p className="text-3xl font-bold mt-2 text-red-600">$35,789.45</p>
          <p className="text-sm text-gray-500 mt-1">15 invoices overdue</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Invoice Activity</h2>
        <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Chart showing invoice activity over time would appear here</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">INV-2025-0042</td>
                <td className="px-6 py-4 whitespace-nowrap">ABC Company</td>
                <td className="px-6 py-4 whitespace-nowrap">$3,450.00</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">INV-2025-0041</td>
                <td className="px-6 py-4 whitespace-nowrap">XYZ Corporation</td>
                <td className="px-6 py-4 whitespace-nowrap">$2,780.50</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">INV-2025-0040</td>
                <td className="px-6 py-4 whitespace-nowrap">123 Industries</td>
                <td className="px-6 py-4 whitespace-nowrap">$5,125.75</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Overdue</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Invoice Aging</h2>
          <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Chart showing invoice aging would appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDashboard;
