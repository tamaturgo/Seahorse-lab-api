import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogController } from '../presentation/controllers/audit';
import { AuditLogService } from '../application/services/audit';
import { AuditLogRepository } from '../infrastructure/repositories/audit-log.repository';
import { AuditInterceptor } from '../infrastructure/interceptors/audit.interceptor';
import { AuthModule } from './auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    {
      provide: 'IAuditLogRepository',
      useClass: AuditLogRepository,
    },
    AuditInterceptor,
    // Registrar o interceptor globalmente usando a mesma instância
    {
      provide: APP_INTERCEPTOR,
      useExisting: AuditInterceptor,
    },
  ],
  exports: [AuditLogService, AuditInterceptor],
})
export class AuditModule {}
