import { Injectable, Inject } from '@nestjs/common';
import type { ITankRepository, ISystemRepository } from '../../../domain/repositories';
import { Tank } from '../../../domain/entities/systems';
import { EntityNotFoundException } from '../../../domain/exceptions';
import type { CreateTankInput, UpdateTankInput } from '../../dto/systems';

@Injectable()
export class TankService {
  constructor(
    @Inject('ITankRepository')
    private readonly tankRepository: ITankRepository,
    @Inject('ISystemRepository')
    private readonly systemRepository: ISystemRepository,
  ) {}

  async findAll(): Promise<Tank[]> {
    return this.tankRepository.findAll();
  }

  async findById(id: string): Promise<Tank> {
    const tank = await this.tankRepository.findById(id);
    if (!tank) {
      throw new EntityNotFoundException('Tank', id);
    }
    return tank;
  }

  async findBySystemId(systemId: string): Promise<Tank[]> {
    return this.tankRepository.findBySystemId(systemId);
  }

  async create(input: CreateTankInput): Promise<Tank> {
    // Verifica se o sistema existe
    const system = await this.systemRepository.findById(input.systemId);
    if (!system) {
      throw new EntityNotFoundException('System', input.systemId);
    }
    
    const tankData = {
      name: input.name,
      systemId: input.systemId,
      capacity: input.capacity ?? 0,
      animals: input.animals ?? 0,
      species: input.species || '',
      status: input.status || 'active' as const,
      observations: input.observations,
    };
    
    return this.tankRepository.create(tankData);
  }

  async update(id: string, input: UpdateTankInput): Promise<Tank> {
    await this.findById(id); // Verifica se existe
    
    // Se está alterando o sistema, verifica se o novo sistema existe
    if (input.systemId) {
      const system = await this.systemRepository.findById(input.systemId);
      if (!system) {
        throw new EntityNotFoundException('System', input.systemId);
      }
    }
    
    // Converter para Partial<Tank> compatível
    const updateData: Partial<Tank> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.systemId !== undefined) updateData.systemId = input.systemId;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.animals !== undefined) updateData.animals = input.animals;
    if (input.species !== undefined) updateData.species = input.species;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.observations !== undefined) updateData.observations = input.observations;
    
    return this.tankRepository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Verifica se existe
    await this.tankRepository.delete(id);
  }
}
