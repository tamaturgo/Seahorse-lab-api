import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IUserRepository } from '../../domain/repositories';
import { User } from '../../domain/entities/user';
import { InvalidOperationException, DuplicateEntityException } from '../../domain/exceptions';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const { name, email, password, role } = dto;

    // Verificar se o usuário já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DuplicateEntityException('Usuário', 'email', email);
    }

    // Criar usuário no Supabase Auth usando signUp (funciona com anon key)
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
        // Não enviar email de confirmação - admin já está criando o usuário
        emailRedirectTo: undefined,
      },
    });

    if (authError) {
      throw new InvalidOperationException(authError.message);
    }

    if (!authData.user) {
      throw new InvalidOperationException('Falha ao criar usuário no sistema de autenticação');
    }

    // Criar registro do usuário na tabela users
    const user = await this.userRepository.create({
      name,
      email,
      role,
    });

    return user;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return this.userRepository.update(id, user);
  }

  async deleteUser(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}