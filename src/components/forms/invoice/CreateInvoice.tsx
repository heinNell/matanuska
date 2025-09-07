import React from "react";

/**
 * Component for creating new invoices
 */
const CreateInvoicePage: React.FC = () => {
  const handleClick = (action: string) => {
    // Placeholder for button click handling
    console.log(`Button clicked: ${action}`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create Invoice</h1>
        <div className="flex space-x-2">
          <button
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
            onClick={() => handleClick("save-draft")}
          >
            Save as Draft
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => handleClick("save-preview")}
          >
            Save & Preview
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Client Information */}
        <div>
          <h2 className="text-lg font-medium mb-3">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Select a client</option>
                <option>Client 1</option>
                <option>Client 2</option>
                <option>Client 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md p-2"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="INV-2023001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <h2 className="text-lg font-medium mb-3">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-gray-300 rounded-md p-2"
                      defaultValue="1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="mr-1">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md p-2"
                        defaultValue="0.00"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select className="w-full border border-gray-300 rounded-md p-2">
                      <option value="0">No Tax (0%)</option>
                      <option value="0.15">VAT (15%)</option>
                      <option value="0.12">Sales Tax (12%)</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">$0.00</td>
                  <td className="px-4 py-3">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleClick("remove-item")}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="px-4 py-3">
                    <button
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 w-full"
                      onClick={() => handleClick("add-item")}
                    >
                      Add Item
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs">
            <div className="flex justify-between py-2 border-b">
              <span>Subtotal:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Tax:</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Total:</span>
              <span>$0.00</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h2 className="text-lg font-medium mb-3">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option>Due on receipt</option>
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Net 60</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
                <option>GBP - British Pound</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2"
              rows={4}
              placeholder="Add any additional notes or terms and conditions..."
             />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-50"
            onClick={() => handleClick("cancel")}
          >
            Cancel
          </button>
          <button
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
            onClick={() => handleClick("save-draft")}
          >
            Save as Draft
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => handleClick("save-preview")}
          >
            Save & Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
