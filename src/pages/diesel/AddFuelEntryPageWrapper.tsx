import React from "react";
import { useNavigate } from "react-router-dom";
import FuelEntryForm, { FuelEntryData } from "../../components/forms/diesel/FuelEntryForm";

const AddFuelEntryPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: FuelEntryData) => {
    try {
      console.log("Submitting fuel entry:", data);
      // Here you would normally submit to Firebase/Firestore
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      navigate("/diesel/fuel-logs");
    } catch (error) {
      console.error("Error adding fuel entry:", error);
    }
  };

  const handleCancel = () => {
    navigate("/diesel");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add Fuel Entry</h1>
      </div>

      <FuelEntryForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
};

export default AddFuelEntryPage;
