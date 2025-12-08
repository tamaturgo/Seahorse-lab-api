import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { TankDiet } from '../../domain/entities/feeding';

export interface ITankDietRepository {
  create(tankDiet: Partial<TankDiet>): Promise<TankDiet>;
  findById(id: string): Promise<TankDiet | null>;
  findByTankId(tankId: string): Promise<TankDiet[]>;
  findActiveByTankId(tankId: string): Promise<TankDiet | null>;
  deactivate(id: string): Promise<TankDiet>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class TankDietRepository implements ITankDietRepository {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async create(tankDiet: Partial<TankDiet>): Promise<TankDiet> {
    // Desativar outras dietas ativas do mesmo tanque
    if (tankDiet.isActive) {
      await this.supabase
        .from('tank_diets')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('tank_id', tankDiet.tankId)
        .eq('is_active', true);
    }

    const { data, error } = await this.supabase
      .from('tank_diets')
      .insert({
        tank_id: tankDiet.tankId,
        diet_id: tankDiet.dietId,
        is_active: tankDiet.isActive ?? true,
        birth_date: tankDiet.birthDate,
        started_at: tankDiet.startedAt ?? new Date().toISOString(),
        ended_at: tankDiet.endedAt ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar tank_diet: ${error.message}`);

    return this.mapTankDiet(data);
  }

  async findById(id: string): Promise<TankDiet | null> {
    const { data, error } = await this.supabase
      .from('tank_diets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar tank_diet: ${error.message}`);
    }

    return this.mapTankDiet(data);
  }

  async findByTankId(tankId: string): Promise<TankDiet[]> {
    const { data, error } = await this.supabase
      .from('tank_diets')
      .select('*')
      .eq('tank_id', tankId)
      .order('started_at', { ascending: false });

    if (error) throw new Error(`Erro ao buscar tank_diets: ${error.message}`);

    return (data || []).map(this.mapTankDiet);
  }

  async findActiveByTankId(tankId: string): Promise<TankDiet | null> {
    const { data, error } = await this.supabase
      .from('tank_diets')
      .select('*')
      .eq('tank_id', tankId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar tank_diet ativa: ${error.message}`);
    }

    return this.mapTankDiet(data);
  }

  async deactivate(id: string): Promise<TankDiet> {
    const { data, error } = await this.supabase
      .from('tank_diets')
      .update({ 
        is_active: false, 
        ended_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Erro ao desativar tank_diet: ${error.message}`);

    return this.mapTankDiet(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tank_diets')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao deletar tank_diet: ${error.message}`);
  }

  private mapTankDiet = (row: any): TankDiet => ({
    id: row.id,
    tankId: row.tank_id,
    dietId: row.diet_id,
    isActive: row.is_active,
    birthDate: new Date(row.birth_date),
    startedAt: new Date(row.started_at),
    endedAt: row.ended_at ? new Date(row.ended_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}
