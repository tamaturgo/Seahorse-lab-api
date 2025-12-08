import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Diet, DietItem, DietPhase } from '../../domain/entities/feeding';

export interface IDietRepository {
  create(diet: Partial<Diet>, items: Partial<DietItem>[]): Promise<Diet>;
  update(id: string, diet: Partial<Diet>, items?: Partial<DietItem>[]): Promise<Diet>;
  findById(id: string): Promise<Diet | null>;
  findAll(): Promise<Diet[]>;
  findByTankId(tankId: string): Promise<Diet[]>;
  findActiveByTankId(tankId: string): Promise<Diet | null>;
  setActive(dietId: string): Promise<Diet>;
  deactivate(dietId: string): Promise<Diet>;
  delete(dietId: string): Promise<void>;
}

@Injectable()
export class DietRepository implements IDietRepository {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async create(diet: Partial<Diet>, items: Partial<DietItem>[]): Promise<Diet> {
    const { data, error } = await this.supabase
      .from('diets')
      .insert({
        tank_id: diet.tankId,
        name: diet.name,
        phase: diet.phase as DietPhase,
        is_active: diet.isActive ?? false,
        started_at: diet.startedAt ?? null,
        ended_at: diet.endedAt ?? null,
        notes: diet.notes ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar dieta: ${error.message}`);

    const createdDiet = this.mapDiet(data);

    if (items?.length) {
      await this.insertItems(createdDiet.id, items);
      createdDiet.items = await this.fetchItems([createdDiet.id]);
    } else {
      createdDiet.items = [];
    }

    return createdDiet;
  }

  async update(id: string, diet: Partial<Diet>, items?: Partial<DietItem>[]): Promise<Diet> {
    const updateData: Record<string, any> = {};
    if (diet.name !== undefined) updateData.name = diet.name;
    if (diet.phase !== undefined) updateData.phase = diet.phase;
    if (diet.isActive !== undefined) updateData.is_active = diet.isActive;
    if (diet.startedAt !== undefined) updateData.started_at = diet.startedAt;
    if (diet.endedAt !== undefined) updateData.ended_at = diet.endedAt;
    if (diet.notes !== undefined) updateData.notes = diet.notes;

    const { data, error } = await this.supabase
      .from('diets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar dieta: ${error.message}`);

    const updatedDiet = this.mapDiet(data);

    if (items) {
      // substituir itens
      const deleteResult = await this.supabase.from('diet_items').delete().eq('diet_id', id);
      if (deleteResult.error) throw new Error(`Erro ao limpar itens da dieta: ${deleteResult.error.message}`);
      if (items.length) {
        await this.insertItems(id, items);
      }
    }

    updatedDiet.items = await this.fetchItems([id]);
    return updatedDiet;
  }

  async findById(id: string): Promise<Diet | null> {
    const { data, error } = await this.supabase
      .from('diets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar dieta: ${error.message}`);
    }

    const diet = this.mapDiet(data);
    diet.items = await this.fetchItems([diet.id]);
    return diet;
  }

  async findAll(): Promise<Diet[]> {
    const { data, error } = await this.supabase
      .from('diets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro ao buscar todas as dietas: ${error.message}`);

    const diets = (data || []).map(this.mapDiet);
    const items = await this.fetchItems(diets.map((d) => d.id));
    const itemsByDiet = this.groupItemsByDiet(items);

    return diets.map((d) => ({ ...d, items: itemsByDiet[d.id] ?? [] }));
  }

  async findByTankId(tankId: string): Promise<Diet[]> {
    const { data, error } = await this.supabase
      .from('diets')
      .select('*')
      .eq('tank_id', tankId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erro ao buscar dietas do tanque: ${error.message}`);

    const diets = (data || []).map(this.mapDiet);
    const items = await this.fetchItems(diets.map((d) => d.id));
    const itemsByDiet = this.groupItemsByDiet(items);

    return diets.map((d) => ({ ...d, items: itemsByDiet[d.id] ?? [] }));
  }

  async findActiveByTankId(tankId: string): Promise<Diet | null> {
    const { data, error } = await this.supabase
      .from('diets')
      .select('*')
      .eq('tank_id', tankId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar dieta ativa: ${error.message}`);
    }

    const diet = this.mapDiet(data);
    diet.items = await this.fetchItems([diet.id]);
    return diet;
  }

