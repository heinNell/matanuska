/**
 * Trip Workflow Configuration
 * Defines the complete trip lifecycle from creation to reporting
 */

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  component: string;
  order: number;
  required: boolean;
  validation?: (data: any) => boolean;
  nextStepCondition?: (data: any) => boolean;
}

export interface TripWorkflowConfig {
  steps: WorkflowStep[];
  systemRates: {
    perKmRepair: number;
    perKmTyre: number;
    perDayGIT: number;
    fuelRate: number;
    driverRate: number;
  };
  flagThresholds: {
    costVariance: number; // Percentage
    timeVariance: number; // Hours
    fuelConsumption: number; // L/100km
  };
  approvalLimits: {
    managerApproval: number;
    directorApproval: number;
  };
}

export const defaultTripWorkflowConfig: TripWorkflowConfig = {
  steps: [
    {
      id: 'create-trip',
      name: 'Create Trip',
      description: 'Create new trip with basic information',
      component: 'TripForm',
      order: 1,
      required: true,
      validation: (data) => Boolean(data.clientId && data.route && data.driverId),
    },
    {
      id: 'add-costs',
      name: 'Add Costs',
      description: 'Add manual costs and expenses for the trip',
      component: 'CostEntryForm',
      order: 2,
      required: false,
    },
    {
      id: 'generate-system-costs',
      name: 'Generate System Costs',
      description: 'Auto-calculate system costs based on distance, time, and rates',
      component: 'SystemCostGenerator',
      order: 3,
      required: true,
      validation: (data) => Boolean(data.distance && data.duration),
    },
    {
      id: 'resolve-flags',
      name: 'Resolve Flags',
      description: 'Investigate and resolve any flagged costs or issues',
      component: 'FlagInvestigationPanel',
      order: 4,
      required: true,
      nextStepCondition: (data) => data.costs.every((c: any) => !c.isFlagged),
    },
    {
      id: 'complete-trip',
      name: 'Complete Trip',
      description: 'Mark trip as completed and finalize all information',
      component: 'TripCompletionPanel',
      order: 5,
      required: true,
      validation: (data) => Boolean(data.proofOfDelivery),
    },
    {
      id: 'submit-invoice',
      name: 'Submit Invoice',
      description: 'Generate and submit invoice to client',
      component: 'TripInvoicingPanel',
      order: 6,
      required: true,
      validation: (data) => Boolean(data.invoiceNumber),
    },
    {
      id: 'track-payment',
      name: 'Track Payment',
      description: 'Monitor payment status and follow up',
      component: 'PaymentTrackingPanel',
      order: 7,
      required: false,
    },
    {
      id: 'reporting',
      name: 'Reporting',
      description: 'Generate reports and analytics',
      component: 'ReportingPanel',
      order: 8,
      required: false,
    },
  ],
  systemRates: {
    perKmRepair: 2.1,
    perKmTyre: 1.5,
    perDayGIT: 100,
    fuelRate: 23.50, // Per liter
    driverRate: 350, // Per day
  },
  flagThresholds: {
    costVariance: 15, // 15% variance threshold
    timeVariance: 2, // 2 hours variance threshold
    fuelConsumption: 50, // 50L/100km threshold
  },
  approvalLimits: {
    managerApproval: 10000, // R10,000
    directorApproval: 50000, // R50,000
  },
};

export const getWorkflowStep = (stepId: string): WorkflowStep | undefined => {
  return defaultTripWorkflowConfig.steps.find(step => step.id === stepId);
};

export const getNextStep = (currentStepId: string): WorkflowStep | undefined => {
  const currentStep = getWorkflowStep(currentStepId);
  if (!currentStep) return undefined;
  
  return defaultTripWorkflowConfig.steps.find(step => step.order === currentStep.order + 1);
};

export const getPreviousStep = (currentStepId: string): WorkflowStep | undefined => {
  const currentStep = getWorkflowStep(currentStepId);
  if (!currentStep) return undefined;
  
  return defaultTripWorkflowConfig.steps.find(step => step.order === currentStep.order - 1);
};

export const canProceedToNextStep = (stepId: string, data: any): boolean => {
  const step = getWorkflowStep(stepId);
  if (!step) return false;
  
  // Check validation if exists
  if (step.validation && !step.validation(data)) {
    return false;
  }
  
  // Check next step condition if exists
  if (step.nextStepCondition && !step.nextStepCondition(data)) {
    return false;
  }
  
  return true;
};
