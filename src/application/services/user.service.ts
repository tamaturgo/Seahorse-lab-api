import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories';
import { User } from '../../domain/entities/user';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.userRepository.create(user);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return this.userRepository.update(id, user);
  }

  async deleteUser(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}