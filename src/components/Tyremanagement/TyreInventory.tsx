import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { TyreInventoryStats } from './TyreInventoryStats';
import { TyreInventoryFilters } from './TyreInventoryFilters';
import { useTyres } from '../../context/TyreContext';
import { Tyre, TyreStoreLocation, calculateRemainingLife, calculateCostPerKm } from '../../types/tyre';
import LoadingIndicator from '../ui/LoadingIndicator';
import ErrorMessage from '../ui/ErrorMessage';

interface TyreStock {
  id: string;
  brand: string;
  model: string;
  pattern: string;
  size: string;
  quantity: number;
  minStock: number;
  cost: number;
  supplier: string;
  location: string;
}

export const TyreInventory: React.FC = () => {
  const { tyres, loading, error } = useTyres();
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Convert Tyre array to TyreStock format for compatibility with existing components
  const convertToTyreStock = (tyres: Tyre[]): TyreStock[] => {
    // Group tyres by brand, model, pattern, and size
    const groupedTyres: Record<string, Tyre[]> = {};
    
    tyres.forEach(tyre => {
      // Create a unique key for grouping
      const key = `${tyre.brand}-${tyre.model}-${tyre.pattern}-${formatTyreSize(tyre.size)}`;
      
      if (!groupedTyres[key]) {
        groupedTyres[key] = [];
      }
      
      groupedTyres[key].push(tyre);
    });
    
    // Convert grouped tyres to TyreStock
    return Object.entries(groupedTyres).map(([key, tyreGroup]) => {
      const firstTyre = tyreGroup[0];
      
      return {
        id: key,
        brand: firstTyre.brand,
        model: firstTyre.model,
        pattern: firstTyre.pattern,
        size: formatTyreSize(firstTyre.size),
        quantity: tyreGroup.length,
        minStock: 5, // Default minimum stock level
        cost: firstTyre.purchaseDetails.cost,
        supplier: firstTyre.purchaseDetails.supplier,
        location: firstTyre.location
      };
    });
  };
  
  const formatTyreSize = (size: any): string => {
    if (typeof size === 'string') return size;
    return `${size.width}/${size.aspectRatio}R${size.rimDiameter}`;
  };

  const inventory = convertToTyreStock(tyres);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.size.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !brandFilter || item.brand === brandFilter;
    const matchesLocation = !locationFilter || item.location === locationFilter;
    return matchesSearch && matchesBrand && matchesLocation;
  });

  const getStockStatus = (item: TyreStock) => {
    if (item.quantity <= item.minStock) return 'low';
    if (item.quantity <= item.minStock * 1.5) return 'warning';
    return 'good';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Extract unique locations and brands for filter options
  const locations = [...new Set(inventory.map(item => item.location))];
  const brands = [...new Set(inventory.map(item => item.brand))];
  
  if (loading) {
    return <LoadingIndicator text="Loading tyre inventory..." />;
  }
  
  if (error) {
    return <ErrorMessage message={`Error loading tyre inventory: ${error.message}`} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Tyre Inventory Management</h3>
        <p className="text-gray-600">Track tyre stock levels, costs, and suppliers</p>
      </div>

      <TyreInventoryStats inventory={inventory} />

      <Card>
        <CardContent className="p-4">
          <TyreInventoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            brandFilter={brandFilter}
            setBrandFilter={setBrandFilter}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onAddStock={() => console.log('Add stock clicked')}
            brands={brands}
            locations={locations}
            onSearchChange={setSearchTerm}
            onBrandChange={setBrandFilter}
            onLocationChange={setLocationFilter}
            onStatusChange={setStatusFilter}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredInventory.map(item => {
              const status = getStockStatus(item);
              return (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-semibold">{item.brand} {item.model}</h4>
                          <p className="text-sm text-gray-600">{item.pattern} - {item.size}</p>
                          <p className="text-xs text-gray-500">
                            Supplier: {item.supplier} | Location: {item.location}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <Badge className={getStockStatusColor(status)}>
                        {item.quantity} in stock
                      </Badge>
                      <div className="text-sm">
                        <div>R {item.cost} each</div>
                        <div className="text-xs text-gray-500">
                          Min: {item.minStock} | Value: R {(item.quantity * item.cost).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {status === 'low' && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Stock level is below minimum threshold
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};