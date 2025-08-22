import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

interface Inspection {
  id: string;
  vehicleId: string;
  vehicleName?: string;
  inspectionType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  performedBy: string;
  inspectionDate: string;
  dueDate?: string;
  findings?: InspectionFinding[];
  completedAt?: string;
}

interface InspectionFinding {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction?: string;
  status: 'new' | 'addressed' | 'ignored';
  images?: string[];
}

interface InspectionManagementProps {
  inspections: Inspection[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onCreateJobCard?: (inspectionId: string) => Promise<void>;
}

const InspectionManagement: React.FC<InspectionManagementProps> = ({
  inspections,
  isLoading = false,
  onRefresh,
  onCreateJobCard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>(inspections);
  const [expandedInspections, setExpandedInspections] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Apply filters and search whenever they change
  useEffect(() => {
    let results = [...inspections];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(inspection =>
        inspection.vehicleId.toLowerCase().includes(term) ||
        inspection.vehicleName?.toLowerCase().includes(term) ||
        inspection.inspectionType.toLowerCase().includes(term) ||
        inspection.performedBy.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter) {
      results = results.filter(inspection => inspection.status === statusFilter);
    }

    // Apply date range filter
    const now = new Date();
    if (dateRange === 'today') {
      const today = now.toISOString().split('T')[0];
      results = results.filter(inspection =>
        inspection.inspectionDate.split('T')[0] === today
      );
    } else if (dateRange === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      results = results.filter(inspection =>
        new Date(inspection.inspectionDate) >= oneWeekAgo
      );
    } else if (dateRange === 'month') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      results = results.filter(inspection =>
        new Date(inspection.inspectionDate) >= oneMonthAgo
      );
    }

    setFilteredInspections(results);
  }, [inspections, searchTerm, statusFilter, dateRange]);

  // Handle refresh button click
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing inspections:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Toggle expanded state of an inspection
  const toggleExpanded = (id: string) => {
    setExpandedInspections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle create job card from inspection
  const handleCreateJobCard = async (inspectionId: string) => {
    if (onCreateJobCard) {
      try {
        await onCreateJobCard(inspectionId);
      } catch (error) {
        console.error('Error creating job card from inspection:', error);
      }
    }
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold">Vehicle Inspections</h2>

        <div className="flex items-center gap-2">
          <Link to="/workshop/inspections/new">
            <Button className="flex items-center gap-1">
              <PlusCircleIcon className="h-5 w-5" />
              New Inspection
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search inspections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md py-2 px-3"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-md py-2 px-3"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className="mb-4">No inspections found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateRange('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredInspections.map(inspection => (
              <div key={inspection.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div
                  className="p-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpanded(inspection.id)}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-500" />

                    <div>
                      <div className="font-medium">
                        {inspection.vehicleName || inspection.vehicleId}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inspection.inspectionType} •
                        {format(new Date(inspection.inspectionDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(inspection.status)}`}>
                      {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                    </span>

                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform ${expandedInspections[inspection.id] ? 'transform rotate-180' : ''}`}
                    />
                  </div>
                </div>

                {expandedInspections[inspection.id] && (
                  <div className="border-t p-3">
                    <div className="mb-3">
                      <div className="text-sm">
                        <span className="font-medium">Performed by:</span> {inspection.performedBy}
                      </div>
                      {inspection.dueDate && (
                        <div className="text-sm">
                          <span className="font-medium">Due date:</span> {format(new Date(inspection.dueDate), 'MMM d, yyyy')}
                        </div>
                      )}
                      {inspection.completedAt && (
                        <div className="text-sm">
                          <span className="font-medium">Completed:</span> {format(new Date(inspection.completedAt), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>

                    {inspection.findings && inspection.findings.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-medium mb-2">Findings</h4>
                        <div className="space-y-2">
                          {inspection.findings.map(finding => (
                            <div key={finding.id} className="bg-gray-50 p-2 rounded">
                              <div className="flex justify-between">
                                <span className="font-medium">{finding.category}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(finding.severity)}`}>
                                  {finding.severity}
                                </span>
                              </div>
                              <p className="text-sm">{finding.description}</p>
                              {finding.recommendedAction && (
                                <p className="text-sm mt-1">
                                  <span className="font-medium">Recommendation:</span> {finding.recommendedAction}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Link to={`/workshop/inspections/${inspection.id}`}>
                        <Button
                          variant="outline"
                        >
                          View Details
                        </Button>
                      </Link>

                      {inspection.status === 'completed' && (
                        <Button
                          onClick={() => handleCreateJobCard(inspection.id)}
                          variant="default"
                        >
                          Create Job Card
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionManagement;
