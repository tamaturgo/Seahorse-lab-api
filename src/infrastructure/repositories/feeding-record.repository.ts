import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';
import { FeedingRecord } from '../../domain/entities/feeding';

export interface IFeedingRecordRepository {
  create(feedingRecord: Partial<FeedingRecord>): Promise<FeedingRecord>;
  findAll(filters?: { tankId?: string; startDate?: Date; endDate?: Date }): Promise<FeedingRecord[]>;
  findById(id: string): Promise<FeedingRecord | null>;
  findByTankId(tankId: string): Promise<FeedingRecord[]>;
}

@Injectable()
export class FeedingRecordRepository implements IFeedingRecordRepository {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async create(feedingRecord: Partial<FeedingRecord>): Promise<FeedingRecord> {
    const { data, error } = await this.supabase
      .from('feeding_records')
      .insert({
        tank_id: feedingRecord.tankId,
        food_type_id: feedingRecord.foodTypeId,
        food: feedingRecord.food,
        quantity: feedingRecord.quantity,
        unit: feedingRecord.unit || 'ml',
        date: feedingRecord.date || new Date().toISOString(),
        user_id: feedingRecord.userId,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar registro de alimentação: ${error.message}`);

    return this.mapToEntity(data);
  }

  async findAll(filters?: { tankId?: string; startDate?: Date; endDate?: Date }): Promise<FeedingRecord[]> {
    let query = this.supabase.from('feeding_records').select('*');

    if (filters?.tankId) {
      query = query.eq('tank_id', filters.tankId);
    }

    if (filters?.startDate && filters?.endDate) {
      // Buscar registros criados hoje (últimas 24h) usando created_at em vez de date
      // Isso funciona melhor com timezone
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      
      query = query.gte('created_at', startOfDay.toISOString());
      query = query.lte('created_at', endOfDay.toISOString());
    }

    const { data, error } = await query.order('date', { ascending: false });
   
    if (error) throw new Error(`Erro ao buscar registros de alimentação: ${error.message}`);

    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<FeedingRecord | null> {
    const { data, error } = await this.supabase
      .from('feeding_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar registro de alimentação: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByTankId(tankId: string): Promise<FeedingRecord[]> {
    return this.findAll({ tankId });
  }

  private mapToEntity(data: any): FeedingRecord {
    return {
      id: data.id,
      tankId: data.tank_id,
      foodTypeId: data.food_type_id ?? undefined,
      food: data.food,
      quantity: Number(data.quantity),
      unit: (data.unit ?? 'ml') as 'ml' | 'g' | 'und',
      date: new Date(data.date),
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
