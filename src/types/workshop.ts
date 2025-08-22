export interface JobCard {
  id: string;
  workOrderNumber: string;
  vehicleId: string;
  fleetNumber: string;
  customerName: string;
  title: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  createdAt: string;
  createdDate: string;
  dueDate: string;
  workDescription: string;
  estimatedHours: number;
  actualHours: number;
  partsRequired: Array<{
    partId: string;
    quantity: number;
    cost: number;
  }>;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes: string;
  attachments: string[];
  serviceType: 'maintenance' | 'repair' | 'inspection';
  mileage: number;
  location: string;
  department: string;
  completionDate: string | null;
  completedBy: string | null;
  invoiceNumber: string | null;
  paymentStatus: 'pending' | 'completed' | 'cancelled';
  warrantyInfo: string | null;
  quality: {
    checkedBy: string | null;
    checkDate: string | null;
    passed: boolean;
    comments: string;
  };
  tasks: Array<{
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}
