import React from "react";

/**
 * Component for adding new fuel entries
 */
const AddFuelEntryPage: React.FC = () => {
  // Handler for button clicks
  const onClick = () => {
    console.log("Button clicked");
    // Implement actual functionality here
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Add Fuel Entry</h1>
        <div className="flex space-x-2">
          <button
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
            onClick={onClick}
          >
            Scan Receipt
          </button>
          <button
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
            onClick={onClick}
          >
            Import From File
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium mb-3">Fuel Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle*</label>
                <select className="w-full border border-gray-300 rounded-md p-2" required>
                  <option value="">Select Vehicle</option>
                  <option value="TRK-101">TRK-101</option>
                  <option value="TRK-102">TRK-102</option>
                  <option value="TRK-103">TRK-103</option>
                  <option value="TRK-104">TRK-104</option>
                  <option value="TRK-105">TRK-105</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver*</label>
                <select className="w-full border border-gray-300 rounded-md p-2" required>
                  <option value="">Select Driver</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                  <option value="Mike Johnson">Mike Johnson</option>
                  <option value="Sarah Williams">Sarah Williams</option>
                  <option value="David Brown">David Brown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Date*</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md p-2"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-md p-2"
                  defaultValue={new Date().toLocaleTimeString("en-GB").substring(0, 5)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type*</label>
                <select className="w-full border border-gray-300 rounded-md p-2" required>
                  <option value="Regular">Regular Diesel</option>
                  <option value="Premium">Premium Diesel</option>
                  <option value="Biofuel">Biofuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer Reading (km)*
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md p-2"
                  min="0"
                  step="1"
                  required
                  placeholder="Current vehicle odometer reading"
                />
              </div>
            </div>

            {/* Purchase Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium mb-3">Purchase Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liters Filled*
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md p-2"
                  min="0.1"
                  step="0.01"
                  required
                  placeholder="Volume in liters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Liter*
                </label>
                <div className="flex items-center">
                  <span className="mr-1">$</span>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md p-2"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="Price per liter"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost*</label>
                <div className="flex items-center">
                  <span className="mr-1">$</span>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-md p-2"
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="Total amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location / Fuel Station*
                </label>
                <select className="w-full border border-gray-300 rounded-md p-2" required>
                  <option value="">Select Location</option>
                  <option>Main Depot</option>
                  <option>Highway Station</option>
                  <option>City Gas</option>
                  <option>Rural Station</option>
                  <option>Other (Please specify)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  <option>Fuel Card</option>
                  <option>Company Credit Card</option>
                  <option>Cash</option>
                  <option>Driver's Personal Card (Reimbursement)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Card Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter card number if applicable"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-3">Additional Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice / Receipt Number
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter receipt number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Reference
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Associated trip number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Comments
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2"
                  rows={3}
                  placeholder="Add any additional information..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt Upload
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <div className="space-y-1">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-sm text-gray-600">
                      Drag and drop files here or click to upload
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                  </div>
                  <input type="file" className="hidden" />
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    onClick={onClick}
                  >
                    Upload Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save Fuel Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFuelEntryPage;
