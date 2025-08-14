import React from 'react';

const TaxReportExport: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tax Report Export</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Generate Tax Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option>Select report type</option>
              <option>Sales Tax Summary</option>
              <option>VAT Report</option>
              <option>GST Report</option>
              <option>Annual Tax Summary</option>
              <option>Custom Tax Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Authority</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option>Select tax authority</option>
              <option>Federal</option>
              <option>State</option>
              <option>Local</option>
              <option>International</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Include Categories</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="salesTax" 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="salesTax" className="ml-2 text-sm text-gray-700">Sales Tax</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="incomeTax" 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="incomeTax" className="ml-2 text-sm text-gray-700">Income Tax</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="payrollTax" 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="payrollTax" className="ml-2 text-sm text-gray-700">Payroll Tax</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="propertyTax" 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="propertyTax" className="ml-2 text-sm text-gray-700">Property Tax</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="fuelTax" 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="fuelTax" className="ml-2 text-sm text-gray-700">Fuel Tax</label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="otherTaxes" 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="otherTaxes" className="ml-2 text-sm text-gray-700">Other Taxes</label>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input 
                type="radio" 
                id="formatPdf" 
                name="exportFormat" 
                className="h-4 w-4 text-blue-600 border-gray-300"
                defaultChecked
              />
              <label htmlFor="formatPdf" className="ml-2 text-sm text-gray-700">PDF</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="formatCsv" 
                name="exportFormat" 
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              <label htmlFor="formatCsv" className="ml-2 text-sm text-gray-700">CSV</label>
            </div>
            <div className="flex items-center">
              <input 
                type="radio" 
                id="formatXlsx" 
                name="exportFormat" 
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              <label htmlFor="formatXlsx" className="ml-2 text-sm text-gray-700">Excel (XLSX)</label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Generate Report
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated On</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Q2 2025 Sales Tax Report</td>
              <td className="px-6 py-4 whitespace-nowrap">Sales Tax Summary</td>
              <td className="px-6 py-4 whitespace-nowrap">Apr 1 - Jun 30, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap">Jul 5, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-blue-600 hover:text-blue-900 mr-3">Download</button>
                <button className="text-gray-600 hover:text-gray-900">View</button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Q1 2025 Sales Tax Report</td>
              <td className="px-6 py-4 whitespace-nowrap">Sales Tax Summary</td>
              <td className="px-6 py-4 whitespace-nowrap">Jan 1 - Mar 31, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap">Apr 3, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-blue-600 hover:text-blue-900 mr-3">Download</button>
                <button className="text-gray-600 hover:text-gray-900">View</button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">2024 Annual Tax Summary</td>
              <td className="px-6 py-4 whitespace-nowrap">Annual Tax Summary</td>
              <td className="px-6 py-4 whitespace-nowrap">Jan 1 - Dec 31, 2024</td>
              <td className="px-6 py-4 whitespace-nowrap">Jan 15, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-blue-600 hover:text-blue-900 mr-3">Download</button>
                <button className="text-gray-600 hover:text-gray-900">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxReportExport;
