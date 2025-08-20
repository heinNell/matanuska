import React, { useState, useEffect } from "react";
import Modal from '../../ui/Modal';
import { TripForm } from "../../../components/forms/trips/TripForm";
import { Trip } from "../../../types";
import { useAppContext } from "../../../context/AppContext";
import { AlertTriangle } from "lucide-react";
import type { BaseSensorResult } from "../../../types/wialon-sensors";

interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTrip?: Trip;
  sensorData?: BaseSensorResult;
  unitId?: number;
}

const TripFormModal: React.FC<TripFormModalProps> = ({
  isOpen,
  onClose,
  editingTrip,
  sensorData,
  unitId
}) => {
  const { addTrip, updateTrip, isLoading } = useAppContext();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fuelLevel: sensorData?.fuel?.value ?? 0,
    speed: sensorData?.speed?.value ?? 0,
    engineHours: sensorData?.engineHours?.value ?? 0,
    ignition: sensorData?.ignition?.value ?? 0
  });

  useEffect(() => {
    if (sensorData) {
      setFormData(prev => ({
        ...prev,
        fuelLevel: sensorData.fuel?.value ?? prev.fuelLevel,
        speed: sensorData.speed?.value ?? prev.speed,
        engineHours: sensorData.engineHours?.value ?? prev.engineHours,
        ignition: sensorData.ignition?.value ?? prev.ignition
      }));
    }
  }, [sensorData]);

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
      {/* Add sensor data fields to form */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Fuel Level</label>
          <input
            type="number"
            value={formData.fuelLevel}
            readOnly
            className="bg-gray-100"
          />
        </div>
        <div>
          <label>Speed</label>
          <input
            type="number"
            value={formData.speed}
            readOnly
            className="bg-gray-100"
          />
        </div>
        <div>
          <label>Engine Hours</label>
          <input
            type="number"
            value={formData.engineHours}
            readOnly
            className="bg-gray-100"
          />
        </div>
        <div>
          <label>Ignition</label>
          <input
            type="number"
            value={formData.ignition}
            readOnly
            className="bg-gray-100"
          />
        </div>
      </div>
    </Modal>
  );
};

export default TripFormModal;
