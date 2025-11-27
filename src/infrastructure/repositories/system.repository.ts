import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ISystemRepository } from '../../domain/repositories';
import { System } from '../../domain/entities/systems';

@Injectable()
export class SystemRepository implements ISystemRepository {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<System[]> {
    const { data, error } = await this.supabase
      .from('systems')
      .select(`
        *,
        tanks:tanks(*)
      `);
    if (error) throw error;
    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<System | null> {
    const { data, error } = await this.supabase
      .from('systems')
      .select(`
        *,
        tanks:tanks(*)
      `)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapToEntity(data) : null;
  }

  async create(system: Omit<System, 'id' | 'createdAt' | 'updatedAt' | 'tanks'>): Promise<System> {
    const { data, error } = await this.supabase
      .from('systems')
      .insert(system)
      .select(`
        *,
        tanks:tanks(*)
      `)
      .single();
    if (error) throw error;
    return this.mapToEntity(data);
  }

  async update(id: string, system: Partial<System>): Promise<System> {
    const { data, error } = await this.supabase
      .from('systems')
      .update(system)
      .eq('id', id)
      .select(`
        *,
        tanks:tanks(*)
      `)
      .single();
    if (error) throw error;
    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('systems').delete().eq('id', id);
    if (error) throw error;
  }

  private mapToEntity(data: any): System {
    return {
      id: data.id,
      name: data.name,
      tanks: (data.tanks || []).map((tank: any) => ({
        id: tank.id,
        name: tank.name,
        systemId: tank.system_id,
        capacity: tank.capacity,
        animals: tank.animals,
        species: tank.species,
        status: tank.status,
        observations: tank.observations,
        createdAt: new Date(tank.created_at),
        updatedAt: new Date(tank.updated_at),
      })),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}