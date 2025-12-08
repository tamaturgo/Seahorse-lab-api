import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { DietPhase } from '../../../domain/entities/feeding';

export class DietItemDto {
  @ApiProperty({ description: 'ID do tipo de alimento' })
  @IsString()
  @IsNotEmpty()
  foodTypeId: string;

  @ApiProperty({ description: 'Quantidade do alimento' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Início do período (dias de vida)', example: 1 })
  @IsOptional()
  @IsNumber()
  dayRangeStart?: number;

  @ApiProperty({ description: 'Fim do período (dias de vida)', example: 7 })
  @IsOptional()
  @IsNumber()
  dayRangeEnd?: number;

  @ApiProperty({ description: 'Ordem do item na dieta', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: 'Notas do item', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateDietDto {
  @ApiProperty({ description: 'Nome da dieta' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Fase da dieta', enum: ['juvenil', 'jovem', 'adulto'] })
  @IsEnum(['juvenil', 'jovem', 'adulto'])
  phase: DietPhase;

  @ApiProperty({ description: 'Ativar imediatamente', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Notas gerais da dieta', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [DietItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DietItemDto)
  items: DietItemDto[];
}

export class UpdateDietDto {
  @ApiProperty({ description: 'Nome da dieta', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Fase da dieta', enum: ['juvenil', 'jovem', 'adulto'], required: false })
  @IsOptional()
  @IsEnum(['juvenil', 'jovem', 'adulto'])
  phase?: DietPhase;

  @ApiProperty({ description: 'Ativa ou inativa a dieta', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Notas gerais da dieta', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [DietItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DietItemDto)
  items?: DietItemDto[];
}

export class DietItemResponseDto extends DietItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dietId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class DietResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false, nullable: true })
  tankId: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['juvenil', 'jovem', 'adulto'] })
  phase: DietPhase;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  startedAt?: Date | null;

  @ApiProperty({ required: false })
  endedAt?: Date | null;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ type: [DietItemResponseDto] })
  items: DietItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
