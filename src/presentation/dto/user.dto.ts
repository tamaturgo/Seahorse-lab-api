import { IsString, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@lab.com', description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'user', enum: ['admin', 'user'], description: 'Papel do usuário no sistema' })
  @IsEnum(['admin', 'user'])
  role: 'admin' | 'user';
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'joao@lab.com', description: 'Email do usuário' })
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'user', enum: ['admin', 'user'], description: 'Papel do usuário no sistema' })
  @IsEnum(['admin', 'user'])
  role?: 'admin' | 'user';
}