  async setActive(dietId: string): Promise<Diet> {
    const diet = await this.findById(dietId);
    if (!diet) throw new Error('Dieta não encontrada');

    // Desativar outras dietas do tanque
    const deactivateResult = await this.supabase
      .from('diets')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('tank_id', diet.tankId)
      .neq('id', dietId);

    if (deactivateResult.error) throw new Error(`Erro ao desativar dietas anteriores: ${deactivateResult.error.message}`);

    // Ativar a dieta solicitada
    const { data, error } = await this.supabase
      .from('diets')
      .update({ is_active: true, started_at: diet.startedAt ?? new Date().toISOString(), ended_at: null })
      .eq('id', dietId)
      .select()
      .single();

    if (error) throw new Error(`Erro ao ativar dieta: ${error.message}`);

    const activeDiet = this.mapDiet(data);
    activeDiet.items = await this.fetchItems([dietId]);
    return activeDiet;
  }

  async deactivate(dietId: string): Promise<Diet> {
    const { data, error } = await this.supabase
      .from('diets')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('id', dietId)
      .select()
      .single();

    if (error) throw new Error(`Erro ao desativar dieta: ${error.message}`);

    const diet = this.mapDiet(data);
    diet.items = await this.fetchItems([dietId]);
    return diet;
  }

  async delete(dietId: string): Promise<void> {
    const { error } = await this.supabase.from('diets').delete().eq('id', dietId);
    if (error) throw new Error(`Erro ao deletar dieta: ${error.message}`);
  }

  // ========== Helpers ========== 

  private async insertItems(dietId: string, items: Partial<DietItem>[]): Promise<void> {
    const payload = items.map((item, index) => ({
      diet_id: dietId,
      food_type_id: item.foodTypeId,
      quantity: item.quantity,
      day_range_start: item.dayRangeStart ?? null,
      day_range_end: item.dayRangeEnd ?? null,
      sort_order: item.sortOrder ?? index,
      notes: item.notes ?? null,
    }));

    const { error } = await this.supabase.from('diet_items').insert(payload);
    if (error) throw new Error(`Erro ao inserir itens da dieta: ${error.message}`);
  }

  private async fetchItems(dietIds: string[]): Promise<DietItem[]> {
    if (!dietIds.length) return [];

    const { data, error } = await this.supabase
      .from('diet_items')
      .select(`
        *,
        food_types (
          id,
          name,
          unit
        )
      `)
      .in('diet_id', dietIds)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`Erro ao buscar itens da dieta: ${error.message}`);

    return (data || []).map(this.mapDietItem);
  }

  private groupItemsByDiet(items: DietItem[]): Record<string, DietItem[]> {
    return items.reduce<Record<string, DietItem[]>>((acc, item) => {
      if (!acc[item.dietId]) acc[item.dietId] = [];
      acc[item.dietId].push(item);
      return acc;
    }, {});
  }

  private mapDiet = (row: any): Diet => ({
    id: row.id,
    tankId: row.tank_id,
    name: row.name,
    phase: row.phase,
    isActive: row.is_active,
    startedAt: row.started_at ? new Date(row.started_at) : null,
    endedAt: row.ended_at ? new Date(row.ended_at) : null,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private mapDietItem = (row: any): DietItem => ({
    id: row.id,
    dietId: row.diet_id,
    foodTypeId: row.food_type_id,
    quantity: Number(row.quantity),
    dayRangeStart: row.day_range_start,
    dayRangeEnd: row.day_range_end,
    sortOrder: row.sort_order,
    notes: row.notes,
    foodType: row.food_types ? {
      id: row.food_types.id,
      name: row.food_types.name,
      unit: row.food_types.unit,
    } : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}
