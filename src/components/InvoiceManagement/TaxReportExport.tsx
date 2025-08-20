import React from "react";
import { useAppContext } from "../../context/AppContext";
import Card, { CardContent, CardHeader } from "../../components/ui/Card";
import { FileText, Download, Settings, Clock } from "lucide-react";
import { Button } from "../../components/ui/Button";

const TaxReportExport: React.FC = () => {
  const { isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 text-gray-600">
          <Clock className="w-5 h-5 animate-spin" />
          <span>Preparing tax report tools…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Report Export</h1>
          <p className="text-gray-500 mt-1">
            Generate and export tax reports for accounting purposes
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Report Configuration</h2>
            <Settings className="w-5 h-5 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option>Sales Tax</option>
                <option>VAT</option>
                <option>Income Tax</option>
                <option>Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option>Current Month</option>
                <option>Previous Month</option>
                <option>Current Quarter</option>
                <option>Year to Date</option>
                <option>Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
                <option>JSON</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Report Preview</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No report generated yet</p>
            <p className="text-sm mt-2">
              Configure the parameters above and click "Export Report" to generate
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxReportExport;
