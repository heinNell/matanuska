import { AlertCircle, CheckCircle, Circle, MapPin, Search, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import { mappingData, TyreMappingRow } from "../../types/tyreMappingData.js";

interface VehicleView {
  registrationNo: string;
  storeName: string;
  tyres: TyreMappingRow[];
  totalTyres: number;
  activeTyres: number;
  spareTyres: number;
}

const TyreFleetMap: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleView[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "complete" | "incomplete">("all");
  // Removed unused _vehicleTyreStore state (previously held buildVehicleTyreStore result)

  useEffect(() => {
    // Group mapping data by vehicle
    const vehicleGroups = mappingData.reduce(
      (acc, row) => {
        const key = row.RegistrationNo;
        if (!acc[key]) {
          acc[key] = {
            registrationNo: row.RegistrationNo,
            storeName: row.StoreName,
            tyres: [],
            totalTyres: 0,
            activeTyres: 0,
            spareTyres: 0,
          };
        }
        acc[key].tyres.push(row);
        acc[key].totalTyres++;

        if (row.TyrePosDescription === "SP") {
          acc[key].spareTyres++;
        } else if (row.TyreCode && row.TyreCode.trim() !== "") {
          acc[key].activeTyres++;
        }

        return acc;
      },
      {} as Record<string, VehicleView>
    );

    setVehicles(Object.values(vehicleGroups));
  }, []);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      !searchQuery ||
      vehicle.registrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.storeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "complete" &&
        vehicle.activeTyres === vehicle.totalTyres - vehicle.spareTyres) ||
      (filterBy === "incomplete" && vehicle.activeTyres < vehicle.totalTyres - vehicle.spareTyres);

    return matchesSearch && matchesFilter;
  });

  const getPositionIcon = (position: string) => {
    if (position === "SP") return <Circle className="w-3 h-3 text-gray-500" />;
    if (position.startsWith("V")) return <CheckCircle className="w-3 h-3 text-green-500" />;
    if (position.startsWith("T")) return <CheckCircle className="w-3 h-3 text-blue-500" />;
    return <AlertCircle className="w-3 h-3 text-yellow-500" />;
  };

  const getTyreStatus = (tyreCode: string) => {
    if (!tyreCode || tyreCode.trim() === "") return "empty";
    return "mounted";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "mounted":
        return "bg-green-100 text-green-800";
      case "empty":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderVehicleTyreLayout = (vehicle: VehicleView) => {
    const sortedTyres = [...vehicle.tyres].sort((a, b) => {
      // Sort by position: V positions first, then T positions, then SP
      if (a.TyrePosDescription === "SP") return 1;
      if (b.TyrePosDescription === "SP") return -1;
      return a.TyrePosDescription.localeCompare(b.TyrePosDescription);
    });

    return (
      <div className="grid grid-cols-4 gap-2 p-4">
        {sortedTyres.map((tyre, index) => {
          const status = getTyreStatus(tyre.TyreCode);
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                status === "mounted" ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">{tyre.TyrePosDescription}</span>
                {getPositionIcon(tyre.TyrePosDescription)}
              </div>
              <div className="text-xs">
                <div className="font-mono text-gray-800">{tyre.TyreCode || "Empty"}</div>
                <Badge variant="secondary" className={`text-xs mt-1 ${getStatusColor(status)}`}>
                  {status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Tyre Map</h1>
          <p className="text-gray-500">Visual representation of tyre positions across your fleet</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedVehicle(null)}
            disabled={!selectedVehicle}
          >
            Show All Vehicles
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by registration or store name..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterBy === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterBy("all")}
          >
            All Vehicles
          </Button>
          <Button
            variant={filterBy === "complete" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterBy("complete")}
          >
            Complete
          </Button>
          <Button
            variant={filterBy === "incomplete" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterBy("incomplete")}
          >
            Incomplete
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Tyres</p>
                <p className="text-2xl font-bold">
                  {vehicles.reduce((sum, v) => sum + v.totalTyres, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Circle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Mounted Tyres</p>
                <p className="text-2xl font-bold">
                  {vehicles.reduce((sum, v) => sum + v.activeTyres, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Spare Tyres</p>
                <p className="text-2xl font-bold">
                  {vehicles.reduce((sum, v) => sum + v.spareTyres, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Grid */}
      {selectedVehicle ? (
        // Single vehicle detailed view
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                {selectedVehicle}
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(null)}>
                Back to Fleet View
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderVehicleTyreLayout(vehicles.find((v) => v.registrationNo === selectedVehicle)!)}
          </CardContent>
        </Card>
      ) : (
        // Fleet overview
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.registrationNo}
              className="cursor-pointer"
              onClick={() => setSelectedVehicle(vehicle.registrationNo)}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      {vehicle.registrationNo}
                    </div>
                    <Badge variant="secondary">{vehicle.storeName}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">
                      {vehicle.activeTyres}/{vehicle.totalTyres - vehicle.spareTyres} Mounted
                    </span>
                    <span className="text-sm text-gray-600">{vehicle.spareTyres} Spare</span>
                  </div>

                  {/* Mini tyre grid preview */}
                  <div className="grid grid-cols-6 gap-1">
                    {vehicle.tyres.slice(0, 12).map((tyre, index) => (
                      <div
                        key={index}
                        className={`h-6 w-6 rounded border-2 ${
                          getTyreStatus(tyre.TyreCode) === "mounted"
                            ? "bg-green-200 border-green-400"
                            : "bg-red-200 border-red-400"
                        }`}
                        title={`${tyre.TyrePosDescription}: ${tyre.TyreCode || "Empty"}`}
                      />
                    ))}
                    {vehicle.tyres.length > 12 && (
                      <div className="h-6 w-6 rounded border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-xs">
                        +{vehicle.tyres.length - 12}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {filteredVehicles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TyreFleetMap;
