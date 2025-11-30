import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../application/services/audit';
import { AuditAction } from '../../domain/entities/audit';
import { User } from '../../domain/entities/user';

// Rotas que devem ser ignoradas pelo interceptor de auditoria
const IGNORED_ROUTES = [
  '/auth/login',     // Login é registrado manualmente no AuthService
  '/auth/logout',
  '/auth/refresh',
  '/auth/me',
  '/auth/register',  // Registro público (se existir) - não tem usuário logado
  '/audit-logs',     // Não auditar consultas aos próprios logs
];

// Mapeamento de rotas para tipos de entidade mais descritivos
const ROUTE_TO_ENTITY: Record<string, string> = {
  'users': 'user',
  'systems': 'system',
  'tanks': 'tank',
  'feeding-records': 'feeding_record',
  'feeding-schedules': 'feeding_schedule',
  'food-types': 'food_type',
  'water-parameters': 'water_parameter',
  'checklist-tasks': 'checklist_task',
  'task-executions': 'task_execution',
  'daily-checklists': 'daily_checklist',
  'auth': 'auth',
};

// Mapeamento de métodos HTTP para ações de auditoria
const METHOD_TO_ACTION: Record<string, AuditAction> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    @Inject(AuditLogService)
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;

    // Log inicial para debug
    this.logger.debug(`Interceptor called: ${method} ${url}`);

    // Ignorar métodos GET (consultas não são auditadas)
    if (method === 'GET') {
      return next.handle();
    }

    // Verificar se a rota deve ser ignorada
    const shouldIgnore = IGNORED_ROUTES.some((route) => url.includes(route));
    if (shouldIgnore) {
      this.logger.debug(`Route ignored: ${url}`);
      return next.handle();
    }

    // Determinar a ação com base no método HTTP
    const action = METHOD_TO_ACTION[method];
    if (!action) {
      return next.handle();
    }

    // Extrair informações da entidade da URL
    const { entityType, entityId } = this.parseRoute(url);

    // Capturar dados antes da operação (para UPDATE/DELETE)
    const oldValues = method !== 'POST' ? undefined : null;

    // User-Agent e IP
    const userAgent = headers['user-agent'] || null;
    const ipAddress = this.getClientIp(request);

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          // Debug logging
          this.logger.debug(`Audit: ${method} ${url}`);
          this.logger.debug(`User from request: ${JSON.stringify(user ? { id: user.id, email: user.email, name: user.name } : null)}`);
          this.logger.debug(`Parsed route: entityType=${entityType}, entityId=${entityId}`);
          
          // Após sucesso, registrar o log
          this.auditLogService.log({
            user: user as User | undefined,
            action,
            entityType: entityType || undefined,
            entityId: entityId || this.extractEntityIdFromResponse(responseData),
            oldValues: oldValues || undefined,
            newValues: method !== 'DELETE' ? this.sanitizeBody(body) : undefined,
            route: url,
            method,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
          });
        },
        error: () => {
          // Não registrar em caso de erro (a operação não foi concluída)
        },
      }),
    );
  }

  /**
   * Extrai o tipo de entidade e ID da URL
   * Ex: /systems/123 -> { entityType: 'system', entityId: '123' }
   */
  private parseRoute(url: string): { entityType: string | null; entityId: string | null } {
    // Remover query params
    const path = url.split('?')[0];
    
    // Extrair o primeiro segmento da rota (ex: /users/123 -> users)
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      return { entityType: null, entityId: null };
    }

    // Primeiro segmento é o recurso principal
    const resource = segments[0];
    
    // Usar mapeamento conhecido ou singularizar
    let entityType = ROUTE_TO_ENTITY[resource];
    if (!entityType) {
      // Singularizar removendo 's' final
      entityType = resource.endsWith('s') && resource.length > 1 
        ? resource.slice(0, -1) 
        : resource;
      // Converter hífens para underscore
      entityType = entityType.replace(/-/g, '_');
    }

    // Procurar por UUID no segundo segmento
    let entityId: string | null = null;
    if (segments.length > 1) {
      const uuidPattern = /^[0-9a-f-]{36}$/i;
      if (uuidPattern.test(segments[1])) {
        entityId = segments[1];
      }
    }

    return { entityType, entityId };
  }

  /**
   * Extrai o ID da entidade da resposta (para operações CREATE)
   */
  private extractEntityIdFromResponse(response: unknown): string | undefined {
    if (response && typeof response === 'object') {
      const obj = response as Record<string, unknown>;
      if (typeof obj.id === 'string') {
        return obj.id;
      }
    }
    return undefined;
  }

  /**
   * Remove campos sensíveis do body antes de salvar
   */
  private sanitizeBody(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') {
      return undefined;
    }

    const sanitized = { ...body } as Record<string, unknown>;
    
    // Remover campos sensíveis
    const sensitiveFields = ['password', 'senha', 'token', 'secret', 'refresh_token'];
    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Obtém o IP do cliente considerando proxies
   */
  private getClientIp(request: { ip?: string; headers?: Record<string, string> }): string | null {
    const forwarded = request.headers?.['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || null;
  }
}
