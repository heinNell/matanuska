import React from "react";
import { useNavigate } from "react-router-dom";
import IncidentReportForm from "../../components/forms/qc/IncidentReportForm";

/**
 * Report New Incident Page
 * Allows users to submit new safety incident reports
 */
const ReportNewIncidentPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    // In a real app, this would save to Firebase
    console.log("Submitting incident report:", data);

    // Show success message
    alert("Incident report submitted successfully!");

    // Navigate back to incidents list
    navigate("/compliance/incidents");
  };

  const handleCancel = () => {
    navigate("/compliance/incidents");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Report New Incident</h1>
      </div>

      <p className="text-gray-600">
        Complete the form below to report a new safety incident. All incidents should be reported
        within 24 hours.
      </p>

      <IncidentReportForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
};

export default ReportNewIncidentPage;
