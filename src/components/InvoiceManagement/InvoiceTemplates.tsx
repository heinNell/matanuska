import { Button } from "@/components/ui/Button";
import React, { useMemo } from "react";
import useOfflineQuery from "../../hooks/useOfflineQuery";
import Card, { CardContent, CardHeader } from "../ui/Card";

/**
 * Component for managing invoice templates
 */
const InvoiceTemplatesPage: React.FC = () => {
  // Handler for button clicks
  const handleClick = () => {
    // TODO: Implement actual handler functionality
    console.log("Button clicked");
  };

  interface InvoiceTemplateDoc {
    id: string;
    name?: string;
    description?: string;
    lastModified?: string; // ISO date
    isDefault?: boolean;
  }

  const { data, loading, error } = useOfflineQuery<InvoiceTemplateDoc>("invoiceTemplates");
  const invoiceTemplates = useMemo(() => data || [], [data]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice Templates</h1>
        <div className="flex space-x-2">
          <Button onClick={handleClick}>Create New Template</Button>
          <Button variant="outline" onClick={handleClick}>
            Import Template
          </Button>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading templates...</div>}
      {error && (
        <div className="text-sm text-red-600">Failed to load templates: {error.message}</div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading &&
          !error &&
          invoiceTemplates.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-medium">{t.name || "Untitled"}</h2>
                  {t.isDefault && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {t.description || "No description provided."}
                </p>
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <span>Last modified: {t.lastModified || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={handleClick}
                    >
                      Edit
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-800 text-sm"
                      onClick={handleClick}
                    >
                      Duplicate
                    </button>
                  </div>
                  <div className="space-x-2">
                    {!t.isDefault && (
                      <button
                        className="text-green-600 hover:text-green-800 text-sm"
                        onClick={handleClick}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      className="text-red-600 hover:text-red-800 text-sm"
                      onClick={handleClick}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        {!loading && !error && (
          <Card className="border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
            <CardContent className="p-5 flex flex-col items-center justify-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl text-gray-500">+</span>
              </div>
              <h3 className="text-lg font-medium">Create New Template</h3>
              <p className="text-gray-500 text-center mt-2">
                Design a new invoice template for your business
              </p>
            </CardContent>
          </Card>
        )}
        {!loading && !error && invoiceTemplates.length === 0 && (
          <div className="col-span-full text-sm text-gray-500 p-6 border border-dashed rounded-md text-center">
            No templates found.
          </div>
        )}
      </div>

      {/* Template Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Template Settings</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Default Template</h3>
            <p className="text-sm text-gray-600 mb-3">
              Choose which template should be used by default when creating new invoices.
            </p>
            <select className="w-full border border-gray-300 rounded-md p-2">
              <option>Standard Invoice</option>
              <option>Premium Service</option>
              <option>Contract Work</option>
              <option>Monthly Retainer</option>
            </select>
          </div>

          <div>
            <h3 className="font-medium mb-2">Auto-numbering Format</h3>
            <p className="text-sm text-gray-600 mb-3">
              Set the format for automatically generated invoice numbers.
            </p>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="INV-{YYYY}{MM}-{####}"
              defaultValue="INV-{YYYY}{MM}-{####}"
            />
          </div>

          <div>
            <h3 className="font-medium mb-2">Company Information</h3>
            <p className="text-sm text-gray-600 mb-3">
              Your company details that appear on invoices.
            </p>
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
              onClick={handleClick}
            >
              Edit Company Information
            </button>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-medium mb-2">Terms & Conditions</h3>
            <p className="text-sm text-gray-600 mb-3">
              Default terms and conditions to include on invoices.
            </p>
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
              onClick={handleClick}
            >
              Edit Terms & Conditions
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceTemplatesPage;
