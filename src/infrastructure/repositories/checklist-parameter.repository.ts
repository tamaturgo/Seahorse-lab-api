import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IChecklistParameterRepository } from '../../domain/repositories/checklist';
import { ChecklistParameter } from '../../domain/entities/checklist';

@Injectable()
export class ChecklistParameterRepository implements IChecklistParameterRepository {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<ChecklistParameter[]> {
    const { data, error } = await this.supabase
      .from('checklist_parameters')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async findAllActive(): Promise<ChecklistParameter[]> {
    const { data, error } = await this.supabase
      .from('checklist_parameters')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async findById(id: string): Promise<ChecklistParameter | null> {
    const { data, error } = await this.supabase
      .from('checklist_parameters')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async create(param: Omit<ChecklistParameter, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChecklistParameter> {
    const { data, error } = await this.supabase
      .from('checklist_parameters')
      .insert({
        name: param.name,
        unit: param.unit,
        order: param.order,
        is_active: param.isActive,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, param: Partial<ChecklistParameter>): Promise<ChecklistParameter> {
    const updateData: any = {};
    if (param.name !== undefined) updateData.name = param.name;
    if (param.unit !== undefined) updateData.unit = param.unit;
    if (param.order !== undefined) updateData.order = param.order;
    if (param.isActive !== undefined) updateData.is_active = param.isActive;

    const { data, error } = await this.supabase
      .from('checklist_parameters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('checklist_parameters')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async reorder(params: { id: string; order: number }[]): Promise<void> {
    const promises = params.map(({ id, order }) =>
      this.supabase
        .from('checklist_parameters')
        .update({ order })
        .eq('id', id)
    );
    
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    if (errors.length > 0) throw errors[0].error;
  }
}