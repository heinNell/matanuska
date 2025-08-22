import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircleIcon,
  FunnelIcon,
  TableCellsIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { JobCard, JobCardStatus, Priority } from '../../types/workshop-tyre-inventory';
import JobCardCard from './JobCardCard';
import JobCardKanbanBoard from './JobCardKanbanBoard';
import { Button } from '../ui/Button';

interface JobCardManagementProps {
  jobCards: JobCard[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onStatusUpdate?: (jobCardId: string, newStatus: JobCardStatus) => Promise<void>;
}

const JobCardManagement: React.FC<JobCardManagementProps> = ({
  jobCards,
  isLoading = false,
  onRefresh,
  onStatusUpdate
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '' as JobCardStatus | '',
    priority: '' as Priority | '',
  });

  const [filteredJobCards, setFilteredJobCards] = useState<JobCard[]>(jobCards);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Apply filters and search whenever relevant states change
  useEffect(() => {
    let results = [...jobCards];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(job =>
        job.workOrderNumber.toLowerCase().includes(term) ||
        job.vehicleId.toLowerCase().includes(term) ||
        job.customerName?.toLowerCase().includes(term) ||
        job.workDescription?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filters.status) {
      results = results.filter(job => job.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      results = results.filter(job => job.priority === filters.priority);
    }

    setFilteredJobCards(results);
  }, [jobCards, searchTerm, filters]);

  // Handle refresh click
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing job cards:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold">Job Cards</h2>

        <div className="flex items-center gap-2">
          <Link to="/workshop/job-cards/new">
            <Button className="flex items-center gap-1">
              <PlusCircleIcon className="h-5 w-5" />
              New Job Card
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
                placeholder="Search job cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-500" />

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as JobCardStatus | '' }))}
              className="border rounded-md py-2 px-3"
            >
              <option value="">All Statuses</option>
              <option value="created">Created</option>
              <option value="initiated">New</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="parts_pending">Waiting Parts</option>
              <option value="completed">Completed</option>
              <option value="invoiced">Invoiced</option>
              <option value="rca_required">RCA Required</option>
              <option value="overdue">Overdue</option>
              <option value="inspected">Inspected</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as Priority | '' }))}
              className="border rounded-md py-2 px-3"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600'}`}
              aria-label="List view"
            >
              <TableCellsIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-2 ${viewMode === 'board' ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-600'}`}
              aria-label="Board view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : filteredJobCards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className="mb-4">No job cards found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilters({ status: '', priority: '' });
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto pb-4 h-full">
            {filteredJobCards.map(jobCard => (
              <JobCardCard
                key={jobCard.id}
                jobCard={jobCard}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <JobCardKanbanBoard
            jobCards={filteredJobCards}
            onStatusUpdate={onStatusUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default JobCardManagement;
