import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IUserRepository } from '../../domain/repositories';
import { User } from '../../domain/entities/user';
import { RegisterDto, LoginDto, AuthResponseDto } from '../../presentation/dto/auth.dto';
import { 
  DuplicateEntityException, 
  InvalidOperationException, 
  UnauthorizedException 
} from '../../domain/exceptions';
import { AuditLogService } from './audit/audit-log.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject(AuditLogService) private readonly auditLogService: AuditLogService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, role = 'user' } = registerDto;

    // Verificar se o usuário já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DuplicateEntityException('Usuário', 'email', email);
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError) {
      throw new InvalidOperationException(authError.message);
    }

    if (!authData.user) {
      throw new InvalidOperationException('Falha ao criar usuário');
    }

    // Criar registro do usuário na tabela users
    const user = await this.userRepository.create({
      name,
      email,
      role,
    });

    return {
      access_token: authData.session?.access_token || '',
      refresh_token: authData.session?.refresh_token || '',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Autenticar com Supabase
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (!authData.session) {
      throw new UnauthorizedException('Falha na autenticação');
    }

    // Buscar dados do usuário na tabela users
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Registrar log de login
    await this.auditLogService.log({
      user,
      action: 'LOGIN',
      route: '/auth/login',
      method: 'POST',
      ipAddress,
      userAgent,
    });

    return {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const user = await this.userRepository.findByEmail(data.user?.email || '');
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(accessToken: string): Promise<void> {
    await this.supabase.auth.signOut();
  }

  async getCurrentUser(accessToken: string): Promise<User | null> {
    const { data: { user: authUser }, error } = await this.supabase.auth.getUser(accessToken);

    if (error || !authUser) {
      return null;
    }

    return this.userRepository.findByEmail(authUser.email || '');
  }

  async validateUser(accessToken: string): Promise<User | null> {
    return this.getCurrentUser(accessToken);
  }
}
