import { Inject, Injectable } from '@nestjs/common';
import { TankDiet } from '../../../domain/entities/feeding';
import type { CreateTankDietInput, TankDietOutput } from '../../dto/feeding';
import type { ITankDietRepository } from '../../../infrastructure/repositories/tank-diet.repository';
import type { IDietRepository } from '../../../infrastructure/repositories/diet.repository';
import { EntityNotFoundException } from '../../../domain/exceptions';

@Injectable()
export class TankDietService {
  constructor(
    @Inject('ITankDietRepository')
    private readonly tankDietRepository: ITankDietRepository,
    @Inject('IDietRepository')
    private readonly dietRepository: IDietRepository,
  ) {}

  async create(input: CreateTankDietInput): Promise<TankDietOutput> {
    // Verificar se a dieta existe
    const diet = await this.dietRepository.findById(input.dietId);
    if (!diet) throw new EntityNotFoundException('Dieta', input.dietId);

    const tankDiet = await this.tankDietRepository.create({
      tankId: input.tankId,
      dietId: input.dietId,
      birthDate: new Date(input.birthDate),
      isActive: true,
    });

    return this.toOutputWithProgress(tankDiet);
  }

  async findById(id: string): Promise<TankDietOutput> {
    const tankDiet = await this.tankDietRepository.findById(id);
    if (!tankDiet) throw new EntityNotFoundException('TankDiet', id);
    return this.toOutputWithProgress(tankDiet);
  }

  async findByTankId(tankId: string): Promise<TankDietOutput[]> {
    const tankDiets = await this.tankDietRepository.findByTankId(tankId);
    return Promise.all(tankDiets.map(td => this.toOutputWithProgress(td)));
  }

  async findActiveByTankId(tankId: string): Promise<TankDietOutput | null> {
    const tankDiet = await this.tankDietRepository.findActiveByTankId(tankId);
    if (!tankDiet) return null;
    return this.toOutputWithProgress(tankDiet);
  }

  async deactivate(id: string): Promise<TankDietOutput> {
    const exists = await this.tankDietRepository.findById(id);
    if (!exists) throw new EntityNotFoundException('TankDiet', id);

    const tankDiet = await this.tankDietRepository.deactivate(id);
    return this.toOutputWithProgress(tankDiet);
  }

  async delete(id: string): Promise<void> {
    const exists = await this.tankDietRepository.findById(id);
    if (!exists) throw new EntityNotFoundException('TankDiet', id);
    await this.tankDietRepository.delete(id);
  }

  private async toOutputWithProgress(tankDiet: TankDiet): Promise<TankDietOutput> {
    const currentDayOfLife = this.calculateDayOfLife(tankDiet.birthDate);
    
    // Buscar itens da dieta que se aplicam ao dia atual
    const diet = await this.dietRepository.findById(tankDiet.dietId);
    const activeDietItems = diet?.items?.filter(item => {
      if (!item.dayRangeStart || !item.dayRangeEnd) return false;
      return currentDayOfLife >= item.dayRangeStart && currentDayOfLife <= item.dayRangeEnd;
    }) || [];

    return {
      id: tankDiet.id,
      tankId: tankDiet.tankId,
      dietId: tankDiet.dietId,
      isActive: tankDiet.isActive,
      birthDate: tankDiet.birthDate,
      startedAt: tankDiet.startedAt,
      endedAt: tankDiet.endedAt ?? null,
      createdAt: tankDiet.createdAt,
      updatedAt: tankDiet.updatedAt,
      currentDayOfLife,
      activeDietItems,
    };
  }

  private calculateDayOfLife(birthDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const birth = new Date(birthDate);
    birth.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
}
