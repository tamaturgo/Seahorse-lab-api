import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';
import { WaterParameter } from '../../domain/entities/water-parameters';

export interface IWaterParameterRepository {
  create(waterParameter: Partial<WaterParameter>): Promise<WaterParameter>;
  findAll(filters?: { systemId?: string; tankId?: string; startDate?: Date; endDate?: Date }): Promise<WaterParameter[]>;
  findById(id: string): Promise<WaterParameter | null>;
  findBySystemId(systemId: string): Promise<WaterParameter[]>;
  findByTankId(tankId: string): Promise<WaterParameter[]>;
}

@Injectable()
export class WaterParameterRepository implements IWaterParameterRepository {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async create(waterParameter: Partial<WaterParameter>): Promise<WaterParameter> {
    const { data, error } = await this.supabase
      .from('water_parameters')
      .insert({
        tank_id: waterParameter.tankId,
        ph: waterParameter.pH,
        temperature: waterParameter.temperature,
        ammonia: waterParameter.ammonia,
        nitrite: waterParameter.nitrite,
        nitrate: waterParameter.nitrate,
        date: waterParameter.measuredAt || new Date().toISOString(),
        user_id: waterParameter.userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar registro de parâmetros: ${error.message}`);

    return this.mapToEntity(data);
  }

  async findAll(filters?: { systemId?: string; tankId?: string; startDate?: Date; endDate?: Date }): Promise<WaterParameter[]> {
    let query = this.supabase.from('water_parameters').select('*');

    // System ID não existe na tabela, ignorar este filtro
    
    if (filters?.tankId) {
      query = query.eq('tank_id', filters.tankId);
    }

    if (filters?.startDate && filters?.endDate) {
      // Buscar registros criados hoje (últimas 24h) usando created_at em vez de date
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      query = query.gte('created_at', startOfDay.toISOString());
      query = query.lte('created_at', endOfDay.toISOString());
    }

    const { data, error} = await query.order('date', { ascending: false });

    if (error) throw new Error(`Erro ao buscar registros de parâmetros: ${error.message}`);

    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<WaterParameter | null> {
    const { data, error } = await this.supabase
      .from('water_parameters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar registro de parâmetros: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findBySystemId(systemId: string): Promise<WaterParameter[]> {
    return this.findAll({ systemId });
  }

  async findByTankId(tankId: string): Promise<WaterParameter[]> {
    return this.findAll({ tankId });
  }

  private mapToEntity(data: any): WaterParameter {
    return {
      id: data.id,
      tankId: data.tank_id,
      systemId: undefined, // Coluna não existe na tabela
      pH: parseFloat(data.ph),
      temperature: parseFloat(data.temperature),
      ammonia: parseFloat(data.ammonia),
      nitrite: parseFloat(data.nitrite),
      nitrate: parseFloat(data.nitrate),
      salinity: data.salinity ? parseFloat(data.salinity) : undefined,
      measuredAt: new Date(data.date || data.measured_at),
      userId: data.user_id,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
