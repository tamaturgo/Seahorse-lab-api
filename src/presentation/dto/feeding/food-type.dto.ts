import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFoodTypeDto {
  @ApiProperty({ description: 'Nome do tipo de alimento', example: 'Artêmia Viva' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Código único do alimento', example: 'artemia-viva' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'Unidade de medida', example: 'ml', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Se o tipo está ativo', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFoodTypeDto {
  @ApiProperty({ description: 'Nome do tipo de alimento', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Código único do alimento', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Unidade de medida', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Se o tipo está ativo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class FoodTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
