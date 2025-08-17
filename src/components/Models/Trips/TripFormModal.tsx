import React, { useState } from "react";
import Modal from '../../ui/Modal';
import { TripForm } from "../../../components/forms/trips/TripForm";
import { Trip } from "../../../types";
import { useAppContext } from "../../../context/AppContext";
import { AlertTriangle } from "lucide-react";

interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTrip?: Trip;
}

const TripFormModal: React.FC<TripFormModalProps> = ({ isOpen, onClose, editingTrip }) => {
  const { addTrip, updateTrip, isLoading } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    tripData: Omit<Trip, "id" | "costs" | "status" | "additionalCosts">
  ) => {
    try {
      setError(null);
      if (editingTrip) {
        // Update existing trip
        await updateTrip({
          ...editingTrip,
          ...tripData,
        });
        console.log("Trip updated successfully");
      } else {
        // Add new trip
        await addTrip({
          ...tripData,
          additionalCosts: [], // Initialize additionalCosts as empty array
        });
        console.log("Trip added successfully");
      }
      // Close the modal after successful submission
      onClose();
    } catch (error) {
      console.error("Error saving trip:", error);
      setError(error instanceof Error ? error.message : "Failed to save trip. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTrip ? "Edit Trip" : "Add New Trip"}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      <TripForm
        trip={editingTrip}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isLoading?.addTrip || isLoading?.[`updateTrip-${editingTrip?.id}`]}
      />
    </Modal>
  );
};

export default TripFormModal;
