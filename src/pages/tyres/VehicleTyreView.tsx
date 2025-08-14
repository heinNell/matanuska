import { Button } from "@/components/ui/Button";
import { AlertTriangle, CircleDot, Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import LoadingIndicator from "../../components/ui/LoadingIndicator";
import { useTyres } from "../../context/TyreContext";
import { useFleetList } from "../../hooks/useFleetList";
import { FleetTyreMapping, Tyre, TyrePosition, formatTyreSize } from "../../types/tyre";
import { getPositionsByFleet } from "../../utils/tyreConstants";

// Helper functions needed for this component
const formatCurrency = (amount: number | undefined, currency: string = "ZAR"): string => {
  if (amount === undefined || isNaN(amount)) return "N/A";

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const calculateCostPerKm = (tyre: Tyre | undefined): number | undefined => {
  if (!tyre || !tyre.purchaseDetails || !tyre.purchaseDetails.cost || !tyre.kmRun) {
    return undefined;
  }

  return tyre.kmRun > 0 ? tyre.purchaseDetails.cost / tyre.kmRun : undefined;
};

interface VehicleTyreViewProps {
  selectedVehicle: string;
  onTyreSelect: (tyre: Tyre | null) => void;
  onVehicleSelect?: (vehicleId: string) => void;
}

const VehicleTyreView: React.FC<VehicleTyreViewProps> = ({
  selectedVehicle,
  onTyreSelect,
  onVehicleSelect,
}) => {
  const { loading, getTyresByVehicle } = useTyres();
  const [vehicleTyres, setVehicleTyres] = useState<Tyre[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [tyreConfig, setTyreConfig] = useState<FleetTyreMapping | null>(null);
  const { fleetOptions } = useFleetList({ includeDetails: true });

  useEffect(() => {
    if (selectedVehicle) {
      // Get available positions for this vehicle
      const positions = getPositionsByFleet(selectedVehicle);

      // Create tyre configuration mapping
      setTyreConfig({
        fleetNumber: selectedVehicle,
        vehicleType: getVehicleType(selectedVehicle),
        positions: positions.map((pos) => ({
          position: pos as TyrePosition,
          tyreCode: "",
          brand: "",
          pattern: "",
          size: "",
          lastInspectionDate: "",
          treadDepth: 0,
          pressure: 0,
          odometerAtFitment: 0,
          kmSinceFitment: 0,
        })),
      });

      // Load tyres for this vehicle from Firestore
      getTyresByVehicle(selectedVehicle)
        .then((fetchedTyres) => {
          setVehicleTyres(fetchedTyres);
        })
        .catch((err) => {
          console.error("Error fetching vehicle tyres:", err);
        });
    }
  }, [selectedVehicle, getTyresByVehicle]);

  // Helper to determine vehicle type based on fleet number
  const getVehicleType = (fleetNo: string): string => {
    if (fleetNo.includes("H")) return "HORSE";
    if (fleetNo.includes("T")) return "INTERLINK";
    if (fleetNo.includes("F")) return "REEFER";
    if (fleetNo.includes("L")) return "LMV";
    return "OTHER";
  };

  // Get tyre at a specific position
  const getTyreAtPosition = (position: string): Tyre | undefined => {
    return vehicleTyres.find(
      (t) => t.mountStatus === "mounted" && t.installation?.position === position
    );
  };

  // Handle position click
  const handlePositionClick = (position: string) => {
    setSelectedPosition(position);
    const tyre = getTyreAtPosition(position);
    onTyreSelect(tyre || null);
  };

  // Get status color for tyre position
  const getPositionStatusColor = (position: string): string => {
    const tyre = getTyreAtPosition(position);
    if (!tyre) return "bg-gray-200";

    switch (tyre.condition.status) {
      case "good":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-orange-500";
      case "needs_replacement":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  if (!selectedVehicle) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CircleDot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Vehicle Selected</h3>
          <p className="text-gray-500 mb-6">Please select a vehicle to view its tyre positions</p>
          <div className="flex justify-center">
            <select
              className="px-4 py-2 border rounded-md"
              onChange={(e) => onVehicleSelect && onVehicleSelect(e.target.value)}
            >
              <option value="">Select a vehicle</option>
              {fleetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <LoadingIndicator text="Loading tyre data..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-xl font-medium">Tyre Positions for {selectedVehicle}</h3>
        </CardHeader>
        <CardContent>
          {tyreConfig ? (
            <div className="bg-gray-100 p-6 rounded-lg relative">
              {/* Visual representation of vehicle and tyre positions */}
              <div className="flex flex-col items-center space-y-8">
                {/* Vehicle type indicator */}
                <div className="text-center bg-blue-100 p-2 rounded-md w-full">
                  <p className="font-medium text-blue-800">{tyreConfig.vehicleType}</p>
                </div>

                {/* Front axle */}
                <div className="flex justify-center space-x-20">
                  {tyreConfig.positions
                    .filter((p) => p.position.startsWith("V1") || p.position.startsWith("V2"))
                    .map((pos) => (
                      <div
                        key={pos.position}
                        className="relative cursor-pointer"
                        onClick={() => handlePositionClick(pos.position)}
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                            selectedPosition === pos.position
                              ? "border-blue-600"
                              : "border-gray-400"
                          } ${getPositionStatusColor(pos.position)}`}
                        >
                          <span className="font-bold text-white">{pos.position}</span>
                        </div>
                        {getTyreAtPosition(pos.position) && (
                          <div className="absolute -bottom-6 left-0 right-0 text-xs text-center">
                            {getTyreAtPosition(pos.position)?.brand}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Middle axles */}
                <div className="flex justify-center space-x-10">
                  {tyreConfig.positions
                    .filter(
                      (p) =>
                        p.position.startsWith("V3") ||
                        p.position.startsWith("V4") ||
                        p.position.startsWith("V5") ||
                        p.position.startsWith("V6")
                    )
                    .map((pos) => (
                      <div
                        key={pos.position}
                        className="relative cursor-pointer"
                        onClick={() => handlePositionClick(pos.position)}
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                            selectedPosition === pos.position
                              ? "border-blue-600"
                              : "border-gray-400"
                          } ${getPositionStatusColor(pos.position)}`}
                        >
                          <span className="font-bold text-white">{pos.position}</span>
                        </div>
                        {getTyreAtPosition(pos.position) && (
                          <div className="absolute -bottom-6 left-0 right-0 text-xs text-center">
                            {getTyreAtPosition(pos.position)?.brand}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Rear axles */}
                <div className="flex justify-center space-x-10">
                  {tyreConfig.positions
                    .filter(
                      (p) =>
                        p.position.startsWith("V7") ||
                        p.position.startsWith("V8") ||
                        p.position.startsWith("V9") ||
                        p.position.startsWith("V10")
                    )
                    .map((pos) => (
                      <div
                        key={pos.position}
                        className="relative cursor-pointer"
                        onClick={() => handlePositionClick(pos.position)}
                      >
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                            selectedPosition === pos.position
                              ? "border-blue-600"
                              : "border-gray-400"
                          } ${getPositionStatusColor(pos.position)}`}
                        >
                          <span className="font-bold text-white">{pos.position}</span>
                        </div>
                        {getTyreAtPosition(pos.position) && (
                          <div className="absolute -bottom-6 left-0 right-0 text-xs text-center">
                            {getTyreAtPosition(pos.position)?.brand}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-sm">
                  <div className="text-xs font-medium mb-1">Status Legend</div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-xs">Good</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-xs">Warning</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span className="text-xs">Critical</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-xs">Replace</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-gray-200 rounded-full"></span>
                    <span className="text-xs">Empty</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-800">No tyre configuration found for this vehicle.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Tyre Details */}
      {selectedPosition && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-medium">Tyre Details - Position {selectedPosition}</h3>
          </CardHeader>
          <CardContent>
            {getTyreAtPosition(selectedPosition) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Specifications</h4>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Brand & Model</td>
                        <td className="py-2 font-medium">
                          {getTyreAtPosition(selectedPosition)?.brand}{" "}
                          {getTyreAtPosition(selectedPosition)?.model}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Serial Number</td>
                        <td className="py-2 font-medium">
                          {getTyreAtPosition(selectedPosition)?.serialNumber}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Size</td>
                        <td className="py-2 font-medium">
                          {getTyreAtPosition(selectedPosition)?.size
                            ? formatTyreSize(getTyreAtPosition(selectedPosition)!.size)
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Type</td>
                        <td className="py-2 font-medium">
                          {getTyreAtPosition(selectedPosition)?.type}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Status</td>
                        <td className="py-2 font-medium">
                          {getTyreAtPosition(selectedPosition)?.status}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Condition & Performance</h4>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Tread Depth</td>
                        <td className="py-2 font-medium">
                          {getTyreAtPosition(selectedPosition)?.condition.treadDepth} mm
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Pressure</td>
                        <td className="py-2 font-medium">
                          {getTyreAtPosition(selectedPosition)?.condition.pressure} PSI
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Mileage</td>
                        <td className="py-2 font-medium">
                          {getTyreAtPosition(selectedPosition)?.kmRun.toLocaleString()} km
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Cost/KM</td>
                        <td className="py-2 font-medium">
                          {formatCurrency(calculateCostPerKm(getTyreAtPosition(selectedPosition)!))}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-gray-600">Last Inspection</td>
                        <td className="py-2 font-medium">
                          {getTyreAtPosition(selectedPosition)?.condition.lastInspectionDate}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-lg">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Tyre Mounted</h3>
                <p className="text-gray-500 mb-4">
                  Position {selectedPosition} does not have a tyre mounted.
                </p>
                <Button>Mount Tyre at This Position</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleTyreView;
