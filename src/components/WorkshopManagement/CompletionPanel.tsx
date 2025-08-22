import React, { useState } from 'react';
import { CheckCircleIcon, DocumentTextIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import Spinner from '../ui/Spinner';
import { JobCardStatus } from '../../types/workshop-tyre-inventory';
import { CostSummary } from '../../types/workshop-job-card';

interface CompletionPanelProps {
  status: JobCardStatus | string;
  totalCost?: number;
  costSummary?: CostSummary;
  laborHours?: number;
  laborRate?: number;
  onGenerateInvoice: () => Promise<void>;
  onMarkComplete: () => Promise<void>;
  onUpdateLaborHours: (hours: number) => Promise<void>;
  canComplete: boolean;
  isLoading?: boolean;
}

const CompletionPanel: React.FC<CompletionPanelProps> = ({
  status,
  totalCost = 0,
  laborHours = 0,
  laborRate = 75,
  onGenerateInvoice,
  onMarkComplete,
  onUpdateLaborHours,
  canComplete = false,
  isLoading = false
}) => {
  const [hours, setHours] = useState(laborHours.toString());
  const [isUpdatingHours, setIsUpdatingHours] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isCompletingJob, setIsCompletingJob] = useState(false);

  const handleHoursUpdate = async () => {
    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours) || parsedHours < 0) return;

    setIsUpdatingHours(true);
    try {
      await onUpdateLaborHours(parsedHours);
    } catch (error) {
      console.error('Error updating labor hours:', error);
    } finally {
      setIsUpdatingHours(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      await onGenerateInvoice();
    } catch (error) {
      console.error('Error generating invoice:', error);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleMarkComplete = async () => {
    setIsCompletingJob(true);
    try {
      await onMarkComplete();
    } catch (error) {
      console.error('Error marking job as complete:', error);
    } finally {
      setIsCompletingJob(false);
    }
  };

  const laborCost = laborHours * laborRate;
  const grandTotal = totalCost + laborCost;

  const isCompleted = status === 'completed';
  const isInvoiced = status === 'invoiced';

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <DocumentTextIcon className="h-6 w-6 text-blue-500" />
        Job Completion & Invoice
      </h3>

      {/* Job Status Banner */}
      <div className={`mb-4 p-2 rounded-md text-center ${
        isCompleted ? 'bg-green-100 text-green-800' :
        isInvoiced ? 'bg-purple-100 text-purple-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        <p className="font-medium">
          {isCompleted ? 'Job Marked as Complete' :
           isInvoiced ? 'Invoice Generated' :
           'Job In Progress'}
        </p>
      </div>

      {/* Labor Hours Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Labor Hours
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="border rounded-md p-2 w-24"
            disabled={isCompleted || isInvoiced || isLoading}
          />
          <button
            onClick={handleHoursUpdate}
            disabled={isCompleted || isInvoiced || isUpdatingHours || isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          >
            {isUpdatingHours ? <Spinner size="sm" /> : 'Update'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Labor Rate: ${laborRate.toFixed(2)}/hour
        </p>
      </div>

      {/* Cost Summary */}
      <div className="bg-gray-50 rounded-md p-3 mb-4">
        <h4 className="font-medium mb-2">Cost Summary</h4>
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-sm">
            <span>Parts Total:</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Labor ({laborHours} hrs @ ${laborRate}/hr):</span>
            <span>${laborCost.toFixed(2)}</span>
          </div>
        </div>
        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
          <span>Grand Total:</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleMarkComplete}
          disabled={!canComplete || isCompleted || isInvoiced || isCompletingJob || isLoading}
          className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300 w-full"
        >
          {isCompletingJob ? (
            <Spinner size="sm" />
          ) : (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              Mark Job as Complete
            </>
          )}
        </button>

        <button
          onClick={handleGenerateInvoice}
          disabled={!isCompleted || isInvoiced || isGeneratingInvoice || isLoading}
          className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-300 w-full"
        >
          {isGeneratingInvoice ? (
            <Spinner size="sm" />
          ) : (
            <>
              <CurrencyDollarIcon className="h-5 w-5" />
              Generate Invoice
            </>
          )}
        </button>
      </div>

      {!canComplete && !isCompleted && !isInvoiced && (
        <p className="text-sm text-yellow-600 mt-3">
          All tasks must be completed and verified before the job can be marked as complete.
        </p>
      )}
    </div>
  );
};

export default CompletionPanel;
