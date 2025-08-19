import type { Tyre } from "../../types/tyre";
import { TYRE_BRANDS, TYRE_PATTERNS, tyreSizes as TYRE_SIZES } from "../../data/tyreData";
import { getBestTyres, getTyrePerformanceStats, RankedTyre } from "../../utils/tyreAnalytics";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { TyreReportGenerator } from "./TyreReportGenerator";

export const TyreReports: React.FC = () => {
  const [tyreData, setTyreData] = useState<Tyre[]>([]);
  const [bestTyres, setBestTyres] = useState<RankedTyre[]>([]);
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [filterBrand, setFilterBrand] = useState<string>("");
  const [filterPattern, setFilterPattern] = useState<string>("");
  const [filterSize, setFilterSize] = useState<string>("");

  useEffect(() => {
    const db = getFirestore();
    const tyresCollection = collection(db, "tyres");

    const unsubscribe = onSnapshot(tyresCollection, (snapshot) => {
      const tyres = snapshot.docs.map((doc) => ({
        id: doc.id,
        tyreId: doc.data().tyreId || "Unknown",
        serialNumber: doc.data().serialNumber || "Unknown",
        dotCode: doc.data().dotCode || "Unknown",
        manufacturingDate: doc.data().manufacturingDate || "Unknown",
        brand: doc.data().brand || "Unknown",
        model: doc.data().model || "Unknown",
        size: doc.data().size || { width: 0, aspectRatio: 0, rimDiameter: 0 },
        pattern: doc.data().pattern || "Unknown",
        loadIndex: doc.data().loadIndex || 0,
        speedRating: doc.data().speedRating || "Unknown",
        type: doc.data().type || "Unknown",
        purchaseDetails: doc.data().purchaseDetails || {
          date: "Unknown",
          cost: 0,
          supplier: "Unknown",
          warranty: "Unknown",
        },
        installation: doc.data().installation || {
          vehicleId: "Unknown",
          position: "Unknown",
          mileageAtInstallation: 0,
          installationDate: "Unknown",
          installedBy: "Unknown",
        },
        condition: doc.data().condition || {
          treadDepth: 0,
          pressure: 0,
          temperature: 0,
          status: "good",
          lastInspectionDate: "Unknown",
          nextInspectionDue: "Unknown",
        },
        status: doc.data().status || "Unknown",
        mountStatus: doc.data().mountStatus || "Unknown",
        maintenanceHistory: doc.data().maintenanceHistory || [],
        kmRun: doc.data().kmRun || doc.data().kmRun || 0,
        kmRunLimit: doc.data().kmRunLimit || 0,
        notes: doc.data().notes || "None",
        location: doc.data().location || "HOLDING_BAY",
      }));
      setTyreData(tyres);
    });

    return () => unsubscribe();
  }, []);

  // Adjust transformation logic to derive `totalDistance` and `totalCost`
  const transformedTyreData = tyreData.map((tyre) => ({
    brand: tyre.brand,
    model: tyre.model,
    totalDistance: tyre.installation?.mileageAtInstallation || 0, // Derived from installation data
    totalCost: tyre.purchaseDetails.cost || 0, // Derived from purchase details
  }));

  useEffect(() => {
    if (tyreData.length > 0) {
      const best = getBestTyres(transformedTyreData);
      const stats = getTyrePerformanceStats(transformedTyreData);
      setBestTyres(best);
      setPerformanceStats(stats);
    }
  }, [tyreData]);

  const handleGenerateReport = (type: string, dateRange: string, brand: string) => {
    console.log("Generating report:", { type, dateRange, brand });
    alert(`Generating ${type} report for ${dateRange} days`);
  };

  // Note: Performance form component is not present in this version.

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Tyre Reports & Analytics</h3>
        <p className="text-gray-600">Generate comprehensive tyre performance and cost reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Brand Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {TYRE_BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Pattern Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pattern</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filterPattern}
            onChange={(e) => setFilterPattern(e.target.value)}
          >
            <option value="">All Patterns</option>
            {TYRE_PATTERNS.map((pattern) => (
              <option key={pattern} value={pattern}>
                {pattern}
              </option>
            ))}
          </select>
        </div>

        {/* Size Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
          >
            <option value="">All Sizes</option>
            {TYRE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        onClick={() => handleGenerateReport("inventory", "last30", filterBrand || "All Brands")}
      >
        Generate Report
      </button>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">Standard Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <TyreReportGenerator onGenerateReport={handleGenerateReport} />
        </TabsContent>

        <TabsContent value="performance">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Performance Data Entry</h3>
            <p className="text-gray-600 mb-4">
              The TyrePerformanceForm component is not available in this version.
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => alert("Performance form functionality is not available")}
            >
              Simulate Form Submission
            </button>
          </div>
        </TabsContent>
      </Tabs>

      {bestTyres.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Analytics</h3>
          <div>
            <h4 className="font-medium">Top Performing Tyres</h4>
            <ul>
              {bestTyres.map((tyre, index) => (
                <li key={index}>
                  {tyre.brand} {tyre.model} - Rank: {tyre.rank}, Rating: {tyre.performanceRating}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Performance Statistics</h4>
            <pre>{JSON.stringify(performanceStats, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TyreReports;
