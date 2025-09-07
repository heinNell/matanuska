import React, { useState, useEffect } from 'react';
import {
  Wrench,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Car,
  Plus,
  Search,
  Filter,
  Camera,
  MapPin
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import MobileCameraCapture from './MobileCameraCapture';
import { toast } from 'sonner';

interface JobCard {
  id: string;
  vehicleId: string;
  vehicleRegistration: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedHours?: number;
  actualHours?: number;
  parts?: string[];
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface Inspection {
  id: string;
  type: 'pre-trip' | 'post-trip' | 'maintenance' | 'safety';
  vehicleId: string;
  vehicleRegistration: string;
  status: 'pending' | 'completed' | 'failed';
  checkedItems: Record<string, boolean>;
  notes: string;
  inspector: string;
  timestamp: Date;
  images?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

const INSPECTION_ITEMS = {
  'pre-trip': [
    'Engine oil level',
    'Coolant level',
    'Brake fluid level',
    'Tire condition and pressure',
    'Lights (headlights, taillights, indicators)',
    'Mirrors and visibility',
    'Seat belts',
    'Horn',
    'Windshield wipers',
    'Emergency equipment'
  ],
  'post-trip': [
    'Engine performance',
    'Unusual noises or vibrations',
    'Brake performance',
    'Steering responsiveness',
    'Transmission issues',
    'Dashboard warning lights',
    'Fuel consumption',
    'Tire wear patterns',
    'Body damage or scratches',
    'Interior cleanliness'
  ],
  'maintenance': [
    'Engine diagnostics',
    'Fluid levels and leaks',
    'Belt and hose condition',
    'Battery condition',
    'Air filter condition',
    'Brake system inspection',
    'Suspension components',
    'Exhaust system',
    'Electrical systems',
    'Documentation updates'
  ],
  'safety': [
    'Fire extinguisher',
    'First aid kit',
    'Warning triangles',
    'Emergency exits',
    'Safety equipment accessibility',
    'Driver documentation',
    'Vehicle registration',
    'Insurance documents',
    'Load securing equipment',
    'Communication devices'
  ]
};

interface MobileWorkshopManagementProps {
  onClose?: () => void;
}

export const MobileWorkshopManagement: React.FC<MobileWorkshopManagementProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'jobcards' | 'inspections' | 'new'>('jobcards');
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [currentJobCard, setCurrentJobCard] = useState<JobCard | null>(null);
  const [newInspection, setNewInspection] = useState<Partial<Inspection> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Mock data - in real app, load from API/storage
    const mockJobCards: JobCard[] = [
      {
        id: 'JC001',
        vehicleId: 'V001',
        vehicleRegistration: 'KCA 123A',
        status: 'in-progress',
        priority: 'high',
        title: 'Engine service',
        description: 'Routine maintenance check and oil change',
        assignedTo: 'John Doe',
        createdAt: new Date(2024, 0, 15),
        updatedAt: new Date(),
        estimatedHours: 4,
        actualHours: 2,
        parts: ['Engine oil', 'Oil filter', 'Air filter']
      },
      {
        id: 'JC002',
        vehicleId: 'V002',
        vehicleRegistration: 'KBZ 456B',
        status: 'pending',
        priority: 'medium',
        title: 'Brake inspection',
        description: 'Brake pads replacement and system check',
        createdAt: new Date(2024, 0, 16),
        updatedAt: new Date(),
        estimatedHours: 3
      }
    ];

    const mockInspections: Inspection[] = [
      {
        id: 'INS001',
        type: 'pre-trip',
        vehicleId: 'V001',
        vehicleRegistration: 'KCA 123A',
        status: 'completed',
        checkedItems: {
          'Engine oil level': true,
          'Coolant level': true,
          'Brake fluid level': false,
          'Tire condition and pressure': true
        },
        notes: 'Brake fluid level low, needs attention',
        inspector: 'Jane Smith',
        timestamp: new Date()
      }
    ];

    setJobCards(mockJobCards);
    setInspections(mockInspections);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startInspection = (type: Inspection['type'], vehicleRegistration: string) => {
    const inspection: Partial<Inspection> = {
      id: `INS${Date.now()}`,
      type,
      vehicleRegistration,
      status: 'pending',
      checkedItems: {},
      notes: '',
      inspector: 'Current User', // In real app, get from auth
      timestamp: new Date()
    };
    setNewInspection(inspection);
    setActiveTab('new');
  };

  const updateJobCardStatus = (jobCardId: string, newStatus: JobCard['status']) => {
    setJobCards(prev => prev.map(jc =>
      jc.id === jobCardId
        ? { ...jc, status: newStatus, updatedAt: new Date() }
        : jc
    ));
    toast.success(`Job card status updated to ${newStatus}`);
  };

  const handleCameraCapture = (images: any[]) => {
    if (currentJobCard) {
      const imageUrls = images.map(img => img.dataUrl);
      setJobCards(prev => prev.map(jc =>
        jc.id === currentJobCard.id
          ? { ...jc, images: [...(jc.images || []), ...imageUrls] }
          : jc
      ));
      toast.success(`${images.length} image(s) added to job card`);
    }
    setShowCamera(false);
    setCurrentJobCard(null);
  };

  const filteredJobCards = jobCards.filter(jc => {
    const matchesSearch = jc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jc.vehicleRegistration.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || jc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wrench className="h-6 w-6 mr-2" />
            <h1 className="text-lg font-semibold">Workshop Mobile</h1>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
              ✕
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex mt-4 space-x-1">
          <Button
            variant={activeTab === 'jobcards' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('jobcards')}
            className="flex-1"
          >
            <ClipboardList className="h-4 w-4 mr-1" />
            Job Cards
          </Button>
          <Button
            variant={activeTab === 'inspections' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('inspections')}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Inspections
          </Button>
          <Button
            variant={activeTab === 'new' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('new')}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {activeTab === 'jobcards' && (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search job cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            {/* Job Cards List */}
            <div className="space-y-3">
              {filteredJobCards.map((jobCard) => (
                <Card key={jobCard.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{jobCard.title}</h3>
                        <p className="text-xs text-gray-600 flex items-center mt-1">
                          <Car className="h-3 w-3 mr-1" />
                          {jobCard.vehicleRegistration}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Badge className={`text-xs ${getPriorityColor(jobCard.priority)}`}>
                          {jobCard.priority}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(jobCard.status)}`}>
                          {jobCard.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-2">
                    <p className="text-sm text-gray-600">{jobCard.description}</p>

                    {jobCard.assignedTo && (
                      <p className="text-xs text-gray-500 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {jobCard.assignedTo}
                      </p>
                    )}

                    {jobCard.estimatedHours && (
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Est: {jobCard.estimatedHours}h
                        {jobCard.actualHours && ` | Actual: ${jobCard.actualHours}h`}
                      </p>
                    )}

                    {jobCard.parts && jobCard.parts.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <strong>Parts:</strong> {jobCard.parts.join(', ')}
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      {jobCard.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateJobCardStatus(jobCard.id, 'in-progress')}
                          className="flex-1"
                        >
                          Start Work
                        </Button>
                      )}

                      {jobCard.status === 'in-progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateJobCardStatus(jobCard.id, 'completed')}
                          className="flex-1"
                        >
                          Complete
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCurrentJobCard(jobCard);
                          setShowCamera(true);
                        }}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredJobCards.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No job cards found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {inspections.map((inspection) => (
                <Card key={inspection.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm capitalize">
                          {inspection.type.replace('-', ' ')} Inspection
                        </h3>
                        <p className="text-xs text-gray-600 flex items-center mt-1">
                          <Car className="h-3 w-3 mr-1" />
                          {inspection.vehicleRegistration}
                        </p>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(inspection.status)}`}>
                        {inspection.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {inspection.inspector} • {inspection.timestamp.toLocaleDateString()}
                      </p>

                      {inspection.notes && (
                        <p className="text-sm text-gray-600">{inspection.notes}</p>
                      )}

                      <div className="text-xs">
                        <span className="text-gray-500">Items checked: </span>
                        <span className="font-medium">
                          {Object.values(inspection.checkedItems).filter(Boolean).length}/{Object.keys(inspection.checkedItems).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {inspections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No inspections found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="space-y-4">
            {!newInspection ? (
              <>
                <h2 className="text-lg font-semibold">Quick Actions</h2>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => startInspection('pre-trip', 'KCA 123A')}
                  >
                    <CheckCircle className="h-6 w-6 mb-1" />
                    <span className="text-xs">Pre-trip Inspection</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => startInspection('post-trip', 'KCA 123A')}
                  >
                    <AlertCircle className="h-6 w-6 mb-1" />
                    <span className="text-xs">Post-trip Inspection</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => startInspection('maintenance', 'KCA 123A')}
                  >
                    <Wrench className="h-6 w-6 mb-1" />
                    <span className="text-xs">Maintenance Check</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => startInspection('safety', 'KCA 123A')}
                  >
                    <AlertCircle className="h-6 w-6 mb-1" />
                    <span className="text-xs">Safety Inspection</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold capitalize">
                    {newInspection.type?.replace('-', ' ')} Inspection
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewInspection(null)}
                  >
                    Cancel
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Vehicle</label>
                        <input
                          type="text"
                          value={newInspection.vehicleRegistration || ''}
                          onChange={(e) => setNewInspection(prev => ({ ...prev, vehicleRegistration: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Vehicle registration"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Inspection Items</label>
                        <div className="space-y-2">
                          {INSPECTION_ITEMS[newInspection.type || 'pre-trip'].map((item) => (
                            <label key={item} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={newInspection.checkedItems?.[item] || false}
                                onChange={(e) => setNewInspection(prev => ({
                                  ...prev,
                                  checkedItems: {
                                    ...prev.checkedItems,
                                    [item]: e.target.checked
                                  }
                                }))}
                                className="rounded"
                              />
                              <span className="text-sm">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                          value={newInspection.notes || ''}
                          onChange={(e) => setNewInspection(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                          rows={3}
                          placeholder="Additional notes..."
                        />
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          className="flex-1"
                          onClick={() => {
                            const completedInspection: Inspection = {
                              ...newInspection as Inspection,
                              status: 'completed'
                            };
                            setInspections(prev => [...prev, completedInspection]);
                            setNewInspection(null);
                            setActiveTab('inspections');
                            toast.success('Inspection completed successfully');
                          }}
                        >
                          Complete Inspection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <MobileCameraCapture
          title="Job Card Photos"
          captureMode="multiple"
          showLocationCapture
          onCapture={handleCameraCapture}
          onClose={() => {
            setShowCamera(false);
            setCurrentJobCard(null);
          }}
        />
      )}
    </div>
  );
};

export default MobileWorkshopManagement;
