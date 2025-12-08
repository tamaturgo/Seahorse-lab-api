import { IsNotEmpty, IsArray, IsString, IsOptional, IsBoolean, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedingScheduleDto {
  @ApiProperty({ description: 'ID do tanque' })
  @IsNotEmpty()
  @IsString()
  tankId: string;

  @ApiProperty({ 
    description: 'Horários fixos de alimentação (HH:MM)', 
    example: ['08:00', '12:00', '16:00', '20:00'],
    type: [String]
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'Pelo menos um horário deve ser definido' })
  @IsString({ each: true })
  feedingTimes: string[];

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
  @ApiProperty({ 
    description: 'Horários fixos de alimentação (HH:MM)', 
    required: false,
    example: ['08:00', '12:00', '16:00', '20:00'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Pelo menos um horário deve ser definido' })
  @IsString({ each: true })
  feedingTimes?: string[];

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
  @ApiProperty({ 
    description: 'Horários padrão de alimentação (HH:MM)', 
    required: false,
    example: ['08:00', '12:00', '16:00', '20:00'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Pelo menos um horário deve ser definido' })
  @IsString({ each: true })
  feedingTimes?: string[];
}

export class FeedingScheduleResponseDto {
  id: string;
  tankId: string;
  feedingTimes: string[];
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DefaultFeedingSettingsResponseDto {
  id: string;
  feedingTimes: string[];
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
  feedingTimes: string[];
  isOverdue: boolean;
}

export class AllTanksNextFeedingResponseDto {
  tanks: TankNextFeedingResponseDto[];
  defaultSettings: DefaultFeedingSettingsResponseDto | null;
}
