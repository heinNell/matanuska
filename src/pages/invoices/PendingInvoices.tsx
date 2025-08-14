import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component for displaying and managing pending invoices
 */
const PendingInvoicesPage: React.FC = () => {
  // Mock data
  const pendingInvoices = Array.from({ length: 10 }, (_, i) => ({
    id: `INV-${2023100 + i}`,
    client: `Client ${i + 1}`,
    amount: 1500 * (i + 1),
    issueDate: `2023-07-${15 - (i % 10)}`,
    dueDate: `2023-08-${10 - (i % 10)}`,
    status: 'Pending'
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pending Invoices</h1>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={() => {}}>
            Send Reminders
          </button>
          <Link to="/invoices/new" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Create Invoice
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select className="w-full border border-gray-300 rounded-md p-2">
              <option value="">All Clients</option>
              <option>Client 1</option>
              <option>Client 2</option>
              <option>Client 3</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select className="w-full border border-gray-300 rounded-md p-2">
              <option>Last 30 days</option>
              <option>This month</option>
              <option>Last month</option>
              <option>Custom</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Range
            </label>
            <select className="w-full border border-gray-300 rounded-md p-2">
              <option>All</option>
              <option>Under $1,000</option>
              <option>$1,000 - $5,000</option>
              <option>$5,000 - $10,000</option>
              <option>Over $10,000</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200" onClick={() => {}}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Table of pending invoices */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="mr-2" />
                  Invoice #
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <input type="checkbox" className="mr-2" />
                    {invoice.id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{invoice.client}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">${invoice.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{invoice.issueDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{invoice.dueDate}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800" onClick={() => {}}>View</button>
                      <button className="text-gray-600 hover:text-gray-800" onClick={() => {}}>Edit</button>
                      <button className="text-green-600 hover:text-green-800" onClick={() => {}}>Mark Paid</button>
                      <button className="text-red-600 hover:text-red-800" onClick={() => {}}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" onClick={() => {}}>
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" onClick={() => {}}>
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">20</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" onClick={() => {}}>
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => {}}>
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-gray-50" onClick={() => {}}>
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => {}}>
                  3
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" onClick={() => {}}>
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingInvoicesPage;
