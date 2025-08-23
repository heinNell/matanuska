import { Button } from "../../components/ui/Button";
import {
  AlertTriangle,
  Box,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  Scale,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { LOAD_CATEGORIES, LoadPlan, Trip } from "../../types";
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input, Select, TextArea } from "../ui/FormElements";
import LoadingIndicator from "../ui/LoadingIndicator";

interface LoadPlanningComponentProps {
  tripId: string;
}

interface CargoItem {
  id: string;
  description: string;
  weight: number;
  volume: number;
  quantity: number;
  stackable: boolean;
  hazardous: boolean;
  category: string;
  priorityLevel: "low" | "medium" | "high";
}

const LoadPlanningComponent: React.FC<LoadPlanningComponentProps> = ({ tripId }) => {
  const { getTrip, getLoadPlan, addLoadPlan, updateLoadPlan } = useAppContext();

  const [trip, setTrip] = useState<Trip | undefined>(undefined);
  const [loadPlan, setLoadPlan] = useState<LoadPlan | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // New cargo item form
  const [newItem, setNewItem] = useState<CargoItem>({
    id: "",
    description: "",
    weight: 0,
    volume: 0,
    quantity: 1,
    stackable: true,
    hazardous: false,
    category: "general_cargo",
    priorityLevel: "medium",
  });

  // Vehicle capacity defaults (would ideally come from vehicle data)
  const [vehicleCapacity] = useState({
    weight: 34000, // kg
    volume: 86, // cubic meters
    length: 13.6, // meters
    width: 2.5, // meters
    height: 2.6, // meters
  });

  // Fetch trip and load plan data
  useEffect(() => {
    if (tripId) {
      const tripData = getTrip(tripId);
      if (tripData) {
        setTrip(tripData);

        // Check if trip has a load plan
        if (tripData.loadPlanId) {
          const loadPlanData = getLoadPlan(tripData.loadPlanId);
          if (loadPlanData) {
            setLoadPlan(loadPlanData);
          }
        }
      } else {
        setError(`Trip with ID ${tripId} not found`);
      }
    }
  }, [tripId, getTrip, getLoadPlan]);

  // Calculate total weight and volume
  const calculateTotals = () => {
    if (!loadPlan) return { totalWeight: 0, totalVolume: 0 };

    const totalWeight = loadPlan.cargoItems.reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0
    );

    const totalVolume = loadPlan.cargoItems.reduce(
      (sum, item) => sum + item.volume * item.quantity,
      0
    );

    return { totalWeight, totalVolume };
  };

  // Handle adding new cargo item
  const handleAddItem = () => {
    if (!newItem.description || newItem.weight <= 0 || newItem.volume <= 0) {
      setError("Please fill out all required fields for the cargo item");
      return;
    }

    const itemToAdd = {
      ...newItem,
      id: `cargo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    if (loadPlan) {
      // Update existing load plan
      const updatedPlan = {
        ...loadPlan,
        cargoItems: [...loadPlan.cargoItems, itemToAdd],
        updatedAt: new Date().toISOString(),
      };

      updateLoadPlan(updatedPlan)
        .then(() => {
          setLoadPlan(updatedPlan);
          resetNewItemForm();
          setIsAddingItem(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to add cargo item");
        });
    } else if (trip) {
      // Create new load plan
      const newPlan: Omit<LoadPlan, "id" | "createdAt"> = {
        tripId,
        vehicleCapacity,
        cargoItems: [itemToAdd],
        utilisationRate: 0, // Will be calculated later
        createdBy: "Current User", // In real app, use the logged-in user
        updatedAt: new Date().toISOString(),
      };

      addLoadPlan(newPlan)
        .then((planId) => {
          const createdPlan = getLoadPlan(planId);
          if (createdPlan) {
            setLoadPlan(createdPlan);
          }
          resetNewItemForm();
          setIsAddingItem(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to create load plan");
        });
    }
  };

  // Handle deleting a cargo item
  const handleDeleteItem = (itemId: string) => {
    if (!loadPlan) return;

    const updatedPlan = {
      ...loadPlan,
      cargoItems: loadPlan.cargoItems.filter((item) => item.id !== itemId),
      updatedAt: new Date().toISOString(),
    };

    updateLoadPlan(updatedPlan)
      .then(() => {
        setLoadPlan(updatedPlan);
      })
      .catch((err) => {
        setError(err.message || "Failed to delete cargo item");
      });
  };

  // Reset new item form
  const resetNewItemForm = () => {
    setNewItem({
      id: "",
      description: "",
      weight: 0,
      volume: 0,
      quantity: 1,
      stackable: true,
      hazardous: false,
      category: "general_cargo",
      priorityLevel: "medium",
    });
    setError(null);
  };

  // Update a field in the new item form
  const updateNewItemField = (field: string, value: any) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null); // Clear error when user updates a field
  };

  // Calculate utilization percentages
  const calculateUtilization = () => {
    const { totalWeight, totalVolume } = calculateTotals();

    const weightUtilization = (totalWeight / vehicleCapacity.weight) * 100;
    const volumeUtilization = (totalVolume / vehicleCapacity.volume) * 100;

    // Overall utilization is the higher of the two, since whichever one maxes out first is the limiting factor
    const overallUtilization = Math.max(weightUtilization, volumeUtilization);

    return {
      weightUtilization,
      volumeUtilization,
      overallUtilization,
    };
  };

  // Get utilization class based on percentage
  const getUtilizationClass = (percentage: number) => {
    if (percentage > 95) return "bg-red-500";
    if (percentage > 85) return "bg-yellow-500";
    if (percentage > 60) return "bg-green-500";
    return "bg-blue-500";
  };

  // Format number with thousand separators
  const formatNumber = (num: number, decimals = 0) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  if (!trip) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <LoadingIndicator text="Loading trip data..." />
          )}
        </CardContent>
      </Card>
    );
  }

  const { totalWeight, totalVolume } = calculateTotals();
  const { weightUtilization, volumeUtilization, overallUtilization } = calculateUtilization();

  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <Package className="mr-2 h-5 w-5" />
            <span>Load Planning</span>
            {expanded ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </div>
        }
        action={
          expanded && (
            <Button
              size="sm"
              variant={isAddingItem ? "outline" : "primary"}
              icon={isAddingItem ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              onClick={() => {
                setIsAddingItem(!isAddingItem);
                if (isAddingItem) resetNewItemForm();
              }}
            >
              {isAddingItem ? "Cancel" : "Add Cargo"}
            </Button>
          )
        }
      />

      {expanded && (
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Capacity */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Vehicle Capacity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Weight Capacity */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <Scale className="w-5 h-5 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-700">Weight Capacity</h4>
                </div>

                <p className="text-lg font-bold text-gray-900 mb-1">
                  {formatNumber(totalWeight)} / {formatNumber(vehicleCapacity.weight)} kg
                </p>

                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className={`h-2.5 rounded-full ${getUtilizationClass(weightUtilization)}`}
                    style={{ width: `${Math.min(weightUtilization, 100)}%` }}
                  />
                </div>

                <p className="text-sm text-gray-500">{weightUtilization.toFixed(1)}% utilized</p>
              </div>

              {/* Volume Capacity */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <Box className="w-5 h-5 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-700">Volume Capacity</h4>
                </div>

                <p className="text-lg font-bold text-gray-900 mb-1">
                  {totalVolume.toFixed(1)} / {vehicleCapacity.volume.toFixed(1)} m³
                </p>

                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className={`h-2.5 rounded-full ${getUtilizationClass(volumeUtilization)}`}
                    style={{ width: `${Math.min(volumeUtilization, 100)}%` }}
                  />
                </div>

                <p className="text-sm text-gray-500">{volumeUtilization.toFixed(1)}% utilized</p>
              </div>

              {/* Overall Utilization */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-gray-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-700">Overall Utilization</h4>
                </div>

                <p className="text-lg font-bold text-gray-900 mb-1">
                  {overallUtilization.toFixed(1)}%
                </p>

                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div
                    className={`h-2.5 rounded-full ${getUtilizationClass(overallUtilization)}`}
                    style={{ width: `${Math.min(overallUtilization, 100)}%` }}
                  />
                </div>

                <p className="text-sm text-gray-500">
                  {overallUtilization > 95
                    ? "Overloaded! Reduce cargo."
                    : overallUtilization > 85
                      ? "Near capacity. Check weight distribution."
                      : overallUtilization > 60
                        ? "Good utilization."
                        : "Underutilized capacity."}
                </p>
              </div>
            </div>
          </div>

          {/* Add New Cargo Item Form */}
          {isAddingItem && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-md font-medium text-blue-800 mb-3">Add Cargo Item</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Description"
                  value={newItem.description}
                  onChange={(value) => updateNewItemField("description", value)}
                  placeholder="e.g., Pallets of Product A"
                />

                <Select
                  label="Category"
                  value={newItem.category}
                  onChange={(value) => updateNewItemField("category", value)}
                  options={[
                    ...LOAD_CATEGORIES.map((cat) => ({ label: cat.label, value: cat.value })),
                  ]}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Weight (kg)"
                    type="number"
                    min="0"
                    step="1"
                    value={newItem.weight.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateNewItemField("weight", parseFloat(e.target.value) || 0)
                    }
                  />

                  <Input
                    label="Volume (m³)"
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItem.volume.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateNewItemField("volume", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>

                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={newItem.quantity.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    updateNewItemField("quantity", parseInt(e.target.value) || 1)
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="stackable"
                      checked={newItem.stackable}
                      onChange={(e) => updateNewItemField("stackable", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="stackable" className="ml-2 block text-sm text-gray-900">
                      Stackable
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hazardous"
                      checked={newItem.hazardous}
                      onChange={(e) => updateNewItemField("hazardous", e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hazardous" className="ml-2 block text-sm text-gray-900">
                      Hazardous
                    </label>
                  </div>
                </div>

                <Select
                  label="Priority Level"
                  value={newItem.priorityLevel}
                  onChange={(value) => updateNewItemField("priorityLevel", value)}
                  options={[
                    { label: "Low Priority", value: "low" },
                    { label: "Medium Priority", value: "medium" },
                    { label: "High Priority", value: "high" },
                  ]}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleAddItem}
                  disabled={!newItem.description || newItem.weight <= 0 || newItem.volume <= 0}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Item
                </Button>
              </div>
            </div>
          )}

          {/* Cargo Items List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Cargo Items</h3>

            {loadPlan && loadPlan.cargoItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Weight (kg)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Volume (m³)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Properties
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadPlan.cargoItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.description}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.priorityLevel === "high"
                                  ? "High Priority"
                                  : item.priorityLevel === "medium"
                                    ? "Medium Priority"
                                    : "Low Priority"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {LOAD_CATEGORIES.find((cat) => cat.value === item.category)?.label ||
                            item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {formatNumber(item.weight * item.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {(item.volume * item.quantity).toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            {item.stackable && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Stackable
                              </span>
                            )}
                            {item.hazardous && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Hazardous
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Totals row */}
                    <tr className="bg-gray-50">
                      <td
                        colSpan={3}
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        Totals
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatNumber(totalWeight)} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {totalVolume.toFixed(1)} m³
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No cargo items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add cargo items to plan the load for this trip.
                </p>

                {!isAddingItem && (
                  <div className="mt-6">
                    <Button
                      onClick={() => setIsAddingItem(true)}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add First Cargo Item
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Load Notes */}
          {loadPlan && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Load Notes</h3>
              <TextArea
                value={loadPlan.notes || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
                  let notesValue: string;
                  if (typeof e === "string") {
                    notesValue = e;
                  } else {
                    notesValue = e.target.value;
                  }
                  if (loadPlan) {
                    const updatedPlan = {
                      ...loadPlan,
                      notes: notesValue,
                      updatedAt: new Date().toISOString(),
                    };

                    updateLoadPlan(updatedPlan)
                      .then(() => {
                        setLoadPlan(updatedPlan);
                      })
                      .catch((err) => {
                        setError(err.message || "Failed to update notes");
                      });
                  }
                }}
                placeholder="Add loading instructions, special handling requirements, or other notes about this load..."
                rows={3}
              />
            </div>
          )}

          {/* Load Analysis and Recommendations */}
          {loadPlan && loadPlan.cargoItems.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-3">Load Analysis</h3>

              <div className="space-y-4">
                {/* Utilization summary */}
                <div>
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Utilization Summary</h4>
                  <p className="text-sm text-blue-600">
                    This load utilizes {overallUtilization.toFixed(1)}% of the vehicle's capacity.
                    {overallUtilization > 95
                      ? " The vehicle is at maximum capacity. Consider reducing the load or using a larger vehicle."
                      : overallUtilization < 60
                        ? " The vehicle is significantly underutilized. Consider adding more cargo or using a smaller vehicle if available."
                        : " The vehicle is well utilized for this trip."}
                  </p>
                </div>

                {/* Weight distribution (simplified) */}
                <div>
                  <h4 className="text-sm font-medium text-blue-700 mb-2">Weight Distribution</h4>
                  <p className="text-sm text-blue-600">
                    {totalWeight / vehicleCapacity.weight > 0.9
                      ? "⚠️ This load is approaching the maximum weight capacity. Ensure weight is distributed evenly across all axles."
                      : "Weight distribution appears to be within acceptable limits. Ensure cargo is secured properly."}
                  </p>
                </div>

                {/* Hazardous materials warning */}
                {loadPlan.cargoItems.some((item) => item.hazardous) && (
                  <div className="bg-red-50 p-3 rounded border border-red-200 flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">
                        Hazardous Materials Present
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        This load contains hazardous materials. Ensure all proper documentation is
                        in place and special handling protocols are followed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Stackability note */}
                {loadPlan.cargoItems.some((item) => !item.stackable) && (
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200 flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Non-Stackable Items Present
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This load contains items that cannot be stacked. Ensure these items are
                        loaded last or on top of other cargo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default LoadPlanningComponent;
