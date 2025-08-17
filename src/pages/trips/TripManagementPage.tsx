import { Button } from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { addDoc, collection } from "firebase/firestore";
import { PlusCircle, Truck } from "lucide-react";
import React, { useState } from "react";
import { TripForm } from "../../components/forms/trips/TripForm";
import { db } from "../../firebase";
import type { TripFormData } from "../../types/TripTypes";

const TripManagementPage: React.FC = () => {
  const [showTripForm, setShowTripForm] = useState(false);
  const [, setIsSubmitting] = useState(false); // Unused but needed for state updates
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddTrip = async (tripData: TripFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Add trip to Firestore
      await addDoc(collection(db, "trips"), {
        ...tripData,
        status: "active",
        costs: [],
        createdAt: new Date().toISOString(),
      });

      setSubmitSuccess(true);
      setShowTripForm(false);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error adding trip:", error);
      setErrorMessage("Failed to add trip. Please try again.");
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Truck className="mr-2" />
          Trip Management
        </h1>
        <Button onClick={() => setShowTripForm(true)} variant="primary">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Trip
        </Button>
      </div>

      {/* Success message */}
      {submitSuccess === true && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-green-700">Trip was added successfully!</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trip form modal */}
      <Modal
        isOpen={showTripForm}
        onClose={() => setShowTripForm(false)}
        title="Add New Trip"
        maxWidth="2xl"
      >
        <TripForm
          onSubmit={handleAddTrip}
          onCancel={() => setShowTripForm(false)}
          isSubmitting={false}
        />
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <Card.Header title="Trip Analytics" />
          <Card.Content>
            <p className="text-gray-600">
              Analyze your trips and identify optimization opportunities.
            </p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header title="Trip History" />
          <Card.Content>
            <p className="text-gray-600">View completed trips and their performance data.</p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header title="Plan Routes" />
          <Card.Content>
            <p className="text-gray-600">
              Plan optimal routes for future trips to save time and fuel.
            </p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default TripManagementPage;
