import { VehicleSelector } from "../../components/common/VehicleSelector";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { useTyres } from "../../context/TyreContext";
// Local fallback helpers to avoid coupling to data/tyreData
const getTyreConditionColor = (status: string) => {
  switch (status) {
    case "good":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTyreStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "in_service":
      return "bg-green-100 text-green-800";
    case "retreaded":
      return "bg-purple-100 text-purple-800";
    case "scrapped":
      return "bg-gray-300 text-gray-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getVehicleTyreConfiguration = () => ({ positions: [] as any[] });
import { FLEET_VEHICLES } from "../../types/vehicles.js";
import type { FleetTyreMapping, TyreAllocation } from "../../types/tyre";
import { CircleDot, Eye, Wrench } from "lucide-react";
import React, { useEffect, useState } from "react";

interface VehicleTyreViewProps {
  selectedVehicle: string;
  onVehicleSelect: (vehicleId: string) => void;
}

export const VehicleTyreView: React.FC<VehicleTyreViewProps> = ({
  selectedVehicle,
  onVehicleSelect,
}) => {
  const [selectedTyre, setSelectedTyre] = useState<any>(null);
  const [vehicleTyres, setVehicleTyres] = useState<any[]>([]);

  // Use our hooks to get tyre data
  const { tyres } = useTyres();

  // Get vehicle tyres based on selected vehicle
  const vehicle = FLEET_VEHICLES.find((v) => v.fleetNo === selectedVehicle);

  // Filter tyres for this vehicle when selectedVehicle or tyres change
  useEffect(() => {
    if (selectedVehicle && tyres) {
      // Filter tyres for the selected vehicle
      const filteredTyres = tyres.filter((t: any) => t.installation?.vehicleId === selectedVehicle);
      setVehicleTyres(filteredTyres);
    } else {
      setVehicleTyres([]);
    }
  }, [selectedVehicle, tyres]);

  // Get the tyre configuration
  const rawConfig = getVehicleTyreConfiguration();
  const tyreConfig: FleetTyreMapping | null = rawConfig
    ? {
        fleetNumber: selectedVehicle,
        vehicleType: vehicle?.type || "unknown",
        positions: (rawConfig.positions).map((p) => ({
          position: p.id || p.position || "SP",
          // additional fields left undefined
        })),
      }
    : null;

  // const getTyreAtPosition = (position: string) => {
  //   return getTyreByPosition(selectedVehicle, position);
  // };

  const getVehicleTypeLabel = (type: string) => {
    switch (type) {
      case "horse":
        return "Horse (Truck Tractor)";
      case "interlink":
        return "Interlink";
      case "reefer":
        return "Reefer";
      case "lmv":
        return "LMV";
      case "special":
        return "Special Configuration";
      default:
        return "Unknown Type";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <VehicleSelector
            value={selectedVehicle}
            onChange={onVehicleSelect}
            label="Select Vehicle for Tyre View"
            placeholder="Choose a vehicle to view tyre details..."
            activeOnly={false}
            showDetails
          />
        </div>
      </div>

      {selectedVehicle && tyreConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Vehicle Diagram */}
          <Card>
            <CardHeader title="Tyre Layout" />
            <CardContent>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Position</th>
                    <th className="px-2 py-1">Tyre Code</th>
                    <th className="px-2 py-1">Brand</th>
                    <th className="px-2 py-1">Pattern</th>
                    <th className="px-2 py-1">Size</th>
                    <th className="px-2 py-1">Tread (mm)</th>
                    <th className="px-2 py-1">Odometer (km)</th>
                  </tr>
                </thead>
                <tbody>
                  {tyreConfig.positions.map((pos: TyreAllocation) => (
                    <tr key={pos.position} className="border-t">
                      <td className="px-2 py-1">{pos.position}</td>
                      <td className="px-2 py-1">{pos.tyreCode || "Empty"}</td>
                      <td className="px-2 py-1">{pos.brand || "-"}</td>
                      <td className="px-2 py-1">{pos.pattern || "-"}</td>
                      <td className="px-2 py-1">{pos.size || "-"}</td>
                      <td className="px-2 py-1">{pos.treadDepth ?? "-"}</td>
                      <td className="px-2 py-1">{pos.odometerAtFitment ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Tyre Details Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTyre
                  ? `Tyre Details - ${selectedTyre.installation?.position || "Unknown Position"}`
                  : "Tyre Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTyre ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedTyre.brand || "Unknown"} {selectedTyre.model || ""}
                      </h3>
                      <p className="text-gray-600">{selectedTyre.pattern || "Unknown"} Pattern</p>
                    </div>
                    <Badge
                      className={getTyreConditionColor(selectedTyre.condition?.status || "unknown")}
                    >
                      {(selectedTyre.condition?.status || "Unknown")
                        .toString()
                        .replace("_", " ")
                        .toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Specifications</h4>
                      <div className="space-y-1">
                        <p>
                          <span className="text-gray-500">Size:</span>{" "}
                          {selectedTyre.size?.width || "N/A"}/
                          {selectedTyre.size?.aspectRatio || "N/A"}R
                          {selectedTyre.size?.rimDiameter || "N/A"}
                        </p>
                        <p>
                          <span className="text-gray-500">Load Index:</span>{" "}
                          {selectedTyre.loadIndex || "N/A"}
                        </p>
                        <p>
                          <span className="text-gray-500">Speed Rating:</span>{" "}
                          {selectedTyre.speedRating || "N/A"}
                        </p>
                        <p>
                          <span className="text-gray-500">Type:</span> {selectedTyre.type || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Current Condition</h4>
                      <div className="space-y-1">
                        <p>
                          <span className="text-gray-500">Tread Depth:</span>{" "}
                          {selectedTyre.condition?.treadDepth || 0}mm
                        </p>
                        <p>
                          <span className="text-gray-500">Pressure:</span>{" "}
                          {selectedTyre.condition?.pressure || 0} PSI
                        </p>
                        <p>
                          <span className="text-gray-500">Temperature:</span>{" "}
                          {selectedTyre.condition?.temperature || "N/A"}°C
                        </p>
                        <p>
                          <span className="text-gray-500">Last Inspection:</span>{" "}
                          {selectedTyre.condition?.lastInspectionDate || "Never"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Installation Details</h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-gray-500">Installed:</span>{" "}
                        {selectedTyre.installation?.installationDate || "Unknown"}
                      </p>
                      <p>
                        <span className="text-gray-500">Mileage at Install:</span>{" "}
                        {(selectedTyre.installation?.mileageAtInstallation || 0).toLocaleString()}{" "}
                        km
                      </p>
                      <p>
                        <span className="text-gray-500">Distance Run:</span>{" "}
                        {(
                          selectedTyre.kmRun ??
                          (selectedTyre).milesRun ??
                          0
                        ).toLocaleString()}{" "}
                        km
                      </p>
                      <p>
                        <span className="text-gray-500">Serial Number:</span>{" "}
                        {selectedTyre.serialNumber || "N/A"}
                      </p>
                      <p>
                        <span className="text-gray-500">DOT Code:</span>{" "}
                        {selectedTyre.dotCode || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Purchase Information</h4>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-gray-500">Cost:</span> R
                        {(selectedTyre.purchaseDetails?.cost || 0).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-gray-500">Supplier:</span>{" "}
                        {selectedTyre.purchaseDetails?.supplier || "Unknown"}
                      </p>
                      <p>
                        <span className="text-gray-500">Purchase Date:</span>{" "}
                        {selectedTyre.purchaseDetails?.date || "Unknown"}
                      </p>
                      <p>
                        <span className="text-gray-500">Warranty:</span>{" "}
                        {selectedTyre.purchaseDetails?.warranty || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Inspect
                    </Button>
                    <Button size="sm" variant="outline">
                      <Wrench className="w-4 h-4 mr-1" />
                      Service
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CircleDot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Click on a tyre position above to view details</p>
                  {tyreConfig && (
                    <div className="mt-4 text-sm">
                      <p>
                        <strong>{getVehicleTypeLabel(tyreConfig.vehicleType)}</strong>
                      </p>
                      <p>{tyreConfig.positions.length} tyre positions</p>
                      <p>
                        {tyreConfig.positions.filter((p) => p.position === "SP").length} spare
                        tyre(s)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedVehicle && tyreConfig && (
        <Card>
          <CardHeader>
            <CardTitle>All Tyres for {vehicle?.fleetNo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicleTyres.map((tyre) => (
                <div
                  key={tyre.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTyre(tyre)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">
                        {tyre.brand || "Unknown"} {tyre.model || ""}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Position: {tyre.installation?.position || "Unknown"} | Pattern:{" "}
                        {tyre.pattern || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tread: {tyre.condition?.treadDepth || 0}mm | Pressure:{" "}
                        {tyre.condition?.pressure || 0} PSI | Distance:{" "}
                        {(tyre.kmRun ?? (tyre).milesRun ?? 0).toLocaleString()} km
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getTyreConditionColor(tyre.condition?.status || "unknown")}>
                        {(tyre.condition?.status || "Unknown")
                          .toString()
                          .replace("_", " ")
                          .toUpperCase()}
                      </Badge>
                      <Badge className={getTyreStatusColor(tyre.status || "unknown")}>
                        {(tyre.status || "Unknown").toString().replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {vehicleTyres.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No tyre data available for this vehicle
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleTyreView;
