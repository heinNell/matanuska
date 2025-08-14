import React from 'react';

const InvoiceTemplatesPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Invoice Templates</h1>
      
      <div className="mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create New Template
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Standard Invoice</h2>
          <p className="text-gray-600 mb-4">Basic invoice template for general use</p>
          <div className="flex justify-end space-x-2">
            <button className="text-blue-600 hover:text-blue-800">Edit</button>
            <button className="text-blue-600 hover:text-blue-800">Preview</button>
            <button className="text-red-600 hover:text-red-800">Delete</button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Detailed Service</h2>
          <p className="text-gray-600 mb-4">Template for itemized service invoices</p>
          <div className="flex justify-end space-x-2">
            <button className="text-blue-600 hover:text-blue-800">Edit</button>
            <button className="text-blue-600 hover:text-blue-800">Preview</button>
            <button className="text-red-600 hover:text-red-800">Delete</button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Professional</h2>
          <p className="text-gray-600 mb-4">Premium template with company branding</p>
          <div className="flex justify-end space-x-2">
            <button className="text-blue-600 hover:text-blue-800">Edit</button>
            <button className="text-blue-600 hover:text-blue-800">Preview</button>
            <button className="text-red-600 hover:text-red-800">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplatesPage;
