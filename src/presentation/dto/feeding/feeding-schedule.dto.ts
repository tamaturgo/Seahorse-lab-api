import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedingScheduleDto {
  @ApiProperty({ description: 'ID do tanque' })
  @IsNotEmpty()
  @IsString()
  tankId: string;

  @ApiProperty({ description: 'Intervalo entre alimentações em horas', example: 4 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(24)
  intervalHours: number;

  @ApiProperty({ description: 'Horário de início (HH:MM:SS)', example: '08:00:00' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'Se a programação está ativa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Observações', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateFeedingScheduleDto {
  @ApiProperty({ description: 'Intervalo entre alimentações em horas', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  intervalHours?: number;

  @ApiProperty({ description: 'Horário de início (HH:MM:SS)', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ description: 'Se a programação está ativa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Observações', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDefaultFeedingSettingsDto {
  @ApiProperty({ description: 'Intervalo padrão entre alimentações em horas', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24)
  intervalHours?: number;

  @ApiProperty({ description: 'Horário padrão de início (HH:MM:SS)', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;
}

export class FeedingScheduleResponseDto {
  id: string;
  tankId: string;
  intervalHours: number;
  startTime: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DefaultFeedingSettingsResponseDto {
  id: string;
  intervalHours: number;
  startTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TankNextFeedingResponseDto {
  tankId: string;
  tankName: string;
  lastFeeding: any | null;
  nextFeedingTime: string;
  timeLeft: string;
  feedingIntervalHours: number;
  isOverdue: boolean;
}

export class AllTanksNextFeedingResponseDto {
  tanks: TankNextFeedingResponseDto[];
  defaultSettings: DefaultFeedingSettingsResponseDto | null;
}
