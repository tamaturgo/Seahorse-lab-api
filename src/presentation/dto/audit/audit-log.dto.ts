import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';

export class AuditLogFilterDto {
  @ApiPropertyOptional({
    description: 'Data de início do período de busca',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data de fim do período de busca',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário para filtrar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Tipo de ação para filtrar',
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'],
  })
  @IsOptional()
  @IsEnum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN'])
  action?: AuditActionType;

  @ApiPropertyOptional({
    description: 'Tipo de entidade para filtrar',
    example: 'system',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Número da página (começa em 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'ID único do log',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'ID do usuário que realizou a ação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string | null;

  @ApiPropertyOptional({
    description: 'Nome do usuário que realizou a ação',
    example: 'João Silva',
  })
  userName: string | null;

  @ApiPropertyOptional({
    description: 'Email do usuário que realizou a ação',
    example: 'joao@example.com',
  })
  userEmail: string | null;

  @ApiProperty({
    description: 'Tipo de ação realizada',
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'],
    example: 'CREATE',
  })
  action: AuditActionType;

  @ApiPropertyOptional({
    description: 'Tipo de entidade afetada',
    example: 'system',
  })
  entityType: string | null;

  @ApiPropertyOptional({
    description: 'ID da entidade afetada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  entityId: string | null;

  @ApiPropertyOptional({
    description: 'Valores anteriores (para UPDATE e DELETE)',
    example: { name: 'Sistema Antigo' },
  })
  oldValues: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Novos valores (para CREATE e UPDATE)',
    example: { name: 'Sistema Novo' },
  })
  newValues: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Rota da requisição',
    example: '/systems/123',
  })
  route: string | null;

  @ApiPropertyOptional({
    description: 'Método HTTP da requisição',
    example: 'POST',
  })
  method: string | null;

  @ApiPropertyOptional({
    description: 'Endereço IP do cliente',
    example: '192.168.1.1',
  })
  ipAddress: string | null;

  @ApiPropertyOptional({
    description: 'User-Agent do cliente',
    example: 'Mozilla/5.0...',
  })
  userAgent: string | null;

  @ApiProperty({
    description: 'Data e hora da ação',
    example: '2025-11-30T10:30:00.000Z',
  })
  createdAt: Date;
}

export class PaginatedAuditLogsResponseDto {
  @ApiProperty({
    description: 'Lista de logs de auditoria',
    type: [AuditLogResponseDto],
  })
  data: AuditLogResponseDto[];

  @ApiProperty({
    description: 'Total de registros',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Itens por página',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 5,
  })
  totalPages: number;
}

export class AuditLogUserDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@example.com',
  })
  email: string;
}

export class CleanupResponseDto {
  @ApiProperty({
    description: 'Número de registros removidos',
    example: 150,
  })
  deleted: number;

  @ApiProperty({
    description: 'Mensagem de resultado',
    example: '150 registros de auditoria mais antigos que 365 dias foram removidos.',
  })
  message: string;
}
