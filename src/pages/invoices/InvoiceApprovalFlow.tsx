import React from 'react';

const InvoiceApprovalFlow: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Invoice Approval Flow</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Approval Stages</h2>
          <div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Configure Workflow
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="w-full md:w-1/4 p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold">1</span>
            </div>
            <p className="mt-2 font-medium">Creation</p>
            <p className="text-sm text-gray-500">Invoice created by staff</p>
          </div>
          <div className="hidden md:block w-full h-0.5 bg-blue-200"></div>
          <div className="w-full md:w-1/4 p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold">2</span>
            </div>
            <p className="mt-2 font-medium">Department Review</p>
            <p className="text-sm text-gray-500">Department manager approval</p>
          </div>
          <div className="hidden md:block w-full h-0.5 bg-blue-200"></div>
          <div className="w-full md:w-1/4 p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold">3</span>
            </div>
            <p className="mt-2 font-medium">Finance Review</p>
            <p className="text-sm text-gray-500">Finance department validation</p>
          </div>
          <div className="hidden md:block w-full h-0.5 bg-blue-200"></div>
          <div className="w-full md:w-1/4 p-4 text-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-bold">4</span>
            </div>
            <p className="mt-2 font-medium">Final Approval</p>
            <p className="text-sm text-gray-500">CFO approval and sending</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stage</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waiting For</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">INV-2025-0045</td>
              <td className="px-6 py-4 whitespace-nowrap">ABC Company</td>
              <td className="px-6 py-4 whitespace-nowrap">$3,450.00</td>
              <td className="px-6 py-4 whitespace-nowrap">Department Review</td>
              <td className="px-6 py-4 whitespace-nowrap">John Smith</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                <button className="text-green-600 hover:text-green-900">Approve</button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">INV-2025-0044</td>
              <td className="px-6 py-4 whitespace-nowrap">XYZ Corporation</td>
              <td className="px-6 py-4 whitespace-nowrap">$5,782.50</td>
              <td className="px-6 py-4 whitespace-nowrap">Finance Review</td>
              <td className="px-6 py-4 whitespace-nowrap">Finance Department</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                <button className="text-green-600 hover:text-green-900">Approve</button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">INV-2025-0043</td>
              <td className="px-6 py-4 whitespace-nowrap">123 Industries</td>
              <td className="px-6 py-4 whitespace-nowrap">$12,340.75</td>
              <td className="px-6 py-4 whitespace-nowrap">Final Approval</td>
              <td className="px-6 py-4 whitespace-nowrap">Sarah Johnson (CFO)</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                <button className="text-green-600 hover:text-green-900">Approve</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Approval History</h2>
        
        <div className="space-y-4">
          <div className="border-l-2 border-green-500 pl-4 pb-4">
            <p className="text-sm text-gray-500">Today, 10:45 AM</p>
            <p className="font-medium">INV-2025-0042 approved by Finance Department</p>
            <p className="text-sm text-gray-600">Invoice moved to Final Approval stage</p>
          </div>
          
          <div className="border-l-2 border-green-500 pl-4 pb-4">
            <p className="text-sm text-gray-500">Today, 9:30 AM</p>
            <p className="font-medium">INV-2025-0041 approved by John Smith</p>
            <p className="text-sm text-gray-600">Invoice moved to Finance Review stage</p>
          </div>
          
          <div className="border-l-2 border-green-500 pl-4 pb-4">
            <p className="text-sm text-gray-500">Yesterday, 4:15 PM</p>
            <p className="font-medium">INV-2025-0040 fully approved by Sarah Johnson</p>
            <p className="text-sm text-gray-600">Invoice sent to client</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceApprovalFlow;
