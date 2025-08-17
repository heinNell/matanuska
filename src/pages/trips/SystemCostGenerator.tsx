import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import React, { useEffect, useState } from "react";
import { defaultTripWorkflowConfig } from "../../config/tripWorkflowConfig";

interface Trip {
  id: string;
  distance: number; // in km
  duration: number; // in hours
  vehicleType: string;
  driverId: string;
  route: string;
}

interface SystemCost {
  id: string;
  type: "repair" | "tyre" | "git" | "fuel" | "driver";
  description: string;
  amount: number;
  calculation: string;
  isSystemGenerated: true;
}

interface SystemCostGeneratorProps {
  trip: Trip;
  rates?: typeof defaultTripWorkflowConfig.systemRates;
  onGenerate: (costs: SystemCost[]) => void;
}

const SystemCostGenerator: React.FC<SystemCostGeneratorProps> = ({
  trip,
  rates = defaultTripWorkflowConfig.systemRates,
  onGenerate,
}) => {
  const [generatedCosts, setGeneratedCosts] = useState<SystemCost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSystemCosts = async () => {
    setIsGenerating(true);

    // Simulate API call or complex calculation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const costs: SystemCost[] = [];

    // Repair costs (per km)
    const repairCost = trip.distance * rates.perKmRepair;
    costs.push({
      id: "repair-" + Date.now(),
      type: "repair",
      description: "Vehicle repair allocation",
      amount: repairCost,
      calculation: `${trip.distance}km × R${rates.perKmRepair}/km = R${repairCost.toFixed(2)}`,
      isSystemGenerated: true,
    });

    // Tyre costs (per km)
    const tyreCost = trip.distance * rates.perKmTyre;
    costs.push({
      id: "tyre-" + Date.now(),
      type: "tyre",
      description: "Tyre wear allocation",
      amount: tyreCost,
      calculation: `${trip.distance}km × R${rates.perKmTyre}/km = R${tyreCost.toFixed(2)}`,
      isSystemGenerated: true,
    });

    // GIT (General Insurance and Tax) - per day
    const days = Math.ceil(trip.duration / 24);
    const gitCost = days * rates.perDayGIT;
    costs.push({
      id: "git-" + Date.now(),
      type: "git",
      description: "General Insurance & Tax",
      amount: gitCost,
      calculation: `${days} day(s) × R${rates.perDayGIT}/day = R${gitCost.toFixed(2)}`,
      isSystemGenerated: true,
    });

    // Estimated fuel cost (basic calculation)
    const estimatedFuelConsumption = trip.distance * 0.35; // 35L/100km average
    const fuelCost = estimatedFuelConsumption * rates.fuelRate;
    costs.push({
      id: "fuel-" + Date.now(),
      type: "fuel",
      description: "Estimated fuel cost",
      amount: fuelCost,
      calculation: `${trip.distance}km × 35L/100km × R${rates.fuelRate}/L = R${fuelCost.toFixed(2)}`,
      isSystemGenerated: true,
    });

    // Driver cost
    const driverCost = days * rates.driverRate;
    costs.push({
      id: "driver-" + Date.now(),
      type: "driver",
      description: "Driver compensation",
      amount: driverCost,
      calculation: `${days} day(s) × R${rates.driverRate}/day = R${driverCost.toFixed(2)}`,
      isSystemGenerated: true,
    });

    setGeneratedCosts(costs);
    setIsGenerating(false);
  };

  useEffect(() => {
    generateSystemCosts();
  }, [trip.distance, trip.duration]);

  const totalSystemCosts = generatedCosts.reduce((sum, cost) => sum + cost.amount, 0);

  const handleAcceptCosts = () => {
    onGenerate(generatedCosts);
  };

  const handleRegenerateCosts = () => {
    generateSystemCosts();
  };

  if (isGenerating) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generating system costs...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">System Generated Costs</h3>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Trip Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Distance: {trip.distance} km</div>
            <div>Duration: {trip.duration} hours</div>
            <div>Route: {trip.route}</div>
            <div>Vehicle: {trip.vehicleType}</div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {generatedCosts.map((cost) => (
            <div key={cost.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-medium">{cost.description}</h5>
                  <p className="text-sm text-gray-600">{cost.calculation}</p>
                </div>
                <span className="text-lg font-semibold text-green-600">
                  R{cost.amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total System Costs:</span>
            <span className="text-xl font-bold text-green-600">R{totalSystemCosts.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handleRegenerateCosts}>
              Regenerate
            </Button>
            <Button onClick={handleAcceptCosts}>Accept & Continue</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemCostGenerator;
