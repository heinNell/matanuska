export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  details: string;
  changes?: Record<string, any>;
}