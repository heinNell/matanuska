import React from 'react';

interface POEntry {
  poNumber: string;
  reqNumber: string;
  item: string;
  dueDate: string;
  status: string;
  totalCost: number;
  vendor: string;
}

// Sample data for the component
const poData: POEntry[] = [
  {
    poNumber: 'PO1057',
    reqNumber: 'REQ03208',
    item: 'Cargo belts',
    dueDate: '06-Jun-2025',
    status: '🟡 Waiting for Approval',
    totalCost: 212.52,
    vendor: 'Hinge Master SA',
  },
  {
    poNumber: 'PO1052',
    reqNumber: 'REQ03196',
    item: '29H Main Fuse Box ⚠️',
    dueDate: '22-May-2025',
    status: '🟥 EMERGENCY – Waiting',
    totalCost: 247,
    vendor: 'Axle Investments Pvt Ltd t/a Matebeleland Trucks',
  },
  {
    poNumber: 'PO1043',
    reqNumber: 'REQ03177',
    item: '8F Alternator Belt',
    dueDate: '19-May-2025',
    status: '🟡 Waiting for Approval',
    totalCost: 136,
    vendor: 'A&J Field Services',
  },
  {
    poNumber: 'PO1036',
    reqNumber: 'REQ03135',
    item: '23H Complete Door Handle',
    dueDate: '16-May-2025',
    status: '🟡 Waiting for Approval',
    totalCost: 94,
    vendor: 'Shacman SA',
  }
];

export const POApprovalSummary: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">📋 PO Approval Summary – As of 09 July 2025</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">PO Number</th>
              <th className="p-2 border">REQ Number</th>
              <th className="p-2 border">Item Description</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Total Cost</th>
              <th className="p-2 border">Vendor</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {poData.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border">{entry.poNumber}</td>
                <td className="p-2 border">{entry.reqNumber}</td>
                <td className="p-2 border">{entry.item}</td>
                <td className="p-2 border">{entry.dueDate}</td>
                <td className="p-2 border whitespace-nowrap">{entry.status}</td>
                <td className="p-2 border">R {entry.totalCost.toFixed(2)}</td>
                <td className="p-2 border">{entry.vendor}</td>
                <td className="p-2 border">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600" onClick={() => {}}>
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300" onClick={() => {}}>
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {poData.length} entries • Last updated: 09 July 2025, 10:45 AM
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600" onClick={() => {}}>
            Review All
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300" onClick={() => {}}>
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default POApprovalSummary;
