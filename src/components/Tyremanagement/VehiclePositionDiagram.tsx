import React from 'react';
import { Truck, Bike, TruckIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface Position {
  id: string;
  name: string;
}

interface VehiclePositionDiagramProps {
  vehicleType: string;
  positions: Position[];
  selectedPosition?: string;
  onPositionClick?: (position: string) => void;
}

const VehiclePositionDiagram: React.FC<VehiclePositionDiagramProps> = ({
  vehicleType,
  positions,
  selectedPosition,
  onPositionClick
}) => {
  // Simple rendering for now - in a real implementation, you'd have SVG diagrams for each vehicle type
  
  const renderHorseDiagram = () => (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg p-4">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <Truck size={64} className="text-gray-700" />
        <div className="text-xs mt-1 font-semibold">Horse (Truck Tractor)</div>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 grid grid-cols-5 gap-2 px-4">
        {positions.map(position => (
          <button
            key={position.id}
            onClick={() => onPositionClick?.(position.id)}
            className={`px-2 py-1 text-xs rounded ${
              selectedPosition === position.id
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300'
            }`}
          >
            {position.id}: {position.name}
          </button>
        ))}
      </div>
    </div>
  );
  
  const renderReeferDiagram = () => (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg p-4">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <div className="w-16 h-8 bg-blue-500 rounded-lg"></div>
        <div className="w-64 h-12 bg-gray-300 rounded-lg mt-2"></div>
        <div className="text-xs mt-1 font-semibold">Reefer (3-Axle Trailer)</div>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 grid grid-cols-4 gap-2 px-4">
        {positions.map(position => (
          <button
            key={position.id}
            onClick={() => onPositionClick?.(position.id)}
            className={`px-2 py-1 text-xs rounded ${
              selectedPosition === position.id
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300'
            }`}
          >
            {position.id}: {position.name}
          </button>
        ))}
      </div>
    </div>
  );
  
  const renderInterlinkDiagram = () => (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg p-4 overflow-y-auto">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <div className="w-16 h-8 bg-green-500 rounded-lg"></div>
        <div className="w-80 h-16 bg-gray-300 rounded-lg mt-2"></div>
        <div className="text-xs mt-1 font-semibold">Interlink (4-Axle Trailer)</div>
      </div>
      
      <div className="absolute top-36 left-0 right-0 grid grid-cols-3 gap-2 px-4">
        {positions.map(position => (
          <button
            key={position.id}
            onClick={() => onPositionClick?.(position.id)}
            className={`px-2 py-1 text-xs rounded ${
              selectedPosition === position.id
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300'
            }`}
          >
            {position.id}: {position.name}
          </button>
        ))}
      </div>
    </div>
  );
  
  const renderLMVDiagram = () => (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg p-4">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <Bike size={48} className="text-gray-700" />
        <div className="text-xs mt-1 font-semibold">Light Motor Vehicle (LMV)</div>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 grid grid-cols-3 gap-2 px-4">
        {positions.map(position => (
          <button
            key={position.id}
            onClick={() => onPositionClick?.(position.id)}
            className={`px-2 py-1 text-xs rounded ${
              selectedPosition === position.id
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300'
            }`}
          >
            {position.id}: {position.name}
          </button>
        ))}
      </div>
    </div>
  );
  
  const renderStandardDiagram = () => (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg p-4">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <TruckIcon size={48} className="text-gray-700" />
        <div className="text-xs mt-1 font-semibold">Standard Vehicle</div>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 grid grid-cols-2 gap-2 px-4">
        {positions.map(position => (
          <button
            key={position.id}
            onClick={() => onPositionClick?.(position.id)}
            className={`px-2 py-1 text-xs rounded ${
              selectedPosition === position.id
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300'
            }`}
          >
            {position.name}
          </button>
        ))}
      </div>
    </div>
  );
  
  // Choose diagram based on vehicle type
  const renderDiagram = () => {
    switch (vehicleType) {
      case 'horse':
        return renderHorseDiagram();
      case 'reefer':
        return renderReeferDiagram();
      case 'interlink':
        return renderInterlinkDiagram();
      case 'lmv':
        return renderLMVDiagram();
      case 'standard':
      default:
        return renderStandardDiagram();
    }
  };
  
  if (!positions || positions.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-2">Tyre Position Layout</h3>
        {renderDiagram()}
        <p className="text-xs text-gray-500 mt-2">
          Click on a position to select it for the current tyre.
        </p>
      </CardContent>
    </Card>
  );
};

export default VehiclePositionDiagram;
