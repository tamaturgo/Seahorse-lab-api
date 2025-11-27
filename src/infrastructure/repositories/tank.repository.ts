import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ITankRepository } from '../../domain/repositories';
import { Tank } from '../../domain/entities/systems';

@Injectable()
export class TankRepository implements ITankRepository {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<Tank[]> {
    const { data, error } = await this.supabase.from('tanks').select('*');
    if (error) throw error;
    return data || [];
  }

  async findById(id: string): Promise<Tank | null> {
    const { data, error } = await this.supabase
      .from('tanks')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async findBySystemId(systemId: string): Promise<Tank[]> {
    const { data, error } = await this.supabase
      .from('tanks')
      .select('*')
      .eq('system_id', systemId);
    if (error) throw error;
    return data || [];
  }

  async create(tank: Omit<Tank, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tank> {
    const { data, error } = await this.supabase
      .from('tanks')
      .insert({
        name: tank.name,
        system_id: tank.systemId,
        capacity: tank.capacity,
        animals: tank.animals,
        species: tank.species,
        status: tank.status || 'active',
        observations: tank.observations,
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapToEntity(data);
  }

  async update(id: string, tank: Partial<Tank>): Promise<Tank> {
    const updateData: any = {};
    if (tank.name !== undefined) updateData.name = tank.name;
    if (tank.systemId !== undefined) updateData.system_id = tank.systemId;
    if (tank.capacity !== undefined) updateData.capacity = tank.capacity;
    if (tank.animals !== undefined) updateData.animals = tank.animals;
    if (tank.species !== undefined) updateData.species = tank.species;
    if (tank.status !== undefined) updateData.status = tank.status;
    if (tank.observations !== undefined) updateData.observations = tank.observations;

    const { data, error } = await this.supabase
      .from('tanks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('tanks').delete().eq('id', id);
    if (error) throw error;
  }

  private mapToEntity(data: any): Tank {
    return {
      id: data.id,
      name: data.name,
      systemId: data.system_id,
      capacity: data.capacity,
      animals: data.animals,
      species: data.species,
      status: data.status,
      observations: data.observations,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
