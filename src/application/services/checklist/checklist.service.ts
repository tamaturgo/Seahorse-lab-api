import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IChecklistTaskRepository } from '../../../domain/repositories/checklist';
import { ChecklistTask } from '../../../domain/entities/checklist';

@Injectable()
export class ChecklistService {
  constructor(
    @Inject('IChecklistTaskRepository')
    private readonly taskRepository: IChecklistTaskRepository,
  ) {}

  // ========== TASKS ==========
  async getAllTasks(): Promise<ChecklistTask[]> {
    return this.taskRepository.findAll();
  }

  async getActiveTasks(): Promise<ChecklistTask[]> {
    return this.taskRepository.findAllActive();
  }

  async getTaskById(id: string): Promise<ChecklistTask> {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);
    return task;
  }

  async createTask(task: Omit<ChecklistTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChecklistTask> {
    // Se não foi passada a ordem, coloca no final
    if (task.order === undefined || task.order === null) {
      const tasks = await this.taskRepository.findAll();
      task.order = tasks.length;
    }
    return this.taskRepository.create(task);
  }

  async updateTask(id: string, task: Partial<ChecklistTask>): Promise<ChecklistTask> {
    await this.getTaskById(id); // Verifica se existe
    return this.taskRepository.update(id, task);
  }

  async deleteTask(id: string): Promise<void> {
    await this.getTaskById(id); // Verifica se existe
    return this.taskRepository.delete(id);
  }

  async reorderTasks(tasks: { id: string; order: number }[]): Promise<void> {
    return this.taskRepository.reorder(tasks);
  }
}