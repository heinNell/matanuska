import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Spinner from '../ui/Spinner';
import { InventoryItem } from '../../types/workshop-tyre-inventory';
import { PartsAndMaterial } from '../../types/workshop-job-card';

// Comprehensive part interface combining both type systems
interface Part extends InventoryItem, Omit<PartsAndMaterial, 'quantity'> {
  price: number;
  inStock: number;
  partNumber: string;
}

// Part assignment interface with full tracking information
interface AssignedPart {
  id: string;
  partId: string;
  jobCardId: string;
  quantity: number;
  addedAt: string; // ISO timestamp
  addedBy: string;
  partData: Part;
  unitCost?: number;
  totalCost?: number;
  status?: "requested" | "ordered" | "received" | "installed";
}

interface InventoryPanelProps {
  assignedParts: AssignedPart[];
  onAssignPart: (partId: string, quantity: number) => Promise<void>;
  onRemovePart: (assignmentId: string) => Promise<void>;
  onUpdatePartQuantity: (assignmentId: string, newQuantity: number) => Promise<void>;
  isLoading?: boolean;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  assignedParts = [],
  onAssignPart,
  onRemovePart,
  onUpdatePartQuantity,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Part[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  // Mock function to search parts - in real app would be replaced with API/Firebase call
  const searchParts = async (query: string) => {
    setIsSearching(true);
    try {
      // This is a mock - would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock results that conform to the Part interface
      const results: Part[] = [
        {id: 'p1', name: 'Brake Pad Set', partNumber: 'BP-2023', price: 89.99, inStock: 24, code: 'BP-2023', unitPrice: 89.99, category: 'Brakes', sn: 1, itemName: 'Brake Pad Set', totalCost: 89.99, quantity: 1},
        {id: 'p2', name: 'Oil Filter', partNumber: 'OF-1010', price: 12.49, inStock: 45, code: 'OF-1010', unitPrice: 12.49, category: 'Filters', sn: 2, itemName: 'Oil Filter', totalCost: 12.49, quantity: 1},
        {id: 'p3', name: 'Spark Plug', partNumber: 'SP-4040', price: 8.99, inStock: 120, code: 'SP-4040', unitPrice: 8.99, category: 'Ignition', sn: 3, itemName: 'Spark Plug', totalCost: 8.99, quantity: 1}
      ].filter(part =>
        part.name.toLowerCase().includes(query.toLowerCase()) ||
        part.partNumber.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const delaySearch = setTimeout(() => {
        searchParts(searchQuery);
      }, 500);

      return () => clearTimeout(delaySearch);
    } else {
      setSearchResults([]);
    }
    return () => {};
  }, [searchQuery]);

  const handleAssignPart = async () => {
    if (selectedPart && quantityToAdd > 0) {
      try {
        await onAssignPart(selectedPart.id, quantityToAdd);
        setSelectedPart(null);
        setQuantityToAdd(1);
        setSearchQuery('');
        setSearchResults([]);
      } catch (error) {
        console.error('Error assigning part:', error);
      }
    }
  };

  const totalCost = assignedParts.reduce((sum, part) => {
    return sum + (part.partData.price * part.quantity);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Parts & Inventory</h3>

      {/* Search Parts */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search parts by name or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="flex justify-center my-4">
            <Spinner size="md" />
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="mt-2 border rounded-md overflow-hidden max-h-48 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {searchResults.map(part => (
                <li
                  key={part.id}
                  className={`p-2 hover:bg-gray-50 cursor-pointer ${selectedPart?.id === part.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedPart(part)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{part.name}</p>
                      <p className="text-sm text-gray-500">#{part.partNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${part.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{part.inStock} in stock</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Selected Part Addition */}
        {selectedPart && (
          <div className="mt-3 p-3 border rounded-md bg-blue-50">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">{selectedPart.name}</p>
              <p className="font-medium">${selectedPart.price.toFixed(2)}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center border rounded bg-white">
                <button
                  onClick={() => setQuantityToAdd(Math.max(1, quantityToAdd - 1))}
                  className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={selectedPart.inStock}
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(Math.min(selectedPart.inStock, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-12 text-center border-0 focus:ring-0"
                />
                <button
                  onClick={() => setQuantityToAdd(Math.min(selectedPart.inStock, quantityToAdd + 1))}
                  className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAssignPart}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                {isLoading ? <Spinner size="sm" /> : 'Add Part'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Parts List */}
      <div>
        <h4 className="font-medium mb-2">Assigned Parts</h4>

        {assignedParts.length === 0 ? (
          <p className="text-gray-500 italic p-4 text-center border rounded-md">No parts have been assigned to this job</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 border rounded-md overflow-hidden mb-3">
              {assignedParts.map(assignment => (
                <li key={assignment.id} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{assignment.partData.name}</p>
                      <p className="text-sm text-gray-500">#{assignment.partData.partNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${assignment.partData.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Total: ${(assignment.partData.price * assignment.quantity).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center border rounded bg-white">
                      <button
                        onClick={() => onUpdatePartQuantity(assignment.id, Math.max(1, assignment.quantity - 1))}
                        disabled={isLoading || assignment.quantity <= 1}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:text-gray-300"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{assignment.quantity}</span>
                      <button
                        onClick={() => onUpdatePartQuantity(assignment.id, assignment.quantity + 1)}
                        disabled={isLoading || assignment.quantity >= assignment.partData.inStock}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:text-gray-300"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemovePart(assignment.id)}
                      disabled={isLoading}
                      className="text-red-500 hover:text-red-600 disabled:text-gray-300"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
              <span className="font-medium">Total Parts Cost:</span>
              <span className="font-bold">${totalCost.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;
