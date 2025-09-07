import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useTyres } from '../../context/TyreContext';
import { Tyre, calculateRemainingLife, calculateCostPerKm } from '../../types/tyre';
import { BarChart3, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import LoadingIndicator from '../ui/LoadingIndicator';
import ErrorMessage from '../ui/ErrorMessage';

// Simple mock analytics components - would be replaced with actual chart components in production
const BrandDistributionChart = ({ tyres }: { tyres: Tyre[] }) => {
  // Count tyres by brand
  const brandCount: Record<string, number> = {};
  tyres.forEach(tyre => {
    brandCount[tyre.brand] = (brandCount[tyre.brand] || 0) + 1;
  });

  return (
    <div className="p-4">
      <h4 className="text-sm font-semibold mb-3">Brand Distribution</h4>
      {Object.entries(brandCount).map(([brand, count]) => (
        <div key={brand} className="mb-2">
          <div className="flex justify-between mb-1">
            <span>{brand}</span>
            <span>{count} tyres</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{width: `${(count / tyres.length) * 100}%`}}
             />
          </div>
        </div>
      ))}
    </div>
  );
};

const TreadWearChart = ({ tyres }: { tyres: Tyre[] }) => {
  // Group by wear levels
  const wearLevels = {
    'New (8mm+)': 0,
    'Good (5-8mm)': 0,
    'Fair (3-5mm)': 0,
    'Poor (<3mm)': 0
  };

  tyres.forEach(tyre => {
    const depth = tyre.condition.treadDepth;
    if (depth >= 8) wearLevels['New (8mm+)']++;
    else if (depth >= 5) wearLevels['Good (5-8mm)']++;
    else if (depth >= 3) wearLevels['Fair (3-5mm)']++;
    else wearLevels['Poor (<3mm)']++;
  });

  return (
    <div className="p-4">
      <h4 className="text-sm font-semibold mb-3">Tread Wear Distribution</h4>
      {Object.entries(wearLevels).map(([level, count]) => (
        <div key={level} className="mb-2">
          <div className="flex justify-between mb-1">
            <span>{level}</span>
            <span>{count} tyres</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className={`h-2 rounded-full ${
                level === 'New (8mm+)' ? 'bg-green-500' :
                level === 'Good (5-8mm)' ? 'bg-blue-500' :
                level === 'Fair (3-5mm)' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{width: `${tyres.length ? (count / tyres.length) * 100 : 0}%`}}
             />
          </div>
        </div>
      ))}
    </div>
  );
};

const TyreAnalytics: React.FC = () => {
  const { tyres, loading, error } = useTyres();
  const [topBrands, setTopBrands] = useState<{brand: string, count: number}[]>([]);
  const [avgCostPerKm, setAvgCostPerKm] = useState<number>(0);
  const [totalTyreCost, setTotalTyreCost] = useState<number>(0);
  const [avgTyreLife, setAvgTyreLife] = useState<number>(0);

  // Calculate analytics data
  useEffect(() => {
    if (tyres.length > 0) {
      // Top brands
      const brandCount: Record<string, number> = {};
      tyres.forEach(tyre => {
        brandCount[tyre.brand] = (brandCount[tyre.brand] || 0) + 1;
      });

      const sortedBrands = Object.entries(brandCount)
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopBrands(sortedBrands);

      // Cost calculations
      let totalCost = 0;
      let validCostPerKmCount = 0;
      let totalCostPerKm = 0;

      tyres.forEach(tyre => {
        totalCost += tyre.purchaseDetails?.cost || 0;

        const costPerKm = calculateCostPerKm(tyre);
        if (costPerKm && costPerKm > 0) {
          totalCostPerKm += costPerKm;
          validCostPerKmCount++;
        }
      });

      setTotalTyreCost(totalCost);
      setAvgCostPerKm(validCostPerKmCount > 0 ? totalCostPerKm / validCostPerKmCount : 0);

      // Tyre life calculation
      let totalLife = 0;
      let validLifeCount = 0;

      tyres.forEach(tyre => {
        const remainingLife = calculateRemainingLife(tyre);
        if (remainingLife > 0) {
          totalLife += remainingLife;
          validLifeCount++;
        }
      });

      setAvgTyreLife(validLifeCount > 0 ? totalLife / validLifeCount : 0);
    }
  }, [tyres]);

  if (loading) {
    return <LoadingIndicator text="Loading tyre analytics..." />;
  }

  if (error) {
    return <ErrorMessage message={`Error loading analytics: ${error.message}`} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Tyre Performance Analytics</h3>
        <p className="text-gray-600">Comprehensive analysis of tyre performance and costs</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Cost per KM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
              <div className="text-2xl font-bold">R {avgCostPerKm.toFixed(2)}</div>
            </div>
            <p className="text-xs text-muted-foreground">Fleet average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Tyre Life</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <TrendingUp className="w-4 h-4 text-gray-500 mr-1" />
              <div className="text-2xl font-bold">{Math.round(avgTyreLife).toLocaleString()} km</div>
            </div>
            <p className="text-xs text-muted-foreground">Expected lifespan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
              <div className="text-2xl font-bold">R {totalTyreCost.toLocaleString()}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total tyre inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Brand Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BrandDistributionChart tyres={tyres} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Tread Wear Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TreadWearChart tyres={tyres} />
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Brands */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topBrands.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-2">Brand</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Avg. Cost/KM</th>
                    <th className="pb-2">Avg. Lifespan</th>
                  </tr>
                </thead>
                <tbody>
                  {topBrands.map(({ brand, count }) => {
                    // Calculate brand-specific metrics
                    const brandTyres = tyres.filter(t => t.brand === brand);
                    const brandAvgCostPerKm = brandTyres.reduce((sum, t) => {
                      const cost = calculateCostPerKm(t) || 0;
                      return sum + cost;
                    }, 0) / (brandTyres.length || 1);

                    const brandAvgLife = brandTyres.reduce((sum, t) => {
                      const life = calculateRemainingLife(t);
                      return sum + life;
                    }, 0) / (brandTyres.length || 1);

                    return (
                      <tr key={brand} className="border-t">
                        <td className="py-3 font-medium">{brand}</td>
                        <td className="py-3">{count} tyres</td>
                        <td className="py-3">R {brandAvgCostPerKm.toFixed(2)}</td>
                        <td className="py-3">{Math.round(brandAvgLife).toLocaleString()} km</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-4 text-gray-500">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TyreAnalytics;
