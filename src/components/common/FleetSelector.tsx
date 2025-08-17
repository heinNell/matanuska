import React, { useEffect, useState } from 'react';
import { useFleetList, FleetOption } from '../../hooks/useFleetList';

interface FleetSelectorProps {
  value: string;
  onChange: (fleetNo: string) => void;
  onBlur?: () => void;
  filterType?: 'Truck' | 'Trailer' | 'Reefer' | string[];
  className?: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
  error?: string;
  includeDetails?: boolean;
  onlyActive?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
  showRegistration?: boolean;
  autoFocus?: boolean;
}

/**
 * A standardized fleet selector component that can be used across all forms in the application.
 * This component uses the useFleetList hook to provide consistent fleet data.
 */
const FleetSelector: React.FC<FleetSelectorProps> = ({
  value,
  onChange,
  onBlur,
  filterType,
  className = 'w-full px-4 py-2 border border-gray-300 rounded-md',
  placeholder = 'Select a vehicle',
  required = false,
  label,
  error,
  includeDetails = false,
  onlyActive = true,
  name = 'fleetNo',
  id,
  disabled = false,
  showRegistration = true,
  autoFocus = false,
}) => {
  const { fleetOptions, isValidFleetNumber } = useFleetList({ 
    filterType, 
    includeDetails,
    onlyActive
  });
  
  const [inputValue, setInputValue] = useState(value);
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Handle validation
  useEffect(() => {
    if (touched && required && !inputValue) {
      setValidationError('Please select a fleet number');
    } else if (touched && inputValue && !isValidFleetNumber(inputValue)) {
      setValidationError('Invalid fleet number');
    } else {
      setValidationError(null);
    }
  }, [inputValue, touched, required, isValidFleetNumber]);
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };
  
  const handleBlur = () => {
    setTouched(true);
    if (onBlur) onBlur();
  };
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <select
        id={id || name}
        name={name}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${className} ${(error || validationError) ? 'border-red-500' : ''}`}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
      >
        <option value="">{placeholder}</option>
        {fleetOptions.map((option: FleetOption) => (
          <option key={option.value} value={option.value}>
            {option.value}{showRegistration ? ` - ${option.registration}` : ''} ({option.type})
          </option>
        ))}
      </select>
      
      {(error || validationError) && (
        <p className="mt-1 text-sm text-red-500">{error || validationError}</p>
      )}
    </div>
  );
};

export default FleetSelector;
