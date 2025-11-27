import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========== TASK DTOs ==========
export class CreateChecklistTaskDto {
  @ApiProperty({ description: 'Nome da tarefa', example: 'Limpar filtros' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Ordem da tarefa', example: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Se a tarefa está ativa', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateChecklistTaskDto {
  @ApiPropertyOptional({ description: 'Nome da tarefa' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Ordem da tarefa', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Se a tarefa está ativa' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReorderTasksDto {
  @ApiProperty({ description: 'ID da tarefa' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Nova ordem', minimum: 0 })
  @IsNumber()
  @Min(0)
  order: number;
}

// ========== PARAMETER DTOs ==========
export class CreateChecklistParameterDto {
  @ApiProperty({ description: 'Nome do parâmetro', example: 'pH' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Unidade de medida', example: 'pH' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Ordem do parâmetro', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Se o parâmetro está ativo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateChecklistParameterDto {
  @ApiPropertyOptional({ description: 'Nome do parâmetro' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Unidade de medida' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Ordem do parâmetro', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ description: 'Se o parâmetro está ativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReorderParametersDto {
  @ApiProperty({ description: 'ID do parâmetro' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Nova ordem', minimum: 0 })
  @IsNumber()
  @Min(0)
  order: number;
}