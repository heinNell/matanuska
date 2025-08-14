import React from 'react';

const InvoiceManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Invoice Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pending Invoices</h2>
          <p className="text-gray-600">View and manage invoices awaiting payment</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Paid Invoices</h2>
          <p className="text-gray-600">Access your payment history</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>
          <p className="text-gray-600">Generate new invoices for clients</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Invoice Templates</h2>
          <p className="text-gray-600">Manage your invoice templates</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tax Reports</h2>
          <p className="text-gray-600">Generate tax reports and exports</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <p className="text-gray-600">View payment statistics and analytics</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagementPage;
