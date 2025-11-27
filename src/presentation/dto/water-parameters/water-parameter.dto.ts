import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWaterParameterDto {
  @ApiProperty({ description: 'ID do tanque' })
  @IsNotEmpty()
  @IsString()
  tankId: string;

  @ApiProperty({ description: 'ID do sistema', required: false })
  @IsOptional()
  @IsString()
  systemId?: string;

  @ApiProperty({ description: 'pH da água' })
  @IsNotEmpty()
  @IsNumber()
  pH: number;

  @ApiProperty({ description: 'Temperatura da água em °C' })
  @IsNotEmpty()
  @IsNumber()
  temperature: number;

  @ApiProperty({ description: 'Nível de amônia em ppm' })
  @IsNotEmpty()
  @IsNumber()
  ammonia: number;

  @ApiProperty({ description: 'Nível de nitrito em ppm' })
  @IsNotEmpty()
  @IsNumber()
  nitrite: number;

  @ApiProperty({ description: 'Nível de nitrato em ppm' })
  @IsNotEmpty()
  @IsNumber()
  nitrate: number;

  @ApiProperty({ description: 'Salinidade', required: false })
  @IsOptional()
  @IsNumber()
  salinity?: number;

  @ApiProperty({ description: 'Data e hora da medição', required: false })
  @IsOptional()
  @IsDateString()
  measuredAt?: string;

  @ApiProperty({ description: 'Observações', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class WaterParameterResponseDto {
  id: string;
  tankId: string;
  systemId?: string;
  pH: number;
  temperature: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  salinity?: number;
  measuredAt: Date;
  userId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
