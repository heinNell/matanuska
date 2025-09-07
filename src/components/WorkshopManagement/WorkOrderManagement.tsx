import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { WorkOrder, WorkOrderStatus } from '../../types/workshop-tyre-inventory';

interface WorkOrderManagementProps {
  workOrders: WorkOrder[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onStatusUpdate?: (workOrderId: string, newStatus: WorkOrderStatus) => Promise<void>;
}

const WorkOrderManagement: React.FC<WorkOrderManagementProps> = ({
  workOrders,
  isLoading = false,
  onRefresh,
  onStatusUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [filteredWorkOrders, setFilteredWorkOrders] = useState<WorkOrder[]>(workOrders);
  const [expandedWorkOrders, setExpandedWorkOrders] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Apply filters and search whenever they change
  useEffect(() => {
    let results = [...workOrders];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(wo =>
        wo.workOrderId.toLowerCase().includes(term) ||
        wo.vehicleId.toLowerCase().includes(term) ||
        wo.title.toLowerCase().includes(term) ||
        wo.description.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter) {
      results = results.filter(wo => wo.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter) {
      results = results.filter(wo => wo.priority === priorityFilter);
    }

    setFilteredWorkOrders(results);
  }, [workOrders, searchTerm, statusFilter, priorityFilter]);

  // Handle refresh button click
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing work orders:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Toggle expanded state of a work order
  const toggleExpanded = (id: string) => {
    setExpandedWorkOrders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle status update
  const handleStatusUpdate = async (workOrderId: string, newStatus: WorkOrderStatus) => {
    if (onStatusUpdate) {
      try {
        await onStatusUpdate(workOrderId, newStatus);
      } catch (error) {
        console.error('Error updating work order status:', error);
      }
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending_parts': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate completion percentage
  const calculateCompletion = (workOrder: WorkOrder) => {
    if (!workOrder.tasks || workOrder.tasks.length === 0) return 0;
    const completedTasks = workOrder.tasks.filter(t =>
      t.status === 'completed'
    ).length;
    return Math.round((completedTasks / workOrder.tasks.length) * 100);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold">Work Orders</h2>

        <div className="flex items-center gap-2">
          <Link to="/workshop/work-orders/new">
            <Button className="flex items-center gap-1">
              <PlusCircleIcon className="h-5 w-5" />
              New Work Order
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
                placeholder="Search work orders..."
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
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_parts">Pending Parts</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded-md py-2 px-3"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin" />
          </div>
        ) : filteredWorkOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className="mb-4">No work orders found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredWorkOrders.map(workOrder => {
              const completionPercentage = calculateCompletion(workOrder);

              return (
                <div key={workOrder.workOrderId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div
                    className="p-3 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpanded(workOrder.workOrderId)}
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />

                      <div>
                        <div className="font-medium">
                          {workOrder.title} <span className="text-sm text-gray-500">({workOrder.workOrderId})</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Vehicle: {workOrder.vehicleId} •
                          {format(new Date(workOrder.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(workOrder.priority)}`}>
                        {workOrder.priority}
                      </span>

                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(workOrder.status)}`}>
                        {workOrder.status.replace('_', ' ')}
                      </span>

                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform ${expandedWorkOrders[workOrder.workOrderId] ? 'transform rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {expandedWorkOrders[workOrder.workOrderId] && (
                    <div className="border-t p-3">
                      {/* Description */}
                      <div className="mb-3">
                        <h4 className="font-medium mb-1">Description</h4>
                        <p className="text-sm text-gray-700">{workOrder.description}</p>
                      </div>

                      {/* Tasks Progress */}
                      <div className="mb-3">
                        <h4 className="font-medium mb-1">
                          Tasks Progress
                          <span className="text-sm font-normal ml-2">
                            ({workOrder.tasks.filter(t => t.status === 'completed').length}/{workOrder.tasks.length} tasks)
                          </span>
                        </h4>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${completionPercentage}%` }}
                           />
                        </div>
                      </div>

                      {/* Parts & Labor Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <h4 className="font-medium mb-1">Parts</h4>
                          {workOrder.partsUsed && workOrder.partsUsed.length > 0 ? (
                            <ul className="text-sm space-y-1">
                              {workOrder.partsUsed.map((part, index) => (
                                <li key={index} className="flex justify-between">
                                  <span>{part.description} ({part.quantity})</span>
                                  <span>${part.totalCost.toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">No parts listed</p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium mb-1">Labor</h4>
                          {workOrder.laborEntries && workOrder.laborEntries.length > 0 ? (
                            <ul className="text-sm space-y-1">
                              {workOrder.laborEntries.map((labor, index) => (
                                <li key={index} className="flex justify-between">
                                  <span>{labor.technicianName} ({labor.hoursWorked} hrs)</span>
                                  <span>${labor.totalCost.toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">No labor entries</p>
                          )}
                        </div>
                      </div>

                      {/* Tags and Metadata */}
                      {workOrder.linkedInspectionId && (
                        <div className="flex items-center gap-1 mb-3 text-sm">
                          <TagIcon className="h-4 w-4 text-blue-500" />
                          <span>Linked to Inspection:</span>
                          <Link
                            to={`/workshop/inspections/${workOrder.linkedInspectionId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {workOrder.linkedInspectionId}
                          </Link>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Link to={`/workshop/work-orders/${workOrder.workOrderId}`}>
                          <Button variant="outline">
                            View Details
                          </Button>
                        </Link>

                        {workOrder.status !== 'completed' && workOrder.status !== 'cancelled' && (
                          <>
                            {workOrder.status !== 'in_progress' && (
                              <Button
                                onClick={() => handleStatusUpdate(workOrder.workOrderId, 'in_progress')}
                                variant="default"
                              >
                                Start Work
                              </Button>
                            )}

                            {workOrder.status === 'in_progress' && (
                              <Button
                                onClick={() => handleStatusUpdate(workOrder.workOrderId, 'completed')}
                                variant="success"
                              >
                                Mark Complete
                              </Button>
                            )}

                            <Button
                              onClick={() => handleStatusUpdate(workOrder.workOrderId, 'on_hold' as WorkOrderStatus)}
                              variant="secondary"
                            >
                              Hold
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrderManagement;
