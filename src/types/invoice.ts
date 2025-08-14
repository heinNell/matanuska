import { SupportedCurrency } from '../lib/currency';

// Invoice-specific interfaces for enhanced trip management
export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceDueDate: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentAmount?: number;
  paymentReceivedDate?: string;
  paymentNotes?: string;
  paymentMethod?: 'bank_transfer' | 'cash' | 'cheque' | 'credit_card' | 'other';
  bankReference?: string;
  lastFollowUpDate?: string;
  followUpHistory?: FollowUpRecord[];
}

export interface FollowUpRecord {
  id: string;
  tripId: string;
  followUpDate: string;
  contactMethod: 'call' | 'email' | 'whatsapp' | 'in_person' | 'sms';
  responsibleStaff: string;
  responseSummary: string;
  nextFollowUpDate?: string;
  status: 'pending' | 'completed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  outcome: 'no_response' | 'promised_payment' | 'dispute' | 'payment_received' | 'partial_payment';
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceAging {
  tripId: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: SupportedCurrency;
  agingDays: number;
  status: 'current' | 'warning' | 'critical' | 'overdue';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  lastFollowUp?: string;
}

// Aging thresholds by currency
export const AGING_THRESHOLDS = {
  ZAR: {
    warning: { min: 21, max: 29 },
    critical: { min: 30, max: 30 },
    overdue: { min: 31 }
  },
  USD: {
    warning: { min: 11, max: 13 },
    critical: { min: 14, max: 14 },
    overdue: { min: 15 }
  },
  EUR: {
    warning: { min: 11, max: 13 },
    critical: { min: 14, max: 14 },
    overdue: { min: 15 }
  },
  GBP: {
    warning: { min: 11, max: 13 },
    critical: { min: 14, max: 14 },
    overdue: { min: 15 }
  },
  AUD: {
    warning: { min: 11, max: 13 },
    critical: { min: 14, max: 14 },
    overdue: { min: 15 }
  },
  CAD: {
    warning: { min: 11, max: 13 },
    critical: { min: 14, max: 14 },
    overdue: { min: 15 }
  }
} as const;

// Follow-up thresholds by currency (when to trigger alerts)
export const FOLLOW_UP_THRESHOLDS = {
  ZAR: 30,
  USD: 14,
  EUR: 14,
  GBP: 14,
  AUD: 14,
  CAD: 14
} as const;

export interface PaymentUpdateData {
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentAmount?: number;
  paymentReceivedDate?: string;
  paymentNotes?: string;
  paymentMethod?: 'bank_transfer' | 'cash' | 'cheque' | 'credit_card' | 'other';
  bankReference?: string;
}

export interface FollowUpData {
  followUpDate: string;
  contactMethod: 'call' | 'email' | 'whatsapp' | 'in_person' | 'sms';
  responsibleStaff: string;
  responseSummary: string;
  nextFollowUpDate?: string;
  status: 'pending' | 'completed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  outcome: 'no_response' | 'promised_payment' | 'dispute' | 'payment_received' | 'partial_payment';
}
