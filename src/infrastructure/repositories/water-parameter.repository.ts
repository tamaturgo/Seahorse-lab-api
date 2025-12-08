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
        system_id: waterParameter.systemId,
        ph: waterParameter.pH,
        temperature: waterParameter.temperature,
        ammonia: waterParameter.ammonia,
        nitrite: waterParameter.nitrite,
        nitrate: waterParameter.nitrate,
        salinity: waterParameter.salinity,
        measured_at: (waterParameter.measuredAt || new Date()).toISOString(),
        user_id: waterParameter.userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar registro de parâmetros: ${error.message}`);

    return this.mapToEntity(data);
  }

  async findAll(filters?: { systemId?: string; tankId?: string; startDate?: Date; endDate?: Date }): Promise<WaterParameter[]> {
    let query = this.supabase.from('water_parameters').select(`
      *,
      tanks!inner(system_id)
    `);
    
    if (filters?.tankId) {
      query = query.eq('tank_id', filters.tankId);
    }

    if (filters?.systemId) {
      query = query.eq('tanks.system_id', filters.systemId);
    }

    if (filters?.startDate) {
      query = query.gte('measured_at', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('measured_at', filters.endDate.toISOString());
    }

    const { data, error} = await query.order('measured_at', { ascending: false });

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
    // Buscar parâmetros dos tanques do sistema com join
    const { data, error } = await this.supabase
      .from('water_parameters')
      .select(`
        *,
        tanks!inner(system_id)
      `)
      .eq('tanks.system_id', systemId)
      .order('measured_at', { ascending: false })
      .limit(10);

    if (error) throw new Error(`Erro ao buscar registros de parâmetros: ${error.message}`);

    return (data || []).map(this.mapToEntity);
  }

  async findByTankId(tankId: string): Promise<WaterParameter[]> {
    return this.findAll({ tankId });
  }

  private mapToEntity(data: any): WaterParameter {
    return {
      id: data.id,
      tankId: data.tank_id,
      systemId: data.tanks?.system_id || undefined,
      pH: parseFloat(data.ph),
      temperature: parseFloat(data.temperature),
      ammonia: parseFloat(data.ammonia),
      nitrite: parseFloat(data.nitrite),
      nitrate: parseFloat(data.nitrate),
      salinity: data.salinity ? parseFloat(data.salinity) : undefined,
      measuredAt: new Date(data.measured_at),
      userId: data.user_id,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
