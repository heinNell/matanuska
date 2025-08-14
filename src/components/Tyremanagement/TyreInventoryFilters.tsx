import React from 'react';

interface TyreInventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  brandFilter: string;
  setBrandFilter: (value: string) => void;
  brands: string[];
  locationFilter?: string;
  setLocationFilter?: (value: string) => void;
  locations?: string[];
  onSearchChange?: (value: string) => void;
  onBrandChange?: (value: string) => void;
  onLocationChange?: (value: string) => void;
  onAddStock?: () => void;
  // Added filters for status, condition, vehicle
  statusFilter?: string;
  setStatusFilter?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  statuses?: { label: string; value: string }[];
  conditionFilter?: string;
  onConditionChange?: (value: string) => void;
  conditions?: { label: string; value: string }[];
  vehicleFilter?: string;
  onVehicleChange?: (value: string) => void;
  vehicles?: { label: string; value: string }[];
}

export const TyreInventoryFilters: React.FC<TyreInventoryFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  brandFilter,
  setBrandFilter,
  brands,
  locationFilter = '',
  setLocationFilter = () => {},
  locations = [],
  onSearchChange = setSearchTerm,
  onBrandChange = setBrandFilter,
  onLocationChange = setLocationFilter,
  statusFilter,
  onStatusChange,
  statuses = [],
  conditionFilter,
  onConditionChange,
  conditions = [],
  vehicleFilter,
  onVehicleChange,
  vehicles = [],
  onAddStock
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search field */}
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search by brand, model or size..."
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Add button */}
        {onAddStock && (
          <button
            onClick={onAddStock}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Tyre
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Brand filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <select
            value={brandFilter}
            onChange={(e) => onBrandChange && onBrandChange(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Location filter */}
        {locations.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => onLocationChange && onLocationChange(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        )}

        {/* Status filter */}
        {statuses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        )}

        {/* Condition filter */}
        {conditions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              value={conditionFilter}
              onChange={(e) => onConditionChange && onConditionChange(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">All Conditions</option>
              {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        )}

        {/* Vehicle filter */}
        {vehicles.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select
              value={vehicleFilter}
              onChange={(e) => onVehicleChange && onVehicleChange(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">All Vehicles</option>
              {vehicles.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default TyreInventoryFilters;
