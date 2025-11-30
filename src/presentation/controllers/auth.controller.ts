import { Controller, Post, Body, Headers, UnauthorizedException, Get, Ip, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto, RefreshTokenDto, AuthResponseDto } from '../dto/auth.dto';
import type { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Email ou senha inválidos' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const userAgent = req.headers['user-agent'];
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress = forwardedFor 
      ? (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0].trim())
      : ip;
    
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado com sucesso',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Fazer logout' })
  @ApiResponse({ status: 200, description: 'Logout realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token não fornecido' })
  async logout(@Headers('authorization') authorization?: string): Promise<{ message: string }> {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authorization.replace('Bearer ', '');
    await this.authService.logout(token);
    
    return { message: 'Logout realizado com sucesso' };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
  async getCurrentUser(@Headers('authorization') authorization?: string) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authorization.replace('Bearer ', '');
    const user = await this.authService.getCurrentUser(token);

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    return user;
  }
}
