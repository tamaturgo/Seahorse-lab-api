import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedingRecordDto {
  @ApiProperty({ description: 'ID do tanque' })
  @IsNotEmpty()
  @IsString()
  tankId: string;

  @ApiProperty({ description: 'Tipo de alimento' })
  @IsNotEmpty()
  @IsString()
  food: string;

  @ApiProperty({ description: 'Quantidade fornecida' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Data e hora da alimentação', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class FeedingRecordResponseDto {
  id: string;
  tankId: string;
  food: string;
  quantity: number;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
