import { Injectable, Inject } from '@nestjs/common';
import type { ISystemRepository } from '../../../domain/repositories';
import { System } from '../../../domain/entities/systems';
import { EntityNotFoundException } from '../../../domain/exceptions';
import type { CreateSystemInput, UpdateSystemInput } from '../../dto/systems';

@Injectable()
export class SystemService {
  constructor(
    @Inject('ISystemRepository')
    private readonly systemRepository: ISystemRepository,
  ) {}

  async findAll(): Promise<System[]> {
    return this.systemRepository.findAll();
  }

  async findById(id: string): Promise<System> {
    const system = await this.systemRepository.findById(id);
    if (!system) {
      throw new EntityNotFoundException('System', id);
    }
    return system;
  }

  async create(input: CreateSystemInput): Promise<System> {
    return this.systemRepository.create(input);
  }

  async update(id: string, input: UpdateSystemInput): Promise<System> {
    await this.findById(id); // Verifica se existe
    return this.systemRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Verifica se existe
    await this.systemRepository.delete(id);
  }
}
