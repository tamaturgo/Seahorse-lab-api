import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { ITankRepository, ISystemRepository } from '../../../domain/repositories';
import { Tank } from '../../../domain/entities/systems';
import { CreateTankDto, UpdateTankDto } from '../../../presentation/dto/systems';

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
      throw new NotFoundException(`Tank with ID ${id} not found`);
    }
    return tank;
  }

  async findBySystemId(systemId: string): Promise<Tank[]> {
    return this.tankRepository.findBySystemId(systemId);
  }

  async create(createTankDto: CreateTankDto): Promise<Tank> {
    // Verifica se o sistema existe
    const system = await this.systemRepository.findById(createTankDto.systemId);
    if (!system) {
      throw new NotFoundException(`System with ID ${createTankDto.systemId} not found`);
    }
    
    const tankData = {
      name: createTankDto.name,
      systemId: createTankDto.systemId,
      capacity: createTankDto.capacity,
      animals: createTankDto.animals,
      species: createTankDto.species || '',
      status: createTankDto.status || 'active' as const,
      observations: createTankDto.observations,
    };
    
    return this.tankRepository.create(tankData);
  }

  async update(id: string, updateTankDto: UpdateTankDto): Promise<Tank> {
    await this.findById(id); // Verifica se existe
    
    // Se está alterando o sistema, verifica se o novo sistema existe
    if (updateTankDto.systemId) {
      const system = await this.systemRepository.findById(updateTankDto.systemId);
      if (!system) {
        throw new NotFoundException(`System with ID ${updateTankDto.systemId} not found`);
      }
    }
    
    return this.tankRepository.update(id, updateTankDto);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Verifica se existe
    await this.tankRepository.delete(id);
  }
}
