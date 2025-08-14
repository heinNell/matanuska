import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

interface PaidInvoice {
  id: string;
  client: string;
  amount: number;
  issueDate: string;
  paidDate: string;
  paymentMethod: string;
}

/**
 * Component for displaying and managing paid invoices
 */
const PaidInvoicesPage: React.FC = () => {
  const [paidInvoices, setPaidInvoices] = useState<PaidInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);

        // Create a query against the 'invoices' collection
        const q = query(
          collection(db, "invoices"),
          where("status", "==", "paid"),
          orderBy("paidDate", "desc")
        );

        const querySnapshot = await getDocs(q);
        const invoices: PaidInvoice[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          invoices.push({
            id: doc.id,
            client: data.client || "",
            amount: data.amount || 0,
            issueDate: data.issueDate || "",
            paidDate: data.paidDate || "",
            paymentMethod: data.paymentMethod || "Unknown",
          });
        });

        setPaidInvoices(invoices);
      } catch (err) {
        console.error("Error fetching paid invoices:", err);
        setError("Failed to load invoice data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Paid Invoices</h1>
        <div className="flex space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={() => {}}
          >
            Export to CSV
          </button>
          <button
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
            onClick={() => {}}
          >
            Print Report
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="bg-white p-8 rounded-lg shadow flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
          <span className="ml-3 text-gray-700">Loading invoices...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <p className="text-red-700 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9V7h2v2H9zm0 4v-2h2v2H9z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select className="w-full border border-gray-300 rounded-md p-2">
              <option value="">All Clients</option>
              <option>Client 1</option>
              <option>Client 2</option>
              <option>Client 3</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select className="w-full border border-gray-300 rounded-md p-2">
              <option>Last 30 days</option>
              <option>This month</option>
              <option>Last month</option>
              <option>Custom</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select className="w-full border border-gray-300 rounded-md p-2">
              <option>All</option>
              <option>Bank Transfer</option>
              <option>Credit Card</option>
              <option>Cash</option>
              <option>Check</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
              onClick={() => {}}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table of paid invoices */}
      {!loading && !error && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paidInvoices.length > 0 ? (
                  paidInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{invoice.client}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{invoice.issueDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{invoice.paidDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{invoice.paymentMethod}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800" onClick={() => {}}>
                            View
                          </button>
                          <button className="text-gray-600 hover:text-gray-800" onClick={() => {}}>
                            Print
                          </button>
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={() => {}}
                          >
                            Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      No paid invoices found. Invoices will appear here once they are paid.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paidInvoices.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => {}}
                >
                  Previous
                </button>
                <button
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => {}}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{Math.min(paidInvoices.length, 10)}</span> of{" "}
                    <span className="font-medium">{paidInvoices.length}</span> results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      onClick={() => {}}
                    >
                      Previous
                    </button>
                    <button
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-gray-50"
                      onClick={() => {}}
                    >
                      1
                    </button>
                    <button
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => {}}
                    >
                      2
                    </button>
                    <button
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => {}}
                    >
                      3
                    </button>
                    <button
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      onClick={() => {}}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Section - Only show when not loading and we have data */}
      {!loading && !error && paidInvoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Total Paid Amount</h3>
            <p className="text-2xl font-bold text-green-600">
              ${paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Average Payment Time</h3>
            <p className="text-2xl font-bold text-blue-600">
              {/* Calculation would need actual date processing logic */}
              18 days
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Most Common Payment Method</h3>
            <p className="text-2xl font-bold text-gray-700">
              {/* This would need to calculate the most common method */}
              {paidInvoices.length > 0 ? paidInvoices[0].paymentMethod : "N/A"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaidInvoicesPage;
