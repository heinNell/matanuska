import { Button } from "../../../components/ui/Button";
import {
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  RefreshCw,
  Upload,
  WifiOff,
  X,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { useSyncContext } from "../../../context/SyncContext";
import Modal from "../../ui/Modal";
// Fleet vehicles data used for registration -> fleet number mapping
const FLEET_VEHICLES = [
  { registrationNo: "ABC123GP", fleetNo: "TRK001" },
  { registrationNo: "DEF456GP", fleetNo: "TRK002" },
  // Add more mappings as needed
];

interface LoadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Create a fleet master mapping object for quick lookups
const createFleetMasterMapping = (vehicles: { registrationNo: string; fleetNo: string }[]) => {
  const mapping: { [key: string]: string } = {};
  vehicles.forEach((vehicle) => {
    mapping[vehicle.registrationNo] = vehicle.fleetNo;
  });
  return mapping;
};

const LoadImportModal: React.FC<LoadImportModalProps> = ({ isOpen, onClose }) => {
  const { importTripsFromCSV, importTripsFromWebhook } = useAppContext();
  const { isOnline } = useSyncContext();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWebhookProcessing, setIsWebhookProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mappingResults, setMappingResults] = useState<{
    mapped: number;
    unmapped: number;
    total: number;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setCsvFile(file);

      // Generate preview
      try {
        const text = await file.text();
        const data = parseCSV(text);

        // Create a preview format that's easier to display
        const previewData = data.slice(0, 3).map((row: string[]) => {
          return {
            "Load Ref": row[0] || "",
            Registration: row[3] || "",
            Driver: row[5] || "",
            Client: row[6] || "",
            "Start Date": row[9] || "",
            "End Date": row[10] || "",
            Route: `${row[12] || ""} - ${row[14] || ""}`,
            "Distance (km)": row[17] || "",
            Revenue: row[19] || "",
            Description: row[21] || "",
          };
        });

        setPreviewData(previewData);
      } catch (error) {
        console.error("Failed to parse CSV for preview:", error);
      }
    }
  };

  // Parse CSV with position-based mapping instead of header-based
  const parseCSV = (text: string) => {
    const lines = text.split("\n");
    const data = [];

    // Skip the first row (headers) as requested
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        // Parse CSV values with respect to quotes
        const values = [];
        let currentValue = "";
        let inQuotes = false;

        for (const char of lines[i]) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim()); // Don't forget the last value

        // Only add if we have enough values
        if (values.length >= 20) {
          data.push(values);
        }
      }
    }

    return data;
  };

  const handleImport = async () => {
    if (!csvFile) {
      setError("Please select a CSV file first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setMappingResults(null);

    try {
      const text = await csvFile.text();
      const data = parseCSV(text);

      // Create fleet master mapping (using defined fleet vehicles)
      const fleetMasterMapping = createFleetMasterMapping(FLEET_VEHICLES);

      // Track mapping results
      let mappedCount = 0;
      let unmappedCount = 0;

      const trips = data.map((row: string[]) => {
        // Map fields according to the position-based mapping provided
        // Column 3 (index position) contains the registration number (AGZ1963)
        const registration = row[3] || "";

        // Look up fleet number in the mapping
        let fleetNumber = "";

        if (registration) {
          // Try to get the fleet number from the mapping
          fleetNumber = fleetMasterMapping[registration] || "";

          if (fleetNumber) {
            mappedCount++;
          } else {
            unmappedCount++;
            // Use registration as fallback if no fleet number is found
            fleetNumber = registration;
          }
        }

        // Build route from columns 12, 13, 14
        const routeParts = [row[12], row[13], row[14]].filter((part) => part);
        const route = routeParts.join(" - ");

        // Handle load description
        const descriptionParts = [row[21], row[22]].filter((part) => part);
        const description = descriptionParts.join(" ");

        // Format dates to YYYY-MM-DD if they're in DD/MM/YYYY format
        const formatDate = (dateStr: string) => {
          if (!dateStr) return "";

          // Check if it's in DD/MM/YYYY format
          const dateParts = dateStr.split("/");
          if (dateParts.length === 3) {
            return `${dateParts[2]}-${dateParts[1].padStart(2, "0")}-${dateParts[0].padStart(2, "0")}`;
          }

          return dateStr; // Return as is if not in expected format
        };

        return {
          fleetNumber,
          route,
          clientName: row[6] || "", // Client name from column 6
          baseRevenue: parseFloat(row[19] || "0"), // Revenue from column 19
          revenueCurrency: "USD" as "USD" | "ZAR", // Always USD as specified, properly typed
          startDate: formatDate(row[9] || ""), // Start date from column 9
          endDate: formatDate(row[10] || ""), // End date from column 10
          driverName: row[5] || "", // Driver name from column 5
          distanceKm: parseFloat(row[17] || "0"), // Distance from column 17
          clientType: "external" as "external" | "internal", // Explicitly type as union literal
          description,
          paymentStatus: "unpaid" as "unpaid" | "partial" | "paid",
          additionalCosts: [],
          followUpHistory: [],
          status: "active" as const, // Ensure trips are set to active status

          // Add metadata for tracking web-imported trips
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bookingSource: "web" as const,
          loadRef: row[0] || "", // Load reference from web booking system
        };
      });

      // Set mapping results
      setMappingResults({
        mapped: mappedCount,
        unmapped: unmappedCount,
        total: data.length,
      });

      if (trips.length === 0) {
        setError("No valid trips were found in the CSV. Please check your file format.");
        return;
      }

      await importTripsFromCSV(trips);
      setSuccess(
        `Successfully imported ${trips.length} trips from CSV file.${!isOnline ? "\n\nData will be synced when your connection is restored." : ""}`
      );
      setCsvFile(null);
      setPreviewData([]);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("Failed to import CSV:", err);
      setError(`Error importing trips: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWebhookImport = async () => {
    setIsWebhookProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await importTripsFromWebhook();
      setSuccess(
        `Webhook import completed!\n\nImported: ${result.imported} trips\nSkipped: ${result.skipped} trips${!isOnline ? "\n\nData will be synced when your connection is restored." : ""}`
      );

      // Close modal after a short delay if successful
      if (result.imported > 0) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error("Failed to import from webhook:", err);
      setError(`Error importing from webhook: ${err.message}`);
    } finally {
      setIsWebhookProcessing(false);
    }
  };

  const handleClose = () => {
    setCsvFile(null);
    setIsProcessing(false);
    setIsWebhookProcessing(false);
    setPreviewData([]);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleDownloadTemplate = () => {
    // Create a sample row based on the required format
    const sampleRow = [
      "LO1978/4765", // Load ref
      "10215", // Field 2
      "", // Field 3
      "AGZ1963", // Registration
      "AGK6951", // Field 5
      "Enock Mukonyerwa", // Driver
      "MARKETING", // Client
      "1035/TPT/ADM/001", // Field 8
      "Load Delivered", // Status
      "07/06/2025", // Start date
      "09/06/2025", // End date
      "", // Field 12
      "REZENDE - BV (BACK LOAD)", // Route part 1
      "Harare", // Route part 2
      "BV", // Route part 3
      "65775", // Field 16
      "66109", // Field 17
      "334", // Distance (km)
      "Per Km", // Field 19
      "731.4600", // Revenue (USD)
      "0.00", // Field 21
      "1350 crates 30 bins", // Description
      "Tanaka Mboto", // Field 23
    ];

    // Create a header row (will be skipped during import, but useful for reference)
    const headerRow = [
      "Load Ref",
      "Field 2",
      "Field 3",
      "Registration",
      "Field 5",
      "Driver",
      "Client",
      "Field 8",
      "Status",
      "Start Date",
      "End Date",
      "Field 12",
      "Route Part 1",
      "Route Part 2",
      "Route Part 3",
      "Field 16",
      "Field 17",
      "Distance (km)",
      "Field 19",
      "Revenue (USD)",
      "Field 21",
      "Description",
      "Field 23",
    ];

    const csv = `${headerRow.join(",")}\n${sampleRow.join(",")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trip_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Trips" maxWidth="md">
      <div className="space-y-6">
        {/* Connection Status Warning */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <WifiOff className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Working Offline</h4>
                <p className="text-sm text-amber-700 mt-1">
                  You can still import trips while offline. Your data will be stored locally and
                  synced with the server when your connection is restored.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Import Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Import Successful</h3>
                <div className="mt-2 text-sm text-green-700 whitespace-pre-line">
                  <p>{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mapping Results */}
        {mappingResults && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Fleet Mapping Results</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Total vehicles: {mappingResults.total}</p>
                  <p>Successfully mapped: {mappingResults.mapped}</p>
                  {mappingResults.unmapped > 0 && (
                    <p className="text-amber-600">
                      Unmapped registrations: {mappingResults.unmapped}
                      <span className="ml-1 text-xs">(Registration used as fallback)</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Webhook Import Section */}
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Import from Google Sheets Webhook
          </h4>
          <div className="text-sm text-green-700 space-y-2">
            <p>Import completed trips directly from your Google Apps Script webhook.</p>
            <p>
              <strong>Requirements:</strong> Trips must have both SHIPPED and DELIVERED status to be
              imported.
            </p>
            <Button
              onClick={handleWebhookImport}
              disabled={isWebhookProcessing}
              isLoading={isWebhookProcessing}
              className="mt-2"
              variant="outline"
              icon={
                isWebhookProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : undefined
              }
            >
              {isWebhookProcessing ? "Importing from Webhook..." : "Import from Webhook"}
            </Button>
          </div>
        </div>

        <div className="text-center text-gray-500 font-medium">OR</div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            CSV Format Requirements & Fleet Mapping
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Your CSV file should follow this position-based format:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Column 1</strong> - Load reference (e.g., "LO1978/4765")
              </li>
              <li>
                <strong>Column 4</strong> - Vehicle registration number (e.g., "AGZ1963")
              </li>
              <li>
                <strong>Column 6</strong> - Driver name (e.g., "Enock Mukonyerwa")
              </li>
              <li>
                <strong>Column 7</strong> - Client name (e.g., "MARKETING")
              </li>
              <li>
                <strong>Column 9</strong> - Status/Note (e.g., "Load Delivered")
              </li>
              <li>
                <strong>Column 10</strong> - Start date (loaded date, e.g., "07/06/2025")
              </li>
              <li>
                <strong>Column 11</strong> - End date (offloaded date, e.g., "09/06/2025")
              </li>
              <li>
                <strong>Columns 13-15</strong> - Route information (e.g., "REZENDE - BV (BACK
                LOAD)")
              </li>
              <li>
                <strong>Column 18</strong> - Distance in kilometers (e.g., "334")
              </li>
              <li>
                <strong>Column 20</strong> - Base revenue in USD (e.g., "731.4600")
              </li>
              <li>
                <strong>Column 22</strong> - Load description (e.g., "1350 crates 30 bins")
              </li>
            </ul>
            <p className="mt-2 font-medium">Important Notes:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>The first row is always skipped (headers)</li>
              <li>Registration numbers (Column 4) will be automatically mapped to fleet numbers</li>
              <li>
                If a registration is not found in the Fleet Master List, the registration itself
                will be used
              </li>
              <li>All imported trips are automatically set to active status</li>
            </ul>
            <p className="mt-2 font-medium">Fleet Number Mapping:</p>
            <p>
              The system will map these registration numbers to fleet numbers:
              <br />
              AGZ1963 → 31H, AGZ1286 → 4H, AFQ1324 → 23H, etc.
            </p>
            <Button onClick={handleDownloadTemplate} variant="outline" className="mt-3">
              Download CSV Template
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0 file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                file:cursor-pointer cursor-pointer"
            />
          </div>

          {csvFile && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Selected: {csvFile.name}</span>
                <span className="text-sm text-green-600">
                  ({(csvFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          {/* Data Preview */}
          {previewData.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Data Preview (First 3 rows):
              </h4>
              <div className="bg-gray-50 p-3 rounded border overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(previewData[0])
                        .slice(0, 5)
                        .map((header) => (
                          <th
                            key={header}
                            className="px-2 py-1 text-left font-medium text-gray-700"
                          >
                            {header}
                          </th>
                        ))}
                      {Object.keys(previewData[0]).length > 5 && (
                        <th className="px-2 py-1 text-left font-medium text-gray-700">...</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        {Object.entries(row)
                          .slice(0, 5)
                          .map(([entryKey, value]) => (
                            <td
                              key={`${rowIndex}-${String(entryKey)}`}
                              className="px-2 py-1 text-gray-600"
                            >
                              {String(value)}
                            </td>
                          ))}
                        {Object.keys(row).length > 5 && (
                          <td className="px-2 py-1 text-gray-600">...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing || isWebhookProcessing}
            icon={<X className="w-4 h-4" />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!csvFile || isProcessing || isWebhookProcessing}
            isLoading={isProcessing}
            icon={<Upload className="w-4 h-4" />}
          >
            {isProcessing ? "Importing..." : "Import CSV"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LoadImportModal;
