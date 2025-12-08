import { Inject, Injectable } from '@nestjs/common';
import { Diet, DietItem } from '../../../domain/entities/feeding';
import type {
  CreateDietInput,
  UpdateDietInput,
  DietOutput,
  DietItemOutput,
} from '../../dto/feeding';
import type { IDietRepository } from '../../../infrastructure/repositories/diet.repository';
import { EntityNotFoundException } from '../../../domain/exceptions';

@Injectable()
export class DietService {
  constructor(
    @Inject('IDietRepository')
    private readonly dietRepository: IDietRepository,
  ) {}

  async create(input: CreateDietInput): Promise<DietOutput> {
    const diet = await this.dietRepository.create(
      {
        tankId: null, // Templates não têm tankId
        name: input.name,
        phase: input.phase,
        isActive: false, // ativação controlada separadamente
        notes: input.notes,
      },
      input.items,
    );

    const finalDiet = input.isActive ? await this.dietRepository.setActive(diet.id) : diet;
    return this.toOutput(finalDiet);
  }

  async update(id: string, input: UpdateDietInput): Promise<DietOutput> {
    const exists = await this.dietRepository.findById(id);
    if (!exists) throw new EntityNotFoundException('Dieta', id);

    const updated = await this.dietRepository.update(id, {
      name: input.name,
      phase: input.phase,
      isActive: input.isActive,
      notes: input.notes,
    }, input.items);

    let finalDiet = updated;
    if (input.isActive === true) {
      finalDiet = await this.dietRepository.setActive(id);
    } else if (input.isActive === false) {
      finalDiet = await this.dietRepository.deactivate(id);
    }

    return this.toOutput(finalDiet);
  }

  async findById(id: string): Promise<DietOutput> {
    const diet = await this.dietRepository.findById(id);
    if (!diet) throw new EntityNotFoundException('Dieta', id);
    return this.toOutput(diet);
  }

  async findAll(): Promise<DietOutput[]> {
    const diets = await this.dietRepository.findAll();
    return diets.map(this.toOutput);
  }

  async findByTankId(tankId: string): Promise<DietOutput[]> {
    const diets = await this.dietRepository.findByTankId(tankId);
    return diets.map(this.toOutput);
  }

  async findActiveByTankId(tankId: string): Promise<DietOutput | null> {
    const diet = await this.dietRepository.findActiveByTankId(tankId);
    return diet ? this.toOutput(diet) : null;
  }

  async activate(dietId: string): Promise<DietOutput> {
    const diet = await this.dietRepository.setActive(dietId);
    return this.toOutput(diet);
  }

  async deactivate(dietId: string): Promise<DietOutput> {
    const diet = await this.dietRepository.deactivate(dietId);
    return this.toOutput(diet);
  }

  async delete(dietId: string): Promise<void> {
    const exists = await this.dietRepository.findById(dietId);
    if (!exists) throw new EntityNotFoundException('Dieta', dietId);
    await this.dietRepository.delete(dietId);
  }

  private toOutput = (diet: Diet): DietOutput => ({
    id: diet.id,
    tankId: diet.tankId,
    name: diet.name,
    phase: diet.phase,
    isActive: diet.isActive,
    startedAt: diet.startedAt ?? null,
    endedAt: diet.endedAt ?? null,
    notes: diet.notes,
    items: (diet.items ?? []).map(this.toItemOutput),
    createdAt: diet.createdAt,
    updatedAt: diet.updatedAt,
  });

  private toItemOutput = (item: DietItem): DietItemOutput => ({
    id: item.id,
    dietId: item.dietId,
    foodTypeId: item.foodTypeId,
    quantity: item.quantity,
    dayRangeStart: item.dayRangeStart,
    dayRangeEnd: item.dayRangeEnd,
    sortOrder: item.sortOrder,
    notes: item.notes,
    foodType: item.foodType,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });
}
