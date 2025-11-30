import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { FoodType } from '../../domain/entities/feeding';
import type { IFoodTypeRepository } from '../../domain/repositories';

@Injectable()
export class FoodTypeRepository implements IFoodTypeRepository {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async create(foodType: Partial<FoodType>): Promise<FoodType> {
    const { data, error } = await this.supabase
      .from('food_types')
      .insert({
        name: foodType.name,
        code: foodType.code,
        unit: foodType.unit || 'ml',
        is_active: foodType.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar tipo de alimento: ${error.message}`);

    return this.mapToEntity(data);
  }

  async findAll(includeInactive = false): Promise<FoodType[]> {
    let query = this.supabase.from('food_types').select('*');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw new Error(`Erro ao buscar tipos de alimento: ${error.message}`);

    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<FoodType | null> {
    const { data, error } = await this.supabase
      .from('food_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar tipo de alimento: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByCode(code: string): Promise<FoodType | null> {
    const { data, error } = await this.supabase
      .from('food_types')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar tipo de alimento: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, foodType: Partial<FoodType>): Promise<FoodType> {
    const updateData: any = {};
    if (foodType.name !== undefined) updateData.name = foodType.name;
    if (foodType.code !== undefined) updateData.code = foodType.code;
    if (foodType.unit !== undefined) updateData.unit = foodType.unit;
    if (foodType.isActive !== undefined) updateData.is_active = foodType.isActive;

    const { data, error } = await this.supabase
      .from('food_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar tipo de alimento: ${error.message}`);

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('food_types')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar tipo de alimento: ${error.message}`);
  }

  private mapToEntity(data: any): FoodType {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      unit: data.unit,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
