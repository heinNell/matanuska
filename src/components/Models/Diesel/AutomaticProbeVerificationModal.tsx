import { Button } from "@/components/ui/Button";
import { AlertTriangle, CheckCircle, Database, Info, RefreshCw, Save, X } from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { addAuditLogToFirebase } from "../../../firebase";
import { FLEETS_WITH_PROBES } from "../../../types";
import { formatCurrency, formatDate } from "../../../utils/helpers";
import {
  FuelTankData,
  getTotalFuelLevel,
  getVehicleSensorData,
  isSensorDataRecent,
  VehicleSensorData,
} from "../../../utils/wialonSensorData";
import { Input, TextArea } from "../../ui/FormElements";
import Modal from "../../ui/Modal";

interface AutomaticProbeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dieselRecordId: string;
}

const AutomaticProbeVerificationModal: React.FC<AutomaticProbeVerificationModalProps> = ({
  isOpen,
  onClose,
  dieselRecordId,
}) => {
  const { dieselRecords, updateDieselRecord } = useAppContext();
  const [probeReading, setProbeReading] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [photoEvidence, setPhotoEvidence] = useState<File | null>(null);
  const [witnessName, setWitnessName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [discrepancy, setDiscrepancy] = useState<number | null>(null);
  const [discrepancyPercentage, setDiscrepancyPercentage] = useState<number | null>(null);

  // States for real-time sensor data
  const [isFetchingSensorData, setIsFetchingSensorData] = useState(false);
  const [sensorData, setSensorData] = useState<VehicleSensorData | null>(null);
  const [sensorDataError, setSensorDataError] = useState<string | null>(null);
  const [useSensorData, setUseSensorData] = useState(true);
  const [manualOverride, setManualOverride] = useState(false);

  // Find the diesel record
  const record = dieselRecords.find((r) => r.id === dieselRecordId);

  // Fetch sensor data when modal opens
  useEffect(() => {
    if (isOpen && record) {
      fetchSensorData();
    }
  }, [isOpen, record]);

  // Reset form when modal opens with new record
  useEffect(() => {
    if (record) {
      // If we have sensor data and it's recent, use it as the default
      if (sensorData && isSensorDataRecent(sensorData) && useSensorData && !manualOverride) {
        const totalFuelLevel = getTotalFuelLevel(sensorData);
        setProbeReading(totalFuelLevel.toString());

        // Add note about using sensor data
        const sensorDataNote = `Probe reading automatically populated from real-time sensor data.
Sensor data timestamp: ${sensorData.lastUpdated.toLocaleString()}
Fuel tanks: ${sensorData.fuelTanks
          .map(
            (tank: FuelTankData) =>
              `${tank.tankName}: ${tank.currentLevel.toFixed(1)}L (${tank.percentageFull.toFixed(1)}%)`
          )
          .join(", ")}`;

        setVerificationNotes(sensorDataNote);
      } else {
        // Otherwise use existing probe reading if available
        setProbeReading(record.probeReading?.toString() || "");
        setVerificationNotes(record.probeVerificationNotes || "");
      }

      setWitnessName("");
      setPhotoEvidence(null);
      setErrors({});

      // Calculate discrepancy if probe reading exists
      updateDiscrepancy();
    }
  }, [record, sensorData, useSensorData, manualOverride]);

  // Update discrepancy when probe reading changes
  useEffect(() => {
    updateDiscrepancy();
  }, [probeReading]);

  if (!record) return null;

  // Check if this fleet has a probe
  const hasProbe = FLEETS_WITH_PROBES.includes(record.fleetNumber);
  if (!hasProbe) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Automatic Probe Verification" maxWidth="md">
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">No Probe Available</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Fleet {record.fleetNumber} does not have a fuel probe installed. Probe
                  verification is not available for this vehicle.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Fetch real-time sensor data from Wialon
  const fetchSensorData = async () => {
    if (!record) return;

    try {
      setIsFetchingSensorData(true);
      setSensorDataError(null);

      const data = await getVehicleSensorData(record.fleetNumber);

      if (!data) {
        setSensorDataError(`No sensor data found for fleet ${record.fleetNumber}`);
        return;
      }

      if (data.fuelTanks.length === 0) {
        setSensorDataError(`No fuel tank sensors found for fleet ${record.fleetNumber}`);
        return;
      }

      setSensorData(data);

      // If the data is not recent, show a warning
      if (!isSensorDataRecent(data)) {
        setSensorDataError(
          `Sensor data is not recent (last updated: ${data.lastUpdated.toLocaleString()})`
        );
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      setSensorDataError(
        `Error fetching sensor data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsFetchingSensorData(false);
    }
  };

  // Update discrepancy calculation
  const updateDiscrepancy = () => {
    if (!record || !probeReading) {
      setDiscrepancy(null);
      setDiscrepancyPercentage(null);
      return;
    }

    const probeValue = parseFloat(probeReading);
    if (!isNaN(probeValue)) {
      const discrepancyValue = record.litresFilled - probeValue;
      setDiscrepancy(discrepancyValue);
      setDiscrepancyPercentage((discrepancyValue / record.litresFilled) * 100);
    } else {
      setDiscrepancy(null);
      setDiscrepancyPercentage(null);
    }
  };

  // Handle probe reading change
  const handleProbeReadingChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProbeReading(e.target.value);

    // Clear error for this field
    if (errors.probeReading) {
      setErrors((prev) => ({ ...prev, probeReading: "" }));
    }
  };

  // Handle witness name change
  const handleWitnessNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWitnessName(e.target.value);

    // Clear error for this field
    if (errors.witnessName) {
      setErrors((prev) => ({ ...prev, witnessName: "" }));
    }
  };

  // Handle verification notes change
  const handleVerificationNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setVerificationNotes(e.target.value);

    // Clear error for this field
    if (errors.verificationNotes) {
      setErrors((prev) => ({ ...prev, verificationNotes: "" }));
    }
  };

  // Toggle between sensor data and manual entry
  const toggleManualOverride = () => {
    setManualOverride(!manualOverride);

    if (!manualOverride) {
      // Switching to manual mode
      setVerificationNotes(
        (prev) =>
          prev +
          "\n\nManual override: User chose to manually enter probe reading instead of using sensor data."
      );
    } else {
      // Switching back to sensor data
      if (sensorData && isSensorDataRecent(sensorData)) {
        const totalFuelLevel = getTotalFuelLevel(sensorData);
        setProbeReading(totalFuelLevel.toString());

        // Update notes
        setVerificationNotes(`Probe reading automatically populated from real-time sensor data.
Sensor data timestamp: ${sensorData.lastUpdated.toLocaleString()}
Fuel tanks: ${sensorData.fuelTanks
          .map(
            (tank: FuelTankData) =>
              `${tank.tankName}: ${tank.currentLevel.toFixed(1)}L (${tank.percentageFull.toFixed(1)}%)`
          )
          .join(", ")}`);
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!probeReading.trim()) {
      newErrors.probeReading = "Probe reading is required";
    } else if (isNaN(Number(probeReading)) || Number(probeReading) < 0) {
      newErrors.probeReading = "Probe reading must be a valid positive number";
    }

    // If discrepancy is large (more than 10%), require notes and witness
    if (discrepancyPercentage !== null && Math.abs(discrepancyPercentage) > 10) {
      if (!verificationNotes.trim()) {
        newErrors.verificationNotes = "Notes are required for large discrepancies";
      }

      if (!witnessName.trim()) {
        newErrors.witnessName = "Witness name is required for large discrepancies";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const probeReadingValue = Number(probeReading);
      const probeDiscrepancyValue = record.litresFilled - probeReadingValue;
      const isSeriousDiscrepancy =
        Math.abs(probeDiscrepancyValue) > 50 ||
        Math.abs(probeDiscrepancyValue / record.litresFilled) > 0.1;

      // Add information about sensor data to notes if it was used
      let finalNotes = verificationNotes;
      if (sensorData && !manualOverride) {
        finalNotes += `\n\nVerification method: Automatic using real-time sensor data
Data source: Wialon AVL unit
Data timestamp: ${sensorData.lastUpdated.toLocaleString()}`;
      }

      // Update the diesel record
      const updatedRecord = {
        ...record,
        probeReading: probeReadingValue,
        probeDiscrepancy: probeDiscrepancyValue,
        probeVerified: true,
        probeVerificationNotes: finalNotes.trim() || undefined,
        probeVerifiedAt: new Date().toISOString(),
        probeVerifiedBy: "Current User", // In a real app, use the logged-in user
        probeWitness: witnessName.trim() || undefined,
        // In a real implementation, you would upload the photo evidence and store the URL
        probePhotoUrl: photoEvidence ? "https://example.com/photo-evidence.jpg" : undefined,
        updatedAt: new Date().toISOString(),
        // Add information about sensor data if it was used
        probeSensorDataUsed: !manualOverride && !!sensorData,
        probeSensorDataTimestamp: sensorData ? sensorData.lastUpdated.toISOString() : undefined,
      };

      await updateDieselRecord(updatedRecord);

      // Add audit log for serious discrepancies
      if (isSeriousDiscrepancy) {
        await addAuditLogToFirebase({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: "Current User", // Use logged-in user in real app
          action: "update",
          entity: "diesel",
          entityId: record.id,
          details: `Probe verification with large discrepancy of ${probeDiscrepancyValue.toFixed(1)} liters (${((probeDiscrepancyValue / record.litresFilled) * 100).toFixed(1)}%) for ${record.fleetNumber}`,
          changes: {
            before: { litresFilled: record.litresFilled },
            after: {
              probeReading: probeReadingValue,
              probeDiscrepancy: probeDiscrepancyValue,
              sensorDataUsed: !manualOverride && !!sensorData,
            },
          },
        });
      }

      // Close modal and notify user
      if (isSeriousDiscrepancy) {
        alert(
          `Probe verification completed with a significant discrepancy of ${probeDiscrepancyValue.toFixed(1)} liters. This has been flagged for investigation.`
        );
      } else {
        alert("Probe verification completed successfully");
      }

      onClose();
    } catch (error) {
      console.error("Error verifying probe:", error);
      setErrors((prev) => ({
        ...prev,
        submit: `Failed to verify probe: ${error instanceof Error ? error.message : "Unknown error"}`,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status class based on discrepancy
  const getDiscrepancyClass = (value: number) => {
    const absValue = Math.abs(value);

    // Percentage discrepancy
    if (absValue > 10) return "text-red-600";
    if (absValue > 5) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Automatic Probe Verification" maxWidth="lg">
      <div className="space-y-6">
        {/* Diesel Record Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Diesel Record Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-semibold">Fleet:</p>
              <p className="text-blue-900">{record.fleetNumber}</p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">Date:</p>
              <p className="text-blue-900">{formatDate(record.date)}</p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">Filled:</p>
              <p className="text-blue-900">{record.litresFilled.toFixed(1)} L</p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">Cost:</p>
              <p className="text-blue-900">
                {formatCurrency(record.totalCost, record.currency || "ZAR")}
              </p>
            </div>

            <div>
              <p className="text-blue-700 font-semibold">Driver:</p>
              <p className="text-blue-900">{record.driverName}</p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">Station:</p>
              <p className="text-blue-900">{record.fuelStation}</p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">KM Reading:</p>
              <p className="text-blue-900">{record.kmReading.toLocaleString()} km</p>
            </div>
            <div>
              <p className="text-blue-700 font-semibold">Efficiency:</p>
              <p className="text-blue-900">{record.kmPerLitre?.toFixed(2) || "N/A"} km/L</p>
            </div>
          </div>
        </div>

        {/* Real-time Sensor Data Section */}
        <div
          className={`border rounded-md ${
            sensorData
              ? "bg-green-50 border-green-200"
              : sensorDataError
                ? "bg-amber-50 border-amber-200"
                : "bg-gray-50 border-gray-200"
          } p-4`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              {sensorData ? (
                <Database className="w-5 h-5 text-green-600 mt-0.5 mr-2" />
              ) : sensorDataError ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-2" />
              ) : (
                <Info className="w-5 h-5 text-gray-600 mt-0.5 mr-2" />
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-800">Real-time Sensor Data</h4>
                {isFetchingSensorData ? (
                  <p className="text-sm text-gray-600 mt-1">Fetching sensor data...</p>
                ) : sensorData ? (
                  <div className="mt-2">
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">Last Updated:</span>{" "}
                      {sensorData.lastUpdated.toLocaleString()}
                      {!isSensorDataRecent(sensorData) && (
                        <span className="text-amber-600 ml-2">(Data may be outdated)</span>
                      )}
                    </p>

                    {sensorData.fuelTanks.length > 0 ? (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Fuel Tank Readings:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                          {sensorData.fuelTanks.map((tank: FuelTankData, index: number) => (
                            <div key={index} className="text-sm">
                              <span className="font-semibold">{tank.tankName}:</span>{" "}
                              {tank.currentLevel.toFixed(1)} L
                              <span className="text-gray-500 ml-1">
                                ({tank.percentageFull.toFixed(1)}% full)
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm font-medium text-gray-700 mt-2">
                          Total Fuel Level: {getTotalFuelLevel(sensorData).toFixed(1)} L
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">No fuel tank sensors found</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-amber-600 mt-1">
                    {sensorDataError || "No sensor data available"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchSensorData}
                icon={<RefreshCw className="w-4 h-4" />}
                isLoading={isFetchingSensorData}
                disabled={isFetchingSensorData}
              >
                Refresh
              </Button>
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="useSensorData"
                  checked={!manualOverride}
                  onChange={toggleManualOverride}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="useSensorData" className="ml-2 block text-sm text-gray-700">
                  Use sensor data for probe reading
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Probe Reading (Litres) *"
              type="number"
              step="0.1"
              min="0"
              value={probeReading}
              onChange={handleProbeReadingChange}
              error={errors.probeReading}
              disabled={!!(!manualOverride && sensorData && sensorData.fuelTanks.length > 0)}
            />

            {discrepancy !== null && (
              <div
                className={`mt-2 p-3 rounded-md ${
                  Math.abs(discrepancy) > 50
                    ? "bg-red-50 border border-red-200"
                    : Math.abs(discrepancy) > 20
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-green-50 border border-green-200"
                }`}
              >
                <div className="flex items-start">
                  {Math.abs(discrepancy) > 50 ? (
                    <AlertTriangle className={`w-5 h-5 text-red-600 mt-0.5 mr-2`} />
                  ) : Math.abs(discrepancy) > 20 ? (
                    <AlertTriangle className={`w-5 h-5 text-amber-600 mt-0.5 mr-2`} />
                  ) : (
                    <CheckCircle className={`w-5 h-5 text-green-600 mt-0.5 mr-2`} />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${getDiscrepancyClass(discrepancy)}`}>
                      Discrepancy: {discrepancy > 0 ? "+" : ""}
                      {discrepancy.toFixed(1)} litres
                    </p>
                    {discrepancyPercentage !== null && (
                      <p className={`text-sm ${getDiscrepancyClass(discrepancyPercentage)}`}>
                        {Math.abs(discrepancyPercentage).toFixed(1)}%{" "}
                        {discrepancy > 0 ? "more" : "less"} than filled amount
                      </p>
                    )}
                    {Math.abs(discrepancy) > 50 && (
                      <p className="text-sm text-red-700 mt-1">
                        ⚠️ This large discrepancy requires investigation!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Witness Name"
              value={witnessName}
              onChange={handleWitnessNameChange}
              placeholder="Person who verified the reading"
              error={errors.witnessName}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo Evidence (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoEvidence(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0 file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {photoEvidence && (
                <p className="mt-2 text-sm text-blue-600">Selected: {photoEvidence.name}</p>
              )}
            </div>
          </div>
        </div>

        <TextArea
          label="Verification Notes"
          value={verificationNotes}
          onChange={handleVerificationNotesChange}
          placeholder="Add any notes about the verification process, discrepancies, or observations..."
          rows={3}
          error={errors.verificationNotes}
        />

        {/* Verification Guidelines */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Verification Guidelines</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>For accurate readings, ensure the vehicle is on level ground</li>
            <li>Wait at least 10 minutes after filling before taking probe reading</li>
            <li>Discrepancies under 5% are considered normal due to measurement tolerances</li>
            <li>Discrepancies over 10% require thorough investigation and documentation</li>
            <li>
              For significant discrepancies, photo evidence and witness verification are required
            </li>
            <li>Sensor data is automatically fetched from the vehicle's AVL unit when available</li>
          </ul>
        </div>

        {/* Form Errors */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errors.submit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            icon={<X className="w-4 h-4" />}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            icon={<Save className="w-4 h-4" />}
            isLoading={isSubmitting}
            disabled={isSubmitting || !probeReading}
          >
            Verify Probe Reading
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AutomaticProbeVerificationModal;
