import { Button } from "../../../components/ui/Button";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { addAuditLogToFirebase } from "../../../firebase";
import { DieselConsumptionRecord, FLEETS_WITH_PROBES } from "../../../types";
import { formatDate } from "../../../utils/helpers";
import { Input, TextArea } from "../../ui/FormElements";
import Modal from "../../ui/Modal";

interface EnhancedProbeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DieselConsumptionRecord;
}

const EnhancedProbeVerificationModal: React.FC<EnhancedProbeVerificationModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const { updateDieselRecord } = useAppContext();

  const [probeReading, setProbeReading] = useState(record.probeReading?.toString() || "");
  const [verificationNotes, setVerificationNotes] = useState(record.probeVerificationNotes || "");
  const [photoEvidence, setPhotoEvidence] = useState<File | null>(null);
  const [witnessName, setWitnessName] = useState(record.witnessName || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [discrepancy, setDiscrepancy] = useState<number | null>(null);
  const [discrepancyPercentage, setDiscrepancyPercentage] = useState<number | null>(null);

  // Calculate discrepancy when probe reading changes
  useEffect(() => {
    if (probeReading) {
      const probeValue = parseFloat(probeReading);
      if (!isNaN(probeValue)) {
        const diff = record.litresFilled - probeValue;
        setDiscrepancy(diff);

        const percentage = (diff / record.litresFilled) * 100;
        setDiscrepancyPercentage(percentage);
      } else {
        setDiscrepancy(null);
        setDiscrepancyPercentage(null);
      }
    } else {
      setDiscrepancy(null);
      setDiscrepancyPercentage(null);
    }
  }, [probeReading, record.litresFilled]);

  // Determine if the vehicle has a probe system
  const hasProbeSystem = FLEETS_WITH_PROBES.includes(record.fleetNumber);

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!probeReading) {
      newErrors.probeReading = "Probe reading is required";
    } else if (isNaN(parseFloat(probeReading))) {
      newErrors.probeReading = "Probe reading must be a number";
    }

    if (!witnessName) {
      newErrors.witnessName = "Witness name is required for verification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const probeValue = parseFloat(probeReading);
      const diff = record.litresFilled - probeValue;
      const percentage = (diff / record.litresFilled) * 100;

      // Determine if the reading is verified based on discrepancy
      // If discrepancy is less than 5%, consider it verified
      const isVerified = Math.abs(percentage) <= 5;

      // Update the diesel record
      // Upload photo evidence if available
      let photoUrl = record.photoEvidenceUrl;
      if (photoEvidence) {
        // In a real app, we would upload the file to storage here
        // For now, we'll just create an object URL as a placeholder
        photoUrl = URL.createObjectURL(photoEvidence);
        console.log("Photo evidence would be uploaded here:", photoEvidence.name);
      }

      await updateDieselRecord({
        ...record,
        probeReading: probeValue,
        probeDiscrepancy: diff,
        probeVerificationNotes: verificationNotes,
        witnessName,
        probeVerified: isVerified,
        probeVerifiedAt: new Date().toISOString(),
        photoEvidenceUrl: photoUrl,
        photoEvidenceName: photoEvidence?.name || record.photoEvidenceName,
      });

      // Add audit log
      await addAuditLogToFirebase({
        action: "VERIFY_DIESEL_RECORD",
        performedBy: "Current User", // You would get this from auth
        timestamp: new Date().toISOString(),
        details: {
          recordId: record.id,
          fleetNumber: record.fleetNumber,
          originalValue: record.litresFilled,
          probeReading: probeValue,
          discrepancy: diff,
          discrepancyPercentage: percentage,
          verified: isVerified,
        },
      });

      onClose();
    } catch (error) {
      console.error("Error verifying diesel record:", error);
      setErrors({ submit: "Failed to verify record. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoEvidence(e.target.files[0]);
    }
  };

  // Get status class based on discrepancy percentage
  const getStatusClass = () => {
    if (discrepancyPercentage === null) return "";

    if (Math.abs(discrepancyPercentage) <= 2) {
      return "text-green-600";
    } else if (Math.abs(discrepancyPercentage) <= 5) {
      return "text-amber-600";
    } else {
      return "text-red-600";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Diesel Consumption with Probe">
      <div className="space-y-6">
        {/* Header information */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Fleet</p>
              <p className="text-lg font-medium">{record.fleetNumber}</p>
              {!hasProbeSystem && (
                <p className="text-xs text-amber-600 mt-1">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  This vehicle may not have a probe system
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-lg font-medium">{formatDate(record.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Original Reading</p>
              <p className="text-lg font-medium">{record.litresFilled.toFixed(2)} L</p>
            </div>
          </div>
        </div>

        {/* Probe verification form */}
        <div>
          <h3 className="text-md font-medium mb-3">Probe Verification</h3>

          <div className="space-y-4">
            <div>
              <Input
                label="Probe Reading (Litres) *"
                type="number"
                value={probeReading}
                onChange={(e) => setProbeReading(e.target.value)}
                error={errors.probeReading}
                placeholder="0.00"
              />
            </div>

            {discrepancy !== null && discrepancyPercentage !== null && (
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Discrepancy</p>
                    <p
                      className={`text-lg font-semibold ${discrepancy > 0 ? "text-red-600" : discrepancy < 0 ? "text-green-600" : "text-gray-600"}`}
                    >
                      {discrepancy > 0 ? "+" : ""}
                      {discrepancy.toFixed(2)} L
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Percentage</p>
                    <p className={`text-lg font-semibold ${getStatusClass()}`}>
                      {discrepancyPercentage > 0 ? "+" : ""}
                      {discrepancyPercentage.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className={`flex items-center ${getStatusClass()}`}>
                      {Math.abs(discrepancyPercentage) <= 5 ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-1" />
                          <span className="font-medium">
                            {Math.abs(discrepancyPercentage) <= 2 ? "Verified" : "Acceptable"}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-5 w-5 mr-1" />
                          <span className="font-medium">Discrepancy</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Witness Name *"
                  type="text"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  error={errors.witnessName}
                  placeholder="Enter name of witness"
                />
              </div>
              <div>
                <Input
                  label="Photo Evidence (Optional)"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <p className="mt-1 text-xs text-gray-500">Upload a photo of the probe reading</p>
                <TextArea
                  label="Verification Notes"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about the verification process..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Information box */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                A discrepancy of less than 5% is considered acceptable due to measurement
                tolerances. Discrepancies greater than 5% will be flagged for investigation.
              </p>
            </div>
          </div>
        </div>

        {/* Submit error message */}
        {errors.submit && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-1">⏳</span> Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 h-4 w-4" /> Verify Record
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EnhancedProbeVerificationModal;
