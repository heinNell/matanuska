import { useFleetList, FleetOption } from '@/hooks/useFleetList';
import React from 'react';

export interface VehicleSelectorProps {
  value: string;
  onChange: (vehicleId: string) => void;
  label: string;
  placeholder?: string;
  activeOnly?: boolean;
  showDetails?: boolean;
  filterType?: 'Truck' | 'Trailer' | 'Reefer' | string[];
  required?: boolean;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select a vehicle...",
  activeOnly = false,
  showDetails = false,
  filterType,
  required = false,
  className = "",
  disabled = false,
  error
}) => {
  const { fleetOptions } = useFleetList({ 
    onlyActive: activeOnly,
    filterType,
    includeDetails: showDetails
  });

  // Helper to render vehicle details if needed
  const renderVehicleDetails = () => {
    if (!showDetails || !value) return null;
    
    const vehicle = fleetOptions.find((f: FleetOption) => f.value === value);
    if (!vehicle) return null;
    
    return (
      <div className="mt-1 text-xs text-gray-500">
        <p>Registration: {vehicle.registration}</p>
        <p>Type: {vehicle.type}</p>
        {vehicle.details && (
          <>
            <p>Make: {vehicle.details.manufacturer} {vehicle.details.model}</p>
            {vehicle.details.mileage && (
              <p>Odometer: {vehicle.details.mileage.toLocaleString()} km</p>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        disabled={disabled}
        required={required}
      >
        <option value="">{placeholder}</option>
        {fleetOptions.map((option: FleetOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {renderVehicleDetails()}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
