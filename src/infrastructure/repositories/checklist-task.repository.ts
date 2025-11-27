import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IChecklistTaskRepository } from '../../domain/repositories/checklist';
import { ChecklistTask } from '../../domain/entities/checklist';

@Injectable()
export class ChecklistTaskRepository implements IChecklistTaskRepository {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<ChecklistTask[]> {
    const { data, error } = await this.supabase
      .from('checklist_tasks')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async findAllActive(): Promise<ChecklistTask[]> {
    const { data, error } = await this.supabase
      .from('checklist_tasks')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async findById(id: string): Promise<ChecklistTask | null> {
    const { data, error } = await this.supabase
      .from('checklist_tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  async create(task: Omit<ChecklistTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChecklistTask> {
    const { data, error } = await this.supabase
      .from('checklist_tasks')
      .insert({
        name: task.name,
        order: task.order,
        is_active: task.isActive,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, task: Partial<ChecklistTask>): Promise<ChecklistTask> {
    const updateData: any = {};
    if (task.name !== undefined) updateData.name = task.name;
    if (task.order !== undefined) updateData.order = task.order;
    if (task.isActive !== undefined) updateData.is_active = task.isActive;

    const { data, error } = await this.supabase
      .from('checklist_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('checklist_tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async reorder(tasks: { id: string; order: number }[]): Promise<void> {
    // Atualizar ordem de múltiplas tarefas
    const promises = tasks.map(({ id, order }) =>
      this.supabase
        .from('checklist_tasks')
        .update({ order })
        .eq('id', id)
    );
    
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error);
    if (errors.length > 0) throw errors[0].error;
  }
}