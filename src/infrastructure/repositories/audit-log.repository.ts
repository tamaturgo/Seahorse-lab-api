import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  IAuditLogRepository,
  AuditLogFilters,
  PaginatedAuditLogs,
} from '../../domain/repositories';
import { AuditLog } from '../../domain/entities/audit';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  private mapToEntity(data: Record<string, unknown>): AuditLog {
    return {
      id: data.id as string,
      userId: data.user_id as string | null,
      userName: data.user_name as string | null,
      userEmail: data.user_email as string | null,
      action: data.action as AuditLog['action'],
      entityType: data.entity_type as string | null,
      entityId: data.entity_id as string | null,
      oldValues: data.old_values as Record<string, unknown> | null,
      newValues: data.new_values as Record<string, unknown> | null,
      route: data.route as string | null,
      method: data.method as string | null,
      ipAddress: data.ip_address as string | null,
      userAgent: data.user_agent as string | null,
      createdAt: new Date(data.created_at as string),
    };
  }

  private mapToDb(
    log: Omit<AuditLog, 'id' | 'createdAt'>,
  ): Record<string, unknown> {
    return {
      user_id: log.userId,
      user_name: log.userName,
      user_email: log.userEmail,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      old_values: log.oldValues,
      new_values: log.newValues,
      route: log.route,
      method: log.method,
      ip_address: log.ipAddress,
      user_agent: log.userAgent,
    };
  }

  async create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .insert(this.mapToDb(log))
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async findAll(filters?: AuditLogFilters): Promise<PaginatedAuditLogs> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    // Ordenar e paginar
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (data || []).map((item) => this.mapToEntity(item)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string): Promise<AuditLog | null> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapToEntity(data) : null;
  }

  async findByUserId(
    userId: string,
    filters?: AuditLogFilters,
  ): Promise<PaginatedAuditLogs> {
    return this.findAll({ ...filters, userId });
  }

  async findByEntityId(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item) => this.mapToEntity(item));
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', date.toISOString())
      .select('id');

    if (error) throw error;
    return data?.length || 0;
  }

  async getDistinctEntityTypes(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('entity_type')
      .not('entity_type', 'is', null);

    if (error) throw error;

    const types = new Set<string>();
    (data || []).forEach((item) => {
      if (item.entity_type) {
        types.add(item.entity_type);
      }
    });

    return Array.from(types).sort();
  }

  async getDistinctUsers(): Promise<
    { id: string; name: string; email: string }[]
  > {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('user_id, user_name, user_email')
      .not('user_id', 'is', null);

    if (error) throw error;

    const usersMap = new Map<
      string,
      { id: string; name: string; email: string }
    >();
    (data || []).forEach((item) => {
      if (item.user_id && !usersMap.has(item.user_id)) {
        usersMap.set(item.user_id, {
          id: item.user_id,
          name: item.user_name || '',
          email: item.user_email || '',
        });
      }
    });

    return Array.from(usersMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }
}
