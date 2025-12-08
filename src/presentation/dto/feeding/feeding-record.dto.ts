import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedingRecordDto {
  @ApiProperty({ description: 'ID do tanque' })
  @IsNotEmpty()
  @IsString()
  tankId: string;

  @ApiProperty({ description: 'ID do tipo de alimento', required: false })
  @IsOptional()
  @IsString()
  foodTypeId?: string;

  @ApiProperty({ description: 'Tipo de alimento (texto livre se não usar foodTypeId)' })
  @IsOptional()
  @IsString()
  food?: string;

  @ApiProperty({ description: 'Quantidade fornecida' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unidade da quantidade', enum: ['ml', 'g', 'und'], default: 'ml' })
  @IsOptional()
  @IsEnum(['ml', 'g', 'und'])
  unit?: 'ml' | 'g' | 'und';

  @ApiProperty({ description: 'Data e hora da alimentação', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class FeedingRecordResponseDto {
  id: string;
  tankId: string;
  foodTypeId?: string;
  food: string;
  quantity: number;
  unit: 'ml' | 'g' | 'und';
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
