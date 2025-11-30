import { Injectable, Inject } from '@nestjs/common';
import type { IFoodTypeRepository } from '../../../domain/repositories';
import { FoodType } from '../../../domain/entities/feeding';
import { EntityNotFoundException, DuplicateEntityException } from '../../../domain/exceptions';
import type { CreateFoodTypeInput, UpdateFoodTypeInput } from '../../dto/feeding';

@Injectable()
export class FoodTypeService {
  constructor(
    @Inject('IFoodTypeRepository')
    private readonly foodTypeRepository: IFoodTypeRepository,
  ) {}

  async create(dto: CreateFoodTypeInput): Promise<FoodType> {
    // Verificar se já existe um tipo com o mesmo código
    const existing = await this.foodTypeRepository.findByCode(dto.name.toLowerCase().replace(/\s+/g, '_'));
    if (existing) {
      throw new DuplicateEntityException('Tipo de alimento', 'nome', dto.name);
    }

    return this.foodTypeRepository.create({
      name: dto.name,
      code: dto.name.toLowerCase().replace(/\s+/g, '_'),
      unit: dto.unit || 'ml',
      isActive: dto.isActive ?? true,
    });
  }

  async findAll(includeInactive = false): Promise<FoodType[]> {
    return this.foodTypeRepository.findAll(includeInactive);
  }

  async findById(id: string): Promise<FoodType> {
    const foodType = await this.foodTypeRepository.findById(id);
    if (!foodType) {
      throw new EntityNotFoundException('Tipo de alimento', id);
    }
    return foodType;
  }

  async findByCode(code: string): Promise<FoodType> {
    const foodType = await this.foodTypeRepository.findByCode(code);
    if (!foodType) {
      throw new EntityNotFoundException('Tipo de alimento', code);
    }
    return foodType;
  }

  async update(id: string, dto: UpdateFoodTypeInput): Promise<FoodType> {
    // Verificar se existe
    await this.findById(id);

    // Se está atualizando o nome, verificar duplicidade do código
    if (dto.name) {
      const newCode = dto.name.toLowerCase().replace(/\s+/g, '_');
      const existing = await this.foodTypeRepository.findByCode(newCode);
      if (existing && existing.id !== id) {
        throw new DuplicateEntityException('Tipo de alimento', 'nome', dto.name);
      }
    }

    return this.foodTypeRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    // Verificar se existe
    await this.findById(id);
    return this.foodTypeRepository.delete(id);
  }

  async toggleActive(id: string): Promise<FoodType> {
    const foodType = await this.findById(id);
    return this.foodTypeRepository.update(id, { isActive: !foodType.isActive });
  }
}
