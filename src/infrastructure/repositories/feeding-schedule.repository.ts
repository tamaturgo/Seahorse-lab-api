import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { FeedingSchedule, DefaultFeedingSettings } from '../../domain/entities/feeding';

export interface IFeedingScheduleRepository {
  // Feeding Schedules (por tanque)
  findAll(): Promise<FeedingSchedule[]>;
  findByTankId(tankId: string): Promise<FeedingSchedule | null>;
  create(schedule: Partial<FeedingSchedule>): Promise<FeedingSchedule>;
  update(tankId: string, schedule: Partial<FeedingSchedule>): Promise<FeedingSchedule>;
  delete(tankId: string): Promise<void>;
  
  // Default Settings
  getDefaultSettings(): Promise<DefaultFeedingSettings | null>;
  updateDefaultSettings(settings: Partial<DefaultFeedingSettings>): Promise<DefaultFeedingSettings>;
}

@Injectable()
export class FeedingScheduleRepository implements IFeedingScheduleRepository {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<FeedingSchedule[]> {
    const { data, error } = await this.supabase
      .from('feeding_schedules')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Erro ao buscar programações de alimentação: ${error.message}`);

    return (data || []).map(this.mapToScheduleEntity);
  }

  async findByTankId(tankId: string): Promise<FeedingSchedule | null> {
    const { data, error } = await this.supabase
      .from('feeding_schedules')
      .select('*')
      .eq('tank_id', tankId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Erro ao buscar programação de alimentação: ${error.message}`);
    }

    return this.mapToScheduleEntity(data);
  }

  async create(schedule: Partial<FeedingSchedule>): Promise<FeedingSchedule> {
    const { data, error } = await this.supabase
      .from('feeding_schedules')
      .insert({
        tank_id: schedule.tankId,
        interval_hours: schedule.intervalHours,
        start_time: schedule.startTime,
        is_active: schedule.isActive ?? true,
        notes: schedule.notes,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar programação de alimentação: ${error.message}`);

    return this.mapToScheduleEntity(data);
  }

  async update(tankId: string, schedule: Partial<FeedingSchedule>): Promise<FeedingSchedule> {
    const updateData: Record<string, any> = {};
    
    if (schedule.intervalHours !== undefined) updateData.interval_hours = schedule.intervalHours;
    if (schedule.startTime !== undefined) updateData.start_time = schedule.startTime;
    if (schedule.isActive !== undefined) updateData.is_active = schedule.isActive;
    if (schedule.notes !== undefined) updateData.notes = schedule.notes;

    const { data, error } = await this.supabase
      .from('feeding_schedules')
      .update(updateData)
      .eq('tank_id', tankId)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar programação de alimentação: ${error.message}`);

    return this.mapToScheduleEntity(data);
  }

  async delete(tankId: string): Promise<void> {
    const { error } = await this.supabase
      .from('feeding_schedules')
      .delete()
      .eq('tank_id', tankId);

    if (error) throw new Error(`Erro ao deletar programação de alimentação: ${error.message}`);
  }

  async getDefaultSettings(): Promise<DefaultFeedingSettings | null> {
    const { data, error } = await this.supabase
      .from('default_feeding_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar configurações padrão: ${error.message}`);
    }

    return this.mapToDefaultSettingsEntity(data);
  }

  async updateDefaultSettings(settings: Partial<DefaultFeedingSettings>): Promise<DefaultFeedingSettings> {
    // Primeiro, verificar se existe uma configuração
    const existing = await this.getDefaultSettings();
    
    const updateData: Record<string, any> = {};
    if (settings.intervalHours !== undefined) updateData.interval_hours = settings.intervalHours;
    if (settings.startTime !== undefined) updateData.start_time = settings.startTime;

    let data: any;
    let error: any;

    if (existing) {
      // Atualizar existente
      const result = await this.supabase
        .from('default_feeding_settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Criar novo
      const result = await this.supabase
        .from('default_feeding_settings')
        .insert({
          interval_hours: settings.intervalHours ?? 4,
          start_time: settings.startTime ?? '08:00:00',
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) throw new Error(`Erro ao atualizar configurações padrão: ${error.message}`);

    return this.mapToDefaultSettingsEntity(data);
  }

  private mapToScheduleEntity(data: any): FeedingSchedule {
    return {
      id: data.id,
      tankId: data.tank_id,
      intervalHours: data.interval_hours,
      startTime: data.start_time,
      isActive: data.is_active,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToDefaultSettingsEntity(data: any): DefaultFeedingSettings {
    return {
      id: data.id,
      intervalHours: data.interval_hours,
      startTime: data.start_time,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
