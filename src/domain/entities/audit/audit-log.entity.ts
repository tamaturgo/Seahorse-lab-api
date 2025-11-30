// Contexto: Audit/Logging
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';

export class AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: AuditAction;
  entityType: string | null;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  route: string | null;
  method: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
