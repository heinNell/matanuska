import { Button } from "@/components/ui/Button";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
// Remove Label import as we'll use a simple label element
import { ArrowRightLeft } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { useTyres } from "../../context/TyreContext";
import { TyreStoreLocation } from "../../types/tyre";

interface StoreStats {
  count: number;
  value: number;
}

const TyreStores: React.FC = () => {
  const { tyres, loading, error } = useTyres();
  const [selectedStore, setSelectedStore] = useState<TyreStoreLocation>(
    TyreStoreLocation.VICHELS_STORE
  );
  const [selectedTyre, setSelectedTyre] = useState<string>("");
  const [moveToStore, setMoveToStore] = useState<TyreStoreLocation>(TyreStoreLocation.HOLDING_BAY);
  const [moveNote, setMoveNote] = useState<string>("");
  const [isMoving, setIsMoving] = useState(false);

  // Filter tyres by the selected store
  const storeTyres = tyres.filter((tyre) => tyre.location === selectedStore);

  // Calculate statistics for each store
  const storeStats = Object.values(TyreStoreLocation).reduce<Record<string, StoreStats>>(
    (acc, location) => {
      const locationTyres = tyres.filter((tyre) => tyre.location === location);

      const count = locationTyres.length;
      const value = locationTyres.reduce((sum, tyre) => sum + (tyre.purchaseDetails?.cost || 0), 0);

      acc[location] = { count, value };
      return acc;
    },
    {}
  );

  // Handle moving a tyre between stores
  const handleMoveTyre = () => {
    if (!selectedTyre || !moveToStore) return;

    setIsMoving(true);

    // Implementation would call a function from TyreContext to update the tyre's location
    setTimeout(() => {
      alert(`Tyre would be moved from ${selectedStore} to ${moveToStore}`);
      setIsMoving(false);
      setSelectedTyre("");
      setMoveNote("");
    }, 1000);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading tyre store data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">Error loading tyre data: {error.message}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Tyre Store Management</h3>
        <p className="text-gray-600">Manage tyre inventory across different store locations</p>
      </div>

      {/* Store Location Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(storeStats).map(([location, stats]: [string, StoreStats]) => (
          <div
            key={location}
            className={`cursor-pointer ${selectedStore === location ? "border-blue-500 border-2" : ""}`}
            onClick={() => setSelectedStore(location as TyreStoreLocation)}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{location}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.count} tyres</div>
                <p className="text-xs text-muted-foreground">
                  Total Value: R {stats.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Store Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedStore} Inventory ({storeTyres.length} tyres)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {storeTyres.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No tyres in this store location</p>
            ) : (
              storeTyres.map((tyre) => (
                <div
                  key={tyre.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 ${
                    selectedTyre === tyre.id ? "bg-blue-50 border-blue-300" : ""
                  }`}
                  onClick={() => setSelectedTyre(tyre.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-semibold">
                            {tyre.brand} {tyre.model}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {tyre.pattern} - {tyre.size.width}/{tyre.size.aspectRatio}R
                            {tyre.size.rimDiameter}
                          </p>
                          <p className="text-xs text-gray-500">
                            Serial: {tyre.serialNumber} | DOT: {tyre.dotCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        className={`${
                          tyre.condition.status === "good"
                            ? "bg-green-100 text-green-800"
                            : tyre.condition.status === "warning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {tyre.condition.status}
                      </Badge>
                      <div className="text-sm mt-1">
                        <div>R {tyre.purchaseDetails.cost.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          Tread: {tyre.condition.treadDepth}mm
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Move Tyre Controls */}
      {selectedTyre && (
        <Card>
          <CardHeader>
            <CardTitle>Move Selected Tyre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Current Location</label>
                <div className="mt-1 p-2 border rounded bg-gray-50">{selectedStore}</div>
              </div>

              <div>
                <label className="text-sm font-medium">Move To</label>
                <select
                  value={moveToStore}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setMoveToStore(e.target.value as TyreStoreLocation)
                  }
                  className="mt-1 p-2 border rounded w-full"
                >
                  {Object.values(TyreStoreLocation)
                    .filter((location) => location !== selectedStore)
                    .map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Movement Note</label>
                <Input
                  value={moveNote}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMoveNote(e.target.value)}
                  placeholder="Reason for movement..."
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button onClick={handleMoveTyre} disabled={isMoving || !moveToStore}>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                {isMoving ? "Moving..." : "Move Tyre"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TyreStores;
