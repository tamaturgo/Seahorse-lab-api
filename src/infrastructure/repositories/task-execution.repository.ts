import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { TaskExecution } from '../../domain/entities/checklist/task-execution.entity';

@Injectable()
export class TaskExecutionRepository {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async create(taskExecution: Partial<TaskExecution>): Promise<TaskExecution> {
    const { data, error } = await this.supabase
      .from('daily_checklist_task_executions')
      .insert({
        task_id: taskExecution.taskId,
        user_id: taskExecution.userId,
        date: taskExecution.date || new Date().toISOString().split('T')[0],
        completed: taskExecution.completed ?? true,
        completed_at: taskExecution.completed ? new Date().toISOString() : null,
        notes: taskExecution.notes,
      })
      .select()
      .single();

    if (error) throw error;

    return new TaskExecution({
      id: data.id,
      taskId: data.task_id,
      userId: data.user_id,
      date: new Date(data.date),
      completed: data.completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  async findByDateAndUser(date: string, userId: string): Promise<TaskExecution[]> {
    const { data, error } = await this.supabase
      .from('daily_checklist_task_executions')
      .select('*')
      .eq('date', date)
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(row => new TaskExecution({
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      date: new Date(row.date),
      completed: row.completed,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async findByDate(date: string): Promise<TaskExecution[]> {
    const { data, error } = await this.supabase
      .from('daily_checklist_task_executions')
      .select('*')
      .eq('date', date);

    if (error) throw error;

    return (data || []).map(row => new TaskExecution({
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      date: new Date(row.date),
      completed: row.completed,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async update(id: string, taskExecution: Partial<TaskExecution>): Promise<TaskExecution> {
    const updateData: any = {};
    
    if (taskExecution.completed !== undefined) {
      updateData.completed = taskExecution.completed;
      updateData.completed_at = taskExecution.completed ? new Date().toISOString() : null;
    }
    
    if (taskExecution.notes !== undefined) {
      updateData.notes = taskExecution.notes;
    }

    const { data, error } = await this.supabase
      .from('daily_checklist_task_executions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new TaskExecution({
      id: data.id,
      taskId: data.task_id,
      userId: data.user_id,
      date: new Date(data.date),
      completed: data.completed,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  async toggle(taskId: string, userId: string, date: string, notes?: string, completed?: boolean): Promise<TaskExecution> {
    // Verificar se já existe
    const { data: existing } = await this.supabase
      .from('daily_checklist_task_executions')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (existing) {
      // Toggle or force value; attach notes if provided
      const nextCompleted = completed !== undefined ? completed : !existing.completed;
      return this.update(existing.id, { completed: nextCompleted, notes });
    } else {
      // Create new
      return this.create({ 
        taskId, 
        userId, 
        date: new Date(date), 
        completed: completed ?? true,
        notes,
      });
    }
  }
}
