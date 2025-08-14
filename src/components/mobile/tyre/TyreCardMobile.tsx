import React from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { 
  Scan, 
  Edit, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Gauge, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Info
} from 'lucide-react';

interface TyreCardMobileProps {
  tyre: {
    id: string;
    tyreNumber: string;
    manufacturer: string;
    tyreSize: string;
    pattern?: string;
    condition: string;
    status: string;
    mountStatus: string;
    axlePosition?: string;
    vehicleId?: string;
    cost?: number;
    datePurchased?: string;
    kmRun?: number;
    lastInspection?: string;
  };
  onScan?: () => void;
  onEdit?: () => void;
  onViewDetails?: () => void;
  compact?: boolean;
}

const TyreCardMobile: React.FC<TyreCardMobileProps> = ({
  tyre,
  onScan,
  onEdit,
  onViewDetails,
  compact = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-service':
        return 'text-green-600 bg-green-50';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-50';
      case 'out-of-service':
        return 'text-red-600 bg-red-50';
      case 'spare':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'used':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'retreaded':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'scrap':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  if (compact) {
    return (
      <Card className="mb-3 shadow-sm border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-900 truncate">
                  {tyre.tyreNumber}
                </span>
                {getConditionIcon(tyre.condition)}
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <div>{tyre.manufacturer} - {tyre.tyreSize}</div>
                {tyre.axlePosition && (
                  <div className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {tyre.axlePosition}
                  </div>
                )}
              </div>
              
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tyre.status)}`}>
                {tyre.status}
              </span>
            </div>
            
            <div className="flex space-x-1 ml-2">
              {onScan && (
                <Button size="sm" variant="outline" onClick={onScan}>
                  <Scan className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">{tyre.tyreNumber}</h3>
            {getConditionIcon(tyre.condition)}
          </div>
          
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tyre.status)}`}>
            {tyre.status}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Manufacturer
            </label>
            <p className="text-sm font-medium text-gray-900">{tyre.manufacturer}</p>
          </div>
          
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Size
            </label>
            <p className="text-sm font-medium text-gray-900">{tyre.tyreSize}</p>
          </div>
        </div>

        {tyre.pattern && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Pattern
            </label>
            <p className="text-sm font-medium text-gray-900">{tyre.pattern}</p>
          </div>
        )}

        {/* Mount Status & Position */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Mount Status</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              tyre.mountStatus === 'Mounted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {tyre.mountStatus}
            </span>
          </div>
          
          {tyre.axlePosition && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {tyre.axlePosition}
              {tyre.vehicleId && ` • Vehicle ${tyre.vehicleId}`}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {tyre.cost && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
              <span>R{tyre.cost.toLocaleString()}</span>
            </div>
          )}
          
          {tyre.kmRun && (
            <div className="flex items-center">
              <Gauge className="h-4 w-4 mr-1 text-gray-400" />
              <span>{tyre.kmRun.toLocaleString()} km</span>
            </div>
          )}
          
          {tyre.datePurchased && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              <span>{new Date(tyre.datePurchased).toLocaleDateString()}</span>
            </div>
          )}
          
          {tyre.lastInspection && (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-gray-400" />
              <span>{new Date(tyre.lastInspection).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {onScan && (
            <Button onClick={onScan} variant="outline" className="flex-1">
              <Scan className="h-4 w-4 mr-2" />
              Scan QR
            </Button>
          )}
          
          {onEdit && (
            <Button onClick={onEdit} variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {onViewDetails && (
            <Button onClick={onViewDetails} className="flex-1">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TyreCardMobile;
