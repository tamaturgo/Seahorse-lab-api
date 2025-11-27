import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Marina Santos', description: 'Nome completo do usuário' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'marina@lab.com', description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha (mínimo 6 caracteres)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'user', enum: ['admin', 'user'], description: 'Papel do usuário no sistema' })
  @IsEnum(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user';
}

export class LoginDto {
  @ApiProperty({ example: 'marina@lab.com', description: 'Email do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Token de acesso JWT' })
  access_token: string;

  @ApiProperty({ description: 'Token de renovação' })
  refresh_token: string;

  @ApiProperty({ description: 'Dados do usuário' })
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token de renovação' })
  @IsString()
  refresh_token: string;
}
