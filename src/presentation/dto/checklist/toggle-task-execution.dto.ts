import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class ToggleTaskExecutionDto {
  @ApiProperty({ description: 'ID da tarefa' })
  @IsString()
  taskId: string;

  @ApiPropertyOptional({ description: 'Data da execução (ISO 8601) para toggling específico' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Forçar status (true = feito, false = não feito). Se omitido, inverte.' })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({ description: 'Nota ao marcar/desmarcar a tarefa' })
  @IsOptional()
  @IsString()
  notes?: string;
}
