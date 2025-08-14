import { Button } from "@/components/ui/Button";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { AlertTriangle, CheckCircle, FileText, Printer, Save, TrendingDown, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { DieselConsumptionRecord } from "../../../types";
import { formatCurrency, formatDate } from "../../../utils/helpers";
import { Select, TextArea } from "../../ui/FormElements";
import Modal from "../../ui/Modal";

interface EnhancedDieselDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DieselConsumptionRecord[];
  norms: any[];
}

const EnhancedDieselDebriefModal: React.FC<EnhancedDieselDebriefModalProps> = ({
  isOpen,
  onClose,
  records,
  norms,
}) => {
  const { updateDieselDebrief } = useAppContext();
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [debriefNotes, setDebriefNotes] = useState<string>("");
  const [actionTaken, setActionTaken] = useState<string>("");
  const [rootCause, setRootCause] = useState<string>("");
  const [driverSignature, setDriverSignature] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset form when modal opens or selected record changes
  useEffect(() => {
    if (records.length > 0 && !selectedRecordId) {
      setSelectedRecordId(records[0].id);
    }

    setDebriefNotes("");
    setActionTaken("");
    setRootCause("");
    setDriverSignature(false);
    setError(null);
    setSuccess(null);
  }, [isOpen, records, selectedRecordId]);

  const selectedRecord = records.find((r) => r.id === selectedRecordId);

  // These utility functions are commented out as they're not currently in use
  // but may be needed for future UI enhancements
  /* Functions removed as they're not currently being used:
  const getPerformanceStatusColor = (status: string) => {...}
  const getVarianceColor = (variance: number) => {...}
  */

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedRecord) return;

    if (!debriefNotes.trim()) {
      setError("Debrief notes are required");
      return;
    }

    if (!rootCause.trim()) {
      setError("Root cause is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateDieselDebrief(selectedRecordId, {
        debriefDate: new Date().toISOString().split("T")[0],
        debriefNotes: debriefNotes.trim(),
        debriefSignedBy: "Current User", // In a real app, use the logged-in user
        actionTaken: actionTaken.trim(),
        rootCause: rootCause.trim(),
        driverSignature: driverSignature,
      });

      setSuccess(`Debrief completed successfully for Fleet ${selectedRecord.fleetNumber}`);

      // Reset form for the next record
      setDebriefNotes("");
      setActionTaken("");
      setRootCause("");
      setDriverSignature(false);

      // Remove the completed record from the list if there are more
      if (records.length > 1) {
        const nextIndex = records.findIndex((r) => r.id === selectedRecordId) + 1;
        if (nextIndex < records.length) {
          setSelectedRecordId(records[nextIndex].id);
        } else {
          setSelectedRecordId(records[0].id);
        }
      }
    } catch (error) {
      console.error("Error during debrief:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF report
  const generatePDF = () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 128);
      doc.text("Diesel Efficiency Debrief Report", pageWidth / 2, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, {
        align: "center",
      });

      // Add summary section
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Summary:", 14, 30);

      // Create table data for records
      const tableData = records.map((r) => {
        // Calculate performance indicators
        const norm = norms.find((n) => n.fleetNumber === r.fleetNumber);
        const isReefer = r.isReeferUnit;
        const expectedKmPerLitre =
          !isReefer && norm?.expectedKmPerLitre ? norm.expectedKmPerLitre : 3.0;
        const expectedLitresPerHour = isReefer && norm?.litresPerHour ? norm.litresPerHour : 3.5;

        let efficiencyMetric = 0;
        if (isReefer) {
          efficiencyMetric =
            r.litresPerHour ||
            (r.hoursOperated && r.hoursOperated > 0 ? r.litresFilled / r.hoursOperated : 0);
        } else {
          efficiencyMetric = r.kmPerLitre || 0;
        }

        let variance = 0;
        if (isReefer && expectedLitresPerHour > 0) {
          variance = ((efficiencyMetric - expectedLitresPerHour) / expectedLitresPerHour) * 100;
        } else if (!isReefer && expectedKmPerLitre > 0) {
          variance = ((efficiencyMetric - expectedKmPerLitre) / expectedKmPerLitre) * 100;
        }

        return [
          r.fleetNumber,
          r.driverName,
          formatDate(r.date),
          isReefer ? "Reefer" : "Vehicle",
          isReefer ? `${efficiencyMetric.toFixed(2)} L/hr` : `${efficiencyMetric.toFixed(2)} km/L`,
          isReefer
            ? `${expectedLitresPerHour.toFixed(2)} L/hr`
            : `${expectedKmPerLitre.toFixed(2)} km/L`,
          `${variance.toFixed(1)}%`,
          r.debriefDate ? "Completed" : "Pending",
        ];
      });

      // Add table
      (doc as any).autoTable({
        startY: 35,
        head: [["Fleet", "Driver", "Date", "Type", "Actual", "Expected", "Variance", "Status"]],
        body: tableData,
        theme: "striped",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 15 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
        },
      });

      // Individual records with debrief information
      let yPos = (doc as any).lastAutoTable.finalY + 10;

      records.forEach((record, i) => {
        // Check if we need a new page
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        const isReefer = record.isReeferUnit;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 128);
        doc.text(
          `Record #${i + 1}: Fleet ${record.fleetNumber}${isReefer ? " (Reefer)" : ""}`,
          14,
          yPos
        );
        yPos += 8;

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(`Driver: ${record.driverName}`, 20, yPos);
        yPos += 6;
        doc.text(`Date: ${formatDate(record.date)}`, 20, yPos);
        yPos += 6;

        if (isReefer) {
          doc.text(`Hours Operated: ${record.hoursOperated?.toFixed(1) || "N/A"} hours`, 20, yPos);
          yPos += 6;
          doc.text(`Consumption Rate: ${record.litresPerHour?.toFixed(2) || "N/A"} L/hr`, 20, yPos);
          yPos += 6;
        } else {
          doc.text(`Distance: ${record.distanceTravelled?.toLocaleString() || "N/A"} km`, 20, yPos);
          yPos += 6;
          doc.text(`Efficiency: ${record.kmPerLitre?.toFixed(2) || "N/A"} km/L`, 20, yPos);
          yPos += 6;
        }

        if (record.debriefDate) {
          doc.setTextColor(0, 128, 0);
          doc.text(
            `Debriefed on ${formatDate(record.debriefDate)} by ${record.debriefSignedBy}`,
            20,
            yPos
          );
          yPos += 6;

          if (record.debriefNotes) {
            doc.setTextColor(0, 0, 0);
            doc.text("Debrief Notes:", 20, yPos);
            yPos += 6;

            // Split long notes into multiple lines
            const notes = doc.splitTextToSize(record.debriefNotes, pageWidth - 40);
            doc.text(notes, 25, yPos);
            yPos += notes.length * 6 + 6;
          }
        }

        yPos += 10; // Add some space between records
      });

      // Save the PDF
      doc.save(`diesel-debrief-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF report. Please try again.");
    }
  };

  // Generate CSV export
  const generateCSV = () => {
    try {
      // Create header row
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent +=
        "Fleet,Driver,Date,Type,Actual Performance,Expected Performance,Variance,Status,Debrief Date,Debrief Notes,Root Cause,Action Taken\n";

      // Add data rows
      records.forEach((r) => {
        const norm = norms.find((n) => n.fleetNumber === r.fleetNumber);
        const isReefer = r.isReeferUnit;

        const expectedKmPerLitre =
          !isReefer && norm?.expectedKmPerLitre ? norm.expectedKmPerLitre : 3.0;
        const expectedLitresPerHour = isReefer && norm?.litresPerHour ? norm.litresPerHour : 3.5;

        let efficiencyMetric = 0;
        if (isReefer) {
          efficiencyMetric =
            r.litresPerHour ||
            (r.hoursOperated && r.hoursOperated > 0 ? r.litresFilled / r.hoursOperated : 0);
        } else {
          efficiencyMetric = r.kmPerLitre || 0;
        }

        let variance = 0;
        if (isReefer && expectedLitresPerHour > 0) {
          variance = ((efficiencyMetric - expectedLitresPerHour) / expectedLitresPerHour) * 100;
        } else if (!isReefer && expectedKmPerLitre > 0) {
          variance = ((efficiencyMetric - expectedKmPerLitre) / expectedKmPerLitre) * 100;
        }

        // Format notes and escape commas
        const debriefNotes = r.debriefNotes ? `"${r.debriefNotes.replace(/"/g, '""')}"` : "";

        csvContent += `${r.fleetNumber},`;
        csvContent += `"${r.driverName}",`;
        csvContent += `${r.date},`;
        csvContent += `${isReefer ? "Reefer" : "Vehicle"},`;
        csvContent += `${isReefer ? efficiencyMetric.toFixed(2) + " L/hr" : efficiencyMetric.toFixed(2) + " km/L"},`;
        csvContent += `${isReefer ? expectedLitresPerHour.toFixed(2) + " L/hr" : expectedKmPerLitre.toFixed(2) + " km/L"},`;
        csvContent += `${variance.toFixed(1)}%,`;
        csvContent += `${r.debriefDate ? "Completed" : "Pending"},`;
        csvContent += `${r.debriefDate || ""},`;
        csvContent += `${debriefNotes},`;
        csvContent += `"${r.rootCause || ""}",`;
        csvContent += `"${r.actionTaken || ""}"\n`;
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `diesel-debrief-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating CSV:", error);
      setError("Failed to generate CSV report. Please try again.");
    }
  };

  // Root cause options
  const rootCauseOptions = [
    { value: "", label: "Select root cause..." },
    { value: "driver_behavior", label: "Driver Behavior" },
    { value: "vehicle_condition", label: "Vehicle Condition" },
    { value: "route_conditions", label: "Route Conditions" },
    { value: "weather_conditions", label: "Weather Conditions" },
    { value: "overloading", label: "Vehicle Overloading" },
    { value: "equipment_failure", label: "Equipment Failure" },
    { value: "fuel_quality", label: "Fuel Quality Issues" },
    { value: "calibration_error", label: "Measurement/Calibration Error" },
    { value: "possible_theft", label: "Possible Fuel Theft" },
    { value: "other", label: "Other (specify in notes)" },
  ];

  // Action taken options
  const actionOptions = [
    { value: "", label: "Select action taken..." },
    { value: "driver_training", label: "Driver Training Conducted" },
    { value: "vehicle_maintenance", label: "Vehicle Maintenance Scheduled" },
    { value: "route_optimization", label: "Route Optimized" },
    { value: "loading_procedure_review", label: "Loading Procedure Review" },
    { value: "calibration_check", label: "Recalibration Performed" },
    { value: "investigation_opened", label: "Investigation Opened" },
    { value: "reprimand_issued", label: "Reprimand Issued" },
    { value: "monitoring_increased", label: "Increased Monitoring" },
    { value: "fuel_controls_revised", label: "Fuel Controls Revised" },
    { value: "no_action", label: "No Action Required" },
    { value: "other", label: "Other (specify in notes)" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enhanced Diesel Efficiency Debrief"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="p-4 rounded-md flex items-start space-x-3 bg-green-50 text-green-800 mb-4">
            <CheckCircle className="h-5 w-5 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{success}</p>
            <button onClick={() => setSuccess(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-md flex items-start space-x-3 bg-red-50 text-red-800 mb-4">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-4">
            {/* Record Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Record to Debrief
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
              >
                {records.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.fleetNumber} - {formatDate(record.date)} - {record.driverName}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{records.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-amber-600">
                    {records.filter((r) => !r.debriefDate).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">
                    {records.filter((r) => r.debriefDate).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={generatePDF}
                icon={<Printer className="w-4 h-4" />}
              >
                Export PDF Report
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={generateCSV}
                icon={<FileText className="w-4 h-4" />}
              >
                Export CSV Data
              </Button>
            </div>
          </div>

          <div className="md:col-span-3 space-y-6">
            {selectedRecord && (
              <>
                {/* Record Details */}
                <div
                  className={`p-4 rounded-lg ${
                    selectedRecord.isReeferUnit
                      ? "bg-purple-50 border border-purple-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <h4 className="text-lg font-medium text-gray-800 mb-2">
                    Fleet {selectedRecord.fleetNumber} -{" "}
                    {selectedRecord.isReeferUnit ? "Reefer Unit" : "Vehicle"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Driver:</p>
                      <p className="font-medium">{selectedRecord.driverName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Date:</p>
                      <p className="font-medium">{formatDate(selectedRecord.date)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Fuel Station:</p>
                      <p className="font-medium">{selectedRecord.fuelStation}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Litres Filled:</p>
                      <p className="font-medium">{selectedRecord.litresFilled.toFixed(1)} L</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Total Cost:</p>
                      <p className="font-medium">
                        {formatCurrency(selectedRecord.totalCost, selectedRecord.currency || "ZAR")}
                      </p>
                    </div>

                    {selectedRecord.isReeferUnit ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Hours Operated:</p>
                          <p className="font-medium">
                            {selectedRecord.hoursOperated?.toFixed(1) || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Litres per Hour:</p>
                          <p
                            className={`font-medium ${
                              selectedRecord.litresPerHour && selectedRecord.litresPerHour > 4.0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {selectedRecord.litresPerHour?.toFixed(2) || "N/A"} L/hr
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Distance Travelled:</p>
                          <p className="font-medium">
                            {selectedRecord.distanceTravelled?.toLocaleString() || "N/A"} km
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">KM per Litre:</p>
                          <p
                            className={`font-medium ${
                              selectedRecord.kmPerLitre && selectedRecord.kmPerLitre < 2.5
                                ? "text-red-600"
                                : selectedRecord.kmPerLitre && selectedRecord.kmPerLitre > 3.5
                                  ? "text-green-600"
                                  : "text-yellow-600"
                            }`}
                          >
                            {selectedRecord.kmPerLitre?.toFixed(2) || "N/A"} km/L
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Performance Analysis */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Performance Analysis</h5>

                    {selectedRecord.isReeferUnit ? (
                      <div className="flex items-center">
                        <TrendingDown
                          className={`w-4 h-4 ${
                            selectedRecord.litresPerHour && selectedRecord.litresPerHour > 4.0
                              ? "text-red-500"
                              : selectedRecord.litresPerHour && selectedRecord.litresPerHour > 3.5
                                ? "text-yellow-500"
                                : "text-green-500"
                          } mr-1`}
                        />
                        <p className="text-sm">
                          Reefer consumption is
                          <span
                            className={`font-medium ${
                              selectedRecord.litresPerHour && selectedRecord.litresPerHour > 4.0
                                ? " text-red-600"
                                : selectedRecord.litresPerHour && selectedRecord.litresPerHour > 3.5
                                  ? " text-yellow-600"
                                  : " text-green-600"
                            }`}
                          >
                            {selectedRecord.litresPerHour
                              ? selectedRecord.litresPerHour > 3.5
                                ? " above"
                                : selectedRecord.litresPerHour < 3.0
                                  ? " below"
                                  : " within"
                              : " unknown compared to"}{" "}
                            expected range
                          </span>
                          {selectedRecord.litresPerHour
                            ? ` (${(((selectedRecord.litresPerHour - 3.5) / 3.5) * 100).toFixed(1)}% ${
                                selectedRecord.litresPerHour > 3.5 ? "higher" : "lower"
                              } than target)`
                            : ""}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <TrendingDown
                          className={`w-4 h-4 ${
                            selectedRecord.kmPerLitre && selectedRecord.kmPerLitre < 2.5
                              ? "text-red-500"
                              : selectedRecord.kmPerLitre && selectedRecord.kmPerLitre > 3.5
                                ? "text-green-500"
                                : "text-yellow-500"
                          } mr-1`}
                        />
                        <p className="text-sm">
                          Fuel efficiency is
                          <span
                            className={`font-medium ${
                              selectedRecord.kmPerLitre && selectedRecord.kmPerLitre < 2.5
                                ? " text-red-600"
                                : selectedRecord.kmPerLitre && selectedRecord.kmPerLitre > 3.5
                                  ? " text-green-600"
                                  : " text-yellow-600"
                            }`}
                          >
                            {selectedRecord.kmPerLitre
                              ? selectedRecord.kmPerLitre < 2.5
                                ? " below"
                                : selectedRecord.kmPerLitre > 3.5
                                  ? " above"
                                  : " within"
                              : " unknown compared to"}{" "}
                            expected range
                          </span>
                          {selectedRecord.kmPerLitre
                            ? ` (${(((selectedRecord.kmPerLitre - 3.0) / 3.0) * 100).toFixed(1)}% ${
                                selectedRecord.kmPerLitre > 3.0 ? "higher" : "lower"
                              } than target)`
                            : ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Debrief Form */}
                {selectedRecord.debriefDate ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Debriefing Complete</h4>
                        <div className="mt-2 text-sm">
                          <p className="text-green-700 font-medium">
                            Debriefed on {formatDate(selectedRecord.debriefDate)}
                          </p>
                          <p className="text-green-700">
                            By: {selectedRecord.debriefSignedBy || "Unknown"}
                          </p>
                          {selectedRecord.debriefNotes && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-green-700">Notes:</p>
                              <p className="text-sm text-green-700 whitespace-pre-line">
                                {selectedRecord.debriefNotes}
                              </p>
                            </div>
                          )}

                          {selectedRecord.rootCause && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-green-700">Root Cause:</p>
                              <p className="text-sm text-green-700">{selectedRecord.rootCause}</p>
                            </div>
                          )}

                          {selectedRecord.actionTaken && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-green-700">Action Taken:</p>
                              <p className="text-sm text-green-700">{selectedRecord.actionTaken}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <TextArea
                      label="Debrief Notes *"
                      value={debriefNotes}
                      onChange={(e) => setDebriefNotes(e.target.value)}
                      placeholder="Document observations, driver explanations, and agreed actions..."
                      rows={3}
                      error={
                        error && !debriefNotes.trim() ? "Debrief notes are required" : undefined
                      }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Root Cause *"
                        value={rootCause}
                        onChange={(e) => setRootCause(e.target.value)}
                        options={rootCauseOptions}
                        error={error && !rootCause.trim() ? "Root cause is required" : undefined}
                      />

                      <Select
                        label="Action Taken"
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        options={actionOptions}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="driverSignature"
                        checked={driverSignature}
                        onChange={(e) => setDriverSignature(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="driverSignature" className="text-sm text-gray-700">
                        Driver has been debriefed and acknowledges this record
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        isLoading={loading}
                        icon={<Save className="w-4 h-4" />}
                      >
                        Complete Debrief
                      </Button>
                    </div>
                  </div>
                )}

                {/* Suggested Improvements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Suggested Improvements</h4>

                  {selectedRecord.isReeferUnit ? (
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                      <li>Ensure proper temperature settings based on cargo requirements</li>
                      <li>Check for air leaks or damaged seals in refrigerated compartment</li>
                      <li>Verify that doors are properly closed during operation</li>
                      <li>
                        Consider pre-cooling cargo before loading to reduce initial power demands
                      </li>
                      <li>Schedule regular maintenance checks for the reefer unit</li>
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                      <li>Encourage smooth acceleration and deceleration</li>
                      <li>Maintain consistent cruising speed on highways</li>
                      <li>Avoid excessive idling when stationary</li>
                      <li>Ensure correct tyre pressure for optimal rolling resistance</li>
                      <li>Check for proper load distribution to reduce aerodynamic drag</li>
                      <li>
                        Consider route optimization to avoid steep gradients or traffic congestion
                      </li>
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            icon={<X className="w-4 h-4" />}
            disabled={loading}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EnhancedDieselDebriefModal;
