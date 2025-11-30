import {
  Controller,
  Get,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/guards/roles.guard';
import { Roles } from '../../../infrastructure/decorators/roles.decorator';
import { AuditLogService } from '../../../application/services/audit';
import {
  AuditLogFilterDto,
  PaginatedAuditLogsResponseDto,
  AuditLogUserDto,
  CleanupResponseDto,
} from '../../dto/audit';
import { AuditAction } from '../../../domain/entities/audit';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar logs de auditoria (apenas admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de logs de auditoria',
    type: PaginatedAuditLogsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado (não é admin)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data de início (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim (ISO 8601)' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  @ApiQuery({ name: 'action', required: false, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'] })
  @ApiQuery({ name: 'entityType', required: false, description: 'Tipo de entidade' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página', example: 20 })
  async findAll(
    @Query() filters: AuditLogFilterDto,
  ): Promise<PaginatedAuditLogsResponseDto> {
    const result = await this.auditLogService.findAll({
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
      userId: filters.userId,
      action: filters.action as AuditAction,
      entityType: filters.entityType,
      page: filters.page,
      limit: filters.limit,
    });

    return result;
  }

  @Get('entity-types')
  @Roles('admin')
  @ApiOperation({ summary: 'Listar tipos de entidade distintos (para filtros)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de entidade',
    type: [String],
  })
  async getEntityTypes(): Promise<string[]> {
    return this.auditLogService.getEntityTypes();
  }

  @Get('users')
  @Roles('admin')
  @ApiOperation({ summary: 'Listar usuários que possuem logs (para filtros)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
    type: [AuditLogUserDto],
  })
  async getUsers(): Promise<AuditLogUserDto[]> {
    return this.auditLogService.getUsers();
  }

  @Delete('cleanup')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Remover logs mais antigos que 1 ano (limpeza manual)',
    description: 'Remove todos os logs de auditoria com mais de 365 dias. Esta ação é irreversível.',
  })
  @ApiResponse({
    status: 200,
    description: 'Limpeza realizada com sucesso',
    type: CleanupResponseDto,
  })
  async cleanup(): Promise<CleanupResponseDto> {
    return this.auditLogService.cleanupOldLogs();
  }
}
