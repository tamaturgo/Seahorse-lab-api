import { Injectable, Inject, Logger } from '@nestjs/common';
import type {
  IAuditLogRepository,
  AuditLogFilters,
  PaginatedAuditLogs,
} from '../../../domain/repositories';
import { AuditLog, AuditAction } from '../../../domain/entities/audit';
import { User } from '../../../domain/entities/user';

export interface CreateAuditLogDto {
  user?: User | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  route?: string;
  method?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  // Retenção de 1 ano em dias
  private readonly RETENTION_DAYS = 365;

  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  /**
   * Registra uma ação de auditoria
   */
  async log(dto: CreateAuditLogDto): Promise<AuditLog | null> {
    try {
      const log = await this.auditLogRepository.create({
        userId: dto.user?.id || null,
        userName: dto.user?.name || null,
        userEmail: dto.user?.email || null,
        action: dto.action,
        entityType: dto.entityType || null,
        entityId: dto.entityId || null,
        oldValues: dto.oldValues || null,
        newValues: dto.newValues || null,
        route: dto.route || null,
        method: dto.method || null,
        ipAddress: dto.ipAddress || null,
        userAgent: dto.userAgent || null,
      });

      this.logger.debug(
        `Audit log created: ${dto.action} on ${dto.entityType || 'N/A'} by ${dto.user?.email || 'anonymous'}`,
      );

      return log;
    } catch (error) {
      // Não falhar a requisição original por erro de auditoria
      this.logger.error('Failed to create audit log', error);
      return null;
    }
  }

  /**
   * Busca logs com filtros e paginação
   */
  async findAll(filters?: AuditLogFilters): Promise<PaginatedAuditLogs> {
    return this.auditLogRepository.findAll(filters);
  }

  /**
   * Busca um log específico por ID
   */
  async findById(id: string): Promise<AuditLog | null> {
    return this.auditLogRepository.findById(id);
  }

  /**
   * Busca logs de um usuário específico
   */
  async findByUserId(
    userId: string,
    filters?: AuditLogFilters,
  ): Promise<PaginatedAuditLogs> {
    return this.auditLogRepository.findByUserId(userId, filters);
  }

  /**
   * Busca logs de uma entidade específica
   */
  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.findByEntityId(entityType, entityId);
  }

  /**
   * Remove logs mais antigos que a política de retenção (1 ano)
   * Retorna o número de registros removidos
   */
  async cleanupOldLogs(): Promise<{ deleted: number; message: string }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);

    const deleted = await this.auditLogRepository.deleteOlderThan(cutoffDate);

    this.logger.log(
      `Cleanup completed: ${deleted} audit logs older than ${this.RETENTION_DAYS} days removed`,
    );

    return {
      deleted,
      message: `${deleted} registros de auditoria mais antigos que ${this.RETENTION_DAYS} dias foram removidos.`,
    };
  }

  /**
   * Retorna tipos de entidade distintos para filtros
   */
  async getEntityTypes(): Promise<string[]> {
    return this.auditLogRepository.getDistinctEntityTypes();
  }

  /**
   * Retorna usuários distintos para filtros
   */
  async getUsers(): Promise<{ id: string; name: string; email: string }[]> {
    return this.auditLogRepository.getDistinctUsers();
  }
}
