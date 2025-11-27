import { Controller, Post, Body, Headers, UnauthorizedException, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, AuthResponseDto } from '../dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuário criado com sucesso',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 409, description: 'Email já está em uso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Email ou senha inválidos' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
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
