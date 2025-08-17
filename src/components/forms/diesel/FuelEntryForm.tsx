import { Button } from "../../../components/ui/Button";
import { Droplet, Save, Truck, X } from "lucide-react";
import React, { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { useDepots, useDrivers, useFleetVehicles } from "../../../hooks/useFirestoreCollection";
import Card, { CardContent, CardHeader } from "../../ui/Card";

interface FuelEntryFormProps {
  onSubmit: (data: FuelEntryData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<FuelEntryData>;
}

export interface FuelEntryData {
  vehicle: string;
  liters: string;
  date: string;
  odometer: string;
  location: string;
  fuelType: string;
  cost: string;
  currency: string;
  notes: string;
  driverId?: string;
  fuelCardNumber?: string;
}

const FuelEntryForm: React.FC<FuelEntryFormProps> = ({ onSubmit, onCancel, initialData = {} }) => {
  useAppContext(); // Keep the import since it might be needed later
  const [loading, setLoading] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);

  // Fetch data from Firestore
  const { data: vehicles, loading: vehiclesLoading } = useFleetVehicles();
  const { data: drivers, loading: driversLoading } = useDrivers();
  const { data: locations, loading: locationsLoading } = useDepots();

  const [formData, setFormData] = useState<FuelEntryData>({
    vehicle: initialData.vehicle || "",
    liters: initialData.liters || "",
    date: initialData.date || new Date().toISOString().split("T")[0],
    odometer: initialData.odometer || "",
    location: initialData.location || "",
    fuelType: initialData.fuelType || "diesel",
    cost: initialData.cost || "",
    currency: initialData.currency || "USD",
    notes: initialData.notes || "",
    driverId: initialData.driverId || "",
    fuelCardNumber: initialData.fuelCardNumber || "",
  });

  // For fuel cards - typically this would come from Firestore as well
  // but for now we'll use a static list
  const fuelCards = [
    { id: "FC001", number: "**** **** **** 1234" },
    { id: "FC002", number: "**** **** **** 5678" },
    { id: "FC003", number: "**** **** **** 9012" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Calculate total cost when liters or cost per liter changes
    if (name === "liters" || name === "cost") {
      const liters = name === "liters" ? parseFloat(value) : parseFloat(formData.liters);
      const costPerLiter = name === "cost" ? parseFloat(value) : parseFloat(formData.cost);

      if (!isNaN(liters) && !isNaN(costPerLiter)) {
        const total = liters * costPerLiter;
        setCalculatedCost(total);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting fuel entry:", error);
    } finally {
      setLoading(false);
    }
  };

  // Display a truck icon with vehicle information
  const renderVehicleIcon = () => {
    const selectedVehicle = vehicles?.find(
      (v) => v.fleetNumber === formData.vehicle || v.id === formData.vehicle
    );

    return (
      <div className="flex items-center mb-4">
        <Truck className="w-5 h-5 mr-2 text-blue-500" />
        <span className="text-sm text-gray-700">
          {selectedVehicle
            ? `${selectedVehicle.fleetNumber} - ${selectedVehicle.make} ${selectedVehicle.model}`
            : "Select a vehicle"}
        </span>
      </div>
    );
  };

  // Determine if any data is still loading
  const isDataLoading = vehiclesLoading || driversLoading || locationsLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Droplet className="w-5 h-5 mr-2 text-blue-500" />
          <h2 className="text-lg font-semibold">Fuel Entry Details</h2>
        </div>
      </CardHeader>

      <CardContent>
        {formData.vehicle && renderVehicleIcon()}

        {isDataLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-sm text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  disabled={loading}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles?.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.fleetNumber}>
                      {vehicle.fleetNumber} - {vehicle.make} {vehicle.model} ({vehicle.registration}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  disabled={loading}
                >
                  <option value="">Select Driver</option>
                  {drivers?.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liters/Gallons
                </label>
                <input
                  type="number"
                  name="liters"
                  value={formData.liters}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer (km)
                </label>
                <input
                  type="number"
                  name="odometer"
                  value={formData.odometer}
                  onChange={handleChange}
                  placeholder="Current reading"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Per Liter
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full p-2 pl-7 border border-gray-300 rounded-md"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  disabled={loading}
                >
                  <option value="">Select Fuel Station</option>
                  {locations?.map((depot) => (
                    <option key={depot.id} value={depot.name}>
                      {depot.name} ({depot.town})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Card</label>
                <select
                  name="fuelCardNumber"
                  value={formData.fuelCardNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={loading}
                >
                  <option value="">No fuel card used</option>
                  {fuelCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional information"
                className="w-full p-2 border border-gray-300 rounded-md h-24"
                disabled={loading}
              />
            </div>

            {calculatedCost !== null && (
              <div
                className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">
                  Calculated Total Cost: ${calculatedCost.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center gap-2"
                disabled={loading || isDataLoading}
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Fuel Entry"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default FuelEntryForm;
