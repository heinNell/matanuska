import { Button } from "../../../components/ui/Button";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, Clipboard, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { firestore } from "../../../firebase";
import { useFleetData, Vehicle } from "../../../hooks/useFleetData";
import Card, { CardContent, CardHeader } from "../../ui/Card";

interface InspectionItem {
  name: string;
  status: "passed" | "failed" | null;
  comments: string;
}

const defaultInspectionItems: InspectionItem[] = [
  { name: "Tire Pressure", status: null, comments: "" },
  { name: "Lights (Headlights, Brake Lights, Turn Signals)", status: null, comments: "" },
  { name: "Oil Level", status: null, comments: "" },
  { name: "Brake Fluid", status: null, comments: "" },
  { name: "Windshield Wipers & Fluid", status: null, comments: "" },
  { name: "Horn", status: null, comments: "" },
  { name: "Seat Belts", status: null, comments: "" },
  { name: "Mirrors", status: null, comments: "" },
  { name: "Fuel Level", status: null, comments: "" },
  { name: "Body Damage", status: null, comments: "" },
];

const DriverInspectionForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const fleetNumber = searchParams.get("fleet");
  const navigate = useNavigate();

  const { vehicles, loading } = useFleetData();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [driverName, setDriverName] = useState("");
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>(defaultInspectionItems);
  const [additionalComments, setAdditionalComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (vehicles && fleetNumber) {
      const foundVehicle = vehicles.find((v) => v.fleetNumber === fleetNumber);
      if (foundVehicle) {
        setVehicle(foundVehicle);
      }
    }
  }, [vehicles, fleetNumber]);

  const handleStatusChange = (index: number, status: "passed" | "failed") => {
    const updatedItems = [...inspectionItems];
    if (updatedItems[index]) {
      updatedItems[index].status = status;
      setInspectionItems(updatedItems);
    }
  };

  const handleCommentsChange = (index: number, comments: string) => {
    const updatedItems = [...inspectionItems];
    if (updatedItems[index]) {
      updatedItems[index].comments = comments;
      setInspectionItems(updatedItems);
    }
  };

  const isFormValid = () => {
    return driverName.trim() !== "" && inspectionItems.every((item) => item.status !== null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicle || !isFormValid()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const inspectionData = {
        driverName,
        fleetNumber: vehicle.fleetNumber,
        registration: vehicle.registration,
        make: vehicle.make,
        model: vehicle.model,
        inspectionItems,
        additionalComments,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(firestore, "inspections"), inspectionData);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting inspection:", error);
      alert("Error submitting inspection. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Vehicle Not Found</h2>
            <p className="mb-4">
              The fleet number provided is invalid or does not exist in the system.
            </p>
            <Button onClick={() => navigate("/workshop")}>Return to Workshop</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-green-600 mb-2">Inspection Submitted</h2>
            <p className="mb-4">Thank you for completing the vehicle inspection.</p>
            <Button
              onClick={() => {
                setInspectionItems(defaultInspectionItems);
                setDriverName("");
                setAdditionalComments("");
                setIsSubmitted(false);
              }}
            >
              Complete Another Inspection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Driver Inspection Form">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Clipboard className="w-5 h-5" />
              <h2 className="text-xl font-bold">Driver Inspection Form</h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => navigate("/workshop/inspection-history")}
              >
                <Clipboard className="w-4 h-4" />
                View Inspection History
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => navigate("/workshop")}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Workshop
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Fleet Number</p>
                <p className="text-base">{vehicle.fleetNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Registration</p>
                <p className="text-base">{vehicle.registration}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Make</p>
                <p className="text-base">{vehicle.make}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Model</p>
                <p className="text-base">{vehicle.model}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
                Driver Name *
              </label>
              <input
                type="text"
                id="driverName"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Inspection Items</h3>
              <div className="space-y-4">
                {inspectionItems.map((item, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">{item.name} *</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(index, "passed")}
                          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                            item.status === "passed"
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(index, "failed")}
                          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                            item.status === "failed"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <XCircle className="w-4 h-4" /> Fail
                        </button>
                      </div>
                    </div>
                    {item.status === "failed" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comments (Required for Failed Items)
                        </label>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows={2}
                          value={item.comments}
                          onChange={(e) => handleCommentsChange(index, e.target.value)}
                          required={item.status === "failed"}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="additionalComments"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Additional Comments
              </label>
              <textarea
                id="additionalComments"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={4}
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!isFormValid() || isSubmitting} className="px-6 py-2">
                {isSubmitting ? "Submitting..." : "Submit Inspection"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverInspectionForm;
