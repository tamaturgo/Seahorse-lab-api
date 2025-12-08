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
    return (data || []).map(this.mapToEntity);
  }

  async findAllActive(day?: string): Promise<ChecklistTask[]> {
    let query = this.supabase
      .from('checklist_tasks')
      .select('*')
      .eq('is_active', true);

    if (day) {
      const column = this.dayToColumn(day);
      if (column) query = query.eq(column, true);
    }

    const { data, error } = await query.order('order', { ascending: true });
    if (error) throw error;
    return (data || []).map(this.mapToEntity);
  }

  async findById(id: string): Promise<ChecklistTask | null> {
    const { data, error } = await this.supabase
      .from('checklist_tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapToEntity(data) : null;
  }

  async create(task: Omit<ChecklistTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChecklistTask> {
    const { data, error } = await this.supabase
      .from('checklist_tasks')
      .insert({
        name: task.name,
        order: task.order,
        is_active: task.isActive,
        parent_id: task.parentId ?? null,
        monday: task.monday ?? true,
        tuesday: task.tuesday ?? true,
        wednesday: task.wednesday ?? true,
        thursday: task.thursday ?? true,
        friday: task.friday ?? true,
        saturday: task.saturday ?? true,
        sunday: task.sunday ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapToEntity(data);
  }

  async update(id: string, task: Partial<ChecklistTask>): Promise<ChecklistTask> {
    const updateData: any = {};
    if (task.name !== undefined) updateData.name = task.name;
    if (task.order !== undefined) updateData.order = task.order;
    if (task.isActive !== undefined) updateData.is_active = task.isActive;
    if (task.parentId !== undefined) updateData.parent_id = task.parentId;
    if (task.monday !== undefined) updateData.monday = task.monday;
    if (task.tuesday !== undefined) updateData.tuesday = task.tuesday;
    if (task.wednesday !== undefined) updateData.wednesday = task.wednesday;
    if (task.thursday !== undefined) updateData.thursday = task.thursday;
    if (task.friday !== undefined) updateData.friday = task.friday;
    if (task.saturday !== undefined) updateData.saturday = task.saturday;
    if (task.sunday !== undefined) updateData.sunday = task.sunday;

    const { data, error } = await this.supabase
      .from('checklist_tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.mapToEntity(data);
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

  // Helpers
  private mapToEntity = (row: any): ChecklistTask => ({
    id: row.id,
    name: row.name,
    order: row.order,
    isActive: row.is_active,
    parentId: row.parent_id ?? null,
    monday: row.monday,
    tuesday: row.tuesday,
    wednesday: row.wednesday,
    thursday: row.thursday,
    friday: row.friday,
    saturday: row.saturday,
    sunday: row.sunday,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private dayToColumn(day: string): string | null {
    const map: Record<string, string> = {
      seg: 'monday', segunda: 'monday', monday: 'monday',
      ter: 'tuesday', terca: 'tuesday', terça: 'tuesday', tuesday: 'tuesday',
      qua: 'wednesday', quarta: 'wednesday', wednesday: 'wednesday',
      qui: 'thursday', quinta: 'thursday', thursday: 'thursday',
      sex: 'friday', sexta: 'friday', friday: 'friday',
      sab: 'saturday', sábado: 'saturday', sabado: 'saturday', saturday: 'saturday',
      dom: 'sunday', domingo: 'sunday', sunday: 'sunday',
    };
    return map[day?.toLowerCase()] ?? null;
  }
}