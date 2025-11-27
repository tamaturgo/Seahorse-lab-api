import { IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskExecutionDto {
  @ApiProperty({ description: 'ID da tarefa' })
  @IsString()
  taskId: string;

  @ApiProperty({ description: 'Tarefa completada', default: true })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiProperty({ description: 'Observações', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Data da execução (ISO 8601)', required: false })
  @IsDateString()
  @IsOptional()
  date?: string;
}

export class UpdateTaskExecutionDto {
  @ApiProperty({ description: 'Tarefa completada' })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @ApiProperty({ description: 'Observações', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class TaskExecutionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  taskId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  completed: boolean;

  @ApiProperty({ required: false })
  completedAt?: Date;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
