import React, { useState, useEffect } from 'react';
// Removed the import for useWialonUnits as it's no longer used here
import { ExtendedWialonUnit } from '../hooks/useWialon'; // Import ExtendedWialonUnit from the new hook

interface WialonUnitsListProps {
  /** The list of Wialon units to display */
  units: ExtendedWialonUnit[] | null;
  /** Loading state from the Wialon hook */
  loading: boolean;
  /** Error state from the Wialon hook */
  error: Error | null;
  /** Optional filter for units by name */
  nameFilter?: string;
  /** Optional filter for units by type/class */
  typeFilter?: string;
  /** Optional max units to display */
  limit?: number;
  /** Callback when a unit is selected */
  onSelectUnit?: (unitId: number, unitInfo: ExtendedWialonUnit) => void;
}

/**
 * WialonUnitsList Component
 *
 * Displays a list of Wialon units with filtering and sorting options.
 * It receives unit data, loading, and error states as props.
 */
const WialonUnitsList: React.FC<WialonUnitsListProps> = ({
  nameFilter = '',
  typeFilter = '',
  limit,
  onSelectUnit,
  units, // Now a prop
  loading, // Now a prop
  error // Now a prop
}) => {
  const [searchQuery, setSearchQuery] = useState(nameFilter);
  const [selectedType, setSelectedType] = useState(typeFilter);
  const [filteredUnits, setFilteredUnits] = useState<ExtendedWialonUnit[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'name',
    direction: 'ascending'
  });

  // Effect to filter and sort units whenever the 'units' prop, filters, or sort config change
  useEffect(() => {
    if (!units) {
      setFilteredUnits([]); // Clear units if not available
      return;
    }

    let currentFiltered = [...units]; // Start with the units received as props

    // Apply name search filter
    if (searchQuery) {
      currentFiltered = currentFiltered.filter(unit =>
        unit.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedType) {
      currentFiltered = currentFiltered.filter(unit =>
        // Check for both cls_id (number) and type (string) for filtering
        (unit.cls_id && String(unit.cls_id) === selectedType) ||
        (unit.type && unit.type.toLowerCase() === selectedType.toLowerCase())
      );
    }

    // Apply sorting
    currentFiltered.sort((a, b) => {
      // Safely access properties for sorting, handling potential undefined values
      const valueA = a[sortConfig.key] !== undefined ? a[sortConfig.key] : '';
      const valueB = b[sortConfig.key] !== undefined ? b[sortConfig.key] : '';

      // Handle numerical sorting specifically for 'last_message'
      if (sortConfig.key === 'last_message') {
        const numA = typeof valueA === 'number' ? valueA : -Infinity;
        const numB = typeof valueB === 'number' ? valueB : -Infinity;
        if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
      } else {
        // Default string comparison for other keys
        if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    // Apply limit if specified
    if (limit && limit > 0) {
      currentFiltered = currentFiltered.slice(0, limit);
    }

    setFilteredUnits(currentFiltered);
  }, [units, searchQuery, selectedType, sortConfig, limit]); // Re-run when these dependencies change

  // Get unique unit types for the filter dropdown
  const unitTypes = units ?
    Array.from(new Set(units.map(unit => unit.cls_id ? `Class ${unit.cls_id}` : unit.type)))
      .filter(Boolean) // Remove any null or undefined types
      .map(type => ({
        id: String(type), // Use the string representation as the option value
        name: type as string // Display name
      })) : [];

  // Display loading, error, or no units messages
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse text-gray-600">Loading Wialon units...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p className="font-medium">Error loading units</p>
        <p className="text-sm mt-1">{String(error)}</p>
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        No units available. Please ensure Wialon is initialized and you have access to units.
      </div>
    );
  }

  return (
    <div className="wialon-units-list p-2">
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="unit-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Units
          </label>
          <input
            id="unit-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="sm:w-1/3">
          <label htmlFor="unit-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Type
          </label>
          <select
            id="unit-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">All Types</option>
            {unitTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => setSortConfig(prevConfig => ({
                  key: 'name',
                  direction:
                    prevConfig.key === 'name' && prevConfig.direction === 'ascending'
                      ? 'descending'
                      : 'ascending'
                }))}
              >
                Name
                {sortConfig.key === 'name' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => setSortConfig(prevConfig => ({
                  key: 'last_message',
                  direction:
                    prevConfig.key === 'last_message' && prevConfig.direction === 'ascending'
                      ? 'descending'
                      : 'ascending'
                }))}
              >
                Last Active
                {sortConfig.key === 'last_message' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUnits.map((unit) => (
              <tr
                key={unit.id}
                onClick={() => {
                  if (onSelectUnit) onSelectUnit(unit.id, unit);
                }}
                className="hover:bg-blue-50 cursor-pointer transition-colors duration-150 ease-in-out"
              >
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                  {unit.hw_id && (
                    <div className="text-xs text-gray-500">ID: {unit.hw_id}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {unit.type || (unit.cls_id ? `Class ${unit.cls_id}` : 'N/A')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {unit.last_message ? new Date(unit.last_message * 1000).toLocaleString() : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${unit.connection_state === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
                    }
                  >
                    {unit.connection_state === 1 ? 'Online' : 'Offline'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right text-sm text-gray-500">
        {filteredUnits.length} units shown {units.length > filteredUnits.length && `(out of ${units.length})`}
      </div>
    </div>
  );
};

export default WialonUnitsList;
