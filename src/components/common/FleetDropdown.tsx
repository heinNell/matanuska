import React from "react";
import { useFleetList } from '../../hooks/useFleetList';
import { Truck } from 'lucide-react';

interface FleetDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  activeOnly?: boolean;
  filterType?: 'Truck' | 'Trailer' | 'Reefer' | string[];
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export const FleetDropdown: React.FC<FleetDropdownProps> = ({
  value,
  onChange,
  label = 'Fleet Number',
  placeholder = 'Select fleet...',
  activeOnly = false,
  filterType,
  disabled = false,
  required = false,
  error,
  className = ''
}) => {
  // Get fleet data from our centralized hook
  const { fleetOptions } = useFleetList({
    onlyActive: activeOnly,
    filterType,
    includeDetails: false
  });

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <Truck className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 pr-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          disabled={disabled}
          required={required}
        >
          <option value="">{placeholder}</option>
          {fleetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FleetDropdown;
